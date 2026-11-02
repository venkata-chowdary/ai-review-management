"use client";

import Link from "next/link";
import { useActionState, useId, useState, type ReactNode } from "react";
import { CopyButton } from "@/components/qr/QrBits";
import { QrPreview } from "@/components/qr/QrPreview";
import { Button, buttonClass, ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Avatar, Card, Rating } from "@/components/ui/Display";
import { TextInput } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { tones } from "@/lib/mock/data";
import type { Tone } from "@/lib/mock/types";
import { stepHref, type OnboardingDraft } from "@/lib/onboarding";
import { finishOnboarding, saveBranch, saveBusiness, saveReplies, skipGoogle } from "@/lib/onboarding-actions";
import { businessTypes } from "@/lib/validation";
import { StepFooter, StepFrame } from "./StepFrame";
import { useOnboardingDraft } from "./useOnboardingDraft";

function Labeled({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[12.5px] text-danger">
          <Icon name="alert" size={13} />
          {error}
        </p>
      ) : (
        hint
      )}
    </div>
  );
}

export function BusinessStep() {
  const draft = useOnboardingDraft();
  const [state, formAction, pending] = useActionState(saveBusiness, {});
  const [type, setType] = useState(draft.businessType ?? "");
  const id = useId();
  const errors = state.fieldErrors ?? {};

  return (
    <StepFrame title="Tell us about your business" description="This name is shown in your dashboard and on the page your customers see after scanning the QR code.">
      <form action={formAction} noValidate className="flex flex-1 flex-col gap-5">
        <Card className="flex flex-col gap-5 p-5">
          {state.error && (
            <p role="alert" className="text-[13px] text-danger">
              {state.error}
            </p>
          )}
          <Labeled
            id={`${id}-name`}
            label="Business name"
            error={errors.name}
            hint={<p className="text-[12px] text-fg-muted">Use the same name as on Google Maps.</p>}
          >
            <TextInput
              id={`${id}-name`}
              name="name"
              autoComplete="organization"
              defaultValue={state.values?.name ?? draft.businessName}
              placeholder="e.g. Sharma Sweets"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `${id}-name-error` : undefined}
              className="h-field"
              autoFocus
            />
          </Labeled>

          <fieldset className="flex flex-col gap-2.5" aria-describedby={errors.type ? `${id}-type-error` : undefined}>
            <legend className="text-label font-semibold">What type of business is it?</legend>
            <p className="-mt-1 mb-1 text-[12.5px] text-fg-muted">Pick the closest one. It helps AI write better replies.</p>
            <input type="hidden" name="type" value={type} />
            <div className="flex flex-wrap gap-2">
              {businessTypes.map((businessTypeOption) => (
                <Chip key={businessTypeOption} pressed={type === businessTypeOption} onClick={() => setType(businessTypeOption)}>
                  {businessTypeOption}
                </Chip>
              ))}
            </div>
            {errors.type && (
              <p id={`${id}-type-error`} className="flex items-center gap-1.5 text-[12.5px] text-danger">
                <Icon name="alert" size={13} />
                {errors.type}
              </p>
            )}
          </fieldset>
        </Card>
        <StepFooter pending={pending} />
      </form>
    </StepFrame>
  );
}

export function BranchStep() {
  const draft = useOnboardingDraft();
  const [state, formAction, pending] = useActionState(saveBranch, {});
  const [help, setHelp] = useState(false);
  const id = useId();
  const errors = state.fieldErrors ?? {};

  return (
    <StepFrame
      title="Add your first branch"
      description="We need the Google review link of your branch, so that customers who scan your QR code reach the right Google review page. You can add more branches later."
    >
      <form action={formAction} noValidate className="flex flex-1 flex-col gap-5">
        <Card className="flex flex-col gap-5 p-5">
          {state.error && (
            <p role="alert" className="text-[13px] text-danger">
              {state.error}
            </p>
          )}
          <Labeled
            id={`${id}-name`}
            label="Branch name"
            error={errors.name}
            hint={<p className="text-[12px] text-fg-muted">Shown in your dashboard. For example, MG Road or Main branch.</p>}
          >
            <TextInput
              id={`${id}-name`}
              name="name"
              defaultValue={state.values?.name ?? draft.branch?.name}
              placeholder="e.g. MG Road"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `${id}-name-error` : undefined}
              className="h-field"
              autoFocus
            />
          </Labeled>

          <Labeled
            id={`${id}-reviewUrl`}
            label="Google review link"
            error={errors.reviewUrl}
            hint={
              <button
                type="button"
                aria-expanded={help}
                aria-controls={`${id}-help`}
                onClick={() => setHelp((wasOpen) => !wasOpen)}
                className="flex w-fit items-center gap-1 text-[12.5px] font-semibold text-primary-text hover:underline"
              >
                How to get this link?
                <Icon name="chevron-down" size={14} className={cn("transition-transform", help && "rotate-180")} />
              </button>
            }
          >
            <TextInput
              id={`${id}-reviewUrl`}
              name="reviewUrl"
              type="url"
              inputMode="url"
              defaultValue={state.values?.reviewUrl ?? draft.branch?.googleReviewUrl}
              placeholder="https://g.page/r/…/review"
              aria-invalid={!!errors.reviewUrl}
              aria-describedby={errors.reviewUrl ? `${id}-reviewUrl-error` : undefined}
              className="h-field"
            />
          </Labeled>

          {help && (
            <ol id={`${id}-help`} className="-mt-2 flex flex-col gap-2 rounded-inner bg-app px-4 py-3.5 text-[13.5px]">
              {[
                "Open Google Business Profile for your shop, on your phone or computer.",
                "Open Get more reviews.",
                "Copy the review link, then come back and paste it here.",
              ].map((instruction, index) => (
                <li key={instruction} className="flex items-center gap-2.5">
                  <span className="grid size-6 flex-none place-items-center rounded-pill bg-surface text-[12px] font-bold shadow-button-light">{index + 1}</span>
                  {instruction}
                </li>
              ))}
            </ol>
          )}

          <Labeled
            id={`${id}-url`}
            label="Google Maps link (optional)"
            error={errors.url}
            hint={<p className="text-[12px] text-fg-muted">Open your shop on Google Maps, tap Share, then Copy link.</p>}
          >
            <TextInput
              id={`${id}-url`}
              name="url"
              type="url"
              inputMode="url"
              defaultValue={state.values?.url ?? draft.branch?.googleMapsUrl}
              placeholder="https://maps.app.goo.gl/…"
              aria-invalid={!!errors.url}
              aria-describedby={errors.url ? `${id}-url-error` : undefined}
              className="h-field"
            />
          </Labeled>
        </Card>
        <StepFooter backHref={stepHref("business")} pending={pending} />
      </form>
    </StepFrame>
  );
}

const googleBenefits: { icon: IconName; title: string; text: string }[] = [
  { icon: "reviews", title: "New reviews come in automatically", text: "No need to check Google again and again." },
  { icon: "sparkle", title: "AI writes every reply", text: "Nothing is posted until you approve it." },
  { icon: "shield", title: "You stay in control", text: "Disconnect anytime from Branches." },
];

export function GoogleStep() {
  return (
    <StepFrame
      title="Connect your Google Business Profile"
      description="This is optional. Connecting lets us bring your Google reviews here and post the replies you approve."
    >
      <form action={skipGoogle} className="flex flex-1 flex-col gap-5">
        <Card className="flex flex-col gap-5 p-5">
          <ul className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {googleBenefits.map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-3 sm:flex-col sm:gap-1.5">
                <span className="grid size-8 flex-none place-items-center rounded-pill bg-selection text-primary-text">
                  <Icon name={benefit.icon} size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] leading-5 font-semibold">{benefit.title}</span>
                  <span className="block text-[12.5px] leading-[18px] text-fg-muted">{benefit.text}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="rounded-inner bg-app px-4 py-3">
            <p className="text-[13px] font-semibold">Google will ask you to allow:</p>
            <ul className="mt-1 flex flex-col gap-0.5 text-[13px] leading-5 text-fg-muted">
              <li className="flex items-start gap-2">
                <Icon name="check" size={14} className="mt-[3px] text-success" />
                Reading reviews of your business
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" size={14} className="mt-[3px] text-success" />
                Posting replies that you approve
              </li>
            </ul>
            <p className="mt-1.5 text-[12px] leading-[17px] text-fg-muted">Use the Google account that manages your business on Google Maps.</p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <Button variant="primary" size="md" icon="link" disabled title="Coming soon" className="w-full sm:w-fit">
              Connect Google Business Profile
            </Button>
            <p className="text-[12.5px] leading-[18px] text-fg-muted">Connecting Google is coming soon. For now, continue without it.</p>
          </div>
        </Card>

        <StepFooter
          backHref={stepHref("branch")}
          continueLabel="Continue without Google"
          note={
            <p className="text-[12.5px] leading-[18px] text-fg-muted">
              It is fine to skip. Your QR code works right away. Reviews and replies will start after you connect.
            </p>
          }
        />
      </form>
    </StepFrame>
  );
}

const exampleReplies: Record<Tone, string> = {
  Warm: "Thank you so much, Priya! So happy you liked the food and our quick service. Please visit again!",
  Friendly: "Thanks Priya! Glad you enjoyed it. See you again soon!",
  Professional: "Thank you for your review, Priya. We are glad you enjoyed the food and service.",
  Formal: "Dear Priya, thank you for your kind words. We look forward to serving you again.",
};

type CheckMode = "all" | "happy" | "most";

const checkModes: { value: CheckMode; title: string; text: string; summary: string; needsGoogle?: boolean }[] = [
  { value: "all", title: "I will check every reply", text: "Nothing goes on Google without your OK.", summary: "you check every reply" },
  { value: "happy", title: "Auto-post 4★ and 5★ replies", text: "You check replies to 1★ to 3★ reviews.", summary: "4★ and 5★ replies post automatically", needsGoogle: true },
  { value: "most", title: "Auto-post 3★ to 5★ replies", text: "You check replies to 1★ and 2★ reviews.", summary: "3★ to 5★ replies post automatically", needsGoogle: true },
];

const modeSettings: Record<CheckMode, Pick<OnboardingDraft, "approvalRule" | "autoPublish">> = {
  all: { approvalRule: "all", autoPublish: false },
  happy: { approvalRule: "3", autoPublish: true },
  most: { approvalRule: "2", autoPublish: true },
};

function modeFromDraft(draft: OnboardingDraft): CheckMode {
  if (!draft.autoPublish || !draft.googleConnected) return "all";
  return draft.approvalRule === "2" ? "most" : "happy";
}

export function RepliesStep() {
  const draft = useOnboardingDraft();
  const [state, formAction, pending] = useActionState(saveReplies, {});
  const [tone, setTone] = useState<Tone>(draft.tone ?? "Warm");
  const [mode, setMode] = useState<CheckMode>(modeFromDraft(draft));
  const connected = !!draft.googleConnected;
  const business = draft.businessName || "Your business";

  return (
    <StepFrame
      title="How should AI reply?"
      description="AI writes a reply for every Google review. Choose how it sounds and who checks it. You can change this anytime in AI replies."
    >
      <form action={formAction} noValidate className="flex flex-1 flex-col gap-5">
        <input type="hidden" name="tone" value={tone} />
        <input type="hidden" name="rule" value={modeSettings[mode].approvalRule} />
        <input type="hidden" name="auto" value={String(modeSettings[mode].autoPublish)} />
        <Card className="flex flex-col gap-5 p-5">
          {state.error && (
            <p role="alert" className="text-[13px] text-danger">
              {state.error}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <p className="text-label font-semibold">1. How should replies sound?</p>
            <div role="group" aria-label="Reply style" className="flex flex-wrap gap-2">
              {tones.map((toneOption) => (
                <Chip key={toneOption} pressed={toneOption === tone} onClick={() => setTone(toneOption)}>
                  {toneOption}
                </Chip>
              ))}
            </div>
            <div className="rounded-inner bg-app p-3.5">
              <div className="flex items-start gap-2.5">
                <Avatar name="Priya S." size={28} />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-2 text-[13px] font-semibold">
                    Priya S. <Rating value={5} />
                  </p>
                  <p className="text-[13px] leading-5">Lovely food and quick service.</p>
                </div>
              </div>
              <div className="mt-2 ml-[38px] rounded-[12px] bg-surface px-3 py-2 shadow-button-light">
                <p className="text-[11.5px] font-semibold text-fg-muted">Reply from {business}</p>
                <p aria-live="polite" className="text-[13px] leading-5">
                  {exampleReplies[tone]}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-5">
            <p className="text-label font-semibold" id="check-mode-label">
              2. Who checks replies before they go on Google?
            </p>
            <div role="radiogroup" aria-labelledby="check-mode-label" className="flex flex-col gap-2">
              {checkModes.map((option) => {
                const locked = option.needsGoogle && !connected;
                const on = mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-disabled={locked || undefined}
                    onClick={() => !locked && setMode(option.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-inner px-4 py-3 text-left transition-colors",
                      on ? "bg-selection shadow-[inset_0_0_0_1px_var(--selection-border)]" : "bg-surface shadow-button-light",
                      locked ? "cursor-not-allowed opacity-50" : !on && "hover:bg-row-hover",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-[18px] flex-none place-items-center rounded-pill border-[1.5px]",
                        on ? "border-primary" : "border-control",
                      )}
                    >
                      {on && <span className="size-2 rounded-pill bg-primary" />}
                    </span>
                    <span className="min-w-0 flex-1 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-2">
                      <span className={cn("block text-[13.5px] leading-5 font-semibold", on && "text-primary-text")}>
                        {option.title}
                        {option.value === "all" && <span className="ml-1.5 text-[11.5px] font-semibold text-fg-muted">(Recommended)</span>}
                      </span>
                      <span className="block text-[12.5px] leading-[18px] text-fg-muted">
                        {option.text}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="flex items-start gap-2 text-[12px] leading-[17px] text-fg-muted">
              <Icon name={connected ? "shield" : "link"} size={13} className="mt-0.5" />
              {connected
                ? "Replies to serious complaints always wait for you, whatever you choose."
                : "Auto-post works after you connect Google."}
            </p>
          </div>
        </Card>

        <StepFooter backHref={stepHref("google")} pending={pending} />
      </form>
    </StepFrame>
  );
}

function SetupItem({ ok, title, children, action }: { ok: boolean; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 border-t border-line py-1.5 first:border-t-0 first:pt-0 last:pb-0 sm:gap-3 sm:rounded-inner sm:border sm:bg-surface sm:p-3.5 sm:first:border-t sm:first:pt-3.5 sm:last:pb-3.5">
      <span className={cn("mt-0.5 grid size-6 flex-none place-items-center rounded-pill sm:mt-0 sm:size-7", ok ? "bg-success-bg text-success" : "bg-subtle text-fg-muted")}>
        <Icon name={ok ? "check" : "status-draft"} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-5 font-semibold">{title}</p>
        {children && <p className="text-[12.5px] leading-[18px] text-fg-muted">{children}</p>}
      </div>
      {action && <div className="flex-none">{action}</div>}
    </li>
  );
}

export function QrStep() {
  const draft = useOnboardingDraft();
  const business = draft.businessName || "Your business";
  const branch = draft.branch?.name || "Main";
  const path = `/r/${draft.branch?.qrCode}`;

  return (
    <StepFrame
      title="Your QR code is ready"
      description="Print it and keep it on tables, the counter or bills. Customers scan it, give a rating and get help writing their Google review."
    >
      <div className="flex flex-1 flex-col gap-5">
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-3.5 sm:contents">
            <div className="size-[108px] flex-none rounded-[16px] bg-app p-1.5 sm:size-[148px] sm:rounded-[20px] sm:p-2.5 [&_svg]:size-full">
              <QrPreview value={`${process.env.NEXT_PUBLIC_SITE_URL}${path}`} size={160} />
            </div>
            <div className="min-w-0 sm:hidden">
              <p className="text-[14.5px] leading-5 font-bold">{business}</p>
              <p className="text-[13px] text-fg-muted">{branch} branch</p>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="hidden sm:block">
              <p className="text-section font-bold">{business}</p>
              <p className="text-[13.5px] text-fg-muted">{branch} branch</p>
              <p className="mt-2 text-[13px] leading-5 text-fg-muted">
                Customers who scan this land on your review page, then post their review on Google themselves.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`/qr-codes/${draft.branch?.id}/download?format=png`} download className={buttonClass({})}>
                <Icon name="download" size={15} />
                Download
              </a>
              <CopyButton text={path} />
              <ButtonLink href={path} target="_blank" trailingIcon="external" variant="text">
                Preview
              </ButtonLink>
            </div>
          </div>
        </Card>

        <section aria-labelledby="setup-title" className="rounded-card border border-line bg-surface px-4 py-3.5 sm:border-0 sm:bg-transparent sm:p-0">
          <h2 id="setup-title" className="mb-3 text-card-title font-bold">
            Your setup
          </h2>
          <ul className="sm:grid sm:grid-cols-2 sm:gap-3">
            <SetupItem ok title="Business">
              {business}
              {draft.businessType ? ` · ${draft.businessType}` : ""}
            </SetupItem>
            <SetupItem ok title="First branch">
              {branch}
              {draft.branch?.googleReviewUrl ? " · Review link added" : ""}
            </SetupItem>
            <SetupItem
              ok={!!draft.googleConnected}
              title={draft.googleConnected ? "Google connected" : "Google not connected"}
              action={
                !draft.googleConnected && (
                  <Link href={stepHref("google")} className="text-[13px] font-semibold whitespace-nowrap text-primary-text hover:underline">
                    Connect now
                  </Link>
                )
              }
            >
              {draft.googleConnected ? "New reviews will come in automatically." : "QR works now. Reviews start after you connect."}
            </SetupItem>
            <SetupItem ok title="AI replies">
              {draft.tone ?? "Warm"} style · {checkModes.find((option) => option.value === modeFromDraft(draft))?.summary}
            </SetupItem>
          </ul>
        </section>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <Link href={stepHref("replies")} className="text-[14px] font-semibold text-fg-muted hover:text-fg">
            Back
          </Link>
          <form action={finishOnboarding}>
            <Button type="submit" variant="primary" size="md" trailingIcon="chevron-right">
              Go to dashboard
            </Button>
          </form>
        </div>
      </div>
    </StepFrame>
  );
}
