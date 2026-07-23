"""
PDF Security Report Generator — Professional 12-section PDF using ReportLab.
Generates a comprehensive threat analysis report for every scan.
"""
import base64
import io
from datetime import datetime

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, KeepTogether,
    )
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False


def generate_security_report_base64(
    scan_id: str,
    scan_type: str,
    payload: str,
    analysis: dict,
) -> str:
    """
    Generates a professional PDF security report and returns it as a Base64 string.
    Falls back to empty string if reportlab is unavailable.
    """
    if not HAS_REPORTLAB:
        return ""

    try:
        buf = io.BytesIO()
        _build_pdf(buf, scan_id, scan_type, payload, analysis)
        return base64.b64encode(buf.getvalue()).decode("utf-8")
    except Exception as e:
        print(f"PDF generation error: {e}")
        return ""


# ─── PDF Builder ──────────────────────────────────────────────────────────────

def _build_pdf(buf: io.BytesIO, scan_id: str, scan_type: str, payload: str, analysis: dict):
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
    )

    styles = getSampleStyleSheet()
    W = A4[0] - 36 * mm  # usable width

    # ── Custom Styles ──────────────────────────────────────────────────────
    def style(name, parent="Normal", **kw):
        s = ParagraphStyle(name, parent=styles[parent], **kw)
        return s

    H1 = style("H1", "Heading1", fontSize=18, textColor=colors.HexColor("#1E40AF"),
               spaceAfter=4, spaceBefore=0, leading=22)
    H2 = style("H2", "Heading2", fontSize=12, textColor=colors.HexColor("#1E40AF"),
               spaceAfter=3, spaceBefore=8, leading=15)
    BODY = style("BODY", fontSize=9, leading=13, textColor=colors.HexColor("#1F2937"))
    SMALL = style("SMALL", fontSize=8, leading=11, textColor=colors.HexColor("#6B7280"))
    MONO = style("MONO", "Code", fontSize=8, leading=12, textColor=colors.HexColor("#111827"))
    LABEL = style("LABEL", fontSize=8, fontName="Helvetica-Bold",
                  textColor=colors.HexColor("#374151"))
    CENTER = style("CENTER", "Normal", fontSize=9, alignment=TA_CENTER,
                   textColor=colors.HexColor("#6B7280"))

    story = []

    score = analysis.get("score", 0)
    level = analysis.get("level", "Unknown")
    confidence = analysis.get("confidence", 0)
    components = analysis.get("risk_components", {})
    triggered_rules = analysis.get("triggered_rules", [])
    evidence = analysis.get("evidence", [])
    threat_intel = analysis.get("threat_intel_summary", {})
    explanations = analysis.get("explanations", [])
    recommendations = analysis.get("recommendations", [])
    executive_summary = analysis.get("executive_summary", "")
    ml_results = analysis.get("ml_results", {})

    whois = threat_intel.get("whois", {})
    ssl = threat_intel.get("ssl", {})

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

    def _level_color(lvl: str) -> colors.Color:
        return {
            "Malicious": colors.HexColor("#991B1B"),
            "Phishing Detected": colors.HexColor("#DC2626"),
            "High Risk": colors.HexColor("#EA580C"),
            "Suspicious": colors.HexColor("#D97706"),
            "Low Risk": colors.HexColor("#2563EB"),
            "Safe": colors.HexColor("#16A34A"),
        }.get(lvl, colors.HexColor("#6B7280"))

    def _hr():
        return HRFlowable(width="100%", thickness=0.5,
                          color=colors.HexColor("#E5E7EB"), spaceAfter=4, spaceBefore=4)

    def _kv_table(rows: list, col_widths=None):
        if col_widths is None:
            col_widths = [W * 0.35, W * 0.65]
        data = [[Paragraph(str(k), LABEL), Paragraph(str(v), BODY)] for k, v in rows]
        t = Table(data, colWidths=col_widths)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F9FAFB")),
            ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
            ("PADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        return t

    # ══ SECTION 1: HEADER ════════════════════════════════════════════════════
    # Header banner
    header_data = [[
        Paragraph("<b>PhishGuard XAI</b>", style("HBRAND", fontSize=16,
                  fontName="Helvetica-Bold", textColor=colors.white)),
        Paragraph("Enterprise Security Report<br/>"
                  f"<font size='8'>Scan ID: {scan_id[:12]}... | {now_str}</font>",
                  style("HRIGHT", fontSize=9, alignment=TA_RIGHT, textColor=colors.white)),
    ]]
    ht = Table(header_data, colWidths=[W * 0.5, W * 0.5])
    ht.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#1E3A8A")),
        ("PADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(ht)
    story.append(Spacer(1, 6))

    # ══ SECTION 2: SCAN DETAILS ═══════════════════════════════════════════════
    story.append(Paragraph("1. Scan Details", H2))
    target_display = payload[:100] + ("..." if len(payload) > 100 else "")
    story.append(_kv_table([
        ("Scan ID", scan_id),
        ("Scan Type", scan_type),
        ("Target Payload", target_display),
        ("Scan Timestamp", now_str),
    ]))
    story.append(Spacer(1, 6))

    # ══ SECTION 3: VERDICT BANNER ════════════════════════════════════════════
    story.append(Paragraph("2. Final Verdict", H2))
    lc = _level_color(level)
    verdict_data = [[
        Paragraph(f"<b>THREAT LEVEL: {level.upper()}</b>",
                  style("VL", fontSize=18, fontName="Helvetica-Bold", textColor=lc, alignment=TA_CENTER)),
        Paragraph(f"<b>Risk Score</b><br/><font size='22'>{score:.0f}</font><br/><font size='8'>/100</font>",
                  style("VS", fontSize=9, alignment=TA_CENTER)),
        Paragraph(f"<b>Confidence</b><br/><font size='18'>{confidence:.0f}%</font>",
                  style("VC", fontSize=9, alignment=TA_CENTER)),
    ]]
    vt = Table(verdict_data, colWidths=[W * 0.4, W * 0.3, W * 0.3])
    vt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F9FAFB")),
        ("BOX", (0, 0), (-1, -1), 1.5, lc),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
        ("PADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(vt)
    story.append(Spacer(1, 6))

    # ══ SECTION 4: EXECUTIVE SUMMARY ══════════════════════════════════════════
    if executive_summary:
        story.append(Paragraph("3. Executive Summary (AI-Generated)", H2))
        story.append(Paragraph(executive_summary, BODY))
        story.append(Spacer(1, 4))

    # ══ SECTION 5: RISK SCORE BREAKDOWN ══════════════════════════════════════
    story.append(Paragraph("4. Risk Score Breakdown", H2))
    comp_rows = [
        ("Rule Engine (45%)", f"{components.get('rule_contribution', 0):.1f} / 45 pts"),
        ("Machine Learning (40%)", f"{components.get('ml_contribution', 0):.1f} / 40 pts"),
        ("WHOIS Intelligence (10%)", f"{components.get('whois_contribution', 0):.1f} / 10 pts"),
        ("SSL Certificate (5%)", f"{components.get('ssl_contribution', 0):.1f} / 5 pts"),
        ("TOTAL SCORE", f"{score:.0f} / 100"),
    ]
    story.append(_kv_table(comp_rows))
    story.append(Spacer(1, 6))

    # ══ SECTION 6: RULE ENGINE FINDINGS ══════════════════════════════════════
    story.append(Paragraph("5. Rule Engine Findings", H2))
    if triggered_rules:
        for i, rule in enumerate(triggered_rules, 1):
            story.append(Paragraph(f"• [{i}] {rule}", BODY))
    else:
        story.append(Paragraph("No phishing rules triggered.", BODY))
    story.append(Spacer(1, 6))

    # ══ SECTION 7: ML MODEL RESULTS ═══════════════════════════════════════════
    story.append(Paragraph("6. Machine Learning Analysis", H2))
    ml_rows = [
        ("Model", "Random Forest Classifier (GridSearchCV tuned)"),
        ("Prediction", ml_results.get("prediction", "Phishing" if score > 50 else "Safe")),
        ("ML Probability", f"{ml_results.get('probability', components.get('ml_contribution', 0) / 40):.2%}"),
        ("ML Score Contribution", f"{components.get('ml_contribution', 0):.1f} pts"),
        ("Feature Importance: URL Structure",
         f"{ml_results.get('feature_importance', {}).get('url_structure', 'N/A')}"),
        ("Feature Importance: Heuristics",
         f"{ml_results.get('feature_importance', {}).get('heuristics', 'N/A')}"),
    ]
    story.append(_kv_table(ml_rows))
    story.append(Spacer(1, 6))

    # ══ SECTION 8: WHOIS ANALYSIS ═════════════════════════════════════════════
    story.append(Paragraph("7. WHOIS Domain Intelligence", H2))
    if whois.get("available"):
        whois_rows = [
            ("Domain", whois.get("domain", "N/A")),
            ("Registrar", whois.get("registrar", "N/A")),
            ("Created", whois.get("creation_date", "N/A")),
            ("Expires", whois.get("expiration_date", "N/A")),
            ("Domain Age", f"{whois.get('domain_age_days', 0)} days"),
            ("DNSSEC", whois.get("dnssec", "unsigned")),
            ("Name Servers", ", ".join(whois.get("name_servers", [])) or "N/A"),
            ("Domain Status", ", ".join(whois.get("status", [])) or "N/A"),
        ]
        story.append(_kv_table(whois_rows))
        if whois.get("indicators"):
            story.append(Spacer(1, 3))
            story.append(Paragraph("WHOIS Indicators:", LABEL))
            for ind in whois["indicators"]:
                color_map = {"CRITICAL": "#DC2626", "WARNING": "#D97706", "INFO": "#2563EB"}
                c = color_map.get(ind.get("type", "INFO"), "#374151")
                story.append(Paragraph(
                    f'<font color="{c}">▸</font> <b>{ind.get("name")}</b>: {ind.get("detail")}',
                    BODY
                ))
    else:
        story.append(Paragraph(f"WHOIS lookup failed: {whois.get('message', 'N/A')}", SMALL))
    story.append(Spacer(1, 6))

    # ══ SECTION 9: SSL ANALYSIS ═══════════════════════════════════════════════
    story.append(Paragraph("8. SSL Certificate Analysis", H2))
    ssl_rows = [
        ("HTTPS", "Yes" if ssl.get("is_https") else "No"),
        ("Issuer", ssl.get("issuer_org", ssl.get("issuer", "N/A"))),
        ("Subject CN", ssl.get("subject", "N/A")),
        ("Valid From", ssl.get("valid_from", "N/A")),
        ("Valid Until", ssl.get("valid_to", "N/A")),
        ("Days to Expiry", str(ssl.get("days_to_expiry", "N/A"))),
        ("TLS Version", ssl.get("tls_version", "N/A")),
        ("Self-Signed", "Yes" if ssl.get("is_self_signed") else "No"),
        ("Expired", "Yes" if ssl.get("is_expired") else "No"),
        ("SSL Trust Score", f"{ssl.get('ssl_score', 0)}/100 (lower=better)"),
    ]
    story.append(_kv_table(ssl_rows))
    if ssl.get("indicators"):
        story.append(Spacer(1, 3))
        story.append(Paragraph("SSL Indicators:", LABEL))
        for ind in ssl["indicators"]:
            color_map = {"CRITICAL": "#DC2626", "WARNING": "#D97706", "INFO": "#16A34A"}
            c = color_map.get(ind.get("type", "INFO"), "#374151")
            story.append(Paragraph(
                f'<font color="{c}">▸</font> <b>{ind.get("name")}</b>: {ind.get("detail")}',
                BODY
            ))
    story.append(Spacer(1, 6))

    # ══ SECTION 10: AI EXPLANATION ════════════════════════════════════════════
    story.append(Paragraph("9. Explainable AI (XAI) Findings", H2))
    for exp in explanations:
        sev = exp.get("severity", "info")
        sev_colors = {
            "critical": ("#FEF2F2", "#DC2626"),
            "warning": ("#FFFBEB", "#D97706"),
            "info": ("#EFF6FF", "#2563EB"),
        }
        bg_c, text_c = sev_colors.get(sev, ("#F9FAFB", "#374151"))
        reason_para = Paragraph(
            f'<font color="{text_c}"><b>[{sev.upper()}]</b></font> {exp.get("reason", "")}',
            BODY
        )
        t = Table([[reason_para]], colWidths=[W])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(bg_c)),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor(text_c)),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 3))
    story.append(Spacer(1, 4))

    # ══ SECTION 11: RECOMMENDATIONS ══════════════════════════════════════════
    story.append(Paragraph("10. Security Recommendations", H2))
    for i, rec in enumerate(recommendations, 1):
        story.append(Paragraph(f"{i}. {rec}", BODY))
    story.append(Spacer(1, 6))

    # ══ SECTION 12: REPORT SIGNATURE ══════════════════════════════════════════
    story.append(_hr())
    sig_data = [[
        Paragraph("PhishGuard XAI Enterprise v2.0", SMALL),
        Paragraph(f"Generated: {now_str}", style("SR", fontSize=8, alignment=TA_RIGHT,
                                                  textColor=colors.HexColor("#6B7280"))),
    ]]
    st = Table(sig_data, colWidths=[W * 0.6, W * 0.4])
    st.setStyle(TableStyle([("PADDING", (0, 0), (-1, -1), 0)]))
    story.append(st)

    doc.build(story)
