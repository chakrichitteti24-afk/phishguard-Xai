/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Sends a message to the PhishGuard Copilot via the Next.js API proxy.
 * The proxy (/api/copilot) forwards requests to the Python FastAPI backend.
 * No GROQ_API_KEY is needed or used on the frontend — it lives only on the backend.
 */
export async function sendCopilotMessage(
  messages: ChatMessage[]
): Promise<{ reply: string; error?: string }> {
  try {
    // Always calls the local Next.js API route — works in dev AND production
    const response = await fetch("/api/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Proxy returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply || "I apologize, I could not generate a response.",
      error: data.error,
    };
  } catch (err: any) {
    console.error("Copilot Chat error:", err);
    return {
      reply:
        "⚠️ Could not reach PhishGuard Copilot. If this is right after deployment, the backend may be waking up — please retry in 30 seconds!",
      error: err?.message,
    };
  }
}
