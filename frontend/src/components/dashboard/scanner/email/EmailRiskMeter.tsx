"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertTriangle, ShieldCheck, AlertCircle, Info, ShieldAlert, KeyRound, Building, Package } from "lucide-react";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmailAnalysisResult } from "@/actions/analyzeEmail";

export default function EmailRiskMeter({ result }: { result: EmailAnalysisResult }) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Critical": return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-500", bar: "bg-red-500" };
      case "High": return { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-500", bar: "bg-orange-500" };
      case "Medium": return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-500", bar: "bg-yellow-500" };
      case "Low": return { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-500", bar: "bg-blue-500" };
      case "Safe": return { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-500", bar: "bg-green-500" };
      default: return { bg: "bg-gray-500/10", border: "border-gray-500/30", text: "text-gray-500", bar: "bg-gray-500" };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "OTP Theft": return KeyRound;
      case "Banking Scam": return Building;
      case "Delivery Scam": return Package;
      default: return ShieldAlert;
    }
  };

  const colors = getLevelColor(result.level);
  const CategoryIcon = getCategoryIcon(result.category);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-panel p-6 border ${colors.border} ${colors.bg} h-full flex flex-col justify-between relative overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bar} opacity-10 blur-3xl rounded-full`} />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs text-foreground/50 uppercase tracking-wider font-medium">Category</span>
          <div className="flex items-center gap-2 mt-1">
            <CategoryIcon className={`w-5 h-5 ${colors.text}`} />
            <span className="font-bold text-base">{result.category}</span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.border} ${colors.text}`}>
          {result.level}
        </span>
      </div>

      <div className="my-6 text-center">
        <span className="text-xs text-foreground/50 uppercase tracking-wider">Threat Score</span>
        <div className={`text-5xl font-black ${colors.text} my-1`}>{result.score}</div>
        <p className="text-xs text-foreground/60">out of 100 maximum risk rating</p>
      </div>

      <div>
        <div className="w-full bg-black/40 rounded-full h-2.5 border border-white/5 overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${colors.bar}`}
          />
        </div>
        <div className="flex justify-between text-xs text-foreground/60">
          <span>AI Confidence</span>
          <span className="font-bold text-primary">{result.confidence}%</span>
        </div>
      </div>
    </motion.div>
  );
}
