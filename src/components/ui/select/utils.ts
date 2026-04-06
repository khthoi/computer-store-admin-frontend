// ─── Select — Pure utility functions (no React dependency) ────────────────────

import type {
  SelectOption,
  SelectOptionGroup,
  SelectOptions,
  SelectOptionBadge,
  SelectOptionBadgeVariant,
} from "./types";

// ─── Option list helpers ──────────────────────────────────────────────────────

export function isGrouped(opts: SelectOptions): opts is SelectOptionGroup[] {
  return opts.length > 0 && "options" in opts[0];
}

export function flatOptions(opts: SelectOptions): SelectOption[] {
  return isGrouped(opts)
    ? opts.flatMap((g) => g.options)
    : (opts as SelectOption[]);
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

export const BADGE_VARIANT_CLASSES: Record<SelectOptionBadgeVariant, string> = {
  default: "bg-secondary-100 text-secondary-600 border-secondary-200",
  success: "bg-success-50  text-success-700  border-success-200",
  warning: "bg-warning-50  text-warning-700  border-warning-200",
  error:   "bg-error-50    text-error-700    border-error-200",
  info:    "bg-info-50     text-info-700     border-info-200",
};

export function resolveBadge(
  badge: SelectOptionBadge
): { text: string; variant: SelectOptionBadgeVariant } {
  if (typeof badge === "string") return { text: badge, variant: "default" };
  return { text: badge.text, variant: badge.variant ?? "default" };
}
