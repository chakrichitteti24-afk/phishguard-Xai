import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PhishGuard XAI | Detect. Explain. Prevent.",
  description: "Zero-Day Phishing Intelligence Platform with Explainable AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen selection:bg-primary/30 selection:text-primary-foreground`}>
        {children}
      </body>
    </html>
  );
}
