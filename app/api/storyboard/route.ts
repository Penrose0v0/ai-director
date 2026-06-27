import { NextResponse } from "next/server";
import { placeholderStoryboard } from "@/lib/storyboard";

// POST /api/storyboard  { prompt: string, index?: number }  ->  { imageUrl: string }
//
// TODO(gemini): replace placeholderStoryboard() with a Gemini image-generation
// call (e.g. gemini-2.0-flash image output / Imagen). Build the image prompt from
// the shot's visual style + character + the key action beat, return the data URI
// or an uploaded Cloud Storage URL.
export async function POST(req: Request) {
  const { prompt, index } = (await req.json()) as { prompt?: string; index?: number };
  const imageUrl = placeholderStoryboard(prompt ?? "", index ?? 0);
  return NextResponse.json({ imageUrl });
}
