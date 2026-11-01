"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons/Icon";

export type MenuOption = { value: string; label: string; hint?: string };

/**
 * A pill or text trigger that opens a small single-choice menu.
 * Closes on selection, Escape or an outside click.
 */
export function Menu({
  label,
  value,
  options,
  onChange,
  trigger,
  triggerClassName,
  align = "start",
  className,
}: {
  /** Accessible name for the menu. */
  label: string;
  value: string;
  options: MenuOption[];
  onChange: (value: string) => void;
  /** Renders the trigger's content. */
  trigger: (current: MenuOption | undefined, open: boolean) => ReactNode;
  triggerClassName?: string;
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault(); // so an enclosing Sheet stays open
        setOpen(false);
        button.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey, true);
    root.current?.querySelector<HTMLElement>("[aria-checked=true]")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  function onMenuKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>("[role=menuitemradio]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
  }

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        {trigger(current, open)}
      </button>
      {open && (
        <div
          id={id}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKey}
          className={cn(
            "absolute top-[calc(100%+6px)] z-40 min-w-[200px] animate-fade-in rounded-menu border border-line bg-surface p-1 shadow-[0_12px_32px_-8px_rgba(23,26,29,0.18)]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
                button.current?.focus();
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-row px-3 py-2 text-left text-[13px] font-semibold hover:bg-row-hover focus-visible:outline-offset-0",
                o.value === value && "text-primary-text",
              )}
            >
              <span className="flex-1">
                {o.label}
                {o.hint && <small className="block text-[11.5px] font-medium text-fg-muted">{o.hint}</small>}
              </span>
              {o.value === value && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** The bordered 40px pill from the Overview header. */
export const pillTriggerClass =
  "inline-flex h-control-md items-center gap-2 rounded-pill border border-control bg-surface px-3.5 text-[13px] font-semibold whitespace-nowrap hover:bg-row-hover";

export function PillContent({ icon, children }: { icon: "pin" | "calendar"; children: ReactNode }) {
  return (
    <>
      <Icon name={icon} />
      {children}
      <Icon name="chevron-down" />
    </>
  );
}
