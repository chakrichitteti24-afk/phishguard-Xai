"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { getChartDataFromHistory } from "@/lib/scanHistory";
import { BarChart3 } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function AnalyticsCharts() {
  const [chartDataState, setChartDataState] = useState<{
    hasData: boolean;
    lineLabels: string[];
    scansData: number[];
    threatsData: number[];
    doughnutLabels: string[];
    doughnutData: number[];
  }>({
    hasData: false,
    lineLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    scansData: [0, 0, 0, 0, 0, 0, 0],
    threatsData: [0, 0, 0, 0, 0, 0, 0],
    doughnutLabels: [],
    doughnutData: [],
  });

  useEffect(() => {
    setChartDataState(getChartDataFromHistory());
  }, []);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#aaa",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "rgba(255, 255, 255, 0.4)", stepSize: 1 },
        beginAtZero: true,
      },
      x: {
        grid: { display: false },
        ticks: { color: "rgba(255, 255, 255, 0.4)" },
      },
    },
  };

  const lineData = {
    labels: chartDataState.lineLabels,
    datasets: [
      {
        fill: true,
        label: "Scans",
        data: chartDataState.scansData,
        borderColor: "rgba(56, 189, 248, 1)",
        backgroundColor: "rgba(56, 189, 248, 0.1)",
        tension: 0.4,
      },
      {
        fill: true,
        label: "Threats",
        data: chartDataState.threatsData,
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
          usePointStyle: true,
          padding: 15,
        },
      },
    },
  };

  const doughnutData = {
    labels: chartDataState.doughnutLabels,
    datasets: [
      {
        data: chartDataState.doughnutData,
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(56, 189, 248, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(34, 197, 94, 0.8)",
        ],
        borderColor: "rgba(0,0,0,0.2)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Scan Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel p-5 lg:col-span-2 border border-glass-border relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <h3 className="font-semibold text-lg mb-1">Scan Trends</h3>
          <p className="text-xs text-foreground/50 mb-4">Volume of total scans vs threats from actual scan history.</p>
        </div>

        {!chartDataState.hasData ? (
          <div className="h-[250px] w-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-6 text-center text-foreground/40">
            <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-semibold">No Scan Analytics Available</p>
            <p className="text-xs mt-1 max-w-sm">Complete a scan using the URL or Email scanners to generate live chart telemetry.</p>
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <Line options={lineOptions} data={lineData} />
          </div>
        )}
      </motion.div>

      {/* Threat Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-panel p-5 border border-glass-border relative overflow-hidden flex flex-col justify-between"
      >
        <div>
          <h3 className="font-semibold text-lg mb-1">Threat Distribution</h3>
          <p className="text-xs text-foreground/50 mb-4">Categorization of recorded risks.</p>
        </div>

        {!chartDataState.hasData ? (
          <div className="h-[250px] w-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-6 text-center text-foreground/40">
            <p className="text-xs">Complete scans to generate threat breakdown.</p>
          </div>
        ) : (
          <div className="h-[250px] w-full flex items-center justify-center">
            <Doughnut options={doughnutOptions} data={doughnutData} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
