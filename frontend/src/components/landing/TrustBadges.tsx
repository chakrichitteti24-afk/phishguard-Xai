export default function TrustBadges() {
  const badges = [
    { label: "AI Powered", icon: "🧠" },
    { label: "Explainable AI", icon: "💡" },
    { label: "Zero-Day Detection", icon: "🛡️" },
    { label: "Real-Time Analysis", icon: "⚡" },
    { label: "Multi-Modal Security", icon: "🔍" },
  ];

  return (
    <section className="py-12 border-y border-glass-border bg-black/20">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-medium text-foreground/50 mb-6 uppercase tracking-wider">
          Trusted capabilities powering the platform
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 lg:gap-12">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel opacity-80 hover:opacity-100 transition-opacity"
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="font-medium text-sm md:text-base text-foreground/80">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
