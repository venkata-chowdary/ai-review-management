import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Filter / attribute chip. Selected chips turn blue-tinted with a ring.
export function Chip({
  pressed,
  count,
  size = "md",
  className,
  children,
  ...props
}: {
  pressed: boolean;
  count?: ReactNode;
  size?: "md" | "touch";
  children: ReactNode;
} & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        // "md" is the same height and type size as Button size="md" (Save / Continue).
        // "touch" is 44px for fingers and drops to 32px where a mouse exists.
        "press inline-flex items-center gap-1.5 rounded-pill px-4 text-[14px] font-semibold transition-[transform,background-color] duration-150 active:scale-[.97]",
        size === "touch" ? "h-field [@media(hover:hover)]:h-control-sm" : "h-control-md",
        pressed
          ? "bg-selection text-primary-text shadow-[inset_0_0_0_1px_var(--selection-border)]"
          : "bg-surface text-fg shadow-button-light hover:bg-row-hover",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className={cn("text-[11.5px]", pressed ? "text-primary-text" : "text-fg-muted")}>{count}</span>
      )}
    </button>
  );
}
