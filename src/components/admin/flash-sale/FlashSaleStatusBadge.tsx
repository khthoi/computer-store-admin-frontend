import { Badge } from "@/src/components/ui/Badge";
import type { FlashSaleStatus } from "@/src/types/flash-sale.types";
import type { BadgeVariant, BadgeSize } from "@/src/components/ui/Badge";

// ─── Config map ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  FlashSaleStatus,
  { label: string; variant: BadgeVariant }
> = {
  nhap:         { label: "Nháp",         variant: "default" },
  sap_dien_ra:  { label: "Sắp diễn ra",  variant: "warning" },
  dang_dien_ra: { label: "Đang diễn ra", variant: "success" },
  da_ket_thuc:  { label: "Đã kết thúc",  variant: "default" },
  huy:          { label: "Đã hủy",       variant: "error"   },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface FlashSaleStatusBadgeProps {
  status: FlashSaleStatus;
  size?: BadgeSize;
}

export function FlashSaleStatusBadge({ status, size = "md" }: FlashSaleStatusBadgeProps) {
  const config  = STATUS_CONFIG[status] ?? STATUS_CONFIG.nhap;
  const isLive  = status === "dang_dien_ra";

  return (
    <Badge variant={config.variant} size={size}>
      {isLive ? (
        /* Pulse animation inline as first child — stays inside the badge bounds */
        <span className="inline-flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success-500" />
          </span>
          {config.label}
        </span>
      ) : (
        config.label
      )}
    </Badge>
  );
}
