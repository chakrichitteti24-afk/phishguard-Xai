"""
Risk Score Engine — Weighted threat correlation and scoring.
Rule Engine = 45%, Machine Learning = 40%, WHOIS = 10%, SSL = 5%
"""


def calculate_risk_score(
    ml_confidence: float,
    rule_score: int,
    threat_intel: dict,
) -> dict:
    """
    Calculates final risk score using weighted combination of all components.
    
    Weights:
      Rule Engine    : 45%
      Machine Learning: 40%
      WHOIS           : 10%
      SSL             : 5%
    
    Returns: final_score (0-100), threat_level, confidence, components breakdown
    """

    # ── ML Component (40%) ─────────────────────────────────────────────────
    # ml_confidence is 0-100 (probability of being phishing × 100)
    ml_comp = (ml_confidence / 100.0) * 40.0

    # ── Rule Engine Component (45%) ────────────────────────────────────────
    rule_comp = (rule_score / 100.0) * 45.0

    # ── WHOIS Component (10%) ──────────────────────────────────────────────
    whois_comp = 0.0
    whois = threat_intel.get("whois", {})
    whois_raw_score = whois.get("whois_score", 0)
    whois_comp = (whois_raw_score / 100.0) * 10.0

    # Legacy fallback: if old format
    if whois_raw_score == 0:
        if whois.get("is_recent_domain") or whois.get("is_available") is False:
            whois_comp = 10.0

    # ── SSL Component (5%) ─────────────────────────────────────────────────
    ssl_comp = 0.0
    ssl_info = threat_intel.get("ssl", {})
    ssl_raw_score = ssl_info.get("ssl_score", 0)
    ssl_comp = (ssl_raw_score / 100.0) * 5.0

    # Legacy fallback
    if ssl_raw_score == 0:
        if not ssl_info.get("has_ssl"):
            ssl_comp = 5.0

    # ── Final Score ────────────────────────────────────────────────────────
    final_score = ml_comp + rule_comp + whois_comp + ssl_comp
    final_score = min(100.0, max(0.0, round(final_score, 1)))

    # ── Threat Level Classification ────────────────────────────────────────
    if final_score >= 81:
        level = "Critical"
        category = "Active Phishing / Malware"
    elif final_score >= 61:
        level = "High"
        category = "Likely Phishing"
    elif final_score >= 41:
        level = "Medium"
        category = "Suspicious / Potentially Unsafe"
    elif final_score >= 21:
        level = "Low"
        category = "Minor Risk Indicators"
    else:
        level = "Safe"
        category = "No Significant Threats Detected"

    # ── Overall Confidence ─────────────────────────────────────────────────
    # Confidence reflects how many signals contributed meaningfully
    signal_count = sum([
        1 if ml_confidence > 10 else 0,
        1 if rule_score > 5 else 0,
        1 if whois.get("available") else 0,
        1 if ssl_info.get("has_ssl") or ssl_info.get("is_https") else 0,
    ])
    base_confidence = 60 + (signal_count * 10)
    confidence = min(99.0, max(50.0, base_confidence))

    return {
        "final_score": final_score,
        "threat_level": level,
        "threat_category": category,
        "confidence": round(confidence, 1),
        "components": {
            "ml_contribution": round(ml_comp, 2),
            "rule_contribution": round(rule_comp, 2),
            "whois_contribution": round(whois_comp, 2),
            "ssl_contribution": round(ssl_comp, 2),
        },
        "weights": {
            "rule_engine": "45%",
            "machine_learning": "40%",
            "whois_intelligence": "10%",
            "ssl_analysis": "5%",
        },
    }
