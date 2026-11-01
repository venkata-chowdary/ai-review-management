import type { Metadata } from "next";
import { Suspense } from "react";
import { DateRange } from "@/components/overview/DateRange";
import { ActionQueue, KpiGrid, OverviewSkeleton, RatingBreakdown, RecentReviews } from "@/components/overview/Overview";
import { LocationSwitcherFallback, PillLocationSwitcher } from "@/components/shell/LocationSwitcher";
import { today } from "@/lib/mock/data";
import { demoState, getOverview } from "@/lib/mock/loaders";
import { locQuery, one } from "@/lib/search-params";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage({ searchParams }: PageProps<"/">) {
  return (
    <main className="flex flex-col gap-5 px-4 py-5 md:px-8 md:py-[26px]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13.5px] text-fg-muted">{today.dateLabel}</p>
          <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.02em]">{today.greeting}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Suspense fallback={<LocationSwitcherFallback variant="pill" />}>
            <PillLocationSwitcher align="end" />
          </Suspense>
          <DateRange align="end" />
        </div>
      </header>
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function OverviewContent({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = await searchParams;
  const state = demoState(params.state);
  if (state === "loading") return <OverviewSkeleton />;

  const loc = one(params.loc);
  const data = await getOverview({ state, locationId: loc });
  const query = locQuery(loc);

  return (
    <>
      <ActionQueue awaiting={data.awaitingApproval} failed={data.failed} usage={data.usage} query={query} />
      <KpiGrid kpis={data.kpis} />
      <section className="grid gap-3.5 min-[1360px]:grid-cols-[minmax(0,1fr)_320px]">
        <RecentReviews reviews={data.recent} query={query} />
        <div>
          <RatingBreakdown rows={data.ratingBreakdown} />
        </div>
      </section>
    </>
  );
}
