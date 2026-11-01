import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Standard padded page (Overview spacing). */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("flex flex-col gap-5 px-4 py-5 md:px-8 md:py-[26px]", className)}>{children}</main>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.02em]">{title}</h1>
        {description && <p className="mt-0.5 text-[13.5px] text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
