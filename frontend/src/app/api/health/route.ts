import { NextResponse } from "next/server";

export async function GET() {
  const healthReport = {
    timestamp: new Date().toISOString(),
    overallStatus: "UNKNOWN" as "HEALTHY" | "DEGRADED" | "CRITICAL",
    services: {
      backendAPI: {
        status: "UNKNOWN",
        message: "",
      },
    },
  };

  try {
    const BACKEND_URL =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://phishguard-xai.onrender.com";

    // 1. Test Backend Health (which in turn tests Groq)
    const backendRes = await fetch(`${BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(8000),
    }).catch(() => null);

    if (backendRes && backendRes.ok) {
      healthReport.services.backendAPI = {
        status: "OK",
        message: "PhishGuard Backend is reachable.",
      };
      healthReport.overallStatus = "HEALTHY";
    } else {
      healthReport.services.backendAPI = {
        status: "DEGRADED",
        message: `Backend unreachable or returned error.`,
      };
      healthReport.overallStatus = "DEGRADED";
    }
  } catch (globalErr: any) {
    healthReport.overallStatus = "CRITICAL";
  }

  return NextResponse.json(healthReport, { status: 200 });
}
