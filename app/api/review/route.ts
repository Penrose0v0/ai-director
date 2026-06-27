import { NextResponse } from "next/server";
import { reviewVideo } from "@/lib/mock";
import { reviewVideoAI, geminiEnabled } from "@/lib/gemini";
import type { Shot } from "@/lib/types";
import type { Keyframe } from "@/lib/frames";

// POST /api/review  { shot: Shot, frames?: Keyframe[] }  ->  { review: ReviewResult }
//
// Uses Gemini multimodal (keyframes + director settings) when a key is set and
// frames are provided; otherwise (or on error) falls back to the mock review.
export async function POST(req: Request) {
  const { shot, frames } = (await req.json()) as { shot: Shot; frames?: Keyframe[] };
  if (!shot) {
    return NextResponse.json({ error: "shot is required" }, { status: 400 });
  }

  if (geminiEnabled() && Array.isArray(frames) && frames.length > 0) {
    try {
      const review = await reviewVideoAI(shot, frames);
      return NextResponse.json({ review, source: "gemini" });
    } catch (err) {
      console.error("[review] Gemini failed, falling back to mock:", err);
    }
  }

  return NextResponse.json({ review: reviewVideo(shot), source: "mock" });
}
