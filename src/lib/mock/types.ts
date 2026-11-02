// Shapes the UI renders. Phase 2 maps Supabase rows onto these.

export type ReplyStatus = "draft" | "awaiting" | "queued" | "published" | "failed";
export type Sentiment = "positive" | "neutral" | "negative";
export type Tone = "Warm" | "Friendly" | "Professional" | "Formal";

export type Branch = {
  id: string;
  name: string;
  /** The branch on Google Maps, as the owner pasted it in onboarding. */
  googleMapsUrl: string;
  googleConnected: boolean;
  /** QR codes resolve to /r/{qrCode}. */
  qrCode: string;
  placeId: string;
  aiPaused: boolean;
  scansThisMonth: number;
};

export type TimelineEvent = { label: string; at: string };

export type Review = {
  id: string;
  reviewer: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  branchId: string;
  status: ReplyStatus;
  sentiment: Sentiment;
  /** Minutes since the review arrived; drives sorting and "2d" labels. */
  ageMinutes: number;
  receivedAt: string;
  draft?: { text: string; tone: Tone };
  reply?: string;
  heldByRule?: string;
  error?: string;
  timeline: TimelineEvent[];
};

export type Kpi = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  /** Eight weekly values, oldest first; the last bar is highlighted. */
  weekly: number[];
};

export type Usage = { used: number; limit: number; resetsOn: string };

export type Overview = {
  dateLabel: string;
  greeting: string;
  awaitingApproval: number;
  failed: number;
  usage: Usage;
  kpis: Kpi[];
  recent: Review[];
  ratingBreakdown: { stars: number; count: number }[];
};

/** Dev-only override to preview each data state: ?state=empty|error|loading */
export type DemoState = "empty" | "error" | "loading";
