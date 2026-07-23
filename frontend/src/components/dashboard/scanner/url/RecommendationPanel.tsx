"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { RiskAnalysis } from "./RiskMeter";

export default function RecommendationPanel({ analysis, recommendations }: { analysis: RiskAnalysis, recommendations?: string[] }) {
  const isHighRisk = analysis.score > 60;
  
  // Default recommendations if none provided by AI
  const defaultHighRiskRecs = [
    "Block the domain in your firewall.",
    "Report to IT Security team.",
    "Run a malware scan if you clicked it."
  ];
  
  const defaultSafeRecs = [
    "Always verify the sender identity.",
    "Ensure HTTPS is active before entering credentials."
  ];

  const recsToDisplay = recommendations && recommendations.length > 0 
    ? recommendations 
    : (isHighRisk ? defaultHighRiskRecs : defaultSafeRecs);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 border border-glass-border h-full relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 ${isHighRisk ? 'bg-red-500' : 'bg-green-500'}`} />
      
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        {isHighRisk ? (
          <><ShieldAlert className="w-5 h-5 text-red-500" /> Action Required</>
        ) : (
          <><ShieldCheck className="w-5 h-5 text-green-500" /> Recommended Action</>
        )}
      </h3>

      <div className="space-y-4">
        {isHighRisk ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm font-medium text-red-200">Do not interact with this link.</p>
            <p className="text-xs text-red-300 mt-1">This URL exhibits strong indicators of phishing or malware distribution.</p>
          </div>
        ) : (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium text-green-200">Safe to proceed.</p>
            <p className="text-xs text-green-300 mt-1">No malicious indicators were found by our engines.</p>
          </div>
        )}
        
        <ul className="space-y-2">
          {recsToDisplay.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
              <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" /> 
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
