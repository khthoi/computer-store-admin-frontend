"use client";

import { useId } from "react";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConditionType = "min_cart_value" | "specific_product" | "specific_category" | "user_group";
type DiscountType  = "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
type LogicOperator = "AND" | "OR";

export interface DiscountCondition {
  id: string;
  type: ConditionType;
  operator: string;
  value: string;
}

export interface DiscountRule {
  conditions: DiscountCondition[];
  logic: LogicOperator;
  discountType: DiscountType;
  discountValue: string;
  buyQuantity?: number;
  getQuantity?: number;
}

export interface DiscountRuleBuilderProps {
  value: DiscountRule;
  onChange: (v: DiscountRule) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONDITION_TYPE_OPTIONS = [
  { value: "min_cart_value",    label: "Giá trị đơn tối thiểu" },
  { value: "specific_product",  label: "Sản phẩm cụ thể" },
  { value: "specific_category", label: "Danh mục cụ thể" },
  { value: "user_group",        label: "Nhóm người dùng" },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: "percentage",    label: "% giảm giá" },
  { value: "fixed",         label: "Giảm cố định (₫)" },
  { value: "free_shipping", label: "Miễn phí vận chuyển" },
  { value: "buy_x_get_y",   label: "Mua X tặng Y" },
];

function operatorForType(type: ConditionType): string {
  return type === "min_cart_value" ? "≥" : "=";
}

function operatorLabel(type: ConditionType): string {
  return type === "min_cart_value" ? "≥" : "=";
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── LogicToggle ──────────────────────────────────────────────────────────────

interface LogicToggleProps {
  logic: LogicOperator;
  onToggle: () => void;
}

function LogicToggle({ logic, onToggle }: LogicToggleProps) {
  return (
    <div className="flex items-center gap-2 my-1 px-1">
      <div className="flex-1 h-px bg-secondary-200" />
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1 rounded-full border border-secondary-300 bg-white px-3 py-0.5 text-xs font-semibold text-secondary-600 hover:bg-secondary-50 hover:border-primary-300 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {logic}
      </button>
      <div className="flex-1 h-px bg-secondary-200" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * DiscountRuleBuilder — composable UI for building discount conditions and
 * discount type / value configuration.
 *
 * Conditions section:
 * - Each row has a type Select, an auto-derived operator label, and a value input.
 * - Between rows (when > 1 condition) a togglable AND/OR divider is shown.
 * - "Thêm điều kiện" appends a new blank condition.
 *
 * Discount section:
 * - Select for discount type.
 * - For percentage/fixed: single number input.
 * - For free_shipping: no value input.
 * - For buy_x_get_y: dual quantity inputs.
 */
export function DiscountRuleBuilder({ value, onChange }: DiscountRuleBuilderProps) {
  const baseId = useId();

  // ── Helpers ────────────────────────────────────────────────────────────────

  function updateCondition(id: string, patch: Partial<DiscountCondition>) {
    onChange({
      ...value,
      conditions: value.conditions.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    });
  }

  function removeCondition(id: string) {
    onChange({
      ...value,
      conditions: value.conditions.filter((c) => c.id !== id),
    });
  }

  function addCondition() {
    const newCond: DiscountCondition = {
      id:       generateId(),
      type:     "min_cart_value",
      operator: operatorForType("min_cart_value"),
      value:    "",
    };
    onChange({ ...value, conditions: [...value.conditions, newCond] });
  }

  function toggleLogic() {
    onChange({ ...value, logic: value.logic === "AND" ? "OR" : "AND" });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* ── Conditions section ─────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-semibold text-secondary-800 mb-3">
          Điều kiện áp dụng
        </p>

        {value.conditions.length === 0 && (
          <p className="text-sm text-secondary-400 mb-3">
            Chưa có điều kiện nào. Nhấn "Thêm điều kiện" để bắt đầu.
          </p>
        )}

        <div className="flex flex-col">
          {value.conditions.map((cond, idx) => (
            <div key={cond.id}>
              {/* Condition row */}
              <div className="flex items-start gap-2 rounded-xl border border-secondary-100 bg-secondary-50 px-3 py-3">
                {/* Type select */}
                <div className="flex-1 min-w-0">
                  <Select
                    options={CONDITION_TYPE_OPTIONS}
                    value={cond.type}
                    onChange={(v) => {
                      const newType = v as ConditionType;
                      updateCondition(cond.id, {
                        type:     newType,
                        operator: operatorForType(newType),
                        value:    "",
                      });
                    }}
                    size="sm"
                    placeholder="Loại điều kiện…"
                  />
                </div>

                {/* Operator badge */}
                <span className="mt-2 shrink-0 inline-flex h-6 w-8 items-center justify-center rounded border border-secondary-200 bg-white text-xs font-semibold text-secondary-600">
                  {operatorLabel(cond.type)}
                </span>

                {/* Value input */}
                <div className="flex-1 min-w-0">
                  <input
                    id={`${baseId}-cond-${cond.id}`}
                    type={cond.type === "min_cart_value" ? "number" : "text"}
                    value={cond.value}
                    min={cond.type === "min_cart_value" ? 0 : undefined}
                    onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
                    placeholder={
                      cond.type === "min_cart_value"
                        ? "VD: 500000"
                        : cond.type === "specific_product"
                        ? "ID hoặc tên sản phẩm"
                        : cond.type === "specific_category"
                        ? "ID hoặc tên danh mục"
                        : "Tên nhóm người dùng"
                    }
                    className="w-full h-8 rounded border border-secondary-300 bg-white px-3 text-sm text-secondary-700 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
                  />
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  aria-label="Xóa điều kiện"
                  onClick={() => removeCondition(cond.id)}
                  className="mt-1 shrink-0 flex items-center justify-center h-6 w-6 rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
                >
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Logic toggle between conditions */}
              {idx < value.conditions.length - 1 && (
                <LogicToggle logic={value.logic} onToggle={toggleLogic} />
              )}
            </div>
          ))}
        </div>

        {/* Add condition */}
        <div className="mt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<PlusIcon />}
            onClick={addCondition}
          >
            Thêm điều kiện
          </Button>
        </div>
      </div>

      {/* ── Discount section ───────────────────────────────────────────────── */}
      <div className="border-t border-secondary-100 pt-5">
        <p className="text-sm font-semibold text-secondary-800 mb-3">
          Loại và mức giảm giá
        </p>

        <div className="flex flex-col gap-4">
          {/* Discount type */}
          <Select
            label="Loại giảm giá"
            options={DISCOUNT_TYPE_OPTIONS}
            value={value.discountType}
            onChange={(v) =>
              onChange({
                ...value,
                discountType:  v as DiscountType,
                discountValue: "",
                buyQuantity:   undefined,
                getQuantity:   undefined,
              })
            }
          />

          {/* Discount value — conditional rendering by type */}
          {value.discountType === "percentage" && (
            <Input
              label="Mức giảm (%)"
              type="number"
              min={0}
              max={100}
              value={value.discountValue}
              onChange={(e) => onChange({ ...value, discountValue: e.target.value })}
              placeholder="VD: 20"
              helperText="Nhập từ 0 đến 100"
            />
          )}

          {value.discountType === "fixed" && (
            <Input
              label="Số tiền giảm (₫)"
              type="number"
              min={0}
              value={value.discountValue}
              onChange={(e) => onChange({ ...value, discountValue: e.target.value })}
              placeholder="VD: 50000"
            />
          )}

          {value.discountType === "free_shipping" && (
            <p className="text-sm text-secondary-500 rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
              Khuyến mãi này miễn phí vận chuyển — không cần nhập thêm giá trị.
            </p>
          )}

          {value.discountType === "buy_x_get_y" && (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label="Mua (Buy X)"
                  type="number"
                  min={1}
                  value={value.buyQuantity !== undefined ? String(value.buyQuantity) : ""}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      buyQuantity: parseInt(e.target.value, 10) || undefined,
                    })
                  }
                  placeholder="VD: 2"
                />
              </div>
              <span className="mb-2 text-secondary-400 text-sm font-medium shrink-0">
                tặng
              </span>
              <div className="flex-1">
                <Input
                  label="Tặng (Get Y)"
                  type="number"
                  min={1}
                  value={value.getQuantity !== undefined ? String(value.getQuantity) : ""}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      getQuantity: parseInt(e.target.value, 10) || undefined,
                    })
                  }
                  placeholder="VD: 1"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
