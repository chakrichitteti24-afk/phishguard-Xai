"use client";

import { motion } from "framer-motion";

export default function Screenshots() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Enterprise-Grade <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="text-lg text-foreground/70">
            A single pane of glass for all your threat intelligence, designed with premium aesthetics and extreme usability.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Main Dashboard Mockup */}
          <div className="glass-panel p-2 md:p-4 rounded-2xl md:rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(14,165,233,0.15)] bg-background/50 backdrop-blur-xl">
            <div className="aspect-video bg-[#050B14] rounded-xl overflow-hidden relative flex flex-col">
              {/* Fake Browser Header */}
              <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="bg-background/50 h-6 flex-1 max-w-md rounded-md mx-auto border border-white/5" />
              </div>
              
              {/* Fake Dashboard Content */}
              <div className="flex-1 p-6 grid grid-cols-12 gap-6 opacity-80">
                {/* Sidebar */}
                <div className="col-span-3 hidden md:flex flex-col gap-4">
                  <div className="h-10 bg-white/5 rounded-lg w-full" />
                  <div className="h-10 bg-white/5 rounded-lg w-full" />
                  <div className="h-10 bg-white/5 rounded-lg w-full" />
                  <div className="h-10 bg-white/5 rounded-lg w-full mt-auto" />
                </div>
                
                {/* Main Content */}
                <div className="col-span-12 md:col-span-9 flex flex-col gap-6">
                  {/* Top Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-xl" />
                    <div className="h-24 bg-white/5 border border-white/5 rounded-xl" />
                    <div className="h-24 bg-white/5 border border-white/5 rounded-xl" />
                  </div>
                  
                  {/* Chart Area */}
                  <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                    <div className="h-6 w-48 bg-white/10 rounded-md" />
                    <div className="flex-1 border-b border-l border-white/10 relative">
                      {/* Fake Chart Lines */}
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,80 Q25,20 50,60 T100,10" fill="none" stroke="rgba(14,165,233,0.5)" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay Overlay (to make it look like a mockup) */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-50" />
            </div>
          </div>

          {/* Floating Element 1 (Scanner Mobile) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -bottom-10 -left-10 md:-left-20 w-48 md:w-64 glass-panel p-2 rounded-3xl hidden sm:block border-white/20 shadow-2xl z-20"
          >
            <div className="aspect-[9/19] bg-[#050B14] rounded-2xl p-4 flex flex-col gap-4 border border-white/5">
              <div className="w-1/2 h-4 bg-white/10 rounded-full mx-auto mb-4" />
              <div className="w-full h-32 bg-primary/20 rounded-xl border border-primary/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/40 animate-pulse" />
              </div>
              <div className="w-full h-4 bg-white/10 rounded-full" />
              <div className="w-3/4 h-4 bg-white/10 rounded-full" />
              <div className="mt-auto w-full h-10 bg-primary rounded-lg" />
            </div>
          </motion.div>

          {/* Floating Element 2 (Report Card) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute -top-10 -right-10 md:-right-16 w-56 md:w-72 glass-panel p-4 rounded-xl hidden md:block border-secondary/30 shadow-2xl z-20 bg-background/80 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                <span className="text-red-500 font-bold">98</span>
              </div>
              <div>
                <div className="h-4 w-24 bg-white/20 rounded-full mb-1" />
                <div className="h-3 w-16 bg-red-500/50 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-white/10 rounded-full" />
              <div className="h-2 w-full bg-white/10 rounded-full" />
              <div className="h-2 w-4/5 bg-white/10 rounded-full" />
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
