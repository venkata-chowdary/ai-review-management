import type { Metadata } from "next";
import { Suspense } from "react";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
import { Card, Meter, SectionTitle } from "@/components/ui/Display";
import { Page, PageHeader } from "@/components/ui/Page";
import { CardsSkeleton, EmptyState } from "@/components/ui/States";
import { plan } from "@/lib/mock/data";
import { demoState, getUsage } from "@/lib/mock/loaders";

export const metadata: Metadata = { title: "Billing" };

// Provisional: composed from system components; no mockup exists yet.
// Pricing is not final, so no prices are shown.
export default function BillingPage({ searchParams }: PageProps<"/billing">) {
  return (
    <Page className="max-w-content">
      <PageHeader title="Billing" description="Your plan and this month’s AI usage." />
      <Suspense fallback={<CardsSkeleton label="Loading billing" />}>
        <BillingContent searchParams={searchParams} />
      </Suspense>
    </Page>
  );
}

async function BillingContent({ searchParams }: Pick<PageProps<"/billing">, "searchParams">) {
  const state = demoState((await searchParams).state);
  if (state === "loading") return <CardsSkeleton label="Loading billing" />;
  const usage = await getUsage({ state });
  const left = usage.limit - usage.used;

  return (
    <>
      <section className="grid gap-3.5 md:grid-cols-2">
        <Card className="flex flex-col gap-4 p-5">
          <div>
            <p className="text-[12px] font-semibold text-fg-muted">Current plan</p>
            <p className="text-page-title font-bold">{plan.name}</p>
          </div>
          <ul className="flex flex-col gap-2 text-[13px]">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Icon name="check" size={14} className="text-success" />
                {f}
              </li>
            ))}
          </ul>
          <div>
            <Button disabled title="Billing arrives in a later phase">
              Change plan
            </Button>
          </div>
        </Card>
        <Card className="flex flex-col gap-3 p-5">
          <p className="text-[12px] font-semibold text-fg-muted">AI replies this month</p>
          <p className="flex items-baseline gap-2 text-metric font-bold">
            {usage.used}
            <small className="text-[13px] font-semibold tracking-normal text-fg-muted">of {usage.limit}</small>
          </p>
          <Meter value={usage.used} max={usage.limit} label="AI replies used this month" />
          <p className="text-[12.5px] text-fg-muted">
            {left} left · resets {usage.resetsOn}. If the allowance runs out, drafts pause and your QR pages keep working with a direct link
            to Google.
          </p>
        </Card>
      </section>
      <Card>
        <SectionTitle className="px-5 pt-4">Invoices</SectionTitle>
        <EmptyState icon="card" title="No invoices yet">
          Invoices appear here once billing is set up.
        </EmptyState>
      </Card>
    </>
  );
}
