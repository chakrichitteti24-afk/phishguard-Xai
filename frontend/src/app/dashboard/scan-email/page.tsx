"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import EmailInput from "@/components/dashboard/scanner/email/EmailInput";
import EmailRiskMeter from "@/components/dashboard/scanner/email/EmailRiskMeter";
import EmailAnalysisDetails from "@/components/dashboard/scanner/email/EmailAnalysisDetails";
import ScanProgress from "@/components/dashboard/scanner/url/ScanProgress";
import ExplanationPanel, { Explanation } from "@/components/dashboard/scanner/url/ExplanationPanel";
import RecommendationPanel from "@/components/dashboard/scanner/url/RecommendationPanel";
import ScanHistory from "@/components/dashboard/scanner/url/ScanHistory";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { analyzeEmailWithGroq, EmailAnalysisResult } from "@/actions/analyzeEmail";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getScanHistory, saveScanRecord, ScanRecordItem } from "@/lib/scanHistory";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RiskAnalysis } from "@/components/dashboard/scanner/url/RiskMeter";

export default function EmailScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<EmailAnalysisResult | null>(null);
  const [history, setHistory] = useState<ScanRecordItem[]>([]);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async (content: string, mode: "Email" | "SMS/WhatsApp") => {
    setIsScanning(true);
    setHasScanned(false);
    setErrorMessage(null);

    try {
      const res = await analyzeEmailWithGroq(content, mode);
      
      if (res.error) {
        setErrorMessage(res.error);
      }

      setAnalysisResult(res);

      // Save to global scan history if valid scan
      if (res.score > 0 || res.level !== "Safe" || !res.error) {
        const snippet = content.slice(0, 45).replace(/\n/g, " ") + (content.length > 45 ? "..." : "");
        saveScanRecord({
          type: "Email",
          target: `[${mode}] ${snippet}`,
          score: res.score,
          level: res.level,
          confidence: res.confidence,
          features: {
            category: res.category,
            urgencyScore: res.urgencyScore,
            fakeSenderRisk: res.fakeSenderRisk,
            suspiciousLinkCount: res.suspiciousLinkCount,
          },
          explanations: res.explanations,
          recommendations: res.recommendations,
        });

        setHistory(getScanHistory());
      }
      setHasScanned(true);
    } catch (err: any) {
      console.error("Email scan failed", err);
      setErrorMessage(err?.message || "Failed to analyze message content.");
    } finally {
      setIsScanning(false);
    }
  };

  // Adapter for RiskMeter prop in RecommendationPanel
  const mappedRiskAnalysis: RiskAnalysis | null = analysisResult ? {
    score: analysisResult.score,
    level: analysisResult.level,
    confidence: analysisResult.confidence,
  } : null;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Email & SMS Phishing Scanner</h1>
        <p className="text-sm text-foreground/50">
          Paste emails, SMS, or WhatsApp text to detect social engineering, urgency cues, banking fraud, and OTP theft.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <EmailInput onAnalyze={handleAnalyze} isLoading={isScanning} />

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-foreground/50 hover:text-foreground">✕</button>
            </div>
          )}

          {isScanning && <ScanProgress progress={50} />}

          {hasScanned && analysisResult && mappedRiskAnalysis && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EmailRiskMeter result={analysisResult} />
                <EmailAnalysisDetails result={analysisResult} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExplanationPanel explanations={analysisResult.explanations} />
                <RecommendationPanel analysis={mappedRiskAnalysis} recommendations={analysisResult.recommendations} />
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
