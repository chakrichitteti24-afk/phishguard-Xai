"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

export interface Explanation {
  id: string;
  reason: string;
  severity: "info" | "warning" | "critical";
}

export default function ExplanationPanel({ explanations }: { explanations: Explanation[] }) {
  const getIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info": return <Info className="w-5 h-5 text-blue-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 border border-glass-border h-full"
    >
      <h3 className="font-semibold text-lg mb-1">Explainable AI Analysis</h3>
      <p className="text-xs text-foreground/50 mb-4">Why was this threat score assigned?</p>
      
      {explanations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-foreground/40">
          <CheckCircle className="w-8 h-8 mb-2 text-green-500/50" />
          <p className="text-sm">No suspicious indicators found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {explanations.map((exp, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={exp.id} 
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                exp.severity === "critical" ? "bg-red-500/5 border-red-500/20" :
                exp.severity === "warning" ? "bg-yellow-500/5 border-yellow-500/20" :
                "bg-blue-500/5 border-blue-500/20"
              }`}
            >
              <div className="mt-0.5">{getIcon(exp.severity)}</div>
              <p className="text-sm text-foreground/80">{exp.reason}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
