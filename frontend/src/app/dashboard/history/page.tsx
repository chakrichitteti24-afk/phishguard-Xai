"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  History, Search, Filter, Download, Trash2, X, 
  ShieldAlert, ShieldCheck, AlertTriangle, Info, 
  Link2, Mail, QrCode, FileImage, ExternalLink, CheckCircle2, ChevronRight
} from "lucide-react";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  getScanHistory, deleteScanRecord, clearScanHistory, 
  exportScanHistory, ScanRecordItem 
} from "@/lib/scanHistory";

export default function HistoryPage() {
  const [records, setRecords] = useState<ScanRecordItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedRecord, setSelectedRecord] = useState<ScanRecordItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setRecords(getScanHistory());
  }, []);

  // Filtered Records calculation
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch = 
        rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRisk = riskFilter === "ALL" || rec.level.toUpperCase() === riskFilter.toUpperCase();
      const matchesType = typeFilter === "ALL" || rec.type.toUpperCase() === typeFilter.toUpperCase();

      return matchesSearch && matchesRisk && matchesType;
    });
  }, [records, searchQuery, riskFilter, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = records.length;
    const criticalHigh = records.filter(r => r.level === "Critical" || r.level === "High").length;
    const safe = records.filter(r => r.level === "Safe").length;
    const avgScore = total > 0 ? Math.round(records.reduce((acc, curr) => acc + curr.score, 0) / total) : 0;
    return { total, criticalHigh, safe, avgScore };
  }, [records]);

  const handleDeleteOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteScanRecord(id);
    setRecords(updated);
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  const handleClearAll = () => {
    const updated = clearScanHistory();
    setRecords(updated);
    setSelectedRecord(null);
    setShowClearConfirm(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "URL": return Link2;
      case "Email": return Mail;
      case "QR": return QrCode;
      case "Image": return FileImage;
      default: return Link2;
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "Critical": return "bg-red-500/10 border-red-500/30 text-red-400";
      case "High": return "bg-orange-500/10 border-orange-500/30 text-orange-400";
      case "Medium": return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      case "Low": return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case "Safe": return "bg-green-500/10 border-green-500/30 text-green-400";
      default: return "bg-white/10 border-white/20 text-foreground/70";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
            <History className="w-6 h-6 text-primary" /> Scan History
          </h1>
          <p className="text-sm text-foreground/50">
            Persistent archive of all security scans, AI explanations, and threat assessments.
          </p>
        </div>

        {/* Global Actions: Export & Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportScanHistory("csv", filteredRecords)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 hover:border-primary/30 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-primary" /> Export CSV
          </button>
          <button
            onClick={() => exportScanHistory("json", filteredRecords)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 hover:border-primary/30 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-secondary" /> Export JSON
          </button>
          {records.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 border border-glass-border">
          <p className="text-xs text-foreground/50 font-medium">Total Saved Scans</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="glass-panel p-4 border border-red-500/20 bg-red-500/5">
          <p className="text-xs text-red-400/80 font-medium">High / Critical Threats</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.criticalHigh}</p>
        </div>
        <div className="glass-panel p-4 border border-green-500/20 bg-green-500/5">
          <p className="text-xs text-green-400/80 font-medium font-medium">Verified Safe</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{stats.safe}</p>
        </div>
        <div className="glass-panel p-4 border border-glass-border">
          <p className="text-xs text-foreground/50 font-medium">Average Risk Score</p>
          <p className="text-2xl font-bold text-primary mt-1">{stats.avgScore}/100</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 border border-glass-border flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search URL, Email, or Scan ID..."
            className="w-full bg-white/5 border border-glass-border rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-foreground/40"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground/50 hidden sm:block" />
            <span className="text-xs text-foreground/60 hidden sm:block">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-white/5 border border-glass-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="ALL" className="bg-background text-foreground">All Risk Levels</option>
              <option value="CRITICAL" className="bg-background text-foreground">Critical</option>
              <option value="HIGH" className="bg-background text-foreground">High</option>
              <option value="MEDIUM" className="bg-background text-foreground">Medium</option>
              <option value="LOW" className="bg-background text-foreground">Low</option>
              <option value="SAFE" className="bg-background text-foreground">Safe</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/60 hidden sm:block">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white/5 border border-glass-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="ALL" className="bg-background text-foreground">All Scan Types</option>
              <option value="URL" className="bg-background text-foreground">URL</option>
              <option value="EMAIL" className="bg-background text-foreground">Email</option>
              <option value="QR" className="bg-background text-foreground">QR Code</option>
              <option value="IMAGE" className="bg-background text-foreground">Screenshot</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="glass-panel border border-glass-border overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-foreground/50">
            <History className="w-12 h-12 mx-auto mb-3 text-foreground/20" />
            <p className="font-semibold text-base">No scan records found</p>
            <p className="text-xs text-foreground/40 mt-1">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-foreground/60 uppercase bg-white/5 border-b border-glass-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Scan ID</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Target / Payload</th>
                  <th className="px-4 py-3 font-medium">Risk Level</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {filteredRecords.map((rec) => {
                  const Icon = getTypeIcon(rec.type);
                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedRecord(rec)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-primary">
                        {rec.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Icon className="w-4 h-4 text-foreground/60" />
                          <span>{rec.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs truncate font-medium text-foreground/90" title={rec.target}>
                        {rec.target}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getRiskBadgeColor(rec.level)}`}>
                          {rec.level}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                rec.score > 75 ? "bg-red-500" : rec.score > 40 ? "bg-yellow-500" : "bg-green-500"
                              }`}
                              style={{ width: `${rec.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-semibold">{rec.score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-foreground/50 whitespace-nowrap">
                        {new Date(rec.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(rec);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/70 hover:text-foreground transition-colors"
                            title="Inspect Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteOne(rec.id, e)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Slide-Over Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel border border-glass-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative rounded-2xl shadow-2xl bg-background/95"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-glass-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-primary font-bold">{selectedRecord.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadgeColor(selectedRecord.level)}`}>
                      {selectedRecord.level} ({selectedRecord.score}/100)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold truncate max-w-lg">{selectedRecord.target}</h3>
                  <p className="text-xs text-foreground/50 mt-0.5">Scanned on {new Date(selectedRecord.timestamp).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 text-foreground/50 hover:text-foreground hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="py-6 space-y-6">
                {/* Confidence & Score Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-foreground/50">Risk Score</p>
                    <p className="text-2xl font-bold mt-1">{selectedRecord.score} / 100</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-foreground/50">AI Confidence</p>
                    <p className="text-2xl font-bold text-primary mt-1">{selectedRecord.confidence}%</p>
                  </div>
                </div>

                {/* XAI Explanations */}
                {selectedRecord.explanations && selectedRecord.explanations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-primary" /> Explainable AI Insights
                    </h4>
                    <div className="space-y-2">
                      {selectedRecord.explanations.map((exp) => (
                        <div
                          key={exp.id}
                          className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                            exp.severity === "critical"
                              ? "bg-red-500/10 border-red-500/20 text-red-300"
                              : exp.severity === "warning"
                              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
                              : "bg-blue-500/10 border-blue-500/20 text-blue-300"
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{exp.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Features */}
                {selectedRecord.features && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" /> Extracted Features & Metadata
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                      {Object.entries(selectedRecord.features).map(([key, val]) => (
                        <div key={key} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                          <p className="text-[10px] text-foreground/40 uppercase">{key}</p>
                          <p className="font-semibold mt-0.5 truncate">{String(val)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedRecord.recommendations && selectedRecord.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-green-400" /> Security Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {selectedRecord.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-glass-border flex justify-end gap-3">
                <button
                  onClick={() => handleDeleteOne(selectedRecord.id, { stopPropagation: () => {} } as any)}
                  className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Record
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel border border-red-500/30 p-6 rounded-2xl max-w-sm w-full bg-background/95 text-center shadow-2xl"
            >
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold">Clear All Scan History?</h3>
              <p className="text-xs text-foreground/60 mt-1 mb-6">
                This will permanently remove all saved scan results from your browser storage. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
