import Link from "next/link";
import { cn } from "@/lib/cn";
import { ago } from "@/lib/format";
import { Icon } from "@/components/icons/Icon";
import { StatusBadge } from "@/components/ui/Badge";
import { Avatar, Rating, SentimentLabel } from "@/components/ui/Display";
import { Skeleton } from "@/components/ui/States";
import { getLocation } from "@/lib/mock/loaders";
import type { Kpi, Review } from "@/lib/mock/types";
import { DraftPanel } from "./DraftPanel";

/** One-line metrics strip: four figures separated by hairlines. */
export function MetricsStrip({ kpis }: { kpis: Kpi[] }) {
  return (
    <dl className="grid grid-cols-2 border-b border-line bg-surface md:grid-cols-4">
      {kpis.map((k, i) => (
        <div
          key={k.label}
          className={cn(
            "border-line px-4 py-3 md:px-7",
            i % 2 === 1 && "border-l",
            i >= 2 && "border-t md:border-t-0",
            i === 2 && "md:border-l",
          )}
        >
          <dt className="text-[11.5px] font-semibold text-fg-muted">{k.label === "New reviews" ? "New reviews · 30d" : k.label}</dt>
          <dd className="flex items-baseline gap-2 text-[20px] leading-[26px] font-bold tracking-[-0.01em]">
            {k.value}
            {k.delta && k.label === "Average rating" && <small className="text-[11.5px] font-semibold text-fg-muted">{k.delta}</small>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * `implicit` is the first review, shown in the detail pane from 1024px when
 * nothing was chosen; on phones it stays unselected until tapped.
 */
export function ReviewRow({
  review,
  href,
  selected,
}: {
  review: Review;
  href: string;
  selected: "explicit" | "implicit" | false;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={selected === "explicit" ? "true" : undefined}
      className={cn(
        "grid w-full grid-cols-[34px_minmax(0,1fr)] gap-2.5 rounded-menu p-2.5 text-left transition-colors",
        selected === "explicit" && "bg-selection",
        selected === "implicit" && "hover:bg-row-hover lg:bg-selection",
        !selected && "hover:bg-row-hover",
      )}
    >
      <Avatar name={review.reviewer} />
      <span className="min-w-0">
        <span className="flex items-center justify-between gap-2">
          <b className="text-[13.5px] font-bold">{review.reviewer}</b>
          <span className="text-[11.5px] font-medium text-fg-muted">{ago(review.ageMinutes)}</span>
        </span>
        <span className="mt-0.5 mb-1.5 block truncate text-[12.5px] leading-[18px] text-fg-muted">{review.text}</span>
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1">
            <Rating value={review.rating} />
            <span className="text-[12px] font-medium text-fg-muted">· {getLocation(review.locationId)?.name}</span>
          </span>
          <StatusBadge status={review.status} />
        </span>
      </span>
    </Link>
  );
}

export function ReviewDetail({ review }: { review: Review }) {
  const location = getLocation(review.locationId);
  return (
    <article aria-label={`Review by ${review.reviewer}`} className="flex flex-col gap-4 px-4 py-5 md:px-7 md:py-[22px]">
      <header className="flex items-start gap-3">
        <Avatar name={review.reviewer} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] leading-[22px] font-bold">{review.reviewer}</h2>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] leading-[18px] text-fg-muted">
            <Rating value={review.rating} className="text-fg" />
            <SentimentLabel value={review.sentiment} />
            <span className="inline-flex items-center gap-1">
              <Icon name="store" size={13} />
              Google · {location?.name}
            </span>
            <span>{review.receivedAt}</span>
          </div>
        </div>
        <span className="hidden sm:block">
          <StatusBadge status={review.status} />
        </span>
      </header>
      <span className="sm:hidden">
        <StatusBadge status={review.status} />
      </span>

      <p className="text-[15px] leading-6">{review.text}</p>

      {review.status === "published" ? (
        <div className="rounded-inner border border-line bg-surface px-4 py-3.5">
          <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-success">
            <Icon name="status-published" size={13} />
            Reply published on Google
          </p>
          <p>{review.reply}</p>
        </div>
      ) : (
        // Keyed so switching reviews resets edits and pending states.
        <DraftPanel key={review.id} review={review} />
      )}

      <ol className="flex flex-col gap-2 border-t border-line pt-3.5 text-[12.5px] text-fg-muted">
        {review.timeline.map((e, i) => (
          <li key={i} className="flex items-center gap-2">
            <span aria-hidden="true" className={cn("size-2 flex-none rounded-pill", i === review.timeline.length - 1 ? "bg-primary" : "bg-control")} />
            {e.label}
            {e.at && ` · ${e.at}`}
          </li>
        ))}
      </ol>
    </article>
  );
}

export function ReviewListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading reviews" className="flex flex-col gap-1 px-2 pb-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="grid grid-cols-[34px_1fr] gap-2.5 p-2.5">
          <Skeleton className="size-[34px] rounded-pill" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-[22px] w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewDetailSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4 px-7 py-[22px]">
      <div className="flex gap-3">
        <Skeleton className="size-[34px] rounded-pill" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-28 w-full rounded-inner" />
      <Skeleton className="h-10 w-2/3" />
    </div>
  );
}
