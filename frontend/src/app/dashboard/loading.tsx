export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      <div className="h-8 w-64 bg-white/5 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 bg-white/5 rounded-xl border border-white/5" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-white/5 rounded-xl border border-white/5" />
        <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
      </div>
    </div>
  );
}
