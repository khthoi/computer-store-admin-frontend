import type { TicketIssueType } from "@/src/types/ticket.types";

interface TicketIssueTypeBadgeProps {
  issueType: TicketIssueType;
  size?: "sm" | "md";
}

const CONFIG: Record<TicketIssueType, { label: string; className: string }> = {
  HoiTin:       { label: "Hỏi thông tin",  className: "bg-sky-50    text-sky-700    border-sky-200"    },
  KhieuNai:     { label: "Khiếu nại",       className: "bg-orange-50 text-orange-700 border-orange-200" },
  YeuCauDoiTra: { label: "Đổi / Trả",       className: "bg-purple-50 text-purple-700 border-purple-200" },
  LoiKyThuat:   { label: "Lỗi kỹ thuật",   className: "bg-red-50    text-red-700    border-red-200"    },
  Khac:         { label: "Khác",            className: "bg-secondary-100 text-secondary-500 border-secondary-200" },
};

export function TicketIssueTypeBadge({
  issueType,
  size = "md",
}: TicketIssueTypeBadgeProps) {
  const { label, className } = CONFIG[issueType] ?? CONFIG.Khac;
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
