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
  TruckIcon,
  CreditCardIcon,
  ArrowUturnLeftIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  GiftIcon,
  MinusCircleIcon,
  AdjustmentsHorizontalIcon,
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
  | "out_of_stock"
  | "has_active_orders"
  // ── Order statuses ──
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  // ── Payment statuses ──
  | "paid"
  | "unpaid"
  | "refunded"
  | "partially_refunded"
  // ── Inventory / Return statuses ──
  | "requested"
  | "received"
  | "completed"
  | "packing"
  | "packed"
  | "partial"
  | "low_stock"
  | "out_of_stock_inv"
  | "replacement"
  | "store_credit"
  // ── Promotion statuses ──
  | "scheduled"
  | "ended"
  | "expired"
  | "paused"
  // ── Loyalty transaction types ──
  | "earn"
  | "redeem"
  | "expire"
  | "adjust";

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
  has_active_orders: { label: "Has Active Orders", wrapper: "bg-warning-50 text-warning-700 border-warning-200",         icon: <ExclamationCircleIcon aria-hidden="true" /> },
  // ── Variant detail statuses ──
  visible:      { label: "Visible",       wrapper: "bg-success-50 text-success-700 border-success-200",         icon: <EyeIcon aria-hidden="true" /> },
  hidden:       { label: "Hidden",        wrapper: "bg-secondary-100 text-secondary-500 border-secondary-200",  icon: <EyeSlashIcon aria-hidden="true" /> },
  out_of_stock: { label: "Out of Stock",  wrapper: "bg-error-50 text-error-700 border-error-200",               icon: <NoSymbolIcon aria-hidden="true" /> },
  // ── Order statuses ──
  confirmed:    { label: "Confirmed",     wrapper: "bg-info-50 text-info-700 border-info-200",                  icon: <CheckBadgeIcon aria-hidden="true" /> },
  processing:   { label: "Processing",    wrapper: "bg-warning-50 text-warning-700 border-warning-200",         icon: <MagnifyingGlassCircleIcon aria-hidden="true" /> },
  shipped:      { label: "Shipped",       wrapper: "bg-info-50 text-info-700 border-info-200",                  icon: <TruckIcon aria-hidden="true" /> },
  delivered:    { label: "Delivered",     wrapper: "bg-success-50 text-success-700 border-success-200",         icon: <CheckCircleIcon aria-hidden="true" /> },
  cancelled:    { label: "Cancelled",     wrapper: "bg-error-50 text-error-700 border-error-200",               icon: <XCircleIcon aria-hidden="true" /> },
  returned:     { label: "Returned",      wrapper: "bg-secondary-100 text-secondary-600 border-secondary-200",  icon: <ArrowUturnLeftIcon aria-hidden="true" /> },
  // ── Payment statuses ──
  paid:                { label: "Paid",               wrapper: "bg-success-50 text-success-700 border-success-200",         icon: <BanknotesIcon aria-hidden="true" /> },
  unpaid:              { label: "Unpaid",             wrapper: "bg-warning-50 text-warning-700 border-warning-200",         icon: <ExclamationCircleIcon aria-hidden="true" /> },
  refunded:            { label: "Refunded",           wrapper: "bg-secondary-100 text-secondary-600 border-secondary-200",  icon: <ArrowUturnLeftIcon aria-hidden="true" /> },
  partially_refunded:  { label: "Partial Refund",     wrapper: "bg-warning-50 text-warning-700 border-warning-200",         icon: <CreditCardIcon aria-hidden="true" /> },
  // ── Inventory / Return statuses ──
  requested:           { label: "Requested",          wrapper: "bg-info-50 text-info-700 border-info-200",                  icon: <ClockIcon aria-hidden="true" /> },
  received:            { label: "Received",           wrapper: "bg-success-50 text-success-700 border-success-200",         icon: <ArrowDownTrayIcon aria-hidden="true" /> },
  completed:           { label: "Completed",          wrapper: "bg-success-50 text-success-700 border-success-200",         icon: <CheckCircleIcon aria-hidden="true" /> },
  packing:             { label: "Packing",            wrapper: "bg-warning-50 text-warning-700 border-warning-200",         icon: <CubeIcon aria-hidden="true" /> },
  packed:              { label: "Packed",             wrapper: "bg-info-50 text-info-700 border-info-200",                  icon: <ArrowUpTrayIcon aria-hidden="true" /> },
  partial:             { label: "Partial",            wrapper: "bg-warning-50 text-warning-700 border-warning-200",         icon: <ExclamationCircleIcon aria-hidden="true" /> },
  low_stock:           { label: "Low Stock",          wrapper: "bg-warning-50 text-warning-700 border-warning-200",         icon: <ExclamationTriangleIcon aria-hidden="true" /> },
  out_of_stock_inv:    { label: "Out of Stock",       wrapper: "bg-error-50 text-error-700 border-error-200",               icon: <NoSymbolIcon aria-hidden="true" /> },
  replacement:         { label: "Replacement",        wrapper: "bg-info-50 text-info-700 border-info-200",                  icon: <ArrowPathIcon aria-hidden="true" /> },
  store_credit:        { label: "Store Credit",       wrapper: "bg-secondary-100 text-secondary-600 border-secondary-200",  icon: <CreditCardIcon aria-hidden="true" /> },
  // ── Promotion statuses ──
  scheduled:           { label: "Scheduled",          wrapper: "bg-info-50 text-info-700 border-info-200",                  icon: <ClockIcon aria-hidden="true" /> },
  ended:               { label: "Ended",              wrapper: "bg-secondary-100 text-secondary-500 border-secondary-200",  icon: <ArchiveBoxIcon aria-hidden="true" /> },
  expired:             { label: "Expired",            wrapper: "bg-secondary-100 text-secondary-500 border-secondary-200",  icon: <XCircleIcon aria-hidden="true" /> },
  paused:              { label: "Paused",             wrapper: "bg-warning-50 text-warning-700 border-warning-200",         icon: <ExclamationCircleIcon aria-hidden="true" /> },
  // ── Loyalty transaction types ──
  earn:                { label: "Earn",               wrapper: "bg-success-50 text-success-700 border-success-200",         icon: <SparklesIcon aria-hidden="true" /> },
  redeem:              { label: "Redeem",             wrapper: "bg-warning-50 text-warning-700 border-warning-200",         icon: <GiftIcon aria-hidden="true" /> },
  expire:              { label: "Expire",             wrapper: "bg-error-50 text-error-700 border-error-200",               icon: <MinusCircleIcon aria-hidden="true" /> },
  adjust:              { label: "Adjust",             wrapper: "bg-info-50 text-info-700 border-info-200",                  icon: <AdjustmentsHorizontalIcon aria-hidden="true" /> },
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
