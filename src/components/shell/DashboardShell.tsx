import type { ReactNode } from "react";
import { BottomTabs, IconRail, Sidebar } from "@/components/shell/Navigation";
import { ShellProvider } from "@/components/shell/ShellContext";
import { listBranches } from "@/lib/data/branches";
import { initialsOf, requireOnboardedOwner } from "@/lib/data/business";
import { account as mockAccount, usage } from "@/lib/mock/data";
import { getNavCounts } from "@/lib/mock/loaders";

/**
 * The signed-in app shell. It reads the session, so it sits behind a Suspense
 * boundary in the layout. Signed-out visitors go to sign-in, and owners who
 * have not finished setup go back to onboarding.
 */
export async function DashboardShell({ children }: { children: ReactNode }) {
  const { user, business } = await requireOnboardedOwner();
  const branches = await listBranches();
  const counts = getNavCounts();
  // Plan and AI usage stay sample data until billing is built.
  const account = {
    initials: initialsOf(business.name, user.email ?? ""),
    name: business.name || user.email || "Owner",
    plan: mockAccount.plan,
  };

  return (
    <ShellProvider branches={branches.map((b) => ({ id: b.id, name: b.name, hasMapsLink: !!b.googleMapsUrl }))}>
      <Sidebar counts={counts} usage={usage} account={account} />
      <IconRail counts={counts} usage={usage} account={account} />
      <div id="main" className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
        {children}
      </div>
      <BottomTabs counts={counts} usage={usage} account={account} />
    </ShellProvider>
  );
}
