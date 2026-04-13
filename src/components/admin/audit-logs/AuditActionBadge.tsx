import { Badge } from "@/src/components/ui/Badge";
import type { AuditActionType } from "@/src/types/audit-log.types";

// ─── Config ───────────────────────────────────────────────────────────────────

type BadgeVariant = "default" | "primary" | "success" | "warning" | "error" | "info";

const ACTION_CONFIG: Record<
  AuditActionType,
  { variant: BadgeVariant; label: string }
> = {
  TaoMoi:       { variant: "success", label: "Tạo mới" },
  CapNhat:      { variant: "warning", label: "Cập nhật" },
  Xoa:          { variant: "error",   label: "Xóa" },
  DoiTrangThai: { variant: "info",    label: "Đổi trạng thái" },
  XuatFile:     { variant: "default", label: "Xuất file" },
  NhapFile:     { variant: "default", label: "Nhập file" },
  DangNhap:     { variant: "primary", label: "Đăng nhập" },
  DangXuat:     { variant: "default", label: "Đăng xuất" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditActionBadgeProps {
  actionType: AuditActionType;
  /** @default "sm" */
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AuditActionBadge — semantic Badge for each AuditActionType.
 *
 * ```tsx
 * <AuditActionBadge actionType="TaoMoi" />        // green  "Tạo mới"
 * <AuditActionBadge actionType="Xoa"    />        // red    "Xóa"
 * <AuditActionBadge actionType="CapNhat" dot />   // yellow "Cập nhật" + dot
 * ```
 */
export function AuditActionBadge({
  actionType,
  size = "sm",
  dot = false,
}: AuditActionBadgeProps) {
  const { variant, label } = ACTION_CONFIG[actionType];

  return (
    <Badge variant={variant} size={size} dot={dot} className="w-fit">
      {label}
    </Badge>
  );
}
