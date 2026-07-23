"use client";

import { motion } from "framer-motion";
import { Hash, Globe, Link2, Shield, Lock, ShieldAlert } from "lucide-react";

export interface ExtractedFeatures {
  urlLength: number;
  subdomains: number;
  hasIpAddress: boolean;
  isHttps: boolean;
  suspiciousKeywords: number;
  specialChars: number;
  hyphenCount: number;
  digitCount: number;
  entropy: number;
  tld: string;
}

export default function FeatureExtraction({ features }: { features: ExtractedFeatures }) {
  const items = [
    { label: "URL Length", value: features.urlLength, icon: Link2, highlight: features.urlLength > 75 },
    { label: "Subdomains", value: features.subdomains, icon: Globe, highlight: features.subdomains > 2 },
    { label: "IP Address", value: features.hasIpAddress ? "Yes" : "No", icon: Hash, highlight: features.hasIpAddress },
    { label: "HTTPS", value: features.isHttps ? "Yes" : "No", icon: features.isHttps ? Lock : ShieldAlert, highlight: !features.isHttps },
    { label: "Suspicious Words", value: features.suspiciousKeywords, icon: ShieldAlert, highlight: features.suspiciousKeywords > 0 },
    { label: "Hyphen Count", value: features.hyphenCount, icon: Hash, highlight: features.hyphenCount > 2 },
    { label: "TLD", value: features.tld, icon: Globe, highlight: false },
    { label: "Entropy", value: features.entropy.toFixed(2), icon: Shield, highlight: features.entropy > 4.5 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 border border-glass-border h-full"
    >
      <h3 className="font-semibold text-lg mb-4">Extracted Features</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              item.highlight 
                ? "bg-red-500/10 border-red-500/20" 
                : "bg-white/5 border-white/5"
            }`}
          >
            <div className={`p-1.5 rounded-md ${item.highlight ? "bg-red-500/20 text-red-400" : "bg-white/10 text-foreground/70"}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-foreground/50 uppercase tracking-wider">{item.label}</p>
              <p className={`text-sm font-semibold ${item.highlight ? "text-red-400" : "text-foreground"}`}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
