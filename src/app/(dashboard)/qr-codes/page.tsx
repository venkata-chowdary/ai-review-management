import type { Metadata } from "next";
import { Suspense } from "react";
import { Icon } from "@/components/icons/Icon";
import { CopyButton } from "@/components/qr/QrBits";
import { QrPreview } from "@/components/qr/QrPreview";
import { LiveBadge } from "@/components/ui/Badge";
import { buttonClass, ButtonLink } from "@/components/ui/Button";
import { Card, Note } from "@/components/ui/Display";
import { Page, PageHeader } from "@/components/ui/Page";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { listBranches } from "@/lib/data/branches";

export const metadata: Metadata = { title: "QR codes" };

export default function QrCodesPage() {
  return (
    <Page>
      <PageHeader
        title="QR codes"
        description="Each code opens your review page. Customers write and post their review on Google themselves."
      />
      <Suspense fallback={<QrSkeleton />}>
        <QrContent />
      </Suspense>
    </Page>
  );
}

async function QrContent() {
  const branches = await listBranches();

  if (branches.length === 0)
    return (
      <Card>
        <EmptyState icon="qr" title="No QR codes yet" action={<ButtonLink href="/branches/new">Add a branch</ButtonLink>}>
          Add a branch first. Each branch gets its own review page and QR code.
        </EmptyState>
      </Card>
    );

  return (
    <>
      <section aria-label="QR codes" className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((branch) => {
          const path = `/r/${branch.qrCode}`;
          return (
            <Card key={branch.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-card-title font-semibold">{branch.name}</h2>
                <LiveBadge ok={!branch.aiPaused}>{branch.aiPaused ? "AI paused" : "Suggestions on"}</LiveBadge>
              </div>
              {branch.googleReviewUrl ? (
                <>
                  <div className="flex items-center gap-4 rounded-inner bg-app p-3">
                    <QrPreview value={`${process.env.NEXT_PUBLIC_SITE_URL}${path}`} size={112} />
                    <dl className="flex flex-col gap-2 text-[12px]">
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
                    <a href={`/qr-codes/${branch.id}/download?format=png`} download className={buttonClass({})}>
                      <Icon name="download" size={15} />
                      PNG
                    </a>
                    <a href={`/qr-codes/${branch.id}/download?format=svg`} download className={buttonClass({})}>
                      <Icon name="download" size={15} />
                      SVG
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-start gap-3 rounded-inner bg-app p-4">
                  <p className="text-[13.5px] text-fg-muted">
                    Add this branch’s Google review link first. Until then, the QR code has nowhere to send customers.
                  </p>
                  <ButtonLink href={`/branches/${branch.id}/edit`} icon="pencil">
                    Add review link
                  </ButtonLink>
                </div>
              )}
            </Card>
          );
        })}
      </section>
      <Note icon="shield">
        The code always points to this platform, so you can change the Google review link later without reprinting.
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
