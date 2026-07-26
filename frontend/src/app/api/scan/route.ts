/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { extractUrlFeatures, extractTextFeatures } from "@/lib/engine/featureExtractor";
import { evaluateRules } from "@/lib/engine/ruleEngine";
import { gatherThreatIntel } from "@/lib/engine/threatIntel";
import { correlateThreats } from "@/lib/engine/threatCorrelator";
import { generateExplanation } from "@/lib/engine/groqEngine";

function validateAndNormalizeUrl(url: string): [boolean, string, string] {
  const trimmed = url.trim();
  if (!trimmed) return [false, url, "URL cannot be empty."];
  if (trimmed.length > 2048) return [false, url, "URL exceeds the maximum supported length of 2048 characters."];

  let normalized = trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    normalized = "http://" + trimmed;
  }

  try {
    const parsed = new URL(normalized);
    if (!parsed.hostname) return [false, url, "URL must contain a hostname."];
    return [true, normalized, ""];
  } catch {
    return [false, url, "Malformed URL — could not parse."];
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = body.payload;
    const scanType = body.type; // "URL", "EMAIL", "SMS"

    let finalPayload = payload;

    // 1. Validate & Normalize
    if (scanType === "URL") {
      const [isValid, normUrl, err] = validateAndNormalizeUrl(payload);
      if (!isValid) {
        return NextResponse.json({
          score: 0,
          level: "Safe",
          confidence: 0,
          explanations: [{ id: "err_input", reason: err, severity: "warning" }],
          recommendations: ["Please provide a valid HTTP or HTTPS URL."],
          error: err,
        });
      }
      finalPayload = normUrl;
    }

    // 2. Feature Extraction
    const features = scanType === "URL" ? extractUrlFeatures(finalPayload) : extractTextFeatures(finalPayload);

    // 3. Rule Engine
    const ruleResults = evaluateRules(features, scanType, finalPayload);

    // 4. Threat Intel (Async)
    let threatIntel = {};
    if (scanType === "URL") {
      threatIntel = await gatherThreatIntel(finalPayload);
    }

    // 5. Threat Correlation
    const correlation = correlateThreats(ruleResults.score, threatIntel, features, ruleResults.triggered_rules);

    // 6. Groq AI Explanation
    const enrichedTriggered = [
      ...ruleResults.triggered_rules,
      ...(correlation.correlation_notes ? correlation.correlation_notes.map((n) => `[Correlation] ${n}`) : []),
    ];

    const xaiOutput = await generateExplanation(
      finalPayload,
      {
        final_score: correlation.correlated_score,
        threat_level: correlation.verdict,
        threat_category: correlation.threat_category,
        components: correlation.components,
      },
      features,
      threatIntel,
      enrichedTriggered,
      ruleResults.evidence
    );

    // 7. Final Response (No PDF generated here, handled on client)
    return NextResponse.json({
      score: correlation.correlated_score,
      level: correlation.verdict,
      confidence: correlation.confidence,
      explanations: xaiOutput.explanations || [],
      recommendations: xaiOutput.recommendations || [],
      threat_intel_summary: {
        ...threatIntel,
        executive_summary: xaiOutput.executive_summary || "",
        threat_category: correlation.threat_category,
        correlation_notes: correlation.correlation_notes,
        trust_modifier: correlation.trust_modifier,
      },
      features: features,
      risk_components: correlation.components,
      triggered_rules: ruleResults.triggered_rules,
      error: null,
      pdf_base64: null, // Client side will generate PDF
    });

  } catch (error: any) {
    console.error("Local Scan Engine Error:", error);
    return NextResponse.json(
      { error: "Failed to process scan using the local engine." },
      { status: 500 }
    );
  }
}

