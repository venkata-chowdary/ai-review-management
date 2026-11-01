import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Display";
import { Field, SettingRow, TextInput } from "@/components/ui/Field";
import { Page, PageHeader } from "@/components/ui/Page";
import { account, businessName } from "@/lib/mock/data";

export const metadata: Metadata = { title: "Settings" };

// Provisional: composed from system components; no mockup exists yet.
// Fields are read-only until accounts exist.
export default function SettingsPage() {
  return (
    <Page className="max-w-content">
      <PageHeader title="Settings" description="Business details and account." />
      <Card className="p-5">
        <SectionTitle>Business</SectionTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Business name" htmlFor="biz-name">
            <TextInput id="biz-name" defaultValue={businessName} readOnly />
          </Field>
          <Field label="Owner" htmlFor="owner">
            <TextInput id="owner" defaultValue={account.name} readOnly />
          </Field>
        </div>
      </Card>
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
        <SettingRow title="Sign out" description="Sign-in arrives with accounts.">
          <Button disabled>Sign out</Button>
        </SettingRow>
        <SettingRow title="Delete account" description="Removes your business, locations and QR pages.">
          <Button variant="danger" icon="trash" disabled>
            Delete account
          </Button>
        </SettingRow>
      </Card>
    </Page>
  );
}
