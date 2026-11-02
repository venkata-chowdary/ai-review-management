"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useState, useTransition, type ComponentProps, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/cn";
import { forgotPassword, resendConfirmation, resetPassword, signIn, signInWithGoogle, signUp } from "@/lib/auth/actions";
import { PASSWORD_HINT, type ActionState } from "@/lib/validation";

function AuthField({
  label,
  hint,
  error,
  aside,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  aside?: ReactNode;
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
}) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-label font-semibold">
          {label}
        </label>
        {aside}
      </div>
      {children({ id, describedBy })}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[12.5px] text-danger">
          <Icon name="alert" size={13} />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-[12px] text-fg-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function PasswordInput({ className, ...props }: ComponentProps<"input">) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <TextInput {...props} type={shown ? "text" : "password"} className={cn("pr-12", className)} />
      <button
        type="button"
        aria-pressed={shown}
        aria-label={shown ? "Hide password" : "Show password"}
        onClick={() => setShown((wasShown) => !wasShown)}
        className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-pill text-fg-muted hover:bg-row-hover hover:text-fg"
      >
        <Icon name={shown ? "eye-off" : "eye"} size={16} />
      </button>
    </div>
  );
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-inner bg-danger-bg px-4 py-3 text-[13px] leading-5 text-danger">
      <Icon name="alert" size={16} className="mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

// Before launch, swap in the official "Continue with Google" button, which Google's branding rules require.
export function GoogleButton({ next = "/" }: { next?: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="light"
        size="md"
        className="w-full"
        icon="user"
        loading={pending}
        onClick={() =>
          start(async () => {
            const result = await signInWithGoogle(next);
            if (result?.error) setError(result.error);
          })
        }
      >
        {pending ? "Opening Google…" : "Continue with Google"}
      </Button>
      {error && <FormAlert>{error}</FormAlert>}
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-[12px] font-semibold text-fg-muted" role="separator" aria-label="or">
      <span className="h-px flex-1 bg-line" />
      or
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

const emailInput = (id: string, describedBy: string | undefined, error: string | undefined, defaultValue?: string, autoFocus?: boolean) => (
  <TextInput
    id={id}
    name="email"
    type="email"
    autoComplete="email"
    inputMode="email"
    defaultValue={defaultValue}
    aria-invalid={!!error}
    aria-describedby={describedBy}
    className="h-field"
    autoFocus={autoFocus}
  />
);

export function SignInForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState(signIn, {} as ActionState);
  const errors = state.fieldErrors ?? {};
  const alert = state.error ?? initialError;

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      {alert && <FormAlert>{alert}</FormAlert>}
      <AuthField label="Email" error={errors.email}>
        {({ id, describedBy }) => emailInput(id, describedBy, errors.email, state.values?.email)}
      </AuthField>
      <AuthField
        label="Password"
        error={errors.password}
        aside={
          <Link href="/forgot-password" className="text-[12.5px] font-semibold text-primary-text hover:underline">
            Forgot password?
          </Link>
        }
      >
        {({ id, describedBy }) => (
          <PasswordInput id={id} name="password" autoComplete="current-password" aria-invalid={!!errors.password} aria-describedby={describedBy} className="h-field" />
        )}
      </AuthField>
      <Button type="submit" variant="primary" size="md" className="mt-2 w-full" loading={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, {} as ActionState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      {state.error && <FormAlert>{state.error}</FormAlert>}
      <AuthField label="Email" error={errors.email}>
        {({ id, describedBy }) => emailInput(id, describedBy, errors.email, state.values?.email)}
      </AuthField>
      <AuthField label="Create a password" hint={PASSWORD_HINT} error={errors.password}>
        {({ id, describedBy }) => (
          <PasswordInput id={id} name="password" autoComplete="new-password" aria-invalid={!!errors.password} aria-describedby={describedBy} className="h-field" />
        )}
      </AuthField>
      <Button type="submit" variant="primary" size="md" className="mt-2 w-full" loading={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-[12px] text-fg-muted">
        By signing up, you agree to our{" "}
        <a href="#terms" className="font-semibold text-primary-text hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="#privacy" className="font-semibold text-primary-text hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPassword, {} as ActionState);
  const error = state.fieldErrors?.email;

  if (state.ok) {
    return (
      <div role="status" className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-inner bg-selection px-4 py-3.5 text-[14px] leading-[21px]">
          <Icon name="mail" size={18} className="mt-0.5 text-primary-text" />
          <p>
            If <strong className="font-semibold">{state.values?.email}</strong> has an account, we have sent a reset link. Please check your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <AuthField label="Email" error={error}>
        {({ id, describedBy }) => emailInput(id, describedBy, error, state.values?.email, true)}
      </AuthField>
      <Button type="submit" variant="primary" size="md" className="mt-2 w-full" loading={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, {} as ActionState);
  const errors = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 text-center">
        <span className="grid size-12 place-items-center rounded-pill bg-success-bg text-success">
          <Icon name="check" size={22} />
        </span>
        <p className="text-[14px]">Password changed.</p>
        <ButtonLink href="/" variant="primary" size="md" className="w-full">
          Continue
        </ButtonLink>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      {state.error && <FormAlert>{state.error}</FormAlert>}
      <AuthField label="New password" hint={PASSWORD_HINT} error={errors.password}>
        {({ id, describedBy }) => (
          <PasswordInput id={id} name="password" autoComplete="new-password" aria-invalid={!!errors.password} aria-describedby={describedBy} className="h-field" />
        )}
      </AuthField>
      <AuthField label="Type it again" error={errors.confirm}>
        {({ id, describedBy }) => (
          <PasswordInput id={id} name="confirm" autoComplete="new-password" aria-invalid={!!errors.confirm} aria-describedby={describedBy} className="h-field" />
        )}
      </AuthField>
      <Button type="submit" variant="primary" size="md" className="mt-2 w-full" loading={pending}>
        {pending ? "Saving…" : "Save password"}
      </Button>
    </form>
  );
}

// 30-second wait so people can't flood their inbox.
export function ResendEmail({ email }: { email?: string }) {
  const [wait, setWait] = useState(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!wait) return;
    const timer = setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="light"
        size="md"
        icon="refresh"
        iconMotion="spin"
        loading={pending}
        disabled={wait > 0 || !email}
        onClick={() =>
          start(async () => {
            const result = await resendConfirmation(email ?? "");
            setError(result.error);
            if (result.ok) setWait(30);
          })
        }
      >
        {pending ? "Sending…" : wait > 0 ? `Send again in ${wait}s` : "Send again"}
      </Button>
      <p aria-live="polite" className={cn("text-[12px]", error ? "text-danger" : "text-fg-muted")}>
        {error ?? (wait > 0 ? "Sent. Please check spam also." : "Not received? Check spam.")}
      </p>
    </div>
  );
}
