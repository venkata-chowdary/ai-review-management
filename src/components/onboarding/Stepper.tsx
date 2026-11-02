"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { onboardingSteps, stepHref } from "@/lib/onboarding";

function useCurrentStep() {
  const pathname = usePathname();
  const i = onboardingSteps.findIndex((s) => pathname === stepHref(s.slug));
  return Math.max(0, i);
}

/** Vertical step list (≥1024px). Finished steps link back; later steps don't. */
export function StepList() {
  const current = useCurrentStep();
  return (
    <nav aria-label="Setup steps">
      <ol className="flex flex-col gap-1">
        {onboardingSteps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const body = (
            <>
              <span
                className={cn(
                  "grid size-7 flex-none place-items-center rounded-pill text-[12px] font-bold",
                  active && "bg-primary text-on-primary shadow-button-primary",
                  done && "bg-selection text-primary-text",
                  !active && !done && "bg-surface text-fg-muted shadow-button-light",
                )}
              >
                {done ? <Icon name="check" size={14} /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className={cn("block text-[13.5px] font-semibold", !active && !done && "text-fg-muted")}>{s.label}</span>
                <span className="block text-[12px] text-fg-muted">{s.hint}</span>
              </span>
            </>
          );
          return (
            <li key={s.slug}>
              {done ? (
                <Link href={stepHref(s.slug)} className="flex items-center gap-3 rounded-[18px] px-2.5 py-2 hover:bg-glass">
                  {body}
                  <span className="sr-only">(done, edit)</span>
                </Link>
              ) : (
                <div aria-current={active ? "step" : undefined} className={cn("flex items-center gap-3 rounded-[18px] px-2.5 py-2", active && "glass")}>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Compact progress for narrow screens: "Step 2 of 5 · First branch" plus segments. */
export function StepProgress() {
  const current = useCurrentStep();
  const step = onboardingSteps[current];
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12.5px] font-semibold text-fg-muted">
        Step {current + 1} of {onboardingSteps.length} · <span className="text-fg">{step.label}</span>
      </p>
      <div
        role="progressbar"
        aria-label="Setup progress"
        aria-valuemin={1}
        aria-valuemax={onboardingSteps.length}
        aria-valuenow={current + 1}
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${onboardingSteps.length}, 1fr)` }}
      >
        {onboardingSteps.map((s, i) => (
          <span key={s.slug} className={cn("h-1 rounded-pill", i <= current ? "bg-primary" : "bg-subtle")} />
        ))}
      </div>
    </div>
  );
}
