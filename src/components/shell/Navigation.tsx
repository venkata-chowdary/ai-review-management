"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons/Icon";
import { Meter, UsageRing } from "@/components/ui/Display";
import { Sheet } from "@/components/ui/Sheet";
import { signOut } from "@/lib/auth/actions";
import { BranchSwitcherFallback, PillBranchSwitcher, SidebarBranchSwitcher } from "./BranchSwitcher";
import { isActive, navItems, type NavItem } from "./nav-items";

type Counts = { needsReply: number };
type Usage = { used: number; limit: number; resetsOn: string };
type Account = { initials: string; name: string; plan: string };

type LinkProps = { counts: Counts; query: string };

// The selected branch (?loc=) follows you between pages.
function href(item: NavItem, query: string) {
  return query ? `${item.href}?${query}` : item.href;
}

function WithQuery({ render }: { render: (query: string) => React.ReactNode }) {
  const params = useSearchParams();
  const loc = params.get("loc");
  return render(loc ? `loc=${encodeURIComponent(loc)}` : "");
}

/** Renders links with the current ?loc=; plain links while params load. */
function QueryAware({ render }: { render: (query: string) => React.ReactNode }) {
  return (
    <Suspense fallback={render("")}>
      <WithQuery render={render} />
    </Suspense>
  );
}

/* ---------- Sidebar (≥1024px) ---------- */

function SidebarLinks({ group, counts, query }: LinkProps & { group: NavItem["group"] }) {
  const pathname = usePathname();
  return (
    <>
      {navItems
        .filter((i) => i.group === group)
        .map((item) => {
          const active = isActive(pathname, item.href);
          const count = item.countKey ? counts[item.countKey] : 0;
          return (
            <Link
              key={item.href}
              href={href(item, query)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex h-9 items-center gap-2.5 rounded-pill px-3 text-[13.5px] font-semibold transition-colors",
                active ? "bg-sidebar-active text-sidebar-active-fg" : "text-sidebar-muted hover:bg-row-hover hover:text-sidebar-fg",
              )}
            >
              <Icon name={item.icon} motion={item.icon === "settings" ? "spin" : undefined} />
              {item.label}
              {count > 0 && (
                <span className="ml-auto rounded-pill bg-sidebar-count px-[7px] text-[11px] leading-[18px] font-bold text-sidebar-count-fg">
                  {count}
                  <span className="sr-only"> need a reply</span>
                </span>
              )}
            </Link>
          );
        })}
    </>
  );
}

export function Sidebar({ counts, usage, account }: { counts: Counts; usage: Usage; account: Account }) {
  return (
    <aside
      aria-label="Navigation"
      className="glass sticky top-0 z-20 hidden h-dvh w-sidebar flex-none flex-col gap-0.5 overflow-y-auto bg-sidebar px-3.5 py-[18px] text-sidebar-fg lg:flex"
    >
      <Suspense fallback={<BranchSwitcherFallback variant="sidebar" />}>
        <SidebarBranchSwitcher />
      </Suspense>
      <p className="px-2.5 pt-4 pb-1.5 text-[11px] font-bold tracking-[.08em] text-sidebar-muted uppercase">Workspace</p>
      <nav aria-label="Main" className="flex flex-col gap-0.5">
        <QueryAware render={(query) => <SidebarLinks group="workspace" counts={counts} query={query} />} />
      </nav>
      <p className="px-2.5 pt-4 pb-1.5 text-[11px] font-bold tracking-[.08em] text-sidebar-muted uppercase">Account</p>
      <nav aria-label="Account" className="flex flex-col gap-0.5">
        <QueryAware render={(query) => <SidebarLinks group="account" counts={counts} query={query} />} />
      </nav>
      <div className="mt-auto border-t border-sidebar-line px-2.5 pt-3.5 pb-1.5 text-[12px] leading-[17px]">
        <p className="mb-2 flex justify-between font-semibold">
          AI replies
          <span className="font-medium text-sidebar-muted">
            {usage.used} / {usage.limit}
          </span>
        </p>
        <Meter value={usage.used} max={usage.limit} label="AI replies used" track="bg-sidebar-meter-track" fill="bg-sidebar-meter" />
        <p className="mt-1.5 text-[11.5px] text-sidebar-muted">Resets {usage.resetsOn}</p>
      </div>
      <div className="flex items-center gap-2.5 px-2.5 pt-3 text-[12.5px] font-semibold">
        <span className="grid size-7 place-items-center rounded-pill bg-sidebar-raised text-[11px] shadow-button-light">{account.initials}</span>
        <span>
          {account.name}
          <small className="block text-[11.5px] font-medium text-sidebar-muted">{account.plan}</small>
        </span>
        <form action={signOut} className="ml-auto">
          <button type="submit" className="rounded-pill px-2.5 py-1 text-[12px] font-semibold text-sidebar-muted hover:bg-row-hover hover:text-sidebar-fg">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

/* ---------- Icon rail (768–1023px) ---------- */

function RailLinks({ counts, query }: LinkProps) {
  const pathname = usePathname();
  return (
    <>
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        const count = item.countKey ? counts[item.countKey] : 0;
        return (
          <Link
            key={item.href}
            href={href(item, query)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex w-[60px] flex-col items-center gap-1 rounded-[18px] pt-2 pb-1.5 text-[10.5px] font-semibold transition-colors",
              active ? "bg-sidebar-active text-sidebar-active-fg" : "text-sidebar-muted hover:bg-row-hover hover:text-sidebar-fg",
            )}
          >
            <Icon name={item.icon} size={19} motion={item.icon === "settings" ? "spin" : undefined} />
            {item.short}
            {count > 0 && (
              <span className="absolute top-1 right-2.5 min-w-4 rounded-pill bg-sidebar-count px-1 text-center text-[9.5px] leading-4 font-bold text-sidebar-count-fg">
                {count}
                <span className="sr-only"> need a reply</span>
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

export function IconRail({ counts, usage, account }: { counts: Counts; usage: Usage; account: Account }) {
  return (
    <nav
      aria-label="Main"
      className="glass sticky top-0 z-20 hidden h-dvh w-rail flex-none flex-col items-center gap-1 overflow-y-auto bg-sidebar py-4 text-sidebar-fg md:flex lg:hidden"
    >
      <span aria-hidden="true" className="mb-3.5 grid size-10 flex-none place-items-center rounded-pill bg-sidebar-raised shadow-button-light">
        <Icon name="pin" />
      </span>
      <QueryAware render={(query) => <RailLinks counts={counts} query={query} />} />
      <div className="mt-auto flex flex-col items-center gap-2 pt-3">
        <UsageRing percent={Math.round((usage.used / usage.limit) * 100)} />
        <span
          aria-label={`${account.name}, ${account.plan}`}
          className="grid size-[34px] place-items-center rounded-pill bg-sidebar-count text-[11px] font-bold text-sidebar-count-fg"
        >
          {account.initials}
        </span>
      </div>
    </nav>
  );
}

/* ---------- Bottom tab bar (<768px) ---------- */

function BottomLinks({ counts, query, onMore }: LinkProps & { onMore: () => void }) {
  const pathname = usePathname();
  const moreActive = navItems.some((i) => !i.primary && isActive(pathname, i.href));
  const tab = "group relative flex flex-1 flex-col items-center gap-0.5 rounded-[18px] py-1.5 text-[10.5px] font-semibold min-h-touch justify-center";
  return (
    <>
      {navItems
        .filter((i) => i.primary)
        .map((item) => {
          const active = isActive(pathname, item.href);
          const count = item.countKey ? counts[item.countKey] : 0;
          return (
            <Link
              key={item.href}
              href={href(item, query)}
              aria-current={active ? "page" : undefined}
              className={cn(tab, active ? "bg-sidebar-active text-sidebar-active-fg" : "text-sidebar-muted")}
            >
              <Icon name={item.icon} size={20} />
              {item.short}
              {count > 0 && (
                <span className="absolute top-0.5 left-[calc(50%+4px)] min-w-4 rounded-pill bg-sidebar-count px-1 text-center text-[9.5px] leading-4 font-bold text-sidebar-count-fg">
                  {count}
                  <span className="sr-only"> need a reply</span>
                </span>
              )}
            </Link>
          );
        })}
      <button
        type="button"
        onClick={onMore}
        aria-haspopup="dialog"
        className={cn(tab, moreActive ? "bg-sidebar-active text-sidebar-active-fg" : "text-sidebar-muted")}
      >
        <Icon name="more" size={20} />
        More
      </button>
    </>
  );
}

function MoreLinks({ query, onNavigate }: { query: string; onNavigate: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {navItems
        .filter((i) => !i.primary)
        .map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={href(item, query)}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-12 items-center gap-3 rounded-pill px-4 text-[15px] font-semibold",
                active ? "bg-sidebar-active text-sidebar-active-fg" : "text-fg hover:bg-row-hover",
              )}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
              <Icon name="chevron-right" className="ml-auto text-fg-muted" />
            </Link>
          );
        })}
    </>
  );
}

export function BottomTabs({ counts, usage, account }: { counts: Counts; usage: Usage; account: Account }) {
  const [more, setMore] = useState(false);
  return (
    <>
      <nav
        aria-label="Main"
        className="glass fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-30 flex gap-1 rounded-[26px] bg-sidebar p-1.5 md:hidden"
      >
        <QueryAware render={(query) => <BottomLinks counts={counts} query={query} onMore={() => setMore(true)} />} />
      </nav>
      <Sheet open={more} onClose={() => setMore(false)} label="More">
        <div className="flex flex-col gap-5 p-4">
          <Suspense fallback={<BranchSwitcherFallback variant="pill" />}>
            <PillBranchSwitcher />
          </Suspense>
          <nav aria-label="More pages" className="flex flex-col gap-1">
            <QueryAware render={(query) => <MoreLinks query={query} onNavigate={() => setMore(false)} />} />
          </nav>
          <div className="rounded-card border border-line p-4 text-[12px] leading-[17px]">
            <p className="mb-2 flex justify-between font-semibold">
              AI replies
              <span className="font-medium text-fg-muted">
                {usage.used} / {usage.limit}
              </span>
            </p>
            <Meter value={usage.used} max={usage.limit} label="AI replies used" />
            <p className="mt-1.5 text-[11.5px] text-fg-muted">Resets {usage.resetsOn}</p>
          </div>
          <div className="flex items-center gap-2.5 px-1 text-[13px] font-semibold">
            <span className="grid size-8 place-items-center rounded-pill bg-selection text-[11px] text-primary-text">{account.initials}</span>
            <span>
              {account.name}
              <small className="block text-[11.5px] font-medium text-fg-muted">{account.plan}</small>
            </span>
            <form action={signOut} className="ml-auto">
              <button type="submit" className="rounded-pill px-2.5 py-1 text-[12.5px] font-semibold text-fg-muted hover:bg-row-hover hover:text-fg">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </Sheet>
    </>
  );
}
