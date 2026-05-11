"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, LockClosedIcon, ClockIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select, type SelectOption } from "@/src/components/ui/Select";
import { Textarea } from "@/src/components/ui/Textarea";
import { DateInput } from "@/src/components/ui/DateInput";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Badge } from "@/src/components/ui/Badge";
import { useToast } from "@/src/components/ui/Toast";
import {
  createStockIn,
  getNextReceiptCode,
  getBatchesByVariant,
} from "@/src/services/inventory.service";
import { formatVND } from "@/src/lib/format";
import type { Supplier, InventoryItem, StockBatch } from "@/src/types/inventory.types";

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
  serialsText?: string;
  batchInfo: StockBatch[] | null;
  isFetchingBatches: boolean;
}

interface PrefillData {
  variantId?: string;
  qty?: number;
  supplierId?: string;
  note?: string;
  lineNote?: string;
  expectedDate?: string;
}

interface StockInFormClientProps {
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  prefill?: PrefillData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}

// ─── StockInFormClient ────────────────────────────────────────────────────────

export function StockInFormClient({
  suppliers,
  inventoryItems,
  prefill,
}: StockInFormClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // ── Feature A: receipt code preview ──
  const [receiptCodeDisplay, setReceiptCodeDisplay] = useState<string>("");
  const [isLoadingCode, setIsLoadingCode] = useState(true);

  useEffect(() => {
    getNextReceiptCode()
      .then((code) => setReceiptCodeDisplay(code))
      .catch(() => setReceiptCodeDisplay(""))
      .finally(() => setIsLoadingCode(false));
  }, []);

  // Resolve prefill item once from props (stable reference)
  const prefillItem = prefill?.variantId
    ? inventoryItems.find((i) => i.variantId === prefill.variantId) ?? null
    : null;

  const [supplierId, setSupplierId] = useState(prefill?.supplierId ?? "");
  const [expectedDate, setExpectedDate] = useState(prefill?.expectedDate ?? "");
  const [note, setNote] = useState(prefill?.note ?? "");
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(() => {
    if (!prefillItem) return [];
    return [
      {
        draftId: `draft-prefill-${Date.now()}`,
        inventoryItemId: prefillItem.id,
        productId: prefillItem.productId,
        variantId: prefillItem.variantId,
        productName: prefillItem.productName,
        variantName: prefillItem.variantName,
        sku: prefillItem.sku,
        quantityOnHand: prefillItem.quantityOnHand,
        quantityOrdered: prefill?.qty ?? 1,
        costPrice: prefillItem.costPrice,
        note: prefill?.lineNote,
        batchInfo: null,
        isFetchingBatches: true,
      },
    ];
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch batches for the pre-filled line item
  useEffect(() => {
    if (!prefillItem) return;
    getBatchesByVariant(prefillItem.variantId)
      .then((batches) => {
        const active = batches.filter((b) => b.quantityRemaining > 0);
        setLineItems((prev) =>
          prev.map((l) =>
            l.variantId === prefillItem.variantId
              ? { ...l, batchInfo: active, isFetchingBatches: false }
              : l
          )
        );
      })
      .catch(() => {
        setLineItems((prev) =>
          prev.map((l) =>
            l.variantId === prefillItem.variantId
              ? { ...l, batchInfo: [], isFetchingBatches: false }
              : l
          )
        );
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const supplierOptions = suppliers
    .filter((s) => s.status === "active")
    .map((s) => ({ value: s.id, label: s.name }));

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const addedInventoryIds = lineItems.map((l) => l.inventoryItemId).filter(Boolean);

  // ── Feature B: 3-row option display ──
  function buildProductOptions(currentSelectedId: string): SelectOption[] {
    const otherAddedIds = addedInventoryIds.filter((id) => id !== currentSelectedId);
    return inventoryItems.map((item) => ({
      value: item.id,
      label: item.productName,
      subLabel: item.variantName,
      description: `SKU: ${item.sku}`,
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
        batchInfo: null,
        isFetchingBatches: false,
      },
    ]);
  }

  function removeLine(draftId: string) {
    setLineItems((prev) => prev.filter((l) => l.draftId !== draftId));
  }

  // ── Feature C: fetch batches on variant select (with stale-fetch guard) ──
  function selectProduct(draftId: string, item: InventoryItem) {
    const variantIdToFetch = item.variantId;
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
              batchInfo: null,
              isFetchingBatches: true,
            }
          : l
      )
    );

    getBatchesByVariant(variantIdToFetch)
      .then((batches) => {
        const activeBatches = batches.filter((b) => b.quantityRemaining > 0);
        setLineItems((prev) =>
          prev.map((l) => {
            if (l.draftId !== draftId || l.variantId !== variantIdToFetch) return l;
            return { ...l, batchInfo: activeBatches, isFetchingBatches: false };
          })
        );
      })
      .catch(() => {
        setLineItems((prev) =>
          prev.map((l) => {
            if (l.draftId !== draftId || l.variantId !== variantIdToFetch) return l;
            return { ...l, batchInfo: [], isFetchingBatches: false };
          })
        );
      });
  }

  function updateLine(
    draftId: string,
    field: "quantityOrdered" | "costPrice" | "note" | "serialsText",
    value: number | string
  ) {
    setLineItems((prev) =>
      prev.map((l) => (l.draftId === draftId ? { ...l, [field]: value } : l))
    );
  }

  const totalCost = lineItems.reduce((s, l) => s + l.costPrice * l.quantityOrdered, 0);

  const isValid =
    !!supplierId &&
    !!expectedDate &&
    lineItems.length > 0 &&
    lineItems.every((l) => l.inventoryItemId && l.quantityOrdered >= 1);

  async function handleSubmit() {
    if (!isValid || !selectedSupplier) return;
    setIsSaving(true);
    try {
      const record = await createStockIn({
        receiptCode: "",
        supplierId,
        supplierName: selectedSupplier.name,
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
      showToast(`Tạo phiếu nhập ${record.id} thành công.`, "success");
      router.push(`/inventory/stock-in/${record.id}`);
    } catch {
      showToast("Tạo phiếu nhập thất bại.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header details ── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-semibold text-secondary-900">Chi tiết phiếu nhập</h2>

        {/* Row 1: Receipt code | Supplier */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Receipt Code — read-only, fetched on mount (Feature A) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700">
              Mã phiếu nhập
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-secondary-200 bg-secondary-50 px-3 py-2 min-h-[38px]">
              <LockClosedIcon className="w-3.5 h-3.5 shrink-0 text-secondary-400" aria-hidden="true" />
              {isLoadingCode ? (
                <Skeleton className="h-4 w-36 rounded animate-pulse bg-secondary-200" />
              ) : (
                <span className="flex-1 font-mono text-sm text-secondary-400 select-all">
                  {receiptCodeDisplay || "Mã sẽ được cấp khi tạo phiếu"}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-secondary-400">
              {isLoadingCode ? "Đang tạo mã..." : "Tự động tạo · read-only"}
            </p>
          </div>

          {/* Supplier */}
          <Select
            label="Nhà cung cấp"
            options={supplierOptions}
            value={supplierId}
            onChange={(v) => setSupplierId(v as string)}
            placeholder="Select supplier…"
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
            Danh sách mặt hàng
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
            Thêm mặt hàng
          </Button>
        </div>

        {/* Item cards */}
        {lineItems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-secondary-400">Chưa có mặt hàng nào.</p>
            <p className="mt-1 text-xs text-secondary-300">Bấm "Thêm mặt hàng" để bắt đầu.</p>
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

                  {/* Feature C: Lô hàng hiện có — hiện ngay sau khi chọn variant */}
                  {li.inventoryItemId && (
                    <div className="mt-2 pt-2 border-t border-secondary-100">
                      {li.isFetchingBatches ? (
                        <div className="space-y-2 py-1">
                          <Skeleton className="h-4 w-32 rounded animate-pulse bg-secondary-200" />
                          <Skeleton className="h-8 w-full rounded animate-pulse bg-secondary-200" />
                          <Skeleton className="h-8 w-full rounded animate-pulse bg-secondary-200" />
                        </div>
                      ) : li.batchInfo !== null && li.batchInfo.length === 0 ? (
                        <div className="flex flex-col items-center py-4 gap-2">
                          <ArchiveBoxIcon className="w-7 h-7 text-secondary-300" />
                          <p className="text-sm text-secondary-400 italic">Chưa có lô hàng nào còn hàng</p>
                        </div>
                      ) : li.batchInfo && li.batchInfo.length > 0 ? (
                        <div className="bg-white rounded-lg border border-secondary-100 p-3">
                          {/* Section header */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-secondary-500">Lô hàng hiện có</span>
                            <Badge variant="default" size="sm">{li.batchInfo.length} lô</Badge>
                          </div>
                          {/* Table header */}
                          <div className="grid grid-cols-5 gap-2 pb-1.5 mb-1 border-b border-secondary-100">
                            <span className="text-xs font-medium text-secondary-400 uppercase tracking-wide">Mã lô</span>
                            <span className="text-xs font-medium text-secondary-400 uppercase tracking-wide">Ngày nhập</span>
                            <span className="text-xs font-medium text-secondary-400 uppercase tracking-wide text-center">Còn lại</span>
                            <span className="text-xs font-medium text-secondary-400 uppercase tracking-wide text-right">Giá nhập</span>
                            <span className="text-xs font-medium text-secondary-400 uppercase tracking-wide text-right">Nhập ban đầu</span>
                          </div>
                          {/* Table rows */}
                          {li.batchInfo.map((batch) => {
                            const isLow =
                              batch.quantityImported > 0 &&
                              batch.quantityRemaining / batch.quantityImported <= 0.2;
                            return (
                              <div
                                key={batch.id}
                                className="grid grid-cols-5 gap-2 py-1.5 rounded hover:bg-secondary-50"
                              >
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <span className="font-mono text-xs text-secondary-700 truncate">
                                    {batch.maLo}
                                  </span>
                                  {batch.isNextFifo && (
                                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs px-1.5 py-0.5 rounded-full w-fit whitespace-nowrap">
                                      <ClockIcon className="w-3 h-3 shrink-0" />
                                      FIFO – Tiêu trước
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-secondary-600 self-start pt-0.5">
                                  {formatDate(batch.importedAt)}
                                </span>
                                <span
                                  className={[
                                    "text-sm font-medium text-center self-start",
                                    isLow ? "text-orange-600" : "text-secondary-700",
                                  ].join(" ")}
                                >
                                  {batch.quantityRemaining} sp
                                </span>
                                <span className="text-sm text-secondary-700 text-right self-start">
                                  {formatVND(batch.costPrice)}
                                </span>
                                <span className="text-sm text-secondary-500 text-right self-start">
                                  {batch.quantityImported} sp
                                </span>
                              </div>
                            );
                          })}
                          {/* Footer */}
                          <div className="pt-2 mt-1 border-t border-secondary-100">
                            <span className="text-sm font-medium text-secondary-700">
                              Tổng còn lại:{" "}
                              {li.batchInfo.reduce((s, b) => s + b.quantityRemaining, 0)} sản phẩm
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Row 2: Qty | Cost | Note — only shown once a product is selected */}
                  {li.inventoryItemId && (
                    <div className="grid grid-cols-3 gap-3">
                      {/* Quantity */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-secondary-600">
                          Số lượng
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={li.quantityOrdered}
                          onChange={(e) =>
                            updateLine(
                              li.draftId,
                              "quantityOrdered",
                              Math.max(1, parseInt(e.target.value, 10) || 1)
                            )
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
                          Đơn giá nhập (₫)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={li.costPrice || ""}
                          onChange={(e) =>
                            updateLine(
                              li.draftId,
                              "costPrice",
                              parseInt(e.target.value, 10) || 0
                            )
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
                          Ghi chú
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
              {lineItems.filter((l) => l.inventoryItemId).length} / {lineItems.length} mặt hàng đã chọn
            </span>
            <div className="text-sm">
              <span className="text-secondary-500">Tổng chi phí: </span>
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
          Huỷ
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isValid || isSaving}
          isLoading={isSaving}
          className="rounded-xl"
        >
          Tạo phiếu nhập
        </Button>
      </div>
    </div>
  );
}
