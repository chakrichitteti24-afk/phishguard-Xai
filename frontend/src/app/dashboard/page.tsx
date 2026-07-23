"use client";

import OverviewCards from "@/components/dashboard/OverviewCards";
import QuickActions from "@/components/dashboard/QuickActions";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import ThreatTable from "@/components/dashboard/ThreatTable";
import RecentThreatsTimeline from "@/components/dashboard/RecentThreatsTimeline";

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Cybersecurity Operations Dashboard</h1>
        <p className="text-sm text-foreground/50">
          Real-time threat monitoring and explainable AI security telemetry.
        </p>
      </div>

      <QuickActions />
      <OverviewCards />
      <AnalyticsCharts />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreatTable />
        </div>
        <div>
          <RecentThreatsTimeline />
        </div>
      </div>
    </div>
  );
}
