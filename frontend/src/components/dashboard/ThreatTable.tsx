"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link2, Mail, QrCode, FileImage, ShieldAlert, History } from "lucide-react";
import Link from "next/link";
import { getScanHistory, ScanRecordItem } from "@/lib/scanHistory";

export default function ThreatTable() {
  const [scans, setScans] = useState<ScanRecordItem[]>([]);

  useEffect(() => {
    setScans(getScanHistory());
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "URL": return Link2;
      case "Email": return Mail;
      case "QR": return QrCode;
      case "Image": return FileImage;
      default: return Link2;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-panel p-5 border border-glass-border overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" /> Recent Threat Activity
          </h3>
          <p className="text-xs text-foreground/50 mt-1">Live log of verified analyzed payloads from scan history.</p>
        </div>
        <Link href="/dashboard/history" prefetch={true} className="text-xs text-primary hover:underline font-medium">
          View All
        </Link>
      </div>

      {scans.length === 0 ? (
        <div className="py-12 text-center text-foreground/40 border border-dashed border-white/10 rounded-xl">
          <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No Threat Activity Found</p>
          <p className="text-xs text-foreground/40 mt-1">Complete a scan using the URL or Email scanners to log results.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-foreground/60 uppercase bg-white/5 border-b border-glass-border">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg">Scan ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Risk Score</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium rounded-tr-lg">Time</th>
              </tr>
            </thead>
            <tbody>
              {scans.slice(0, 5).map((scan, i) => {
                const Icon = getTypeIcon(scan.type);
                return (
                  <tr key={scan.id} className={`border-b border-glass-border hover:bg-white/5 transition-colors ${i === scans.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-foreground/80">{scan.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs">{scan.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 truncate max-w-[150px] md:max-w-[200px]" title={scan.target}>
                      {scan.target}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${scan.score > 75 ? 'bg-red-500' : scan.score > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${scan.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-semibold">{scan.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        scan.level === 'Critical' || scan.level === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        scan.level === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                        'bg-green-500/10 border-green-500/20 text-green-400'
                      }`}>
                        {scan.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/50 whitespace-nowrap">
                      {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
