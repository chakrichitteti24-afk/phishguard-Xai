/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { URL_SHORTENERS, SUSPICIOUS_TLDS } from "./featureExtractor";

const TOP_BRANDS = [
  "paypal", "apple", "microsoft", "google", "amazon", "facebook",
  "instagram", "twitter", "linkedin", "netflix", "bankofamerica",
  "wellsfargo", "citi", "chase", "hsbc", "sbi", "icici", "hdfc",
  "dropbox", "icloud", "outlook", "yahoo", "ebay", "whatsapp",
  "coinbase", "binance", "kraken", "stripe", "square",
];

const HOMOGRAPH_MAP: Record<string, string> = {
  "а": "a", "е": "e", "і": "i", "о": "o", "р": "p",
  "с": "c", "у": "y", "х": "x", "ν": "v", "ο": "o",
};

const CREDENTIAL_HARVEST_PATTERNS = [
  /(login|signin|logon|auth|authenticate)[\-_]?page/i,
  /(verify|validate|confirm)[\-_]?(account|email|identity|phone)/i,
  /(reset|recover|restore)[\-_]?(password|passwd|pwd|credentials)/i,
  /(update|renew)[\-_]?(account|billing|payment|card)/i,
  /(account|profile)[\-_]?(suspended|locked|blocked|disabled)/i,
  /(secure|security)[\-_]?(check|verification|alert|notice)/i,
  /(click|tap)[\-_]?(here|now|immediately)/i,
];

const SMS_PHISHING_PATTERNS: Array<[RegExp, string, number]> = [
  [/\botp\b/i, "OTP Theft Indicator", 30],
  [/one[\s\-]?time[\s\-]?password/i, "OTP Theft Pattern", 30],
  [/\bkyc\b/i, "KYC Fraud Indicator", 30],
  [/pan[\s\-]?card/i, "PAN/KYC Fraud Indicator", 25],
  [/aadhaar|aadhar/i, "Aadhaar Fraud Indicator", 25],
  [/investment.*return|guaranteed.*profit/i, "Investment Scam Pattern", 25],
  [/(bitcoin|crypto|btc|eth|usdt).*profit/i, "Crypto Scam Indicator", 25],
  [/(delivery|package|parcel).*(failed|held|pending)/i, "Fake Delivery Scam", 25],
  [/(fedex|dhl|ups|usps|amazon).*(track|deliver|click)/i, "Parcel Phishing", 25],
  [/(gift|prize|reward|lottery|winner|won)/i, "Lottery/Gift Fraud", 20],
  [/(congratulations|you\.have\.won)/i, "Social Engineering Hook", 15],
  [/(bank|account).*(locked|suspended|blocked|closed)/i, "Account Threat", 30],
];

function levenshteinDistance(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function detectHomograph(domain: string): boolean {
  for (let i = 0; i < domain.length; i++) {
    const code = domain.charCodeAt(i);
    if (code > 127) return true; // Non-ASCII
  }
  for (const char of Object.keys(HOMOGRAPH_MAP)) {
    if (domain.includes(char)) return true;
  }
  return false;
}

export function evaluateRules(features: any, scanType: string, rawPayload: string) {
  let triggered: Array<[string, number, string]> = [];

  if (scanType === "URL") {
    triggered = _evaluateUrlRules(features, rawPayload);
  } else {
    triggered = _evaluateTextRules(features, rawPayload, scanType);
  }

  let totalScore = triggered.reduce((acc, t) => acc + t[1], 0);
  totalScore = Math.min(100, Math.max(0, totalScore));

  return {
    score: totalScore,
    triggered_rules: triggered.map((t) => t[0]),
    evidence: triggered.map((t) => ({ rule: t[0], score: t[1], detail: t[2] })),
  };
}

function _evaluateUrlRules(features: any, rawUrl: string): Array<[string, number, string]> {
  const results: Array<[string, number, string]> = [];
  const urlLower = rawUrl.toLowerCase();

  let domain = "";
  let path = "";
  let query = "";

  try {
    const parsed = new URL(rawUrl.includes("://") ? rawUrl : "http://" + rawUrl);
    domain = parsed.hostname;
    path = parsed.pathname.toLowerCase();
    query = parsed.search.toLowerCase();
  } catch {
    // Ignore parse errors here, handled by feature extractor
  }

  if (features.hasIpAddress) {
    results.push(["R01: IP-based URL detected", 40, "URL uses raw IP instead of domain. High phishing indicator."]);
  }

  if (features.isShortener) {
    results.push(["R02: URL shortener detected", 30, "Shortener masks actual destination. Often used in phishing campaigns."]);
  }

  const urlLen = features.urlLength || 0;
  if (urlLen > 200) {
    results.push(["R03: Extremely long URL (>200 chars)", 20, `URL length is ${urlLen} chars — excessive length conceals malicious payload.`]);
  } else if (urlLen > 100) {
    results.push(["R03: Long URL (>100 chars)", 10, `URL length is ${urlLen} chars — above normal threshold.`]);
  }

  const subdomains = features.subdomains || 0;
  if (subdomains >= 4) {
    results.push(["R04: Excessive subdomains (≥4)", 25, `Domain has ${subdomains} subdomain levels — phishing trick to hide real TLD.`]);
  } else if (subdomains === 3) {
    results.push(["R04: High subdomain depth (3)", 12, "3-level subdomain detected — common phishing pattern."]);
  }

  const tld = (features.tld || "").toLowerCase();
  if (SUSPICIOUS_TLDS.has(tld)) {
    results.push([`R05: Suspicious TLD (.${tld})`, 20, `TLD '.${tld}' is known for abuse. Free or high-abuse registry.`]);
  }

  const entropy = features.entropy || 0;
  if (entropy > 5.0) {
    results.push(["R06: Very high URL entropy (>5.0)", 20, `Entropy=${entropy.toFixed(2)}. Indicates obfuscated domain or DGA.`]);
  } else if (entropy > 4.5) {
    results.push(["R06: High URL entropy (>4.5)", 10, `Entropy=${entropy.toFixed(2)}. Above normal — possible encoded payload.`]);
  }

  const encoded = features.encodedCharacters || 0;
  if (encoded > 5) {
    results.push(["R07: Heavy URL encoding (>5 encoded chars)", 15, `${encoded} percent-encoded characters found — obfuscation attempt.`]);
  } else if (encoded > 2) {
    results.push(["R07: URL encoding detected", 8, `${encoded} percent-encoded characters found in URL.`]);
  }

  if (features.hasAtSign) {
    results.push(["R08: @ symbol in URL (redirect obfuscation)", 35, "Browser ignores everything before '@'."]);
  }

  if (features.hasDoubleSlash) {
    results.push(["R09: Double slash in URL path", 15, "Double slash '//' in path can redirect to another domain."]);
  }

  const port = features.port || 0;
  if (port && ![80, 443, 8080, 8443].includes(port)) {
    results.push([`R10: Non-standard port (${port})`, 15, `URL uses port ${port}. Phishing kits often operate on non-standard ports.`]);
  }

  const kwCount = features.suspiciousKeywords || 0;
  if (kwCount >= 3) {
    results.push([`R11: Multiple phishing keywords (${kwCount})`, 25, `${kwCount} phishing keywords found in URL — strong social engineering signal.`]);
  } else if (kwCount >= 1) {
    results.push([`R11: Phishing keyword detected (${kwCount})`, 15, `${kwCount} phishing keyword(s) in URL.`]);
  }

  const bankingKw = features.bankingKeywords || 0;
  if (bankingKw > 0) {
    results.push(["R12: Banking/financial keyword detected", 20, "URL contains banking-related keyword."]);
  }

  const hyphens = features.hyphensInDomain || 0;
  if (hyphens >= 3) {
    results.push([`R13: Many hyphens in domain (${hyphens})`, 15, `Domain contains ${hyphens} hyphens.`]);
  }

  const domainPartsList = domain.replace(/\./g, " ").replace(/-/g, " ").split(" ");
  let typosquatFound = false;
  for (const word of domainPartsList) {
    if (word.length < 4) continue;
    for (const brand of TOP_BRANDS) {
      const dist = levenshteinDistance(word, brand);
      if (dist > 0 && dist <= 2 && word !== brand) {
        results.push([`R14: Typosquatting — mimicking '${brand}' (distance=${dist})`, 35, `'${word}' is ${dist} edit(s) away from '${brand}'.`]);
        typosquatFound = true;
        break;
      }
    }
    if (typosquatFound) break;
  }

  const brandHits: string[] = [];
  for (const brand of TOP_BRANDS) {
    if (urlLower.includes(brand)) {
      if (!domain.includes(`${brand}.com`) && !domain.includes(`.${brand}.`)) {
        brandHits.push(brand);
      }
    }
  }

  if (brandHits.length > 0) {
    results.push([`R15: Brand impersonation (${brandHits.slice(0, 3).join(", ")})`, 30, `Brand name '${brandHits[0]}' appears in URL but not as legitimate domain.`]);
  }

  if (detectHomograph(domain)) {
    results.push(["R16: Homograph/Unicode attack detected", 40, "Non-ASCII lookalike characters found in domain."]);
  }

  for (const pattern of CREDENTIAL_HARVEST_PATTERNS) {
    if (pattern.test(path + query)) {
      results.push(["R17: Credential harvesting pattern detected", 25, `URL path matches known credential harvesting pattern.`]);
      break;
    }
  }

  const digits = features.digitsInDomain || 0;
  if (digits >= 5) {
    results.push([`R18: Excessive digits in domain (${digits})`, 12, `${digits} digits in domain name.`]);
  }

  const params = features.queryParams || 0;
  if (params >= 5) {
    results.push([`R19: Excessive query parameters (${params})`, 10, `${params} query parameters.`]);
  }

  if (!features.isHttps) {
    results.push(["R20: No HTTPS (plain HTTP)", 15, "URL uses insecure HTTP."]);
  }

  const seenCodes = new Set<string>();
  const deduped: Array<[string, number, string]> = [];
  for (const item of results) {
    const code = item[0].substring(0, 3);
    if (!seenCodes.has(code)) {
      seenCodes.add(code);
      deduped.push(item);
    }
  }

  return deduped;
}

function _evaluateTextRules(features: any, rawPayload: string, scanType: string): Array<[string, number, string]> {
  const results: Array<[string, number, string]> = [];
  const payloadLower = rawPayload.toLowerCase();

  for (const [pattern, name, score] of SMS_PHISHING_PATTERNS) {
    if (pattern.test(payloadLower)) {
      results.push([name, score, `Pattern matched in message content.`]);
    }
  }

  const kwCount = features.suspiciousKeywords || 0;
  if (kwCount >= 3) {
    results.push([`Multiple phishing keywords (${kwCount})`, Math.min(40, kwCount * 12), `${kwCount} social engineering keywords detected.`]);
  } else if (kwCount >= 1) {
    results.push([`Social engineering keywords (${kwCount})`, kwCount * 10, `${kwCount} suspicious keyword(s) in message content.`]);
  }

  const urls = features.urlsCount || 0;
  if (urls > 0) {
    const baseScore = scanType === "Email" ? 20 : 30;
    results.push([`Embedded URLs found (${urls})`, baseScore, `${urls} URL(s) embedded in message.`]);
  }

  if ((features.entropy || 0) > 5.2) {
    results.push(["High message entropy", 10, "Unusual character distribution in message."]);
  }

  return results;
}

