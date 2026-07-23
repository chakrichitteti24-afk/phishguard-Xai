/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ExtractedFeatures } from "@/components/dashboard/scanner/url/FeatureExtraction";
import { RiskAnalysis } from "@/components/dashboard/scanner/url/RiskMeter";
import { Explanation } from "@/components/dashboard/scanner/url/ExplanationPanel";
import { ThreatIntelData } from "@/lib/threatIntel";

export interface AIAnalysisResult {
  analysis: RiskAnalysis;
  explanations: Explanation[];
  recommendations: string[];
  error?: string;
  threatIntelSummary?: any;
  pdfBase64?: string;
}

export async function analyzeUrlWithGroq(
  url: string,
  features: ExtractedFeatures,
  threatIntel?: ThreatIntelData
): Promise<AIAnalysisResult> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    // Use AbortController for timeouts (90s for Render cold starts)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort("Request timed out"), 90000);

    const response = await fetch(`${API_URL}/api/v1/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "URL",
        payload: url,
        metadata: { ...features }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Map FastAPI backend response back to the frontend types
    return {
      analysis: {
        score: data.score,
        level: data.level,
        confidence: data.confidence,
      },
      explanations: data.explanations,
      recommendations: data.recommendations,
      threatIntelSummary: data.threat_intel_summary,
      pdfBase64: data.pdf_base64,
    };
  } catch (error: any) {
    console.error("Error communicating with Python Backend:", error);
    const isAbort = error?.name === "AbortError" || error?.message?.includes("aborted");
    return {
      error: isAbort 
        ? "The Render server took longer than expected to wake up from cold start. Please click Scan again!"
        : error.message || "Failed to reach Python Enterprise Engine",
      analysis: { score: 0, level: "Safe", confidence: 0 },
      explanations: [
        { 
          id: "err_backend", 
          reason: isAbort
            ? "Server cold start timeout. Free hosting servers take ~50s to wake up on first request. Click Scan again to proceed."
            : "Cannot reach backend. Please verify your NEXT_PUBLIC_API_URL or server status.", 
          severity: "critical" 
        }
      ],
      recommendations: ["Click the Scan button again to retry."]
    };
  }
}
