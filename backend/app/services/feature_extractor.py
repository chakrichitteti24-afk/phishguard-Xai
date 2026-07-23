"""
Feature Extractor — Production-grade URL & Text feature extraction.
Extracts 20+ URL features matching the ML model's expected input vector.
"""
import math
import re
from urllib.parse import urlparse, parse_qs, unquote


# ─── Constants ───────────────────────────────────────────────────────────────

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "ow.ly",
    "buff.ly", "adf.ly", "bitly.com", "rb.gy", "cutt.ly", "short.io",
    "snip.ly", "bl.ink", "rebrand.ly", "su.pr", "fur.ly", "mcaf.ee",
    "links.co", "s.id", "n9.cl", "clck.ru", "clickmeter.com",
}

SUSPICIOUS_KEYWORDS = [
    "login", "signin", "sign-in", "logon", "verify", "verification",
    "update", "secure", "security", "account", "banking", "auth",
    "authentication", "confirm", "confirmation", "password", "passwd",
    "credential", "free", "gift", "paypal", "apple", "microsoft",
    "google", "amazon", "facebook", "netflix", "wallet", "bitcoin",
    "crypto", "recover", "reset", "unlock", "suspended", "alert",
    "urgent", "expire", "click-here", "click_here", "limited",
    "exclusive", "claim", "prize", "winner", "payment", "otp", "kyc",
]

BANKING_KEYWORDS = [
    "bank", "banking", "netbanking", "onlinebank", "bankofamerica",
    "wellsfargo", "citi", "chase", "barclays", "hsbc", "sbi",
    "icici", "hdfc", "axis", "ubi", "rbl", "kotak", "indusind",
]

SUSPICIOUS_TLDS = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq", "info", "click",
    "link", "online", "site", "website", "win", "download", "stream",
    "review", "loan", "science", "work", "party", "trade", "date",
    "racing", "bid", "webcam", "accountant", "faith", "cricket",
    "men", "gdn", "kim", "country", "pw", "zip",
}

TOP_BRANDS = [
    "paypal", "apple", "microsoft", "google", "amazon", "facebook",
    "instagram", "twitter", "linkedin", "netflix", "bankofamerica",
    "wellsfargo", "citi", "chase", "hsbc", "sbi", "icici",
    "dropbox", "icloud", "outlook", "yahoo", "ebay", "whatsapp",
]


# ─── Entropy ─────────────────────────────────────────────────────────────────

def calculate_entropy(text: str) -> float:
    """Shannon Entropy: H(X) = -Σ P(x) * log2(P(x))"""
    if not text:
        return 0.0
    freq = {}
    for c in text:
        freq[c] = freq.get(c, 0) + 1
    length = len(text)
    return round(-sum((f / length) * math.log2(f / length) for f in freq.values()), 4)


# ─── URL Feature Extraction ───────────────────────────────────────────────────

def extract_url_features(url: str) -> dict:
    """
    Extracts 20+ production-grade URL features.
    The first 7 features match the ML model's expected input vector exactly:
      [urlLength, domainLength, subdomains, hasIpAddress, isHttps, entropy, suspiciousKeywords]
    """
    # Normalize URL
    if "://" not in url:
        url = "http://" + url

    try:
        parsed = urlparse(url)
    except Exception:
        return _empty_url_features()

    full_domain = parsed.netloc or ""
    domain = full_domain.split(":")[0].lower()  # Strip port
    path = parsed.path or ""
    query_string = parsed.query or ""
    fragment = parsed.fragment or ""

    # Domain parts
    domain_parts = domain.split(".")
    tld = domain_parts[-1] if len(domain_parts) > 1 else ""
    # Subdomains = number of dots in host (e.g. "a.b.c.com" → 3 dots, 2 subdomains)
    subdomain_count = max(0, len(domain_parts) - 2)

    # IP detection
    ip_pattern = re.compile(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")
    has_ip = bool(ip_pattern.match(domain))

    # HTTPS
    is_https = parsed.scheme == "https"

    # Keyword detection (only on path + query, not domain name itself if it IS the brand)
    # This prevents google.com from self-flagging "google" as a keyword
    root_domain = ".".join(domain_parts[-2:]) if len(domain_parts) >= 2 else domain
    path_and_query = (path + "?" + query_string).lower()

    # Detect keywords in path+query for known domains, full URL for unknown ones
    keyword_check_target = url.lower()
    # If the URL is a major legitimate brand domain, only check path/query
    known_safe_roots = {
        "google.com", "microsoft.com", "apple.com", "amazon.com",
        "facebook.com", "instagram.com", "twitter.com", "linkedin.com",
        "netflix.com", "paypal.com", "dropbox.com", "outlook.com",
        "yahoo.com", "ebay.com", "github.com", "stackoverflow.com",
    }
    if root_domain in known_safe_roots:
        keyword_check_target = path_and_query

    keyword_matches = [kw for kw in SUSPICIOUS_KEYWORDS if kw in keyword_check_target]
    banking_matches = [kw for kw in BANKING_KEYWORDS if kw in keyword_check_target]

    # Query parameters
    qs_params = parse_qs(query_string)

    # Encoded characters
    encoded_count = url.count("%")

    # Port
    port = parsed.port  # None if default

    # Special chars in domain
    special_chars_domain = len(re.findall(r"[^a-zA-Z0-9.\-]", domain))

    # Path depth
    path_depth = len([p for p in path.split("/") if p])

    # Hyphens and digits in domain
    hyphens_in_domain = domain.count("-")
    digits_in_domain = sum(c.isdigit() for c in domain)

    # Check for @ symbol (redirect obfuscation)
    has_at_sign = "@" in url

    # Check for double slash after path start
    has_double_slash = "//" in path

    return {
        # ── Core 7 Features (ML model input vector) ──
        "urlLength": len(url),
        "domainLength": len(domain),
        "subdomains": subdomain_count,
        "hasIpAddress": has_ip,
        "isHttps": is_https,
        "entropy": calculate_entropy(url),
        "suspiciousKeywords": len(keyword_matches),

        # ── Extended Features ──
        "tld": tld,
        "hyphensInDomain": hyphens_in_domain,
        "digitsInDomain": digits_in_domain,
        "queryParams": len(qs_params),
        "encodedCharacters": encoded_count,
        "pathDepth": path_depth,
        "hasAtSign": has_at_sign,
        "hasDoubleSlash": has_double_slash,
        "hasFragment": bool(fragment),
        "hasPort": port is not None,
        "port": port or 0,
        "isShortener": domain in URL_SHORTENERS,
        "bankingKeywords": len(banking_matches),
        "specialCharsInDomain": special_chars_domain,
        "domainParts": len(domain_parts),
        "isHttpsFlag": 1 if is_https else 0,
        "keywordMatches": keyword_matches[:10],  # Cap for JSON size
    }


def extract_text_features(text: str) -> dict:
    """Extracts features from free-text payloads (Email, SMS, WhatsApp, Image OCR)."""
    text_lower = text.lower()

    suspicious_kws = [
        "urgent", "verify", "otp", "password", "bank", "account",
        "locked", "suspended", "prize", "winner", "kyc", "investment",
        "crypto", "delivery", "package", "click", "confirm", "login",
        "update", "secure", "alert", "expire", "unusual", "unauthorized",
    ]
    keyword_matches = [kw for kw in suspicious_kws if kw in text_lower]

    urls_in_text = re.findall(r"(https?://[^\s<>\"']+)", text)
    phone_numbers = re.findall(r"\+?\d[\d\s\-]{9,14}\d", text)

    return {
        "textLength": len(text),
        "suspiciousKeywords": len(keyword_matches),
        "urlsCount": len(urls_in_text),
        "urls": urls_in_text[:10],
        "phoneNumbersCount": len(phone_numbers),
        "entropy": calculate_entropy(text),
    }


def _empty_url_features() -> dict:
    return {
        "urlLength": 0, "domainLength": 0, "subdomains": 0,
        "hasIpAddress": False, "isHttps": False, "entropy": 0.0,
        "suspiciousKeywords": 0, "tld": "", "hyphensInDomain": 0,
        "digitsInDomain": 0, "queryParams": 0, "encodedCharacters": 0,
        "pathDepth": 0, "hasAtSign": False, "hasDoubleSlash": False,
        "hasFragment": False, "hasPort": False, "port": 0,
        "isShortener": False, "bankingKeywords": 0,
        "specialCharsInDomain": 0, "domainParts": 0, "isHttpsFlag": 0,
        "keywordMatches": [],
    }
