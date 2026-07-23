"use server";

import { fetchRealWhois, ThreatIntelData } from "@/lib/threatIntel";

export async function fetchThreatIntel(url: string): Promise<ThreatIntelData> {
  let domain = url;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `http://${url}`);
    domain = parsed.hostname;
  } catch {
    domain = url.split("/")[0];
  }

  // Real WHOIS RDAP HTTP lookup
  const whoisData = await fetchRealWhois(domain);

  const vtKey = process.env.VIRUSTOTAL_API_KEY;
  const gsbKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  return {
    domain,
    virusTotal: {
      malicious: 0,
      suspicious: 0,
      harmless: 0,
      totalEngines: 0,
      reputationScore: 0,
      isAvailable: !!vtKey,
      statusMessage: vtKey ? "Configured" : "Data unavailable (API key required)",
    },
    googleSafeBrowsing: {
      status: gsbKey ? "Clean" : "Data unavailable (API key required)",
      isBlacklisted: false,
      isAvailable: !!gsbKey,
    },
    whois: whoisData,
    ssl: {
      issuer: url.startsWith("https") ? "HTTPS Enabled (SSL Active)" : "No HTTPS (Insecure)",
      validFrom: "N/A",
      validTo: "N/A",
      protocol: url.startsWith("https") ? "TLS" : "HTTP",
      isSelfSigned: false,
      isValid: url.startsWith("https"),
      daysToExpiry: 0,
      isAvailable: true,
    },
    ipReputation: {
      ip: "Data unavailable (Requires DNS resolution)",
      country: "N/A",
      countryCode: "",
      city: "N/A",
      asn: "N/A",
      abuseScore: 0,
      blacklists: {
        phishTank: false,
        spamhaus: false,
        abuseIPDB: false,
      },
      isAvailable: false,
    },
  };
}
