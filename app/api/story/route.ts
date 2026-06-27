import { NextResponse } from "next/server";
import { breakdownStory } from "@/lib/mock";

// POST /api/story  { story: string }  ->  { shots: Shot[] }
//
// TODO(gemini): replace breakdownStory() with a Gemini call that extracts
// characters / scene / mood / action beats from the story and returns shot cards.
export async function POST(req: Request) {
  const { story, locale } = await req.json();
  if (typeof story !== "string") {
    return NextResponse.json({ error: "story (string) is required" }, { status: 400 });
  }
  const shots = breakdownStory(story, locale);
  return NextResponse.json({ shots });
}
