"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

/** Pretend sync: spins, then reports "just now". */
export function SyncButton({ lastSynced }: { lastSynced: string }) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(lastSynced);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {syncing ? "Syncing" : `Synced ${synced}`}
      </span>
      <Button
        size="md"
        icon="refresh"
        iconMotion="spin"
        loading={syncing}
        disabled={syncing}
        onClick={() => {
          setSyncing(true);
          timer.current = setTimeout(() => {
            setSyncing(false);
            setSynced("just now");
          }, 1200);
        }}
      >
        {syncing ? "Syncing…" : "Sync now"}
      </Button>
    </>
  );
}

const narrowQuery = "(max-width: 1023.98px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(narrowQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Below 1024px the review detail opens as a drawer (tablet) or a full-screen
 * sheet (phone). From 1024px it sits beside the list instead.
 */
export function ReviewSheet({ closeHref, label, children }: { closeHref: string; label: string; children: ReactNode }) {
  const router = useRouter();
  const narrow = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(narrowQuery).matches,
    () => false,
  );
  return (
    <Sheet open={narrow} onClose={() => router.push(closeHref, { scroll: false })} label={label}>
      {children}
    </Sheet>
  );
}
