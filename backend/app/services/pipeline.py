"""
Scan Pipeline — Orchestrates the full 13-step phishing detection pipeline.

Step 1:  URL Validation & Normalization
Step 2:  Feature Extraction
Step 3:  Rule Engine
Step 4:  Machine Learning
Step 5:  WHOIS Intelligence  (async)
Step 6:  SSL Certificate Analysis  (async)
Step 7:  Threat Correlation Engine
Step 8:  Risk Score
Step 9:  Threat Classification
Step 10: Groq AI Explanation
Step 11: PDF Report Generation
Step 12: Final Response
"""
from __future__ import annotations

import re
import uuid

from app.schemas.payload   import ScanRequest, AIAnalysisResult, ExplanationItem
from app.services.feature_extractor  import extract_url_features, extract_text_features
from app.services.rule_engine        import evaluate_rules
from app.ml.model_manager            import predict
from app.services.threat_intel       import gather_threat_intel
from app.services.threat_correlator  import correlate_threats
from app.services.groq_engine        import generate_explanation
from app.services.pdf_generator      import generate_security_report_base64


# ─── URL Validation ───────────────────────────────────────────────────────────

def _validate_and_normalize_url(url: str) -> tuple[bool, str, str]:
    """
    Standards-compliant URL validation using Python's stdlib urlparse.
    Accepts ALL syntactically valid URLs — rejects only genuinely malformed input.
    """
    from urllib.parse import urlparse

    url = url.strip()

    if not url:
        return False, url, "URL cannot be empty."

    if len(url) > 2048:
        return False, url, "URL exceeds the maximum supported length of 2048 characters."

    # Inject scheme if missing
    normalized = url
    if not re.match(r"^https?://", url, re.IGNORECASE):
        normalized = "http://" + url

    try:
        parsed = urlparse(normalized)
    except Exception:
        return False, url, "Malformed URL — could not parse."

    hostname = (parsed.hostname or "").strip()
    if not hostname:
        return False, url, "URL must contain a hostname."

    return True, normalized, ""


# ─── Pipeline ─────────────────────────────────────────────────────────────────

async def execute_scan_pipeline(request: ScanRequest) -> AIAnalysisResult:
    scan_type = request.type.value

    # ── Step 1: Validate & Normalise ──────────────────────────────────────────
    if scan_type == "URL":
        is_valid, payload, err = _validate_and_normalize_url(request.payload)
        if not is_valid:
            return AIAnalysisResult(
                score=0, level="Safe", confidence=0,
                explanations=[ExplanationItem(id="err_input", reason=err, severity="warning")],
                recommendations=["Please provide a valid HTTP or HTTPS URL."],
                error=err,
            )
    else:
        payload = request.payload

    # ── Step 2: Feature Extraction ────────────────────────────────────────────
    features = (
        extract_url_features(payload)
        if scan_type == "URL"
        else extract_text_features(payload)
    )

    # ── Step 3: Rule Engine ───────────────────────────────────────────────────
    rule_results    = evaluate_rules(features, scan_type, payload)
    rule_score      = rule_results.get("score", 0)
    triggered_rules = rule_results.get("triggered_rules", [])
    evidence        = rule_results.get("evidence", [])

    # ── Step 4: Machine Learning ──────────────────────────────────────────────
    ml_results    = predict(features, scan_type)
    ml_confidence = ml_results.get("confidence", 0.0)

    # ── Steps 5 & 6: WHOIS + SSL (concurrent, URL scans only) ─────────────────
    threat_intel: dict = {}
    if scan_type == "URL":
        threat_intel = await gather_threat_intel(payload)

    # ── Step 7: Threat Correlation Engine ─────────────────────────────────────
    correlation = correlate_threats(
        rule_score      = rule_score,
        ml_confidence   = ml_confidence,
        threat_intel    = threat_intel,
        features        = features,
        triggered_rules = triggered_rules,
    )

    final_score = correlation["correlated_score"]
    verdict     = correlation["verdict"]           # SAFE / LOW RISK / SUSPICIOUS / HIGH RISK / PHISHING DETECTED
    confidence  = correlation["confidence"]
    trust_mod   = correlation["trust_modifier"]
    corr_notes  = correlation["correlation_notes"]
    components  = correlation["components"]
    category    = correlation["threat_category"]

    # ── Step 8: Groq AI Explanation ────────────────────────────────────────────
    # Pass correlation notes as additional context
    enriched_triggered = triggered_rules + (
        [f"[Correlation] {n}" for n in corr_notes] if corr_notes else []
    )

    xai_output = generate_explanation(
        payload       = payload,
        risk_data     = {
            "final_score":     final_score,
            "threat_level":    verdict,
            "threat_category": category,
            "components":      components,
        },
        features      = features,
        threat_intel  = threat_intel,
        triggered_rules = enriched_triggered,
        evidence      = evidence,
    )

    explanations      = [ExplanationItem(**e) for e in xai_output.get("explanations", [])]
    recommendations   = xai_output.get("recommendations", [])
    executive_summary = xai_output.get("executive_summary", "")

    # ── Step 9: PDF Report ─────────────────────────────────────────────────────
    scan_id  = str(uuid.uuid4())
    pdf_b64  = generate_security_report_base64(
        scan_id   = scan_id,
        scan_type = scan_type,
        payload   = payload,
        analysis  = {
            "score":               final_score,
            "level":               verdict,
            "confidence":          confidence,
            "risk_components":     components,
            "triggered_rules":     triggered_rules,
            "evidence":            evidence,
            "threat_intel_summary": threat_intel,
            "explanations":        xai_output.get("explanations", []),
            "recommendations":     recommendations,
            "executive_summary":   executive_summary,
            "ml_results":          ml_results,
            "correlation_notes":   corr_notes,
            "trust_modifier":      trust_mod,
        },
    )

    # ── Step 10: Final Response ────────────────────────────────────────────────
    return AIAnalysisResult(
        score       = final_score,
        level       = verdict,
        confidence  = confidence,
        explanations    = explanations,
        recommendations = recommendations,
        threat_intel_summary = {
            **threat_intel,
            "executive_summary":  executive_summary,
            "threat_category":    category,
            "correlation_notes":  corr_notes,
            "trust_modifier":     trust_mod,
        },
        features         = features,
        risk_components  = components,
        triggered_rules  = triggered_rules,
        error            = None,
        pdf_base64       = pdf_b64,
    )
