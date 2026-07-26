/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const AGE_VERY_OLD = 365 * 5;
const AGE_OLD = 365 * 2;
const AGE_MATURE = 365;
const AGE_YOUNG = 180;
const AGE_VERY_NEW = 30;

const CRITICAL_OVERRIDE_RULES = [
  "Brand impersonation",
  "Typosquatting",
  "Homograph",
  "Unicode attack",
  "Credential harvesting",
  "OTP Theft",
  "Account Threat",
  "Fake Delivery",
];

const STRONG_OVERRIDE_RULES = [
  "IP-based URL",
  "Suspicious TLD",
  "@ symbol in URL",
  "Multiple phishing keywords",
];

export function correlateThreats(
  ruleScore: number,
  threatIntel: any,
  features: any,
  triggeredRules: string[] = []
) {
  const whois = threatIntel.whois || {};
  const ssl = threatIntel.ssl || {};

  const domainAge = whois.domainAgeDays || 0;
  const whoisAvail = whois.isAvailable || false;

  const sslHasSsl = ssl.isValid || ssl.isSelfSigned;
  const sslIsHttps = features.isHttps || false;
  const sslSelfSigned = ssl.isSelfSigned || false;
  const sslExpired = ssl.daysToExpiry <= 0;
  const sslValid = sslIsHttps && sslHasSsl && !sslSelfSigned && !sslExpired;

  const notes: string[] = [];
  let trustModifier = 0.0;

  let hasCriticalOverride = false;
  let hasStrongOverride = false;
  const overrideReasons: string[] = [];

  for (const rule of triggeredRules) {
    const rLower = rule.toLowerCase();
    for (const critRule of CRITICAL_OVERRIDE_RULES) {
      if (rLower.includes(critRule.toLowerCase())) {
        hasCriticalOverride = true;
        overrideReasons.push(`Critical Override: ${rule}`);
      }
    }
    for (const strongRule of STRONG_OVERRIDE_RULES) {
      if (rLower.includes(strongRule.toLowerCase())) {
        hasStrongOverride = true;
        overrideReasons.push(`Strong Indicator: ${rule}`);
      }
    }
  }

  const isOverrideActive = hasCriticalOverride || hasStrongOverride;

  if (!isOverrideActive) {
    if (whoisAvail && domainAge > 0) {
      if (domainAge >= AGE_VERY_OLD) {
        trustModifier -= 20;
        notes.push(`Established domain (${domainAge}d old, >5yr) — strong trust signal.`);
      } else if (domainAge >= AGE_OLD) {
        trustModifier -= 14;
        notes.push(`Mature domain (${domainAge}d old, >2yr) — solid trust signal.`);
      } else if (domainAge >= AGE_MATURE) {
        trustModifier -= 8;
        notes.push(`1-year-old domain (${domainAge}d) — moderate trust signal.`);
      } else if (domainAge >= AGE_YOUNG) {
        trustModifier -= 4;
        notes.push(`6-month-old domain (${domainAge}d) — slight trust benefit.`);
      }
    }

    if (sslValid) {
      trustModifier -= 8;
      notes.push("Valid CA-signed TLS certificate — reduces phishing likelihood.");
    }
  } else {
    notes.push("Trust signals (e.g. SSL, Domain Age) muted due to presence of critical/strong phishing indicators.");
  }

  if (!sslIsHttps) {
    trustModifier += 8;
    notes.push("No HTTPS — plaintext HTTP increases phishing risk.");
  } else if (sslIsHttps && sslSelfSigned) {
    trustModifier += 5;
    notes.push("HTTPS but self-signed certificate — marginal trust reduction.");
  }

  if (whoisAvail && domainAge > 0 && domainAge < AGE_VERY_NEW && ruleScore >= 20) {
    trustModifier += 18;
    notes.push(`Newly registered domain (${domainAge}d) combined with rule triggers — critical phishing pattern.`);
  }

  if (sslExpired && ruleScore >= 20) {
    trustModifier += 8;
    notes.push("Expired SSL certificate combined with phishing indicators.");
  }

  // Weightings without ML: Rules (85%), WHOIS (10%), SSL (5%)
  const ruleComp = (ruleScore / 100.0) * 85.0;
  const whoisComp = whoisAvail && domainAge > AGE_MATURE ? -5 : (whoisAvail && domainAge < AGE_VERY_NEW ? 10 : 0);
  const sslComp = sslValid ? -5 : (sslExpired || !sslIsHttps ? 5 : 0);

  const rawScore = ruleComp + whoisComp + sslComp;
  let correlatedScore = rawScore + trustModifier;

  if (hasCriticalOverride) {
    correlatedScore = Math.max(correlatedScore, 85.0);
    notes.push(...overrideReasons);
    notes.push("Critical Priority Override active: Score forced to ≥ 85 (Phishing Detected).");
  } else if (hasStrongOverride) {
    correlatedScore = Math.max(correlatedScore, 70.0);
    notes.push(...overrideReasons);
    notes.push("Strong Priority Override active: Score forced to ≥ 70 (High Risk).");
  }

  correlatedScore = Math.round(Math.min(100.0, Math.max(0.0, correlatedScore)) * 10) / 10;

  let verdict = "Safe";
  let category = "No significant threat indicators";

  if (correlatedScore >= 82) {
    verdict = "Phishing Detected";
    category = "Active phishing — do not visit";
  } else if (correlatedScore >= 65) {
    verdict = "High Risk";
    category = "Likely phishing or malicious";
  } else if (correlatedScore >= 45) {
    verdict = "Suspicious";
    category = "Multiple risk indicators present";
  } else if (correlatedScore >= 25) {
    verdict = "Low Risk";
    category = "Minor indicators — exercise caution";
  }

  let signalStrength = 0;
  if (ruleScore > 10) signalStrength += 1;
  if (whoisAvail) signalStrength += 1;
  if (sslIsHttps) signalStrength += 1;
  if (isOverrideActive) signalStrength += 2;

  const baseConfidence = 60 + (signalStrength * 8);
  const confidence = Math.round(Math.min(97.0, Math.max(50.0, baseConfidence)) * 10) / 10;

  return {
    correlated_score: correlatedScore,
    verdict: verdict,
    threat_category: category,
    confidence: confidence,
    trust_modifier: trustModifier,
    correlation_notes: notes,
    components: {
      rule_contribution: ruleComp,
      whois_contribution: whoisComp,
      ssl_contribution: sslComp,
      trust_modifier: trustModifier,
    },
    weights: {
      rule_engine: "85%",
      whois_intelligence: "10%",
      ssl_analysis: "5%",
    },
  };
}

