import type { Metadata } from "next";
import Form from "next/form";
import { Suspense } from "react";
import { Icon } from "@/components/icons/Icon";
import { ReviewSheet, SyncButton } from "@/components/reviews/ClientBits";
import { MetricsStrip, ReviewDetail, ReviewDetailSkeleton, ReviewListSkeleton, ReviewRow } from "@/components/reviews/Reviews";
import { ButtonLink } from "@/components/ui/Button";
import { LinkTabs } from "@/components/ui/Tabs";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { kpis } from "@/lib/mock/data";
import { demoState, getReviews, type ReviewTab } from "@/lib/mock/loaders";
import { one } from "@/lib/search-params";

export const metadata: Metadata = { title: "Reviews" };

const tabs: { value: ReviewTab; label: string }[] = [
  { value: "needs-reply", label: "Needs reply" },
  { value: "all", label: "All" },
  { value: "failed", label: "Failed" },
];

type Query = { tab: ReviewTab; id?: string; q?: string; loc?: string };

function reviewsHref({ tab, id, q, loc }: Query) {
  const p = new URLSearchParams();
  if (tab !== "needs-reply") p.set("tab", tab);
  if (loc) p.set("loc", loc);
  if (q) p.set("q", q);
  if (id) p.set("id", id);
  const qs = p.toString();
  return qs ? `/reviews?${qs}` : "/reviews";
}

// Inbox split: header, metrics strip, review list beside the detail panel.
// From 1024px the page fills the viewport and the two panes scroll.
export default function ReviewsPage({ searchParams }: PageProps<"/reviews">) {
  return (
    <main className="flex flex-col lg:h-dvh lg:overflow-hidden">
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ReviewsContent({ searchParams }: Pick<PageProps<"/reviews">, "searchParams">) {
  const params = await searchParams;
  const state = demoState(params.state);
  if (state === "loading") return <ReviewsSkeleton />;

  const tabParam = one(params.tab);
  const tab: ReviewTab = tabParam === "all" || tabParam === "failed" ? tabParam : "needs-reply";
  const q = one(params.q)?.trim() || undefined;
  const loc = one(params.loc);
  const explicitId = one(params.id);

  const { reviews, counts } = await getReviews({ state, tab, query: q, branchId: loc });
  const selected = reviews.find((r) => r.id === explicitId) ?? reviews[0];
  const base: Query = { tab, q, loc };

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 md:min-h-[68px] md:px-7">
        <div>
          <h1 className="text-[22px] leading-7 font-bold tracking-[-0.015em]">Reviews</h1>
          <p className="text-[12.5px] text-fg-muted">
            {counts["needs-reply"]} need a reply · synced 4 min ago
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Form action="/reviews" role="search" className="relative flex-1 sm:w-[260px] sm:flex-none">
            {tab !== "needs-reply" && <input type="hidden" name="tab" value={tab} />}
            {loc && <input type="hidden" name="loc" value={loc} />}
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-muted" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search reviews"
              aria-label="Search reviews"
              className="h-control-md w-full rounded-pill border border-control bg-surface pr-3.5 pl-[38px] text-[13.5px] outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--selection-bg)] max-md:text-[16px]"
            />
          </Form>
          <SyncButton lastSynced="4 min ago" />
        </div>
      </header>

      <MetricsStrip kpis={kpis} />

      <div className="grid min-h-0 flex-1 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[var(--list-pane-width)_minmax(0,1fr)]">
        <section aria-label="Review list" className="flex min-h-0 flex-col border-line bg-surface lg:border-r">
          <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2.5">
            <LinkTabs
              label="Review filters"
              tabs={tabs.map((t) => ({
                href: reviewsHref({ ...base, tab: t.value }),
                label: t.label,
                count: t.value === "all" ? undefined : counts[t.value] || undefined,
                selected: t.value === tab,
              }))}
            />
          </div>
          {reviews.length === 0 ? (
            <ListEmpty tab={tab} q={q} clearHref={reviewsHref({ tab, loc })} allHref={reviewsHref({ tab: "all", loc })} />
          ) : (
            <ul className="flex flex-col gap-0.5 px-2 pb-2 lg:overflow-y-auto">
              {reviews.map((r) => (
                <li key={r.id}>
                  <ReviewRow
                    review={r}
                    href={reviewsHref({ ...base, id: r.id })}
                    selected={r.id !== selected?.id ? false : r.id === explicitId ? "explicit" : "implicit"}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Review detail" className="hidden min-h-0 overflow-y-auto bg-app lg:block">
          {selected ? (
            <ReviewDetail review={selected} />
          ) : (
            <EmptyState icon="status-published" title="Nothing selected" className="h-full justify-center">
              Choose a review from the list to see it here.
            </EmptyState>
          )}
        </section>
      </div>

      {selected && explicitId === selected.id && (
        <ReviewSheet closeHref={reviewsHref(base)} label="Review">
          <ReviewDetail review={selected} />
        </ReviewSheet>
      )}
    </>
  );
}

function ListEmpty({ tab, q, clearHref, allHref }: { tab: ReviewTab; q?: string; clearHref: string; allHref: string }) {
  if (q)
    return (
      <EmptyState icon="search" title={`No reviews match “${q}”`} action={<ButtonLink href={clearHref}>Clear search</ButtonLink>}>
        Try a reviewer’s name or a word from their review.
      </EmptyState>
    );
  if (tab === "needs-reply")
    return (
      <EmptyState icon="status-published" title="All caught up" action={<ButtonLink href={allHref}>See all reviews</ButtonLink>}>
        No replies are waiting for your approval.
      </EmptyState>
    );
  if (tab === "failed")
    return (
      <EmptyState icon="status-published" title="No failed replies">
        Every approved reply reached Google.
      </EmptyState>
    );
  return (
    <EmptyState title="No reviews yet">New Google reviews appear here once a branch is connected.</EmptyState>
  );
}

function ReviewsSkeleton() {
  return (
    <>
      <div className="flex min-h-[68px] items-center justify-between gap-3 border-b border-line bg-surface px-4 md:px-7">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3.5 w-44" />
        </div>
        <Skeleton className="hidden h-control-md w-[260px] rounded-pill sm:block" />
      </div>
      <MetricsStrip kpis={kpis} />
      <div className="grid min-h-0 flex-1 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[var(--list-pane-width)_minmax(0,1fr)]">
        <div className="border-line bg-surface lg:border-r">
          <div className="px-4 pt-3.5 pb-2.5">
            <Skeleton className="h-9 w-64 rounded-pill" />
          </div>
          <ReviewListSkeleton />
        </div>
        <div className="hidden lg:block">
          <ReviewDetailSkeleton />
        </div>
      </div>
    </>
  );
}
