"use client";

import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import { Toggle } from "@/src/components/ui/Toggle";
import { discountPercent } from "@/src/lib/format";
import type { DetailVariantStatus } from "@/src/types/product.types";

// ─── PricingStatusForm ────────────────────────────────────────────────────────

export interface PricingStatusFormValue {
  originalPrice: string;
  salePrice: string;
  status: DetailVariantStatus;
  isDefault: boolean;
}

interface PricingStatusFormProps {
  value: PricingStatusFormValue;
  onChange: (value: PricingStatusFormValue) => void;
  errors?: Partial<Record<"originalPrice" | "salePrice", string>>;
}

const STATUS_OPTIONS: { value: DetailVariantStatus; label: string; description: string }[] = [
  { value: "visible",      label: "Hiển thị",       description: "Hiển thị cho khách hàng" },
  { value: "hidden",       label: "Ẩn",        description: "Ẩn khỏi cửa hàng" },
  { value: "out_of_stock", label: "Hết hàng",  description: "Không khả dụng để mua" },
];

export function PricingStatusForm({ value, onChange, errors = {} }: PricingStatusFormProps) {
  const original = parseFloat(value.originalPrice) || 0;
  const sale     = parseFloat(value.salePrice) || 0;
  const discount = discountPercent(sale, original);

  function setField(field: "originalPrice" | "salePrice") {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [field]: e.target.value });
  }

  function setStatus(status: DetailVariantStatus) {
    onChange({ ...value, status });
  }

  function toggleDefault(checked: boolean) {
    onChange({ ...value, isDefault: checked });
  }

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Giá bán &amp; Trạng thái
      </h2>

      {/* Pricing */}
      <div className="space-y-4">
        <Input
          label="Giá gốc (₫)"
          type="number"
          min={0}
          step={1000}
          required
          value={value.originalPrice}
          onChange={setField("originalPrice")}
          placeholder="e.g. 49900000"
          errorMessage={errors.originalPrice}
        />

        <Input
          label="Giá bán (₫)"
          type="number"
          min={0}
          step={1000}
          required
          value={value.salePrice}
          onChange={setField("salePrice")}
          placeholder="e.g. 46900000"
          errorMessage={errors.salePrice}
        />

        {/* Live discount preview — always occupies space to prevent layout shift */}
        <div className="min-h-[36px]">
          {discount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-3 py-2">
              <span className="text-sm text-success-700">Giảm giá:</span>
              <Badge variant="success" size="sm">−{discount}%</Badge>
            </div>
          )}
        </div>
      </div>

      <hr className="border-secondary-100" />

      {/* Default variant toggle */}
      <div className="mb-5">
        <Toggle
          label="Phiên bản mặc định"
          description="Phiên bản này sẽ là phiên bản chính."
          checked={value.isDefault}
          onChange={(e) => toggleDefault(e.target.checked)}
        />
      </div>

      <hr className="my-5 border-secondary-100" />

      {/* Status radio cards */}
      <div>
        <p className="mb-3 text-sm font-medium text-secondary-700">Trạng thái</p>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((opt) => {
            const checked = value.status === opt.value;
            return (
              <label
                key={opt.value}
                className={[
                  "relative flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  checked
                    ? "border-primary-500 bg-primary-50"
                    : "border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="variant-status"
                  value={opt.value}
                  checked={checked}
                  onChange={() => setStatus(opt.value)}
                  className="sr-only"
                />
                {/* Custom radio dot */}
                <span
                  className={[
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    checked
                      ? "border-primary-600 bg-primary-600"
                      : "border-secondary-300 bg-white",
                  ].join(" ")}
                >
                  {checked && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-medium text-secondary-800">
                    {opt.label}
                  </span>
                  <span className="block text-xs text-secondary-500">
                    {opt.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
