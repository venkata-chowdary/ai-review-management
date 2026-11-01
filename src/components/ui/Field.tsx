import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Inputs follow the search field: white, control-grey border, blue focus wash.
const control =
  "w-full border border-control bg-surface text-[14px] outline-none placeholder:text-fg-muted focus:border-primary focus:shadow-[0_0_0_3px_var(--selection-bg)] disabled:opacity-45 max-md:text-[16px]";

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-control-md rounded-pill px-4", className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "resize-y rounded-inner px-4 py-3 leading-[22px]", className)} {...props} />;
}

/** Label, optional hint, and the control stacked. */
export function Field({ label, hint, htmlFor, children }: { label: string; hint?: ReactNode; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-label font-semibold">
        {label}
      </label>
      {hint && <p className="-mt-1 text-[12px] text-fg-muted">{hint}</p>}
      {children}
    </div>
  );
}

/** A labelled settings row: text on the left, control on the right. */
export function SettingRow({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-line py-4 first:border-t-0 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold">{title}</p>
        {description && <p className="text-[12.5px] leading-[19px] text-fg-muted">{description}</p>}
      </div>
      <div className="flex-none">{children}</div>
    </div>
  );
}
