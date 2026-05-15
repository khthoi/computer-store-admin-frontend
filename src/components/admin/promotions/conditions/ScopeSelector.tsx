"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Select, type SelectOption, type SelectOptionBadge } from "@/src/components/ui/Select";
import { CategoryTreeSelect } from "@/src/components/admin/CategoryTreeSelect";
import type { CategoryNode } from "@/src/components/admin/CategoryTreeSelect";
import { getCategoryNodeTree } from "@/src/services/category.service";
import { getProducts, getProductVariantsFlat, type ProductVariantFlat } from "@/src/services/product.service";
import { getBrands } from "@/src/services/brand.service";
import { useAsyncSelectOptions } from "@/src/hooks/useAsyncSelectOptions";
import type { PromotionScope, ScopeType } from "@/src/types/promotion.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stockBadge(qty: number): SelectOptionBadge {
  if (qty === 0) return { text: "Hết hàng", variant: "error" };
  if (qty <= 5)  return { text: `${qty} còn lại`, variant: "warning" };
  return { text: `${qty} trong kho`, variant: "default" };
}

// ─── Draft scope ───────────────────────────────────────────────────────────────

export interface ScopeDraft {
  draftId: string;
  scopeType: ScopeType;
  scopeRefId?: string;
  scopeRefLabel?: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ScopeSelectorProps {
  scopes: ScopeDraft[];
  onChange: (scopes: ScopeDraft[]) => void;
}

const SCOPE_TYPE_OPTIONS: { value: ScopeType; label: string }[] = [
  { value: "global",   label: "Toàn bộ (tất cả sản phẩm)" },
  { value: "category", label: "Danh mục" },
  { value: "product",  label: "Sản phẩm" },
  { value: "variant",  label: "Phiên bản / SKU" },
  { value: "brand",    label: "Thương hiệu" },
];

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

export function ScopeSelector({ scopes, onChange }: ScopeSelectorProps) {
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    getCategoryNodeTree()
      .catch(() => [] as CategoryNode[])
      .then((cats) => { setCategoryTree(cats); setLoadingCats(false); });
  }, []);

  // ── Seen caches (variants & products) ──
  const seenVariantsRef = useRef<Map<string, ProductVariantFlat>>(new Map());
  const seenProductsRef = useRef<Map<string, { id: string; name: string }>>(new Map());
  const seenBrandsRef   = useRef<Map<string, { id: string; name: string }>>(new Map());
  const [, bumpSeen] = useState(0);

  const variantFetcher = useCallback(async (q: string) => {
    const res = await getProductVariantsFlat(25, q || undefined);
    for (const v of res.variants) {
      seenVariantsRef.current.set(v.variantId, v);
      seenProductsRef.current.set(v.productId, { id: v.productId, name: v.productName });
    }
    bumpSeen((n) => n + 1);
    return { options: res.variants.map(variantToOption), totalCount: res.totalProducts };
  }, []);

  const productFetcher = useCallback(async (q: string) => {
    const res = await getProducts({ q: q || undefined, pageSize: 25 });
    for (const p of res.data) seenProductsRef.current.set(p.id, { id: p.id, name: p.name });
    bumpSeen((n) => n + 1);
    return {
      options: res.data.map((p) => ({ value: p.id, label: p.name })),
      totalCount: res.total,
    };
  }, []);

  const brandFetcher = useCallback(async (q: string) => {
    const res = await getBrands({ q: q || undefined, pageSize: 25 });
    for (const b of res.data) seenBrandsRef.current.set(b.id, { id: b.id, name: b.name });
    bumpSeen((n) => n + 1);
    return {
      options: res.data.map((b) => ({ value: b.id, label: b.name })),
      totalCount: res.total,
    };
  }, []);

  const {
    options: variantOpts,
    totalCount: variantTotal,
    loading: variantLoading,
    onSearch: onVariantSearch,
  } = useAsyncSelectOptions({ fetcher: variantFetcher });
  const {
    options: productOpts,
    totalCount: productTotal,
    loading: productLoading,
    onSearch: onProductSearch,
  } = useAsyncSelectOptions({ fetcher: productFetcher });
  const {
    options: brandOpts,
    totalCount: brandTotal,
    loading: brandLoading,
    onSearch: onBrandSearch,
  } = useAsyncSelectOptions({ fetcher: brandFetcher });

  const loading = loadingCats;

  function addScope() {
    onChange([...scopes, { draftId: `scope-${Date.now()}`, scopeType: "category" }]);
  }

  function removeScope(draftId: string) {
    onChange(scopes.filter((s) => s.draftId !== draftId));
  }

  function updateScope(draftId: string, patch: Partial<ScopeDraft>) {
    onChange(
      scopes.map((s) => {
        if (s.draftId !== draftId) return s;
        const updated = { ...s, ...patch };
        if (patch.scopeType && patch.scopeType !== s.scopeType) {
          updated.scopeRefId = undefined;
          updated.scopeRefLabel = undefined;
        }
        return updated;
      })
    );
  }

  const hasGlobal = scopes.some((s) => s.scopeType === "global");

  return (
    <div className="space-y-3">
      {scopes.length === 0 && (
        <p className="text-sm text-secondary-400 italic">
          Chưa có phạm vi — khuyến mãi không khớp bất kỳ sản phẩm nào.
        </p>
      )}

      {scopes.map((scope) => (
        <div key={scope.draftId} className="flex items-center gap-3 rounded-xl border border-secondary-200 bg-secondary-50 p-3">
          {/* Type selector */}
          <div className="w-52 flex-shrink-0">
            <Select
              options={SCOPE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              value={scope.scopeType}
              onChange={(v) => updateScope(scope.draftId, { scopeType: v as ScopeType })}
              disabled={hasGlobal && scope.scopeType !== "global"}
            />
          </div>

          {/* Category → CategoryTreeSelect */}
          {scope.scopeType === "category" && (
            <div className="flex-1">
              <CategoryTreeSelect
                categories={categoryTree}
                value={scope.scopeRefId}
                onChange={(id, node) =>
                  updateScope(scope.draftId, {
                    scopeRefId: id || undefined,
                    scopeRefLabel: id ? node.label : undefined,
                  })
                }
                placeholder={loading ? "Đang tải danh mục…" : "Chọn danh mục…"}
                disabled={loading}
              />
            </div>
          )}

          {/* Product → Select (async search via getProducts) */}
          {scope.scopeType === "product" && (
            <div className="flex-1">
              <Select
                options={productOpts}
                value={scope.scopeRefId ?? ""}
                onChange={(v) => {
                  const id = v as string;
                  const product = seenProductsRef.current.get(id);
                  updateScope(scope.draftId, {
                    scopeRefId: id || undefined,
                    scopeRefLabel: product?.name || undefined,
                  });
                }}
                searchable
                asyncSearch
                onSearch={onProductSearch}
                loading={productLoading}
                totalCount={productTotal}
                selectedOption={
                  scope.scopeRefId
                    ? (() => {
                        const p = seenProductsRef.current.get(scope.scopeRefId);
                        return p
                          ? { value: p.id, label: p.name }
                          : scope.scopeRefLabel
                          ? { value: scope.scopeRefId, label: scope.scopeRefLabel }
                          : undefined;
                      })()
                    : undefined
                }
                clearable
                boldLabel
                placeholder="Tìm sản phẩm…"
              />
            </div>
          )}

          {/* Variant → Select (async search via getProductVariantsFlat) */}
          {scope.scopeType === "variant" && (
            <div className="flex-1">
              <Select
                options={variantOpts}
                value={scope.scopeRefId ?? ""}
                onChange={(v) => {
                  const id = v as string;
                  const vdata = seenVariantsRef.current.get(id);
                  updateScope(scope.draftId, {
                    scopeRefId: id || undefined,
                    scopeRefLabel: vdata
                      ? `${vdata.productName} — ${vdata.variantName}`
                      : id || undefined,
                  });
                }}
                searchable
                asyncSearch
                onSearch={onVariantSearch}
                loading={variantLoading}
                totalCount={variantTotal}
                selectedOption={
                  scope.scopeRefId
                    ? (() => {
                        const vd = seenVariantsRef.current.get(scope.scopeRefId);
                        return vd
                          ? variantToOption(vd)
                          : scope.scopeRefLabel
                          ? { value: scope.scopeRefId, label: scope.scopeRefLabel }
                          : undefined;
                      })()
                    : undefined
                }
                clearable
                boldLabel
                placeholder="Tìm phiên bản / SKU…"
              />
            </div>
          )}

          {/* Brand → Select (async search via getBrands) */}
          {scope.scopeType === "brand" && (
            <div className="flex-1">
              <Select
                options={brandOpts}
                value={scope.scopeRefId ?? ""}
                onChange={(v) => {
                  const id = v as string;
                  const brand = seenBrandsRef.current.get(id);
                  updateScope(scope.draftId, {
                    scopeRefId: id || undefined,
                    scopeRefLabel: brand?.name || undefined,
                  });
                }}
                searchable
                asyncSearch
                onSearch={onBrandSearch}
                loading={brandLoading}
                totalCount={brandTotal}
                selectedOption={
                  scope.scopeRefId
                    ? (() => {
                        const b = seenBrandsRef.current.get(scope.scopeRefId);
                        return b
                          ? { value: b.id, label: b.name }
                          : scope.scopeRefLabel
                          ? { value: scope.scopeRefId, label: scope.scopeRefLabel }
                          : undefined;
                      })()
                    : undefined
                }
                clearable
                boldLabel
                placeholder="Tìm thương hiệu…"
              />
            </div>
          )}

          {/* Global */}
          {scope.scopeType === "global" && (
            <span className="flex-1 text-sm text-secondary-500">
              Áp dụng cho tất cả sản phẩm trong giỏ
            </span>
          )}

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeScope(scope.draftId)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-error-500 hover:bg-error-50 transition-colors flex-shrink-0"
            title="Xoá phạm vi"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ))}

      {!hasGlobal && (
        <button
          type="button"
          onClick={addScope}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Thêm phạm vi
        </button>
      )}

      {hasGlobal && (
        <p className="text-xs text-secondary-400">
          Phạm vi toàn bộ bao gồm tất cả sản phẩm. Xoá để thêm đối tượng cụ thể.
        </p>
      )}
    </div>
  );
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

export function scopeDraftToPayload(
  draft: ScopeDraft
): Omit<PromotionScope, "id" | "promotionId"> {
  return {
    scopeType: draft.scopeType,
    scopeRefId: draft.scopeRefId,
    scopeRefLabel: draft.scopeRefLabel,
  };
}

export function scopeToEditDraft(s: PromotionScope): ScopeDraft {
  return {
    draftId: s.id,
    scopeType: s.scopeType,
    scopeRefId: s.scopeRefId,
    scopeRefLabel: s.scopeRefLabel,
  };
}
