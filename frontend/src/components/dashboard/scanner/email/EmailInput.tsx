"use client";

import { useState } from "react";
import { Mail, MessageSquare, Sparkles, X, AlertCircle } from "lucide-react";

interface EmailInputProps {
  onAnalyze: (content: string, mode: "Email" | "SMS/WhatsApp") => void;
  isLoading: boolean;
}

export default function EmailInput({ onAnalyze, isLoading }: EmailInputProps) {
  const [mode, setMode] = useState<"Email" | "SMS/WhatsApp">("Email");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const presets = [
    {
      title: "Bank OTP Scam",
      mode: "SMS/WhatsApp" as const,
      text: "[ALERT] Your Chase Online Access is locked due to unauthorized login. Enter OTP code 489210 at http://chase-secure-verify.net to prevent suspension.",
    },
    {
      title: "FedEx Package Alert",
      mode: "SMS/WhatsApp" as const,
      text: "FedEx: Your package delivery is on hold due to missing address details ($2.50 fee). Update now: http://fedex-parcel-redelivery.org",
    },
    {
      title: "Urgent PayPal Email",
      mode: "Email" as const,
      text: "From: service@paypa1-security-update.com\nSubject: URGENT: Unauthorized transaction of $499.00 detected\n\nDear Customer,\nA purchase was initiated on your account. If you did not authorize this payment, click immediately to reverse: http://paypal-dispute-centre.com/login",
    },
    {
      title: "Legitimate Calendar Invite",
      mode: "Email" as const,
      text: "From: alex.dev@company.org\nSubject: Project Sprint Retrospective - Tuesday 3 PM\n\nHi team, please find attached the retrospective agenda for our sprint review on Google Meet.",
    },
  ];

  const handleAnalyze = () => {
    setError("");
    if (!content.trim()) {
      setError("Please paste email headers, body text, or SMS messages to analyze.");
      return;
    }
    onAnalyze(content, mode);
  };

  return (
    <div className="glass-panel p-6 border border-glass-border relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10">
        {/* Mode Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Email & SMS Phishing Scanner
            </h2>
            <p className="text-xs text-foreground/50 mt-1">
              Detect social engineering, fake urgency, banking scams, and OTP theft.
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setMode("Email")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "Email" ? "bg-primary text-primary-foreground shadow" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
            <button
              onClick={() => setMode("SMS/WhatsApp")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "SMS/WhatsApp" ? "bg-primary text-primary-foreground shadow" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> SMS / WhatsApp
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            rows={6}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError("");
            }}
            disabled={isLoading}
            placeholder={
              mode === "Email"
                ? "Paste raw email header and message body here...\nExample:\nFrom: support@bank-alert.com\nSubject: Account Verification Required"
                : "Paste suspicious SMS or WhatsApp message text here...\nExample:\nURGENT: Your account is locked. Verify OTP at http://..."
            }
            className="w-full bg-white/5 border border-glass-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-foreground/30 disabled:opacity-50 resize-y"
          />
          {content && !isLoading && (
            <button
              onClick={() => setContent("")}
              className="absolute top-3 right-3 text-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-xs mt-2 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </p>
        )}

        {/* Actions & Presets */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-foreground/50 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Test presets:
            </span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMode(p.mode);
                  setContent(p.text);
                  setError("");
                }}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-colors text-foreground/70"
              >
                {p.title}
              </button>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || !content.trim()}
            className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px] text-sm shrink-0"
          >
            {isLoading ? "Analyzing..." : "Analyze Message"}
          </button>
        </div>
      </div>
    </div>
  );
}
