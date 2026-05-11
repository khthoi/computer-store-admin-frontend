"use client";

import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import type { SelectOption } from "@/src/components/ui/select/types";
import { getCategories } from "@/src/services/category.service";
import { getBrands } from "@/src/services/brand.service";
import { getAllVariants } from "@/src/services/variant.service";
import type { DanhMuc } from "@/src/types/category.types";
import type { ThuongHieu } from "@/src/types/brand.types";
import type { PhienBanSanPham } from "@/src/types/variant.types";

// ─── ScopeEntry (exported so EarnRuleFormClient can import) ───────────────────

export interface ScopeEntry {
  scopeType: "category" | "brand" | "product";
  scopeRefId: string;
  scopeRefLabel: string;
  multiplier: string;
}

export function newScopeEntry(): ScopeEntry {
  return { scopeType: "category", scopeRefId: "", scopeRefLabel: "", multiplier: "2" };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  scopes: ScopeEntry[];
  onChange: (scopes: ScopeEntry[]) => void;
  errors: Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SCOPE_TYPE_OPTIONS: SelectOption[] = [
  { value: "category", label: "Category" },
  { value: "brand",    label: "Brand" },
  { value: "product",  label: "Product Variant" },
];

function stockBadge(stock: number): SelectOption["badge"] {
  if (stock === 0) return { text: "Hết hàng", variant: "error" };
  if (stock <= 5)  return { text: `Còn ${stock}`, variant: "warning" };
  return { text: `${stock} trong kho`, variant: "success" };
}

function buildCategoryOptions(categories: DanhMuc[]): SelectOption[] {
  return categories.map((c) => ({
    value: c.id,
    label: c.name,
    description: c.slug,
    badge: c.active
      ? { text: `${c.productCount} sản phẩm`, variant: "default" as const }
      : { text: "Inactive", variant: "error" as const },
    disabled: !c.active,
  }));
}

function buildBrandOptions(brands: ThuongHieu[]): SelectOption[] {
  return brands.map((b) => ({
    value: b.id,
    label: b.name,
    description: b.slug,
    badge: b.active
      ? { text: `${b.productCount} sản phẩm`, variant: "default" as const }
      : { text: "Inactive", variant: "error" as const },
    disabled: !b.active,
  }));
}

function buildVariantOptions(variants: PhienBanSanPham[]): SelectOption[] {
  return variants.map((v) => ({
    value: v.id,
    label: `${v.productName} - ${v.name}`,
    description: `SKU: ${v.sku}`,
    badge: stockBadge(v.stock),
    disabled: v.status !== "active",
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScopeMultipliersSection({ scopes, onChange, errors }: Props) {
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  const [brands, setBrands] = useState<ThuongHieu[]>([]);
  const [variants, setVariants] = useState<PhienBanSanPham[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
    getBrands().then((res) => setBrands(res.data));
    getAllVariants().then(setVariants);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const categoryOptions = buildCategoryOptions(categories);
  const brandOptions    = buildBrandOptions(brands);
  const variantOptions  = buildVariantOptions(variants);

  function updateScope(index: number, patch: Partial<ScopeEntry>) {
    const next = [...scopes];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function removeScope(index: number) {
    onChange(scopes.filter((_, i) => i !== index));
  }

  function resolveLabel(scopeType: ScopeEntry["scopeType"], refId: string): string {
    if (scopeType === "category") {
      return categories.find((c) => c.id === refId)?.name ?? refId;
    }
    if (scopeType === "brand") {
      return brands.find((b) => b.id === refId)?.name ?? refId;
    }
    const v = variants.find((vt) => vt.id === refId);
    return v ? `${v.productName} - ${v.name}` : refId;
  }

  return (
    <div className="space-y-4">
      {scopes.length > 0 && (
        <div className="space-y-3">
          {scopes.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-secondary-200 bg-secondary-50 p-4 space-y-3"
            >
              {/* Scope header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                  Scope #{i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeScope(i)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>

              {/* Scope type */}
              <Select
                label="Type"
                options={SCOPE_TYPE_OPTIONS}
                value={s.scopeType}
                onChange={(v) => {
                  updateScope(i, {
                    scopeType: v as ScopeEntry["scopeType"],
                    scopeRefId: "",
                    scopeRefLabel: "",
                  });
                }}
              />

              {/* Target selector */}
              <Select
                label={
                  s.scopeType === "category" ? "Category" :
                  s.scopeType === "brand"    ? "Brand" :
                  "Product Variant"
                }
                options={
                  s.scopeType === "category" ? categoryOptions :
                  s.scopeType === "brand"    ? brandOptions :
                  variantOptions
                }
                value={s.scopeRefId}
                onChange={(v) => {
                  const refId = v as string;
                  const label = resolveLabel(s.scopeType, refId);
                  updateScope(i, { scopeRefId: refId, scopeRefLabel: label });
                }}
                searchable
                clearable
                boldLabel
                placeholder={
                  s.scopeType === "category" ? "Choose category…" :
                  s.scopeType === "brand"    ? "Choose brand…" :
                  "Choose product variant…"
                }
                errorMessage={errors[`scope_ref_${i}`]}
              />

              {/* Multiplier */}
              <Input
                label="Multiplier"
                type="number"
                min={0.1}
                step={0.1}
                placeholder="e.g. 2"
                helperText="e.g. 2 = double points for purchases in this scope."
                value={s.multiplier}
                onChange={(e) => updateScope(i, { multiplier: e.target.value })}
                errorMessage={errors[`scope_multiplier_${i}`]}
                fullWidth
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange([...scopes, newScopeEntry()])}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-secondary-300 bg-secondary-50 px-4 py-2.5 text-sm font-medium text-secondary-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Add Scope Multiplier
      </button>
    </div>
  );
}
