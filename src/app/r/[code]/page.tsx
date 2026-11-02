import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/icons/Icon";
import { ReviewAssistant } from "@/components/qr/ReviewAssistant";
import { Card } from "@/components/ui/Display";
import { Skeleton } from "@/components/ui/States";
import { businessName, qrAttributes } from "@/lib/mock/data";
import { getBranchByQrCode } from "@/lib/mock/loaders";
import { one } from "@/lib/search-params";

export const metadata: Metadata = { title: "Leave a review", robots: { index: false } };

// Public QR landing page (customers, no sign-in). Provisional design composed
// from the system. The same neutral path is offered for every rating.
export default function QrReviewPage({ params, searchParams }: PageProps<"/r/[code]">) {
  return (
    <main className="mx-auto flex w-full max-w-qr flex-1 flex-col gap-5 px-4 pt-6 pb-10">
      <Suspense fallback={<QrPageSkeleton />}>
        <QrReview params={params} searchParams={searchParams} />
      </Suspense>
      <footer className="mt-auto text-center text-[12px] leading-[18px] text-fg-muted">
        No login needed. We don’t ask for your name or number.
      </footer>
    </main>
  );
}

async function QrReview({ params, searchParams }: Pick<PageProps<"/r/[code]">, "params" | "searchParams">) {
  const { code } = await params;
  const branch = getBranchByQrCode(code);
  if (!branch) notFound();
  // ?ai=paused previews the fallback on any page.
  const aiPaused = branch.aiPaused || one((await searchParams).ai) === "paused";

  return (
    <>
      <header className="flex items-center gap-3">
        <span className="grid size-11 flex-none place-items-center rounded-pill bg-surface shadow-button-light">
          <Icon name="pin" size={18} />
        </span>
        <div>
          <h1 className="text-[20px] leading-[26px] font-bold tracking-[-0.01em]">{businessName}</h1>
          <p className="text-[13px] text-fg-muted">{branch.name}</p>
        </div>
      </header>
      <ReviewAssistant
        business={businessName}
        googleUrl={`https://search.google.com/local/writereview?placeid=${encodeURIComponent(branch.placeId)}`}
        attributes={qrAttributes}
        aiPaused={aiPaused}
      />
    </>
  );
}

function QrPageSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-pill" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Card className="flex flex-col gap-4 p-5">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-11 w-60 rounded-pill" />
        <Skeleton className="h-24 w-full rounded-inner" />
        <Skeleton className="h-12 w-full rounded-pill" />
      </Card>
    </>
  );
}
