"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Select, type SelectOption, type SelectOptionBadge } from "@/src/components/ui/Select";
import type { BxgyFields } from "@/src/types/promotion.types";
import { getProductVariantsFlat, type ProductVariantFlat } from "@/src/services/product.service";
import { useAsyncSelectOptions } from "@/src/hooks/useAsyncSelectOptions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stockBadge(qty: number): SelectOptionBadge {
  if (qty === 0) return { text: "Hết hàng", variant: "error" };
  if (qty <= 5)  return { text: `${qty} còn lại`, variant: "warning" };
  return { text: `${qty} trong kho`, variant: "default" };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BxgyActionFormProps {
  value: BxgyFields;
  onChange: (value: BxgyFields) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function variantToOption(v: ProductVariantFlat): SelectOption {
  return {
    value: v.variantId,
    label: v.productName,
    subLabel: v.variantName,
    description: v.sku,
    badge: stockBadge(v.stock),
    disabled: v.status === "inactive",
  };
}

export function BxgyActionForm({ value, onChange }: BxgyActionFormProps) {
  // Accumulated map of every variant we've seen across searches + selections.
  const seenRef = useRef<Map<string, ProductVariantFlat>>(new Map());
  const [seenVersion, setSeenVersion] = useState(0);

  const variantFetcher = useCallback(async (q: string) => {
    const res = await getProductVariantsFlat(25, q || undefined);
    let changed = false;
    for (const v of res.variants) {
      if (!seenRef.current.has(v.variantId)) {
        seenRef.current.set(v.variantId, v);
        changed = true;
      }
    }
    if (changed) setSeenVersion((n) => n + 1);
    return {
      options: res.variants.map(variantToOption),
      totalCount: res.totalProducts,
    };
  }, []);

  const {
    options: variantOpts,
    totalCount: variantTotal,
    loading: variantLoading,
    onSearch: onVariantSearch,
  } = useAsyncSelectOptions({ fetcher: variantFetcher });

  // Snapshot options for the currently-picked buy/get ids — keeps trigger
  // labels rendered even when the live options list does not contain them.
  const selectedBuy = useMemo<SelectOption | undefined>(() => {
    if (!value.buyProductId) return undefined;
    const v = seenRef.current.get(value.buyProductId);
    if (v) return variantToOption(v);
    // Edit-mode fallback: BxgyFields persists labels with the saved IDs.
    if (value.buyProductLabel) return { value: value.buyProductId, label: value.buyProductLabel };
    return { value: value.buyProductId, label: value.buyProductId };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.buyProductId, value.buyProductLabel, seenVersion]);
  const selectedGet = useMemo<SelectOption | undefined>(() => {
    if (!value.getProductId) return undefined;
    const v = seenRef.current.get(value.getProductId);
    if (v) return variantToOption(v);
    if (value.getProductLabel) return { value: value.getProductId, label: value.getProductLabel };
    return { value: value.getProductId, label: value.getProductId };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.getProductId, value.getProductLabel, seenVersion]);

  function patch(partial: Partial<BxgyFields>) {
    onChange({ ...value, ...partial });
  }

  // Sync missing labels in `value` when we discover the variant for the first time.
  useEffect(() => {
    const patches: Partial<BxgyFields> = {};
    if (value.buyProductId && !value.buyProductLabel) {
      const vf = seenRef.current.get(value.buyProductId);
      if (vf) patches.buyProductLabel = `${vf.productName} — ${vf.variantName}`;
    }
    if (value.getProductId && !value.getProductLabel) {
      const vf = seenRef.current.get(value.getProductId);
      if (vf) patches.getProductLabel = `${vf.productName} — ${vf.variantName}`;
    }
    if (Object.keys(patches).length) patch(patches);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seenVersion]);

  function handleBuyChange(id: string) {
    const vdata = seenRef.current.get(id);
    patch({
      buyProductId: id || undefined,
      buyProductLabel: vdata ? `${vdata.productName} — ${vdata.variantName}` : undefined,
    });
  }

  function handleGetChange(id: string) {
    const vdata = seenRef.current.get(id);
    patch({
      getProductId: id || undefined,
      getProductLabel: vdata ? `${vdata.productName} — ${vdata.variantName}` : undefined,
    });
  }

  return (
    <div className="space-y-5">
      {/* BUY side */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">MUA</p>
        <Select
          label="Phiên bản sản phẩm mua"
          options={variantOpts}
          value={value.buyProductId ?? ""}
          onChange={(v) => handleBuyChange(v as string)}
          searchable
          asyncSearch
          onSearch={onVariantSearch}
          loading={variantLoading}
          totalCount={variantTotal}
          selectedOption={selectedBuy}
          clearable
          boldLabel
          placeholder="Bất kỳ phiên bản trong phạm vi"
          helperText="Để trống để khớp với bất kỳ phiên bản nào trong phạm vi"
        />
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
            className="w-28 rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <p className="mt-1 text-[11px] text-secondary-400">Số đơn vị tối thiểu khách hàng phải mua để kích hoạt ưu đãi</p>
        </div>
      </div>

      {/* GET side */}
      <div className="rounded-xl border border-success-200 bg-success-50 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-success-700">TẶNG (MIỄN PHÍ / GIẢM GIÁ)</p>
        <Select
          label="Phiên bản sản phẩm tặng"
          options={variantOpts}
          value={value.getProductId ?? ""}
          onChange={(v) => handleGetChange(v as string)}
          searchable
          asyncSearch
          onSearch={onVariantSearch}
          loading={variantLoading}
          totalCount={variantTotal}
          selectedOption={selectedGet}
          clearable
          boldLabel
          placeholder="Giống phiên bản mua"
          helperText="Để trống để áp dụng giảm giá cho cùng phiên bản mua"
        />
        <div className="grid gap-3 sm:grid-cols-3">
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
            <p className="mt-1 text-[11px] text-secondary-400">Số đơn vị nhận được với giá đã giảm</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Giảm giá (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                value={value.getDiscountPercent}
                onChange={(e) => patch({ getDiscountPercent: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
                className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <span className="text-sm text-secondary-500 shrink-0">%</span>
            </div>
            <p className="mt-1 text-[11px] text-secondary-400">
              {value.getDiscountPercent === 100 ? "Miễn phí hoàn toàn" : value.getDiscountPercent === 0 ? "Không giảm" : "100% = miễn phí"}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-600 mb-1.5">
              Số lần tối đa / đơn
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={value.maxApplicationsPerOrder}
              onChange={(e) => patch({ maxApplicationsPerOrder: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="mt-1 text-[11px] text-secondary-400">VD: 1 = tối đa 1 phiên bản miễn phí mỗi đơn</p>
          </div>
        </div>
      </div>

      {/* Summary preview */}
      <div className="rounded-xl bg-secondary-50 border border-secondary-200 px-4 py-3 text-sm text-secondary-600">
        <span className="font-medium text-secondary-800">Xem trước: </span>
        Mua {value.buyQuantity}×{" "}
        {value.buyProductLabel
          ?? (value.buyProductId ? "(đang tải tên...)" : "bất kỳ phiên bản đủ điều kiện")} →
        Tặng {value.getQuantity}×{" "}
        {value.getProductLabel
          ?? (value.getProductId ? "(đang tải tên...)" : "cùng phiên bản mua")}{" "}
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
