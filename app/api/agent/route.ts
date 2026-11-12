import { NextResponse } from "next/server";
import { agentRequestSchema } from "@/lib/schemas";
import { runAgent } from "@/lib/agent/runAgent";
import { runDemoAgent } from "@/lib/agent/demoAgent";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/agent
 * Processes employee messages via Gemini 3.8 Flash agent loop.
 * Automatically falls back to local demo agent if GEMINI_API_KEY is not yet populated in .env.local.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = agentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });
  }

  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());

  try {
    let result;
    if (hasGeminiKey) {
      result = await runAgent(parsed.data.messages);
    } else {
      result = await runDemoAgent(parsed.data.messages);
    }
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent failed";
    console.error("[agent]", message);
    const quota = /429|quota|RESOURCE_EXHAUSTED/i.test(message);
    return NextResponse.json(
      {
        error: quota
          ? "Gemini quota reached. Wait a minute and try again."
          : message,
      },
      { status: quota ? 429 : 500 }
    );
  }
}
