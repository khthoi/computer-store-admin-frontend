import type { ReviewStatus } from "@/src/types/review.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  size?:  "sm" | "md";
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG: Record<ReviewStatus, { label: string; className: string }> = {
  Pending:  { label: "Chờ duyệt", className: "bg-amber-50  text-amber-700  border-amber-200"              },
  Approved: { label: "Đã duyệt",  className: "bg-green-50  text-green-700  border-green-200"              },
  Rejected: { label: "Từ chối",   className: "bg-red-50    text-red-700    border-red-200"                },
  Hidden:   { label: "Đã ẩn",     className: "bg-secondary-100 text-secondary-500 border-secondary-200"  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewStatusBadge({ status, size = "md" }: ReviewStatusBadgeProps) {
  const { label, className } = CONFIG[status] ?? CONFIG.Pending;
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={[
        "inline-flex items-center font-medium rounded-full border whitespace-nowrap",
        sizeClass,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
