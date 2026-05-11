"use client";

import { useId } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Select } from "@/src/components/ui/Select";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicabilityScope = "all" | "products" | "categories" | "user_groups";

export interface Applicability {
  scope: ApplicabilityScope;
  selectedIds: string[];
}

export interface PromotionApplicabilityPickerProps {
  value: Applicability;
  onChange: (v: Applicability) => void;
  productOptions?:   { value: string; label: string }[];
  categoryOptions?:  { value: string; label: string }[];
  userGroupOptions?: { value: string; label: string }[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SCOPE_OPTIONS: { value: ApplicabilityScope; label: string }[] = [
  { value: "all",         label: "Tất cả sản phẩm" },
  { value: "products",    label: "Sản phẩm cụ thể" },
  { value: "categories",  label: "Danh mục cụ thể" },
  { value: "user_groups", label: "Nhóm người dùng" },
];

function entityLabel(scope: ApplicabilityScope): string {
  if (scope === "products")    return "sản phẩm";
  if (scope === "categories")  return "danh mục";
  if (scope === "user_groups") return "nhóm người dùng";
  return "đối tượng";
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PromotionApplicabilityPicker — radio group + multi-select for defining
 * which products, categories, or user groups a promotion applies to.
 *
 * When scope === "all" no additional selection is shown.
 * Otherwise a searchable multi-select appears, and chosen items are also
 * rendered as removable chips below the select.
 */
export function PromotionApplicabilityPicker({
  value,
  onChange,
  productOptions   = [],
  categoryOptions  = [],
  userGroupOptions = [],
}: PromotionApplicabilityPickerProps) {
  const radioGroupId = useId();

  // ── Helpers ────────────────────────────────────────────────────────────────

  function handleScopeChange(scope: ApplicabilityScope) {
    onChange({ scope, selectedIds: [] });
  }

  function handleSelectionChange(selected: string | string[]) {
    onChange({ ...value, selectedIds: Array.isArray(selected) ? selected : [selected] });
  }

  function removeId(id: string) {
    onChange({
      ...value,
      selectedIds: value.selectedIds.filter((s) => s !== id),
    });
  }

  // ── Determine option list for current scope ───────────────────────────────

  let options: { value: string; label: string }[] = [];
  if (value.scope === "products")    options = productOptions;
  if (value.scope === "categories")  options = categoryOptions;
  if (value.scope === "user_groups") options = userGroupOptions;

  // Labels for chips
  const labelMap = new Map(options.map((o) => [o.value, o.label]));

  // ── Summary text ──────────────────────────────────────────────────────────

  let summaryText = "Áp dụng cho tất cả sản phẩm";
  if (value.scope !== "all") {
    const count  = value.selectedIds.length;
    const entity = entityLabel(value.scope);
    summaryText  = count > 0
      ? `Áp dụng cho ${count} ${entity}`
      : `Chưa chọn ${entity} nào`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Scope radio group */}
      <div>
        <p className="text-sm font-medium text-secondary-700 mb-2">
          Phạm vi áp dụng
        </p>
        <div className="flex flex-col gap-2">
          {SCOPE_OPTIONS.map((opt) => {
            const inputId = `${radioGroupId}-${opt.value}`;
            const isActive = value.scope === opt.value;
            return (
              <label
                key={opt.value}
                htmlFor={inputId}
                className={[
                  "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                  isActive
                    ? "border-primary-400 bg-primary-50"
                    : "border-secondary-200 bg-white hover:bg-secondary-50",
                ].join(" ")}
              >
                <input
                  type="radio"
                  id={inputId}
                  name={radioGroupId}
                  value={opt.value}
                  checked={isActive}
                  onChange={() => handleScopeChange(opt.value)}
                  className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span
                  className={[
                    "text-sm font-medium",
                    isActive ? "text-primary-700" : "text-secondary-700",
                  ].join(" ")}
                >
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Multi-select (only when scope !== "all") */}
      {value.scope !== "all" && (
        <div>
          <Select
            label={`Chọn ${entityLabel(value.scope)}`}
            options={options}
            value={value.selectedIds}
            onChange={handleSelectionChange}
            multiple
            searchable
            clearable
            placeholder={`Tìm và chọn ${entityLabel(value.scope)}…`}
          />

          {/* Chip list for selected items */}
          {value.selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {value.selectedIds.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                >
                  {labelMap.get(id) ?? id}
                  <button
                    type="button"
                    aria-label={`Bỏ chọn ${labelMap.get(id) ?? id}`}
                    onClick={() => removeId(id)}
                    className="rounded-full hover:text-primary-900 focus:outline-none"
                  >
                    <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <p className="text-sm text-secondary-600">
        {summaryText}
      </p>
    </div>
  );
}
