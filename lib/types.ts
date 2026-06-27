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
  /** Last compiled prompt, if any. */
  compiledPrompt?: string;
  /** Video source used for review (sample url or uploaded blob url). */
  videoUrl?: string;
  review?: ReviewResult;
}

export type ComplianceStatus = "pass" | "partial" | "fail";

export interface ReviewItem {
  /** What the director asked for. */
  expectation: string;
  /** What the model observed in the video. */
  observed: string;
  status: ComplianceStatus;
  /** Which director field this maps to, for grouping. */
  field?: keyof DirectorSettings | "timeline" | "general";
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
