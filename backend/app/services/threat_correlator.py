"""
Threat Correlation Engine — Cross-references Rule Engine, ML, WHOIS, and SSL findings
to produce a calibrated, evidence-based final risk score.

Design principles:
  1. Priority Overrides: Strong/Critical phishing indicators override trust signals.
  2. Trust Signal Muting: A valid SSL or older domain only reduces risk IF no strong/critical indicators exist.
  3. Evidence-driven: Explanations clearly state what triggered an override.
"""

from __future__ import annotations
import re

# ─── Trust Signal Thresholds ─────────────────────────────────────────────────

_AGE_VERY_OLD  = 365 * 5    # > 5 years — very strong trust
_AGE_OLD       = 365 * 2    # > 2 years — solid trust
_AGE_MATURE    = 365        # > 1 year  — moderate trust
_AGE_YOUNG     = 180        # > 6 months — mild trust
_AGE_VERY_NEW  = 30         # < 30 days — high suspicion

# ─── Critical & Strong Rule Strings ───────────────────────────────────────────
# Any rule starting with these triggers an override.
CRITICAL_OVERRIDE_RULES = [
    "Brand impersonation",
    "Typosquatting",
    "Homograph",
    "Unicode attack",
    "Credential harvesting",
    "OTP Theft",
    "Account Threat",
    "Fake Delivery",
]

STRONG_OVERRIDE_RULES = [
    "IP-based URL",
    "Suspicious TLD",
    "@ symbol in URL",
    "Multiple phishing keywords",
]

def correlate_threats(
    rule_score:     int,
    ml_confidence:  float,
    threat_intel:   dict,
    features:       dict,
    triggered_rules: list[str] = None,
) -> dict:
    """
    Cross-correlates all detection signals using a Priority Override model.
    """
    triggered_rules = triggered_rules or []
    
    whois = threat_intel.get("whois", {})
    ssl   = threat_intel.get("ssl",   {})

    domain_age   = whois.get("domain_age_days", 0) or 0
    whois_avail  = whois.get("available", whois.get("is_available", False))
    whois_score  = whois.get("whois_score", 0) or 0

    ssl_has_ssl    = ssl.get("has_ssl", False)
    ssl_is_https   = ssl.get("is_https", features.get("isHttps", False))
    ssl_self_signed = ssl.get("is_self_signed", True)
    ssl_expired     = ssl.get("is_expired", True)
    ssl_score       = ssl.get("ssl_score", 0) or 0
    ssl_valid       = ssl_is_https and ssl_has_ssl and not ssl_self_signed and not ssl_expired

    notes: list[str] = []
    trust_modifier = 0.0
    
    # ── Check Overrides ────────────────────────────────────────────────────────
    
    has_critical_override = False
    has_strong_override = False
    override_reasons = []

    for rule in triggered_rules:
        # Check critical
        for crit_rule in CRITICAL_OVERRIDE_RULES:
            if crit_rule.lower() in rule.lower():
                has_critical_override = True
                override_reasons.append(f"Critical Override: {rule}")
        # Check strong
        for strong_rule in STRONG_OVERRIDE_RULES:
            if strong_rule.lower() in rule.lower():
                has_strong_override = True
                override_reasons.append(f"Strong Indicator: {rule}")

    is_override_active = has_critical_override or has_strong_override

    # ── TRUST SIGNALS (Only applied if NO override is active) ─────────────────

    if not is_override_active:
        # 1. Domain age — most powerful trust indicator
        if whois_avail and domain_age > 0:
            if domain_age >= _AGE_VERY_OLD:
                trust_modifier -= 20
                notes.append(f"Established domain ({domain_age}d old, >5yr) — strong trust signal.")
            elif domain_age >= _AGE_OLD:
                trust_modifier -= 14
                notes.append(f"Mature domain ({domain_age}d old, >2yr) — solid trust signal.")
            elif domain_age >= _AGE_MATURE:
                trust_modifier -= 8
                notes.append(f"1-year-old domain ({domain_age}d) — moderate trust signal.")
            elif domain_age >= _AGE_YOUNG:
                trust_modifier -= 4
                notes.append(f"6-month-old domain ({domain_age}d) — slight trust benefit.")
        
        # 2. Valid CA-signed SSL certificate
        if ssl_valid:
            trust_modifier -= 8
            notes.append("Valid CA-signed TLS certificate — reduces phishing likelihood.")
    else:
        # If overrides are active, we explicitly MUTE trust signals
        notes.append("Trust signals (e.g. SSL, Domain Age) muted due to presence of critical/strong phishing indicators.")

    # ── THREAT AMPLIFIERS (Apply even during overrides) ───────────────────────

    if not ssl_is_https:
        trust_modifier += 8
        notes.append("No HTTPS — plaintext HTTP increases phishing risk.")
    elif ssl_is_https and ssl_self_signed:
        trust_modifier += 5
        notes.append("HTTPS but self-signed certificate — marginal trust reduction.")

    if rule_score >= 40 and ml_confidence >= 60:
        trust_modifier += 12
        notes.append("Rule Engine and ML model independently agree — high phishing confidence.")

    if whois_avail and domain_age > 0 and domain_age < _AGE_VERY_NEW and rule_score >= 20:
        trust_modifier += 18
        notes.append(f"Newly registered domain ({domain_age}d) combined with rule triggers — critical phishing pattern.")

    if ssl_expired and rule_score >= 20:
        trust_modifier += 8
        notes.append("Expired SSL certificate combined with phishing indicators.")

    # ── COMPUTE WEIGHTED RAW SCORE ─────────────────────────────────────────────

    ml_comp    = (ml_confidence / 100.0) * 40.0
    rule_comp  = (rule_score    / 100.0) * 45.0
    whois_comp = (whois_score   / 100.0) * 10.0
    ssl_comp   = (ssl_score     / 100.0) * 5.0

    raw_score = ml_comp + rule_comp + whois_comp + ssl_comp
    correlated_score = raw_score + trust_modifier

    # ── APPLY OVERRIDE FLOORS ──────────────────────────────────────────────────

    if has_critical_override:
        # Minimum score 85 if critical rule fired
        correlated_score = max(correlated_score, 85.0)
        notes.extend(override_reasons)
        notes.append("Critical Priority Override active: Score forced to ≥ 85 (Phishing Detected).")
    elif has_strong_override:
        # Minimum score 70 if strong rule fired
        correlated_score = max(correlated_score, 70.0)
        notes.extend(override_reasons)
        notes.append("Strong Priority Override active: Score forced to ≥ 70 (High Risk).")

    correlated_score = round(min(100.0, max(0.0, correlated_score)), 1)

    # ── VERDICT CLASSIFICATION ────────────────────────────────────────────────

    if correlated_score >= 82:
        verdict  = "Phishing Detected"
        category = "Active phishing — do not visit"
    elif correlated_score >= 65:
        verdict  = "High Risk"
        category = "Likely phishing or malicious"
    elif correlated_score >= 45:
        verdict  = "Suspicious"
        category = "Multiple risk indicators present"
    elif correlated_score >= 25:
        verdict  = "Low Risk"
        category = "Minor indicators — exercise caution"
    else:
        verdict  = "Safe"
        category = "No significant threat indicators"

    # ── CONFIDENCE SCORE ──────────────────────────────────────────────────────

    signal_strength = 0
    if ml_confidence  > 15: signal_strength += 1
    if rule_score     > 10: signal_strength += 1
    if whois_avail:          signal_strength += 1
    if ssl_is_https:         signal_strength += 1
    if is_override_active:   signal_strength += 2

    conflict_penalty = 0
    if not is_override_active:
        if rule_score < 10 and ml_confidence > 60:
            conflict_penalty = -10
        if rule_score > 40 and ml_confidence < 30:
            conflict_penalty = -10

    base_confidence = 55 + (signal_strength * 8) + conflict_penalty
    confidence = round(min(97.0, max(50.0, base_confidence)), 1)

    return {
        "correlated_score":  correlated_score,
        "verdict":           verdict,
        "threat_category":   category,
        "confidence":        confidence,
        "trust_modifier":    round(trust_modifier, 1),
        "correlation_notes": notes,
        "components": {
            "ml_contribution":    round(ml_comp, 2),
            "rule_contribution":  round(rule_comp, 2),
            "whois_contribution": round(whois_comp, 2),
            "ssl_contribution":   round(ssl_comp, 2),
            "trust_modifier":     round(trust_modifier, 1),
        },
        "weights": {
            "rule_engine":        "45%",
            "machine_learning":   "40%",
            "whois_intelligence": "10%",
            "ssl_analysis":       "5%",
        },
    }
