"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Link2, Mail, QrCode, FileImage } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const QuickActions = memo(function QuickActions() {
  const router = useRouter();

  const actions = [
    { title: "Scan URL", href: "/dashboard/scan-url", icon: Link2, desc: "Paste suspicious links", color: "from-blue-500/20 to-blue-600/5", border: "border-blue-500/20", hover: "hover:border-blue-500/50" },
    { title: "Scan Email", href: "/dashboard/scan-email", icon: Mail, desc: "Paste raw EML or headers", color: "from-purple-500/20 to-purple-600/5", border: "border-purple-500/20", hover: "hover:border-purple-500/50" },
    { title: "Scan QR", href: "/dashboard/scan-qr", icon: QrCode, desc: "Upload QR image", color: "from-cyan-500/20 to-cyan-600/5", border: "border-cyan-500/20", hover: "hover:border-cyan-500/50" },
    { title: "Screenshot", href: "/dashboard/scan-image", icon: FileImage, desc: "OCR text extraction", color: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/20", hover: "hover:border-emerald-500/50" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {actions.map((action, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Link 
            href={action.href} 
            prefetch={true}
            onMouseEnter={() => router.prefetch(action.href)}
            className={`block h-full glass-panel p-4 bg-gradient-to-br ${action.color} border ${action.border} ${action.hover} transition-all duration-300 group`}
          >
            <div className="flex flex-col h-full gap-3">
              <action.icon className="w-6 h-6 text-foreground/80 group-hover:text-foreground transition-colors" />
              <div>
                <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{action.title}</h4>
                <p className="text-xs text-foreground/50">{action.desc}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
});

export default QuickActions;
