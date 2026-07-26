/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Groq from "groq-sdk";

export async function generateExplanation(
  payload: string,
  riskData: any,
  features: any,
  threatIntel: any,
  triggeredRules: string[],
  evidence: any[] = []
) {
  const apiKey = process.env.GROQ_API_KEY;
  const score = riskData.final_score || 0;
  const level = riskData.threat_level || "Unknown";

  const fallback = {
    executive_summary: `Threat Level: ${level} | Risk Score: ${score}/100. AI explanation unavailable (Groq API key not configured).`,
    explanations: [
      {
        id: "e1",
        reason: `Risk Score: ${score}/100 — Threat Level: ${level}. Calculated from ${triggeredRules.length} triggered rules.`,
        severity: score >= 60 ? "critical" : score >= 30 ? "warning" : "info",
      },
    ],
    recommendations: [
      "Configure GROQ_API_KEY in Vercel environment variables to enable AI-powered explanations.",
      "Review triggered rules for specific threat indicators.",
    ],
  };

  if (!apiKey || !apiKey.startsWith("gsk_")) {
    return fallback;
  }

  const groq = new Groq({ apiKey: apiKey });

  const whois = threatIntel.whois || {};
  const ssl = threatIntel.ssl || {};

  const rulesText = triggeredRules.length > 0 ? triggeredRules.map((r) => `  - ${r}`).join("\n") : "  None";

  const whoisText = `  Domain Age: ${whois.domainAgeDays || 'Unknown'} days
  Registrar: ${whois.registrar || 'Unknown'}
  Created: ${whois.creationDate || 'Unknown'}
  Expires: ${whois.expirationDate || 'Unknown'}`;

  const sslText = `  HTTPS: ${features.isHttps || false}
  Issuer: ${ssl.issuer || 'Unknown'}
  Valid Until: ${ssl.validTo || 'Unknown'}
  Days to Expiry: ${ssl.daysToExpiry || 0}
  Self-Signed: ${ssl.isSelfSigned || 'Unknown'}`;

  const featuresText = `  URL Length: ${features.urlLength || features.textLength || 'N/A'}
  Entropy: ${features.entropy || 'N/A'}
  HTTPS: ${features.isHttps || 'N/A'}
  IP-based: ${features.hasIpAddress || 'N/A'}
  Subdomains: ${features.subdomains || 'N/A'}
  Phishing Keywords: ${features.suspiciousKeywords || 'N/A'}`;

  const prompt = `You are an expert Cybersecurity SOC Analyst and XAI specialist working with the PhishGuard Enterprise Threat Engine.

The engine has already computed a VERIFIED risk assessment for the following payload. Your task is ONLY to explain these findings in clear, structured language. You must NOT change, override, or question the calculated scores.

═══════════════════════════════════════════════
TARGET: ${payload.substring(0, 200)}
RISK SCORE: ${score}/100
THREAT LEVEL: ${level}
THREAT CATEGORY: ${riskData.threat_category || "Unknown"}
═══════════════════════════════════════════════

TRIGGERED RULES (${triggeredRules.length}):
${rulesText}

EXTRACTED FEATURES:
${featuresText}

WHOIS INTELLIGENCE:
${whoisText}

SSL CERTIFICATE ANALYSIS:
${sslText}

RISK SCORE BREAKDOWN:
  Rule Engine:  ${(riskData.components?.rule_contribution || 0).toFixed(1)}/85 pts
  WHOIS:        ${(riskData.components?.whois_contribution || 0).toFixed(1)}/10 pts
  SSL:          ${(riskData.components?.ssl_contribution || 0).toFixed(1)}/5 pts
═══════════════════════════════════════════════

INSTRUCTIONS:
1. Write an executive_summary: 1-2 sentence high-level verdict for a non-technical audience.
2. Write 2-4 explanations: each explaining a specific finding from the triggered rules or threat intel.
   Each explanation must have: id (e1, e2, ...), reason (the finding), severity ("info"|"warning"|"critical")
3. Write 3-5 recommendations: specific, actionable security guidance for the end user.

Return ONLY a JSON object with this exact structure:
{
  "executive_summary": "string",
  "explanations": [
    {"id": "e1", "reason": "string", "severity": "critical|warning|info"}
  ],
  "recommendations": ["string", "string", "string"]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.15,
      max_tokens: 1200,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(responseText);

    if (!parsed.explanations) parsed.explanations = fallback.explanations;
    if (!parsed.recommendations) parsed.recommendations = fallback.recommendations;
    if (!parsed.executive_summary) parsed.executive_summary = fallback.executive_summary;

    return parsed;
  } catch (err) {
    console.error("Groq JSON parse error:", err);
    return fallback;
  }
}

export async function runCopilotChat(messages: any[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.startsWith("gsk_")) {
    return "⚠️ PhishGuard Copilot is currently offline because **GROQ_API_KEY** is not configured on Vercel.\n\n**How to resolve:** Please set `GROQ_API_KEY` in your Vercel Environment Variables.";
  }

  try {
    const groq = new Groq({ apiKey: apiKey });
    const systemPrompt = "You are PhishGuard Copilot, an elite AI Cybersecurity Assistant and SOC Threat Analyst powered by Groq LLaMA-3.3 XAI. Your mission is to help users understand phishing attacks, social engineering, security risks, safe browsing habits, and explain scan findings. Keep your answers concise, structured (using bullet points and bold headers), clear, and professional.";

    const formattedMessages = [{ role: "system", content: systemPrompt }, ...messages];

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 600,
    });

    return completion.choices[0]?.message?.content || "I apologize, I could not generate a response.";
  } catch (err: any) {
    console.error("Copilot Chat failed:", err);
    return `PhishGuard Copilot Service Error: ${err.message}`;
  }
}

