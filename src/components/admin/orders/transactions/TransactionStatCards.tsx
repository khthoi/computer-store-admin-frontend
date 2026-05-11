import {
  CreditCardIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@/src/components/ui/Skeleton";
import type { TransactionStats } from "@/src/types/transaction.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1) + " tỷ ₫";
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + " triệu ₫";
  }
  return amount.toLocaleString("vi-VN") + " ₫";
}

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

function KpiCard({ title, value, sub, icon, variant, isLoading }: StatItem & { isLoading: boolean }) {
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
          {isLoading && sub && (
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

interface TransactionStatCardsProps {
  stats: TransactionStats;
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TransactionStatCards — 4 KPI cards cho trang danh sách giao dịch.
 *
 * Cards: Tổng GD | Tổng tiền TT | Tỷ lệ thành công | GD thất bại
 */
export function TransactionStatCards({
  stats,
  isLoading = false,
}: TransactionStatCardsProps) {
  const cards: StatItem[] = [
    {
      title:   "Tổng giao dịch",
      value:   stats.tongGiaoDich.toLocaleString("vi-VN"),
      icon:    <CreditCardIcon className="w-5 h-5" />,
      variant: "default",
    },
    {
      title:   "Tổng tiền thành công",
      value:   formatVND(stats.tongTien),
      icon:    <CurrencyDollarIcon className="w-5 h-5" />,
      variant: "primary",
    },
    {
      title:   "Tỷ lệ thành công",
      value:   `${stats.tyLeThanhCong}%`,
      sub:     `${stats.soThanhCong} / ${stats.tongGiaoDich} giao dịch`,
      icon:    <CheckCircleIcon className="w-5 h-5" />,
      variant: "success",
    },
    {
      title:   "Giao dịch thất bại",
      value:   stats.soThatBai.toLocaleString("vi-VN"),
      sub:     `${stats.soDangCho} đang chờ · ${stats.soDaHoan} đã hoàn`,
      icon:    <XCircleIcon className="w-5 h-5" />,
      variant: stats.soThatBai > 0 ? "error" : "default",
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
