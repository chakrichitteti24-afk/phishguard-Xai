/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ExplanationItem {
  id: string;
  reason: string;
  severity: "info" | "warning" | "critical";
}

export interface ScanRecordItem {
  id: string;
  type: "URL" | "Email" | "QR" | "Image";
  target: string;
  url?: string;
  category?: string;
  summary?: string;
  timestamp: string; // ISO string
  score: number;
  level: string;
  confidence: number;
  features?: Record<string, any>;
  explanations?: ExplanationItem[];
  recommendations?: string[];
}

const STORAGE_KEY = "phishguard_scan_history_v2";

export function getScanHistory(): ScanRecordItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading scan history from localStorage", err);
    return [];
  }
}

export function saveScanRecord(
  record: Omit<ScanRecordItem, "id" | "timestamp" | "target"> & { target?: string; id?: string; timestamp?: string }
): ScanRecordItem {
  const current = getScanHistory();
  const targetVal = record.target || record.url || "Target Payload";
  const newRecord: ScanRecordItem = {
    id: record.id || `SCN-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: record.timestamp || new Date().toISOString(),
    target: targetVal,
    url: targetVal,
    ...record,
  };
  const updated = [newRecord, ...current.filter((item) => item.id !== newRecord.id)];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving scan record", err);
    }
  }
  return newRecord;
}

export function deleteScanRecord(id: string): ScanRecordItem[] {
  const current = getScanHistory();
  const updated = current.filter((item) => item.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Error deleting scan record", err);
    }
  }
  return updated;
}

export function clearScanHistory(): ScanRecordItem[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (err) {
      console.error("Error clearing scan history", err);
    }
  }
  return [];
}

export function exportScanHistory(format: "csv" | "json", records?: ScanRecordItem[]): void {
  const data = records || getScanHistory();
  if (typeof window === "undefined") return;

  if (format === "json") {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phishguard-scan-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === "csv") {
    const headers = ["ID", "Type", "Target", "Timestamp", "Score", "Level", "Confidence"];
    const rows = data.map((r) => [
      `"${r.id}"`,
      `"${r.type}"`,
      `"${r.target.replace(/"/g, '""')}"`,
      `"${r.timestamp}"`,
      r.score,
      `"${r.level}"`,
      r.confidence,
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phishguard-scan-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Live Analytics Computation Helpers
export function getDashboardStats() {
  const records = getScanHistory();
  const totalScans = records.length;
  const safeUrls = records.filter((r) => r.level === "Safe").length;
  const threatsDetected = records.filter((r) => r.level === "Critical" || r.level === "High" || r.level === "Medium").length;
  const highRiskAlerts = records.filter((r) => r.level === "Critical" || r.level === "High").length;
  
  const avgConfidence = totalScans > 0 
    ? (records.reduce((acc, curr) => acc + curr.confidence, 0) / totalScans).toFixed(1) + "%"
    : "Data unavailable";

  return {
    totalScans: totalScans.toLocaleString(),
    safeUrls: safeUrls.toLocaleString(),
    threatsDetected: threatsDetected.toLocaleString(),
    highRiskAlerts: highRiskAlerts.toLocaleString(),
    aiAccuracy: avgConfidence,
    avgResponseTime: totalScans > 0 ? "N/A" : "Data unavailable",
    hasData: totalScans > 0,
  };
}

export function getChartDataFromHistory() {
  const records = getScanHistory();
  
  // Group by threat level for Doughnut chart
  const categories = {
    Phishing: 0,
    "Banking Scam": 0,
    "OTP Theft": 0,
    "Delivery Scam": 0,
    Safe: 0,
  };

  records.forEach((r) => {
    const cat = r.features?.category;
    if (cat && cat in categories) {
      categories[cat as keyof typeof categories]++;
    } else if (r.level === "Critical" || r.level === "High") {
      categories.Phishing++;
    } else if (r.level === "Safe") {
      categories.Safe++;
    }
  });

  // Calculate day-by-day scans for Line chart
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts: Record<string, { scans: number; threats: number }> = {};
  days.forEach(d => dayCounts[d] = { scans: 0, threats: 0 });

  records.forEach((r) => {
    const dayName = days[new Date(r.timestamp).getDay()];
    if (dayCounts[dayName]) {
      dayCounts[dayName].scans++;
      if (r.level === "Critical" || r.level === "High" || r.level === "Medium") {
        dayCounts[dayName].threats++;
      }
    }
  });

  return {
    hasData: records.length > 0,
    lineLabels: days,
    scansData: days.map(d => dayCounts[d].scans),
    threatsData: days.map(d => dayCounts[d].threats),
    doughnutLabels: Object.keys(categories),
    doughnutData: Object.values(categories),
  };
}
