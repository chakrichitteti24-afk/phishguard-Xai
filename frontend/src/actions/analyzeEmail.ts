/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export interface EmailAnalysisResult {
  score: number;
  level: "Safe" | "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  category: "Banking Scam" | "OTP Theft" | "Delivery Scam" | "Credential Phishing" | "Lottery Fraud" | "Safe / Legitimate";
  urgencyScore: number;
  fakeSenderRisk: number;
  suspiciousLinkCount: number;
  explanations: { id: string; reason: string; severity: "info" | "warning" | "critical" }[];
  recommendations: string[];
  error?: string;
  pdfBase64?: string;
}

export async function analyzeEmailWithGroq(
  content: string,
  mode: "Email" | "SMS/WhatsApp"
): Promise<EmailAnalysisResult> {
  try {
    const scanType = mode === "Email" ? "Email" : "SMS"; // Maps to our Python ScanType enum
    
    // Proxy handles the actual backend URL and CORS
    const response = await fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: scanType,
        payload: content,
        metadata: { source: mode }
      })
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    const score = data.score;

    // Derived category for UI presentation since python backend provides generic level
    let category: EmailAnalysisResult["category"] = "Safe / Legitimate";
    if (score >= 80) category = "Banking Scam";
    else if (score >= 60) category = "Credential Phishing";
    else if (score >= 40) category = "OTP Theft";

    return {
      score: data.score,
      level: data.level as any,
      confidence: data.confidence,
      category,
      urgencyScore: Math.min(100, (data.features?.suspiciousKeywords || 0) * 20),
      fakeSenderRisk: (data.features?.urlsCount || 0) > 0 ? 80 : 20,
      suspiciousLinkCount: data.features?.urlsCount || 0,
      explanations: data.explanations,
      recommendations: data.recommendations,
      pdfBase64: data.pdf_base64,
    };
  } catch (error: any) {
    console.error("Error communicating with Scan Proxy:", error);
    const isAbort = error?.name === "AbortError" || error?.message?.includes("timeout");
    return {
      error: isAbort 
        ? "The backend server took longer than expected to wake up from cold start. Please click Scan again!"
        : error.message || "Failed to reach backend engine",
      score: 0,
      level: "Safe",
      confidence: 0,
      category: "Safe / Legitimate",
      urgencyScore: 0,
      fakeSenderRisk: 0,
      suspiciousLinkCount: 0,
      explanations: [
        { 
          id: "err_backend", 
          reason: isAbort
            ? "Server cold start timeout. Free hosting servers take ~50s to wake up on first request. Click Scan again to proceed."
            : "Cannot reach backend. Please check network connection or server status.", 
          severity: "critical" 
        }
      ],
      recommendations: ["Click the Scan button again to retry."]
    };
  }
}
