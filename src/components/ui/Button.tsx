import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconMotion, type IconName } from "@/components/icons/Icon";

// Buttons from design-system/components/Buttons: full pills, a glossy blue
// primary, white "light" buttons that lift, text and destructive variants.

export type ButtonVariant = "primary" | "light" | "text" | "danger" | "on-primary";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "press group inline-flex items-center justify-center gap-1.5 rounded-pill font-semibold tracking-[-0.01em] whitespace-nowrap transition-[transform,background-color,color] duration-150 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 aria-disabled:pointer-events-none aria-disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-button-primary hover:bg-primary-hover focus-visible:outline-primary focus-visible:shadow-[var(--shadow-button-primary),inset_0_0_0_2px_var(--focus-ring-on-dark)]",
  light: "bg-surface text-fg shadow-button-light hover:bg-row-hover",
  text: "text-fg-muted hover:text-fg",
  danger: "bg-surface text-danger shadow-button-light hover:bg-row-hover",
  // White button on the blue lead card.
  "on-primary": "bg-surface text-fg shadow-button-light hover:bg-row-hover",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-control-sm text-[13px]",
  md: "h-control-md text-[14px]",
  lg: "h-control-lg text-[15px]",
};

const paddings: Record<ButtonSize, string> = { sm: "px-3.5", md: "px-6", lg: "px-7" };

const iconOnlySizes: Record<ButtonSize, string> = {
  sm: "size-control-sm",
  md: "size-control-md",
  lg: "size-control-lg",
};

export function buttonClass({
  variant = "light",
  size = "sm",
  iconOnly,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  className?: string;
}) {
  return cn(
    base,
    variants[variant],
    iconOnly ? iconOnlySizes[size] : [sizes[size], variant === "text" ? "px-2" : paddings[size]].join(" "),
    className,
  );
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconMotion?: IconMotion;
  /** Icon after the label (e.g. a chevron). */
  trailingIcon?: IconName;
  children?: ReactNode;
};

function Content({ icon, iconMotion, trailingIcon, children, loading }: Common & { loading?: boolean }) {
  return (
    <>
      {loading ? (
        <Icon name="spinner" size={15} className="animate-spin" />
      ) : (
        icon && <Icon name={icon} size={15} motion={iconMotion} />
      )}
      {children}
      {trailingIcon && (
        <Icon name={trailingIcon} size={15} motion={trailingIcon === "chevron-right" ? "nudge" : undefined} />
      )}
    </>
  );
}

/** Pass a progress word as children while `loading` ("Publishing…"). */
export function Button({
  variant,
  size,
  icon,
  iconMotion,
  trailingIcon,
  loading,
  className,
  children,
  type = "button",
  ...props
}: Common & { loading?: boolean } & ComponentProps<"button">) {
  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, iconOnly: !children, className })}
      {...props}
    >
      <Content icon={icon} iconMotion={iconMotion} trailingIcon={trailingIcon} loading={loading}>
        {children}
      </Content>
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  iconMotion,
  trailingIcon,
  className,
  children,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass({ variant, size, iconOnly: !children, className })} {...props}>
      <Content icon={icon} iconMotion={iconMotion} trailingIcon={trailingIcon}>
        {children}
      </Content>
    </Link>
  );
}
