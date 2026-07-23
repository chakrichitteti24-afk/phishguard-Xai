"""
Rule Engine — Production-grade phishing detection rules.
25+ rules covering IP abuse, typosquatting, homograph attacks,
URL shorteners, brand impersonation, credential harvesting, and more.
Each rule returns: score contribution, rule name, evidence string.
"""
import re
import unicodedata
try:
    import Levenshtein
    HAS_LEVENSHTEIN = True
except ImportError:
    HAS_LEVENSHTEIN = False

from urllib.parse import urlparse


# ─── Constants ───────────────────────────────────────────────────────────────

TOP_BRANDS = [
    "paypal", "apple", "microsoft", "google", "amazon", "facebook",
    "instagram", "twitter", "linkedin", "netflix", "bankofamerica",
    "wellsfargo", "citi", "chase", "hsbc", "sbi", "icici", "hdfc",
    "dropbox", "icloud", "outlook", "yahoo", "ebay", "whatsapp",
    "coinbase", "binance", "kraken", "stripe", "square",
]

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "ow.ly",
    "buff.ly", "adf.ly", "rb.gy", "cutt.ly", "short.io", "snip.ly",
    "bl.ink", "rebrand.ly", "su.pr", "fur.ly", "s.id", "n9.cl",
    "clck.ru", "clickmeter.com",
}

SUSPICIOUS_TLDS = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq", "info", "click",
    "link", "online", "site", "website", "win", "download", "stream",
    "review", "loan", "science", "work", "party", "trade", "date",
    "racing", "bid", "webcam", "accountant", "faith", "cricket",
    "men", "gdn", "kim", "country", "pw", "zip",
}

HOMOGRAPH_MAP = {
    "а": "a", "е": "e", "і": "i", "о": "o", "р": "p",
    "с": "c", "у": "y", "х": "x", "ν": "v", "ο": "o",
}

# Phishing patterns in URL paths and queries
CREDENTIAL_HARVEST_PATTERNS = [
    r"(login|signin|logon|auth|authenticate)[\-_]?page",
    r"(verify|validate|confirm)[\-_]?(account|email|identity|phone)",
    r"(reset|recover|restore)[\-_]?(password|passwd|pwd|credentials)",
    r"(update|renew)[\-_]?(account|billing|payment|card)",
    r"(account|profile)[\-_]?(suspended|locked|blocked|disabled)",
    r"(secure|security)[\-_]?(check|verification|alert|notice)",
    r"(click|tap)[\-_]?(here|now|immediately)",
]

SMS_PHISHING_PATTERNS = [
    (r"\botp\b", "OTP Theft Indicator", 30),
    (r"one[\s\-]?time[\s\-]?password", "OTP Theft Pattern", 30),
    (r"\bkyc\b", "KYC Fraud Indicator", 30),
    (r"pan[\s\-]?card", "PAN/KYC Fraud Indicator", 25),
    (r"aadhaar|aadhar", "Aadhaar Fraud Indicator", 25),
    (r"investment.*return|guaranteed.*profit", "Investment Scam Pattern", 25),
    (r"(bitcoin|crypto|btc|eth|usdt).*profit", "Crypto Scam Indicator", 25),
    (r"(delivery|package|parcel).*(failed|held|pending)", "Fake Delivery Scam", 25),
    (r"(fedex|dhl|ups|usps|amazon).*(track|deliver|click)", "Parcel Phishing", 25),
    (r"(gift|prize|reward|lottery|winner|won)", "Lottery/Gift Fraud", 20),
    (r"(congratulations|you.have.won)", "Social Engineering Hook", 15),
    (r"(bank|account).*(locked|suspended|blocked|closed)", "Account Threat", 30),
]


# ─── Main Rule Evaluator ──────────────────────────────────────────────────────

def evaluate_rules(features: dict, scan_type: str, raw_payload: str) -> dict:
    """
    Evaluates all applicable phishing rules for the given scan type.
    Returns: score (0-100), triggered_rules list, evidence list
    """
    triggered = []   # (name, score_contribution, evidence)

    if scan_type == "URL":
        triggered = _evaluate_url_rules(features, raw_payload)
    else:
        triggered = _evaluate_text_rules(features, raw_payload, scan_type)

    # Aggregate score
    total_score = sum(t[1] for t in triggered)
    total_score = min(100, max(0, total_score))

    return {
        "score": total_score,
        "triggered_rules": [t[0] for t in triggered],
        "evidence": [{"rule": t[0], "score": t[1], "detail": t[2]} for t in triggered],
    }


# ─── URL Rules ────────────────────────────────────────────────────────────────

def _evaluate_url_rules(features: dict, raw_url: str) -> list:
    """Returns list of (rule_name, score, evidence) tuples."""
    results = []
    url_lower = raw_url.lower()

    try:
        parsed = urlparse(raw_url if "://" in raw_url else "http://" + raw_url)
        domain = parsed.netloc.split(":")[0].lower()
        path = parsed.path.lower()
        query = parsed.query.lower()
    except Exception:
        domain = ""
        path = ""
        query = ""

    # ── R01: IP-based URL ──────────────────────────────────────────────────
    if features.get("hasIpAddress"):
        results.append((
            "R01: IP-based URL detected",
            40,
            f"URL uses raw IP instead of domain. High phishing indicator."
        ))

    # ── R02: URL Shortener ─────────────────────────────────────────────────
    if features.get("isShortener"):
        results.append((
            "R02: URL shortener detected",
            30,
            f"Shortener masks actual destination. Often used in phishing campaigns."
        ))

    # ── R03: Excessively long URL ──────────────────────────────────────────
    url_len = features.get("urlLength", 0)
    if url_len > 200:
        results.append((
            "R03: Extremely long URL (>200 chars)",
            20,
            f"URL length is {url_len} chars — excessive length conceals malicious payload."
        ))
    elif url_len > 100:
        results.append((
            "R03: Long URL (>100 chars)",
            10,
            f"URL length is {url_len} chars — above normal threshold."
        ))

    # ── R04: Excessive subdomains ──────────────────────────────────────────
    subdomain_count = features.get("subdomains", 0)
    if subdomain_count >= 4:
        results.append((
            "R04: Excessive subdomains (≥4)",
            25,
            f"Domain has {subdomain_count} subdomain levels — phishing trick to hide real TLD."
        ))
    elif subdomain_count == 3:
        results.append((
            "R04: High subdomain depth (3)",
            12,
            f"3-level subdomain detected — common phishing pattern."
        ))

    # ── R05: Suspicious TLD ────────────────────────────────────────────────
    tld = features.get("tld", "").lower()
    if tld in SUSPICIOUS_TLDS:
        results.append((
            f"R05: Suspicious TLD (.{tld})",
            20,
            f"TLD '.{tld}' is known for abuse. Free or high-abuse registry."
        ))

    # ── R06: High entropy ──────────────────────────────────────────────────
    entropy = features.get("entropy", 0)
    if entropy > 5.0:
        results.append((
            "R06: Very high URL entropy (>5.0)",
            20,
            f"Entropy={entropy:.2f}. Indicates obfuscated domain or DGA (Domain Generation Algorithm)."
        ))
    elif entropy > 4.5:
        results.append((
            "R06: High URL entropy (>4.5)",
            10,
            f"Entropy={entropy:.2f}. Above normal — possible encoded payload."
        ))

    # ── R07: Excessive URL encoding ───────────────────────────────────────
    encoded = features.get("encodedCharacters", 0)
    if encoded > 5:
        results.append((
            "R07: Heavy URL encoding (>5 encoded chars)",
            15,
            f"{encoded} percent-encoded characters found — obfuscation attempt."
        ))
    elif encoded > 2:
        results.append((
            "R07: URL encoding detected",
            8,
            f"{encoded} percent-encoded characters found in URL."
        ))

    # ── R08: @ symbol (redirect obfuscation) ──────────────────────────────
    if features.get("hasAtSign"):
        results.append((
            "R08: @ symbol in URL (redirect obfuscation)",
            35,
            "Browser ignores everything before '@'. e.g. legitimate.com@evil.com → evil.com"
        ))

    # ── R09: Double slash in path ──────────────────────────────────────────
    if features.get("hasDoubleSlash"):
        results.append((
            "R09: Double slash in URL path",
            15,
            "Double slash '//' in path can redirect to another domain in some parsers."
        ))

    # ── R10: Non-standard port ────────────────────────────────────────────
    port = features.get("port", 0)
    if port and port not in (80, 443, 8080, 8443):
        results.append((
            f"R10: Non-standard port ({port})",
            15,
            f"URL uses port {port}. Phishing kits often operate on non-standard ports."
        ))

    # ── R11: Phishing keywords in URL ─────────────────────────────────────
    kw_count = features.get("suspiciousKeywords", 0)
    if kw_count >= 3:
        results.append((
            f"R11: Multiple phishing keywords ({kw_count})",
            25,
            f"{kw_count} phishing keywords found in URL — strong social engineering signal."
        ))
    elif kw_count >= 1:
        results.append((
            f"R11: Phishing keyword detected ({kw_count})",
            15,
            f"{kw_count} phishing keyword(s) in URL — common in credential harvesting sites."
        ))

    # ── R12: Banking keywords ─────────────────────────────────────────────
    banking_kw = features.get("bankingKeywords", 0)
    if banking_kw > 0:
        results.append((
            "R12: Banking/financial keyword detected",
            20,
            "URL contains banking-related keyword — potential financial phishing target."
        ))

    # ── R13: Hyphens in domain ────────────────────────────────────────────
    hyphens = features.get("hyphensInDomain", 0)
    if hyphens >= 3:
        results.append((
            f"R13: Many hyphens in domain ({hyphens})",
            15,
            f"Domain contains {hyphens} hyphens — phishing domains often use hyphens to spoof brands."
        ))

    # ── R14: Typosquatting (Levenshtein distance) ──────────────────────────
    domain_parts = domain.replace(".", " ").replace("-", " ").split()
    typosquat_found = False
    if HAS_LEVENSHTEIN and not typosquat_found:
        for word in domain_parts:
            if len(word) < 4:
                continue
            for brand in TOP_BRANDS:
                dist = Levenshtein.distance(word, brand)
                if 0 < dist <= 2 and word != brand:
                    results.append((
                        f"R14: Typosquatting — mimicking '{brand}' (distance={dist})",
                        35,
                        f"'{word}' is {dist} edit(s) away from '{brand}'. Classic typosquatting."
                    ))
                    typosquat_found = True
                    break
            if typosquat_found:
                break

    # ── R15: Brand impersonation in path/domain ───────────────────────────
    brand_hits = []
    for brand in TOP_BRANDS:
        if brand in url_lower:
            # Check it's not the actual legitimate domain (e.g., paypal.com)
            if f"{brand}.com" not in domain and f".{brand}." not in domain:
                brand_hits.append(brand)

    if brand_hits:
        results.append((
            f"R15: Brand impersonation ({', '.join(brand_hits[:3])})",
            30,
            f"Brand name '{brand_hits[0]}' appears in URL but not as the legitimate domain."
        ))

    # ── R16: Homograph / Unicode attack ──────────────────────────────────
    has_unicode_trick = _detect_homograph(domain)
    if has_unicode_trick:
        results.append((
            "R16: Homograph/Unicode attack detected",
            40,
            "Non-ASCII lookalike characters found in domain. Used to spoof trusted brands visually."
        ))

    # ── R17: Credential harvesting patterns in path/query ─────────────────
    for pattern in CREDENTIAL_HARVEST_PATTERNS:
        if re.search(pattern, path + query, re.IGNORECASE):
            results.append((
                "R17: Credential harvesting pattern detected",
                25,
                f"URL path matches known credential harvesting pattern: '{pattern[:50]}'"
            ))
            break

    # ── R18: Excessive digits in domain ───────────────────────────────────
    digits = features.get("digitsInDomain", 0)
    if digits >= 5:
        results.append((
            f"R18: Excessive digits in domain ({digits})",
            12,
            f"{digits} digits in domain name — often a randomly generated phishing domain."
        ))

    # ── R19: Query parameter count ────────────────────────────────────────
    params = features.get("queryParams", 0)
    if params >= 5:
        results.append((
            f"R19: Excessive query parameters ({params})",
            10,
            f"{params} query parameters — used to track victims or pass redirect tokens."
        ))

    # ── R20: Mixed content (HTTP in HTTPS redirect) ────────────────────────
    if not features.get("isHttps"):
        results.append((
            "R20: No HTTPS (plain HTTP)",
            15,
            "URL uses insecure HTTP. Phishing sites often skip SSL or use self-signed certs."
        ))

    # Deduplicate by rule code (e.g., R03)
    seen_codes = set()
    deduped = []
    for item in results:
        code = item[0][:3]
        if code not in seen_codes:
            seen_codes.add(code)
            deduped.append(item)

    return deduped


# ─── Text/Email/SMS Rules ────────────────────────────────────────────────────

def _evaluate_text_rules(features: dict, raw_payload: str, scan_type: str) -> list:
    results = []
    payload_lower = raw_payload.lower()

    # Scan all SMS/Email patterns
    for pattern, name, score in SMS_PHISHING_PATTERNS:
        if re.search(pattern, payload_lower):
            results.append((name, score, f"Pattern '{pattern}' matched in message content."))

    # Keyword count
    kw_count = features.get("suspiciousKeywords", 0)
    if kw_count >= 3:
        results.append((
            f"Multiple phishing keywords ({kw_count})",
            min(40, kw_count * 12),
            f"{kw_count} social engineering keywords detected."
        ))
    elif kw_count >= 1:
        results.append((
            f"Social engineering keywords ({kw_count})",
            kw_count * 10,
            f"{kw_count} suspicious keyword(s) in message content."
        ))

    # Embedded URLs
    urls = features.get("urlsCount", 0)
    if urls > 0:
        base_score = 20 if scan_type == "Email" else 30
        results.append((
            f"Embedded URLs found ({urls})",
            base_score,
            f"{urls} URL(s) embedded in message — common phishing delivery vector."
        ))

    # High entropy
    if features.get("entropy", 0) > 5.2:
        results.append((
            "High message entropy",
            10,
            "Unusual character distribution in message — possible obfuscation."
        ))

    return results


# ─── Homograph Detection ──────────────────────────────────────────────────────

def _detect_homograph(domain: str) -> bool:
    """Detect visually confusable Unicode characters in domain."""
    try:
        # If domain contains non-ASCII, it might be a homograph attack
        domain.encode("ascii")
    except UnicodeEncodeError:
        return True

    # Check for Cyrillic/Greek lookalikes encoded as Punycode
    for char, latin_equiv in HOMOGRAPH_MAP.items():
        if char in domain:
            return True

    return False
