"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { BundleComponent } from "@/src/types/promotion.types";

// ─── Mock reference data ──────────────────────────────────────────────────────

const MOCK_REFS = {
  category: [
    { id: "cat-cpu",   label: "Processors (CPU)" },
    { id: "cat-mb",    label: "Motherboards" },
    { id: "cat-ram",   label: "RAM / Memory" },
    { id: "cat-gpu",   label: "Graphics Cards" },
    { id: "cat-ssd",   label: "SSDs / Storage" },
    { id: "cat-psu",   label: "Power Supplies" },
    { id: "cat-case",  label: "PC Cases" },
    { id: "cat-fans",  label: "Case Fans / Cooling" },
    { id: "cat-cooler", label: "CPU Coolers" },
  ],
  product: [
    { id: "PROD-001", label: "Intel Core i9-13900K" },
    { id: "PROD-002", label: "AMD Ryzen 9 7950X" },
    { id: "PROD-003", label: "ASUS ROG Strix Z790-E" },
    { id: "PROD-004", label: "Corsair Vengeance DDR5 32GB" },
    { id: "PROD-005", label: "Samsung 990 Pro 2TB NVMe" },
    { id: "PROD-006", label: "NVIDIA RTX 4090 FE" },
  ],
  variant: [] as { id: string; label: string }[],
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface BundleActionFormProps {
  components: BundleComponent[];
  onChange: (components: BundleComponent[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BundleActionForm({ components, onChange }: BundleActionFormProps) {
  function addComponent() {
    onChange([
      ...components,
      {
        id: `bc-${Date.now()}`,
        scope: "category",
        refId: "",
        minQuantity: 1,
      },
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
        Define the required products/categories. ALL must be present in the cart for the bundle discount to apply.
      </p>

      {components.length === 0 && (
        <p className="text-sm text-secondary-400 italic">No bundle components defined yet.</p>
      )}

      {components.map((comp, idx) => {
        const refs = MOCK_REFS[comp.scope] ?? [];
        return (
          <div key={comp.id} className="flex items-center gap-3 rounded-xl border border-secondary-200 bg-secondary-50 p-3">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-xs font-bold text-primary-700">
              {idx + 1}
            </span>

            {/* Scope type */}
            <select
              value={comp.scope}
              onChange={(e) =>
                updateComponent(comp.id, { scope: e.target.value as BundleComponent["scope"] })
              }
              className="rounded-lg border border-secondary-300 bg-white px-2 py-1.5 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none"
            >
              <option value="category">Category</option>
              <option value="product">Product</option>
              <option value="variant">Variant</option>
            </select>

            {/* Ref selector */}
            {refs.length > 0 ? (
              <select
                value={comp.refId}
                onChange={(e) => {
                  const found = refs.find((r) => r.id === e.target.value);
                  updateComponent(comp.id, { refId: e.target.value, refLabel: found?.label });
                }}
                className="flex-1 rounded-lg border border-secondary-300 bg-white px-2 py-1.5 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none"
              >
                <option value="">— Select {comp.scope} —</option>
                {refs.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={comp.refId}
                placeholder={`${comp.scope} ID`}
                onChange={(e) => updateComponent(comp.id, { refId: e.target.value })}
                className="flex-1 rounded-lg border border-secondary-300 bg-white px-2 py-1.5 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none"
              />
            )}

            {/* Min qty */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-secondary-500 whitespace-nowrap">Min qty:</span>
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

            {/* Remove */}
            <button
              type="button"
              onClick={() => removeComponent(comp.id)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-error-500 hover:bg-error-50 transition-colors"
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
        Add Bundle Component
      </button>

      {components.length > 0 && (
        <p className="text-xs text-secondary-400 bg-info-50 border border-info-200 rounded-lg px-3 py-2">
          Bundle requires: {components.map((c) => (c.refLabel ?? c.refId) || `${c.scope}?`).join(" + ")}
        </p>
      )}
    </div>
  );
}
