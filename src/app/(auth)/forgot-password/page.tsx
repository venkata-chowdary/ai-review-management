import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Forgot password" };

// Provisional. The confirmation never reveals whether an account exists.
export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot password?"
      description="Enter your email. We will send you a link to reset it."
      footer={
        <Link href="/sign-in" className="font-semibold text-primary-text hover:underline">
          Back to log in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
