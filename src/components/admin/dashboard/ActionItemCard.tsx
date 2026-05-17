"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type ActionItemTone = "warning" | "info" | "danger" | "success";

interface ActionItemCardProps {
  /** Short label, e.g. "Đơn chờ duyệt" */
  title: string;
  /** Numeric count to display prominently. */
  count: number;
  /** Destination URL — typically a filtered list view. */
  href: string;
  /** Icon shown in the tinted circle (16-20px heroicon). */
  icon: ReactNode;
  /** Visual tone — drives the color of the icon badge and count text. */
  tone?: ActionItemTone;
  /** Optional one-line CTA below the count, e.g. "Xem chi tiết". */
  ctaLabel?: string;
}

const TONE: Record<
  ActionItemTone,
  { badgeBg: string; iconText: string; countText: string }
> = {
  warning: { badgeBg: "bg-amber-100", iconText: "text-amber-700", countText: "text-amber-700" },
  info:    { badgeBg: "bg-blue-100",  iconText: "text-blue-700",  countText: "text-blue-700" },
  danger:  { badgeBg: "bg-red-100",   iconText: "text-red-700",   countText: "text-red-700" },
  success: { badgeBg: "bg-emerald-100", iconText: "text-emerald-700", countText: "text-emerald-700" },
};

export function ActionItemCard({
  title,
  count,
  href,
  icon,
  tone = "info",
  ctaLabel = "Xem chi tiết →",
}: ActionItemCardProps) {
  const styles = TONE[tone];

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${styles.badgeBg} ${styles.iconText}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {title}
        </div>
        <div className={`text-2xl font-semibold leading-tight ${styles.countText}`}>
          {count.toLocaleString("vi-VN")}
        </div>
        <div className="mt-0.5 text-xs text-slate-500 transition-colors group-hover:text-blue-600">
          {ctaLabel}
        </div>
      </div>
    </Link>
  );
}
