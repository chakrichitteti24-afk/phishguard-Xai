/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendCopilotMessage(
  messages: ChatMessage[]
): Promise<{ reply: string; error?: string }> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const response = await fetch(`${API_URL}/api/v1/copilot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply || "I apologize, I could not generate a response.",
      error: data.error,
    };
  } catch (err: any) {
    console.error("Error in Copilot Chat:", err);
    return {
      reply: "PhishGuard Copilot is currently connecting to the security server. If this is a cold start, please retry in a moment!",
      error: err?.message,
    };
  }
}
