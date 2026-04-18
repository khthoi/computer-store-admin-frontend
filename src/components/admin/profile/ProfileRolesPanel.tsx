import { ShieldCheckIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Accordion, type AccordionItemDef } from "@/src/components/ui/Accordion";
import { Badge } from "@/src/components/ui/Badge";
import { AdminEmptyState } from "@/src/components/admin/shared/AdminEmptyState";
import type { VaiTro } from "@/src/types/role.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileRolesPanelProps {
  roles: VaiTro[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupPermissions(permissions: string[]): Record<string, string[]> {
  return permissions.reduce<Record<string, string[]>>((acc, perm) => {
    const [module] = perm.split(".");
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {});
}

const MODULE_LABELS: Record<string, string> = {
  products:   "Sản phẩm",
  orders:     "Đơn hàng",
  customers:  "Khách hàng",
  inventory:  "Kho hàng",
  promotions: "Khuyến mãi",
  reports:    "Báo cáo",
  employees:  "Nhân viên",
  roles:      "Vai trò & Quyền",
  settings:   "Cài đặt",
  content:    "Nội dung",
  support:    "Hỗ trợ",
};

const ACTION_LABELS: Record<string, string> = {
  view:    "Xem",
  create:  "Thêm mới",
  edit:    "Chỉnh sửa",
  delete:  "Xóa",
  publish: "Xuất bản",
  confirm: "Xác nhận",
  cancel:  "Hủy",
  refund:  "Hoàn tiền",
  export:  "Xuất dữ liệu",
  import:  "Nhập kho",
  adjust:  "Điều chỉnh",
  ban:     "Khóa tài khoản",
  assign:  "Phân quyền",
  manage:  "Quản lý",
};

function permLabel(perm: string): string {
  const [, action] = perm.split(".");
  return ACTION_LABELS[action] ?? action;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileRolesPanel({ roles }: ProfileRolesPanelProps) {
  if (roles.length === 0) {
    return (
      <AdminEmptyState
        icon={<ShieldCheckIcon className="h-8 w-8" />}
        title="Chưa có vai trò"
        description="Tài khoản của bạn chưa được phân công vai trò nào."
      />
    );
  }

  const items: AccordionItemDef[] = roles.map((role) => {
    const grouped = groupPermissions(role.permissions);

    return {
      value: role.id,
      label: (
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-4 w-4 text-violet-500 shrink-0" />
          <span className="font-medium text-secondary-800">{role.name}</span>
          <Badge variant="primary" size="sm">
            {role.permissions.length} quyền
          </Badge>
        </div>
      ),
      children: (
        <div className="space-y-4 px-1">
          {role.description && (
            <p className="text-sm text-secondary-500">{role.description}</p>
          )}

          {Object.entries(grouped).map(([module, perms]) => (
            <div key={module}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary-400">
                {MODULE_LABELS[module] ?? module}
              </p>
              <div className="flex flex-wrap gap-2">
                {perms.map((perm) => (
                  <span
                    key={perm}
                    className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700 border border-success-200"
                  >
                    <CheckIcon className="h-3 w-3" />
                    {permLabel(perm)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary-500">
        Tài khoản của bạn được phân công{" "}
        <span className="font-semibold text-secondary-700">{roles.length} vai trò</span>.
        Dưới đây là chi tiết các quyền hạn theo từng vai trò.
      </p>
      <Accordion items={items} multiple variant="bordered" />
    </div>
  );
}
