import type { DirectorSettings, ReviewResult, Shot } from "./types";
import { emptySettings } from "./types";

// ---------------------------------------------------------------------------
// MOCK AI LAYER
// ---------------------------------------------------------------------------
// Everything here stands in for Gemini calls until the API key is available.
// Each function's signature is what the real Gemini-backed version should keep,
// so swapping the implementation inside the /api routes is a drop-in change.
// ---------------------------------------------------------------------------

let _id = 0;
export const uid = (prefix = "id") => `${prefix}_${Date.now().toString(36)}_${_id++}`;

type Locale = "zh" | "ja" | "en";

const TITLES: Record<Locale, string[]> = {
  zh: [
    "Shot 1 — 女生站在便利店门口看手机",
    "Shot 2 — 她抬头看到远处黑影",
    "Shot 3 — 她跑进雨中",
  ],
  ja: [
    "Shot 1 — コンビニ前でスマホを見る少女",
    "Shot 2 — 顔を上げ、遠くの影に気づく",
    "Shot 3 — 雨の中へ走り出す",
  ],
  en: [
    "Shot 1 — Woman checking her phone outside a convenience store",
    "Shot 2 — She raises her head and notices a distant shadow",
    "Shot 3 — She runs into the rain",
  ],
};

const CHARACTER: Record<Locale, [string, string]> = {
  zh: ["年轻女性，黑色外套，手持手机", "年轻女性，黑色外套"],
  ja: ["黒いコートの若い女性、スマホを持つ", "黒いコートの若い女性"],
  en: ["young woman, black coat, holding a phone", "young woman, black coat"],
};

/** Mock of Gemini "story understanding": story text -> suggested shot cards. */
export function breakdownStory(story: string, locale: Locale = "zh"): Shot[] {
  const trimmed = story.trim();
  // A fixed, demo-friendly breakdown that loosely keys off the story text.
  const titles = trimmed ? TITLES[locale] : [TITLES[locale][0]];

  return titles.map((title, i) => {
    const settings: DirectorSettings = {
      ...emptySettings(),
      character: i === 0 ? CHARACTER[locale][0] : CHARACTER[locale][1],
      visualStyle: "rainy Tokyo night, neon reflections on wet pavement",
      mood: "Suspenseful",
      timeline:
        i === 0
          ? [
              { id: uid("beat"), from: 0, to: 2, description: "she looks down at her phone with hesitation" },
              { id: uid("beat"), from: 2, to: 4, description: "she slowly raises her head" },
              { id: uid("beat"), from: 4, to: 6, description: "she notices a dark shadow in the background" },
            ]
          : [],
      constraints:
        i === 0 ? ["same black coat", "same phone", "no extra people", "keep it night"] : [],
    };
    return { id: uid("shot"), title, settings };
  });
}

/** Mock of Gemini "video understanding + compliance check". */
export function reviewVideo(shot: Shot): ReviewResult {
  const s = shot.settings;
  const items: ReviewResult["items"] = [];

  // Timeline beats — pretend the model missed the first two actions.
  s.timeline.forEach((b, i) => {
    items.push({
      field: "timeline",
      expectation: `${b.from}–${b.to}s: ${b.description}`,
      observed:
        i === 0
          ? "character looks straight at the camera, no phone-checking"
          : i === 1
            ? "no clear head-raise motion"
            : "shadow is visible but appears too early",
      status: i < 2 ? "fail" : "partial",
      suggestion:
        i < 2
          ? {
              target: "timeline",
              beatIndex: i,
              value: `clearly and unmistakably, ${b.description}`,
              reason: "Make the action explicit so the model cannot skip it.",
            }
          : undefined,
    });
  });

  if (s.cameraMovement !== "Static") {
    items.push({
      field: "cameraMovement",
      expectation: s.cameraMovement,
      observed: "camera is mostly static",
      status: "fail",
      suggestion: {
        target: "constraint",
        value: `the camera must clearly perform a ${s.cameraMovement.toLowerCase()}`,
        reason: "Add it as a hard constraint so the movement is enforced.",
      },
    });
  }

  if (s.visualStyle) {
    items.push({
      field: "visualStyle",
      expectation: s.visualStyle,
      observed: "night exists, but pavement is not visibly wet",
      status: "partial",
      suggestion: {
        target: "visualStyle",
        value: `${s.visualStyle}, wet reflective pavement with visible rain`,
        reason: "Spell out the wet, rainy ground so it actually shows up.",
      },
    });
  }

  for (const c of s.constraints) {
    const lc = c.toLowerCase();
    if (lc.includes("extra people")) {
      items.push({
        field: "constraints",
        expectation: c,
        observed: "extra pedestrians appear in background",
        status: "fail",
        suggestion: {
          target: "constraint",
          value: "absolutely no other people anywhere in the frame, including the background",
          reason: "Strengthen the wording so background extras are excluded.",
        },
      });
    } else if (lc.includes("coat")) {
      items.push({ field: "constraints", expectation: c, observed: "coat stays black", status: "pass" });
    } else {
      items.push({ field: "constraints", expectation: c, observed: "respected", status: "pass" });
    }
  }

  const weight = { pass: 1, partial: 0.5, fail: 0 } as const;
  const score = items.length
    ? Math.round((items.reduce((a, it) => a + weight[it.status], 0) / items.length) * 100)
    : 0;

  const failed = items.filter((i) => i.status !== "pass");
  const fixPrompt = buildFixPrompt(shot, failed);

  return {
    items,
    score,
    summary: `${items.filter((i) => i.status === "pass").length}/${items.length} director settings satisfied.`,
    fixPrompt,
  };
}

function buildFixPrompt(shot: Shot, failed: ReviewResult["items"]): string {
  if (!failed.length) return "All director settings were satisfied — no fix needed.";
  const fixes = failed
    .map((f) => `- ${f.expectation} (issue: ${f.observed})`)
    .join("\n");
  return (
    `Regenerate "${shot.title}". The previous take missed the following director settings:\n` +
    `${fixes}\n\n` +
    `Re-emphasize each of these explicitly. Keep everything that already matched unchanged.`
  );
}
