import type { Metadata } from "next";
import { Suspense } from "react";
import { DateRange } from "@/components/overview/DateRange";
import { KpiGrid, OverviewSkeleton, RatingBreakdown } from "@/components/overview/Overview";
import { LocationSwitcherFallback, PillLocationSwitcher } from "@/components/shell/LocationSwitcher";
import { Card, Meter, Rating, SectionTitle, SentimentLabel } from "@/components/ui/Display";
import { Page, PageHeader } from "@/components/ui/Page";
import { EmptyState } from "@/components/ui/States";
import { demoState, getInsights } from "@/lib/mock/loaders";
import type { Sentiment } from "@/lib/mock/types";

export const metadata: Metadata = { title: "Insights" };

// Provisional: composed from system components; no mockup exists yet.
export default function InsightsPage({ searchParams }: PageProps<"/insights">) {
  return (
    <Page>
      <PageHeader
        title="Insights"
        description="How your reviews are trending across locations."
        actions={
          <>
            <Suspense fallback={<LocationSwitcherFallback variant="pill" />}>
              <PillLocationSwitcher align="end" />
            </Suspense>
            <DateRange align="end" />
          </>
        }
      />
      <Suspense fallback={<OverviewSkeleton />}>
        <InsightsContent searchParams={searchParams} />
      </Suspense>
    </Page>
  );
}

async function InsightsContent({ searchParams }: Pick<PageProps<"/insights">, "searchParams">) {
  const state = demoState((await searchParams).state);
  if (state === "loading") return <OverviewSkeleton />;
  const data = await getInsights({ state });

  if (data.weekly.length === 0)
    return (
      <Card>
        <EmptyState icon="insights" title="Not enough reviews yet">
          Insights appear once your locations have a few weeks of Google reviews.
        </EmptyState>
      </Card>
    );

  const totalSentiment = data.sentiment.reduce((n, s) => n + s.count, 0);
  const maxAttr = Math.max(...data.attributes.map((a) => a.count));

  return (
    <>
      <KpiGrid kpis={data.kpis} label="Review health" />
      <KpiGrid kpis={data.replyKpis} label="Replies and AI" />

      <section className="grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="px-5 py-4">
          <SectionTitle>Reviews received per week</SectionTitle>
          <WeeklyBars caption="Reviews received per week" bars={data.weekly.map((w) => ({ week: w.week, value: w.count, label: String(w.count) }))} />
        </Card>
        <RatingBreakdown rows={data.ratingBreakdown} />
      </section>

      <section className="grid gap-3.5 lg:grid-cols-2">
        <Card className="px-5 py-4">
          <SectionTitle>Rating trend</SectionTitle>
          <p className="text-[12px] text-fg-muted">Average rating of reviews received each week.</p>
          <WeeklyBars
            caption="Average rating per week"
            min={RATING_FLOOR}
            max={5}
            bars={data.ratingTrend.map((w) => ({ week: w.week, value: w.rating, label: w.rating.toFixed(1) }))}
          />
        </Card>
        <SentimentTrend weeks={data.sentimentTrend} />
      </section>

      <section className="grid gap-3.5 lg:grid-cols-2">
        <Card className="px-5 py-4">
          <SectionTitle>Sentiment</SectionTitle>
          <dl className="mt-3 flex flex-col gap-3 text-[13px]">
            {data.sentiment.map((s) => (
              <div key={s.sentiment} className="grid grid-cols-[96px_1fr_64px] items-center gap-3">
                <dt className="font-semibold">
                  <SentimentLabel value={s.sentiment} />
                </dt>
                <dd className="contents">
                  <Meter value={s.count} max={totalSentiment} label={`${s.sentiment} reviews`} />
                  <span className="text-right text-fg-muted">
                    {s.count} · {Math.round((s.count / totalSentiment) * 100)}%
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card className="px-5 py-4">
          <SectionTitle>What QR visitors mention</SectionTitle>
          <p className="text-[12px] text-fg-muted">Attributes customers picked on your QR page this month.</p>
          <dl className="mt-3 flex flex-col gap-2.5 text-[13px]">
            {data.attributes.map((a) => (
              <div key={a.label} className="grid grid-cols-[120px_1fr_40px] items-center gap-3">
                <dt className="font-semibold">{a.label}</dt>
                <dd className="contents">
                  <Meter value={a.count} max={maxAttr} label={`${a.label} mentions`} />
                  <span className="text-right text-fg-muted">{a.count}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <SectionTitle className="px-5 pt-4 pb-3">By location</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-[13px]">
            <thead>
              <tr className="[&>th]:border-y [&>th]:border-line [&>th]:bg-app [&>th]:px-5 [&>th]:py-[9px] [&>th]:text-left [&>th]:text-[12px] [&>th]:font-semibold [&>th]:text-fg-muted">
                <th>Location</th>
                <th>Average rating</th>
                <th>Reviews · 30d</th>
                <th>Reply rate</th>
              </tr>
            </thead>
            <tbody>
              {data.byLocation.map((l) => (
                <tr key={l.locationId} className="[&>td]:border-b [&>td]:border-line [&>td]:px-5 [&>td]:py-[11px] last:[&>td]:border-b-0 hover:[&>td]:bg-row-hover">
                  <td className="font-bold">{l.location.name}</td>
                  <td>
                    <Rating value={l.rating} />
                  </td>
                  <td>{l.reviews}</td>
                  <td>{l.replyRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/** Bars start here so week-to-week rating changes stay visible. */
const RATING_FLOOR = 3.5;

type Bar = { week: string; value: number; label: string };

function WeekLabels({ weeks }: { weeks: string[] }) {
  return (
    <div aria-hidden="true" className="mt-2 flex gap-1.5 text-[10.5px] font-medium text-fg-muted sm:gap-2.5">
      {weeks.map((w, i) => (
        <span key={w} className={i % 2 ? "hidden flex-1 text-center sm:block" : "flex-1 text-center"}>
          {w}
        </span>
      ))}
    </div>
  );
}

/** One bar per week, the latest in blue, with a screen-reader table. */
function WeeklyBars({ bars, caption, min = 0, max }: { bars: Bar[]; caption: string; min?: number; max?: number }) {
  const top = max ?? Math.max(...bars.map((b) => b.value), 1);
  return (
    <figure className="mt-4">
      <div aria-hidden="true" className="flex h-44 items-end gap-1.5 sm:gap-2.5">
        {bars.map((b, i) => (
          <div key={b.week} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[11px] font-semibold text-fg-muted">{b.label}</span>
            <span
              className={i === bars.length - 1 ? "w-full rounded-[6px] bg-primary" : "w-full rounded-[6px] bg-subtle"}
              style={{ height: `${Math.max(2, ((b.value - min) / (top - min)) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <WeekLabels weeks={bars.map((b) => b.week)} />
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {bars.map((b) => (
            <tr key={b.week}>
              <th scope="row">Week of {b.week}</th>
              <td>{b.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

const sentimentFill: Record<Sentiment, string> = {
  positive: "bg-success",
  neutral: "bg-fg-muted/40",
  negative: "bg-danger",
};
// Top to bottom inside each column, so positive sits on the baseline.
const stackOrder: Sentiment[] = ["negative", "neutral", "positive"];

/** Share of each sentiment per week as 100% stacked columns. */
function SentimentTrend({ weeks }: { weeks: ({ week: string } & Record<Sentiment, number>)[] }) {
  return (
    <Card className="px-5 py-4">
      <SectionTitle>Sentiment trend</SectionTitle>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-fg-muted">
        {[...stackOrder].reverse().map((s) => (
          <li key={s} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-2.5 rounded-[3px] ${sentimentFill[s]}`} />
            <SentimentLabel value={s} />
          </li>
        ))}
      </ul>
      <figure className="mt-4">
        <div aria-hidden="true" className="flex h-44 items-end gap-1.5 sm:gap-2.5">
          {weeks.map((w) => {
            const total = w.positive + w.neutral + w.negative || 1;
            return (
              <div key={w.week} className="flex h-full flex-1 flex-col gap-px overflow-hidden rounded-[6px]">
                {stackOrder.map((s) => (
                  <span key={s} className={sentimentFill[s]} style={{ height: `${(w[s] / total) * 100}%` }} />
                ))}
              </div>
            );
          })}
        </div>
        <WeekLabels weeks={weeks.map((w) => w.week)} />
        <table className="sr-only">
          <caption>Reviews per sentiment each week</caption>
          <thead>
            <tr>
              <th scope="col">Week</th>
              <th scope="col">Positive</th>
              <th scope="col">Neutral</th>
              <th scope="col">Negative</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.week}>
                <th scope="row">Week of {w.week}</th>
                <td>{w.positive}</td>
                <td>{w.neutral}</td>
                <td>{w.negative}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </Card>
  );
}
