"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertCircle, FileWarning, Globe, ShieldAlert, History } from "lucide-react";
import Link from "next/link";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getScanHistory, ScanRecordItem } from "@/lib/scanHistory";

export default function RecentThreatsTimeline() {
  const [incidents, setIncidents] = useState<ScanRecordItem[]>([]);

  useEffect(() => {
    const history = getScanHistory();
    const highRiskOnly = history.filter((r) => r.level === "Critical" || r.level === "High" || r.level === "Medium");
    setIncidents(highRiskOnly);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-panel p-5 border border-glass-border h-full flex flex-col justify-between"
    >
      <div>
        <h3 className="font-semibold text-lg mb-1">Incident Timeline</h3>
        <p className="text-xs text-foreground/50 mb-6">High & Critical threats detected from your scans.</p>

        {incidents.length === 0 ? (
          <div className="py-12 text-center text-foreground/40 border border-dashed border-white/10 rounded-xl">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40 text-green-400" />
            <p className="text-sm font-semibold">No Security Incidents</p>
            <p className="text-xs text-foreground/40 mt-1">No high-risk threats detected in your history.</p>
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-3 space-y-6">
            {incidents.slice(0, 4).map((event) => (
              <div key={event.id} className="relative pl-6">
                <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border ${
                  event.level === "Critical" ? "border-red-500/30 bg-red-500/20 text-red-400" : "border-yellow-500/30 bg-yellow-500/20 text-yellow-400"
                } flex items-center justify-center backdrop-blur-md`}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold truncate max-w-[180px]">{event.target}</h4>
                    <span className="text-[10px] text-foreground/40">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    {event.explanations && event.explanations.length > 0
                      ? event.explanations[0].reason
                      : `${event.type} scan flagged with ${event.level} risk score of ${event.score}/100.`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/dashboard/history"
        prefetch={true}
        className="w-full mt-6 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-xs font-medium text-center block"
      >
        View Full History
      </Link>
    </motion.div>
  );
}
