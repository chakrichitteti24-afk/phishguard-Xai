"use client";

import { motion } from "framer-motion";
import { AlertOctagon, UserX, Link, Flame } from "lucide-react";
import { EmailAnalysisResult } from "@/actions/analyzeEmail";

export default function EmailAnalysisDetails({ result }: { result: EmailAnalysisResult }) {
  const metrics = [
    {
      label: "Psychological Urgency",
      val: `${result.urgencyScore}%`,
      icon: Flame,
      color: result.urgencyScore > 70 ? "text-red-400" : result.urgencyScore > 30 ? "text-yellow-400" : "text-green-400",
      bg: result.urgencyScore > 70 ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/5",
    },
    {
      label: "Fake Sender Probability",
      val: `${result.fakeSenderRisk}%`,
      icon: UserX,
      color: result.fakeSenderRisk > 70 ? "text-red-400" : result.fakeSenderRisk > 30 ? "text-yellow-400" : "text-green-400",
      bg: result.fakeSenderRisk > 70 ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/5",
    },
    {
      label: "Suspicious Links Count",
      val: `${result.suspiciousLinkCount} Links`,
      icon: Link,
      color: result.suspiciousLinkCount > 0 ? "text-orange-400" : "text-green-400",
      bg: result.suspiciousLinkCount > 0 ? "bg-orange-500/10 border-orange-500/20" : "bg-white/5 border-white/5",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 border border-glass-border h-full flex flex-col justify-between"
    >
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <AlertOctagon className="w-5 h-5 text-primary" /> Vector Indicators
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {metrics.map((m, idx) => (
          <div key={idx} className={`p-3.5 rounded-xl border ${m.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <span className="text-[11px] text-foreground/50 font-medium">{m.label}</span>
            </div>
            <p className={`text-xl font-bold mt-1 ${m.color}`}>{m.val}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
        <p className="text-xs font-semibold text-foreground/70 mb-2">Social Engineering Pattern Summary</p>
        <p className="text-xs text-foreground/60 leading-relaxed">
          {result.score > 60
            ? "This message utilizes high-pressure urgency cues designed to trigger panic and bypass logical scrutiny. Embedded elements request immediate user action or credentials."
            : "No severe social engineering triggers detected. Message language appears conversational or informational without forced urgency."}
        </p>
      </div>
    </motion.div>
  );
}
