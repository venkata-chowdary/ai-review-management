import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Filter / attribute chip. Selected chips turn blue-tinted with a ring.
export function Chip({
  pressed,
  count,
  className,
  children,
  ...props
}: {
  pressed: boolean;
  count?: ReactNode;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        // Same height and type size as Button size="md" (Save / Continue).
        "press inline-flex h-control-md items-center gap-1.5 rounded-pill px-4 text-[14px] font-semibold transition-[transform,background-color] duration-150 active:scale-[.97]",
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
