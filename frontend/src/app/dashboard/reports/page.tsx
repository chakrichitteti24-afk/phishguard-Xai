"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ShieldCheck, Printer, Download, Search, FileText, CheckCircle2, AlertTriangle, XCircle, Calendar, Shield } from "lucide-react";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getScanHistory, ScanRecordItem } from "@/lib/scanHistory";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmptyState } from "@/components/ui/EmptyState";

export default function ThreatReportsPage() {
  const [history, setHistory] = useState<ScanRecordItem[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanRecordItem | null>(null);

  useEffect(() => {
    const records = getScanHistory();
    setHistory(records);
    if (records.length > 0) {
      setSelectedScan(records[0]);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const getBadgeClass = (level: string) => {
    switch (level) {
      case "Critical":
      case "High":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-green-500/10 text-green-400 border-green-500/30";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" /> Verified Threat Reports
          </h1>
          <p className="text-sm text-foreground/50">
            Generate and export official PDF threat intelligence reports from verified scan history.
          </p>
        </div>

        {selectedScan && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Threat Reports Available"
          description="Complete a scan on the URL, Email, QR, or Screenshot scanner to generate your first verified threat report."
          actionText="Run First Scan"
          actionHref="/dashboard/scan-url"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selectable Scan List Sidebar */}
          <div className="glass-panel p-4 border border-glass-border space-y-2 max-h-[700px] overflow-y-auto custom-scrollbar print:hidden">
            <h3 className="text-xs uppercase font-bold text-foreground/50 tracking-wider mb-3 px-2">Select Scan Record</h3>
            {history.map((record) => (
              <button
                key={record.id}
                onClick={() => setSelectedScan(record)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedScan?.id === record.id
                    ? "bg-primary/10 border-primary/40 text-foreground"
                    : "bg-white/5 border-white/5 text-foreground/70 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold truncate max-w-[170px]">{record.target}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeClass(record.level)}`}>
                    {record.level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-foreground/40">
                  <span>{record.type}</span>
                  <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Printable Report Preview Container */}
          {selectedScan && (
            <div className="lg:col-span-2 glass-panel p-8 border border-glass-border space-y-6 print:bg-white print:text-black print:p-0 print:border-none">
              
              {/* Header Header */}
              <div className="flex items-center justify-between border-b border-glass-border pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-6 h-6 text-primary" />
                    <span className="font-bold text-xl tracking-tight">PhishGuard XAI SOC Report</span>
                  </div>
                  <p className="text-xs text-foreground/50">Official Cybersecurity Telemetry & Threat Analysis</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-foreground/70">Report ID: #{selectedScan.id}</p>
                  <p className="text-[11px] text-foreground/40">{new Date(selectedScan.timestamp).toLocaleString()}</p>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs text-foreground/50 font-semibold mb-1">Target</p>
                  <p className="text-xs font-bold truncate">{selectedScan.target}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs text-foreground/50 font-semibold mb-1">Threat Score</p>
                  <p className="text-xl font-black text-primary">{selectedScan.score} / 100</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs text-foreground/50 font-semibold mb-1">Classification</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-block mt-1 ${getBadgeClass(selectedScan.level)}`}>
                    {selectedScan.level} ({selectedScan.category || selectedScan.type})
                  </span>
                </div>
              </div>

              {/* AI Explanation & Findings */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm border-b border-glass-border pb-2">Explainable AI (XAI) Finding Summary</h4>
                <p className="text-xs text-foreground/80 leading-relaxed p-4 rounded-xl bg-white/5 border border-white/5">
                  {selectedScan.summary}
                </p>
              </div>

              {/* Recommendations */}
              {selectedScan.recommendations && selectedScan.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm border-b border-glass-border pb-2">Security Guidance & Prevention Rules</h4>
                  <ul className="space-y-2">
                    {selectedScan.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-foreground/70 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Signoff */}
              <div className="pt-6 border-t border-glass-border flex items-center justify-between text-[11px] text-foreground/40">
                <p>Engine: Groq LLaMA-3.3 XAI Threat Pipeline</p>
                <p>PhishGuard XAI Enterprise v2.0</p>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
