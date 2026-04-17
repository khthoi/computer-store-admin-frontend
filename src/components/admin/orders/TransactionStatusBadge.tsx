import { Badge, type BadgeSize } from "@/src/components/ui/Badge";
import type { TransactionStatus } from "@/src/types/transaction.types";

// ─── Config map ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TransactionStatus,
  { variant: "warning" | "success" | "error" | "info"; label: string }
> = {
  Cho:       { variant: "warning", label: "Chờ xử lý" },
  ThanhCong: { variant: "success", label: "Thành công" },
  ThatBai:   { variant: "error",   label: "Thất bại" },
  DaHoan:    { variant: "info",    label: "Đã hoàn tiền" },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  size?: BadgeSize;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TransactionStatusBadge — maps trang_thai_giao_dich → Badge variant + label.
 *
 * ```tsx
 * <TransactionStatusBadge status="ThanhCong" />
 * <TransactionStatusBadge status="ThatBai" size="lg" />
 * ```
 */
export function TransactionStatusBadge({
  status,
  size = "md",
  className,
}: TransactionStatusBadgeProps) {
  const { variant, label } = STATUS_CONFIG[status];

  return (
    <Badge variant={variant} size={size} dot className={className}>
      {label}
    </Badge>
  );
}
