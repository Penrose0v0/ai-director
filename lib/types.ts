// Core domain types for AI Director.
// These mirror the "Director Board" fields described in PROJECT.md.

export interface ActionBeat {
  id: string;
  /** seconds, inclusive start */
  from: number;
  /** seconds, exclusive end */
  to: number;
  description: string;
}

export interface DirectorSettings {
  duration: number; // seconds
  shotSize: string;
  cameraMovement: string;
  cameraAngle: string;
  character: string;
  mood: string;
  visualStyle: string;
  timeline: ActionBeat[];
  constraints: string[];
}

export interface Shot {
  id: string;
  title: string;
  settings: DirectorSettings;
  /** Storyboard frame generated from the shot (Gemini image model; mocked for now). */
  storyboardUrl?: string;
  /** Last compiled prompt, if any. */
  compiledPrompt?: string;
  /** Video source used for review (sample url or uploaded blob url). */
  videoUrl?: string;
  review?: ReviewResult;
}

export type ComplianceStatus = "pass" | "partial" | "fail";

// Which director-board field a suggestion may edit.
// Deliberate creative choices — shot size, camera angle, camera movement,
// duration, mood — are intentionally NOT editable by review suggestions; if the
// video misses one, it is enforced via a constraint instead, not by overwriting
// the director's intent.
export type SuggestionTarget = "character" | "visualStyle" | "timeline" | "constraint";

/** A concrete, one-click-applyable edit to the shot's director settings. */
export interface Suggestion {
  target: SuggestionTarget;
  /** 0-based timeline beat index, only when target === "timeline". */
  beatIndex?: number;
  /** Full new value to set (for "constraint": text to add; for "duration": a number as string). */
  value: string;
  reason: string;
}

export interface ReviewItem {
  /** What the director asked for. */
  expectation: string;
  /** What the model observed in the video. */
  observed: string;
  status: ComplianceStatus;
  /** Which director field this maps to, for grouping. */
  field?: keyof DirectorSettings | "timeline" | "general";
  /** Structured fix the user can apply directly into the Director Board. */
  suggestion?: Suggestion;
  /** Runtime flag: set once the suggestion has been applied to the shot. */
  applied?: boolean;
}

export interface ReviewResult {
  items: ReviewItem[];
  /** Overall 0-100 compliance score. */
  score: number;
  /** Auto-generated fix prompt for the next iteration. */
  fixPrompt: string;
  summary: string;
}

export function emptySettings(): DirectorSettings {
  return {
    duration: 6,
    shotSize: "Medium Close-up",
    cameraMovement: "Slow Dolly In",
    cameraAngle: "Eye Level",
    character: "",
    mood: "Suspenseful",
    visualStyle: "",
    timeline: [],
    constraints: [],
  };
}
