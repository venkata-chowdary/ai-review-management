import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";

// Working label until the product name and logo are decided.
export function ProductLabel() {
  return (
    <Link href="/sign-in" className="inline-flex items-center gap-2.5 rounded-pill pr-2 text-[14px] font-bold tracking-[-0.01em]">
      <span className="grid size-9 place-items-center rounded-pill bg-surface text-primary-text shadow-button-light">
        <Icon name="reviews" size={17} />
      </span>
      Local Business Review Platform
    </Link>
  );
}

export function AuthCard({
  title,
  description,
  icon,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  icon?: "mail" | "shield";
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        {icon && (
          <span className="mb-3 grid size-11 place-items-center rounded-pill bg-selection text-primary-text">
            <Icon name={icon} size={20} />
          </span>
        )}
        <h1 className="text-page-title font-bold">{title}</h1>
        {description && <p className="text-[14px] leading-[21px] text-fg-muted">{description}</p>}
      </div>
      {children}
      {footer && <p className="text-center text-[13.5px] text-fg-muted">{footer}</p>}
    </div>
  );
}
