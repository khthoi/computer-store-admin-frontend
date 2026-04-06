"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Select } from "@/src/components/ui/Select";
import type { PromotionScope, ScopeType } from "@/src/types/promotion.types";

// ─── Mock reference data ───────────────────────────────────────────────────────
// In production, these would be fetched via async search APIs.

import type { SelectOptionBadge } from "@/src/components/ui/Select";

// ─── Stock badge helper ────────────────────────────────────────────────────────

function stockBadge(qty: number): SelectOptionBadge {
  if (qty === 0) return { text: "Out of stock", variant: "error" };
  if (qty <= 5)  return { text: `${qty} left`,      variant: "warning" };
  return { text: `${qty} in stock`, variant: "default" };
}

// ─── Mock reference data ───────────────────────────────────────────────────────

const MOCK_CATEGORIES = [
  { id: "cat-cpu",    label: "Processors (CPU)" },
  { id: "cat-mb",     label: "Motherboards" },
  { id: "cat-ram",    label: "RAM / Memory" },
  { id: "cat-gpu",    label: "Graphics Cards" },
  { id: "cat-ssd",    label: "SSDs / Storage" },
  { id: "cat-hdd",    label: "HDDs / Storage" },
  { id: "cat-psu",    label: "Power Supplies" },
  { id: "cat-case",   label: "PC Cases" },
  { id: "cat-fans",   label: "Case Fans / Cooling" },
  { id: "cat-cooler", label: "CPU Coolers" },
];

const MOCK_PRODUCTS = [
  { id: "PROD-001",         label: "Intel Core i9-13900K",         stock: 15  },
  { id: "PROD-002",         label: "AMD Ryzen 9 7950X",             stock: 8   },
  { id: "PROD-003",         label: "ASUS ROG Strix Z790-E",         stock: 3   },
  { id: "PROD-004",         label: "Corsair Vengeance DDR5 32GB",   stock: 42  },
  { id: "PROD-005",         label: "Samsung 990 Pro 2TB NVMe",      stock: 27  },
  { id: "PROD-006",         label: "NVIDIA RTX 4090 FE",            stock: 2   },
  { id: "PROD-THERMAL-001", label: "Arctic MX-4 Thermal Paste 4g", stock: 156 },
];

const MOCK_BRANDS = [
  { id: "brand-intel",   label: "Intel" },
  { id: "brand-amd",     label: "AMD" },
  { id: "brand-nvidia",  label: "NVIDIA" },
  { id: "brand-asus",    label: "ASUS" },
  { id: "brand-corsair", label: "Corsair" },
  { id: "brand-samsung", label: "Samsung" },
];

const MOCK_VARIANTS = [
  { id: "VAR-I9-13900K-BOX",  label: "Core i9-13900K — Box",          stock: 10 },
  { id: "VAR-I9-13900K-TRAY", label: "Core i9-13900K — Tray",         stock: 5  },
  { id: "VAR-R9-7950X-BOX",   label: "Ryzen 9 7950X — Box",           stock: 8  },
  { id: "VAR-DDR5-32-2X16",   label: "Vengeance DDR5 32GB (2×16GB)",  stock: 22 },
  { id: "VAR-DDR5-64-2X32",   label: "Vengeance DDR5 64GB (2×32GB)",  stock: 7  },
  { id: "VAR-990PRO-1TB",     label: "Samsung 990 Pro — 1TB",          stock: 18 },
  { id: "VAR-990PRO-2TB",     label: "Samsung 990 Pro — 2TB",          stock: 9  },
  { id: "VAR-RTX4090-FE",     label: "RTX 4090 Founders Edition",      stock: 2  },
  { id: "VAR-RTX4090-STRIX",  label: "RTX 4090 ASUS ROG Strix",        stock: 0  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getRefOptions(scopeType: ScopeType) {
  switch (scopeType) {
    case "category": return MOCK_CATEGORIES.map((o) => ({ value: o.id, label: o.label, description: o.id }));
    case "product":  return MOCK_PRODUCTS.map((o) => ({ value: o.id, label: o.label, description: `ID: ${o.id}`, badge: stockBadge(o.stock) }));
    case "brand":    return MOCK_BRANDS.map((o) => ({ value: o.id, label: o.label, description: o.id }));
    case "variant":  return MOCK_VARIANTS.map((o) => ({ value: o.id, label: o.label, description: `SKU: ${o.id}`, badge: stockBadge(o.stock) }));
    default:         return [];
  }
}

const REF_PLACEHOLDER: Record<ScopeType, string> = {
  global:   "",
  category: "Search category…",
  product:  "Search product…",
  brand:    "Search brand…",
  variant:  "Search variant / SKU…",
};

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
  { value: "global",   label: "Global (all products)" },
  { value: "category", label: "Category" },
  { value: "product",  label: "Product" },
  { value: "variant",  label: "Variant / SKU" },
  { value: "brand",    label: "Brand" },
];

export function ScopeSelector({ scopes, onChange }: ScopeSelectorProps) {
  function addScope() {
    onChange([
      ...scopes,
      { draftId: `scope-${Date.now()}`, scopeType: "category" },
    ]);
  }

  function removeScope(draftId: string) {
    onChange(scopes.filter((s) => s.draftId !== draftId));
  }

  function updateScope(draftId: string, patch: Partial<ScopeDraft>) {
    onChange(
      scopes.map((s) => {
        if (s.draftId !== draftId) return s;
        const updated = { ...s, ...patch };
        // Reset ref when type changes
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
          No scope set — promotion will not match any cart items.
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

          {/* Ref selector (hidden for global) */}
          {scope.scopeType !== "global" && (
            <div className="flex-1">
              <Select
                options={getRefOptions(scope.scopeType)}
                value={scope.scopeRefId ?? ""}
                onChange={(v) => {
                  const id = v as string;
                  const found = getRefOptions(scope.scopeType).find((o) => o.value === id);
                  updateScope(scope.draftId, {
                    scopeRefId: id || undefined,
                    scopeRefLabel: found?.label || undefined,
                  });
                }}
                searchable
                clearable
                boldLabel
                placeholder={REF_PLACEHOLDER[scope.scopeType]}
              />
            </div>
          )}

          {scope.scopeType === "global" && (
            <span className="flex-1 text-sm text-secondary-500">
              Applies to all products in the cart
            </span>
          )}

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeScope(scope.draftId)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-error-500 hover:bg-error-50 transition-colors flex-shrink-0"
            title="Remove scope"
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
          Add Scope Entry
        </button>
      )}

      {hasGlobal && (
        <p className="text-xs text-secondary-400">
          Global scope covers all products. Remove it to add specific targets.
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
