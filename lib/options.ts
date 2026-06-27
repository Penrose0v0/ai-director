// Controlled vocabularies for the Director Board dropdowns.
// Kept here so both the UI and (later) the Gemini prompt compiler share one source of truth.

export const SHOT_SIZES = [
  "Extreme Wide Shot",
  "Wide Shot",
  "Full Shot",
  "Medium Shot",
  "Medium Close-up",
  "Close-up",
  "Extreme Close-up",
] as const;

export const CAMERA_MOVEMENTS = [
  "Static",
  "Slow Dolly In",
  "Dolly Out",
  "Pan Left",
  "Pan Right",
  "Tilt Up",
  "Tilt Down",
  "Tracking / Follow",
  "Handheld",
  "Crane Up",
  "Orbit",
] as const;

export const CAMERA_ANGLES = [
  "Eye Level",
  "Low Angle",
  "High Angle",
  "Over-the-shoulder",
  "Bird's Eye",
  "Dutch Angle",
] as const;

export const MOODS = [
  "Suspenseful",
  "Calm",
  "Tense",
  "Melancholic",
  "Joyful",
  "Eerie",
  "Romantic",
  "Epic",
] as const;
