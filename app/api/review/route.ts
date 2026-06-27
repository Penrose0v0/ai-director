import { NextResponse } from "next/server";
import { reviewVideo } from "@/lib/mock";
import type { Shot } from "@/lib/types";

// POST /api/review  { shot: Shot }  ->  { review: ReviewResult }
//
// TODO(gemini): replace reviewVideo() with a Gemini video-understanding call:
//   1. sample frames (or send the video) for the shot's videoUrl
//   2. compare against shot.settings field-by-field
//   3. return per-item pass/partial/fail + a fix prompt
export async function POST(req: Request) {
  const { shot } = (await req.json()) as { shot: Shot };
  if (!shot) {
    return NextResponse.json({ error: "shot is required" }, { status: 400 });
  }
  const review = reviewVideo(shot);
  return NextResponse.json({ review });
}
