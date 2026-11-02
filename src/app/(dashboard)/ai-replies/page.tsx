import type { Metadata } from "next";
import { Suspense } from "react";
import { AiSettingsForm } from "@/components/settings/AiSettingsForm";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Display";
import { Page, PageHeader } from "@/components/ui/Page";
import { CardsSkeleton, EmptyState } from "@/components/ui/States";
import { tones } from "@/lib/mock/data";
import { demoState, getBranches } from "@/lib/mock/loaders";

export const metadata: Metadata = { title: "AI replies" };

// Provisional: composed from system components; no mockup exists yet.
export default function AiRepliesPage({ searchParams }: PageProps<"/ai-replies">) {
  return (
    <Page className="max-w-content">
      <PageHeader title="AI replies" description="Set how reply drafts are written and when they need your approval." />
      <Suspense fallback={<CardsSkeleton label="Loading AI settings" />}>
        <AiRepliesContent searchParams={searchParams} />
      </Suspense>
    </Page>
  );
}

async function AiRepliesContent({ searchParams }: Pick<PageProps<"/ai-replies">, "searchParams">) {
  const state = demoState((await searchParams).state);
  if (state === "loading") return <CardsSkeleton label="Loading AI settings" />;
  const branches = await getBranches({ state });
  if (branches.length === 0)
    return (
      <Card>
        <EmptyState icon="sliders" title="Add a branch first" action={<ButtonLink href="/branches">Go to Branches</ButtonLink>}>
          Reply settings apply per branch, with shared defaults.
        </EmptyState>
      </Card>
    );
  return <AiSettingsForm branches={branches} tones={tones} />;
}
