"use client";

import { useState } from "react";
import { Search, X, Link2 } from "lucide-react";

interface UrlInputProps {
  onScan: (url: string) => void;
  isLoading: boolean;
}

export default function UrlInput({ onScan, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const examples = [
    "http://paypal-secure-verify.xyz/login",
    "https://touring-smithsonian-binary.trycloudflare.com",
    "http://192.168.1.55/secure/banking",
  ];

  const validateAndScan = () => {
    setError("");
    const trimmed = url.trim();

    if (!trimmed) {
      setError("Please enter a URL to scan.");
      return;
    }

    // Use the platform URL parser — accept every syntactically valid URL.
    // Only reject genuinely malformed input (URL constructor throws).
    try {
      const withScheme = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `http://${trimmed}`;
      const parsed = new URL(withScheme);

      // The only hard requirement: there must be a non-empty hostname.
      if (!parsed.hostname) {
        setError("URL must contain a hostname.");
        return;
      }
    } catch {
      setError("Malformed URL. Please enter a valid HTTP or HTTPS URL.");
      return;
    }

    onScan(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      validateAndScan();
    }
  };

  return (
    <div className="glass-panel p-6 border border-glass-border relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Scan a URL
        </h2>
        <p className="text-sm text-foreground/60 mb-6">
          Enter a suspicious link to analyze it for phishing, malware, or fraudulent activity.
        </p>

        <div className="relative flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="https://example.com"
              className="w-full bg-white/5 border border-glass-border rounded-xl pl-12 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-foreground/30 disabled:opacity-50"
            />
            {url && !isLoading && (
              <button 
                onClick={() => setUrl("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={validateAndScan}
            disabled={isLoading || !url}
            className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
          >
            {isLoading ? "Scanning..." : "Scan URL"}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-xs mt-2 font-medium ml-2">{error}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-foreground/50 mr-2">Try examples:</span>
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUrl(ex);
                setError("");
              }}
              disabled={isLoading}
              className="text-[10px] sm:text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-colors disabled:opacity-50 text-foreground/70"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
