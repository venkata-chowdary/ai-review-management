import type { ReactNode } from "react";
import { Button, buttonClass } from "@/components/ui/Button";
import Link from "next/link";

/** Heading and body of one onboarding step. Grows to fill the screen so the footer sits at the bottom. */
export function StepFrame({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        <h1 className="text-[22px] leading-7 font-bold tracking-[-0.015em] md:text-page-title">{title}</h1>
        {description && <p className="mt-1.5 max-w-[580px] text-[13.5px] leading-5 text-fg-muted md:text-[14px] md:leading-[21px]">{description}</p>}
      </div>
      {children}
    </div>
  );
}

/**
 * Back link, an optional skip, and the primary Continue, pinned to the bottom
 * of the step. Continue submits the step's form, so validation runs first.
 */
export function StepFooter({
  backHref,
  continueLabel = "Continue",
  pending,
  disabled,
  skip,
  note,
}: {
  backHref?: string;
  continueLabel?: string;
  pending?: boolean;
  disabled?: boolean;
  skip?: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="mt-auto flex flex-col gap-3 border-t border-line pt-5">
      {note}
      <div className="flex flex-wrap items-center gap-2">
        {backHref && (
          <Link href={backHref} className={buttonClass({ variant: "text", size: "md" })}>
            Back
          </Link>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {skip}
          <Button type="submit" variant="primary" size="md" trailingIcon={pending ? undefined : "chevron-right"} loading={pending} disabled={disabled}>
            {pending ? "Saving…" : continueLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
