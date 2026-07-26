export const URL_SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "ow.ly",
  "buff.ly", "adf.ly", "bitly.com", "rb.gy", "cutt.ly", "short.io",
  "snip.ly", "bl.ink", "rebrand.ly", "su.pr", "fur.ly", "mcaf.ee",
  "links.co", "s.id", "n9.cl", "clck.ru", "clickmeter.com",
]);

export const SUSPICIOUS_TLDS = new Set([
  "tk", "ml", "ga", "cf", "gq", "icu", "top", "xyz", "club", "site",
  "vip", "wang", "win", "bid", "stream", "men", "party", "pro", "link",
  "review", "country", "kim", "science", "work", "asia", "rest", "surf"
]);

export const SUSPICIOUS_KEYWORDS = [
  "login", "signin", "sign-in", "logon", "verify", "verification",
  "update", "secure", "security", "account", "banking", "auth",
  "authentication", "confirm", "confirmation", "password", "passwd",
  "credential", "free", "gift", "paypal", "apple", "microsoft",
  "google", "amazon", "facebook", "netflix", "wallet", "bitcoin",
  "crypto", "recover", "reset", "unlock", "suspended", "alert",
  "urgent", "expire", "click-here", "click_here", "limited",
  "exclusive", "claim", "prize", "winner", "payment", "otp", "kyc",
];

export const BANKING_KEYWORDS = [
  "bank", "banking", "netbanking", "onlinebank", "bankofamerica",
  "wellsfargo", "citi", "chase", "barclays", "hsbc", "sbi",
  "icici", "hdfc", "axis", "ubi", "rbl", "kotak", "indusind",
];

export function calculateEntropy(text: string): number {
  if (!text) return 0.0;
  const freq: Record<string, number> = {};
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    freq[c] = (freq[c] || 0) + 1;
  }
  let entropy = 0;
  for (const f of Object.values(freq)) {
    const p = f / text.length;
    entropy -= p * Math.log2(p);
  }
  return parseFloat(entropy.toFixed(4));
}

export function extractUrlFeatures(url: string) {
  let normalizedUrl = url.trim();
  if (!normalizedUrl.includes("://")) {
    normalizedUrl = "http://" + normalizedUrl;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    return _emptyUrlFeatures();
  }

  const fullDomain = parsed.hostname;
  const domain = fullDomain.toLowerCase();
  const path = parsed.pathname;
  const queryString = parsed.search;
  const fragment = parsed.hash;

  const domainParts = domain.split(".");
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : "";
  const subdomains = Math.max(0, domainParts.length - 2);

  const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  const hasIp = ipPattern.test(domain);

  const isHttps = parsed.protocol === "https:";

  const rootDomain = domainParts.length >= 2 ? domainParts.slice(-2).join(".") : domain;
  const pathAndQuery = (path + queryString).toLowerCase();

  const knownSafeRoots = new Set([
    "google.com", "microsoft.com", "apple.com", "amazon.com",
    "facebook.com", "instagram.com", "twitter.com", "linkedin.com",
    "netflix.com", "paypal.com", "dropbox.com", "outlook.com",
    "yahoo.com", "ebay.com", "github.com", "stackoverflow.com",
  ]);

  const keywordCheckTarget = knownSafeRoots.has(rootDomain) ? pathAndQuery : url.toLowerCase();

  const keywordMatches = SUSPICIOUS_KEYWORDS.filter((kw) => keywordCheckTarget.includes(kw));
  const bankingMatches = BANKING_KEYWORDS.filter((kw) => keywordCheckTarget.includes(kw));

  const queryParams = Array.from(parsed.searchParams.keys()).length;
  const encodedCount = (url.match(/%/g) || []).length;
  const port = parsed.port ? parseInt(parsed.port, 10) : 0;
  const specialCharsDomain = (domain.match(/[^a-zA-Z0-9.\-]/g) || []).length;
  const pathDepth = path.split("/").filter((p) => p).length;
  const hyphensInDomain = (domain.match(/-/g) || []).length;
  const digitsInDomain = (domain.match(/\d/g) || []).length;
  const hasAtSign = url.includes("@");
  const hasDoubleSlash = path.includes("//");

  return {
    urlLength: url.length,
    domainLength: domain.length,
    subdomains: subdomains,
    hasIpAddress: hasIp,
    isHttps: isHttps,
    entropy: calculateEntropy(url),
    suspiciousKeywords: keywordMatches.length,
    tld: tld,
    hyphensInDomain: hyphensInDomain,
    digitsInDomain: digitsInDomain,
    queryParams: queryParams,
    encodedCharacters: encodedCount,
    pathDepth: pathDepth,
    hasAtSign: hasAtSign,
    hasDoubleSlash: hasDoubleSlash,
    hasFragment: !!fragment,
    hasPort: !!parsed.port,
    port: port,
    isShortener: URL_SHORTENERS.has(domain),
    bankingKeywords: bankingMatches.length,
    specialCharsInDomain: specialCharsDomain,
    domainParts: domainParts.length,
    isHttpsFlag: isHttps ? 1 : 0,
    keywordMatches: keywordMatches.slice(0, 10),
  };
}

export function extractTextFeatures(text: string) {
  const textLower = text.toLowerCase();
  const suspiciousKws = [
    "urgent", "verify", "otp", "password", "bank", "account",
    "locked", "suspended", "prize", "winner", "kyc", "investment",
    "crypto", "delivery", "package", "click", "confirm", "login",
    "update", "secure", "alert", "expire", "unusual", "unauthorized",
  ];
  const keywordMatches = suspiciousKws.filter((kw) => textLower.includes(kw));
  const urlsInText = text.match(/(https?:\/\/[^\s<>"']+)/g) || [];
  const phoneNumbers = text.match(/\+?\d[\d\s\-]{9,14}\d/g) || [];

  return {
    textLength: text.length,
    suspiciousKeywords: keywordMatches.length,
    urlsCount: urlsInText.length,
    urls: urlsInText.slice(0, 10),
    phoneNumbersCount: phoneNumbers.length,
    entropy: calculateEntropy(text),
  };
}

function _emptyUrlFeatures() {
  return {
    urlLength: 0, domainLength: 0, subdomains: 0,
    hasIpAddress: false, isHttps: false, entropy: 0.0,
    suspiciousKeywords: 0, tld: "", hyphensInDomain: 0,
    digitsInDomain: 0, queryParams: 0, encodedCharacters: 0,
    pathDepth: 0, hasAtSign: false, hasDoubleSlash: false,
    hasFragment: false, hasPort: false, port: 0,
    isShortener: false, bankingKeywords: 0,
    specialCharsInDomain: 0, domainParts: 0, isHttpsFlag: 0,
    keywordMatches: [],
  };
}
