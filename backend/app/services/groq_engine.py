"""
Groq AI Explanation Engine — Generates structured XAI insights using Groq LLaMA.
Produces: executive summary, human-readable explanation, technical analysis,
security recommendations. Never invents or alters the calculated risk data.
"""
import os
import json
from groq import Groq


def generate_explanation(
    payload: str,
    risk_data: dict,
    features: dict,
    threat_intel: dict,
    triggered_rules: list,
    evidence: list = None,
) -> dict:
    """
    Uses Groq LLaMA-3.3 to generate structured, human-readable XAI explanations
    based on verified telemetry. Never invents scores or threat levels.
    """
    api_key = os.getenv("GROQ_API_KEY")

    # ── Fallback if no API key ─────────────────────────────────────────────
    score = risk_data.get("final_score", 0)
    level = risk_data.get("threat_level", "Unknown")

    fallback = {
        "executive_summary": f"Threat Level: {level} | Risk Score: {score}/100. AI explanation unavailable (Groq API key not configured).",
        "explanations": [
            {
                "id": "e1",
                "reason": f"Risk Score: {score}/100 — Threat Level: {level}. Calculated from {len(triggered_rules)} triggered rules.",
                "severity": "critical" if score >= 60 else ("warning" if score >= 30 else "info"),
            }
        ],
        "recommendations": [
            "Configure GROQ_API_KEY in backend/.env to enable AI-powered explanations.",
            "Review triggered rules for specific threat indicators.",
        ],
    }

    if not api_key or not api_key.startswith("gsk_"):
        return fallback

    try:
        client = Groq(api_key=api_key)

        # ── Build rich context for the model ──────────────────────────────
        whois = threat_intel.get("whois", {})
        ssl = threat_intel.get("ssl", {})

        rules_text = "\n".join(
            f"  - {r}" for r in triggered_rules
        ) if triggered_rules else "  None"

        whois_text = (
            f"  Domain Age: {whois.get('domain_age_days', 'Unknown')} days\n"
            f"  Registrar: {whois.get('registrar', 'Unknown')}\n"
            f"  Created: {whois.get('creation_date', 'Unknown')}\n"
            f"  Expires: {whois.get('expiration_date', 'Unknown')}\n"
            f"  DNSSEC: {whois.get('dnssec', 'Unknown')}\n"
            f"  Recent Domain: {whois.get('is_recent_domain', False)}"
        )

        ssl_text = (
            f"  HTTPS: {ssl.get('is_https', False)}\n"
            f"  Issuer: {ssl.get('issuer_org', ssl.get('issuer', 'Unknown'))}\n"
            f"  TLS Version: {ssl.get('tls_version', 'Unknown')}\n"
            f"  Valid Until: {ssl.get('valid_to', 'Unknown')}\n"
            f"  Days to Expiry: {ssl.get('days_to_expiry', 0)}\n"
            f"  Self-Signed: {ssl.get('is_self_signed', 'Unknown')}\n"
            f"  Expired: {ssl.get('is_expired', 'Unknown')}"
        )

        features_text = (
            f"  URL Length: {features.get('urlLength', features.get('textLength', 'N/A'))}\n"
            f"  Entropy: {features.get('entropy', 'N/A')}\n"
            f"  HTTPS: {features.get('isHttps', 'N/A')}\n"
            f"  IP-based: {features.get('hasIpAddress', 'N/A')}\n"
            f"  Subdomains: {features.get('subdomains', 'N/A')}\n"
            f"  Phishing Keywords: {features.get('suspiciousKeywords', 'N/A')}"
        )

        prompt = f"""You are an expert Cybersecurity SOC Analyst and XAI specialist working with the PhishGuard Enterprise Threat Engine.

The engine has already computed a VERIFIED risk assessment for the following payload. Your task is ONLY to explain these findings in clear, structured language. You must NOT change, override, or question the calculated scores.

═══════════════════════════════════════════════
TARGET: {payload[:200]}
RISK SCORE: {score}/100
THREAT LEVEL: {level}
THREAT CATEGORY: {risk_data.get("threat_category", "Unknown")}
═══════════════════════════════════════════════

TRIGGERED RULES ({len(triggered_rules)}):
{rules_text}

EXTRACTED FEATURES:
{features_text}

WHOIS INTELLIGENCE:
{whois_text}

SSL CERTIFICATE ANALYSIS:
{ssl_text}

RISK SCORE BREAKDOWN:
  ML Engine:    {risk_data.get("components", {}).get("ml_contribution", 0):.1f}/40 pts
  Rule Engine:  {risk_data.get("components", {}).get("rule_contribution", 0):.1f}/45 pts
  WHOIS:        {risk_data.get("components", {}).get("whois_contribution", 0):.1f}/10 pts
  SSL:          {risk_data.get("components", {}).get("ssl_contribution", 0):.1f}/5 pts
═══════════════════════════════════════════════

INSTRUCTIONS:
1. Write an executive_summary: 1-2 sentence high-level verdict for a non-technical audience.
2. Write 2-4 explanations: each explaining a specific finding from the triggered rules or threat intel.
   Each explanation must have: id (e1, e2, ...), reason (the finding), severity ("info"|"warning"|"critical")
3. Write 3-5 recommendations: specific, actionable security guidance for the end user.

Return ONLY a JSON object with this exact structure:
{{
  "executive_summary": "string",
  "explanations": [
    {{"id": "e1", "reason": "string", "severity": "critical|warning|info"}}
  ],
  "recommendations": ["string", "string", "string"]
}}"""

        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.15,
            max_tokens=1200,
        )

        response_text = completion.choices[0].message.content
        parsed = json.loads(response_text)

        # Validate structure
        if "explanations" not in parsed:
            parsed["explanations"] = fallback["explanations"]
        if "recommendations" not in parsed:
            parsed["recommendations"] = fallback["recommendations"]
        if "executive_summary" not in parsed:
            parsed["executive_summary"] = fallback["executive_summary"]

        return parsed

    except json.JSONDecodeError as e:
        print(f"Groq JSON parse error: {e}")
        return fallback
    except Exception as e:
        print(f"Groq API error: {type(e).__name__}: {e}")
        return fallback
