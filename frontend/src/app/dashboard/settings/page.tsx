"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import {
  Settings, Key, ShieldCheck, Database, RefreshCw,
  CheckCircle2, Activity, AlertTriangle, XCircle, Server, Terminal, Cpu
} from "lucide-react";

interface HealthReport {
  timestamp: string;
  overallStatus: "HEALTHY" | "DEGRADED" | "CRITICAL";
  services: {
    nextEngine: { status: string; message: string };
    ruleEngine: { status: string; message: string };
    groqXAI: { status: string; message: string };
  };
  engineInfo?: {
    developer: string;
    version: string;
    mode: string;
  };
}

export default function SettingsPage() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error("Health check failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OK":
      case "HEALTHY":
      case "CONFIGURED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>;
      case "DEGRADED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Degraded</span>;
      case "MISSING_KEY":
      case "CRITICAL":
      case "ERROR":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Action Required</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-foreground/70">Unknown</span>;
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Security & System Diagnostics
        </h1>
        <p className="text-sm text-foreground/50">
          PhishGuard XAI Engine Telemetry &amp; System Configuration — <span className="text-primary font-mono font-semibold">CipherFlux Labs</span>
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Left Column - General Settings */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" /> Engine Specifications
          </h2>

          {/* Groq Key Card */}
          <div className="glass-panel p-6 border border-glass-border space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base">Groq LLaMA-3.3 AI XAI Key</h3>
            </div>
            <p className="text-xs text-foreground/60">
              Powers real-time SOC explainable AI reasoning &amp; natural language security explanations.
            </p>

            <div className="p-3 rounded-xl bg-white/5 border border-glass-border text-xs font-mono text-green-400 flex items-center justify-between">
              <span>GROQ_API_KEY Operational</span>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
          </div>

          {/* CipherFlux Engine Info */}
          <div className="glass-panel p-6 border border-glass-border space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-base">Engine Architecture</h3>
            </div>
            <div className="space-y-2 text-xs text-foreground/70 font-mono">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Developer:</span>
                <span className="text-primary font-bold">CipherFlux Labs</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Architecture:</span>
                <span className="text-foreground font-semibold">Unified Next.js Serverless Engine</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Intelligence Modules:</span>
                <span className="text-foreground font-semibold">Heuristics + RDAP + TLS + Groq LLaMA-3.3</span>
              </div>
            </div>
          </div>

          {/* Local Storage Management */}
          <div className="glass-panel p-6 border border-glass-border space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-base">Scan Telemetry Database</h3>
            </div>
            <p className="text-xs text-foreground/60">
              Scan records are saved in your local browser environment for maximum privacy and zero latency.
            </p>

            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear all scan history?")) {
                  localStorage.removeItem("phishguard_scan_history_v2");
                  window.location.reload();
                }
              }}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
            >
              Clear Local Scan History
            </button>
          </div>
        </div>

        {/* Right Column - System Diagnostics */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-foreground/70" /> System Diagnostics
            </h2>
            <button
              onClick={fetchHealth}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-glass-border text-[11px] font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} /> Refresh Telemetry
            </button>
          </div>

          {!report && isLoading && (
            <div className="glass-panel p-8 flex items-center justify-center border border-glass-border">
              <RefreshCw className="w-6 h-6 animate-spin text-primary/50" />
            </div>
          )}

          {report && (
            <div className="space-y-4">
              {/* Overall Banner */}
              <div className={`p-5 rounded-2xl border glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                report.overallStatus === "HEALTHY" ? "border-green-500/30 bg-green-500/5" :
                report.overallStatus === "DEGRADED" ? "border-yellow-500/30 bg-yellow-500/5" :
                "border-red-500/30 bg-red-500/5"
              }`}>
                <div>
                  <p className="text-[10px] text-foreground/50 uppercase tracking-wider font-semibold">Engine Health Status</p>
                  <h2 className="text-lg font-bold mt-0.5 flex items-center gap-2">
                    {report.overallStatus}
                  </h2>
                  <p className="text-[11px] text-foreground/60 mt-0.5">Last ping: {new Date(report.timestamp).toLocaleTimeString()}</p>
                </div>
                {getStatusBadge(report.overallStatus)}
              </div>

              {/* Service Cards (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Next.js Local Engine Card */}
                <div className="glass-panel p-4 border border-glass-border space-y-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">Next.js Core Engine</h3>
                    </div>
                    <div>{getStatusBadge(report.services.nextEngine?.status || "OK")}</div>
                  </div>
                  <p className="text-[11px] text-foreground/70 line-clamp-2">{report.services.nextEngine?.message}</p>
                </div>

                {/* Rule Engine Card */}
                <div className="glass-panel p-4 border border-glass-border space-y-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                      <h3 className="font-semibold text-sm">20+ Rule Engine</h3>
                    </div>
                    <div>{getStatusBadge(report.services.ruleEngine?.status || "OK")}</div>
                  </div>
                  <p className="text-[11px] text-foreground/70 line-clamp-2">{report.services.ruleEngine?.message}</p>
                </div>

                {/* Groq XAI Card */}
                <div className="glass-panel p-4 border border-glass-border space-y-2 sm:col-span-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <h3 className="font-semibold text-sm">Groq LLaMA-3.3 XAI Module</h3>
                    </div>
                    <div>{getStatusBadge(report.services.groqXAI?.status || "OK")}</div>
                  </div>
                  <p className="text-[11px] text-foreground/70 line-clamp-2">{report.services.groqXAI?.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
