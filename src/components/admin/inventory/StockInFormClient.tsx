"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select, type SelectOption } from "@/src/components/ui/Select";
import { Textarea } from "@/src/components/ui/Textarea";
import { DateInput } from "@/src/components/ui/DateInput";
import { useToast } from "@/src/components/ui/Toast";
import { createStockIn } from "@/src/services/inventory.service";
import { formatVND } from "@/src/lib/format";
import type { Supplier, Warehouse, InventoryItem } from "@/src/types/inventory.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItemDraft {
  draftId: string;
  inventoryItemId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantityOnHand: number;
  quantityOrdered: number;
  costPrice: number;
  note?: string;
}

interface StockInFormClientProps {
  suppliers: Supplier[];
  warehouses: Warehouse[];
  inventoryItems: InventoryItem[];
  receiptCode: string;
}

// ─── StockInFormClient ────────────────────────────────────────────────────────

export function StockInFormClient({
  suppliers,
  warehouses,
  inventoryItems,
  receiptCode,
}: StockInFormClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const defaultWarehouse = warehouses.find((w) => w.isDefault) ?? warehouses[0];

  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState(defaultWarehouse?.id ?? "");
  const [expectedDate, setExpectedDate] = useState("");
  const [note, setNote] = useState("");
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const supplierOptions = suppliers
    .filter((s) => s.status === "active")
    .map((s) => ({ value: s.id, label: s.name }));

  const warehouseOptions = warehouses.map((w) => ({
    value: w.id,
    label: w.name,
  }));

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);
  const selectedWarehouse = warehouses.find((w) => w.id === warehouseId);

  // IDs already added (for duplicate prevention)
  const addedInventoryIds = lineItems.map((l) => l.inventoryItemId).filter(Boolean);

  // Build Select options for a given line item — disables items already picked in other rows
  function buildProductOptions(currentSelectedId: string): SelectOption[] {
    const otherAddedIds = addedInventoryIds.filter((id) => id !== currentSelectedId);
    return inventoryItems.map((item) => ({
      value: item.id,
      label: `${item.productName} — ${item.variantName}`,
      description: item.sku,
      badge:
        item.quantityOnHand === 0
          ? { text: `Kho: ${item.quantityOnHand}`, variant: "error" as const }
          : item.quantityOnHand <= item.lowStockThreshold
          ? { text: `Kho: ${item.quantityOnHand}`, variant: "warning" as const }
          : { text: `Kho: ${item.quantityOnHand}`, variant: "success" as const },
      disabled: otherAddedIds.includes(item.id),
    }));
  }

  function addLine() {
    setLineItems((prev) => [
      ...prev,
      {
        draftId: `draft-${Date.now()}-${Math.random()}`,
        inventoryItemId: "",
        productId: "",
        variantId: "",
        productName: "",
        variantName: "",
        sku: "",
        quantityOnHand: 0,
        quantityOrdered: 1,
        costPrice: 0,
      },
    ]);
  }

  function removeLine(draftId: string) {
    setLineItems((prev) => prev.filter((l) => l.draftId !== draftId));
  }

  function selectProduct(draftId: string, item: InventoryItem) {
    setLineItems((prev) =>
      prev.map((l) =>
        l.draftId === draftId
          ? {
            ...l,
            inventoryItemId: item.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            quantityOnHand: item.quantityOnHand,
            costPrice: item.costPrice,
          }
          : l
      )
    );
  }

  function updateLine(draftId: string, field: "quantityOrdered" | "costPrice" | "note", value: number | string) {
    setLineItems((prev) =>
      prev.map((l) => (l.draftId === draftId ? { ...l, [field]: value } : l))
    );
  }

  const totalCost = lineItems.reduce((s, l) => s + l.costPrice * l.quantityOrdered, 0);

  const isValid =
    !!supplierId &&
    !!warehouseId &&
    !!expectedDate &&
    lineItems.length > 0 &&
    lineItems.every((l) => l.inventoryItemId && l.quantityOrdered >= 1);

  async function handleSubmit() {
    if (!isValid || !selectedSupplier || !selectedWarehouse) return;
    setIsSaving(true);
    try {
      const record = await createStockIn({
        receiptCode,
        supplierId,
        supplierName: selectedSupplier.name,
        warehouseId,
        warehouseName: selectedWarehouse.name,
        expectedDate,
        note: note.trim() || undefined,
        lineItems: lineItems.map((l, idx) => ({
          id: `${Date.now()}-${idx}`,
          productId: l.productId,
          variantId: l.variantId,
          productName: l.productName,
          variantName: l.variantName,
          sku: l.sku,
          quantityOrdered: l.quantityOrdered,
          quantityReceived: 0,
          costPrice: l.costPrice,
          note: l.note?.trim() || undefined,
        })),
      });
      showToast(`Stock-in ${record.id} created.`, "success");
      router.push(`/inventory/stock-in/${record.id}`);
    } catch {
      showToast("Failed to create stock-in.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header details ── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-semibold text-secondary-900">Chi tiết phiếu nhập</h2>

        {/* Row 1: Receipt code | Supplier | Warehouse */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Receipt Code — read-only */}
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700">
              Mã phiếu nhập
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-secondary-200 bg-secondary-50 px-3 py-2">
              <LockClosedIcon className="w-3.5 h-3.5 shrink-0 text-secondary-400" aria-hidden="true" />
              <span className="flex-1 font-mono text-sm text-secondary-600 select-all">
                {receiptCode}
              </span>
            </div>
            <p className="mt-1 text-xs text-secondary-400">Tự động tạo · read-only</p>
          </div>

          {/* Supplier */}
          <Select
            label="Nhà cung cấp"
            options={supplierOptions}
            value={supplierId}
            onChange={(v) => setSupplierId(v as string)}
            placeholder="Select supplier…"
          />

          {/* Warehouse */}
          <Select
            label="Kho hàng"
            options={warehouseOptions}
            value={warehouseId}
            onChange={(v) => setWarehouseId(v as string)}
          />
        </div>

        {/* Row 2: Expected Date */}
        <div className="grid gap-4 sm:grid-cols-3">
          <DateInput
            label="Ngày dự kiến"
            value={expectedDate}
            onChange={(val) => setExpectedDate(val)}
            placeholder="DD/MM/YYYY"
          />
        </div>

        {/* Row 3: Note full width */}
        <div>
          <Textarea
            label="Ghi chú (tùy chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Internal notes…"
            size="sm"
            maxCharCount={600}
            showCharCount
            autoResize
            rows={6}
          />
        </div>
      </div>

      {/* ── Line items ── */}
      <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-secondary-900">
            Line Items
            {lineItems.length > 0 && (
              <span className="ml-2 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-600">
                {lineItems.length}
              </span>
            )}
          </h2>
          <Button
            variant="primary"
            size="xs"
            onClick={addLine}
            className="rounded-lg"
          >
            <PlusIcon className="w-4 h-4" />
            Add Item
          </Button>
        </div>

        {/* Item cards */}
        {lineItems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-secondary-400">No items yet.</p>
            <p className="mt-1 text-xs text-secondary-300">Click "Add Item" to begin building your order.</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-100">
            {lineItems.map((li, idx) => (
              <div key={li.draftId} className="p-4">
                <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-4 space-y-3">
                  {/* Row 1: index + product select + remove */}
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-200 text-xs font-bold text-secondary-600">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Select
                        options={buildProductOptions(li.inventoryItemId)}
                        value={li.inventoryItemId || undefined}
                        onChange={(v) => {
                          const item = inventoryItems.find((i) => i.id === (v as string));
                          if (item) selectProduct(li.draftId, item);
                        }}
                        searchable
                        boldLabel
                        placeholder="Chọn sản phẩm…"
                        className="rounded-lg"
                      />
                    </div>
                    <Button
                      variant="outline"
                      color="danger"
                      size="xs"
                      onClick={() => removeLine(li.draftId)}
                      leftIcon={<TrashIcon className="w-4 h-4" />}
                      className="rounded rounded-lg border-error-200 text-error-500 hover:bg-error-100"
                    >
                      Remove
                    </Button>
                  </div>

                  {/* Row 2: Qty | Cost | Note — only shown once a product is selected */}
                  {li.inventoryItemId && (
                    <div className="grid grid-cols-3 gap-3">
                      {/* Quantity */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-secondary-600">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={li.quantityOrdered}
                          onChange={(e) =>
                            updateLine(li.draftId, "quantityOrdered", Math.max(1, parseInt(e.target.value, 10) || 1))
                          }
                          className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <p className="mt-1 text-xs text-secondary-400">
                          In stock: {li.quantityOnHand}
                        </p>
                      </div>

                      {/* Cost Price */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-secondary-600">
                          Cost Price (₫)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={li.costPrice || ""}
                          onChange={(e) =>
                            updateLine(li.draftId, "costPrice", parseInt(e.target.value, 10) || 0)
                          }
                          className="w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <p className="mt-1 text-xs text-secondary-400">
                          Subtotal: {formatVND(li.costPrice * li.quantityOrdered)}
                        </p>
                      </div>

                      {/* Note */}
                      <div className="col-span-3">
                        <label className="mb-1 block text-xs font-medium text-secondary-600">
                          Note
                        </label>
                        <Textarea
                          value={li.note ?? ""}
                          onChange={(e) => updateLine(li.draftId, "note", e.target.value)}
                          placeholder="Nhập ghi chú..."
                          rows={3}
                          maxCharCount={300}
                          showCharCount
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Totals footer */}
        {lineItems.length > 0 && (
          <div className="flex items-center justify-between border-t border-secondary-100 px-6 py-4">
            <span className="text-sm text-secondary-500">
              {lineItems.filter((l) => l.inventoryItemId).length} of {lineItems.length} item{lineItems.length !== 1 ? "s" : ""} selected
            </span>
            <div className="text-sm">
              <span className="text-secondary-500">Total Cost: </span>
              <span className="text-lg font-bold text-secondary-900">{formatVND(totalCost)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => router.push("/inventory/stock-in")}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isValid || isSaving}
          isLoading={isSaving}
          className="rounded-xl"
        >
          Create Stock-In
        </Button>
      </div>
    </div>
  );
}
