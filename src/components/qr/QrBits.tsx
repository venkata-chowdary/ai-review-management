"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

/** Copies text and briefly confirms with "Copied". */
export function CopyButton({ text, label = "Copy link", variant = "light" }: { text: string; label?: string; variant?: "light" | "text" }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <>
      <Button
        variant={variant}
        icon={copied ? "check" : "copy"}
        iconMotion={copied ? undefined : "nudge"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text.startsWith("/") ? location.origin + text : text);
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 1800);
          } catch {
            // Clipboard can be blocked (permissions, insecure origin); the text stays selectable.
          }
        }}
      >
        {copied ? "Copied" : label}
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}
