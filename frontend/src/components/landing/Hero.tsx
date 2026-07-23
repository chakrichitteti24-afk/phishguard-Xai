"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-cyber-grid bg-[length:30px_30px] opacity-20" />
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6 backdrop-blur-md"
          >
            <Activity className="w-4 h-4" />
            <span>PhishGuard XAI 2.0 is Live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Detect. Explain. <br className="hidden md:block" />
            <span className="text-gradient">Prevent.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl"
          >
            Zero-Day Phishing Intelligence Platform. We don&apos;t just block threats, we explain them using advanced AI reasoning. Protect your digital life with enterprise-grade multi-modal security.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/dashboard/scan-url"
              prefetch={true}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_40px_rgba(14,165,233,0.6)] hover:-translate-y-0.5"
            >
              <ShieldCheck className="w-5 h-5" />
              Scan Now
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Abstract Floating Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl glass-panel p-2 overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="aspect-[16/9] md:aspect-[21/9] bg-[#0a0f1c] rounded-xl overflow-hidden relative flex items-center justify-center">
              {/* Decorative elements representing the UI */}
              <div className="absolute top-4 left-4 right-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              
              <div className="flex flex-col items-center gap-6 z-0 animate-float">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow" />
                  <ShieldCheck className="w-10 h-10 text-primary relative z-10" />
                </div>
                <div className="h-2 w-48 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-primary rounded-full" />
                </div>
                <div className="flex gap-4">
                  <div className="h-16 w-32 bg-white/5 rounded-lg border border-white/10" />
                  <div className="h-16 w-32 bg-white/5 rounded-lg border border-white/10" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
