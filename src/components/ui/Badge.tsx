import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icons/Icon";
import type { ReplyStatus } from "@/lib/mock/types";

const badgeBase =
  "inline-flex h-badge items-center gap-1 rounded-pill px-2.5 text-[11.5px] font-semibold tracking-[-0.01em] whitespace-nowrap";

// Each reply status keeps its icon and word. Dashed means not public.
const statuses: Record<ReplyStatus, { label: string; icon: IconName; className: string }> = {
  draft: {
    label: "AI draft",
    icon: "status-draft",
    className: "border border-dashed border-control bg-glass text-fg-muted",
  },
  awaiting: { label: "Awaiting approval", icon: "status-awaiting", className: "bg-selection text-primary-text shadow-glass" },
  queued: { label: "Queued", icon: "status-queued", className: "bg-subtle text-fg-muted shadow-glass" },
  published: { label: "Published", icon: "status-published", className: "bg-success-bg text-success shadow-glass" },
  failed: { label: "Failed", icon: "alert", className: "bg-danger-bg text-danger shadow-glass" },
};

export function StatusBadge({ status, className }: { status: ReplyStatus; className?: string }) {
  const s = statuses[status];
  return (
    <span className={cn(badgeBase, s.className, className)}>
      <Icon name={s.icon} size={12} />
      {s.label}
    </span>
  );
}

/** "Google connected" style badge with a status dot. */
export function LiveBadge({ ok = true, children }: { ok?: boolean; children: ReactNode }) {
  return (
    <span className={cn(badgeBase, "glass gap-[5px] bg-glass-tint text-fg")}>
      <span
        className={cn(
          "size-[7px] rounded-pill",
          ok ? "bg-success shadow-[0_0_0_3px_var(--status-success-bg)]" : "bg-danger shadow-[0_0_0_3px_var(--status-danger-bg)]",
        )}
      />
      {children}
    </span>
  );
}
