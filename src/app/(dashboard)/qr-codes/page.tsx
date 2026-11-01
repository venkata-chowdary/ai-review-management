import type { Metadata } from "next";
import { Suspense } from "react";
import { CopyButton } from "@/components/qr/QrBits";
import { QrPreview } from "@/components/qr/QrPreview";
import { LiveBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, Note } from "@/components/ui/Display";
import { Page, PageHeader } from "@/components/ui/Page";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { demoState, getLocations } from "@/lib/mock/loaders";

export const metadata: Metadata = { title: "QR codes" };

// Provisional: composed from system components; no mockup exists yet.
export default function QrCodesPage({ searchParams }: PageProps<"/qr-codes">) {
  return (
    <Page>
      <PageHeader
        title="QR codes"
        description="Each code opens your review page. Customers write and post their review on Google themselves."
        actions={
          <Button variant="primary" size="md" icon="plus" disabled title="QR generation arrives in a later phase">
            New QR code
          </Button>
        }
      />
      <Suspense fallback={<QrSkeleton />}>
        <QrContent searchParams={searchParams} />
      </Suspense>
    </Page>
  );
}

async function QrContent({ searchParams }: Pick<PageProps<"/qr-codes">, "searchParams">) {
  const state = demoState((await searchParams).state);
  if (state === "loading") return <QrSkeleton />;
  const locations = await getLocations({ state });

  if (locations.length === 0)
    return (
      <Card>
        <EmptyState icon="qr" title="No QR codes yet" action={<ButtonLink href="/locations">Add a location</ButtonLink>}>
          Add a location first. Each location gets its own review page and QR code.
        </EmptyState>
      </Card>
    );

  return (
    <>
      <section aria-label="QR codes" className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {locations.map((l) => {
          const path = `/r/${l.qrCode}`;
          return (
            <Card key={l.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-card-title font-semibold">{l.name}</h2>
                  <p className="text-[12px] text-fg-muted">{l.address}</p>
                </div>
                <LiveBadge ok={!l.aiPaused}>{l.aiPaused ? "AI paused" : "Suggestions on"}</LiveBadge>
              </div>
              <div className="flex items-center gap-4 rounded-inner bg-app p-3">
                <QrPreview seed={l.qrCode} size={112} />
                <dl className="flex flex-col gap-2 text-[12px]">
                  <div>
                    <dt className="font-semibold text-fg-muted">Scans this month</dt>
                    <dd className="text-[20px] leading-[26px] font-bold">{l.scansThisMonth}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-fg-muted">Page</dt>
                    <dd className="font-medium break-all">{path}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href={path} target="_blank" icon="external" iconMotion="nudge">
                  Open page
                </ButtonLink>
                <CopyButton text={path} />
                <Button icon="download" disabled title="Downloads arrive with QR generation">
                  PNG
                </Button>
                <Button icon="download" disabled title="Downloads arrive with QR generation">
                  SVG
                </Button>
              </div>
            </Card>
          );
        })}
      </section>
      <Note icon="shield">
        The code always points to this platform, so you can change where it leads without reprinting. Previews are placeholders; PNG and SVG
        downloads arrive with QR generation.
      </Note>
    </>
  );
}

function QrSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading QR codes" className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="flex flex-col gap-4 p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-[136px] w-full rounded-inner" />
          <Skeleton className="h-8 w-48 rounded-pill" />
        </Card>
      ))}
    </div>
  );
}
