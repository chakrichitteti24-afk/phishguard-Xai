/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function GET() {
  const groqKey = process.env.GROQ_API_KEY;

  const healthReport = {
    timestamp: new Date().toISOString(),
    overallStatus: "UNKNOWN" as "HEALTHY" | "DEGRADED" | "CRITICAL",
    services: {
      groqAI: {
        status: "UNKNOWN",
        configured: false,
        message: "",
      },
      whoisRdap: {
        status: "UNKNOWN",
        message: "",
      },
    },
  };

  try {
    // 1. Test Groq API Health
    if (!groqKey || groqKey === "gsk_your_groq_api_key_here") {
      healthReport.services.groqAI = {
        status: "MISSING_KEY",
        configured: false,
        message: "GROQ_API_KEY is missing from frontend/.env.local",
      };
    } else if (!groqKey.startsWith("gsk_")) {
      healthReport.services.groqAI = {
        status: "INVALID_KEY_FORMAT",
        configured: true,
        message: "GROQ_API_KEY does not match standard format (should start with 'gsk_')",
      };
    } else {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: "Ping" }],
          model: "llama-3.1-8b-instant",
          max_tokens: 5,
        });

        const text = completion.choices[0]?.message?.content;
        if (text) {
          healthReport.services.groqAI = {
            status: "OK",
            configured: true,
            message: "Groq LLaMA-3.3 / LLaMA-3.1 AI Engine responding normally.",
          };
        }
      } catch (err: any) {
        healthReport.services.groqAI = {
          status: "ERROR",
          configured: true,
          message: err?.message || "Failed to reach Groq API",
        };
      }
    }

    // 2. Test WHOIS RDAP Service Health
    try {
      const rdapRes = await fetch("https://rdap.org/domain/google.com", {
        signal: AbortSignal.timeout(4000),
      });
      if (rdapRes.ok) {
        healthReport.services.whoisRdap = {
          status: "OK",
          message: "RDAP WHOIS gateway reachable at rdap.org",
        };
      } else {
        healthReport.services.whoisRdap = {
          status: "DEGRADED",
          message: `RDAP WHOIS gateway returned status ${rdapRes.status}`,
        };
      }
    } catch (err: any) {
      healthReport.services.whoisRdap = {
        status: "DEGRADED",
        message: "Network timeout connecting to rdap.org",
      };
    }

    // Overall status determination
    if (healthReport.services.groqAI.status === "OK" && healthReport.services.whoisRdap.status === "OK") {
      healthReport.overallStatus = "HEALTHY";
    } else if (healthReport.services.groqAI.status === "OK") {
      healthReport.overallStatus = "DEGRADED";
    } else {
      healthReport.overallStatus = "CRITICAL";
    }
  } catch (globalErr: any) {
    healthReport.overallStatus = "CRITICAL";
  }

  return NextResponse.json(healthReport, { status: 200 });
}
