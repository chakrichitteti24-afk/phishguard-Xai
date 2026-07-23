import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js API Route: /api/copilot
 * Acts as a secure server-side proxy to the Python FastAPI backend.
 * This avoids CORS issues and keeps the backend URL server-side only.
 * GROQ_API_KEY is NEVER used here — it lives exclusively on the backend (Render).
 */
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

    // Backend URL — set BACKEND_URL in Vercel env vars, or defaults to Render URL
    const BACKEND_URL =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://phishguard-xai.onrender.com";

    const response = await fetch(`${BACKEND_URL}/api/v1/copilot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(30000), // 30s timeout for cold starts
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`Backend responded ${response.status}: ${errorText}`);
      return NextResponse.json(
        {
          reply: `⚠️ PhishGuard Copilot backend returned an error (${response.status}). Please try again in a moment.`,
          error: `Backend HTTP ${response.status}`,
        },
        { status: 200 } // Return 200 so frontend doesn't throw
      );
    }

    const data = await response.json();
    return NextResponse.json({
      reply: data.reply || "I apologize, I could not generate a response.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Copilot proxy error:", message);

    // Check if it's a cold start timeout
    const isColdStart =
      message.includes("fetch") ||
      message.includes("ECONNREFUSED") ||
      message.includes("timeout") ||
      message.includes("aborted");

    return NextResponse.json({
      reply: isColdStart
        ? "🔄 **PhishGuard backend is waking up** (cold start). Please wait 30 seconds and try again — this only happens once after inactivity!"
        : `⚠️ Copilot service error: ${message}. Please retry in a moment.`,
      error: message,
    });
  }
}
