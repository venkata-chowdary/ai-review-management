import { Suspense } from "react";
import { DashboardShell } from "@/components/shell/DashboardShell";

// App shell: glass sidebar (≥1024px), icon rail (768–1023px),
// bottom tab bar (<768px). The shell itself loads behind Suspense because it
// reads the session.
export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-1">
      <a
        href="#main"
        className="sr-only z-50 rounded-pill bg-surface px-4 py-2 font-semibold shadow-button-light focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Suspense fallback={<div className="min-w-0 flex-1" aria-busy="true" />}>
        <DashboardShell>{children}</DashboardShell>
      </Suspense>
    </div>
  );
}
