import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/icons/Icon";
import { ReviewAssistant } from "@/components/qr/ReviewAssistant";
import { Card } from "@/components/ui/Display";
import { Skeleton } from "@/components/ui/States";
import { getPublicBranch } from "@/lib/data/branches";
import { qrAttributes } from "@/lib/qr/suggestions";

export const metadata: Metadata = {
  title: "Leave a review",
  robots: { index: false },
};

// Placeholder until branches store their Google rating, menu items and
// contact links. Swap for real branch data once those columns exist.
const placeholderBranchDetails = {
  googleRating: 4.8,
  googleReviewCount: 1284,
  menuItems: ["Kaju katli", "Rasmalai", "Samosa", "Gift box", "Namkeen"],
  links: {
    instagram: "#",
    website: "#",
    phone: "#",
    whatsapp: "#",
  },
};

// Public QR landing page (customers, no sign-in). The same neutral path is
// offered for every rating.
export default function QrReviewPage({ params }: PageProps<"/r/[code]">) {
  return (
    // The design uses the browser's default line height and digits, not the
    // app's 22px body line height and tabular numbers.
    <main className="mx-auto flex w-full max-w-qr flex-1 flex-col bg-app px-4 pt-12 pb-[26px] leading-[normal] [font-feature-settings:normal]">
      <Suspense fallback={<QrPageSkeleton />}>
        <QrReview params={params} />
      </Suspense>
    </main>
  );
}

async function QrReview({ params }: Pick<PageProps<"/r/[code]">, "params">) {
  const { code } = await params;
  const branch = await getPublicBranch(code);
  if (!branch) notFound();

  const initials = (branch.businessName ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <div className="flex flex-col gap-3">
      <ReviewAssistant
        code={code}
        googleUrl={branch.googleReviewUrl}
        businessName={branch.businessName}
        branchName={branch.name}
        initials={initials}
        googleRating={placeholderBranchDetails.googleRating}
        googleReviewCount={placeholderBranchDetails.googleReviewCount}
        attributes={
          qrAttributes[branch.businessType ?? "Other"] ?? qrAttributes.Other
        }
        menuItems={placeholderBranchDetails.menuItems}
        aiPaused={branch.aiPaused}
      />
      <nav aria-label="Contact" className="mt-1 flex justify-center gap-4">
        {[
          {
            label: "Instagram",
            icon: "instagram" as const,
            href: placeholderBranchDetails.links.instagram,
          },
          {
            label: "Website",
            icon: "globe" as const,
            href: placeholderBranchDetails.links.website,
          },
          {
            label: "Call",
            icon: "phone" as const,
            href: placeholderBranchDetails.links.phone,
          },
          {
            label: "WhatsApp",
            icon: "whatsapp" as const,
            href: placeholderBranchDetails.links.whatsapp,
          },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            aria-label={link.label}
            className="grid size-11 place-items-center rounded-pill bg-surface text-fg shadow-button-light transition-[background-color,transform,box-shadow] duration-150 [@media(hover:hover)]:hover:-translate-y-px [@media(hover:hover)]:hover:bg-row-hover [@media(hover:hover)]:hover:shadow-[0_3px_8px_-2px_rgba(23,26,29,.16),0_0_0_.8px_rgba(23,26,29,.06)]"
          >
            <Icon name={link.icon} size={18} className="[stroke-width:1.7]" />
          </a>
        ))}
      </nav>
      <span className="self-center rounded-pill bg-surface px-4 py-2 text-[12px] font-bold shadow-button-light">
        Powered by Reviewly
      </span>
    </div>
  );
}

function QrPageSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Card className="relative flex flex-col items-center gap-2 p-5 pt-10">
        <Skeleton className="absolute -top-8 left-1/2 size-16 -translate-x-1/2 rounded-pill" />
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="mt-4 h-12 w-full rounded-inner" />
        <Skeleton className="mt-2 h-9 w-full rounded-pill" />
      </Card>
      <Card className="flex flex-col gap-3 p-5">
        <Skeleton className="h-6 w-28 rounded-pill" />
        <Skeleton className="h-[132px] w-full rounded-inner" />
      </Card>
      <Skeleton className="h-12 w-full rounded-pill" />
    </div>
  );
}
