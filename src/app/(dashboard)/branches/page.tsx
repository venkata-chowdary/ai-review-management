import type { Metadata } from "next";
import { Suspense } from "react";
import { Icon } from "@/components/icons/Icon";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, Note } from "@/components/ui/Display";
import { Page, PageHeader } from "@/components/ui/Page";
import { CardsSkeleton, EmptyState } from "@/components/ui/States";
import { listBranches } from "@/lib/data/branches";
import { requireOnboardedOwner } from "@/lib/data/business";

export const metadata: Metadata = { title: "Branches" };

export default function BranchesPage() {
  return (
    <Page>
      <PageHeader
        title="Branches"
        description="Each branch has its own Google review link, QR page and reply settings."
        actions={
          <ButtonLink href="/branches/new" variant="primary" size="md" icon="plus">
            Add branch
          </ButtonLink>
        }
      />
      <Suspense fallback={<CardsSkeleton cards={1} label="Loading branches" />}>
        <BranchesContent />
      </Suspense>
    </Page>
  );
}

async function BranchesContent() {
  await requireOnboardedOwner();
  const branches = await listBranches();

  if (branches.length === 0)
    return (
      <Card>
        <EmptyState icon="store" title="No branches yet">
          Add your first branch with its Google review link to start collecting reviews.
        </EmptyState>
      </Card>
    );

  return (
    <>
      <Card className="overflow-hidden">
        <ul>
          {branches.map((b) => (
            <li key={b.id} className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-b-0 md:flex-row md:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid size-10 flex-none place-items-center rounded-pill bg-selection text-primary-text">
                  <Icon name="store" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold">{b.name}</p>
                  <p className="truncate text-[12px] text-fg-muted">
                    {b.googleMapsUrl ? (
                      <a href={b.googleMapsUrl} target="_blank" rel="noreferrer" className="hover:text-fg hover:underline">
                        View on Google Maps
                      </a>
                    ) : (
                      "No Google Maps link yet"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Button variant="light" icon="refresh" disabled title="Connecting Google arrives with the Google integration">
                  Connect Google
                </Button>
                <ButtonLink href={`/branches/${b.id}/edit`} icon="pencil">
                  Edit
                </ButtonLink>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Note icon="link">Connecting Google to a branch arrives with the Google Business Profile integration.</Note>
    </>
  );
}
