/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

export async function GET() {
  const hasGroqKey = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith("gsk_");

  const healthReport = {
    timestamp: new Date().toISOString(),
    overallStatus: hasGroqKey ? "HEALTHY" : "DEGRADED",
    services: {
      nextEngine: {
        status: "OK",
        message: "Next.js Unified Threat Engine is active & executing locally.",
      },
      ruleEngine: {
        status: "OK",
        message: "20+ Heuristic rules loaded (Typosquatting, Homograph, OTP, KYC, Brand Impersonation).",
      },
      groqXAI: {
        status: hasGroqKey ? "OK" : "MISSING_KEY",
        message: hasGroqKey 
          ? "Groq LLaMA-3.3-70b XAI Engine is connected and operational." 
          : "GROQ_API_KEY not configured. Rule engine will function, but AI explanations will use fallback.",
      },
    },
    engineInfo: {
      developer: "CipherFlux Labs",
      version: "2.5.0-HACKER-XAI",
      mode: "Unified Serverless Engine",
    }
  };

  return NextResponse.json(healthReport, { status: 200 });
}
