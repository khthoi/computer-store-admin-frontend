import type { ReactNode } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  NoSymbolIcon,
  DocumentIcon,
  GlobeAltIcon,
  ArchiveBoxIcon,
  MagnifyingGlassCircleIcon,
  CheckBadgeIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminStatus =
  | "active"
  | "inactive"
  | "pending"
  | "suspended"
  | "draft"
  | "published"
  | "archived"
  | "approved"
  | "rejected"
  | "review"
  | "online"
  | "offline"
  | "banned"
  | "visible"
  | "hidden"
  | "out_of_stock";

export interface StatusBadgeProps {
  /** Any known AdminStatus value; unknown values render a neutral fallback. */
  status: string;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Hide the icon */
  iconless?: boolean;
  className?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG: Record<
  AdminStatus,
  { label: string; wrapper: string; icon: ReactNode }
> = {
  active:       { label: "Active",        wrapper: "bg-success-50 text-success-700 border-success-200",         icon: <CheckCircleIcon aria-hidden="true" /> },
  inactive:     { label: "Inactive",      wrapper: "bg-secondary-100 text-secondary-600 border-secondary-200",  icon: <XCircleIcon aria-hidden="true" /> },
  pending:      { label: "Pending",       wrapper: "bg-warning-50 text-warning-700 border-warning-200",         icon: <ClockIcon aria-hidden="true" /> },
  suspended:    { label: "Suspended",     wrapper: "bg-error-50 text-error-700 border-error-200",               icon: <NoSymbolIcon aria-hidden="true" /> },
  draft:        { label: "Draft",         wrapper: "bg-secondary-100 text-secondary-500 border-secondary-200",  icon: <DocumentIcon aria-hidden="true" /> },
  published:    { label: "Published",     wrapper: "bg-success-50 text-success-700 border-success-200",         icon: <GlobeAltIcon aria-hidden="true" /> },
  archived:     { label: "Archived",      wrapper: "bg-secondary-100 text-secondary-500 border-secondary-200",  icon: <ArchiveBoxIcon aria-hidden="true" /> },
  approved:     { label: "Approved",      wrapper: "bg-success-50 text-success-700 border-success-200",         icon: <CheckBadgeIcon aria-hidden="true" /> },
  rejected:     { label: "Rejected",      wrapper: "bg-error-50 text-error-700 border-error-200",               icon: <XCircleIcon aria-hidden="true" /> },
  review:       { label: "In Review",     wrapper: "bg-info-50 text-info-700 border-info-200",                  icon: <MagnifyingGlassCircleIcon aria-hidden="true" /> },
  online:       { label: "Online",        wrapper: "bg-success-50 text-success-700 border-success-200",         icon: <CheckCircleIcon aria-hidden="true" /> },
  offline:      { label: "Offline",       wrapper: "bg-secondary-100 text-secondary-500 border-secondary-200",  icon: <XCircleIcon aria-hidden="true" /> },
  banned:       { label: "Banned",        wrapper: "bg-error-50 text-error-700 border-error-200",               icon: <NoSymbolIcon aria-hidden="true" /> },
  // ── Variant detail statuses ──
  visible:      { label: "Visible",       wrapper: "bg-success-50 text-success-700 border-success-200",         icon: <EyeIcon aria-hidden="true" /> },
  hidden:       { label: "Hidden",        wrapper: "bg-secondary-100 text-secondary-500 border-secondary-200",  icon: <EyeSlashIcon aria-hidden="true" /> },
  out_of_stock: { label: "Out of Stock",  wrapper: "bg-error-50 text-error-700 border-error-200",               icon: <NoSymbolIcon aria-hidden="true" /> },
};

const FALLBACK_CONFIG = {
  label: "Unknown",
  wrapper: "bg-secondary-100 text-secondary-500 border-secondary-200",
  icon: <ClockIcon aria-hidden="true" />,
} as const;

const SIZE: Record<"sm" | "md" | "lg", { badge: string; icon: string }> = {
  sm: { badge: "px-2 py-0.5 text-[10px] gap-1",   icon: "w-3 h-3" },
  md: { badge: "px-2.5 py-1 text-xs gap-1.5",      icon: "w-3.5 h-3.5" },
  lg: { badge: "px-3 py-1.5 text-sm gap-2",         icon: "w-4 h-4" },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * StatusBadge — maps admin status strings to color-coded badges.
 *
 * ```tsx
 * <StatusBadge status="active" />
 * <StatusBadge status="draft" size="sm" />
 * <StatusBadge status="suspended" size="lg" iconless />
 * ```
 */
export function StatusBadge({
  status,
  size = "md",
  iconless = false,
  className = "",
}: StatusBadgeProps) {
  const { label, wrapper, icon } = (CONFIG as Record<string, typeof FALLBACK_CONFIG>)[status] ?? FALLBACK_CONFIG;
  const { badge, icon: iconSize } = SIZE[size];

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border font-medium",
        wrapper,
        badge,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!iconless && (
        <span className={iconSize} aria-hidden="true">
          {icon}
        </span>
      )}
      {label}
    </span>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name       Type                     Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * status     AdminStatus              required Status key
 * size       "sm"|"md"|"lg"           "md"     Badge dimensions
 * iconless   boolean                  false    Hide the leading icon
 * className  string                   ""       Extra Tailwind classes
 *
 * AdminStatus = "active"|"inactive"|"pending"|"suspended"|"draft"|
 *               "published"|"archived"|"approved"|"rejected"|"review"|
 *               "online"|"offline"
 */
