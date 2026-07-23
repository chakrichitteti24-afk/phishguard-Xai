import React from "react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionText, actionHref }: EmptyStateProps) {
  return (
    <div className="py-12 px-4 text-center border border-dashed border-white/10 rounded-2xl glass-panel flex flex-col items-center justify-center">
      <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-3 text-foreground/40">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-foreground/90 mb-1">{title}</h3>
      <p className="text-xs text-foreground/50 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionText && actionHref && (
        <Link
          href={actionHref}
          prefetch={true}
          className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
