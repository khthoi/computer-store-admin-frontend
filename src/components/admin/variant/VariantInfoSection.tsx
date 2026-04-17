import {
  CubeIcon,
  TagIcon,
  ScaleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { formatDateTime } from "@/src/lib/format";
import type { ProductVariantDetail } from "@/src/types/product.types";
import { Tooltip } from "recharts";
import { Tooltip as UITooltip } from "@/src/components/ui/Tooltip";
// ─── VariantInfoSection ───────────────────────────────────────────────────────

interface VariantInfoSectionProps {
  variant: ProductVariantDetail;
}

export function VariantInfoSection({ variant }: VariantInfoSectionProps) {
  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Thông tin phiên bản
      </h2>

      <ul className="space-y-3">
        <InfoRow icon={<CubeIcon />} label="Tên phiên bản">
          <UITooltip content={variant.name} placement="right">
            <span className="text-sm text-secondary-800">{variant.name}</span>
          </UITooltip>
        </InfoRow>

        <InfoRow icon={<TagIcon />} label="SKU">
          <span className="font-mono text-xs text-secondary-600">{variant.sku}</span>
        </InfoRow>

        <InfoRow icon={<ScaleIcon />} label="Trọng lượng">
          <span className="text-sm text-secondary-800">
            {variant.weight !== undefined ? `${variant.weight} kg` : "—"}
          </span>
        </InfoRow>

        <InfoRow icon={<CalendarDaysIcon />} label="Cập nhật">
          <span className="text-sm text-secondary-800">
            {formatDateTime(variant.updatedAt)}
          </span>
        </InfoRow>
      </ul>
    </div>
  );
}

// ── Shared row layout ─────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="text-xs text-secondary-400">{label}: </span>
        {children}
      </span>
    </li>
  );
}
