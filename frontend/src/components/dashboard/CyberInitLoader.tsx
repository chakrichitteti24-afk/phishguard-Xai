"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Terminal, Shield, CheckCircle2, Cpu, Zap, X } from "lucide-react";

export default function CyberInitLoader({ onComplete }: { onComplete?: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hasInitialized = sessionStorage.getItem("cipherflux_initialized");
    if (hasInitialized) {
      setVisible(false);
      if (onComplete) onComplete();
      return;
    }

    const sequence = [
      "▶ INITIALIZING PHISHGUARD XAI THREAT SUITE...",
      "▶ DEVELOPED BY CIPHERFLUX LABS — CYBERSECURITY TELEMETRY ENGINE",
      "▶ LOADING HEURISTIC MATRIX: 20+ RULES (TYPOSQUATTING, HOMOGRAPH, CREDENTIAL HARVESTING)",
      "▶ INITIALIZING ZERO-DEPENDENCY WHOIS RDAP & TLS PROBER...",
      "▶ CONNECTING GROQ LLAMA-3.3-70B XAI EXPLANATION ENGINE...",
      "✔ CIPHERFLUX SECURITY MATRIX FULLY OPERATIONAL."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < sequence.length) {
        const line = sequence[currentStep];
        setLogs((prev) => [...prev, line]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDone(true);
        sessionStorage.setItem("cipherflux_initialized", "true");
        setTimeout(() => {
          setVisible(false);
          if (onComplete) onComplete();
        }, 800);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#030712] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10 font-mono relative overflow-hidden">
        {/* Terminal Top Bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-cyan-400 tracking-wider">
              CIPHERFLUX LABS // BOOT SYSTEM v2.5
            </span>
          </div>
          <button 
            onClick={() => {
              sessionStorage.setItem("cipherflux_initialized", "true");
              setVisible(false);
              if (onComplete) onComplete();
            }}
            className="text-foreground/40 hover:text-foreground text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Terminal Logs */}
        <div className="space-y-2 text-xs min-h-[160px] text-green-400">
          {logs.map((log, index) => (
            <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <span>{log}</span>
            </div>
          ))}
          {!isDone && (
            <div className="flex items-center gap-1 text-cyan-400 animate-pulse">
              <span className="w-2 h-4 bg-cyan-400 block" />
            </div>
          )}
        </div>

        {/* Footer Credit */}
        <div className="border-t border-cyan-500/20 pt-3 mt-4 flex items-center justify-between text-[11px] text-foreground/50">
          <span className="text-cyan-400/80 font-bold">CipherFlux Security Platform</span>
          <span className="text-green-400">{isDone ? "BOOT COMPLETE" : "INITIALIZING ENGINE..."}</span>
        </div>
      </div>
    </div>
  );
}
