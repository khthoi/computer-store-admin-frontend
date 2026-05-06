"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusIcon, TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Select, type SelectOptionBadge } from "@/src/components/ui/Select";
import { CategoryTreeSelect } from "@/src/components/admin/CategoryTreeSelect";
import type { CategoryNode } from "@/src/components/admin/CategoryTreeSelect";
import { getCategoryNodeTree } from "@/src/services/category.service";
import { getProductVariantsFlat, type ProductVariantFlat } from "@/src/services/product.service";
import type { BundleComponent } from "@/src/types/promotion.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stockBadge(qty: number): SelectOptionBadge {
  if (qty === 0) return { text: "Hết hàng", variant: "error" };
  if (qty <= 5)  return { text: `${qty} còn lại`, variant: "warning" };
  return { text: `${qty} trong kho`, variant: "default" };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BundleActionFormProps {
  components: BundleComponent[];
  onChange: (components: BundleComponent[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BundleActionForm({ components, onChange }: BundleActionFormProps) {
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [variantFlats, setVariantFlats] = useState<ProductVariantFlat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCategoryNodeTree().catch(() => [] as CategoryNode[]),
      getProductVariantsFlat(60).catch(() => [] as ProductVariantFlat[]),
    ]).then(([cats, variants]) => {
      setCategoryTree(cats);
      setVariantFlats(variants);
      setLoading(false);
    });
  }, []);

  // Deduplicate to get unique products
  const productOpts = useMemo(() => {
    const seen = new Set<string>();
    return variantFlats
      .filter((v) => { if (seen.has(v.productId)) return false; seen.add(v.productId); return true; })
      .map((v) => ({ value: v.productId, label: v.productName }));
  }, [variantFlats]);

  // Detect duplicate refId across components (same product/category/variant selected twice)
  const duplicateRefIds = useMemo(() => {
    const counts = new Map<string, number>();
    components.forEach((c) => {
      if (c.refId) counts.set(c.refId, (counts.get(c.refId) ?? 0) + 1);
    });
    const dups = new Set<string>();
    counts.forEach((n, id) => { if (n > 1) dups.add(id); });
    return dups;
  }, [components]);

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

  function addComponent() {
    onChange([
      ...components,
      { id: `bc-${Date.now()}`, scope: "category", refId: "", minQuantity: 1 },
    ]);
  }

  function removeComponent(id: string) {
    onChange(components.filter((c) => c.id !== id));
  }

  function updateComponent(id: string, patch: Partial<BundleComponent>) {
    onChange(
      components.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...patch };
        if (patch.scope && patch.scope !== c.scope) {
          updated.refId = "";
          updated.refLabel = undefined;
        }
        return updated;
      })
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-secondary-500">
        Xác định các sản phẩm/danh mục cần thiết. TẤT CẢ phải có trong giỏ hàng để áp dụng giảm giá combo.
      </p>

      {components.length === 0 && (
        <p className="text-sm text-secondary-400 italic">Chưa có thành phần combo nào.</p>
      )}

      {components.map((comp, idx) => {
        const isDuplicate = !!comp.refId && duplicateRefIds.has(comp.refId);
        return (
        <div
          key={comp.id}
          className={[
            "flex items-center gap-3 rounded-xl border p-3",
            isDuplicate
              ? "border-warning-300 bg-warning-50"
              : "border-secondary-200 bg-secondary-50",
          ].join(" ")}
        >
          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-xs font-bold text-primary-700">
            {idx + 1}
          </span>

          {/* Scope type */}
          <div className="w-36 flex-shrink-0">
            <Select
              options={[
                { value: "category", label: "Danh mục" },
                { value: "product",  label: "Sản phẩm" },
                { value: "variant",  label: "Phiên bản" },
              ]}
              value={comp.scope}
              onChange={(v) => updateComponent(comp.id, { scope: v as BundleComponent["scope"] })}
            />
          </div>

          {/* Category → CategoryTreeSelect */}
          {comp.scope === "category" && (
            <div className="flex-1">
              <CategoryTreeSelect
                categories={categoryTree}
                value={comp.refId || undefined}
                onChange={(id, node) =>
                  updateComponent(comp.id, {
                    refId: id,
                    refLabel: node.label,
                  })
                }
                placeholder={loading ? "Đang tải danh mục…" : "— Chọn danh mục —"}
                disabled={loading}
              />
            </div>
          )}

          {/* Product → Select (deduplicated from variant flat list) */}
          {comp.scope === "product" && (
            <div className="flex-1">
              <Select
                options={productOpts}
                value={comp.refId}
                onChange={(v) => {
                  const id = v as string;
                  const found = productOpts.find((o) => o.value === id);
                  updateComponent(comp.id, { refId: id, refLabel: found?.label });
                }}
                searchable
                clearable
                boldLabel
                placeholder={loading ? "Đang tải sản phẩm…" : "— Chọn sản phẩm —"}
                disabled={loading}
              />
            </div>
          )}

          {/* Variant → Select (same pattern as ConditionBuilder required_products) */}
          {comp.scope === "variant" && (
            <div className="flex-1">
              <Select
                options={variantOpts}
                value={comp.refId}
                onChange={(v) => {
                  const id = v as string;
                  const vdata = variantFlats.find((vf) => vf.variantId === id);
                  updateComponent(comp.id, {
                    refId: id,
                    refLabel: vdata ? `${vdata.productName} — ${vdata.variantName}` : id || undefined,
                  });
                }}
                searchable
                clearable
                boldLabel
                placeholder={loading ? "Đang tải phiên bản…" : "— Chọn phiên bản —"}
                disabled={loading}
              />
            </div>
          )}

          {/* Min qty */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-secondary-500 whitespace-nowrap">SL tối thiểu:</span>
            <input
              type="number"
              min={1}
              step={1}
              value={comp.minQuantity}
              onChange={(e) =>
                updateComponent(comp.id, { minQuantity: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className="w-16 rounded-lg border border-secondary-300 bg-white px-2 py-1.5 text-center text-sm text-secondary-800 focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Duplicate warning */}
          {isDuplicate && (
            <ExclamationTriangleIcon
              className="w-4 h-4 shrink-0 text-warning-600"
              title="Sản phẩm/danh mục này đã được chọn ở thành phần khác"
            />
          )}

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeComponent(comp.id)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-error-500 hover:bg-error-50 transition-colors flex-shrink-0"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
        );
      })}

      <button
        type="button"
        onClick={addComponent}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Thêm thành phần combo
      </button>

      {duplicateRefIds.size > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-warning-50 border border-warning-200 px-3 py-2 text-xs text-warning-700">
          <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Một số sản phẩm/danh mục được chọn nhiều hơn một lần — mỗi thành phần combo phải là sản phẩm khác nhau.
        </div>
      )}

      {components.length > 0 && (
        <p className="text-xs text-secondary-400 bg-info-50 border border-info-200 rounded-lg px-3 py-2">
          Combo yêu cầu: {components.map((c) => (c.refLabel ?? c.refId) || `${c.scope}?`).join(" + ")}
        </p>
      )}
    </div>
  );
}
