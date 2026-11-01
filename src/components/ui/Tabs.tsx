import Link from "next/link";
import { cn } from "@/lib/cn";

// Pill tab track. Tabs are links so the selection lives in the URL.
export function LinkTabs({
  label,
  tabs,
  className,
}: {
  label: string;
  tabs: { href: string; label: string; count?: number; selected: boolean }[];
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("inline-flex gap-0.5 rounded-pill bg-subtle p-0.5", className)}>
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          scroll={false}
          aria-current={t.selected ? "page" : undefined}
          className={cn(
            "inline-flex h-tab items-center gap-1.5 rounded-pill px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
            t.selected ? "bg-surface text-primary-text shadow-segment" : "text-fg-muted hover:text-fg",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="text-[11.5px] opacity-80">{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
