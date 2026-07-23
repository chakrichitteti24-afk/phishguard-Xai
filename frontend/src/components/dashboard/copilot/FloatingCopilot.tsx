"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrainCircuit, X, Send, Bot, User, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendCopilotMessage, ChatMessage } from "@/actions/copilotChat";

export default function FloatingCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I am **PhishGuard Copilot**, your AI Cybersecurity Assistant. How can I help you analyze a threat or practice safe browsing today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const res = await sendCopilotMessage(newMessages);
      setMessages([...newMessages, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I encountered an error reaching the Groq AI engine." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "How do I spot an OTP scam?",
    "Explain Shannon Entropy in URLs",
    "What makes an email sender domain suspicious?",
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-2xl shadow-primary/40 border border-white/20 flex items-center justify-center"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-background rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-background rounded-full" />
          {isOpen ? <X className="w-6 h-6" /> : <BrainCircuit className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Slide-in Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-md h-[540px] rounded-2xl glass-panel border border-glass-border shadow-2xl flex flex-col overflow-hidden bg-background/95 backdrop-blur-xl"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-glass-border bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-1.5">
                    PhishGuard Copilot <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </h3>
                  <p className="text-[11px] text-foreground/50">Groq LLaMA-3.3 XAI Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs custom-scrollbar">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-white font-medium rounded-tr-none"
                        : "bg-white/5 border border-glass-border text-foreground/90 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-foreground/70 shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 items-center text-foreground/50 text-xs">
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <span>Analyzing security telemetry...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-glass-border bg-white/[0.02]">
                <p className="text-[10px] uppercase font-semibold tracking-wider text-foreground/40 mb-1.5">Suggested Prompts</p>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-foreground/70 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-glass-border bg-background/50 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about phishing, threat reports, or safe habits..."
                className="flex-1 bg-white/5 border border-glass-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-foreground/40"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
