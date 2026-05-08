import type { MessageSenderType, TicketStatus } from "@/src/types/ticket.types";

interface TicketStatusBadgeProps {
  status:          TicketStatus;
  lastSenderType?: MessageSenderType;
  size?:           "sm" | "md";
}

type DisplayKey = TicketStatus | "ChoNVPhanHoi" | "ChoKhachTraLoi";

const CONFIG: Record<DisplayKey, { label: string; className: string }> = {
  Moi:           { label: "Mới",              className: "bg-blue-50    text-blue-700    border-blue-200"    },
  DangXuLy:      { label: "Đang xử lý",      className: "bg-amber-50   text-amber-700   border-amber-200"   },
  ChoNVPhanHoi:  { label: "Chờ NV phản hồi", className: "bg-orange-50  text-orange-700  border-orange-200"  },
  ChoKhachTraLoi:{ label: "Chờ khách trả lời",className: "bg-purple-50 text-purple-700  border-purple-200"  },
  DaGiaiQuyet:   { label: "Đã giải quyết",   className: "bg-green-50   text-green-700   border-green-200"   },
  DaDong:        { label: "Đã đóng",          className: "bg-secondary-100 text-secondary-500 border-secondary-200" },
};

function resolveDisplayKey(
  status: TicketStatus,
  lastSenderType?: MessageSenderType,
): DisplayKey {
  if (status === "DangXuLy") {
    if (lastSenderType === "KhachHang") return "ChoNVPhanHoi";
    if (lastSenderType === "NhanVien")  return "ChoKhachTraLoi";
  }
  return status;
}

export function TicketStatusBadge({
  status,
  lastSenderType,
  size = "md",
}: TicketStatusBadgeProps) {
  const key = resolveDisplayKey(status, lastSenderType);
  const { label, className } = CONFIG[key];
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
