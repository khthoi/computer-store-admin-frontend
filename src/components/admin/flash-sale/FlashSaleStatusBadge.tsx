import { Badge } from "@/src/components/ui/Badge";
import type { FlashSaleStatus } from "@/src/types/flash-sale.types";
import type { BadgeVariant, BadgeSize } from "@/src/components/ui/Badge";

// ─── Config map ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  FlashSaleStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: "Hoạt động", variant: "success" },
  paused: { label: "Tạm dừng",  variant: "warning" },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface FlashSaleStatusBadgeProps {
  status: FlashSaleStatus;
  size?: BadgeSize;
}

export function FlashSaleStatusBadge({ status, size = "md" }: FlashSaleStatusBadgeProps) {
  const config  = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  const isLive  = status === "active";

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
