"use client";

import { useRef, useState, useEffect } from "react";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { PromotionScope, ScopeType } from "@/src/types/promotion.types";

// ─── Mock reference data ───────────────────────────────────────────────────────
// In production, these would be fetched via async search APIs.

const MOCK_CATEGORIES = [
  { id: "cat-cpu",   label: "Processors (CPU)" },
  { id: "cat-mb",    label: "Motherboards" },
  { id: "cat-ram",   label: "RAM / Memory" },
  { id: "cat-gpu",   label: "Graphics Cards" },
  { id: "cat-ssd",   label: "SSDs / Storage" },
  { id: "cat-hdd",   label: "HDDs / Storage" },
  { id: "cat-psu",   label: "Power Supplies" },
  { id: "cat-case",  label: "PC Cases" },
  { id: "cat-fans",  label: "Case Fans / Cooling" },
  { id: "cat-cooler", label: "CPU Coolers" },
];

const MOCK_PRODUCTS = [
  { id: "PROD-001", label: "Intel Core i9-13900K" },
  { id: "PROD-002", label: "AMD Ryzen 9 7950X" },
  { id: "PROD-003", label: "ASUS ROG Strix Z790-E" },
  { id: "PROD-004", label: "Corsair Vengeance DDR5 32GB" },
  { id: "PROD-005", label: "Samsung 990 Pro 2TB NVMe" },
  { id: "PROD-006", label: "NVIDIA RTX 4090 FE" },
  { id: "PROD-THERMAL-001", label: "Arctic MX-4 Thermal Paste 4g" },
];

const MOCK_BRANDS = [
  { id: "brand-intel",   label: "Intel" },
  { id: "brand-amd",     label: "AMD" },
  { id: "brand-nvidia",  label: "NVIDIA" },
  { id: "brand-asus",    label: "ASUS" },
  { id: "brand-corsair", label: "Corsair" },
  { id: "brand-samsung", label: "Samsung" },
];

// ─── Draft scope ───────────────────────────────────────────────────────────────

export interface ScopeDraft {
  draftId: string;
  scopeType: ScopeType;
  scopeRefId?: string;
  scopeRefLabel?: string;
}

// ─── Inline combobox for scope ref ───────────────────────────────────────────

function ScopeRefCombobox({
  scopeType,
  value,
  label,
  onSelect,
}: {
  scopeType: ScopeType;
  value?: string;
  label?: string;
  onSelect: (id: string, label: string) => void;
}) {
  const [search, setSearch] = useState(label ?? "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options =
    scopeType === "category" ? MOCK_CATEGORIES
    : scopeType === "product" ? MOCK_PRODUCTS
    : scopeType === "brand"   ? MOCK_BRANDS
    : [];

  const filtered = options.filter((o) =>
    !search.trim() || o.label.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    setSearch(label ?? "");
  }, [label]);

  if (scopeType === "global" || scopeType === "variant") {
    return (
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onSelect(e.target.value, e.target.value)}
        placeholder={scopeType === "variant" ? "Variant / SKU ID" : ""}
        className="flex-1 rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      />
    );
  }

  return (
    <div ref={ref} className="relative flex-1">
      <div className="flex items-center gap-1 rounded-lg border border-secondary-300 bg-white px-3 py-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
        {value && (
          <span className="flex items-center gap-1 rounded-md bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 whitespace-nowrap">
            {label ?? value}
            <button type="button" onClick={() => { onSelect("", ""); setSearch(""); }}>
              <XMarkIcon className="w-3 h-3" />
            </button>
          </span>
        )}
        <input
          type="text"
          value={value ? "" : search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={value ? "" : `Search ${scopeType}…`}
          className="flex-1 min-w-0 bg-transparent text-sm text-secondary-800 placeholder:text-secondary-400 focus:outline-none"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-secondary-200 bg-white shadow-lg">
          {filtered.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => { onSelect(opt.id, opt.label); setSearch(opt.label); setOpen(false); }}
                className="flex w-full flex-col px-3 py-2 text-left hover:bg-primary-50 transition-colors"
              >
                <span className="text-sm font-medium text-secondary-800">{opt.label}</span>
                <span className="text-xs text-secondary-400 font-mono">{opt.id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
        <div key={scope.draftId} className="flex items-start gap-3 rounded-xl border border-secondary-200 bg-secondary-50 p-3">
          {/* Type selector */}
          <select
            value={scope.scopeType}
            onChange={(e) => updateScope(scope.draftId, { scopeType: e.target.value as ScopeType })}
            disabled={hasGlobal && scope.scopeType !== "global"}
            className="rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
          >
            {SCOPE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Ref selector (hidden for global) */}
          {scope.scopeType !== "global" && (
            <ScopeRefCombobox
              scopeType={scope.scopeType}
              value={scope.scopeRefId}
              label={scope.scopeRefLabel}
              onSelect={(id, label) =>
                updateScope(scope.draftId, { scopeRefId: id || undefined, scopeRefLabel: label || undefined })
              }
            />
          )}

          {scope.scopeType === "global" && (
            <span className="flex-1 flex items-center text-sm text-secondary-500">
              Applies to all products in the cart
            </span>
          )}

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeScope(scope.draftId)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-error-500 hover:bg-error-50 transition-colors"
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
