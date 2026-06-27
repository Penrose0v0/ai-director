import { NextResponse } from "next/server";
import { placeholderStoryboard } from "@/lib/storyboard";
import { generateStoryboardAI, geminiEnabled } from "@/lib/gemini";

// POST /api/storyboard  { prompt: string, index?: number }  ->  { imageUrl, source }
//
// Uses Gemini's image model when a key is set; falls back to an SVG placeholder
// on error or without a key.
export async function POST(req: Request) {
  const { prompt, index } = (await req.json()) as { prompt?: string; index?: number };

  if (geminiEnabled()) {
    try {
      const imageUrl = await generateStoryboardAI(prompt ?? "");
      return NextResponse.json({ imageUrl, source: "gemini" });
    } catch (err) {
      console.error("[storyboard] image generation failed, using placeholder:", err);
    }
  }

  return NextResponse.json({
    imageUrl: placeholderStoryboard(prompt ?? "", index ?? 0),
    source: "placeholder",
  });
}
