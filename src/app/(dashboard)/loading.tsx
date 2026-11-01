import { Skeleton } from "@/components/ui/States";
import { OverviewSkeleton } from "@/components/overview/Overview";

export default function DashboardLoading() {
  return (
    <main className="flex flex-col gap-5 px-4 py-5 md:px-8 md:py-[26px]">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[34px] w-56" />
      </div>
      <OverviewSkeleton />
    </main>
  );
}
