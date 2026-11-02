"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons/Icon";
import { Button, buttonClass } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Display";
import { Skeleton } from "@/components/ui/States";
import { suggestReviews } from "@/app/r/[code]/actions";

const ratingWords = ["", "Poor", "Disappointing", "Okay", "Good", "Excellent"];

// A bold tick before the label when a chip is picked.
const tickClass =
  "aria-pressed:before:font-bold aria-pressed:before:content-['✓']";

const failed =
  "Something went wrong. Please try again, or write your review on Google.";

export function ReviewAssistant({
  code,
  googleUrl,
  businessName,
  branchName,
  initials,
  googleRating,
  googleReviewCount,
  attributes,
  menuItems,
  aiPaused,
}: {
  code: string;
  googleUrl: string;
  businessName: string;
  branchName: string;
  initials: string;
  googleRating: number;
  googleReviewCount: number;
  attributes: string[];
  menuItems: string[];
  aiPaused: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [ordered, setOrdered] = useState<string[]>([]);
  const [website, setWebsite] = useState("");
  // One editable draft per suggestion; the slide in view is the chosen one.
  const [drafts, setDrafts] = useState<string[]>([]);
  const [choice, setChoice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [edited, setEdited] = useState(false);
  const [confirmingReplace, setConfirmingReplace] = useState(false);
  // The answers the current drafts were written from.
  const [generatedFor, setGeneratedFor] = useState("");
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Only the newest request may fill the drafts; older answers are dropped.
  const latestRequest = useRef(0);
  const track = useRef<HTMLDivElement>(null);
  const resultCard = useRef<HTMLDivElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const ids = useId();
  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  async function generate() {
    const request = ++latestRequest.current;
    setLoading(true);
    setError("");
    setConfirmingReplace(false);
    let result;
    try {
      result = await suggestReviews({
        code,
        rating,
        attributes: picked,
        comment: ordered.length ? `Ordered ${ordered.join(", ")}.` : "",
        website,
      });
    } catch {
      result = { ok: false as const, error: failed };
    }
    if (request !== latestRequest.current) return;
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDrafts(result.suggestions);
    setChoice(0);
    setCopied(false);
    setEdited(false);
    setGeneratedFor(JSON.stringify([rating, picked, ordered]));
    // Take the customer to the result, also on screen readers.
    requestAnimationFrame(() => {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      resultHeading.current?.focus({ preventScroll: true });
      resultCard.current?.scrollIntoView({
        block: "nearest",
        behavior: smooth ? "smooth" : "auto",
      });
    });
  }

  function showSlide(i: number) {
    const el = track.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    el.scrollTo({
      left: i * el.clientWidth,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard can be blocked; the text stays selectable in the box.
    }
  }

  const identity = (
    <>
      <span
        aria-hidden="true"
        className="absolute -top-8 left-1/2 -ml-1 box-content grid size-14 -translate-x-1/2 place-items-center rounded-pill border-4 border-app bg-surface text-[18px] font-bold text-primary-text shadow-button-light"
      >
        {initials}
      </span>
      <div className="text-center">
        <h1 className="text-[20px] leading-[1.25] font-bold tracking-[-0.02em]">
          {businessName}
        </h1>
        <p className="mt-1 text-[13px] text-fg-muted">
          {branchName} · <span className="text-star">★</span>{" "}
          <b className="text-fg">{googleRating}</b> ·{" "}
          {googleReviewCount.toLocaleString("en-IN")} reviews
        </p>
      </div>
      <div className="my-4 h-px bg-line" />
    </>
  );

  if (aiPaused)
    return (
      <Card className="relative p-5 pt-10">
        {identity}
        <h2 className="text-[15px] font-bold tracking-[-0.01em]">
          Thank you for visiting!
        </h2>
        <p className="mt-1 text-[12.5px] text-fg-muted">
          Please write your review on Google.
        </p>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass({
            variant: "primary",
            size: "lg",
            className: "mt-4 h-12 w-full",
          })}
        >
          Write on Google
          <Icon name="external" size={16} />
        </a>
      </Card>
    );

  const locked = !rating;
  const shown = hovered || rating;
  const text = drafts[choice] ?? "";
  const answersChanged =
    drafts.length > 0 &&
    generatedFor !== JSON.stringify([rating, picked, ordered]);
  const showCopy = drafts.length > 0 && !loading;

  return (
    <>
      <Card className="relative p-5 pt-10">
        {identity}

        <div role="group" aria-labelledby={`${ids}-rating`}>
          <div className="flex items-baseline justify-between gap-2">
            <h2
              id={`${ids}-rating`}
              className="text-[15px] leading-6 font-bold tracking-[-0.01em]"
            >
              How was your visit?
            </h2>
            <p
              aria-live="polite"
              className="text-[13px] leading-6 font-bold whitespace-nowrap text-primary-text"
            >
              {rating ? `${rating} · ${ratingWords[rating]}` : ""}
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Your rating"
            className="mt-2 flex justify-between"
            onPointerLeave={() => setHovered(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? "s" : ""}, ${ratingWords[n]}`}
                onPointerEnter={(e) =>
                  e.pointerType === "mouse" && setHovered(n)
                }
                onClick={() => setRating(n)}
                className="press group size-12 rounded-[14px] transition-transform duration-150 active:scale-90"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  strokeWidth={1.4}
                  className={cn(
                    "size-full p-1 transition-all duration-150 [@media(hover:hover)]:group-hover:scale-[1.12]",
                    n <= shown
                      ? "fill-star stroke-star"
                      : "fill-none stroke-control opacity-55",
                  )}
                >
                  <path
                    d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </div>
          <p className="mt-1 text-[12.5px] text-fg-muted">
            Tap a star to get started.
          </p>
        </div>

        <div className="my-4 h-px bg-line" />

        {menuItems.length > 0 && (
          <fieldset className="mb-[18px]">
            <legend className="text-[15px] font-bold tracking-[-0.01em]">
              What did you order?
              <span className="ml-2 text-[12.5px] font-medium text-fg-muted">
                optional
              </span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {menuItems.map((item) => {
                const on = ordered.includes(item);
                return (
                  <Chip
                    key={item}
                    size="touch"
                    className={tickClass}
                    pressed={on}
                    onClick={() =>
                      setOrdered(
                        on
                          ? ordered.filter((x) => x !== item)
                          : [...ordered, item],
                      )
                    }
                  >
                    {item}
                  </Chip>
                );
              })}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="text-[15px] font-bold tracking-[-0.01em]">
            What stood out?
            <span className="ml-2 text-[12.5px] font-medium text-fg-muted">
              optional
            </span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {attributes.map((attribute) => {
              const on = picked.includes(attribute);
              return (
                <Chip
                  key={attribute}
                  size="touch"
                  className={tickClass}
                  pressed={on}
                  onClick={() =>
                    setPicked(
                      on
                        ? picked.filter((x) => x !== attribute)
                        : [...picked, attribute],
                    )
                  }
                >
                  {attribute}
                </Chip>
              );
            })}
          </div>
        </fieldset>

        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>
      </Card>

      <Card ref={resultCard} className="scroll-mb-4 p-5">
        <div className="flex min-h-8 items-center justify-between gap-2">
          <h2
            ref={resultHeading}
            tabIndex={-1}
            className="inline-flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] outline-none"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-[14px] fill-primary-text"
            >
              <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" />
            </svg>
            Pick a review
          </h2>
          {drafts.length > 0 && !confirmingReplace && (
            <Button
              variant="light"
              size="sm"
              icon="refresh"
              loading={loading}
              disabled={loading}
              onClick={() => (edited ? setConfirmingReplace(true) : generate())}
            >
              Regenerate
            </Button>
          )}
        </div>

        {confirmingReplace && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-inner bg-app px-4 py-2">
            <p className="text-[13px] font-semibold">Replace your edits?</p>
            <div className="flex gap-2">
              <Button
                variant="text"
                size="sm"
                onClick={() => setConfirmingReplace(false)}
              >
                Keep
              </Button>
              <Button variant="light" size="sm" onClick={generate}>
                Replace
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div
            role="status"
            className="mt-3 min-h-[132px] rounded-inner bg-app px-4 py-3"
          >
            <div className="flex flex-col gap-2.5 pt-1">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-11/12" />
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
            <p className="mt-4 text-[12.5px] font-semibold text-fg-muted">
              Writing your review…
            </p>
          </div>
        ) : !drafts.length ? (
          <>
            <div
              aria-hidden="true"
              className="mt-3 min-h-[132px] rounded-inner bg-app px-4 py-3"
            >
              <p className="text-[15.5px] leading-[1.55] text-transparent [text-shadow:0_0_8px_rgba(29,29,31,.55)] select-none">
                Your review suggestions will show up right here as soon as you
                tell us how your visit went.
              </p>
            </div>
            <p className="mt-3 text-center text-[12.5px] text-fg-muted">
              {locked
                ? "Pick a star rating to start."
                : "Tap Generate review when you are ready."}
            </p>
          </>
        ) : (
          <>
            <div
              ref={track}
              role="group"
              aria-roledescription="carousel"
              aria-label="Review suggestions"
              onScroll={(e) => {
                const el = e.currentTarget;
                const i = Math.round(el.scrollLeft / el.clientWidth);
                if (i !== choice) {
                  setChoice(i);
                  setCopied(false);
                }
              }}
              className="-mx-1 mt-3 flex snap-x snap-mandatory overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {drafts.map((draft, i) => (
                <div
                  key={i}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${drafts.length}`}
                  className="w-full flex-none snap-center px-1"
                >
                  <textarea
                    aria-label={`Suggestion ${i + 1}, you can edit it`}
                    rows={5}
                    spellCheck={false}
                    value={draft}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDrafts((all) =>
                        all.map((x, j) => (j === i ? value : x)),
                      );
                      setEdited(true);
                      setCopied(false);
                    }}
                    className="block min-h-[132px] w-full resize-none rounded-inner bg-app px-4 py-3 text-[16px] leading-[1.55] outline-none focus:shadow-[inset_0_0_0_2px_var(--action-primary)]"
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-[12.5px] text-fg-muted">
              Suggested from your answers. Edit it so it matches your visit.
            </p>
            {answersChanged && (
              <p className="mt-1 text-[12.5px] font-semibold text-primary-text">
                You changed your answers. Tap Regenerate to update.
              </p>
            )}
            {drafts.length > 1 && (
              <div className="mt-3 flex items-center justify-between">
                <Button
                  variant="light"
                  size="lg"
                  icon="chevron-left"
                  aria-label="Previous suggestion"
                  disabled={choice === 0}
                  onClick={() => showSlide(choice - 1)}
                />
                <div className="flex justify-center gap-2">
                  {drafts.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Suggestion ${i + 1}`}
                      aria-current={i === choice}
                      onClick={() => showSlide(i)}
                      className={cn(
                        "relative h-1.5 rounded-pill transition-all duration-200 after:absolute after:-inset-x-[7px] after:-inset-y-[19px] after:content-['']",
                        i === choice
                          ? "w-5 bg-primary"
                          : "w-1.5 bg-control opacity-40 [@media(hover:hover)]:hover:opacity-80",
                      )}
                    />
                  ))}
                </div>
                <Button
                  variant="light"
                  size="lg"
                  icon="chevron-right"
                  aria-label="Next suggestion"
                  disabled={choice === drafts.length - 1}
                  onClick={() => showSlide(choice + 1)}
                />
              </div>
            )}
            <p aria-live="polite" className="sr-only">
              Suggestion {choice + 1} of {drafts.length}
            </p>
          </>
        )}

        {error && (
          <div
            role="alert"
            className="mt-3 flex items-center justify-between gap-3 text-[12.5px] text-danger"
          >
            <p>{error}</p>
            <Button variant="light" size="sm" onClick={generate}>
              Try again
            </Button>
          </div>
        )}
      </Card>

      {showCopy ? (
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => copy(text)}
          aria-disabled={!text.trim() || undefined}
          className={buttonClass({
            variant: "primary",
            size: "lg",
            className: "h-12 w-full gap-[9px]",
          })}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-[18px] flex-none"
          >
            <rect x="9" y="9" width="11" height="11" rx="2.5" />
            <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
          </svg>
          {copied ? "Copied! Opening Google…" : "Copy review & open Google"}
        </a>
      ) : (
        <Button
          variant="primary"
          size="lg"
          icon="sparkle"
          loading={loading}
          disabled={locked || loading}
          onClick={generate}
          className="h-12 w-full"
        >
          {loading ? "Writing…" : "Generate review"}
        </Button>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Review copied" : ""}
      </span>
      <p className="text-center text-[12.5px] text-fg-muted">
        On Google, paste it, give stars and post.{" "}
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary-text hover:underline"
        >
          Or write your own
        </a>
      </p>
    </>
  );
}
