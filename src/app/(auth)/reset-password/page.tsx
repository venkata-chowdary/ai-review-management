import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { ButtonLink } from "@/components/ui/Button";
import { one } from "@/lib/search-params";

export const metadata: Metadata = { title: "New password" };

function NewPassword() {
  return (
    <AuthCard icon="shield" title="Set a new password">
      <ResetPasswordForm />
    </AuthCard>
  );
}

// Opened from the reset email, which signs the person in first (see /auth/callback).
export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <Suspense fallback={<NewPassword />}>
      <ResetOrExpired searchParams={searchParams} />
    </Suspense>
  );
}

// ?state=error: the reset link was expired or already used.
async function ResetOrExpired({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
  if (one((await searchParams).state) !== "error") return <NewPassword />;
  return (
    <AuthCard title="Link expired" description="This link is old. Please ask for a new one.">
      <ButtonLink href="/forgot-password" variant="primary" size="md" className="w-full">
        Send new link
      </ButtonLink>
    </AuthCard>
  );
}
