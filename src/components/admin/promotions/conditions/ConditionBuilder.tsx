"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Select, type SelectOption, type SelectOptionBadge } from "@/src/components/ui/Select";
import type { PromotionCondition, ConditionType, ConditionOperator } from "@/src/types/promotion.types";
import { getProductVariantsFlat, type ProductVariantFlat } from "@/src/services/product.service";
import { getCategoryNodeTree } from "@/src/services/category.service";
import { useAsyncSelectOptions } from "@/src/hooks/useAsyncSelectOptions";
import { CategoryTreeSelect, buildNodeMap } from "@/src/components/admin/CategoryTreeSelect";
import type { CategoryNode } from "@/src/components/admin/CategoryTreeSelect";

function variantToOption(v: ProductVariantFlat): SelectOption {
  return {
    value: v.variantId,
    label: v.productName,
    subLabel: v.variantName,
    description: v.sku,
    badge: stockBadge(v.stock),
    disabled: v.status === "inactive",
  };
}

// ─── Stock badge helper ────────────────────────────────────────────────────────

function stockBadge(qty: number): SelectOptionBadge {
  if (qty === 0) return { text: "Hết hàng", variant: "error" };
  if (qty <= 5)  return { text: `${qty} còn lại`, variant: "warning" };
  return { text: `${qty} trong kho`, variant: "default" };
}

// ─── Static option sets ───────────────────────────────────────────────────────

const CUSTOMER_GROUP_OPTS = [
  { value: "registered", label: "Khách đã đăng ký" },
  { value: "vip",        label: "VIP" },
];

const PAYMENT_METHOD_OPTS = [
  { value: "momo",          label: "MoMo" },
  { value: "vnpay",         label: "VNPay" },
  { value: "zalopay",       label: "ZaloPay" },
  { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
  { value: "cod",           label: "Thanh toán khi nhận hàng (COD)" },
];


// ─── Category chip multi-select ───────────────────────────────────────────────

function CategoryMultiSelect({
  value,
  onChange,
  categories,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  categories: CategoryNode[];
  loading: boolean;
}) {
  const [pickerKey, setPickerKey] = useState(0);

  const selected: string[] = useMemo(() => {
    try { const p = JSON.parse(value); return Array.isArray(p) ? p : []; }
    catch { return []; }
  }, [value]);

  const nodeMap = useMemo(() => buildNodeMap(categories), [categories]);

  function add(id: string) {
    if (!id || selected.includes(id)) return;
    onChange(JSON.stringify([...selected, id]));
    setPickerKey((k) => k + 1); // reset CategoryTreeSelect
  }

  function remove(id: string) {
    onChange(JSON.stringify(selected.filter((s) => s !== id)));
  }

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((id) => {
            const node = nodeMap.get(id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-primary-100 border border-primary-200 px-2.5 py-0.5 text-xs font-medium text-primary-700"
              >
                {node?.label ?? id}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-primary-200 transition-colors"
                >
                  <XMarkIcon className="size-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <CategoryTreeSelect
        key={pickerKey}
        categories={categories}
        value=""
        onChange={(id) => add(id)}
        placeholder={loading ? "Đang tải danh mục…" : "Thêm danh mục…"}
        disabled={loading}
      />
    </div>
  );
}

// ─── Config type ──────────────────────────────────────────────────────────────

type InputType = "number" | "text" | "multiselect" | "category_multi" | "variant_multi";

type ConditionConfig = {
  type: ConditionType;
  label: string;
  operator: ConditionOperator;
  operatorLabel: string;
  inputType: InputType;
  placeholder: string;
  hint: string;
  selectOptions?: { value: string; label: string; subLabel?: string; description?: string; badge?: SelectOptionBadge }[];
  searchable?: boolean;
  boldLabel?: boolean;
};

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
  onVariantsLoaded?: (variants: ProductVariantFlat[]) => void;
  onCategoriesLoaded?: (cats: CategoryNode[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConditionBuilder({ conditions, onChange, onVariantsLoaded, onCategoriesLoaded }: ConditionBuilderProps) {
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    getCategoryNodeTree()
      .catch(() => [] as CategoryNode[])
      .then((cats) => {
        setCategoryTree(cats);
        setLoadingCats(false);
        onCategoriesLoaded?.(cats);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Async variant search ─────────────────────────────────────────────────
  // Variants flow in incrementally as the user searches. We accumulate
  // everything we have seen into a map so the parent's review screen can
  // still resolve labels for previously-selected ids that have rotated out
  // of the current page.
  const seenVariantsRef = useRef<Map<string, ProductVariantFlat>>(new Map());
  const [seenVersion, setSeenVersion] = useState(0);

  const variantFetcher = useCallback(async (q: string) => {
    const res = await getProductVariantsFlat(25, q || undefined);
    let changed = false;
    for (const v of res.variants) {
      if (!seenVariantsRef.current.has(v.variantId)) {
        seenVariantsRef.current.set(v.variantId, v);
        changed = true;
      }
    }
    if (changed) {
      setSeenVersion((n) => n + 1);
      onVariantsLoaded?.(Array.from(seenVariantsRef.current.values()));
    }
    return {
      options: res.variants.map(variantToOption),
      totalCount: res.totalProducts,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    options: variantOpts,
    totalCount: variantTotal,
    loading: variantLoading,
    onSearch: onVariantSearch,
  } = useAsyncSelectOptions({ fetcher: variantFetcher });

  // Selected snapshot options derived from seenVariants — keeps trigger labels
  // even after the search rotates the visible options.
  const selectedVariantSnapshots = useMemo(() => {
    const ids = new Set<string>();
    for (const c of conditions) {
      if (c.type !== "required_products") continue;
      try {
        const arr = JSON.parse(c.value);
        if (Array.isArray(arr)) for (const v of arr) ids.add(String(v));
      } catch { /* ignore */ }
    }
    const out: SelectOption[] = [];
    for (const id of ids) {
      const v = seenVariantsRef.current.get(id);
      // Fallback to a bare value-only option so chips still render for saved
      // ids that have not been searched yet (e.g. edit-mode initial load).
      out.push(v ? variantToOption(v) : { value: id, label: id });
    }
    return out;
  // re-derive when conditions change or new variants are observed
  }, [conditions, seenVersion]);

  const loading = loadingCats;

  const conditionConfigs: ConditionConfig[] = useMemo(
    () => [
      {
        type: "min_order_value",
        label: "Giá trị đơn hàng tối thiểu (₫)",
        operator: "gte",
        operatorLabel: "tối thiểu",
        inputType: "number",
        placeholder: "VD: 1000000",
        hint: "Tổng phụ giỏ hàng phải ≥ số tiền này",
      },
      {
        type: "min_item_quantity",
        label: "Số lượng sản phẩm tối thiểu",
        operator: "gte",
        operatorLabel: "tối thiểu",
        inputType: "number",
        placeholder: "VD: 3",
        hint: "Tổng số lượng sản phẩm trong giỏ hàng phải ≥ số này",
      },
      {
        type: "customer_group",
        label: "Nhóm khách hàng",
        operator: "in",
        operatorLabel: "là một trong",
        inputType: "multiselect",
        placeholder: "Chọn nhóm…",
        hint: "Khuyến mãi chỉ áp dụng cho nhóm khách hàng đã chọn",
        selectOptions: CUSTOMER_GROUP_OPTS,
        searchable: false,
      },
      {
        type: "required_products",
        label: "Phiên bản sản phẩm bắt buộc có trong giỏ",
        operator: "all_in_cart",
        operatorLabel: "tất cả có trong giỏ",
        inputType: "variant_multi",
        placeholder: "Chọn phiên bản…",
        hint: "Tất cả phiên bản đã chọn phải có trong giỏ hàng",
        selectOptions: variantOpts,
        searchable: true,
        boldLabel: true,
      },
      {
        type: "required_categories",
        label: "Danh mục bắt buộc có trong giỏ",
        operator: "any_in_cart",
        operatorLabel: "ít nhất một có trong giỏ",
        inputType: "category_multi",
        placeholder: "Chọn danh mục…",
        hint: "Ít nhất một sản phẩm từ các danh mục này phải có trong giỏ",
      },
      {
        type: "payment_method",
        label: "Phương thức thanh toán",
        operator: "in",
        operatorLabel: "là một trong",
        inputType: "multiselect",
        placeholder: "Chọn phương thức…",
        hint: "Khuyến mãi chỉ áp dụng khi khách thanh toán bằng một trong các phương thức này",
        selectOptions: PAYMENT_METHOD_OPTS,
        searchable: true,
      },
    ],
    [variantOpts]
  );

  function addCondition() {
    onChange([
      ...conditions,
      { draftId: `cond-${Date.now()}`, type: "min_order_value", operator: "gte", value: "" },
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
        if (patch.type && patch.type !== c.type) {
          const config = conditionConfigs.find((cfg) => cfg.type === patch.type);
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
          Không có điều kiện — khuyến mãi áp dụng cho tất cả giỏ hàng đủ điều kiện.
        </p>
      )}

      {conditions.map((cond, idx) => {
        const config = conditionConfigs.find((c) => c.type === cond.type) ?? conditionConfigs[0];

        let selectedValues: string[] = [];
        if (config.inputType === "multiselect" || config.inputType === "variant_multi") {
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
                <span className="text-xs font-bold uppercase tracking-widest text-secondary-400">VÀ</span>
                <div className="h-px flex-1 bg-secondary-200" />
              </div>
            )}
            <div className="flex items-start gap-3 rounded-xl border border-secondary-200 bg-secondary-50 p-3">
              {/* Condition type */}
              <div className="w-56 flex-shrink-0">
                <Select
                  options={conditionConfigs.map((cfg) => ({ value: cfg.type, label: cfg.label }))}
                  value={cond.type}
                  onChange={(v) => updateCondition(cond.draftId, { type: v as ConditionType })}
                />
              </div>

              {/* Operator label */}
              <div className="flex-shrink-0 flex items-center h-10">
                <span className="text-xs font-medium text-secondary-500 whitespace-nowrap px-2">
                  {config.operatorLabel}
                </span>
              </div>

              {/* Value input */}
              <div className="flex-1 min-w-0">
                {/* Variant multi-select (required_products) */}
                {config.inputType === "variant_multi" && (
                  <Select
                    multiple
                    searchable
                    asyncSearch
                    onSearch={onVariantSearch}
                    loading={variantLoading}
                    totalCount={variantTotal}
                    selectedOptions={selectedVariantSnapshots}
                    clearable
                    boldLabel
                    options={variantOpts}
                    value={selectedValues}
                    onChange={(v) =>
                      updateCondition(cond.draftId, { value: JSON.stringify(v as string[]) })
                    }
                    placeholder={config.placeholder}
                  />
                )}

                {/* Category chip multi-select (required_categories) */}
                {config.inputType === "category_multi" && (
                  <CategoryMultiSelect
                    value={cond.value}
                    onChange={(v) => updateCondition(cond.draftId, { value: v })}
                    categories={categoryTree}
                    loading={loading}
                  />
                )}

                {/* Regular multi-select */}
                {config.inputType === "multiselect" && config.selectOptions && (
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
                )}

                {/* Number / text input */}
                {(config.inputType === "number" || config.inputType === "text") && (
                  <input
                    type={config.inputType === "number" ? "number" : "text"}
                    value={cond.value}
                    min={config.inputType === "number" ? 0 : undefined}
                    placeholder={config.placeholder}
                    onChange={(e) => updateCondition(cond.draftId, { value: e.target.value })}
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
                title="Xoá điều kiện"
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
        Thêm điều kiện
      </button>
    </div>
  );
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

const OPERATOR_MAP: Partial<Record<ConditionType, ConditionOperator>> = {
  min_order_value:    "gte",
  min_item_quantity:  "gte",
  customer_group:     "in",
  required_products:  "all_in_cart",
  required_categories:"any_in_cart",
  payment_method:     "in",
};

export function conditionDraftToPayload(
  draft: ConditionDraft
): Omit<PromotionCondition, "id" | "promotionId"> {
  return {
    type: draft.type,
    operator: OPERATOR_MAP[draft.type] ?? draft.operator,
    value: draft.value,
  };
}

export function conditionToEditDraft(c: PromotionCondition): ConditionDraft {
  return {
    draftId: c.id,
    type: c.type,
    operator: c.operator,
    value: c.value,
  };
}
