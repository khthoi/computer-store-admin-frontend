import type { NotificationStatus } from "@/src/types/notification.types";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  NotificationStatus,
  { label: string; className: string }
> = {
  ChuaGui: {
    label: "Chờ gửi",
    className: "bg-warning-100 text-warning-700",
  },
  DaGui: {
    label: "Đã gửi",
    className: "bg-success-100 text-success-700",
  },
  ThatBai: {
    label: "Thất bại",
    className: "bg-error-100 text-error-700",
  },
  HuyBo: {
    label: "Đã hủy",
    className: "bg-secondary-100 text-secondary-500",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationStatusBadgeProps {
  status: NotificationStatus;
  size?: "sm" | "md";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationStatusBadge({
  status,
  size = "md",
}: NotificationStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs",
        cfg.className,
      ].join(" ")}
    >
      {cfg.label}
    </span>
  );
}
