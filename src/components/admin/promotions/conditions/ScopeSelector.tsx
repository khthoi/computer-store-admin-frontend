"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Select, type SelectOptionBadge } from "@/src/components/ui/Select";
import { CategoryTreeSelect } from "@/src/components/admin/CategoryTreeSelect";
import type { CategoryNode } from "@/src/components/admin/CategoryTreeSelect";
import { getCategoryNodeTree } from "@/src/services/category.service";
import { getProductVariantsFlat, type ProductVariantFlat } from "@/src/services/product.service";
import { getBrands } from "@/src/services/brand.service";
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

export function ScopeSelector({ scopes, onChange }: ScopeSelectorProps) {
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [variantFlats, setVariantFlats] = useState<ProductVariantFlat[]>([]);
  const [brandOpts, setBrandOpts] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCategoryNodeTree().catch(() => [] as CategoryNode[]),
      getProductVariantsFlat(60).catch(() => [] as ProductVariantFlat[]),
      getBrands().catch(() => ({ data: [] as { id: string; name: string }[] })),
    ]).then(([cats, variants, brands]) => {
      setCategoryTree(cats);
      setVariantFlats(variants);
      setBrandOpts(brands.data.map((b) => ({ value: b.id, label: b.name })));
      setLoading(false);
    });
  }, []);

  // Deduplicate to get unique products from variant flat list
  const productOpts = useMemo(() => {
    const seen = new Set<string>();
    return variantFlats
      .filter((v) => { if (seen.has(v.productId)) return false; seen.add(v.productId); return true; })
      .map((v) => ({ value: v.productId, label: v.productName }));
  }, [variantFlats]);

  const variantOpts = useMemo(
    () =>
      variantFlats.map((v) => ({
        value: v.variantId,
        label: v.productName,
        subLabel: v.variantName,
        description: v.sku,
        badge: stockBadge(v.stock),
        disabled: v.status === "inactive",
      })),
    [variantFlats]
  );

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

          {/* Product → Select (deduplicated from variant flat list) */}
          {scope.scopeType === "product" && (
            <div className="flex-1">
              <Select
                options={productOpts}
                value={scope.scopeRefId ?? ""}
                onChange={(v) => {
                  const id = v as string;
                  const found = productOpts.find((o) => o.value === id);
                  updateScope(scope.draftId, {
                    scopeRefId: id || undefined,
                    scopeRefLabel: found?.label || undefined,
                  });
                }}
                searchable
                clearable
                boldLabel
                placeholder={loading ? "Đang tải sản phẩm…" : "Tìm sản phẩm…"}
                disabled={loading}
              />
            </div>
          )}

          {/* Variant → Select (same pattern as ConditionBuilder required_products) */}
          {scope.scopeType === "variant" && (
            <div className="flex-1">
              <Select
                options={variantOpts}
                value={scope.scopeRefId ?? ""}
                onChange={(v) => {
                  const id = v as string;
                  const vdata = variantFlats.find((vf) => vf.variantId === id);
                  updateScope(scope.draftId, {
                    scopeRefId: id || undefined,
                    scopeRefLabel: vdata
                      ? `${vdata.productName} — ${vdata.variantName}`
                      : id || undefined,
                  });
                }}
                searchable
                clearable
                boldLabel
                placeholder={loading ? "Đang tải phiên bản…" : "Tìm phiên bản / SKU…"}
                disabled={loading}
              />
            </div>
          )}

          {/* Brand → Select (name only, no ID shown) */}
          {scope.scopeType === "brand" && (
            <div className="flex-1">
              <Select
                options={brandOpts}
                value={scope.scopeRefId ?? ""}
                onChange={(v) => {
                  const id = v as string;
                  const found = brandOpts.find((o) => o.value === id);
                  updateScope(scope.draftId, {
                    scopeRefId: id || undefined,
                    scopeRefLabel: found?.label || undefined,
                  });
                }}
                searchable
                clearable
                boldLabel
                placeholder={loading ? "Đang tải thương hiệu…" : "Tìm thương hiệu…"}
                disabled={loading}
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
