/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import Groq from "groq-sdk";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendCopilotMessage(
  messages: ChatMessage[]
): Promise<{ reply: string; error?: string }> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "gsk_your_groq_api_key_here" || !apiKey.startsWith("gsk_")) {
    return {
      reply: "GROQ_API_KEY is not configured in .env.local. Please provide a valid Groq API key.",
      error: "GROQ_API_KEY missing",
    };
  }

  try {
    const groq = new Groq({ apiKey });

    const systemPrompt = `
      You are PhishGuard Copilot, an elite AI Cybersecurity Assistant and SOC Threat Analyst powered by Groq LLaMA-3.3 XAI.
      Your mission is to help non-technical and technical users understand phishing attacks, social engineering, security risks, safe browsing habits, and explain scan findings.
      Keep your answers concise, structured (using bullet points and bold headers), clear, and extremely professional.
    `;

    const formattedMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 600,
    });

    const reply = completion.choices[0]?.message?.content || "I apologize, I could not generate a response.";
    return { reply };
  } catch (err: any) {
    console.error("Error in Copilot Chat:", err);
    return {
      reply: `Copilot Error: ${err?.message || "Failed to reach Groq API"}`,
      error: err?.message,
    };
  }
}
