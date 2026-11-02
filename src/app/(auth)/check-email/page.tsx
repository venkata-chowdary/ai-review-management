import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthShell";
import { ResendEmail } from "@/components/auth/AuthForms";
import { one } from "@/lib/search-params";

export const metadata: Metadata = { title: "Check your email" };

// After email sign-up; the link in the email opens setup.
export default function CheckEmailPage({ searchParams }: PageProps<"/check-email">) {
  return (
    <AuthCard
      icon="mail"
      title="Check your email"
      description={
        <>
          We sent a link to{" "}
          <Suspense fallback="your email">
            <SentTo searchParams={searchParams} />
          </Suspense>
          . Open it to continue.
        </>
      }
      footer={
        <Link href="/sign-up" className="font-semibold text-primary-text hover:underline">
          Change email
        </Link>
      }
    >
      <Suspense fallback={<ResendEmail />}>
        <ResendFor searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function SentTo({ searchParams }: Pick<PageProps<"/check-email">, "searchParams">) {
  const email = one((await searchParams).email);
  return email ? <strong className="font-semibold text-fg">{email}</strong> : "your email";
}

async function ResendFor({ searchParams }: Pick<PageProps<"/check-email">, "searchParams">) {
  return <ResendEmail email={one((await searchParams).email)} />;
}
