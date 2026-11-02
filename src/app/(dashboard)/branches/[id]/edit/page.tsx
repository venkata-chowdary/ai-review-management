import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BranchForm } from "@/components/branches/BranchForm";
import { Page, PageHeader } from "@/components/ui/Page";
import { CardsSkeleton } from "@/components/ui/States";
import { getBranch } from "@/lib/data/branches";
import { requireOnboardedOwner } from "@/lib/data/business";

export const metadata: Metadata = { title: "Edit branch" };

export default function EditBranchPage({ params }: PageProps<"/branches/[id]/edit">) {
  return (
    <Page>
      <PageHeader title="Edit branch" description="Changes apply to this branch only." />
      <Suspense fallback={<CardsSkeleton cards={1} label="Loading branch" />}>
        <EditForm params={params} />
      </Suspense>
    </Page>
  );
}

async function EditForm({ params }: Pick<PageProps<"/branches/[id]/edit">, "params">) {
  await requireOnboardedOwner();
  const { id } = await params;
  // A branch that is not yours looks the same as one that does not exist.
  const branch = await getBranch(id);
  if (!branch) notFound();
  return <BranchForm branch={branch} />;
}
