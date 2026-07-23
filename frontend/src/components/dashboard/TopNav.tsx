"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bell, Search, Menu, Sun, Moon, Shield, User } from "lucide-react";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/navigation";
import Link from "next/link";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getScanHistory } from "@/lib/scanHistory";

export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasAlerts, setHasAlerts] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const history = getScanHistory();
    const criticalCount = history.filter(r => r.level === "Critical" || r.level === "High").length;
    setHasAlerts(criticalCount > 0);
  }, []);

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/dashboard/history`);
    }
  };

  return (
    <header className="h-16 shrink-0 bg-background/80 backdrop-blur-md border-b border-glass-border flex items-center justify-between px-4 md:px-6 z-30 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="md:hidden p-2 -ml-2 text-foreground/70 hover:text-foreground"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search history, URLs, payloads (Press Enter)..." 
            className="w-full bg-white/5 border border-glass-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all h-10 placeholder:text-foreground/40"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-foreground/70"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <Link 
          href="/dashboard/history"
          prefetch={true}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-foreground/70 relative"
          title="Incident Alerts"
        >
          <Bell className="w-5 h-5" />
          {hasAlerts && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </Link>

        <div className="h-8 w-px bg-glass-border mx-1" />

        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <User className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold hidden md:inline text-foreground/80">SOC Analyst</span>
        </div>
      </div>
    </header>
  );
}
