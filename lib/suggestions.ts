import type { DirectorSettings, Suggestion } from "./types";

// Apply a structured review suggestion to director settings, returning a new
// settings object. Only content fields (character / visual style / timeline /
// constraints) are editable — deliberate creative choices are left untouched.
export function applySuggestion(s: DirectorSettings, sug: Suggestion): DirectorSettings {
  const next: DirectorSettings = {
    ...s,
    timeline: s.timeline.map((b) => ({ ...b })),
    constraints: [...s.constraints],
  };
  const v = (sug.value ?? "").trim();

  switch (sug.target) {
    case "character":
      next.character = v;
      break;
    case "visualStyle":
      next.visualStyle = v;
      break;
    case "timeline": {
      const i = sug.beatIndex ?? -1;
      if (i >= 0 && i < next.timeline.length) next.timeline[i] = { ...next.timeline[i], description: v };
      break;
    }
    case "constraint":
      if (v && !next.constraints.includes(v)) next.constraints.push(v);
      break;
  }
  return next;
}
