import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons/Icon";
import { initials } from "@/lib/format";
import type { Sentiment } from "@/lib/mock/types";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-card border border-line bg-surface", className)} {...props} />;
}

export function SectionTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={cn("text-section font-bold", className)} {...props} />;
}

/** Stars always show the number next to them. */
export function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[5px] text-[12px] font-semibold", className)}>
      <span className="inline-flex gap-px" role="img" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Icon
            key={n}
            name="star"
            size={12}
            className={n <= value ? "fill-star stroke-star" : "stroke-control [stroke-width:1.5]"}
          />
        ))}
      </span>
      {value.toFixed(1)}
    </span>
  );
}

export function Avatar({ name, size = 34, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size < 32 ? 10.5 : 11.5 }}
      className={cn("grid flex-none place-items-center rounded-pill bg-selection font-bold text-primary-text", className)}
    >
      {initials(name)}
    </span>
  );
}

const sentiments: Record<Sentiment, { label: string; icon: "face-positive" | "face-neutral" | "face-negative" }> = {
  positive: { label: "Positive", icon: "face-positive" },
  neutral: { label: "Neutral", icon: "face-neutral" },
  negative: { label: "Negative", icon: "face-negative" },
};

/** Sentiment is a word and an icon, never colour alone. */
export function SentimentLabel({ value }: { value: Sentiment }) {
  const s = sentiments[value];
  return (
    <span className="inline-flex items-center gap-1">
      <Icon name={s.icon} size={13} />
      {s.label}
    </span>
  );
}

export function Meter({
  value,
  max = 100,
  label,
  className,
  track = "bg-subtle",
  fill = "bg-primary",
  height = "h-1.5",
}: {
  value: number;
  max?: number;
  label: string;
  className?: string;
  track?: string;
  fill?: string;
  height?: string;
}) {
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("overflow-hidden rounded-pill", height, track, className)}
    >
      <i className={cn("block h-full rounded-pill transition-[width] duration-500", fill)} style={{ width: `${max ? Math.min(100, (value / max) * 100) : 0}%` }} />
    </div>
  );
}

/** AI-usage ring from the icon rail. */
export function UsageRing({ percent, size = 44 }: { percent: number; size?: number }) {
  const c = 2 * Math.PI * 18;
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} role="img" aria-label={`AI replies ${percent}% used`}>
      <circle cx="22" cy="22" r="18" fill="none" strokeWidth="4" className="stroke-sidebar-meter-track" />
      <circle
        cx="22"
        cy="22"
        r="18"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${(percent / 100) * c} ${c}`}
        transform="rotate(-90 22 22)"
        className="stroke-sidebar-meter"
      />
      <text x="22" y="25.5" textAnchor="middle" className="fill-sidebar-fg text-[10px] font-bold">
        {percent}%
      </text>
    </svg>
  );
}

/** Weekly bars under KPI tiles; the latest bar is blue. */
export function Spark({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(...values, 1);
  return (
    <svg viewBox="0 0 256 30" preserveAspectRatio="none" role="img" aria-label={label} className="mt-2 block h-[30px] w-full">
      {values.map((v, i) => {
        const h = Math.max(4, (v / max) * 28);
        return (
          <rect
            key={i}
            x={4 + i * 32}
            y={30 - h}
            width="22"
            height={h}
            rx="5"
            className={i === values.length - 1 && v > 0 ? "fill-primary" : "fill-subtle"}
          />
        );
      })}
    </svg>
  );
}

/** Small icon + text line used for helper notes ("Held by your rule…"). */
export function Note({ icon = "alert", children, className }: { icon?: "alert" | "shield" | "link"; children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 text-[12px] leading-[17px] text-fg-muted", className)}>
      <Icon name={icon} size={13} className="mt-0.5" />
      <span>{children}</span>
    </p>
  );
}
