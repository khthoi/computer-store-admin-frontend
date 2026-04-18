"use client";

import { Select, type SelectOptionBadge } from "@/src/components/ui/Select";
import type { BxgyFields, DeliveryMode } from "@/src/types/promotion.types";

// ─── Stock badge helper ────────────────────────────────────────────────────────

function stockBadge(qty: number): SelectOptionBadge {
  if (qty === 0) return { text: "Out of stock", variant: "error" };
  if (qty <= 5)  return { text: `${qty} left`,      variant: "warning" };
  return { text: `${qty} in stock`, variant: "default" };
}

// ─── Mock product data ────────────────────────────────────────────────────────

const PRODUCT_OPTIONS = [
  { value: "PROD-001",         label: "Intel Core i9-13900K",         description: "ID: PROD-001",         badge: stockBadge(15)  },
  { value: "PROD-002",         label: "AMD Ryzen 9 7950X",             description: "ID: PROD-002",         badge: stockBadge(8)   },
  { value: "PROD-003",         label: "ASUS ROG Strix Z790-E",         description: "ID: PROD-003",         badge: stockBadge(3)   },
  { value: "PROD-004",         label: "Corsair Vengeance DDR5 32GB",   description: "ID: PROD-004",         badge: stockBadge(42)  },
  { value: "PROD-005",         label: "Samsung 990 Pro 2TB NVMe",      description: "ID: PROD-005",         badge: stockBadge(27)  },
  { value: "PROD-006",         label: "NVIDIA RTX 4090 FE",            description: "ID: PROD-006",         badge: stockBadge(2)   },
  { value: "PROD-THERMAL-001", label: "Arctic MX-4 Thermal Paste 4g", description: "ID: PROD-THERMAL-001", badge: stockBadge(156) },
];

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
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">MUA</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Select
              label="Sản phẩm mua"
              options={PRODUCT_OPTIONS}
              value={value.buyProductId ?? ""}
              onChange={(v) => {
                const id = v as string;
                const found = PRODUCT_OPTIONS.find((p) => p.value === id);
                patch({ buyProductId: id || undefined, buyProductLabel: found?.label });
              }}
              searchable
              clearable
              boldLabel
              placeholder="Bất kỳ sản phẩm trong phạm vi"
              helperText="Để trống để khớp với bất kỳ sản phẩm nào trong phạm vi"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Số lượng cần mua
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={value.buyQuantity}
              onChange={(e) => patch({ buyQuantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-[11px] text-secondary-400">Số đơn vị tối thiểu khách hàng phải mua để kích hoạt ưu đãi</p>
          </div>
        </div>
      </div>

      {/* GET side */}
      <div className="rounded-xl border border-success-200 bg-success-50 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-success-700">TẶNG (MIỄN PHÍ / GIẢM GIÁ)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Select
              label="Sản phẩm tặng"
              options={PRODUCT_OPTIONS}
              value={value.getProductId ?? ""}
              onChange={(v) => {
                const id = v as string;
                const found = PRODUCT_OPTIONS.find((p) => p.value === id);
                patch({ getProductId: id || undefined, getProductLabel: found?.label });
              }}
              searchable
              clearable
              boldLabel
              placeholder="Giống sản phẩm mua"
              helperText="Để trống để áp dụng giảm giá cho cùng sản phẩm mua"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Số lượng tặng
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={value.getQuantity}
              onChange={(e) => patch({ getQuantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-[11px] text-secondary-400">Số đơn vị khách hàng nhận được với giá đã giảm</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Giảm giá cho sản phẩm tặng
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
              <span className="text-sm text-secondary-500">% giảm</span>
              <span className="text-xs text-secondary-400">
                {value.getDiscountPercent === 100 ? "(miễn phí hoàn toàn)" : value.getDiscountPercent === 0 ? "(không giảm)" : ""}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-secondary-400">100% = miễn phí hoàn toàn; 50% = nửa giá; 0% = không giảm</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Số lần áp dụng tối đa mỗi đơn
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={value.maxApplicationsPerOrder}
              onChange={(e) => patch({ maxApplicationsPerOrder: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-[11px] text-secondary-400">VD: 1 = nhận tối đa 1 sản phẩm miễn phí mỗi đơn, bất kể có bao nhiêu bộ đủ điều kiện trong giỏ</p>
          </div>
        </div>
      </div>

      {/* Delivery mode (only for different products) */}
      {!isSameProduct && value.getProductId && (
        <div>
          <p className="text-xs font-semibold text-secondary-600 mb-2">Cách giao sản phẩm tặng</p>
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
                <div>
                  <span className="text-sm text-secondary-700">
                    {mode === "auto_add" ? "Tự động thêm vào giỏ" : "Khách hàng chọn từ danh sách"}
                  </span>
                  <p className="text-[11px] text-secondary-400">
                    {mode === "auto_add"
                      ? "Sản phẩm tặng được thêm vào giỏ tự động khi đủ điều kiện"
                      : "Khách hàng có thể chọn sản phẩm tặng từ danh sách"}
                  </p>
                </div>
              </label>
            ))}
          </div>
          {value.deliveryMode === "customer_selects" && (
            <div className="mt-3">
              <Select
                label="Sản phẩm tặng được phép chọn"
                options={PRODUCT_OPTIONS}
                value={value.eligibleFreeProductIds ?? []}
                onChange={(v) => patch({ eligibleFreeProductIds: v as string[] })}
                multiple
                searchable
                clearable
                boldLabel
                placeholder="Chọn sản phẩm tặng…"
                helperText="Sản phẩm khách hàng có thể chọn làm quà tặng"
              />
            </div>
          )}
        </div>
      )}

      {/* Summary preview */}
      <div className="rounded-xl bg-secondary-50 border border-secondary-200 px-4 py-3 text-sm text-secondary-600">
        <span className="font-medium text-secondary-800">Xem trước: </span>
        Mua {value.buyQuantity}× {value.buyProductLabel ?? "bất kỳ sản phẩm đủ điều kiện"} →
        Tặng {value.getQuantity}× {value.getProductLabel ?? "cùng sản phẩm"}{" "}
        {value.getDiscountPercent === 100 ? "MIỄN PHÍ" : `giảm ${value.getDiscountPercent}%`}
        {" "}(tối đa {value.maxApplicationsPerOrder} lần mỗi đơn)
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
