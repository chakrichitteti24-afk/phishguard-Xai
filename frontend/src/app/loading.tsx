import { Skeleton } from "@/components/ui/Skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-6">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
