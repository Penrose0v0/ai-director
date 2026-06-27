import { NextResponse } from "next/server";
import { compilePrompt } from "@/lib/compiler";
import type { DirectorSettings } from "@/lib/types";

// POST /api/compile  { settings: DirectorSettings }  ->  { prompt: string }
//
// The structural assembly is deterministic (lib/compiler.ts).
// TODO(gemini): optionally pass `prompt` through Gemini for natural-language polish.
export async function POST(req: Request) {
  const { settings } = (await req.json()) as { settings: DirectorSettings };
  if (!settings) {
    return NextResponse.json({ error: "settings is required" }, { status: 400 });
  }
  const prompt = compilePrompt(settings);
  return NextResponse.json({ prompt });
}
