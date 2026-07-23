"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import {
  Lock, AlertTriangle,
  Calendar, Activity, CheckCircle2,
  XCircle, Info, Cpu, Shield
} from "lucide-react";

interface ThreatIntelPanelProps {
  intel: any; // Accepts both legacy frontend ThreatIntelData and new backend response
}

export default function ThreatIntelPanel({ intel }: ThreatIntelPanelProps) {
  // Support both legacy (from analyzeThreatIntel.ts) and new (from backend) formats
  const whois = intel?.whois || {};
  const ssl = intel?.ssl || {};

  // Derive display fields from either format
  const domainAgeDays: number = whois.domain_age_days ?? whois.domainAgeDays ?? 0;
  const isRecentDomain: boolean = whois.is_recent_domain ?? whois.isRecentDomain ?? false;
  const registrar: string = whois.registrar ?? "Data unavailable";
  const creationDate: string = whois.creation_date ?? whois.creationDate ?? "Data unavailable";
  const expirationDate: string = whois.expiration_date ?? whois.expirationDate ?? "Data unavailable";
  const dnssec: string = whois.dnssec ?? "Data unavailable";
  const nameServers: string[] = whois.name_servers ?? [];
  const whoisAvailable: boolean = whois.available ?? whois.isAvailable ?? false;
  const whoisIndicators: any[] = whois.indicators ?? [];
  const whoisScore: number = whois.whois_score ?? 0;

  const hasSSL: boolean = ssl.has_ssl ?? ssl.isValid ?? false;
  const isHttps: boolean = ssl.is_https ?? ssl.isValid ?? false;
  const sslIssuer: string = ssl.issuer_org ?? ssl.issuer ?? "Data unavailable";
  const sslSubject: string = ssl.subject ?? "N/A";
  const sslValidTo: string = ssl.valid_to ?? ssl.validTo ?? "N/A";
  const sslValidFrom: string = ssl.valid_from ?? ssl.validFrom ?? "N/A";
  const tlsVersion: string = ssl.tls_version ?? ssl.protocol ?? "N/A";
  const isSelfSigned: boolean = ssl.is_self_signed ?? ssl.isSelfSigned ?? false;
  const isExpired: boolean = ssl.is_expired ?? false;
  const daysToExpiry: number = ssl.days_to_expiry ?? ssl.daysToExpiry ?? 0;
  // ssl_score used server-side for risk weighting
  const sslIndicators: any[] = ssl.indicators ?? [];

  const domain: string = intel?.domain ?? whois?.domain ?? "Unknown";
  const isHighRisk = isRecentDomain || isSelfSigned || isExpired || whoisScore > 30;

  const getIndicatorIcon = (type: string) => {
    if (type === "CRITICAL") return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    if (type === "WARNING") return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />;
    return <Info className="w-3.5 h-3.5 text-blue-400" />;
  };

  const getIndicatorClass = (type: string) => {
    if (type === "CRITICAL") return "bg-red-500/10 border-red-500/20 text-red-300";
    if (type === "WARNING") return "bg-yellow-500/10 border-yellow-500/20 text-yellow-300";
    return "bg-blue-500/10 border-blue-500/20 text-blue-300";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel p-6 border border-glass-border space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-glass-border pb-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Threat Intelligence
          </h3>
          <p className="text-xs text-foreground/50 mt-0.5">
            WHOIS RDAP &amp; SSL Certificate Analysis for <span className="font-mono text-foreground/70">{domain}</span>
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
          isHighRisk
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : "bg-green-500/10 border-green-500/30 text-green-400"
        }`}>
          {isHighRisk ? "Risk Indicators" : "Clean Telemetry"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* WHOIS Domain Intelligence */}
        <div className={`p-4 rounded-xl border space-y-3 ${
          isRecentDomain ? "bg-yellow-500/5 border-yellow-500/20" : "bg-white/5 border-white/10"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold">WHOIS Domain Age</span>
            </div>
            {isRecentDomain && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Newly Registered
              </span>
            )}
          </div>

          {whoisAvailable ? (
            <div className="space-y-1.5">
              <p className="text-xl font-bold">
                {domainAgeDays > 0 ? `${domainAgeDays} Days Old` : "< 1 Day Old"}
              </p>
              <div className="grid grid-cols-1 gap-1 text-xs text-foreground/60">
                <span><b>Registrar:</b> {registrar}</span>
                <span><b>Created:</b> {creationDate}</span>
                <span><b>Expires:</b> {expirationDate}</span>
                <span><b>DNSSEC:</b> {dnssec}</span>
                {nameServers.length > 0 && (
                  <span><b>NS:</b> {nameServers[0]}{nameServers.length > 1 ? ` +${nameServers.length - 1}` : ""}</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-foreground/50">
              {whois.message || "WHOIS data unavailable for this domain."}
            </p>
          )}

          {/* WHOIS Indicators */}
          {whoisIndicators.length > 0 && (
            <div className="space-y-1">
              {whoisIndicators.map((ind: any, i: number) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-[11px] border ${getIndicatorClass(ind.type)}`}>
                  {getIndicatorIcon(ind.type)}
                  <span><b>{ind.name}:</b> {ind.detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SSL Certificate Analysis */}
        <div className={`p-4 rounded-xl border space-y-3 ${
          (isSelfSigned || isExpired) ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/10"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold">SSL Certificate</span>
            </div>
            <span className={`text-xs font-mono font-bold ${
              isHttps && !isSelfSigned && !isExpired ? "text-green-400" : "text-red-400"
            }`}>
              {tlsVersion}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-foreground/60">
            <div className="flex items-center gap-2">
              {isHttps ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              )}
              <span>{isHttps ? "HTTPS Active" : "No HTTPS (Plain HTTP)"}</span>
            </div>
            {hasSSL && (
              <>
                <p><b>Issuer:</b> {sslIssuer}</p>
                <p><b>Subject:</b> {sslSubject}</p>
                <p><b>Valid From:</b> {sslValidFrom}</p>
                <p><b>Valid Until:</b> {sslValidTo}</p>
                <p><b>Expires In:</b> {daysToExpiry > 0 ? `${daysToExpiry} days` : "Expired"}</p>
                <div className="flex gap-3">
                  <span className={`flex items-center gap-1 ${isSelfSigned ? "text-red-400" : "text-green-400"}`}>
                    {isSelfSigned ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {isSelfSigned ? "Self-Signed" : "CA-Signed"}
                  </span>
                  <span className={`flex items-center gap-1 ${isExpired ? "text-red-400" : "text-green-400"}`}>
                    {isExpired ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {isExpired ? "Expired" : "Valid"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* SSL Indicators */}
          {sslIndicators.length > 0 && (
            <div className="space-y-1">
              {sslIndicators.map((ind: any, i: number) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-[11px] border ${getIndicatorClass(ind.type)}`}>
                  {getIndicatorIcon(ind.type)}
                  <span><b>{ind.name}:</b> {ind.detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ML Engine Status */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold">ML Engine</span>
          </div>
          <p className="text-xs text-foreground/60">
            Scikit-Learn Random Forest Classifier (GridSearchCV tuned). Analyzes 7 URL features 
            including entropy, subdomain depth, keyword density, HTTPS usage, and IP detection.
          </p>
          <div className="mt-2 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[11px] text-purple-400 font-semibold">Active — Real-time inference</span>
          </div>
        </div>

        {/* Rule Engine Status */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold">Rule Engine</span>
          </div>
          <p className="text-xs text-foreground/60">
            20+ heuristic rules: IP-based URLs, typosquatting (Levenshtein), homograph attacks,
            URL shorteners, suspicious TLDs, brand impersonation, credential harvesting patterns,
            and encoding obfuscation.
          </p>
          <div className="mt-2 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] text-green-400 font-semibold">Active — 20+ rules loaded</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
