import { NextResponse } from "next/server";
import { compilePrompt } from "@/lib/compiler";
import { compilePromptAI, geminiEnabled } from "@/lib/gemini";
import type { DirectorSettings } from "@/lib/types";

// POST /api/compile  { settings: DirectorSettings }  ->  { prompt: string }
//
// Uses Gemini to polish the prompt when a key is set; otherwise (or on error)
// falls back to the deterministic compiler in lib/compiler.ts.
export async function POST(req: Request) {
  const { settings } = (await req.json()) as { settings: DirectorSettings };
  if (!settings) {
    return NextResponse.json({ error: "settings is required" }, { status: 400 });
  }

  if (geminiEnabled()) {
    try {
      const prompt = await compilePromptAI(settings);
      return NextResponse.json({ prompt, source: "gemini" });
    } catch (err) {
      console.error("[compile] Gemini failed, falling back to deterministic:", err);
    }
  }

  return NextResponse.json({ prompt: compilePrompt(settings), source: "deterministic" });
}
