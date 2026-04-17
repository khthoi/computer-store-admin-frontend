import "@/src/components/editor/styles/editor.css";
import type { SpecificationItem } from "@/src/types/product.types";

// ─── SpecificationItemRow ─────────────────────────────────────────────────────

interface SpecificationItemRowProps {
  item: SpecificationItem;
}

export function SpecificationItemRow({ item }: SpecificationItemRowProps) {
  return (
    <tr className="align-top">
      <td className="w-44 py-2.5 pr-4">
        <span className="text-sm font-medium text-secondary-700">{item.typeLabel}</span>
        {item.description && (
          <span className="mt-0.5 block text-xs text-secondary-400">{item.description}</span>
        )}
        {item.maKyThuat && (
          <code className="mt-1 inline-block rounded bg-secondary-100 px-1.5 py-0.5 font-mono text-[10px] text-secondary-500">
            {item.maKyThuat}
          </code>
        )}
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
