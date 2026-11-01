import type { Metadata } from "next";
import { Suspense } from "react";
import { Icon } from "@/components/icons/Icon";
import { LiveBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, Note } from "@/components/ui/Display";
import { Page, PageHeader } from "@/components/ui/Page";
import { CardsSkeleton, EmptyState } from "@/components/ui/States";
import { demoState, getLocations } from "@/lib/mock/loaders";

export const metadata: Metadata = { title: "Locations" };

// Provisional: composed from system components; no mockup exists yet.
export default function LocationsPage({ searchParams }: PageProps<"/locations">) {
  return (
    <Page>
      <PageHeader
        title="Locations"
        description="Each location has its own Google review link, QR page and reply settings."
        actions={
          <Button variant="primary" size="md" icon="plus" disabled title="Adding locations arrives with onboarding">
            Add location
          </Button>
        }
      />
      <Suspense fallback={<CardsSkeleton cards={1} label="Loading locations" />}>
        <LocationsContent searchParams={searchParams} />
      </Suspense>
    </Page>
  );
}

async function LocationsContent({ searchParams }: Pick<PageProps<"/locations">, "searchParams">) {
  const state = demoState((await searchParams).state);
  if (state === "loading") return <CardsSkeleton cards={1} label="Loading locations" />;
  const locations = await getLocations({ state });

  if (locations.length === 0)
    return (
      <Card>
        <EmptyState icon="store" title="No locations yet">
          Add your first location with its Google review link to start collecting reviews.
        </EmptyState>
      </Card>
    );

  return (
    <>
      <Card className="overflow-hidden">
        <ul>
          {locations.map((l) => (
            <li key={l.id} className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-b-0 md:flex-row md:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid size-10 flex-none place-items-center rounded-pill bg-selection text-primary-text">
                  <Icon name="store" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold">{l.name}</p>
                  <p className="truncate text-[12px] text-fg-muted">
                    {l.address} · Place ID {l.placeId}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <LiveBadge ok={l.googleConnected}>{l.googleConnected ? "Google connected" : "Google access expired"}</LiveBadge>
                {l.googleConnected ? (
                  <Button icon="pencil" disabled title="Editing arrives with onboarding">
                    Edit
                  </Button>
                ) : (
                  <Button icon="refresh" disabled title="Reconnecting arrives with the Google integration">
                    Reconnect
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Note icon="link">
        Google connections are sample data in this build. Reconnecting and editing arrive with the Google Business Profile integration.
      </Note>
    </>
  );
}
