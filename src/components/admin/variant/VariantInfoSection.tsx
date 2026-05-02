import {
  CubeIcon,
  TagIcon,
  ScaleIcon,
  CalendarDaysIcon,
  StarIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { formatDateTime, formatVND } from "@/src/lib/format";
import type { ProductVariantDetail } from "@/src/types/product.types";
import type { VariantStockLevel } from "@/src/types/inventory.types";
import { Tooltip as UITooltip } from "@/src/components/ui/Tooltip";
// ─── VariantInfoSection ───────────────────────────────────────────────────────

interface VariantInfoSectionProps {
  variant: ProductVariantDetail;
  stockLevel?: VariantStockLevel | null;
}

export function VariantInfoSection({ variant, stockLevel }: VariantInfoSectionProps) {
  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Thông tin phiên bản
      </h2>

      <ul className="space-y-3">
        {variant.isDefault && (
          <li className="flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 ring-1 ring-inset ring-success-200 w-fit">
            <StarIcon className="h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
            <span className="text-sm font-medium text-success-700">Phiên bản mặc định</span>
          </li>
        )}

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

        {/* ── Stock info ──────────────────────────────────────────────────── */}
        {stockLevel != null && (
          <>
            <li className="border-t border-secondary-100 pt-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-secondary-400">
                Tồn kho
              </span>
            </li>

            <InfoRow icon={<ArchiveBoxIcon />} label="Số lượng tồn">
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium text-secondary-800">
                  {stockLevel.quantityOnHand.toLocaleString("vi-VN")} đơn vị
                </span>
                <StockBadge alertLevel={stockLevel.alertLevel} />
              </span>
            </InfoRow>

            <InfoRow icon={<ExclamationTriangleIcon />} label="Ngưỡng cảnh báo">
              <span className="text-sm text-secondary-800">
                {stockLevel.lowStockThreshold.toLocaleString("vi-VN")} đơn vị
              </span>
            </InfoRow>

            <InfoRow icon={<BanknotesIcon />} label="Giá vốn TB">
              <span className="text-sm text-secondary-800">
                {stockLevel.averageCostPrice > 0
                  ? formatVND(stockLevel.averageCostPrice)
                  : "—"}
              </span>
            </InfoRow>
          </>
        )}
      </ul>
    </div>
  );
}

// ── Stock alert badge ──────────────────────────────────────────────────────────

function StockBadge({ alertLevel }: { alertLevel: VariantStockLevel["alertLevel"] }) {
  if (alertLevel === "out_of_stock_inv") {
    return (
      <span className="inline-flex items-center rounded-full bg-danger-50 px-2 py-0.5 text-xs font-medium text-danger-700 ring-1 ring-inset ring-danger-200">
        Hết hàng
      </span>
    );
  }
  if (alertLevel === "low_stock") {
    return (
      <span className="inline-flex items-center rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-700 ring-1 ring-inset ring-warning-200">
        Sắp hết
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700 ring-1 ring-inset ring-success-200">
      Còn hàng
    </span>
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
