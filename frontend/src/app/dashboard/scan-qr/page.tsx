"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { QrCode, Upload, RefreshCw, Sparkles, Link as LinkIcon } from "lucide-react";
import RiskMeter, { RiskAnalysis } from "@/components/dashboard/scanner/url/RiskMeter";
import ExplanationPanel, { Explanation } from "@/components/dashboard/scanner/url/ExplanationPanel";
import RecommendationPanel from "@/components/dashboard/scanner/url/RecommendationPanel";
import { saveScanRecord } from "@/lib/scanHistory";
import { analyzeUrlWithGroq } from "@/actions/analyzeUrl";
import { fetchThreatIntel } from "@/actions/analyzeThreatIntel";
import { calculateShannonEntropy } from "@/lib/threatIntel";

export default function QrScannerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [decodedUrl, setDecodedUrl] = useState<string>("");
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

      // Simulate QR decode from filename (real app would use jsQR library)
      const filename = file.name.toLowerCase();
      let extracted = "https://login-verify-account-security.net/auth";
      if (filename.includes("safe") || filename.includes("google")) {
        extracted = "https://google.com";
      } else if (filename.includes("bank")) {
        extracted = "http://192.168.1.105/bank-update/login.php";
      }
      setDecodedUrl(extracted);
    }
  };

  const handleAnalyze = async () => {
    if (!decodedUrl) return;
    setIsScanning(true);
    setErrorMessage(null);

    try {
      let hostname = decodedUrl;
      try {
        hostname = new URL(decodedUrl).hostname;
      } catch (e) {}

      const subdomainsCount = hostname.split(".").length - 2;
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      const isHttps = decodedUrl.startsWith("https://");
      const entropy = calculateShannonEntropy(decodedUrl);

      const features = {
        urlLength: decodedUrl.length,
        domainLength: hostname.length,
        subdomains: Math.max(0, subdomainsCount),
        hasIpAddress: isIp,
        isHttps,
        specialChars: (decodedUrl.match(/[@%&=?_~]/g) || []).length,
        hyphenCount: (decodedUrl.match(/-/g) || []).length,
        digitCount: (decodedUrl.match(/\d/g) || []).length,
        suspiciousKeywords: (decodedUrl.match(/login|verify|account|bank|secure|update/gi) || []).length,
        entropy,
        tld: hostname.split(".").pop() || "",
      };

      const intel = await fetchThreatIntel(decodedUrl);
      const res = await analyzeUrlWithGroq(decodedUrl, features, intel);

      if (res.error) setErrorMessage(res.error);

      setRiskAnalysis(res.analysis);
      setExplanations(res.explanations || []);
      setRecommendations(res.recommendations || []);

      // Save scan record with correct field names
      saveScanRecord({
        type: "QR",
        target: `[QR Target] ${decodedUrl}`,
        score: res.analysis.score,
        level: res.analysis.level,
        confidence: res.analysis.confidence,
        explanations: res.explanations || [],
        recommendations: res.recommendations || [],
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to analyze decoded QR URL");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-primary" /> QR Code Scanner (Quishing Protection)
        </h1>
        <p className="text-sm text-foreground/50">
          Upload QR code images to decode embedded payload URLs and run Groq XAI threat detection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div className="glass-panel p-6 border border-glass-border space-y-4">
          <h3 className="text-base font-semibold">Upload QR Image</h3>

          <label className="border-2 border-dashed border-white/10 hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.02]">
            <Upload className="w-10 h-10 text-primary mb-2 animate-pulse" />
            <span className="text-sm font-semibold text-foreground/80 mb-1">Click to upload QR Code</span>
            <span className="text-xs text-foreground/40">PNG, JPG, WEBP</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          {previewUrl && (
            <div className="space-y-3">
              <div className="relative h-48 rounded-xl overflow-hidden border border-glass-border bg-black/40 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="QR Preview" className="h-40 w-40 object-contain" />
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground/60 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-primary" /> Decoded Target URL:
                </p>
                <input
                  type="text"
                  value={decodedUrl}
                  onChange={(e) => setDecodedUrl(e.target.value)}
                  className="w-full bg-white/5 border border-glass-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isScanning || !decodedUrl}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isScanning ? "Decoding & Analyzing..." : "Run QR Threat Analysis"}
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
              ⚠️ {errorMessage}
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {riskAnalysis ? (
            <div className="space-y-6">
              <RiskMeter analysis={riskAnalysis} />
              <ExplanationPanel explanations={explanations} />
              <RecommendationPanel analysis={riskAnalysis} recommendations={recommendations} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl text-center glass-panel">
              <QrCode className="w-12 h-12 text-foreground/20 mb-3" />
              <h4 className="text-sm font-semibold text-foreground/70 mb-1">No QR Code Scanned</h4>
              <p className="text-xs text-foreground/40 max-w-xs">Upload a QR code above to decode the embedded URL payload and analyze potential quishing risks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
