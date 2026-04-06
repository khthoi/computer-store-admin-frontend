"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Select, type SelectOptionBadge } from "@/src/components/ui/Select";
import type { BundleComponent } from "@/src/types/promotion.types";

// ─── Stock badge helper ────────────────────────────────────────────────────────

function stockBadge(qty: number): SelectOptionBadge {
  if (qty === 0) return { text: "Out of stock", variant: "error" };
  if (qty <= 5)  return { text: `${qty} left`,      variant: "warning" };
  return { text: `${qty} in stock`, variant: "default" };
}

// ─── Mock reference data ──────────────────────────────────────────────────────

const MOCK_REFS = {
  category: [
    { id: "cat-cpu",    label: "Processors (CPU)",     description: "cat-cpu" },
    { id: "cat-mb",     label: "Motherboards",          description: "cat-mb" },
    { id: "cat-ram",    label: "RAM / Memory",          description: "cat-ram" },
    { id: "cat-gpu",    label: "Graphics Cards",        description: "cat-gpu" },
    { id: "cat-ssd",    label: "SSDs / Storage",        description: "cat-ssd" },
    { id: "cat-psu",    label: "Power Supplies",        description: "cat-psu" },
    { id: "cat-case",   label: "PC Cases",              description: "cat-case" },
    { id: "cat-fans",   label: "Case Fans / Cooling",   description: "cat-fans" },
    { id: "cat-cooler", label: "CPU Coolers",           description: "cat-cooler" },
  ],
  product: [
    { id: "PROD-001", label: "Intel Core i9-13900K",       description: "ID: PROD-001", badge: stockBadge(15) },
    { id: "PROD-002", label: "AMD Ryzen 9 7950X",           description: "ID: PROD-002", badge: stockBadge(8)  },
    { id: "PROD-003", label: "ASUS ROG Strix Z790-E",       description: "ID: PROD-003", badge: stockBadge(3)  },
    { id: "PROD-004", label: "Corsair Vengeance DDR5 32GB", description: "ID: PROD-004", badge: stockBadge(42) },
    { id: "PROD-005", label: "Samsung 990 Pro 2TB NVMe",    description: "ID: PROD-005", badge: stockBadge(27) },
    { id: "PROD-006", label: "NVIDIA RTX 4090 FE",          description: "ID: PROD-006", badge: stockBadge(2)  },
  ],
  variant: [
    { id: "VAR-I9-13900K-BOX",  label: "Core i9-13900K — Box",          description: "SKU: VAR-I9-13900K-BOX",  badge: stockBadge(10) },
    { id: "VAR-I9-13900K-TRAY", label: "Core i9-13900K — Tray",         description: "SKU: VAR-I9-13900K-TRAY", badge: stockBadge(5)  },
    { id: "VAR-R9-7950X-BOX",   label: "Ryzen 9 7950X — Box",           description: "SKU: VAR-R9-7950X-BOX",   badge: stockBadge(8)  },
    { id: "VAR-DDR5-32-2X16",   label: "Vengeance DDR5 32GB (2×16GB)",  description: "SKU: VAR-DDR5-32-2X16",   badge: stockBadge(22) },
    { id: "VAR-DDR5-64-2X32",   label: "Vengeance DDR5 64GB (2×32GB)",  description: "SKU: VAR-DDR5-64-2X32",   badge: stockBadge(7)  },
    { id: "VAR-990PRO-1TB",     label: "Samsung 990 Pro — 1TB",          description: "SKU: VAR-990PRO-1TB",     badge: stockBadge(18) },
    { id: "VAR-990PRO-2TB",     label: "Samsung 990 Pro — 2TB",          description: "SKU: VAR-990PRO-2TB",     badge: stockBadge(9)  },
    { id: "VAR-RTX4090-FE",     label: "RTX 4090 Founders Edition",      description: "SKU: VAR-RTX4090-FE",     badge: stockBadge(2)  },
  ],
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
            <div className="w-36 flex-shrink-0">
              <Select
                options={[
                  { value: "category", label: "Category" },
                  { value: "product",  label: "Product" },
                  { value: "variant",  label: "Variant" },
                ]}
                value={comp.scope}
                onChange={(v) =>
                  updateComponent(comp.id, { scope: v as BundleComponent["scope"] })
                }
                size="sm"
              />
            </div>

            {/* Ref selector */}
            <div className="flex-1">
              <Select
                options={refs.map((r) => ({ value: r.id, label: r.label, description: r.description, badge: "badge" in r ? (r.badge as SelectOptionBadge) : undefined }))}
                value={comp.refId}
                onChange={(v) => {
                  const id = v as string;
                  const found = refs.find((r) => r.id === id);
                  updateComponent(comp.id, { refId: id, refLabel: found?.label });
                }}
                searchable
                clearable
                boldLabel={comp.scope === "product" || comp.scope === "variant"}
                placeholder={`— Select ${comp.scope} —`}
                size="sm"
              />
            </div>

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
