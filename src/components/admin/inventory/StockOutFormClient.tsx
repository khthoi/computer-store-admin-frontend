"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select, type SelectOption } from "@/src/components/ui/Select";
import { Textarea } from "@/src/components/ui/Textarea";
import { DateInput } from "@/src/components/ui/DateInput";
import { useToast } from "@/src/components/ui/Toast";
import { createStockOut } from "@/src/services/inventory.service";
import type { InventoryItem, StockOutReason } from "@/src/types/inventory.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const REASON_OPTIONS: { value: StockOutReason; label: string }[] = [
  { value: "internal_use", label: "Internal Use" },
  { value: "damage",       label: "Damage / Write-off" },
  { value: "loss",         label: "Loss" },
  { value: "transfer",     label: "Transfer" },
  { value: "promotional",  label: "Promotional / Sample" },
  { value: "other",        label: "Other" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItemDraft {
  draftId: string;
  inventoryItemId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantityAvailable: number;
  quantity: number;
  note?: string;
}

// ─── StockOutFormClient ───────────────────────────────────────────────────────

export function StockOutFormClient({ inventoryItems }: { inventoryItems: InventoryItem[] }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [reason, setReason] = useState<StockOutReason | "">("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [note, setNote] = useState("");
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addedInventoryIds = lineItems.map((l) => l.inventoryItemId).filter(Boolean);

  // Build Select options for a given line item — disables items already picked in other rows
  function buildProductOptions(currentSelectedId: string): SelectOption[] {
    const otherAddedIds = addedInventoryIds.filter((id) => id !== currentSelectedId);
    return inventoryItems.map((item) => ({
      value: item.id,
      label: `${item.productName} — ${item.variantName}`,
      description: item.sku,
      badge:
        item.quantityAvailable === 0
          ? { text: `Khả dụng: ${item.quantityAvailable}`, variant: "error" as const }
          : item.quantityAvailable <= item.lowStockThreshold
          ? { text: `Khả dụng: ${item.quantityAvailable}`, variant: "warning" as const }
          : { text: `Khả dụng: ${item.quantityAvailable}`, variant: "success" as const },
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
        quantityAvailable: 0,
        quantity: 1,
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
              quantityAvailable: item.quantityAvailable,
            }
          : l
      )
    );
  }

  function updateLine(draftId: string, field: "quantity" | "note", value: number | string) {
    setLineItems((prev) =>
      prev.map((l) => (l.draftId === draftId ? { ...l, [field]: value } : l))
    );
  }

  const isValid =
    reason !== "" &&
    lineItems.length > 0 &&
    lineItems.every((l) => l.inventoryItemId && l.quantity >= 1);

  async function handleSubmit() {
    if (!isValid || !reason) return;
    setIsSaving(true);
    try {
      const record = await createStockOut({
        reason,
        note: note.trim() || undefined,
        scheduledDate: scheduledDate || undefined,
        lineItems: lineItems.map((l, idx) => ({
          id: `${Date.now()}-${idx}`,
          productId: l.productId,
          variantId: l.variantId,
          productName: l.productName,
          variantName: l.variantName,
          sku: l.sku,
          quantity: l.quantity,
          note: l.note?.trim() || undefined,
        })),
      });
      showToast(`Stock-out ${record.id} created.`, "success");
      router.push("/inventory/stock-out");
    } catch {
      showToast("Failed to create stock-out.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header details ── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-semibold text-secondary-900">Chi tiết phiếu xuất kho</h2>

        {/* Row 1: Reason (2 cols) + Scheduled Date (1 col) */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Select
              label="Lý do"
              options={REASON_OPTIONS}
              value={reason}
              onChange={(v) => setReason(v as StockOutReason)}
              placeholder="Chọn lý do…"
            />
          </div>
          <DateInput
            label="Dự kiến ngày xuất kho"
            value={scheduledDate}
            onChange={(val) => setScheduledDate(val)}
            placeholder="DD/MM/YYYY"
          />
        </div>

        {/* Row 2: Note — full width */}
        <Textarea
          label="Ghi chú (tùy chọn)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú nội bộ cho yêu cầu xuất kho này…"
          size="sm"
          autoResize
          maxCharCount={600}
          showCharCount
          rows={4}
        />
      </div>

      {/* ── Line items ── */}
      <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
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
            onClick={addLine}
            className="rounded-lg"
            size="xs"
            leftIcon={<PlusIcon className="w-3 h-3" />}
          >
            Add Item
          </Button>
        </div>

        {lineItems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-secondary-400">Chưa có mặt hàng nào.</p>
            <p className="mt-1 text-xs text-secondary-300">Chọn "Add Item" để bắt đầu xây dựng yêu cầu xuất kho của bạn.</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-100">
            {lineItems.map((li, idx) => {
              const isOverStock = li.inventoryItemId && li.quantity > li.quantityAvailable;
              return (
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
                      <button
                        type="button"
                        onClick={() => removeLine(li.draftId)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-error-500 hover:bg-error-50 transition-colors"
                        aria-label="Remove item"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Row 2: Qty | Note — shown once a product is selected */}
                    {li.inventoryItemId && (
                      <div className="grid grid-cols-3 gap-3">
                        {/* Quantity */}
                        <div>
                          <Input
                            type="number"
                            min={1}
                            label="Số lượng"
                            value={li.quantity}
                            onChange={(e) =>
                              updateLine(li.draftId, "quantity", Math.max(1, parseInt(e.target.value, 10) || 1))
                            }
                            className={[
                              "w-full rounded-lg border bg-white px-3 py-2 text-sm text-secondary-900 focus:outline-none focus:ring-2",
                              isOverStock
                                ? "border-warning-400 focus:border-warning-500 focus:ring-warning-500/20"
                                : "border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20",
                            ].join(" ")}
                          />
                          <p className={["mt-1 text-xs", isOverStock ? "text-warning-600 font-medium" : "text-secondary-400"].join(" ")}>
                            Tồn kho: {li.quantityAvailable}
                            {isOverStock && " — exceeds available stock"}
                          </p>
                        </div>

                        {/* Note — spans full width */}
                        <div className="col-span-3">
                          <Textarea
                            autoResize
                            label="Ghi chú"
                            maxCharCount={300}
                            showCharCount
                            rows={3}
                            value={li.note ?? ""}
                            onChange={(e) => updateLine(li.draftId, "note", e.target.value)}
                            placeholder="e.g. Screen cracked, Found missing during audit…"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer summary */}
        {lineItems.length > 0 && (
          <div className="flex items-center justify-between border-t border-secondary-100 px-6 py-4">
            <span className="text-sm text-secondary-500">
              {lineItems.filter((l) => l.inventoryItemId).length} of {lineItems.length}{" "}
              item{lineItems.length !== 1 ? "s" : ""} selected
            </span>
            <span className="text-sm text-secondary-500">
              Total qty:{" "}
              <span className="font-semibold text-secondary-900">
                {lineItems.reduce((s, l) => s + (l.inventoryItemId ? l.quantity : 0), 0)}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => router.push("/inventory/stock-out")}
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
          Create Stock-Out
        </Button>
      </div>
    </div>
  );
}
