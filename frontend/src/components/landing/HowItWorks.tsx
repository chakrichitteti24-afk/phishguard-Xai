"use client";

import { motion } from "framer-motion";
import { Cloud, Cpu, Database, ShieldAlert } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      title: "Upload Payload",
      description: "Submit a suspicious URL, email snippet, or image containing a QR code.",
      icon: <Cloud className="w-8 h-8 text-primary" />,
    },
    {
      title: "AI Analysis",
      description: "Our ML models dissect the payload structure, semantics, and visual elements.",
      icon: <Cpu className="w-8 h-8 text-secondary" />,
    },
    {
      title: "Threat Intel Sync",
      description: "Cross-referencing with global databases (VirusTotal, PhishTank, WHOIS).",
      icon: <Database className="w-8 h-8 text-primary" />,
    },
    {
      title: "XAI Risk Report",
      description: "Get a plain-english explanation of the threat and actionable prevention tips.",
      icon: <ShieldAlert className="w-8 h-8 text-secondary" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg text-foreground/70">
            A seamless 4-step pipeline turning unknown payloads into actionable, human-readable threat intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/20 via-secondary/50 to-primary/20 -translate-y-1/2 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-2xl glass-panel flex items-center justify-center mb-6 shadow-xl relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl group-hover:bg-primary/20 transition-colors" />
                <div className="relative z-10">{step.icon}</div>
                
                {/* Step Number Badge */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background border border-glass-border flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-foreground/60 text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
