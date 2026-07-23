"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link2, ShieldCheck, ShieldAlert, AlertTriangle, BrainCircuit, Timer } from "lucide-react";
import { getDashboardStats } from "@/lib/scanHistory";

export default function OverviewCards() {
  const [statsData, setStatsData] = useState({
    totalScans: "0",
    safeUrls: "0",
    threatsDetected: "0",
    highRiskAlerts: "0",
    aiAccuracy: "Data unavailable",
    avgResponseTime: "Data unavailable",
    hasData: false,
  });

  useEffect(() => {
    setStatsData(getDashboardStats());
  }, []);

  const stats = [
    { label: "Total Scans", value: statsData.totalScans, icon: Link2, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Safe URLs", value: statsData.safeUrls, icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
    { label: "Threats Detected", value: statsData.threatsDetected, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "High Risk Alerts", value: statsData.highRiskAlerts, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { label: "AI Accuracy", value: statsData.aiAccuracy, icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Avg Response", value: statsData.avgResponseTime, icon: Timer, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`glass-panel p-4 flex flex-col justify-between h-28 border ${stat.border}`}
        >
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-foreground/60">{stat.label}</p>
            <div className={`p-1.5 rounded-md ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <p className="text-xl font-bold tracking-tight truncate">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
