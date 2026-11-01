import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icons/Icon";

export function Skeleton({ className }: { className?: string }) {
  // Callers may pass their own radius (e.g. rounded-pill for avatars).
  const radius = className?.includes("rounded-") ? undefined : "rounded-row";
  return <span aria-hidden="true" className={cn("block animate-shimmer bg-subtle", radius, className)} />;
}

/** Generic card-stack skeleton for settings-style pages. */
export function CardsSkeleton({ cards = 2, label = "Loading" }: { cards?: number; label?: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="flex flex-col gap-3.5">
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-8 w-56 rounded-pill" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon = "reviews",
  title,
  children,
  action,
  className,
}: {
  icon?: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-12 text-center", className)}>
      <span className="grid size-12 place-items-center rounded-pill bg-subtle text-fg-muted">
        <Icon name={icon} size={20} />
      </span>
      <div>
        <p className="text-card-title font-semibold">{title}</p>
        {children && <p className="mx-auto mt-1 max-w-sm text-[13px] leading-5 text-fg-muted">{children}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  children,
  action,
  className,
}: {
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-3 px-6 py-12 text-center", className)}>
      <span className="grid size-12 place-items-center rounded-pill bg-danger-bg text-danger">
        <Icon name="alert" size={20} />
      </span>
      <div>
        <p className="text-card-title font-semibold">{title}</p>
        {children && <p className="mx-auto mt-1 max-w-sm text-[13px] leading-5 text-fg-muted">{children}</p>}
      </div>
      {action}
    </div>
  );
}
