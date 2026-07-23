"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader2, ShieldCheck, Search, BrainCircuit, Activity } from "lucide-react";

export default function ScanProgress({ progress }: { progress: number }) {
  const getStageMessage = () => {
    if (progress < 25) return { text: "Resolving domain and extracting features...", icon: Search };
    if (progress < 50) return { text: "Cross-referencing global threat intel...", icon: ShieldCheck };
    if (progress < 75) return { text: "Running AI heuristic analysis...", icon: BrainCircuit };
    if (progress < 100) return { text: "Generating explainability report...", icon: Activity };
    return { text: "Analysis complete.", icon: ShieldCheck };
  };

  const CurrentIcon = getStageMessage().icon;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="glass-panel p-6 border border-glass-border flex flex-col items-center justify-center min-h-[200px]"
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          <CurrentIcon className="w-6 h-6 animate-pulse" />
        </div>
      </div>
      
      <h3 className="text-lg font-medium mb-2 animate-pulse">{getStageMessage().text}</h3>
      
      <div className="w-full max-w-md bg-white/5 rounded-full h-2 mb-2 overflow-hidden border border-white/10">
        <motion.div 
          className="bg-primary h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.5 }}
        />
      </div>
      
      <p className="text-xs text-foreground/50">{Math.round(progress)}% Complete</p>
    </motion.div>
  );
}
