import type { TicketStatus } from "@/src/types/ticket.types";

interface TicketStatusBadgeProps {
  status: TicketStatus;
  size?: "sm" | "md";
}

const CONFIG: Record<
  TicketStatus,
  { label: string; className: string }
> = {
  Moi:          { label: "Mới",           className: "bg-blue-50   text-blue-700   border-blue-200"   },
  DangXuLy:     { label: "Đang xử lý",   className: "bg-amber-50  text-amber-700  border-amber-200"  },
  ChoKhach:     { label: "Chờ khách",     className: "bg-purple-50 text-purple-700 border-purple-200" },
  DaGiaiQuyet:  { label: "Đã giải quyết", className: "bg-green-50  text-green-700  border-green-200"  },
  Dong:         { label: "Đóng",           className: "bg-secondary-100 text-secondary-500 border-secondary-200" },
};

export function TicketStatusBadge({
  status,
  size = "md",
}: TicketStatusBadgeProps) {
  const { label, className } = CONFIG[status] ?? CONFIG.Moi;
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
