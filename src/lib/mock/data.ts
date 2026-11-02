import type { Kpi, Branch, Review, Tone, Usage } from "./types";

// Sample data for the Phase 1 UI. Reviewer names, texts and branches come
// from the approved mockups; the rest extends them so lists and tabs feel real.

export const businessName = "Harbour Kitchen";

export const branches: Branch[] = [
  {
    id: "downtown",
    name: "Downtown",
    googleMapsUrl: "https://maps.app.goo.gl/demoDowntown",
    googleConnected: true,
    qrCode: "demo-downtown",
    placeId: "ChIJ-demo-downtown",
    aiPaused: false,
    scansThisMonth: 214,
  },
  {
    id: "riverside",
    name: "Riverside",
    googleMapsUrl: "https://maps.app.goo.gl/demoRiverside",
    googleConnected: true,
    qrCode: "demo-riverside",
    placeId: "ChIJ-demo-riverside",
    aiPaused: false,
    scansThisMonth: 167,
  },
  {
    id: "airport",
    name: "Airport",
    googleMapsUrl: "https://maps.app.goo.gl/demoAirport",
    googleConnected: false,
    qrCode: "demo-airport",
    placeId: "ChIJ-demo-airport",
    aiPaused: true,
    scansThisMonth: 58,
  },
];

const approvalRule = "3★ or lower needs approval";

type Seed = Omit<Review, "timeline" | "receivedAt"> & { receivedAt: string };

function withTimeline(r: Seed): Review {
  const timeline = [{ label: "Review received from Google", at: r.receivedAt }];
  if (r.status !== "published" || r.draft) timeline.push({ label: "AI draft generated", at: r.receivedAt });
  if (r.heldByRule) timeline.push({ label: `Held for approval by rule “${r.heldByRule}”`, at: "" });
  if (r.status === "queued") timeline.push({ label: "Approved · queued to post on Google", at: "" });
  if (r.status === "failed") timeline.push({ label: `Publishing failed · ${r.error}`, at: "" });
  if (r.status === "published") timeline.push({ label: "Reply published on Google", at: "" });
  return { ...r, timeline };
}

function draft(text: string, tone: Tone = "Warm") {
  return { text, tone };
}

const seeds: Seed[] = [
  {
    id: "r-maya",
    reviewer: "Maya R.",
    rating: 2,
    text: "Waited almost 45 minutes for our mains on Saturday. Staff were apologetic and lovely, but the kitchen clearly couldn’t keep up.",
    branchId: "downtown",
    status: "awaiting",
    sentiment: "negative",
    ageMinutes: 2 * 1440,
    receivedAt: "Oct 31, 19:42",
    heldByRule: approvalRule,
    draft: draft(
      "Thank you for telling us about Saturday, Maya, and we’re sorry about the wait for your mains. That’s longer than it should be, and we’re looking at how the kitchen handles busy weekend evenings. We’re glad the team looked after you, and we’d love the chance to do better next time.",
    ),
  },
  {
    id: "r-priya",
    reviewer: "Priya S.",
    rating: 4,
    text: "Lovely brunch, the eggs were perfect. A little noisy around noon.",
    branchId: "riverside",
    status: "draft",
    sentiment: "positive",
    ageMinutes: 180,
    receivedAt: "Nov 2, 08:15",
    draft: draft(
      "Thanks so much, Priya! We’re delighted the eggs hit the spot. Noon does get lively at Riverside, so a late-morning table can be a little calmer next time.",
      "Friendly",
    ),
  },
  {
    id: "r-daniel",
    reviewer: "Daniel K.",
    rating: 1,
    text: "Cold coffee and nobody came back to check on us.",
    branchId: "airport",
    status: "failed",
    sentiment: "negative",
    ageMinutes: 1440,
    receivedAt: "Nov 1, 07:05",
    heldByRule: approvalRule,
    error: "Google access expired for Airport",
    draft: draft(
      "Daniel, we’re sorry your coffee arrived cold and that nobody checked back with you. That isn’t the service we aim for, and we’ve shared your feedback with the Airport team.",
      "Professional",
    ),
  },
  {
    id: "r-ana",
    reviewer: "Ana L.",
    rating: 3,
    text: "Good food, slow service. Would try again on a weekday.",
    branchId: "downtown",
    status: "queued",
    sentiment: "neutral",
    ageMinutes: 5,
    receivedAt: "Nov 2, 11:10",
    heldByRule: approvalRule,
    draft: draft(
      "Thanks, Ana. We’re glad you enjoyed the food and sorry service was slow. Weekdays are calmer, and we hope to see you then.",
    ),
  },
  {
    id: "r-jon",
    reviewer: "Jon T.",
    rating: 5,
    text: "Best flat white in the neighbourhood and the staff remember my order.",
    branchId: "riverside",
    status: "published",
    sentiment: "positive",
    ageMinutes: 4 * 1440,
    receivedAt: "Oct 29, 09:02",
    reply: "Thank you, Jon! Seeing regulars like you is the best part of our morning. See you at the counter soon.",
  },
  {
    id: "r-sofia",
    reviewer: "Sofia M.",
    rating: 2,
    text: "The table was sticky and our order came out wrong twice. The manager did take the drinks off the bill.",
    branchId: "downtown",
    status: "awaiting",
    sentiment: "negative",
    ageMinutes: 26 * 60,
    receivedAt: "Nov 1, 09:20",
    heldByRule: approvalRule,
    draft: draft(
      "Sofia, thank you for the honest feedback. We’re sorry about the table and the mix-ups with your order, and we’re glad our manager could help on the day. We’ve passed this on to the team.",
    ),
  },
  {
    id: "r-tom",
    reviewer: "Tom H.",
    rating: 3,
    text: "Portions were smaller than last time. Still tasty though.",
    branchId: "riverside",
    status: "awaiting",
    sentiment: "neutral",
    ageMinutes: 30 * 60,
    receivedAt: "Nov 1, 05:30",
    heldByRule: approvalRule,
    draft: draft("Thanks for coming back, Tom, and for letting us know about the portions. We’re glad it was still tasty and we’ve shared your note with the kitchen."),
  },
  {
    id: "r-lena",
    reviewer: "Lena W.",
    rating: 1,
    text: "Booked a table for six and they gave it away. Very disappointing for a birthday.",
    branchId: "downtown",
    status: "awaiting",
    sentiment: "negative",
    ageMinutes: 3 * 1440,
    receivedAt: "Oct 30, 20:11",
    heldByRule: approvalRule,
    draft: draft(
      "Lena, we’re truly sorry your birthday booking was not honoured. That should never happen, and we are reviewing how it did. We would like to put it right, so please contact the Downtown team directly.",
      "Professional",
    ),
  },
  {
    id: "r-omar",
    reviewer: "Omar F.",
    rating: 2,
    text: "Gate-side location is handy but the sandwich was dry and pricey.",
    branchId: "airport",
    status: "awaiting",
    sentiment: "negative",
    ageMinutes: 2 * 1440 + 300,
    receivedAt: "Oct 31, 14:10",
    heldByRule: approvalRule,
    draft: draft("Thanks for stopping by before your flight, Omar. We’re sorry the sandwich was dry, and we’ve passed your comments on price and quality to the Airport team."),
  },
  {
    id: "r-grace",
    reviewer: "Grace N.",
    rating: 3,
    text: "Nice coffee, but the music was far too loud to chat.",
    branchId: "riverside",
    status: "awaiting",
    sentiment: "neutral",
    ageMinutes: 5 * 60,
    receivedAt: "Nov 2, 06:12",
    heldByRule: approvalRule,
    draft: draft("Thanks, Grace. We’re glad you liked the coffee and we hear you on the music. We’ll keep the volume friendlier for conversation."),
  },
  {
    id: "r-ben",
    reviewer: "Ben A.",
    rating: 2,
    text: "Card machine was down and they only took cash. No sign at the door.",
    branchId: "downtown",
    status: "awaiting",
    sentiment: "negative",
    ageMinutes: 8 * 60,
    receivedAt: "Nov 2, 03:40",
    heldByRule: approvalRule,
    draft: draft("Ben, sorry for the trouble with payment. We should have put a sign at the door, and the card machine is now fixed."),
  },
  {
    id: "r-ruth",
    reviewer: "Ruth P.",
    rating: 3,
    text: "Decent lunch, though the soup was lukewarm.",
    branchId: "airport",
    status: "awaiting",
    sentiment: "neutral",
    ageMinutes: 2 * 60,
    receivedAt: "Nov 2, 09:05",
    heldByRule: approvalRule,
    draft: draft("Thanks, Ruth. Glad lunch was decent, and sorry the soup wasn’t hot enough. We’ve flagged it with the kitchen."),
  },
  {
    id: "r-kenji",
    reviewer: "Kenji O.",
    rating: 5,
    text: "Fantastic ramen special, rich broth and friendly service.",
    branchId: "downtown",
    status: "draft",
    sentiment: "positive",
    ageMinutes: 40,
    receivedAt: "Nov 2, 10:35",
    draft: draft("Thank you, Kenji! We’ll tell the kitchen you loved the broth. The ramen special runs all month.", "Friendly"),
  },
  {
    id: "r-chloe",
    reviewer: "Chloe B.",
    rating: 4,
    text: "Great pastries. Seating outside is limited on sunny days.",
    branchId: "riverside",
    status: "draft",
    sentiment: "positive",
    ageMinutes: 6 * 60,
    receivedAt: "Nov 2, 05:20",
    draft: draft("Thanks, Chloe! We’re glad you enjoyed the pastries. Sunny days fill the terrace fast, so earlier is best for an outdoor seat.", "Friendly"),
  },
  {
    id: "r-ivan",
    reviewer: "Ivan D.",
    rating: 5,
    text: "Quick, friendly and the croissant was still warm. Perfect before a flight.",
    branchId: "airport",
    status: "draft",
    sentiment: "positive",
    ageMinutes: 12 * 60,
    receivedAt: "Nov 1, 23:30",
    draft: draft("Thanks, Ivan, and safe travels! We’re glad we could send you off with a warm croissant.", "Friendly"),
  },
  {
    id: "r-hana",
    reviewer: "Hana Y.",
    rating: 4,
    text: "Good value set menu. Dessert was the highlight.",
    branchId: "downtown",
    status: "queued",
    sentiment: "positive",
    ageMinutes: 20,
    receivedAt: "Nov 2, 10:55",
    draft: draft("Thank you, Hana! We’ll pass your praise to our pastry team.", "Friendly"),
  },
  {
    id: "r-leo",
    reviewer: "Leo G.",
    rating: 5,
    text: "Our go-to for Sunday lunch. Never disappoints.",
    branchId: "downtown",
    status: "published",
    sentiment: "positive",
    ageMinutes: 5 * 1440,
    receivedAt: "Oct 28, 13:30",
    reply: "Thanks, Leo! Sunday lunch isn’t the same without you.",
  },
  {
    id: "r-mia",
    reviewer: "Mia C.",
    rating: 4,
    text: "Friendly staff and quick service, coffee could be stronger.",
    branchId: "airport",
    status: "published",
    sentiment: "positive",
    ageMinutes: 6 * 1440,
    receivedAt: "Oct 27, 06:45",
    reply: "Thanks, Mia! Ask for an extra shot next time and we’ll make it just how you like it.",
  },
  {
    id: "r-noah",
    reviewer: "Noah E.",
    rating: 5,
    text: "Perfect riverside spot for an evening drink.",
    branchId: "riverside",
    status: "published",
    sentiment: "positive",
    ageMinutes: 7 * 1440,
    receivedAt: "Oct 26, 19:00",
    reply: "Thank you, Noah! The sunsets do most of the work. See you soon.",
  },
  {
    id: "r-zara",
    reviewer: "Zara Q.",
    rating: 5,
    text: "Staff went out of their way for my gluten-free order.",
    branchId: "downtown",
    status: "published",
    sentiment: "positive",
    ageMinutes: 8 * 1440,
    receivedAt: "Oct 25, 12:40",
    reply: "Thank you, Zara. We’re glad the team could look after you, and we’ll share your kind words.",
  },
  {
    id: "r-eli",
    reviewer: "Eli V.",
    rating: 4,
    text: "Lovely brunch menu, the wait for a table was about 15 minutes.",
    branchId: "riverside",
    status: "published",
    sentiment: "positive",
    ageMinutes: 9 * 1440,
    receivedAt: "Oct 24, 10:20",
    reply: "Thanks, Eli! Weekend brunch gets busy; we’re glad it was worth the short wait.",
  },
  {
    id: "r-ivy",
    reviewer: "Ivy K.",
    rating: 5,
    text: "The new seasonal menu is excellent.",
    branchId: "downtown",
    status: "published",
    sentiment: "positive",
    ageMinutes: 11 * 1440,
    receivedAt: "Oct 22, 18:45",
    reply: "Thank you, Ivy! We’ll let the chefs know.",
  },
  {
    id: "r-sam",
    reviewer: "Sam R.",
    rating: 3,
    text: "Fine for a quick bite, nothing special.",
    branchId: "airport",
    status: "published",
    sentiment: "neutral",
    ageMinutes: 12 * 1440,
    receivedAt: "Oct 21, 15:30",
    reply: "Thanks for stopping by, Sam. We’re always working to make the quick bite a little more special.",
  },
  {
    id: "r-ada",
    reviewer: "Ada M.",
    rating: 5,
    text: "Wonderful service for our anniversary dinner.",
    branchId: "riverside",
    status: "published",
    sentiment: "positive",
    ageMinutes: 14 * 1440,
    receivedAt: "Oct 19, 21:10",
    reply: "Happy anniversary, Ada! Thank you for celebrating with us.",
  },
];

export const reviews: Review[] = seeds.map(withTimeline).sort((a, b) => a.ageMinutes - b.ageMinutes);

export const usage: Usage = { used: 412, limit: 500, resetsOn: "Nov 30" };

export const kpis: Kpi[] = [
  { label: "Average rating", value: "4.6", delta: "+0.2", trend: "up", weekly: [12, 16, 14, 20, 18, 24, 22, 28] },
  { label: "Reviews received", value: "48", delta: "+12%", trend: "up", weekly: [8, 11, 9, 14, 12, 16, 13, 18] },
  { label: "Reply coverage", value: "92%", weekly: [70, 76, 74, 82, 80, 88, 86, 92] },
  { label: "Auto-reply rate", value: "64%", delta: "+6%", trend: "up", weekly: [41, 45, 48, 52, 55, 57, 58, 64] },
];

/** Second Insights row. Unanswered and pending values are replaced with live counts by the loader. */
export const replyKpis: Kpi[] = [
  { label: "Unanswered reviews", value: "0", weekly: [14, 12, 13, 10, 11, 8, 9, 7] },
  { label: "Pending approvals", value: "0", weekly: [9, 8, 10, 7, 8, 6, 7, 5] },
  { label: "Reply success rate", value: "97%", delta: "+1%", trend: "up", weekly: [93, 94, 95, 94, 96, 96, 96, 97] },
  { label: "AI usage", value: "0%", weekly: [38, 85, 140, 190, 245, 300, 360, 412] },
];

export const ratingBreakdown = [
  { stars: 5, count: 31 },
  { stars: 4, count: 9 },
  { stars: 3, count: 4 },
  { stars: 2, count: 2 },
  { stars: 1, count: 2 },
];

/** Fixed "today" so prerendered pages stay deterministic. */
export const today = { dateLabel: "Sunday, 2 November", greeting: "Good morning" };

export const account = { initials: "OW", name: "Owner", plan: "Pro plan" };

export const tones: Tone[] = ["Warm", "Friendly", "Professional", "Formal"];


// Insights (provisional screen)
export const weeklyReviews = [
  { week: "Aug 18", count: 9 },
  { week: "Aug 25", count: 11 },
  { week: "Sep 1", count: 8 },
  { week: "Sep 8", count: 13 },
  { week: "Sep 15", count: 10 },
  { week: "Sep 22", count: 12 },
  { week: "Sep 29", count: 9 },
  { week: "Oct 6", count: 14 },
  { week: "Oct 13", count: 12 },
  { week: "Oct 20", count: 16 },
  { week: "Oct 27", count: 13 },
  { week: "This week", count: 18 },
];

export const sentimentSplit = [
  { sentiment: "positive" as const, count: 38 },
  { sentiment: "neutral" as const, count: 6 },
  { sentiment: "negative" as const, count: 4 },
];

/** Average rating per week, last 8 weeks. */
export const weeklyRating = [
  { week: "Sep 15", rating: 4.3 },
  { week: "Sep 22", rating: 4.4 },
  { week: "Sep 29", rating: 4.2 },
  { week: "Oct 6", rating: 4.4 },
  { week: "Oct 13", rating: 4.5 },
  { week: "Oct 20", rating: 4.4 },
  { week: "Oct 27", rating: 4.6 },
  { week: "This week", rating: 4.6 },
];

/** Reviews per sentiment per week, last 8 weeks. */
export const weeklySentiment = [
  { week: "Sep 15", positive: 6, neutral: 2, negative: 2 },
  { week: "Sep 22", positive: 9, neutral: 1, negative: 2 },
  { week: "Sep 29", positive: 6, neutral: 1, negative: 2 },
  { week: "Oct 6", positive: 11, neutral: 2, negative: 1 },
  { week: "Oct 13", positive: 10, neutral: 1, negative: 1 },
  { week: "Oct 20", positive: 13, neutral: 2, negative: 1 },
  { week: "Oct 27", positive: 11, neutral: 1, negative: 1 },
  { week: "This week", positive: 15, neutral: 2, negative: 1 },
];

export const branchStats = [
  { branchId: "downtown", rating: 4.5, reviews: 21, replyRate: "95%" },
  { branchId: "riverside", rating: 4.8, reviews: 18, replyRate: "94%" },
  { branchId: "airport", rating: 4.2, reviews: 9, replyRate: "78%" },
];

/** How often QR visitors picked each attribute this month. */
export const attributeMentions = [
  { label: "Food quality", count: 142 },
  { label: "Friendly staff", count: 118 },
  { label: "Quick service", count: 64 },
  { label: "Ambience", count: 57 },
  { label: "Good value", count: 41 },
  { label: "Long wait", count: 19 },
];

export const plan = {
  name: "Pro",
  features: ["Up to 5 branches", "500 AI replies a month", "Unlimited QR codes", "Approval rules per branch"],
};
