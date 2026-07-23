import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "chart.js", "react-chartjs-2"],
  },
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
};

export default nextConfig;
