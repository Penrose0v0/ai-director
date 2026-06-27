import type { DirectorSettings } from "./types";

// Deterministic prompt compiler: turns structured director settings into a
// single video-generation prompt. This is real (not mocked) — later we can
// optionally pass the result through Gemini for polishing, but the structural
// assembly lives here so it stays predictable.

export function compilePrompt(s: DirectorSettings): string {
  const parts: string[] = [];

  const lens = [s.shotSize, s.cameraAngle].filter(Boolean).join(", ").toLowerCase();
  const subject = s.character?.trim() || "the subject";

  parts.push(
    `A cinematic ${lens || "shot"} of ${subject}` +
      (s.visualStyle ? `, set in ${s.visualStyle}` : "") +
      ".",
  );

  const beats = [...s.timeline].sort((a, b) => a.from - b.from);
  for (const b of beats) {
    if (!b.description.trim()) continue;
    parts.push(`From ${b.from} to ${b.to} seconds, ${b.description.trim()}.`);
  }

  if (s.cameraMovement && s.cameraMovement !== "Static") {
    parts.push(`The camera performs a ${s.cameraMovement.toLowerCase()} throughout the shot.`);
  } else {
    parts.push("The camera stays static throughout the shot.");
  }

  if (s.mood) parts.push(`Overall mood: ${s.mood.toLowerCase()}.`);

  if (s.constraints.length) {
    parts.push("Constraints: " + s.constraints.map((c) => c.trim()).filter(Boolean).join("; ") + ".");
  }

  parts.push(`Total duration: ${s.duration} seconds.`);

  return parts.join(" ");
}
