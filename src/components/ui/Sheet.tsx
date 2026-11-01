"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

/**
 * Modal sheet: full screen below 768px, a right-hand drawer from 768px up.
 * Closes on Escape, the backdrop or the close button.
 */
export function Sheet({
  open,
  onClose,
  label,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !e.defaultPrevented) close.current();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 hidden animate-fade-in bg-[rgba(23,26,29,0.28)] md:block" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "relative flex h-full w-full animate-sheet-in flex-col overflow-y-auto bg-surface outline-none md:w-[min(560px,92vw)] md:shadow-[-12px_0_40px_-12px_rgba(23,26,29,0.25)]",
          className,
        )}
      >
        <div className="glass sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 md:px-5">
          <p className="text-label font-semibold text-fg-muted">{label}</p>
          <Button variant="light" icon="close" aria-label="Close" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}
