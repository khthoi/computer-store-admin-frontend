import "@/src/components/editor/styles/editor.css";
import type { SpecificationItem } from "@/src/types/product.types";

// ─── SpecificationItemRow ─────────────────────────────────────────────────────

interface SpecificationItemRowProps {
  item: SpecificationItem;
}

export function SpecificationItemRow({ item }: SpecificationItemRowProps) {
  return (
    <tr className="align-center">
      <td className="w-40 py-2.5 pr-4 text-sm font-medium text-secondary-700">
        {item.typeLabel}
      </td>
      <td className="py-2.5">
        {/* rte-preview applies the shared read-only content styles */}
        <div
          className="rte-preview text-sm"
          dangerouslySetInnerHTML={{ __html: item.value }}
        />
      </td>
    </tr>
  );
}
