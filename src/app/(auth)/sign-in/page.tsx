import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthShell";
import { GoogleButton, OrDivider, SignInForm } from "@/components/auth/AuthForms";
import { one } from "@/lib/search-params";

export const metadata: Metadata = { title: "Log in" };

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <AuthCard
      title="Welcome back"
      footer={
        <>
          New here?{" "}
          <Link href="/sign-up" className="font-semibold text-primary-text hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <GoogleButton next="/" />
        <OrDivider />
        <Suspense fallback={<SignInForm />}>
          <SignInWithLinkError searchParams={searchParams} />
        </Suspense>
      </div>
    </AuthCard>
  );
}

// A sign-in or confirmation link that no longer works sends people back here with ?error=link.
async function SignInWithLinkError({ searchParams }: Pick<PageProps<"/sign-in">, "searchParams">) {
  const failed = one((await searchParams).error) === "link";
  return <SignInForm initialError={failed ? "This link is no longer valid. Please log in, or ask for a new one." : undefined} />;
}
