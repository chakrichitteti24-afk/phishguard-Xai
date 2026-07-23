"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldAlert, LayoutDashboard, Link as LinkIcon, 
  Mail, QrCode, FileImage, ShieldCheck, History,
  BarChart3, Settings, X
} from "lucide-react";

const Sidebar = memo(function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "URL Scanner", href: "/dashboard/scan-url", icon: LinkIcon },
    { name: "Email Scanner", href: "/dashboard/scan-email", icon: Mail },
    { name: "QR Scanner", href: "/dashboard/scan-qr", icon: QrCode },
    { name: "Screenshot Scanner", href: "/dashboard/scan-image", icon: FileImage },
    { name: "Scan History", href: "/dashboard/history", icon: History },
    { name: "Threat Reports", href: "/dashboard/reports", icon: ShieldCheck },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },

    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col bg-background border-r border-glass-border">
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-glass-border">
        <Link 
          href="/" 
          prefetch={true} 
          onMouseEnter={() => router.prefetch("/")}
          className="flex items-center gap-2 group"
        >
          <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
            <ShieldAlert className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            PhishGuard <span className="text-primary">XAI</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-foreground/70 hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              onMouseEnter={() => router.prefetch(item.href)}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-foreground/70 hover:bg-white/5 hover:text-foreground border border-transparent"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-foreground/50 group-hover:text-foreground/80"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-glass-border">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-3.5 border border-glass-border relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h4 className="font-semibold text-xs text-foreground">Groq LLaMA-3.3 Active</h4>
          </div>
          <p className="text-[11px] text-foreground/50 mb-2">SOC Threat Analysis Engine running.</p>
          <Link
            href="/dashboard/settings"
            prefetch={true}
            className="block w-full text-center text-[11px] font-semibold py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-primary"
          >
            System Diagnostics
          </Link>
        </div>
      </div>
    </div>
  );
});

export default Sidebar;
