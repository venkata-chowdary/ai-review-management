"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons/Icon";
import { Button, buttonClass } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Display";
import { TextArea } from "@/components/ui/Field";

const ratingWords = ["", "Poor", "Disappointing", "Okay", "Good", "Excellent"];

function list(items: string[]) {
  const lower = items.map((a) => a.toLowerCase());
  return lower.length < 2 ? (lower[0] ?? "") : `${lower.slice(0, -1).join(", ")} and ${lower.at(-1)}`;
}

/**
 * Stand-in for Gemini: builds suggestions only from what the customer chose
 * and wrote, so nothing is invented. Phase 2 replaces this with the server
 * action that calls the model with the same inputs.
 */
function suggest(business: string, rating: number, attributes: string[], comment: string) {
  const opener = [
    "",
    `I had a poor experience at ${business}.`,
    `My visit to ${business} was disappointing.`,
    `My visit to ${business} was okay.`,
    `Good visit to ${business} overall.`,
    `Really enjoyed my visit to ${business}.`,
  ][rating];
  const noted = attributes.length ? list(attributes) : "";
  const extra = comment.trim() ? ` ${comment.trim()}` : "";
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return [
    `${opener}${noted ? ` What stood out: ${noted}.` : ""}${extra}`,
    `${rating} out of 5 from me.${noted ? ` ${cap(noted)} ${attributes.length > 1 ? "were" : "was"} what I noticed most.` : ""}${extra}`,
    `${opener}${extra || (noted ? ` ${cap(noted)}.` : "")}`,
  ].filter((s, i, all) => all.indexOf(s) === i);
}

type Step = "input" | "loading" | "pick";

/** Width of one slide in the suggestion carousel (slides are equal). */
function slideWidth(track: HTMLElement) {
  return (track.firstElementChild as HTMLElement | null)?.offsetWidth || track.clientWidth;
}

export function ReviewAssistant({
  business,
  googleUrl,
  attributes,
  aiPaused,
}: {
  business: string;
  googleUrl: string;
  attributes: string[];
  aiPaused: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [step, setStep] = useState<Step>("input");
  // One editable draft per suggestion; the slide in view is the chosen one.
  const [drafts, setDrafts] = useState<string[]>([]);
  const [choice, setChoice] = useState(0);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const results = useRef<HTMLHeadingElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const ids = useId();
  useEffect(() => () => clearTimeout(timer.current), []);

  function showSlide(i: number) {
    const el = track.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * slideWidth(el), behavior: smooth ? "smooth" : "auto" });
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the text stays selectable in the box.
    }
  }

  if (aiPaused)
    return (
      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-section font-bold">Thank you for visiting!</h2>
        <p className="text-[15px] leading-6 text-fg-muted">Please write your review on Google.</p>
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "primary", size: "md", className: "w-full" })}>
          Write on Google
          <Icon name="external" size={16} />
        </a>
      </Card>
    );

  if (step === "pick") {
    const text = drafts[choice] ?? "";
    return (
      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-4 p-5">
          <div>
            <h2 ref={results} tabIndex={-1} className="text-section font-bold outline-none">
              Pick a review
            </h2>
            <p className="text-[13.5px] text-fg-muted">Swipe to see more. Tap the text to change it.</p>
          </div>

          <div
            ref={track}
            role="group"
            aria-roledescription="carousel"
            aria-label="Review suggestions"
            onScroll={(e) => {
              const el = e.currentTarget;
              const i = Math.round(el.scrollLeft / slideWidth(el));
              if (i !== choice) {
                setChoice(i);
                setCopied(false);
              }
            }}
            className="-mx-1 flex snap-x snap-mandatory overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {drafts.map((d, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${drafts.length}`}
                className="w-full flex-none snap-center px-1"
              >
                <TextArea
                  aria-label={`Suggestion ${i + 1}, you can edit it`}
                  rows={6}
                  value={d}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDrafts((all) => all.map((x, j) => (j === i ? v : x)));
                    setCopied(false);
                  }}
                  className="resize-none bg-selection text-[16px] leading-6"
                />
              </div>
            ))}
          </div>

          {drafts.length > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="light"
                icon="chevron-left"
                aria-label="Previous suggestion"
                disabled={choice === 0}
                onClick={() => showSlide(choice - 1)}
              />
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {drafts.map((_, i) => (
                  <span key={i} className={cn("h-1.5 rounded-pill transition-all", i === choice ? "w-5 bg-primary" : "w-1.5 bg-control")} />
                ))}
              </div>
              <Button
                variant="light"
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

          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => copy(text)}
            aria-disabled={!text.trim() || undefined}
            className={buttonClass({ variant: "primary", size: "md", className: "w-full" })}
          >
            {copied ? "Copied! Opening Google" : "Copy and open Google"}
            <Icon name="external" size={16} />
          </a>
          <span role="status" aria-live="polite" className="sr-only">
            {copied ? "Review copied" : ""}
          </span>
          <p className="text-center text-[13px] text-fg-muted">On Google, paste it, give stars and post.</p>
        </Card>
        <Button variant="text" icon="chevron-left" onClick={() => setStep("input")} className="self-center">
          Change answers
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setStep("loading");
        timer.current = setTimeout(() => {
          setDrafts(suggest(business, rating, picked, comment));
          setChoice(0);
          setCopied(false);
          setStep("pick");
          requestAnimationFrame(() => results.current?.focus());
        }, 900);
      }}
    >
      <Card className="flex flex-col gap-5 p-5">
        <fieldset>
          <legend className="text-section font-bold">How was your visit?</legend>
          <div role="radiogroup" aria-label="Your rating" className="mt-3 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? "s" : ""}, ${ratingWords[n]}`}
                onClick={() => setRating(n)}
                className="press grid size-touch place-items-center rounded-pill transition-transform active:scale-[.92]"
              >
                <Icon name="star" size={32} className={cn("transition-colors", n <= rating ? "fill-star stroke-star" : "stroke-control [stroke-width:1.4]")} />
              </button>
            ))}
          </div>
          <p className="mt-1 h-5 text-[13px] font-semibold text-fg-muted" aria-hidden="true">
            {rating ? `${rating} · ${ratingWords[rating]}` : ""}
          </p>
        </fieldset>

        <fieldset>
          <legend className="text-label font-semibold">What did you notice? (optional)</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {attributes.map((a) => (
              <Chip
                key={a}
                pressed={picked.includes(a)}
                onClick={() => setPicked((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]))}
              >
                {a}
              </Chip>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${ids}-comment`} className="text-label font-semibold">
            Anything else? (optional)
          </label>
          <TextArea
            id={`${ids}-comment`}
            rows={3}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Came for a birthday lunch"
            className="text-[16px]"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          icon="sparkle"
          loading={step === "loading"}
          disabled={!rating || step === "loading"}
          className="w-full"
        >
          {step === "loading" ? "Writing…" : "Help me write"}
        </Button>
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="self-center text-[13px] font-semibold text-primary-text hover:underline">
          I’ll write it myself on Google
        </a>
      </Card>
    </form>
  );
}
