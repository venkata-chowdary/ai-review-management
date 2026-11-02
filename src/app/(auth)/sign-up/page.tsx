import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthShell";
import { GoogleButton, OrDivider, SignUpForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Create account" };

// Provisional. Google sign-up goes straight to setup; email sign-up confirms
// the email first.
export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Free to start. Takes 5 minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-primary-text hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <GoogleButton next="/onboarding" />
        <OrDivider />
        <SignUpForm />
      </div>
    </AuthCard>
  );
}
