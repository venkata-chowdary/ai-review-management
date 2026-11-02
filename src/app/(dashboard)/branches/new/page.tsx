import type { Metadata } from "next";
import { BranchForm } from "@/components/branches/BranchForm";
import { Page, PageHeader } from "@/components/ui/Page";

export const metadata: Metadata = { title: "Add branch" };

export default function NewBranchPage() {
  return (
    <Page>
      <PageHeader title="Add branch" description="Customers who scan this branch’s QR code reach its Google review page." />
      <BranchForm />
    </Page>
  );
}
