import { NextResponse } from "next/server";
import { breakdownStory } from "@/lib/mock";
import { breakdownStoryAI, geminiEnabled } from "@/lib/gemini";

// POST /api/story  { story: string, locale?: string }  ->  { shots: Shot[] }
//
// Uses Gemini when GEMINI_API_KEY is set; otherwise (or on error) falls back to
// the mock breakdown so the app keeps working without a key.
export async function POST(req: Request) {
  const { story, locale } = await req.json();
  if (typeof story !== "string") {
    return NextResponse.json({ error: "story (string) is required" }, { status: 400 });
  }

  if (geminiEnabled()) {
    try {
      const shots = await breakdownStoryAI(story, locale);
      return NextResponse.json({ shots, source: "gemini" });
    } catch (err) {
      console.error("[story] Gemini failed, falling back to mock:", err);
    }
  }

  return NextResponse.json({ shots: breakdownStory(story, locale), source: "mock" });
}
