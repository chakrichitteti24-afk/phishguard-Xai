export const APP_NAME = "PhishGuard XAI";
export const APP_VERSION = "2.0.0-production";
export const ENGINE_NAME = "Groq LLaMA-3.3 XAI";

export const NAVIGATION_LINKS = [
  { name: "Dashboard", href: "/dashboard", iconName: "LayoutDashboard" },
  { name: "URL Scanner", href: "/dashboard/scan-url", iconName: "Link" },
  { name: "Email Scanner", href: "/dashboard/scan-email", iconName: "Mail" },
  { name: "Scan History", href: "/dashboard/history", iconName: "History" },
  { name: "API Health", href: "/dashboard/health", iconName: "Activity" },
] as const;
