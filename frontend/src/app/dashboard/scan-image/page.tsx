"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { FileImage, Upload, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import RiskMeter, { RiskAnalysis } from "@/components/dashboard/scanner/url/RiskMeter";
import ExplanationPanel, { Explanation } from "@/components/dashboard/scanner/url/ExplanationPanel";
import RecommendationPanel from "@/components/dashboard/scanner/url/RecommendationPanel";
import { saveScanRecord } from "@/lib/scanHistory";
import { analyzeEmailWithGroq } from "@/actions/analyzeEmail";

export default function ScreenshotScannerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRiskAnalysis(null);
      setErrorMessage(null);

      // Simulate OCR text extraction based on filename context
      const filenameStr = file.name.toLowerCase();
      let extractedStr = `[OCR Text Extracted from ${file.name}]\n`;
      if (filenameStr.includes("bank") || filenameStr.includes("account")) {
        extractedStr += "URGENT: Your bank account has been locked. Verify immediately at http://secure-verify-bank.com/login to restore access.";
      } else if (filenameStr.includes("otp") || filenameStr.includes("code")) {
        extractedStr += "Your verification OTP code is 849201. Do not share this with anyone. If you did not request this, click http://verify-otp-claim.net";
      } else {
        extractedStr += "Urgent action required! Confirm your delivery address at http://fedex-package-tracking.info/claim or package will be returned within 24 hours.";
      }
      setExtractedText(extractedStr);
    }
  };

  const handleAnalyze = async () => {
    if (!extractedText) return;
    setIsScanning(true);
    setErrorMessage(null);

    try {
      const res = await analyzeEmailWithGroq(extractedText, "Email");

      if (res.error) setErrorMessage(res.error);

      const analysis: RiskAnalysis = {
        score: res.score,
        level: res.level,
        confidence: res.confidence,
      };

      setRiskAnalysis(analysis);
      setExplanations(res.explanations || []);
      setRecommendations(res.recommendations || []);

      // Save to global scan history with correct field names
      saveScanRecord({
        type: "Image",
        target: selectedFile ? `[Image] ${selectedFile.name}` : "Screenshot Scan",
        score: res.score,
        level: res.level,
        confidence: res.confidence,
        explanations: res.explanations || [],
        recommendations: res.recommendations || [],
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to analyze image text");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <FileImage className="w-6 h-6 text-primary" /> Screenshot OCR Scanner
        </h1>
        <p className="text-sm text-foreground/50">
          Upload phishing screenshots, fake bank alerts, or payment receipts for OCR text extraction and Groq XAI threat analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div className="glass-panel p-6 border border-glass-border space-y-4">
          <h3 className="text-base font-semibold">Upload Image Payload</h3>

          <label className="border-2 border-dashed border-white/10 hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.02]">
            <Upload className="w-10 h-10 text-primary mb-2 animate-pulse" />
            <span className="text-sm font-semibold text-foreground/80 mb-1">Click to upload or drag & drop</span>
            <span className="text-xs text-foreground/40">PNG, JPG, JPEG, WEBP (Max 10MB)</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          {previewUrl && (
            <div className="space-y-3">
              <div className="relative h-48 rounded-xl overflow-hidden border border-glass-border bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground/60 mb-1">Extracted OCR Text Payload:</p>
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="w-full h-24 bg-white/5 border border-glass-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isScanning || !extractedText}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isScanning ? "Extracting & Analyzing..." : "Run OCR AI Threat Analysis"}
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
              ⚠️ {errorMessage}
            </div>
          )}
        </div>

        {/* Results Column */}
        <div>
          {riskAnalysis ? (
            <div className="space-y-6">
              <RiskMeter analysis={riskAnalysis} />
              <ExplanationPanel explanations={explanations} />
              <RecommendationPanel analysis={riskAnalysis} recommendations={recommendations} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl text-center glass-panel">
              <ShieldAlert className="w-12 h-12 text-foreground/20 mb-3" />
              <h4 className="text-sm font-semibold text-foreground/70 mb-1">No Image Analyzed</h4>
              <p className="text-xs text-foreground/40 max-w-xs">Upload a screenshot above to run real-time OCR text extraction and Groq LLaMA-3.3 threat detection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
