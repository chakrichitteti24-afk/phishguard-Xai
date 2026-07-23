"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BarChart3, TrendingUp, ShieldAlert, PieChart } from "lucide-react";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import OverviewCards from "@/components/dashboard/OverviewCards";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getScanHistory } from "@/lib/scanHistory";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmptyState } from "@/components/ui/EmptyState";

export default function AnalyticsPage() {
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    const history = getScanHistory();
    setHasHistory(history.length > 0);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Advanced Security Analytics
        </h1>
        <p className="text-sm text-foreground/50">
          Deep telemetry trends, threat score distributions, and incident analytics calculated from verified scan history.
        </p>
      </div>

      <OverviewCards />

      {!hasHistory ? (
        <EmptyState
          icon={BarChart3}
          title="No Analytics Data Available"
          description="Perform scans on URLs, emails, or QR codes to populate real-time analytics graphs."
          actionText="Run First Scan"
          actionHref="/dashboard/scan-url"
        />
      ) : (
        <AnalyticsCharts />
      )}
    </div>
  );
}
