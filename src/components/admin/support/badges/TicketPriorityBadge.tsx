import { Badge } from "@/src/components/ui/Badge";
import type { BadgeVariant } from "@/src/components/ui/Badge";
import type { TicketPriority } from "@/src/types/ticket.types";

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  size?: "sm" | "md";
}

const CONFIG: Record<
  TicketPriority,
  { label: string; variant: BadgeVariant }
> = {
  Thap:      { label: "Thấp",       variant: "default"  },
  TrungBinh: { label: "Trung bình", variant: "info"     },
  Cao:       { label: "Cao",        variant: "warning"  },
  KhanCap:   { label: "Khẩn cấp",  variant: "error"    },
};

export function TicketPriorityBadge({
  priority,
  size = "md",
}: TicketPriorityBadgeProps) {
  const { label, variant } = CONFIG[priority] ?? CONFIG.Thap;

  return (
    <Badge variant={variant} size={size} dot>
      {label}
    </Badge>
  );
}
