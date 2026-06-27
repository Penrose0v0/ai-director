import { NextResponse } from "next/server";
import { reviewVideo } from "@/lib/mock";
import { reviewVideoAI, reviewVideoNativeAI, geminiEnabled } from "@/lib/gemini";
import type { Shot } from "@/lib/types";
import type { InlineVideo, Keyframe } from "@/lib/frames";

// POST /api/review  { shot, video?: InlineVideo, frames?: Keyframe[] }  ->  { review, source }
//
// Preference order:
//   1. Gemini native video understanding (video present)   -> source "gemini-video"
//   2. Gemini keyframe understanding (frames present)       -> source "gemini-frames"
//   3. Mock                                                 -> source "mock"
export async function POST(req: Request) {
  const { shot, video, frames } = (await req.json()) as {
    shot: Shot;
    video?: InlineVideo;
    frames?: Keyframe[];
  };
  if (!shot) {
    return NextResponse.json({ error: "shot is required" }, { status: 400 });
  }

  if (geminiEnabled()) {
    try {
      if (video?.data) {
        const review = await reviewVideoNativeAI(shot, video);
        return NextResponse.json({ review, source: "gemini-video" });
      }
      if (Array.isArray(frames) && frames.length > 0) {
        const review = await reviewVideoAI(shot, frames);
        return NextResponse.json({ review, source: "gemini-frames" });
      }
    } catch (err) {
      console.error("[review] Gemini failed, falling back to mock:", err);
    }
  }

  return NextResponse.json({ review: reviewVideo(shot), source: "mock" });
}
