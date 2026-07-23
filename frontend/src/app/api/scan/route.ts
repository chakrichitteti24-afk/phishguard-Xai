/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const BACKEND_URL =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://phishguard-xai.onrender.com";

    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000), // 90s for cold starts
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Scan Proxy Error:", error);
    if (error.name === "AbortError" || error.message?.includes("timeout")) {
      return NextResponse.json(
        { error: "The backend server took too long to respond (cold start). Please try again." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Failed to communicate with the backend server." },
      { status: 500 }
    );
  }
}
