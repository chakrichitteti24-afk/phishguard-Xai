"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function FAQ() {
  const faqs = [
    {
      question: "How does PhishGuard XAI detect zero-day threats?",
      answer: "We use a multi-layered approach. Beyond checking known blacklists (like VirusTotal), our machine learning models analyze the payload's structure, semantics, and visual properties in real-time. This allows us to catch novel, unseen threats before they are ever reported.",
    },
    {
      question: "What is Explainable AI (XAI)?",
      answer: "Unlike traditional security tools that simply give a 'safe' or 'unsafe' verdict, PhishGuard XAI uses Google Gemini to generate human-readable explanations of why a payload was flagged. We break down the technical reasoning into simple terms.",
    },
    {
      question: "Can it scan QR codes and images?",
      answer: "Yes. Our OCR and QR parsing engines can extract embedded URLs and text from screenshots and QR codes, analyzing them for malicious intent just like a standard text payload.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We do not store sensitive payloads permanently unless you explicitly save them to your scan history. All analysis is done in memory, and external API queries only send necessary hashes or isolated URLs.",
    },
    {
      question: "How fast is the analysis?",
      answer: "Despite orchestrating multiple ML models and external Threat Intel APIs, our asynchronous architecture delivers comprehensive results typically within 3 to 5 seconds.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel overflow-hidden border border-white/10"
            >
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-primary transition-transform duration-300",
                    openIndex === index ? "rotate-180" : ""
                  )}
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-4 text-foreground/70 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
