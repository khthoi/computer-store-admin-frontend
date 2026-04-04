"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { PromotionCondition, ConditionType, ConditionOperator } from "@/src/types/promotion.types";

// ─── Config ───────────────────────────────────────────────────────────────────

const CONDITION_CONFIGS: {
  type: ConditionType;
  label: string;
  operator: ConditionOperator;
  operatorLabel: string;
  inputType: "number" | "text" | "multitext";
  placeholder: string;
  hint: string;
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
    inputType: "multitext",
    placeholder: "guest, registered, vip",
    hint: "Comma-separated groups: guest, registered, vip",
  },
  {
    type: "required_products",
    label: "Required Products in Cart",
    operator: "all_in_cart",
    operatorLabel: "all present in cart",
    inputType: "multitext",
    placeholder: "PROD-001, PROD-002",
    hint: "All listed product IDs must be in the cart",
  },
  {
    type: "required_categories",
    label: "Required Category in Cart",
    operator: "any_in_cart",
    operatorLabel: "any present in cart",
    inputType: "multitext",
    placeholder: "cat-gpu, cat-cpu",
    hint: "At least one product from these categories must be in cart",
  },
  {
    type: "payment_method",
    label: "Payment Method",
    operator: "in",
    operatorLabel: "is one of",
    inputType: "multitext",
    placeholder: "momo, vnpay, cod",
    hint: "Comma-separated payment method codes",
  },
  {
    type: "platform",
    label: "Platform",
    operator: "in",
    operatorLabel: "is one of",
    inputType: "multitext",
    placeholder: "web, mobile_app",
    hint: "Comma-separated platform codes",
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

  function parseValue(raw: string, inputType: string): string {
    if (inputType === "multitext") {
      const arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
      return JSON.stringify(arr);
    }
    return raw;
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

        // For multitext, display decoded value
        let displayValue = cond.value;
        if (config.inputType === "multitext") {
          try {
            const arr = JSON.parse(cond.value);
            if (Array.isArray(arr)) displayValue = arr.join(", ");
          } catch { /* keep raw */ }
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
              <div className="flex-1 min-w-0">
                <select
                  value={cond.type}
                  onChange={(e) => updateCondition(cond.draftId, { type: e.target.value as ConditionType })}
                  className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {CONDITION_CONFIGS.map((cfg) => (
                    <option key={cfg.type} value={cfg.type}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              {/* Operator (read-only display) */}
              <div className="flex-shrink-0 flex items-center h-[38px]">
                <span className="text-xs font-medium text-secondary-500 whitespace-nowrap px-2">
                  {config.operatorLabel}
                </span>
              </div>

              {/* Value */}
              <div className="flex-1 min-w-0">
                <input
                  type={config.inputType === "number" ? "number" : "text"}
                  value={displayValue}
                  min={config.inputType === "number" ? 0 : undefined}
                  placeholder={config.placeholder}
                  onChange={(e) => {
                    const raw = parseValue(e.target.value, config.inputType);
                    updateCondition(cond.draftId, { value: raw });
                  }}
                  className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                {config.hint && (
                  <p className="mt-1 text-[11px] text-secondary-400">{config.hint}</p>
                )}
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeCondition(cond.draftId)}
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-error-500 hover:bg-error-50 transition-colors"
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
