"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons/Icon";
import { Button, buttonClass } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card, Note } from "@/components/ui/Display";
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
  const [options, setOptions] = useState<string[]>([]);
  const [choice, setChoice] = useState(0);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const results = useRef<HTMLHeadingElement>(null);
  const ids = useId();
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
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
        <h2 className="text-section font-bold">Share your experience on Google</h2>
        <p className="text-[15px] leading-6 text-fg-muted">
          Writing suggestions aren’t available right now. You can still leave a review directly on Google. Thank you for taking the time.
        </p>
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "primary", size: "lg", className: "w-full" })}>
          Continue to Google
          <Icon name="external" size={16} />
        </a>
      </Card>
    );

  if (step === "pick")
    return (
      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-4 p-5">
          <div>
            <h2 ref={results} tabIndex={-1} className="text-section font-bold outline-none">
              Pick a starting point
            </h2>
            <p className="text-[13.5px] text-fg-muted">Edit it so it says what you want. It’s your review.</p>
          </div>
          <div role="radiogroup" aria-label="Suggestions" className="flex flex-col gap-2">
            {options.map((o, i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={i === choice}
                onClick={() => {
                  setChoice(i);
                  setText(o);
                  setCopied(false);
                }}
                className={cn(
                  "rounded-inner border px-4 py-3 text-left text-[15px] leading-[23px] transition-colors",
                  i === choice ? "border-selection-line bg-selection" : "border-line bg-surface hover:bg-row-hover",
                )}
              >
                {o}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${ids}-text`} className="text-label font-semibold">
              Your review
            </label>
            <TextArea id={`${ids}-text`} rows={5} value={text} onChange={(e) => {
                setText(e.target.value);
                setCopied(false);
              }} />
          </div>
          <div className="flex flex-col gap-2">
            <Button size="lg" icon={copied ? "check" : "copy"} onClick={copy} disabled={!text.trim()} className="w-full">
              {copied ? "Copied" : "Copy text"}
            </Button>
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={copy}
              className={buttonClass({ variant: "primary", size: "lg", className: "w-full" })}
            >
              Continue to Google
              <Icon name="external" size={16} />
            </a>
            <span role="status" aria-live="polite" className="sr-only">
              {copied ? "Review text copied" : ""}
            </span>
          </div>
          <Note icon="shield">On Google, paste your text, choose your stars and post it yourself. Nothing is posted for you.</Note>
        </Card>
        <Button variant="text" icon="chevron-left" onClick={() => setStep("input")} className="self-center">
          Change my answers
        </Button>
      </div>
    );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setStep("loading");
        timer.current = setTimeout(() => {
          const next = suggest(business, rating, picked, comment);
          setOptions(next);
          setChoice(0);
          setText(next[0]);
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
          <legend className="text-label font-semibold">Anything that stood out? (optional)</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {attributes.map((a) => (
              <Chip
                key={a}
                size="lg"
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
            In your own words (optional)
          </label>
          <TextArea
            id={`${ids}-comment`}
            rows={3}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. We came for a birthday lunch"
            className="text-[16px]"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon="sparkle"
          loading={step === "loading"}
          disabled={!rating || step === "loading"}
          className="w-full"
        >
          {step === "loading" ? "Writing suggestions…" : "Get suggestions"}
        </Button>
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="self-center text-[13px] font-semibold text-primary-text hover:underline">
          Skip and write on Google
        </a>
      </Card>
    </form>
  );
}
