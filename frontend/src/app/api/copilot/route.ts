import { NextRequest, NextResponse } from "next/server";
import { runCopilotChat } from "@/lib/engine/groqEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { reply: "Invalid request: messages array is required.", error: "bad_request" },
        { status: 400 }
      );
    }

    const reply = await runCopilotChat(messages);
    
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Copilot Local Engine error:", message);
    return NextResponse.json({
      reply: `⚠️ Copilot service error: ${message}. Please retry in a moment.`,
      error: message,
    });
  }
}
