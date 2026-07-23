"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import UrlInput from "@/components/dashboard/scanner/url/UrlInput";
import ScanProgress from "@/components/dashboard/scanner/url/ScanProgress";
import RiskMeter, { RiskAnalysis } from "@/components/dashboard/scanner/url/RiskMeter";
import FeatureExtraction, { ExtractedFeatures } from "@/components/dashboard/scanner/url/FeatureExtraction";
import ExplanationPanel, { Explanation } from "@/components/dashboard/scanner/url/ExplanationPanel";
import RecommendationPanel from "@/components/dashboard/scanner/url/RecommendationPanel";
import ThreatIntelPanel from "@/components/dashboard/scanner/url/ThreatIntelPanel";
import ScanHistory from "@/components/dashboard/scanner/url/ScanHistory";
import { getScanHistory, saveScanRecord, ScanRecordItem } from "@/lib/scanHistory";

export default function UrlScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Results State
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [features, setFeatures] = useState<ExtractedFeatures | null>(null);
  const [threatIntel, setThreatIntel] = useState<any | null>(null);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [history, setHistory] = useState<ScanRecordItem[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const handleScan = async (url: string) => {
    setIsScanning(true);
    setHasScanned(false);
    setErrorMessage(null);
    setScanProgress(10);

    try {
      // Send URL directly to the production backend pipeline.
      // The backend handles: Validation → Normalization → Feature Extraction →
      // Rule Engine → ML → WHOIS → SSL → Risk Score → Groq AI → PDF
      setScanProgress(30);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(`${API_URL}/api/v1/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "URL",
          payload: url,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      setScanProgress(80);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Backend error ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      setScanProgress(95);

      if (data.error) {
        setErrorMessage(data.error);
      }

      // Map backend response to component types
      const riskAnalysis: RiskAnalysis = {
        score: data.score,
        level: data.level,
        confidence: data.confidence,
      };

      // Map backend features to frontend ExtractedFeatures interface
      const backendFeatures = data.features || {};
      const mappedFeatures: ExtractedFeatures = {
        urlLength: backendFeatures.urlLength || url.length,
        subdomains: backendFeatures.subdomains || 0,
        hasIpAddress: backendFeatures.hasIpAddress || false,
        isHttps: backendFeatures.isHttps || url.startsWith("https://"),
        suspiciousKeywords: backendFeatures.suspiciousKeywords || 0,
        specialChars: backendFeatures.encodedCharacters || 0,
        hyphenCount: backendFeatures.hyphensInDomain || 0,
        digitCount: backendFeatures.digitsInDomain || 0,
        entropy: backendFeatures.entropy || 0,
        tld: backendFeatures.tld || "",
      };

      setAnalysis(riskAnalysis);
      setFeatures(mappedFeatures);
      setExplanations(data.explanations || []);
      setRecommendations(data.recommendations || []);

      // Use threat intel from backend (WHOIS + SSL already done server-side)
      setThreatIntel(data.threat_intel_summary || null);

      // Save to scan history
      saveScanRecord({
        type: "URL",
        target: url,
        score: data.score,
        level: data.level,
        confidence: data.confidence,
        features: mappedFeatures,
        explanations: data.explanations || [],
        recommendations: data.recommendations || [],
      });

      setHistory(getScanHistory());
      setScanProgress(100);
      setHasScanned(true);
    } catch (error: any) {
      console.error("Scan execution failed:", error);
      setErrorMessage(
        error?.message?.includes("fetch")
          ? "Cannot reach the Python backend on port 8000. Please ensure the server is running."
          : error?.message || "An unexpected error occurred during scan execution."
      );
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 1000);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">AI URL Scanner</h1>
        <p className="text-sm text-foreground/50">
          Production-grade phishing detection: Rule Engine + ML + WHOIS + SSL + Groq XAI analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <UrlInput onScan={handleScan} isLoading={isScanning} />

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-foreground/50 hover:text-foreground ml-4 shrink-0">✕</button>
            </div>
          )}

          {isScanning && <ScanProgress progress={scanProgress} />}

          {hasScanned && analysis && features && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RiskMeter analysis={analysis} />
                <FeatureExtraction features={features} />
              </div>

              {threatIntel && (
                <ThreatIntelPanel intel={threatIntel} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExplanationPanel explanations={explanations} />
                <RecommendationPanel analysis={analysis} recommendations={recommendations} />
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-1">
          <ScanHistory history={history} />
        </div>
      </div>
    </div>
  );
}
