import { FunnelIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { SpecificationItemRow } from "./SpecificationItemRow";
import type { SpecificationGroup } from "@/src/types/product.types";

// ─── SpecificationGroupPanel ──────────────────────────────────────────────────

interface SpecificationGroupPanelProps {
  group: SpecificationGroup;
}

export function SpecificationGroupPanel({ group }: SpecificationGroupPanelProps) {
  const hasGiaTriChuan = group.items.some((it) => it.giaTriChuan != null);
  const hasGiaTriSo    = group.items.some((it) => it.giaTriSo    != null);
  const filterableCount = group.items.filter((it) => it.coTheLoc).length;

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Thứ tự hiển thị nhóm */}
          {group.displayOrder != null && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary-100 text-secondary-500 text-[10px] font-semibold leading-none shrink-0">
              {group.displayOrder}
            </span>
          )}
          <h3 className="text-sm font-semibold text-secondary-900">{group.label}</h3>
          {group.inherited ? (
            <Badge variant="default" size="sm">Kế thừa</Badge>
          ) : (
            <Badge variant="primary" size="sm">Trực tiếp</Badge>
          )}
        </div>

        {/* Filter visibility info */}
        <div className="flex items-center gap-2 shrink-0">
          {group.hienThiBoLoc ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-medium text-success-700">
              <FunnelIcon className="w-3 h-3" aria-hidden="true" />
              Bộ lọc bật · #{group.thuTuBoLoc}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-[11px] text-secondary-400">
              <FunnelIcon className="w-3 h-3" aria-hidden="true" />
              Bộ lọc tắt
            </span>
          )}
          {filterableCount > 0 && (
            <span className="text-[11px] text-secondary-400">
              {filterableCount}/{group.items.length} thuộc tính có thể lọc
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-52" />
          <col />
          {hasGiaTriChuan && <col className="w-36" />}
          {hasGiaTriSo    && <col className="w-28" />}
        </colgroup>
        <thead>
          <tr className="border-b border-secondary-100">
            <th className="pb-2 pr-4 text-left text-xs font-medium uppercase tracking-wide text-secondary-500">
              Thông số kỹ thuật
            </th>
            <th className="pb-2 pr-4 text-left text-xs font-medium uppercase tracking-wide text-secondary-500">
              Giá trị
            </th>
            {hasGiaTriChuan && (
              <th className="pb-2 pr-4 text-left text-xs font-medium uppercase tracking-wide text-secondary-500">
                Chuẩn hóa
              </th>
            )}
            {hasGiaTriSo && (
              <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-secondary-500">
                Giá trị số
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-50">
          {group.items.map((item) => (
            <SpecificationItemRow
              key={item.id}
              item={item}
              showGiaTriChuan={hasGiaTriChuan}
              showGiaTriSo={hasGiaTriSo}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
