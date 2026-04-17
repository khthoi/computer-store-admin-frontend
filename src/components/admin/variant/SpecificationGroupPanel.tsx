import { Badge } from "@/src/components/ui/Badge";
import { SpecificationItemRow } from "./SpecificationItemRow";
import type { SpecificationGroup } from "@/src/types/product.types";

// ─── SpecificationGroupPanel ──────────────────────────────────────────────────

interface SpecificationGroupPanelProps {
  group: SpecificationGroup;
}

export function SpecificationGroupPanel({ group }: SpecificationGroupPanelProps) {
  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-sm font-semibold text-secondary-900">{group.label}</h3>
        {group.inherited ? (
          <Badge variant="default" size="sm">Inherited</Badge>
        ) : (
          <Badge variant="primary" size="sm">Direct</Badge>
        )}
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-secondary-100">
            <th className="pb-2 pr-4 text-left text-xs font-medium uppercase tracking-wide text-secondary-500 w-90">
              Thông số kỹ thuật
            </th>
            <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-secondary-500">
              Giá trị
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-50">
          {group.items.map((item) => (
            <SpecificationItemRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
