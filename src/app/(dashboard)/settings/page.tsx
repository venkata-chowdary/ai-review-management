import type { Metadata } from "next";
import { Suspense } from "react";
import { BusinessNameForm } from "@/components/settings/BusinessNameForm";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Display";
import { SettingRow } from "@/components/ui/Field";
import { Page, PageHeader } from "@/components/ui/Page";
import { CardsSkeleton } from "@/components/ui/States";
import { signOut } from "@/lib/auth/actions";
import { requireOnboardedOwner } from "@/lib/data/business";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Page className="max-w-content">
      <PageHeader title="Settings" description="Business details and account." />
      <Suspense fallback={<CardsSkeleton cards={1} label="Loading settings" />}>
        <BusinessCard />
      </Suspense>
      <Card className="p-5">
        <SectionTitle className="mb-4">Notifications</SectionTitle>
        <SettingRow title="In-dashboard alerts" description="Approvals waiting, failed replies, Google access problems and AI allowance warnings.">
          <span className="text-[13px] font-semibold text-success">Always on</span>
        </SettingRow>
        <SettingRow title="Email notifications" description="Not part of the first release.">
          <span className="text-[13px] font-semibold text-fg-muted">Not available</span>
        </SettingRow>
      </Card>
      <Card className="p-5">
        <SectionTitle className="mb-4">Account</SectionTitle>
        <SettingRow title="Sign out" description="Ends your session on this device.">
          <form action={signOut}>
            <Button type="submit">
              Sign out
            </Button>
          </form>
        </SettingRow>
        <SettingRow title="Delete account" description="Removes your business, branches and QR pages.">
          <Button variant="danger" icon="trash" disabled>
            Delete account
          </Button>
        </SettingRow>
      </Card>
    </Page>
  );
}

async function BusinessCard() {
  const { user, business } = await requireOnboardedOwner();
  return (
    <Card className="p-5">
      <SectionTitle>Business</SectionTitle>
      <BusinessNameForm name={business.name} email={user.email ?? ""} />
    </Card>
  );
}
