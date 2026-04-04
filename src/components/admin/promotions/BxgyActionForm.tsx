"use client";

import type { BxgyFields, DeliveryMode } from "@/src/types/promotion.types";

// ─── Mock product search data ─────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  { id: "PROD-001", label: "Intel Core i9-13900K" },
  { id: "PROD-002", label: "AMD Ryzen 9 7950X" },
  { id: "PROD-003", label: "ASUS ROG Strix Z790-E" },
  { id: "PROD-004", label: "Corsair Vengeance DDR5 32GB" },
  { id: "PROD-005", label: "Samsung 990 Pro 2TB NVMe" },
  { id: "PROD-006", label: "NVIDIA RTX 4090 FE" },
  { id: "PROD-THERMAL-001", label: "Arctic MX-4 Thermal Paste 4g" },
];

// ─── Simple product combobox ──────────────────────────────────────────────────

function ProductSelect({
  value,
  label,
  placeholder,
  onSelect,
}: {
  value?: string;
  label?: string;
  placeholder: string;
  onSelect: (id: string | undefined, label: string | undefined) => void;
}) {
  return (
    <select
      value={value ?? "__any__"}
      onChange={(e) => {
        if (e.target.value === "__any__") {
          onSelect(undefined, undefined);
        } else {
          const found = MOCK_PRODUCTS.find((p) => p.id === e.target.value);
          onSelect(found?.id, found?.label);
        }
      }}
      className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
    >
      <option value="__any__">{placeholder}</option>
      {MOCK_PRODUCTS.map((p) => (
        <option key={p.id} value={p.id}>{p.label}</option>
      ))}
    </select>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BxgyActionFormProps {
  value: BxgyFields;
  onChange: (value: BxgyFields) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BxgyActionForm({ value, onChange }: BxgyActionFormProps) {
  function patch(partial: Partial<BxgyFields>) {
    onChange({ ...value, ...partial });
  }

  const isSameProduct = !value.getProductId || value.getProductId === value.buyProductId;

  return (
    <div className="space-y-5">
      {/* BUY side */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">BUY</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Buy Product <span className="font-normal text-secondary-400">(or any in scope)</span>
            </label>
            <ProductSelect
              value={value.buyProductId}
              label={value.buyProductLabel}
              placeholder="Any product in scope"
              onSelect={(id, label) => patch({ buyProductId: id, buyProductLabel: label })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Quantity Required
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={value.buyQuantity}
              onChange={(e) => patch({ buyQuantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </div>

      {/* GET side */}
      <div className="rounded-xl border border-success-200 bg-success-50 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-success-700">GET (FREE / DISCOUNTED)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Get Product <span className="font-normal text-secondary-400">(or same as buy)</span>
            </label>
            <ProductSelect
              value={value.getProductId}
              label={value.getProductLabel}
              placeholder="Same as buy product"
              onSelect={(id, label) => patch({ getProductId: id, getProductLabel: label })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Free Quantity
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={value.getQuantity}
              onChange={(e) => patch({ getQuantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Discount on "Get" Item
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                value={value.getDiscountPercent}
                onChange={(e) => patch({ getDiscountPercent: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
                className="w-24 rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <span className="text-sm text-secondary-500">% off</span>
              <span className="text-xs text-secondary-400">
                {value.getDiscountPercent === 100 ? "(fully free)" : value.getDiscountPercent === 0 ? "(no discount)" : ""}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Max Applications Per Order
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={value.maxApplicationsPerOrder}
              onChange={(e) => patch({ maxApplicationsPerOrder: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-[11px] text-secondary-400">e.g. 1 = get at most 1 free item per order</p>
          </div>
        </div>
      </div>

      {/* Delivery mode (only for different products) */}
      {!isSameProduct && value.getProductId && (
        <div>
          <p className="text-xs font-semibold text-secondary-600 mb-2">Free Item Delivery Mode</p>
          <div className="flex gap-4">
            {(["auto_add", "customer_selects"] as DeliveryMode[]).map((mode) => (
              <label key={mode} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deliveryMode"
                  value={mode}
                  checked={value.deliveryMode === mode}
                  onChange={() => patch({ deliveryMode: mode })}
                  className="accent-primary-600"
                />
                <span className="text-sm text-secondary-700">
                  {mode === "auto_add" ? "Auto-add to cart" : "Customer selects from options"}
                </span>
              </label>
            ))}
          </div>
          {value.deliveryMode === "customer_selects" && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
                Eligible Free Products (comma-separated IDs)
              </label>
              <input
                type="text"
                value={(value.eligibleFreeProductIds ?? []).join(", ")}
                onChange={(e) =>
                  patch({
                    eligibleFreeProductIds: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="PROD-001, PROD-002, PROD-003"
                className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          )}
        </div>
      )}

      {/* Summary preview */}
      <div className="rounded-xl bg-secondary-50 border border-secondary-200 px-4 py-3 text-sm text-secondary-600">
        <span className="font-medium text-secondary-800">Preview: </span>
        Buy {value.buyQuantity}× {value.buyProductLabel ?? "any qualifying product"} →
        Get {value.getQuantity}× {value.getProductLabel ?? "same product"} at{" "}
        {value.getDiscountPercent === 100 ? "FREE" : `${value.getDiscountPercent}% off`}
        {" "}(max {value.maxApplicationsPerOrder} time{value.maxApplicationsPerOrder !== 1 ? "s" : ""} per order)
      </div>
    </div>
  );
}

export function defaultBxgyFields(): BxgyFields {
  return {
    buyQuantity: 1,
    getQuantity: 1,
    getDiscountPercent: 100,
    deliveryMode: "auto_add",
    maxApplicationsPerOrder: 1,
  };
}
