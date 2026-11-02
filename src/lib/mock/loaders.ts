import {
  attributeMentions,
  kpis,
  branches,
  branchStats,
  ratingBreakdown,
  replyKpis,
  reviews,
  sentimentSplit,
  today,
  usage,
  weeklyRating,
  weeklyReviews,
  weeklySentiment,
} from "./data";
import type { DemoState, Branch, Overview, ReplyStatus, Review } from "./types";

// Async loaders shaped like the future Supabase queries. Phase 2 swaps their
// bodies; pages and components keep calling them the same way.

const LATENCY_MS = 250;

export const NEEDS_REPLY: ReplyStatus[] = ["awaiting", "draft"];

function wait() {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

/** Reads the dev-only ?state= override. Ignored in production. */
export function demoState(value: string | string[] | undefined): DemoState | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  return value === "empty" || value === "error" || value === "loading" ? value : undefined;
}

async function prepare(state?: DemoState) {
  await wait();
  if (state === "error") throw new Error("Couldn’t load data. (Simulated with ?state=error.)");
}

export function getBranch(id: string | undefined): Branch | undefined {
  return branches.find((l) => l.id === id);
}

export function getBranchByQrCode(code: string): Branch | undefined {
  return branches.find((l) => l.qrCode === code);
}

function forBranch(list: Review[], branchId?: string) {
  return branchId && getBranch(branchId) ? list.filter((r) => r.branchId === branchId) : list;
}

export async function getOverview({ state, branchId }: { state?: DemoState; branchId?: string } = {}): Promise<Overview> {
  await prepare(state);
  const scoped = state === "empty" ? [] : forBranch(reviews, branchId);
  return {
    ...today,
    awaitingApproval: scoped.filter((r) => NEEDS_REPLY.includes(r.status)).length,
    failed: scoped.filter((r) => r.status === "failed").length,
    usage,
    kpis: state === "empty" ? kpis.map((k) => ({ ...k, value: "—", delta: undefined, weekly: k.weekly.map(() => 0) })) : kpis,
    recent: scoped.slice(0, 5),
    ratingBreakdown: state === "empty" ? ratingBreakdown.map((r) => ({ ...r, count: 0 })) : ratingBreakdown,
  };
}

export type ReviewTab = "needs-reply" | "all" | "failed";

export async function getReviews({
  state,
  branchId,
  tab = "needs-reply",
  query,
}: {
  state?: DemoState;
  branchId?: string;
  tab?: ReviewTab;
  query?: string;
} = {}) {
  await prepare(state);
  let scoped = state === "empty" ? [] : forBranch(reviews, branchId);
  if (query) {
    const q = query.toLowerCase();
    scoped = scoped.filter((r) => r.reviewer.toLowerCase().includes(q) || r.text.toLowerCase().includes(q));
  }
  const counts = {
    "needs-reply": scoped.filter((r) => NEEDS_REPLY.includes(r.status)).length,
    all: scoped.length,
    failed: scoped.filter((r) => r.status === "failed").length,
  };
  const list =
    tab === "all" ? scoped : scoped.filter((r) => (tab === "failed" ? r.status === "failed" : NEEDS_REPLY.includes(r.status)));
  return { reviews: list, counts };
}

export async function getBranches({ state }: { state?: DemoState } = {}) {
  await prepare(state);
  return state === "empty" ? [] : branches;
}

export async function getUsage({ state }: { state?: DemoState } = {}) {
  await prepare(state);
  return usage;
}

export async function getInsights({ state }: { state?: DemoState } = {}) {
  await prepare(state);
  const empty = state === "empty";
  const live: Record<string, string> = {
    "Unanswered reviews": String(reviews.filter((r) => r.status !== "published").length),
    "Pending approvals": String(reviews.filter((r) => NEEDS_REPLY.includes(r.status)).length),
    "AI usage": `${Math.round((usage.used / usage.limit) * 100)}%`,
  };
  return {
    kpis,
    replyKpis: replyKpis.map((k) => (k.label in live ? { ...k, value: live[k.label] } : k)),
    weekly: empty ? [] : weeklyReviews,
    ratingTrend: empty ? [] : weeklyRating,
    sentimentTrend: empty ? [] : weeklySentiment,
    ratingBreakdown: empty ? ratingBreakdown.map((r) => ({ ...r, count: 0 })) : ratingBreakdown,
    sentiment: empty ? [] : sentimentSplit,
    byBranch: empty ? [] : branchStats.map((s) => ({ ...s, branch: getBranch(s.branchId)! })),
    attributes: empty ? [] : attributeMentions,
  };
}

/** Synchronous counts for the navigation (no latency, never empty). */
export function getNavCounts() {
  return { needsReply: reviews.filter((r) => NEEDS_REPLY.includes(r.status)).length };
}
