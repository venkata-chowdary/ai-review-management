import { BottomTabs, IconRail, Sidebar } from "@/components/shell/Navigation";
import { account, usage } from "@/lib/mock/data";
import { getNavCounts } from "@/lib/mock/loaders";

// App shell: glass sidebar (≥1024px), icon rail (768–1023px),
// bottom tab bar (<768px).
export default function DashboardLayout({ children }: LayoutProps<"/">) {
  const counts = getNavCounts();
  return (
    <div className="flex min-h-dvh flex-1">
      <a
        href="#main"
        className="sr-only z-50 rounded-pill bg-surface px-4 py-2 font-semibold shadow-button-light focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Sidebar counts={counts} usage={usage} account={account} />
      <IconRail counts={counts} usage={usage} account={account} />
      <div id="main" className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
        {children}
      </div>
      <BottomTabs counts={counts} usage={usage} account={account} />
    </div>
  );
}
