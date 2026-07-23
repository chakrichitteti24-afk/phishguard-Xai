/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export interface VirusTotalStats {
  malicious: number;
  suspicious: number;
  harmless: number;
  totalEngines: number;
  reputationScore: number;
  isAvailable: boolean;
  statusMessage: string;
}

export interface GoogleSafeBrowsingStatus {
  status: string;
  isBlacklisted: boolean;
  isAvailable: boolean;
}

export interface WhoisDomainData {
  registrar: string;
  creationDate: string;
  expirationDate: string;
  domainAgeDays: number;
  isRecentDomain: boolean;
  isAvailable: boolean;
}

export interface SslCertData {
  issuer: string;
  validFrom: string;
  validTo: string;
  protocol: string;
  isSelfSigned: boolean;
  isValid: boolean;
  daysToExpiry: number;
  isAvailable: boolean;
}

export interface IpReputationData {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  asn: string;
  abuseScore: number;
  blacklists: {
    phishTank: boolean;
    spamhaus: boolean;
    abuseIPDB: boolean;
  };
  isAvailable: boolean;
}

export interface ThreatIntelData {
  domain: string;
  virusTotal: VirusTotalStats;
  googleSafeBrowsing: GoogleSafeBrowsingStatus;
  whois: WhoisDomainData;
  ssl: SslCertData;
  ipReputation: IpReputationData;
}

// Mathematical Shannon Entropy calculation: H(X) = -sum(P(x) * log2(P(x)))
export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const len = str.length;
  const frequencies: Record<string, number> = {};

  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * (Math.log(p) / Math.LN2);
  }

  return Number(entropy.toFixed(2));
}

const whoisCache = new Map<string, { data: WhoisDomainData; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

// Perform real WHOIS RDAP HTTP lookup with 0ms in-memory caching
export async function fetchRealWhois(domain: string): Promise<WhoisDomainData> {
  const cached = whoisCache.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { Accept: "application/rdap+json, application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const fallback: WhoisDomainData = {
        registrar: "Data unavailable (RDAP lookup failed)",
        creationDate: "Data unavailable",
        expirationDate: "Data unavailable",
        domainAgeDays: 0,
        isRecentDomain: false,
        isAvailable: false,
      };
      whoisCache.set(domain, { data: fallback, timestamp: Date.now() });
      return fallback;
    }

    const data = await res.json();
    let registrationDateStr = "";
    let expirationDateStr = "";

    if (Array.isArray(data.events)) {
      for (const ev of data.events) {
        if (ev.eventAction === "registration") registrationDateStr = ev.eventDate;
        if (ev.eventAction === "expiration") expirationDateStr = ev.eventDate;
      }
    }

    let registrarName = "Unknown Registrar";
    if (Array.isArray(data.entities)) {
      const registrarEntity = data.entities.find((e: any) => Array.isArray(e.roles) && e.roles.includes("registrar"));
      if (registrarEntity && registrarEntity.vcardArray && Array.isArray(registrarEntity.vcardArray[1])) {
        const fnProp = registrarEntity.vcardArray[1].find((p: any) => p[0] === "fn");
        if (fnProp && fnProp[3]) registrarName = fnProp[3];
      }
    }

    if (!registrationDateStr) {
      const fallback: WhoisDomainData = {
        registrar: registrarName || "Data unavailable",
        creationDate: "Data unavailable",
        expirationDate: expirationDateStr ? new Date(expirationDateStr).toISOString().slice(0, 10) : "Data unavailable",
        domainAgeDays: 0,
        isRecentDomain: false,
        isAvailable: true,
      };
      whoisCache.set(domain, { data: fallback, timestamp: Date.now() });
      return fallback;
    }

    const regDate = new Date(registrationDateStr);
    const domainAgeDays = Math.max(0, Math.floor((Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24)));

    const resultData: WhoisDomainData = {
      registrar: registrarName,
      creationDate: regDate.toISOString().slice(0, 10),
      expirationDate: expirationDateStr ? new Date(expirationDateStr).toISOString().slice(0, 10) : "N/A",
      domainAgeDays,
      isRecentDomain: domainAgeDays < 30,
      isAvailable: true,
    };

    whoisCache.set(domain, { data: resultData, timestamp: Date.now() });
    return resultData;
  } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const unused = err;
    const errorFallback: WhoisDomainData = {
      registrar: "Data unavailable (Network error)",
      creationDate: "Data unavailable",
      expirationDate: "Data unavailable",
      domainAgeDays: 0,
      isRecentDomain: false,
      isAvailable: false,
    };
    whoisCache.set(domain, { data: errorFallback, timestamp: Date.now() });
    return errorFallback;
  }
}
