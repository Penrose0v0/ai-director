import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { generateVideoAI, geminiEnabled } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 300; // Veo can take a couple of minutes.

// POST /api/generate-video  { prompt, image?: {mimeType,data} }  ->  { video, source }
//
// When an `image` (storyboard frame) is provided, Veo animates from it
// (image-to-video); otherwise text-to-video. Uses Veo when a key is set; on
// error/no key falls back to the bundled sample so the demo keeps flowing.
export async function POST(req: Request) {
  const { prompt, image } = (await req.json()) as {
    prompt?: string;
    image?: { mimeType: string; data: string };
  };
  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  if (geminiEnabled()) {
    try {
      const video = await generateVideoAI(prompt, image?.data ? image : undefined);
      return NextResponse.json({ video, source: image?.data ? "veo-i2v" : "veo" });
    } catch (err) {
      console.error("[generate-video] Veo failed, falling back to sample:", err);
    }
  }

  try {
    const buf = await readFile(path.join(process.cwd(), "public", "sample_video.mp4"));
    return NextResponse.json({
      video: { mimeType: "video/mp4", data: buf.toString("base64") },
      source: "sample",
    });
  } catch {
    return NextResponse.json({ error: "no video available" }, { status: 500 });
  }
}
