"use client";

import { Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ScanRecordItem } from "@/lib/scanHistory";

export interface ScanRecord {
  id: string;
  url: string;
  timestamp: Date;
  analysis: {
    score: number;
    level: "Safe" | "Low" | "Medium" | "High" | "Critical";
    confidence: number;
  };
}

export default function ScanHistory({ history }: { history: (ScanRecord | ScanRecordItem)[] }) {
  if (history.length === 0) return null;

  return (
    <div className="glass-panel p-6 border border-glass-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Session History
        </h3>
        <Link href="/dashboard/history" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
          View All <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="space-y-3">
        {history.map((record) => {
          const targetUrl = "target" in record ? record.target : record.url;
          const score = "score" in record ? record.score : record.analysis.score;
          const level = "level" in record ? record.level : record.analysis.level;
          const timeDisplay = record.timestamp instanceof Date 
            ? record.timestamp.toLocaleTimeString() 
            : new Date(record.timestamp).toLocaleTimeString();

          return (
            <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium truncate" title={targetUrl}>{targetUrl}</p>
                <p className="text-[10px] text-foreground/50 mt-1">
                  {timeDisplay} • ID: {record.id}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-[10px] font-medium border ${
                  score > 60 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : score > 30 
                      ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/10 border-green-500/20 text-green-400'
                }`}>
                  {level}
                </span>
                <Link href="/dashboard/history" className="text-foreground/40 hover:text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
