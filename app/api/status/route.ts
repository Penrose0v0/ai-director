import { NextResponse } from "next/server";
import { geminiEnabled } from "@/lib/gemini";

// GET /api/status -> { gemini: boolean, model: string | null }
// Lets the client header reflect whether a Gemini key is actually configured.
export async function GET() {
  return NextResponse.json({
    gemini: geminiEnabled(),
    model: geminiEnabled() ? process.env.GEMINI_MODEL || "gemini-2.5-flash" : null,
  });
}
