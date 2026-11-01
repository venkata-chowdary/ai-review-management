"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
import { Note } from "@/components/ui/Display";
import { Menu } from "@/components/ui/Menu";
import { tones } from "@/lib/mock/data";
import type { Review, Tone } from "@/lib/mock/types";

// Google rejects replies over 4096 bytes.
const MAX_REPLY_BYTES = 4096;
const DEMO_DELAY_MS = 1100;

type Busy = "regenerating" | "publishing" | null;

/** The dashed "AI draft · not published" box with its actions. */
export function DraftPanel({ review }: { review: Review }) {
  const [tone, setTone] = useState<Tone>(review.draft?.tone ?? "Warm");
  const [text, setText] = useState(review.draft?.text ?? "");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const editor = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (editing) editor.current?.focus();
  }, [editing]);

  // Phase 1 has no AI or Google connection; actions only show their states.
  function simulate(kind: Exclude<Busy, null>, message: string) {
    setBusy(kind);
    setNotice(null);
    timer.current = setTimeout(() => {
      setBusy(null);
      setNotice(message);
    }, DEMO_DELAY_MS);
  }

  const bytes = new TextEncoder().encode(text).length;
  const tooLong = bytes > MAX_REPLY_BYTES;
  const canAct = review.status === "awaiting" || review.status === "draft" || review.status === "failed";

  return (
    <>
      <div className="rounded-inner border border-dashed border-control bg-app px-4 py-3.5">
        <div className="mb-1.5 flex items-center justify-between gap-1.5 text-[12px] font-semibold text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="status-draft" size={13} />
            AI draft · not published
          </span>
          {canAct ? (
            <Menu
              label="Reply tone"
              value={tone}
              options={tones.map((t) => ({ value: t, label: t }))}
              onChange={(t) => setTone(t as Tone)}
              align="end"
              triggerClassName="inline-flex items-center gap-1 rounded-pill px-1.5 py-0.5 hover:bg-subtle hover:text-fg"
              trigger={(current) => (
                <>
                  Tone: {current?.label}
                  <Icon name="chevron-down" size={13} />
                </>
              )}
            />
          ) : (
            <span>Tone: {tone}</span>
          )}
        </div>
        {editing ? (
          <>
            <label htmlFor={`reply-${review.id}`} className="sr-only">
              Edit reply
            </label>
            <textarea
              id={`reply-${review.id}`}
              ref={editor}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="w-full resize-y rounded-row border border-control bg-surface px-3 py-2 text-[14px] leading-[22px] outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--selection-bg)]"
            />
            <p className={cn("mt-1 text-right text-[11.5px] font-medium", tooLong ? "text-danger" : "text-fg-muted")}>
              {bytes.toLocaleString()} / {MAX_REPLY_BYTES.toLocaleString()} bytes
            </p>
          </>
        ) : (
          <p className={cn("transition-opacity", busy === "regenerating" && "animate-shimmer")}>{text}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {review.status === "failed" ? (
          <Note>{review.error}. Reconnect Google, then retry. Publishing posts this reply on Google.</Note>
        ) : review.status === "queued" ? (
          <Note icon="shield">Approved and queued. It will post on Google shortly.</Note>
        ) : review.heldByRule ? (
          <Note>Held by your rule: {review.heldByRule}. Publishing posts this reply on Google.</Note>
        ) : (
          <Note icon="shield">Not published yet. Publishing posts this reply on Google.</Note>
        )}
        {canAct && (
          <div className="flex flex-wrap items-center gap-2">
            {editing ? (
              <>
                <Button
                  variant="text"
                  onClick={() => {
                    setText(review.draft?.text ?? "");
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button icon="check" iconMotion="draw" disabled={tooLong || !text.trim()} onClick={() => setEditing(false)}>
                  Save edit
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  icon="refresh"
                  iconMotion="spin"
                  loading={busy === "regenerating"}
                  disabled={busy !== null}
                  onClick={() => simulate("regenerating", "Demo only: AI drafting connects in a later phase.")}
                >
                  {busy === "regenerating" ? "Regenerating…" : "Regenerate"}
                </Button>
                <Button icon="pencil" disabled={busy !== null} onClick={() => setEditing(true)}>
                  Edit
                </Button>
              </>
            )}
            <Button
              variant="primary"
              size="md"
              icon={review.status === "failed" ? "refresh" : "check"}
              iconMotion={review.status === "failed" ? "spin" : "draw"}
              loading={busy === "publishing"}
              disabled={busy !== null || editing}
              onClick={() => simulate("publishing", "Demo only: nothing was posted to Google.")}
            >
              {busy === "publishing" ? "Publishing…" : review.status === "failed" ? "Retry publish" : "Approve & publish"}
            </Button>
          </div>
        )}
      </div>
      <p role="status" aria-live="polite" className={cn("text-[12px] font-semibold text-primary-text", !notice && "sr-only")}>
        {notice}
      </p>
    </>
  );
}
