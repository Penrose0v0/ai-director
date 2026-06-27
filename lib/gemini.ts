import { GoogleGenAI } from "@google/genai";
import type { ComplianceStatus, DirectorSettings, ReviewResult, Shot, Suggestion } from "./types";
import { emptySettings } from "./types";
import type { Keyframe } from "./frames";
import { uid } from "./mock";
import { CAMERA_ANGLES, CAMERA_MOVEMENTS, MOODS, SHOT_SIZES } from "./options";

// ---------------------------------------------------------------------------
// GEMINI (text) integration.
// All Gemini calls live here. Routes call geminiEnabled() to decide whether to
// use these or fall back to the mock layer, so the app runs with or without a key.
// ---------------------------------------------------------------------------

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "imagen-4.0-generate-001";
const VIDEO_MODEL = process.env.GEMINI_VIDEO_MODEL || "veo-3.0-generate-001";

export function geminiEnabled(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

let _client: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!_client) _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return _client;
}

const LANG: Record<string, string> = { zh: "Chinese", ja: "Japanese", en: "English" };

// ---- Story understanding: story text -> structured shot cards --------------

const SHOT_SCHEMA = {
  type: "object",
  properties: {
    shots: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short shot title in the requested UI language" },
          character: { type: "string", description: "Main character description" },
          visualStyle: { type: "string", description: "Scene / visual style, in English" },
          mood: { type: "string", enum: MOODS as unknown as string[] },
          shotSize: { type: "string", enum: SHOT_SIZES as unknown as string[] },
          cameraMovement: { type: "string", enum: CAMERA_MOVEMENTS as unknown as string[] },
          cameraAngle: { type: "string", enum: CAMERA_ANGLES as unknown as string[] },
          duration: { type: "number", description: "Shot length in seconds, 3-10" },
          timeline: {
            type: "array",
            description: "Per-second action beats, in English",
            items: {
              type: "object",
              properties: {
                from: { type: "number" },
                to: { type: "number" },
                description: { type: "string" },
              },
              required: ["from", "to", "description"],
            },
          },
          constraints: {
            type: "array",
            description: "Do-nots / continuity rules, in English",
            items: { type: "string" },
          },
        },
        required: ["title", "character", "visualStyle", "mood", "shotSize", "cameraMovement", "cameraAngle", "duration", "timeline", "constraints"],
      },
    },
  },
  required: ["shots"],
};

interface AIShot {
  title: string;
  character: string;
  visualStyle: string;
  mood: string;
  shotSize: string;
  cameraMovement: string;
  cameraAngle: string;
  duration: number;
  timeline: { from: number; to: number; description: string }[];
  constraints: string[];
}

export async function breakdownStoryAI(story: string, locale = "zh"): Promise<Shot[]> {
  const lang = LANG[locale] ?? "English";
  const res = await client().models.generateContent({
    model: MODEL,
    contents: `Story:\n${story}`,
    config: {
      systemInstruction:
        `You are an assistant film director. Break the story into 1-4 sequential cinematic shots. ` +
        `Each shot must have a clear shot size, camera movement, camera angle, mood, a per-second action timeline, ` +
        `and continuity constraints. Write each shot "title" in ${lang}. ` +
        `Write visualStyle, timeline descriptions and constraints in English (they feed an English video prompt). ` +
        `Pick shotSize / cameraMovement / cameraAngle / mood ONLY from the allowed enum values.`,
      temperature: 0.7,
      responseMimeType: "application/json",
      responseJsonSchema: SHOT_SCHEMA,
    },
  });

  const text = res.text;
  if (!text) throw new Error("Gemini returned empty response");
  const parsed = JSON.parse(text) as { shots: AIShot[] };

  return parsed.shots.map((s) => {
    const base = emptySettings();
    const settings: DirectorSettings = {
      ...base,
      duration: s.duration || base.duration,
      shotSize: s.shotSize || base.shotSize,
      cameraMovement: s.cameraMovement || base.cameraMovement,
      cameraAngle: s.cameraAngle || base.cameraAngle,
      mood: s.mood || base.mood,
      character: s.character || "",
      visualStyle: s.visualStyle || "",
      timeline: (s.timeline ?? []).map((b) => ({ id: uid("beat"), from: b.from, to: b.to, description: b.description })),
      constraints: s.constraints ?? [],
    };
    return { id: uid("shot"), title: s.title, settings };
  });
}

// ---- Prompt Compiler: structured settings -> one cinematic prompt ----------

export async function compilePromptAI(settings: DirectorSettings): Promise<string> {
  const res = await client().models.generateContent({
    model: MODEL,
    contents: JSON.stringify(settings, null, 2),
    config: {
      systemInstruction:
        `You are a Prompt Compiler for an AI video model. Turn the structured director settings (JSON) into ONE ` +
        `vivid, cinematic English video-generation prompt. Weave in the shot size, camera angle, camera movement, ` +
        `the per-second action timeline (explicit "from X to Y seconds" phrasing), mood, visual style and total duration. ` +
        `State the constraints as explicit do-not instructions at the end. Output prose only — no headings, no JSON, no markdown.`,
      temperature: 0.6,
    },
  });
  const text = res.text?.trim();
  if (!text) throw new Error("Gemini returned empty prompt");
  return text;
}

// ---- Director Review: keyframes + settings -> compliance check -------------

const SUGGESTION_SCHEMA = {
  type: "object",
  description:
    "A concrete edit to ONE editable content field that would close the gap. Omit for pass items. " +
    "Only character / visualStyle / timeline / constraint may be edited.",
  properties: {
    target: {
      type: "string",
      enum: ["character", "visualStyle", "timeline", "constraint"],
    },
    beatIndex: { type: "number", description: "0-based timeline beat index; only when target is timeline" },
    value: {
      type: "string",
      description: "Full new value to set. For 'constraint' it is the constraint text to ADD; for 'timeline' the new beat description.",
    },
    reason: { type: "string" },
  },
  required: ["target", "value", "reason"],
};

const REVIEW_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          expectation: { type: "string", description: "The director setting being checked" },
          observed: { type: "string", description: "What is actually seen in the frames" },
          status: { type: "string", enum: ["pass", "partial", "fail"] },
          suggestion: SUGGESTION_SCHEMA,
        },
        required: ["expectation", "observed", "status"],
      },
    },
    fixPrompt: {
      type: "string",
      description: "A regeneration prompt re-emphasizing only the failed/partial settings",
    },
  },
  required: ["items", "fixPrompt"],
};

function settingsChecklist(shot: Shot): string {
  const s = shot.settings;
  const lines = [
    `- Shot size: ${s.shotSize}`,
    `- Camera angle: ${s.cameraAngle}`,
    `- Camera movement: ${s.cameraMovement}`,
    `- Mood: ${s.mood}`,
  ];
  if (s.character) lines.push(`- Character: ${s.character}`);
  if (s.visualStyle) lines.push(`- Visual style: ${s.visualStyle}`);
  s.timeline.forEach((b, i) => lines.push(`- Action[${i}] ${b.from}-${b.to}s: ${b.description}`));
  for (const c of s.constraints) lines.push(`- Constraint: ${c}`);
  return lines.join("\n");
}

function splitDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const m = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!m) throw new Error("bad data URL");
  return { mimeType: m[1], data: m[2] };
}

const REVIEW_SYSTEM =
  `You are a strict film director checking whether a generated video matches the director's intent. ` +
  `For each setting decide pass / partial / fail and briefly state what you actually observed. ` +
  `Be honest and specific — do not assume a setting is met without visual evidence. ` +
  `For every partial or fail item, attach a "suggestion": ONE concrete structured edit that would best close the gap. ` +
  `Only these content fields may be edited: character (wrong costume/props/identity), visualStyle (wrong scene/weather/light), ` +
  `timeline (an action not shown — set target="timeline" with its beatIndex and a clearer description), and constraint (add/strengthen a rule). ` +
  `Shot size, camera angle, camera movement, duration and mood are the director's deliberate choices and MUST NOT be changed — ` +
  `if one of those is missed by the video, enforce it by ADDING a constraint (e.g. "the camera must clearly perform a slow dolly-in") instead. ` +
  `Pass items must NOT include a suggestion. ` +
  `Finally write a concise fixPrompt that re-emphasizes ONLY the failed or partial settings for the next regeneration.`;

type MediaPart = { text?: string; inlineData?: { mimeType: string; data: string } };

async function runReview(shot: Shot, intro: string, mediaParts: MediaPart[]): Promise<ReviewResult> {
  const contents: MediaPart[] = [
    { text: `Director settings to verify:\n${settingsChecklist(shot)}\n\n${intro}` },
    ...mediaParts,
  ];

  const res = await client().models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: REVIEW_SYSTEM,
      temperature: 0.3,
      responseMimeType: "application/json",
      responseJsonSchema: REVIEW_SCHEMA,
    },
  });

  const text = res.text;
  if (!text) throw new Error("Gemini returned empty review");
  const parsed = JSON.parse(text) as {
    items: { expectation: string; observed: string; status: ComplianceStatus; suggestion?: Suggestion }[];
    fixPrompt: string;
  };

  const items = parsed.items.map((i) => ({
    expectation: i.expectation,
    observed: i.observed,
    status: i.status,
    field: "general" as const,
    suggestion: i.status === "pass" ? undefined : i.suggestion,
  }));
  const weight = { pass: 1, partial: 0.5, fail: 0 } as const;
  const score = items.length
    ? Math.round((items.reduce((a, i) => a + weight[i.status], 0) / items.length) * 100)
    : 0;
  const summary = `${items.filter((i) => i.status === "pass").length}/${items.length} director settings satisfied.`;

  return { items, score, summary, fixPrompt: parsed.fixPrompt };
}

/** Native video understanding — Gemini watches the actual clip (preferred). */
export async function reviewVideoNativeAI(
  shot: Shot,
  video: { mimeType: string; data: string },
): Promise<ReviewResult> {
  return runReview(
    shot,
    `Below is the generated video. Watch it and judge whether it satisfies EACH director setting (one review item per ` +
      `setting listed above). Pay close attention to actual motion and timing when judging the camera movement and the action timeline.`,
    [{ inlineData: video }],
  );
}

/** Keyframe fallback — used when the clip is too large to inline or fetch fails. */
export async function reviewVideoAI(shot: Shot, frames: Keyframe[]): Promise<ReviewResult> {
  const mediaParts: MediaPart[] = [];
  for (const f of frames) {
    mediaParts.push({ text: `Frame at ${f.time}s:` });
    mediaParts.push({ inlineData: splitDataUrl(f.dataUrl) });
  }
  return runReview(
    shot,
    `Below are ${frames.length} keyframes sampled in order from the generated video, each labeled with its timestamp. ` +
      `Judge whether the video satisfies EACH director setting (one review item per setting listed above). ` +
      `Camera movement must be inferred from how the framing changes between consecutive frames.`,
    mediaParts,
  );
}

// ---- Image generation: storyboard frame (Imagen) ---------------------------

export async function generateStoryboardAI(prompt: string): Promise<string> {
  const r = await client().models.generateImages({
    model: IMAGE_MODEL,
    prompt: `Cinematic film storyboard frame, 16:9, moody lighting. ${prompt}`,
    config: { numberOfImages: 1, aspectRatio: "16:9" },
  });
  const img = r.generatedImages?.[0]?.image;
  if (!img?.imageBytes) throw new Error("image model returned no image");
  return `data:${img.mimeType || "image/png"};base64,${img.imageBytes}`;
}

// ---- Video generation: Veo (long-running, polled) --------------------------

export async function generateVideoAI(
  prompt: string,
  image?: { mimeType: string; data: string },
): Promise<{ mimeType: string; data: string }> {
  // When a storyboard frame is supplied, animate from it (image-to-video);
  // otherwise fall back to pure text-to-video.
  let op = await client().models.generateVideos({
    model: VIDEO_MODEL,
    prompt,
    ...(image ? { image: { imageBytes: image.data, mimeType: image.mimeType } } : {}),
    config: { numberOfVideos: 1, aspectRatio: "16:9" },
  });

  // Poll until done or we hit the cap (keep under the Cloud Run request timeout).
  const maxSeconds = 270;
  let waited = 0;
  while (!op.done && waited < maxSeconds) {
    await sleep(8000);
    waited += 8;
    op = await client().operations.getVideosOperation({ operation: op });
  }
  if (!op.done) throw new Error("video generation timed out");

  const v = op.response?.generatedVideos?.[0]?.video;
  if (!v) throw new Error("Veo returned no video");

  if (v.videoBytes) return { mimeType: v.mimeType || "video/mp4", data: v.videoBytes };

  // Some responses return a file URI instead of inline bytes — download it.
  if (v.uri) {
    const res = await fetch(v.uri, { headers: { "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" } });
    if (!res.ok) throw new Error(`video download failed: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return { mimeType: v.mimeType || "video/mp4", data: buf.toString("base64") };
  }
  throw new Error("Veo video had neither bytes nor uri");
}
