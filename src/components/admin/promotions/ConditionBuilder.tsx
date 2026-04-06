"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Select, type SelectOptionBadge } from "@/src/components/ui/Select";
import type { PromotionCondition, ConditionType, ConditionOperator } from "@/src/types/promotion.types";

// ─── Stock badge helper ────────────────────────────────────────────────────────

function stockBadge(qty: number): SelectOptionBadge {
  if (qty === 0) return { text: "Out of stock", variant: "error" };
  if (qty <= 5)  return { text: `${qty} left`,      variant: "warning" };
  return { text: `${qty} in stock`, variant: "default" };
}

// ─── Mock reference data ──────────────────────────────────────────────────────

const MOCK_PRODUCTS_OPTS = [
  { value: "PROD-001",         label: "Intel Core i9-13900K",         description: "ID: PROD-001",         badge: stockBadge(15)  },
  { value: "PROD-002",         label: "AMD Ryzen 9 7950X",             description: "ID: PROD-002",         badge: stockBadge(8)   },
  { value: "PROD-003",         label: "ASUS ROG Strix Z790-E",         description: "ID: PROD-003",         badge: stockBadge(3)   },
  { value: "PROD-004",         label: "Corsair Vengeance DDR5 32GB",   description: "ID: PROD-004",         badge: stockBadge(42)  },
  { value: "PROD-005",         label: "Samsung 990 Pro 2TB NVMe",      description: "ID: PROD-005",         badge: stockBadge(27)  },
  { value: "PROD-006",         label: "NVIDIA RTX 4090 FE",            description: "ID: PROD-006",         badge: stockBadge(2)   },
  { value: "PROD-THERMAL-001", label: "Arctic MX-4 Thermal Paste 4g", description: "ID: PROD-THERMAL-001", badge: stockBadge(156) },
];

const MOCK_CATEGORIES_OPTS = [
  { value: "cat-cpu",    label: "Processors (CPU)",   description: "cat-cpu"    },
  { value: "cat-mb",     label: "Motherboards",        description: "cat-mb"     },
  { value: "cat-ram",    label: "RAM / Memory",        description: "cat-ram"    },
  { value: "cat-gpu",    label: "Graphics Cards",      description: "cat-gpu"    },
  { value: "cat-ssd",    label: "SSDs / Storage",      description: "cat-ssd"    },
  { value: "cat-hdd",    label: "HDDs / Storage",      description: "cat-hdd"    },
  { value: "cat-psu",    label: "Power Supplies",      description: "cat-psu"    },
  { value: "cat-case",   label: "PC Cases",            description: "cat-case"   },
  { value: "cat-fans",   label: "Case Fans / Cooling", description: "cat-fans"   },
  { value: "cat-cooler", label: "CPU Coolers",         description: "cat-cooler" },
];

const CUSTOMER_GROUP_OPTS = [
  { value: "guest",      label: "Guest" },
  { value: "registered", label: "Registered" },
  { value: "vip",        label: "VIP" },
];

const PAYMENT_METHOD_OPTS = [
  { value: "momo",          label: "MoMo" },
  { value: "vnpay",         label: "VNPay" },
  { value: "zalopay",       label: "ZaloPay" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cod",           label: "Cash on Delivery (COD)" },
];

const PLATFORM_OPTS = [
  { value: "web",        label: "Web" },
  { value: "mobile_app", label: "Mobile App" },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const CONDITION_CONFIGS: {
  type: ConditionType;
  label: string;
  operator: ConditionOperator;
  operatorLabel: string;
  inputType: "number" | "text" | "multiselect";
  placeholder: string;
  hint: string;
  selectOptions?: { value: string; label: string; description?: string; badge?: SelectOptionBadge }[];
  searchable?: boolean;
  boldLabel?: boolean;
}[] = [
  {
    type: "min_order_value",
    label: "Min. Order Value (₫)",
    operator: "gte",
    operatorLabel: "is at least",
    inputType: "number",
    placeholder: "e.g. 1000000",
    hint: "Cart subtotal must be ≥ this amount",
  },
  {
    type: "min_item_quantity",
    label: "Min. Item Quantity",
    operator: "gte",
    operatorLabel: "is at least",
    inputType: "number",
    placeholder: "e.g. 3",
    hint: "Total eligible items in cart ≥ this number",
  },
  {
    type: "customer_group",
    label: "Customer Group",
    operator: "in",
    operatorLabel: "is one of",
    inputType: "multiselect",
    placeholder: "Select groups…",
    hint: "Promotion applies only to selected customer groups",
    selectOptions: CUSTOMER_GROUP_OPTS,
    searchable: false,
  },
  {
    type: "required_products",
    label: "Required Products in Cart",
    operator: "all_in_cart",
    operatorLabel: "all present in cart",
    inputType: "multiselect",
    placeholder: "Select products…",
    hint: "All selected products must be in the cart",
    selectOptions: MOCK_PRODUCTS_OPTS,
    searchable: true,
    boldLabel: true,
  },
  {
    type: "required_categories",
    label: "Required Category in Cart",
    operator: "any_in_cart",
    operatorLabel: "any present in cart",
    inputType: "multiselect",
    placeholder: "Select categories…",
    hint: "At least one product from these categories must be in the cart",
    selectOptions: MOCK_CATEGORIES_OPTS,
    searchable: true,
    boldLabel: false,
  },
  {
    type: "payment_method",
    label: "Payment Method",
    operator: "in",
    operatorLabel: "is one of",
    inputType: "multiselect",
    placeholder: "Select payment methods…",
    hint: "Promotion applies only when customer pays with one of these methods",
    selectOptions: PAYMENT_METHOD_OPTS,
    searchable: true,
  },
  {
    type: "platform",
    label: "Platform",
    operator: "in",
    operatorLabel: "is one of",
    inputType: "multiselect",
    placeholder: "Select platforms…",
    hint: "Promotion applies only on selected platforms",
    selectOptions: PLATFORM_OPTS,
    searchable: false,
  },
];

// ─── Draft condition ───────────────────────────────────────────────────────────

export interface ConditionDraft {
  draftId: string;
  type: ConditionType;
  operator: ConditionOperator;
  value: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConditionBuilderProps {
  conditions: ConditionDraft[];
  onChange: (conditions: ConditionDraft[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConditionBuilder({ conditions, onChange }: ConditionBuilderProps) {
  function addCondition() {
    onChange([
      ...conditions,
      {
        draftId: `cond-${Date.now()}`,
        type: "min_order_value",
        operator: "gte",
        value: "",
      },
    ]);
  }

  function removeCondition(draftId: string) {
    onChange(conditions.filter((c) => c.draftId !== draftId));
  }

  function updateCondition(draftId: string, patch: Partial<ConditionDraft>) {
    onChange(
      conditions.map((c) => {
        if (c.draftId !== draftId) return c;
        const updated = { ...c, ...patch };
        // Reset value when type changes
        if (patch.type && patch.type !== c.type) {
          const config = CONDITION_CONFIGS.find((cfg) => cfg.type === patch.type);
          updated.operator = config?.operator ?? "gte";
          updated.value = "";
        }
        return updated;
      })
    );
  }

  return (
    <div className="space-y-3">
      {conditions.length === 0 && (
        <p className="text-sm text-secondary-400 italic">
          No conditions — promotion applies to all eligible carts.
        </p>
      )}

      {conditions.map((cond, idx) => {
        const config = CONDITION_CONFIGS.find((c) => c.type === cond.type) ?? CONDITION_CONFIGS[0];

        // Parse stored value for multi-select display
        let selectedValues: string[] = [];
        if (config.inputType === "multiselect") {
          try {
            const arr = JSON.parse(cond.value);
            if (Array.isArray(arr)) selectedValues = arr;
          } catch { /* keep empty */ }
        }

        return (
          <div key={cond.draftId}>
            {idx > 0 && (
              <div className="flex items-center gap-2 my-2">
                <div className="h-px flex-1 bg-secondary-200" />
                <span className="text-xs font-bold uppercase tracking-widest text-secondary-400">AND</span>
                <div className="h-px flex-1 bg-secondary-200" />
              </div>
            )}
            <div className="flex items-start gap-3 rounded-xl border border-secondary-200 bg-secondary-50 p-3">
              {/* Condition type */}
              <div className="w-56 flex-shrink-0">
                <Select
                  options={CONDITION_CONFIGS.map((cfg) => ({ value: cfg.type, label: cfg.label }))}
                  value={cond.type}
                  onChange={(v) => updateCondition(cond.draftId, { type: v as ConditionType })}
                />
              </div>

              {/* Operator (read-only display) */}
              <div className="flex-shrink-0 flex items-center h-10">
                <span className="text-xs font-medium text-secondary-500 whitespace-nowrap px-2">
                  {config.operatorLabel}
                </span>
              </div>

              {/* Value */}
              <div className="flex-1 min-w-0">
                {config.inputType === "multiselect" && config.selectOptions ? (
                  <Select
                    multiple
                    searchable={config.searchable}
                    clearable
                    boldLabel={config.boldLabel}
                    options={config.selectOptions}
                    value={selectedValues}
                    onChange={(v) =>
                      updateCondition(cond.draftId, { value: JSON.stringify(v as string[]) })
                    }
                    placeholder={config.placeholder}
                  />
                ) : (
                  <input
                    type={config.inputType === "number" ? "number" : "text"}
                    value={cond.value}
                    min={config.inputType === "number" ? 0 : undefined}
                    placeholder={config.placeholder}
                    onChange={(e) =>
                      updateCondition(cond.draftId, { value: e.target.value })
                    }
                    className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                )}
                {config.hint && (
                  <p className="mt-1 text-[11px] text-secondary-400">{config.hint}</p>
                )}
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeCondition(cond.draftId)}
                className="flex-shrink-0 flex my-auto items-center justify-center w-8 h-8 rounded-lg text-error-500 hover:bg-error-50 transition-colors"
                title="Remove condition"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addCondition}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Add Condition
      </button>
    </div>
  );
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

export function conditionDraftToPayload(
  draft: ConditionDraft
): Omit<PromotionCondition, "id" | "promotionId"> {
  const config = CONDITION_CONFIGS.find((c) => c.type === draft.type) ?? CONDITION_CONFIGS[0];
  return {
    type: draft.type,
    operator: config.operator,
    value: draft.value,
  };
}

export function conditionToEditDraft(
  c: PromotionCondition
): ConditionDraft {
  return {
    draftId: c.id,
    type: c.type,
    operator: c.operator,
    value: c.value,
  };
}
