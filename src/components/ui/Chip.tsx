import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Filter / attribute chip. Selected chips turn blue-tinted with a ring.
export function Chip({
  pressed,
  size = "sm",
  count,
  className,
  children,
  ...props
}: {
  pressed: boolean;
  /** "lg" is the 44px touch size used on the QR page. */
  size?: "sm" | "lg";
  count?: ReactNode;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "press inline-flex items-center gap-1.5 rounded-pill font-semibold transition-[transform,background-color] duration-150 active:scale-[.97]",
        size === "lg" ? "h-field px-4 text-[14px]" : "h-control-sm px-3.5 text-[13px]",
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
