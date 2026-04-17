import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@/src/components/ui/Skeleton";
import type { NotificationStats } from "@/src/types/notification.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type CardVariant = "default" | "primary" | "success" | "error";

interface StatItem {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  variant: CardVariant;
}

// ─── Variant styles ────────────────────────────────────────────────────────────

const ICON_WRAPPER: Record<CardVariant, string> = {
  default: "bg-secondary-100 text-secondary-600",
  primary: "bg-primary-100 text-primary-600",
  success: "bg-success-100 text-success-600",
  error:   "bg-error-100   text-error-600",
};

const VALUE_COLOR: Record<CardVariant, string> = {
  default: "text-secondary-900",
  primary: "text-primary-700",
  success: "text-success-700",
  error:   "text-error-700",
};

// ─── Sub-component ────────────────────────────────────────────────────────────

function KpiCard({
  title, value, sub, icon, variant, isLoading,
}: StatItem & { isLoading: boolean }) {
  return (
    <div className="rounded-2xl border border-secondary-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-secondary-500 truncate">
            {title}
          </p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-28 rounded" />
          ) : (
            <p className={["mt-1 text-2xl font-bold leading-tight", VALUE_COLOR[variant]].join(" ")}>
              {value}
            </p>
          )}
          {!isLoading && sub && (
            <p className="mt-1 text-xs text-secondary-400 truncate">{sub}</p>
          )}
          {isLoading && (
            <Skeleton className="mt-1.5 h-3.5 w-36 rounded" />
          )}
        </div>
        <div className={["shrink-0 rounded-xl p-2.5", ICON_WRAPPER[variant]].join(" ")}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationStatCardsProps {
  stats: NotificationStats;
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationStatCards({
  stats,
  isLoading = false,
}: NotificationStatCardsProps) {
  const cards: StatItem[] = [
    {
      title:   "Tổng thông báo",
      value:   stats.tongThongBao.toLocaleString("vi-VN"),
      sub:     `${stats.chuaGui} chờ gửi · ${stats.huyBo} đã hủy`,
      icon:    <BellIcon className="w-5 h-5" />,
      variant: "default",
    },
    {
      title:   "Đã gửi thành công",
      value:   stats.daGui.toLocaleString("vi-VN"),
      icon:    <CheckCircleIcon className="w-5 h-5" />,
      variant: "success",
    },
    {
      title:   "Thất bại",
      value:   stats.thatBai.toLocaleString("vi-VN"),
      sub:     stats.thatBai > 0 ? "Cần gửi lại" : undefined,
      icon:    <XCircleIcon className="w-5 h-5" />,
      variant: stats.thatBai > 0 ? "error" : "default",
    },
    {
      title:   "Tỷ lệ đọc (Push)",
      value:   `${stats.tyLeDaDoc}%`,
      sub:     "Tính riêng kênh Push đã gửi",
      icon:    <EyeIcon className="w-5 h-5" />,
      variant: "primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
