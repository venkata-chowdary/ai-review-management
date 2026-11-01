import Link from "next/link";
import { cn } from "@/lib/cn";
import { ago } from "@/lib/format";
import { Icon } from "@/components/icons/Icon";
import { StatusBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Avatar, Card, Meter, Rating, SectionTitle, Spark } from "@/components/ui/Display";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { getLocation } from "@/lib/mock/loaders";
import type { Kpi, Review, Usage } from "@/lib/mock/types";

const qIcon = "grid size-9 flex-none place-items-center rounded-pill";

/** Three action cards: approvals (lead, glossy blue), failures, AI allowance. */
export function ActionQueue({ awaiting, failed, usage, query }: { awaiting: number; failed: number; usage: Usage; query: string }) {
  const left = usage.limit - usage.used;
  return (
    <section aria-label="Action queue" className="grid gap-3.5 md:grid-cols-[1.35fr_1fr_1fr]">
      {awaiting > 0 ? (
        <div className="flex flex-col gap-3 rounded-card border border-primary bg-primary px-5 py-[18px] text-on-primary shadow-button-primary">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[34px] leading-[38px] font-bold tracking-[-0.02em]">{awaiting}</p>
              <p className="text-[13px] leading-[19px]">replies waiting for your approval</p>
            </div>
            <span className={cn(qIcon, "bg-white/[.18] shadow-[inset_0_1px_0_rgba(255,255,255,.35)]")}>
              <Icon name="status-awaiting" />
            </span>
          </div>
          <div>
            <ButtonLink href={`/reviews${query}`} variant="on-primary" size="md" trailingIcon="chevron-right">
              Review now
            </ButtonLink>
          </div>
        </div>
      ) : (
        <Card className="flex flex-col gap-3 px-5 py-[18px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[34px] leading-[38px] font-bold tracking-[-0.02em]">0</p>
              <p className="text-[13px] leading-[19px] text-fg-muted">All caught up. No replies are waiting for approval.</p>
            </div>
            <span className={cn(qIcon, "bg-success-bg text-success")}>
              <Icon name="status-published" />
            </span>
          </div>
        </Card>
      )}
      <Card className="flex flex-col gap-3 px-5 py-[18px]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[34px] leading-[38px] font-bold tracking-[-0.02em]">{failed}</p>
            <p className="text-[13px] leading-[19px] text-fg-muted">
              {failed === 1 ? "reply failed to publish on Google" : "replies failed to publish on Google"}
            </p>
          </div>
          <span className={cn(qIcon, failed ? "bg-danger-bg text-danger" : "bg-subtle")}>
            <Icon name="alert" />
          </span>
        </div>
        {failed > 0 && (
          <div>
            <ButtonLink href={`/reviews?tab=failed${query ? `&${query.slice(1)}` : ""}`} icon="refresh" iconMotion="spin">
              Retry
            </ButtonLink>
          </div>
        )}
      </Card>
      <Card className="flex flex-col gap-3 px-5 py-[18px]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[34px] leading-[38px] font-bold tracking-[-0.02em]">{left}</p>
            <p className="text-[13px] leading-[19px] text-fg-muted">AI replies left this month · resets {usage.resetsOn}</p>
          </div>
          <span className={cn(qIcon, "bg-subtle")}>
            <Icon name="sliders" />
          </span>
        </div>
        <Meter value={usage.used} max={usage.limit} label="AI replies used this month" />
      </Card>
    </section>
  );
}

export function KpiTile({ kpi }: { kpi: Kpi }) {
  return (
    <Card className="px-[18px] py-4">
      <p className="text-[12px] font-semibold text-fg-muted">{kpi.label}</p>
      <p className="flex items-baseline gap-2 text-[28px] leading-[34px] font-bold tracking-[-0.02em]">
        {kpi.value}
        {kpi.delta && (
          <small className="inline-flex items-center gap-[3px] text-[12px] font-semibold tracking-normal text-fg-muted">
            <Icon name={kpi.trend === "down" ? "trend-down" : "trend-up"} size={13} />
            {kpi.delta}
          </small>
        )}
      </p>
      <Spark values={kpi.weekly} label={`${kpi.label}, last 8 weeks`} />
    </Card>
  );
}

export function KpiGrid({ kpis, label = "Key metrics" }: { kpis: Kpi[]; label?: string }) {
  return (
    <section aria-label={label} className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((k) => (
        <KpiTile key={k.label} kpi={k} />
      ))}
    </section>
  );
}

export function RecentReviews({ reviews, query }: { reviews: Review[]; query: string }) {
  const amp = query ? `&${query.slice(1)}` : "";
  return (
    <Card className="min-w-0 overflow-hidden pt-1.5">
      <div className="flex items-center justify-between px-5 pt-3 pb-2.5">
        <SectionTitle>Recent reviews</SectionTitle>
        <ButtonLink href={`/reviews?tab=all${amp}`} variant="text" trailingIcon="chevron-right">
          View all
        </ButtonLink>
      </div>
      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" className="border-t border-line">
          New Google reviews appear here once a location is connected.
        </EmptyState>
      ) : (
        <>
          {/* Table from 768px */}
          <table className="hidden w-full table-fixed border-collapse text-[13px] md:table">
            <thead>
              <tr className="[&>th]:border-y [&>th]:border-line [&>th]:bg-app [&>th]:px-5 [&>th]:py-[9px] [&>th]:text-left [&>th]:text-[12px] [&>th]:font-semibold [&>th]:text-fg-muted">
                <th className="w-[150px]">Reviewer</th>
                <th className="w-24">Rating</th>
                <th>Review</th>
                <th className="hidden w-24 xl:table-cell">Location</th>
                <th className="w-[150px]">Status</th>
                <th className="w-16">When</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr
                  key={r.id}
                  className="group/row relative [&>td]:border-b [&>td]:border-line [&>td]:px-5 [&>td]:py-[11px] [&>td]:align-middle last:[&>td]:border-b-0 hover:[&>td]:bg-row-hover"
                >
                  <td>
                    <Link
                      href={`/reviews?tab=all&id=${r.id}${amp}`}
                      className="flex items-center gap-2.5 font-bold whitespace-nowrap after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus"
                    >
                      <Avatar name={r.reviewer} size={28} />
                      {r.reviewer}
                    </Link>
                  </td>
                  <td>
                    <Rating value={r.rating} />
                  </td>
                  <td>
                    <span className="block truncate text-fg-muted">{r.text}</span>
                  </td>
                  <td className="hidden text-fg-muted xl:table-cell">{getLocation(r.locationId)?.name}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="text-fg-muted">{ago(r.ageMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Stacked rows below 768px */}
          <ul className="border-t border-line md:hidden">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-line last:border-b-0">
                <Link href={`/reviews?tab=all&id=${r.id}${amp}`} className="flex gap-2.5 px-4 py-3 hover:bg-row-hover">
                  <Avatar name={r.reviewer} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <b className="text-[13.5px]">{r.reviewer}</b>
                      <span className="text-[11.5px] font-medium text-fg-muted">{ago(r.ageMinutes)}</span>
                    </span>
                    <span className="mt-0.5 mb-1.5 block truncate text-[12.5px] leading-[18px] text-fg-muted">{r.text}</span>
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <Rating value={r.rating} />
                      <StatusBadge status={r.status} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

export function RatingBreakdown({ rows }: { rows: { stars: number; count: number }[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <Card className="px-[18px] py-4">
      <SectionTitle>Rating breakdown</SectionTitle>
      <dl className="mt-2.5 flex flex-col gap-[7px] text-[12px]">
        {rows.map((r) => (
          <div key={r.stars} className="grid grid-cols-[22px_1fr_30px] items-center gap-2 font-semibold text-fg-muted">
            <dt>
              {r.stars}★<span className="sr-only"> reviews</span>
            </dt>
            <dd className="contents">
              <Meter value={r.count} max={max} label={`${r.stars} star reviews`} height="h-[7px]" />
              <span>{r.count}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export function OverviewSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading overview" className="flex flex-col gap-5">
      <div className="grid gap-3.5 md:grid-cols-[1.35fr_1fr_1fr]">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="flex flex-col gap-3 px-5 py-[18px]">
            <Skeleton className="h-[38px] w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-28 rounded-pill" />
          </Card>
        ))}
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col gap-2 px-[18px] py-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-[34px] w-20" />
            <Skeleton className="h-[30px] w-full" />
          </Card>
        ))}
      </div>
      <Card className="flex flex-col gap-3 p-5">
        <Skeleton className="h-6 w-40" />
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </Card>
    </div>
  );
}
