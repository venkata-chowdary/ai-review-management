"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import { Menu, PillContent, pillTriggerClass, type MenuOption } from "@/components/ui/Menu";
import { useShellBranches } from "./ShellContext";

function useOptions(): MenuOption[] {
  const branches = useShellBranches();
  return [
    { value: "", label: "All branches", hint: `${branches.length} ${branches.length === 1 ? "branch" : "branches"}` },
    ...branches.map((b) => ({ value: b.id, label: b.name, hint: b.hasReviewLink ? "Review link added" : "No review link" })),
  ];
}

/** Keeps the selected branch in ?loc= so every page and link can read it. */
function useBranchParam() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get("loc") ?? "";
  function set(next: string) {
    const p = new URLSearchParams(params);
    if (next) p.set("loc", next);
    else p.delete("loc");
    p.delete("id");
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  return [value, set] as const;
}

/** Raised white pill at the top of the sidebar. */
export function SidebarBranchSwitcher() {
  const [value, set] = useBranchParam();
  const options = useOptions();
  return (
    <Menu
      label="Choose branch"
      value={value}
      options={options}
      onChange={set}
      triggerClassName="flex w-full items-center gap-2.5 rounded-pill bg-sidebar-raised px-3 py-[9px] text-left text-sidebar-fg shadow-button-light hover:bg-row-hover"
      trigger={(current) => (
        <>
          <Icon name="pin" />
          <span className="flex-1 text-[13px] leading-[17px] font-semibold">
            {current?.label}
            <small className="block text-[11.5px] font-medium text-sidebar-muted">{current?.hint}</small>
          </span>
          <Icon name="chevron-down" />
        </>
      )}
    />
  );
}

/** Bordered pill used in page headers. */
export function PillBranchSwitcher({ align }: { align?: "start" | "end" }) {
  const [value, set] = useBranchParam();
  const options = useOptions();
  return (
    <Menu
      label="Choose branch"
      value={value}
      options={options}
      onChange={set}
      align={align}
      triggerClassName={pillTriggerClass}
      trigger={(current) => <PillContent icon="pin">{current?.label}</PillContent>}
    />
  );
}

export function BranchSwitcherFallback({ variant }: { variant: "sidebar" | "pill" }) {
  const count = useShellBranches().length;
  return variant === "pill" ? (
    <span className={pillTriggerClass}>
      <PillContent icon="pin">All branches</PillContent>
    </span>
  ) : (
    <span className="flex w-full items-center gap-2.5 rounded-pill bg-sidebar-raised px-3 py-[9px] shadow-button-light">
      <Icon name="pin" />
      <span className="flex-1 text-[13px] leading-[17px] font-semibold">
        All branches
        <small className="block text-[11.5px] font-medium text-sidebar-muted">{count} {count === 1 ? "branch" : "branches"}</small>
      </span>
      <Icon name="chevron-down" />
    </span>
  );
}
