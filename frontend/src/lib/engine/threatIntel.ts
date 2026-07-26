/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import tls from "tls";

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

const whoisCache = new Map<string, { data: WhoisDomainData; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

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
      return {
        registrar: "Data unavailable (RDAP lookup failed)",
        creationDate: "Data unavailable",
        expirationDate: "Data unavailable",
        domainAgeDays: 0,
        isRecentDomain: false,
        isAvailable: false,
      };
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
      return {
        registrar: registrarName || "Data unavailable",
        creationDate: "Data unavailable",
        expirationDate: expirationDateStr ? new Date(expirationDateStr).toISOString().slice(0, 10) : "Data unavailable",
        domainAgeDays: 0,
        isRecentDomain: false,
        isAvailable: true,
      };
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
    return {
      registrar: "Data unavailable (Network error)",
      creationDate: "Data unavailable",
      expirationDate: "Data unavailable",
      domainAgeDays: 0,
      isRecentDomain: false,
      isAvailable: false,
    };
  }
}

export async function checkSslCertificate(domain: string): Promise<SslCertData> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect({
        host: domain,
        port: 443,
        servername: domain,
        timeout: 3000,
      }, () => {
        const cert = socket.getPeerCertificate();
        if (!cert || Object.keys(cert).length === 0) {
          socket.end();
          resolve(getEmptySsl());
          return;
        }

        const validTo = new Date(cert.valid_to);
        const validFrom = new Date(cert.valid_from);
        const daysToExpiry = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const rawIssuer = cert.issuer.O || cert.issuer.CN || "Unknown Issuer";
        const issuer = Array.isArray(rawIssuer) ? rawIssuer.join(", ") : rawIssuer;

        socket.end();
        resolve({
          issuer,
          validFrom: validFrom.toISOString().slice(0, 10),
          validTo: validTo.toISOString().slice(0, 10),
          protocol: socket.getProtocol() || "TLS",
          isSelfSigned: cert.issuer.CN === cert.subject.CN,
          isValid: socket.authorized,
          daysToExpiry: Math.max(0, daysToExpiry),
          isAvailable: true,
        });
      });

      socket.on("error", () => {
        resolve(getEmptySsl());
      });

      socket.on("timeout", () => {
        socket.destroy();
        resolve(getEmptySsl());
      });
    } catch {
      resolve(getEmptySsl());
    }
  });
}

function getEmptySsl(): SslCertData {
  return {
    issuer: "Data unavailable",
    validFrom: "N/A",
    validTo: "N/A",
    protocol: "HTTP",
    isSelfSigned: false,
    isValid: false,
    daysToExpiry: 0,
    isAvailable: false,
  };
}

export async function gatherThreatIntel(url: string) {
  let domain = url;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `http://${url}`);
    domain = parsed.hostname;
  } catch {
    domain = url.split("/")[0];
  }

  const [whois, ssl] = await Promise.all([
    fetchRealWhois(domain),
    checkSslCertificate(domain),
  ]);

  return {
    domain,
    whois,
    ssl,
    virusTotal: {
      malicious: 0,
      suspicious: 0,
      harmless: 0,
      totalEngines: 0,
      reputationScore: 0,
      isAvailable: false,
      statusMessage: "Data unavailable (API key required)",
    },
    googleSafeBrowsing: {
      status: "Data unavailable",
      isBlacklisted: false,
      isAvailable: false,
    },
    ipReputation: {
      ip: "Data unavailable",
      country: "N/A",
      countryCode: "",
      city: "N/A",
      asn: "N/A",
      abuseScore: 0,
      blacklists: { phishTank: false, spamhaus: false, abuseIPDB: false },
      isAvailable: false,
    },
  };
}

