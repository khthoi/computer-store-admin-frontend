"use client";

import type { CSSProperties, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

export type BadgeSize = "sm" | "md" | "lg";

export type BadgeShape = "pill" | "tag";

export interface BadgeProps {
  /** Color / semantic variant
   * @default "default"
   */
  variant?: BadgeVariant;
  /** @default "md" */
  size?: BadgeSize;
  /**
   * "pill" = rounded-full (default), "tag" = rounded-md
   * @default "pill"
   */
  shape?: BadgeShape;
  /**
   * Renders a small colored dot before the label.
   * Dot color matches the variant.
   * @default false
   */
  dot?: boolean;
  /**
   * Custom background color (hex). Overrides variant background.
   * When provided, variant-based bg/text classes are skipped — use textColor too.
   */
  backgroundColor?: string;
  /**
   * Custom text color (hex). Overrides variant text color.
   * Pair with backgroundColor for fully custom badges.
   */
  textColor?: string;
  /** Extra Tailwind classes */
  className?: string;
  children: ReactNode;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const VARIANT: Record<
  BadgeVariant,
  { badge: string; dot: string }
> = {
  default: {
    badge: "bg-secondary-100 text-secondary-700 border border-secondary-200",
    dot:   "bg-secondary-400",
  },
  primary: {
    badge: "bg-primary-100 text-primary-700 border border-primary-200",
    dot:   "bg-primary-600",
  },
  success: {
    badge: "bg-success-50 text-success-700 border border-success-200",
    dot:   "bg-success-500",
  },
  warning: {
    badge: "bg-warning-50 text-warning-700 border border-warning-200",
    dot:   "bg-warning-500",
  },
  error: {
    badge: "bg-error-50 text-error-700 border border-error-200",
    dot:   "bg-error-500",
  },
  info: {
    badge: "bg-info-50 text-info-700 border border-info-200",
    dot:   "bg-info-500",
  },
};

const SIZE: Record<BadgeSize, string> = {
  sm: "h-5  px-1.5 text-xs gap-1",
  md: "h-6  px-2   text-xs gap-1.5",
  lg: "h-7  px-2.5 text-sm gap-1.5",
};

const DOT_SIZE: Record<BadgeSize, string> = {
  sm: "size-1.5",
  md: "size-2",
  lg: "size-2",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Badge — compact status or category label.
 *
 * ```tsx
 * <Badge variant="success" dot>In Stock</Badge>
 * <Badge variant="warning">Low Stock</Badge>
 * <Badge variant="error">Out of Stock</Badge>
 * <Badge variant="primary" size="lg">NEW</Badge>
 *
 * // Custom colors:
 * <Badge shape="tag" backgroundColor="#ef4444" textColor="#ffffff">HOT</Badge>
 * ```
 */
export function Badge({
  variant = "default",
  size = "md",
  shape = "pill",
  dot = false,
  backgroundColor,
  textColor,
  className = "",
  children,
}: BadgeProps) {
  const hasCustomColor = Boolean(backgroundColor || textColor);
  const styles = VARIANT[variant];

  const inlineStyle: CSSProperties = {};
  if (backgroundColor) inlineStyle.backgroundColor = backgroundColor;
  if (textColor) inlineStyle.color = textColor;

  return (
    <span
      className={[
        "inline-flex items-center font-medium",
        shape === "tag" ? "rounded-md" : "rounded-full",
        SIZE[size],
        hasCustomColor ? "" : styles.badge,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={hasCustomColor ? inlineStyle : undefined}
    >
      {dot && !hasCustomColor && (
        <span
          aria-hidden="true"
          className={`shrink-0 rounded-full ${DOT_SIZE[size]} ${styles.dot}`}
        />
      )}
      {children}
    </span>
  );
}
