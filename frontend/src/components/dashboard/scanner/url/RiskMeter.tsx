"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, AlertCircle, Info, ShieldAlert, Skull } from "lucide-react";

export interface RiskAnalysis {
  score: number;
  // Accepts both old 5-level and new 6-level verdict taxonomy
  level:
    | "Safe"
    | "Low Risk"
    | "Low"
    | "Suspicious"
    | "Medium"
    | "High Risk"
    | "High"
    | "Phishing Detected"
    | "Critical"
    | "Malicious"
    | string;
  confidence: number;
}

const LEVEL_CONFIG: Record<
  string,
  { bg: string; border: string; text: string; bar: string; icon: React.ElementType; label: string }
> = {
  "Safe": {
    bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400",
    bar: "bg-green-500", icon: ShieldCheck, label: "Safe",
  },
  "Low Risk": {
    bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400",
    bar: "bg-blue-500", icon: Info, label: "Low Risk",
  },
  "Low": {
    bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400",
    bar: "bg-blue-500", icon: Info, label: "Low Risk",
  },
  "Suspicious": {
    bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400",
    bar: "bg-yellow-500", icon: AlertTriangle, label: "Suspicious",
  },
  "Medium": {
    bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400",
    bar: "bg-yellow-500", icon: AlertTriangle, label: "Suspicious",
  },
  "High Risk": {
    bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400",
    bar: "bg-orange-500", icon: AlertCircle, label: "High Risk",
  },
  "High": {
    bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400",
    bar: "bg-orange-500", icon: AlertCircle, label: "High Risk",
  },
  "Phishing Detected": {
    bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400",
    bar: "bg-red-500", icon: ShieldAlert, label: "Phishing Detected",
  },
  "Critical": {
    bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400",
    bar: "bg-red-500", icon: ShieldAlert, label: "Phishing Detected",
  },
  "Malicious": {
    bg: "bg-red-900/20", border: "border-red-700/50", text: "text-red-300",
    bar: "bg-red-700", icon: Skull, label: "Malicious",
  },
};

const DEFAULT_CONFIG = LEVEL_CONFIG["Suspicious"];

export default function RiskMeter({ analysis }: { analysis: RiskAnalysis }) {
  const cfg = LEVEL_CONFIG[analysis.level] ?? DEFAULT_CONFIG;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-panel p-6 border ${cfg.border} ${cfg.bg} h-full flex flex-col justify-center items-center text-center relative overflow-hidden`}
    >
      {/* Ambient glow */}
      <div className={`absolute top-0 right-0 w-40 h-40 ${cfg.bar} opacity-10 blur-3xl rounded-full pointer-events-none`} />

      {/* Icon badge */}
      <div className={`p-4 rounded-full ${cfg.bg} border ${cfg.border} mb-4`}>
        <Icon className={`w-8 h-8 ${cfg.text}`} />
      </div>

      {/* Verdict label */}
      <h3 className="text-sm font-medium text-foreground/60 uppercase tracking-wider mb-1">
        Threat Level
      </h3>
      <div className={`text-3xl font-bold ${cfg.text} mb-1`}>{cfg.label}</div>

      {/* Numeric score */}
      <div className="text-xs text-foreground/50 mb-4">
        Risk Score: <span className={`font-bold ${cfg.text}`}>{analysis.score}</span>
        <span className="text-foreground/30">/100</span>
      </div>

      {/* Score bar */}
      <div className="w-full bg-black/40 rounded-full h-3 border border-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${analysis.score}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          className={`h-full rounded-full ${cfg.bar}`}
        />
      </div>

      {/* Threshold markers */}
      <div className="relative w-full mt-1 mb-5">
        <div className="flex justify-between text-[9px] text-foreground/30 px-0">
          <span>SAFE</span>
          <span>LOW</span>
          <span>SUSP</span>
          <span>HIGH</span>
          <span>PHISHING</span>
        </div>
      </div>

      {/* Confidence */}
      <div className="w-full pt-4 border-t border-white/10 flex justify-between items-center">
        <span className="text-xs text-foreground/60">Detection Confidence</span>
        <span className={`text-xs font-bold ${cfg.text}`}>{analysis.confidence}%</span>
      </div>
    </motion.div>
  );
}
