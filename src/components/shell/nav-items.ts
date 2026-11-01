import type { IconName } from "@/components/icons/Icon";

export type NavItem = {
  href: string;
  label: string;
  /** Shorter label for the icon rail and bottom tabs. */
  short: string;
  icon: IconName;
  group: "workspace" | "account";
  /** Shown in the bottom tab bar; the rest live under "More". */
  primary?: boolean;
  countKey?: "needsReply";
};

export const navItems: NavItem[] = [
  { href: "/", label: "Overview", short: "Home", icon: "home", group: "workspace", primary: true },
  { href: "/reviews", label: "Reviews", short: "Reviews", icon: "reviews", group: "workspace", primary: true, countKey: "needsReply" },
  { href: "/insights", label: "Insights", short: "Insights", icon: "insights", group: "workspace", primary: true },
  { href: "/qr-codes", label: "QR codes", short: "QR", icon: "qr", group: "workspace", primary: true },
  { href: "/ai-replies", label: "AI replies", short: "AI", icon: "sliders", group: "workspace" },
  { href: "/locations", label: "Locations", short: "Locations", icon: "store", group: "account" },
  { href: "/billing", label: "Billing", short: "Billing", icon: "card", group: "account" },
  { href: "/settings", label: "Settings", short: "Settings", icon: "settings", group: "account" },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
