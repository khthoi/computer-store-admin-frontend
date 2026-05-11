"use client";

import { useRef, type KeyboardEvent } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Toggle } from "@/src/components/ui/Toggle";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  attributeValues: Record<string, string>;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  active: boolean;
}

export interface VariantAttribute {
  name: string;
  values: string[];
}

export interface ProductVariantsFormProps {
  attributes: VariantAttribute[];
  variants: ProductVariant[];
  onAttributesChange: (attrs: VariantAttribute[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Cartesian product of arrays */
function cartesian<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, arr) => acc.flatMap((prev) => arr.map((val) => [...prev, val])),
    [[]]
  );
}

function buildComboLabel(attributeValues: Record<string, string>): string {
  return Object.values(attributeValues).join(" / ");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductVariantsForm({
  attributes,
  variants,
  onAttributesChange,
  onVariantsChange,
}: ProductVariantsFormProps) {
  const addValueInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // ── Attribute axis operations ──────────────────────────────────────────────

  function updateAttributeName(index: number, name: string) {
    const next = attributes.map((a, i) => (i === index ? { ...a, name } : a));
    onAttributesChange(next);
  }

  function addAttributeValue(attrIndex: number, inputVal: string) {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    const attr = attributes[attrIndex];
    if (attr.values.includes(trimmed)) return;
    const next = attributes.map((a, i) =>
      i === attrIndex ? { ...a, values: [...a.values, trimmed] } : a
    );
    onAttributesChange(next);
  }

  function removeAttributeValue(attrIndex: number, value: string) {
    const next = attributes.map((a, i) =>
      i === attrIndex
        ? { ...a, values: a.values.filter((v) => v !== value) }
        : a
    );
    onAttributesChange(next);
  }

  function addAttribute() {
    onAttributesChange([...attributes, { name: "", values: [] }]);
  }

  function removeAttribute(index: number) {
    onAttributesChange(attributes.filter((_, i) => i !== index));
  }

  // ── Variant generation ────────────────────────────────────────────────────

  function generateVariants() {
    const validAttrs = attributes.filter(
      (a) => a.name.trim() && a.values.length > 0
    );
    if (validAttrs.length === 0) return;

    const combos = cartesian(validAttrs.map((a) => a.values));

    const next: ProductVariant[] = combos.map((combo) => {
      const attributeValues: Record<string, string> = {};
      validAttrs.forEach((attr, i) => {
        attributeValues[attr.name] = combo[i];
      });

      // Merge with existing variant if the combo already exists
      const existing = variants.find((v) => {
        const keys = Object.keys(attributeValues);
        return keys.every((k) => v.attributeValues[k] === attributeValues[k]);
      });

      return (
        existing ?? {
          id: generateId(),
          attributeValues,
          sku: "",
          price: 0,
          compareAtPrice: undefined,
          stock: 0,
          active: true,
        }
      );
    });

    onVariantsChange(next);
  }

  // ── Variant row operations ─────────────────────────────────────────────────

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    onVariantsChange(
      variants.map((v) => (v.id === id ? { ...v, ...patch } : v))
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Attribute axes section ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-secondary-800">
            Thuộc tính biến thể
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<PlusIcon />}
            onClick={addAttribute}
          >
            Thêm thuộc tính
          </Button>
        </div>

        {attributes.length === 0 && (
          <p className="text-sm text-secondary-400">
            Chưa có thuộc tính nào. Nhấn "Thêm thuộc tính" để bắt đầu.
          </p>
        )}

        {attributes.map((attr, attrIndex) => (
          <div
            key={attrIndex}
            className="rounded-lg border border-secondary-200 p-4 space-y-3"
          >
            {/* Attribute name row */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Tên thuộc tính"
                  value={attr.name}
                  onChange={(e) =>
                    updateAttributeName(attrIndex, e.target.value)
                  }
                  placeholder="VD: Màu sắc, Dung lượng…"
                  size="sm"
                />
              </div>
              <button
                type="button"
                aria-label="Xóa thuộc tính"
                onClick={() => removeAttribute(attrIndex)}
                className="mb-0.5 p-1.5 rounded text-secondary-400 hover:text-error-600 hover:bg-error-50 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Value chips */}
            <div className="flex flex-wrap gap-1.5">
              {attr.values.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-100 text-secondary-700 text-xs font-medium"
                >
                  {val}
                  <button
                    type="button"
                    aria-label={`Xóa giá trị ${val}`}
                    onClick={() => removeAttributeValue(attrIndex, val)}
                    className="rounded-full hover:bg-secondary-200 p-0.5 transition-colors"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add value input */}
            <div className="flex gap-2">
              <input
                ref={(el) => {
                  addValueInputRefs.current[attrIndex] = el;
                }}
                type="text"
                placeholder="Thêm giá trị, nhấn Enter…"
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAttributeValue(
                      attrIndex,
                      (e.target as HTMLInputElement).value
                    );
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
                className="flex-1 h-8 px-3 text-sm rounded border border-secondary-300 bg-white text-secondary-700
                           placeholder:text-secondary-400 focus:outline-none focus:ring-2
                           focus:border-primary-500 focus:ring-primary-500/15"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const input = addValueInputRefs.current[attrIndex];
                  if (input) {
                    addAttributeValue(attrIndex, input.value);
                    input.value = "";
                  }
                }}
              >
                Thêm
              </Button>
            </div>
          </div>
        ))}

        {/* Generate button */}
        {attributes.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateVariants}
          >
            Tạo biến thể từ thuộc tính
          </Button>
        )}
      </div>

      {/* ── Generated variants table ────────────────────────────────────── */}
      {variants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-secondary-800">
            Biến thể ({variants.length})
          </h3>

          <div className="overflow-x-auto rounded-lg border border-secondary-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-200">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Combo
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    SKU
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Giá (₫)
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Tồn kho
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Kích hoạt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-secondary-50/50">
                    <td className="px-3 py-2.5 text-secondary-700 font-medium whitespace-nowrap">
                      {buildComboLabel(variant.attributeValues)}
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(variant.id, { sku: e.target.value })
                        }
                        className="w-32 h-8 px-2 text-sm font-mono rounded border border-secondary-200
                                   focus:outline-none focus:ring-1 focus:border-primary-400 focus:ring-primary-500/15"
                        placeholder="SKU…"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(variant.id, {
                            price: Number(e.target.value),
                          })
                        }
                        className="w-28 h-8 px-2 text-sm rounded border border-secondary-200
                                   focus:outline-none focus:ring-1 focus:border-primary-400 focus:ring-primary-500/15"
                        min={0}
                        step={1000}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(variant.id, {
                            stock: Number(e.target.value),
                          })
                        }
                        className="w-20 h-8 px-2 text-sm rounded border border-secondary-200
                                   focus:outline-none focus:ring-1 focus:border-primary-400 focus:ring-primary-500/15"
                        min={0}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Toggle
                        checked={variant.active}
                        onChange={(e) =>
                          updateVariant(variant.id, {
                            active: e.target.checked,
                          })
                        }
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {variants.length === 0 && attributes.length > 0 && (
        <p className="text-sm text-secondary-400">
          Nhấn "Tạo biến thể từ thuộc tính" để tạo bảng biến thể.
        </p>
      )}
    </div>
  );
}
