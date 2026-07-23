"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Statistics() {
  // Simple animated counter for demo purposes
  const Counter = ({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }, [end, duration]);

    return (
      <span className="text-4xl md:text-5xl font-bold">
        {count.toLocaleString()}{suffix}
      </span>
    );
  };

  const stats = [
    { label: "URLs Scanned", value: 1250000, suffix: "+" },
    { label: "Threats Blocked", value: 48500, suffix: "+" },
    { label: "AI Accuracy", value: 99, suffix: "%" },
    { label: "Response Time", value: 450, suffix: "ms" },
  ];

  return (
    <section className="py-20 border-y border-glass-border bg-black/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="text-gradient">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-foreground/70 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
