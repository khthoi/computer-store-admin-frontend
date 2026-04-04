"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
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

// ─── ProductCombobox ──────────────────────────────────────────────────────────

interface ProductComboboxProps {
  inventoryItems: InventoryItem[];
  selectedId: string;
  disabledIds: string[];
  onSelect: (item: InventoryItem) => void;
}

function ProductCombobox({ inventoryItems, selectedId, disabledIds, onSelect }: ProductComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = inventoryItems.find((i) => i.id === selectedId);

  const filtered = inventoryItems.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.productName.toLowerCase().includes(q) ||
      item.variantName.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setSearch(""); }}
        className={[
          "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
          open
            ? "border-primary-500 ring-2 ring-primary-500/20"
            : "border-secondary-300 hover:border-secondary-400",
          selected ? "text-secondary-900" : "text-secondary-400",
        ].join(" ")}
      >
        <span className="truncate">
          {selected
            ? `${selected.productName} — ${selected.variantName}`
            : "Select product…"}
        </span>
        <ChevronDownIcon
          className={["w-4 h-4 shrink-0 text-secondary-400 transition-transform", open ? "rotate-180" : ""].join(" ")}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-full min-w-[320px] rounded-xl border border-secondary-200 bg-white shadow-xl">
          <div className="border-b border-secondary-100 p-2">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, variant or SKU…"
              className="w-full rounded-lg border border-secondary-200 px-3 py-1.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-secondary-400">No products found.</li>
            ) : (
              filtered.map((item) => {
                const isSelected = item.id === selectedId;
                const isDisabled = disabledIds.includes(item.id) && !isSelected;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDisabled) return;
                        onSelect(item);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={[
                        "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
                        isDisabled ? "cursor-not-allowed opacity-40" : "hover:bg-primary-50",
                        isSelected ? "bg-primary-50" : "",
                      ].join(" ")}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-secondary-900">
                          {item.productName}
                        </p>
                        <p className="text-xs text-secondary-500">{item.variantName}</p>
                        <p className="font-mono text-xs text-secondary-400">{item.sku}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            item.quantityAvailable === 0
                              ? "bg-error-50 text-error-700"
                              : item.quantityAvailable <= item.lowStockThreshold
                              ? "bg-warning-50 text-warning-700"
                              : "bg-success-50 text-success-700",
                          ].join(" ")}
                        >
                          Available: {item.quantityAvailable}
                        </span>
                        {isSelected && <CheckIcon className="w-4 h-4 text-primary-600" />}
                        {isDisabled && <CheckIcon className="w-4 h-4 text-secondary-400" />}
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
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
        <h2 className="text-sm font-semibold text-secondary-900">Stock-Out Details</h2>

        {/* Row 1: Reason (2 cols) + Scheduled Date (1 col) */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Select
              label="Reason"
              options={REASON_OPTIONS}
              value={reason}
              onChange={(v) => setReason(v as StockOutReason)}
              placeholder="Select a reason…"
            />
          </div>
          <DateInput
            label="Scheduled Date (optional)"
            value={scheduledDate}
            onChange={(val) => setScheduledDate(val)}
            placeholder="DD/MM/YYYY"
          />
        </div>

        {/* Row 2: Note — full width */}
        <Textarea
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Internal notes for this stock-out request…"
          size="sm"
          autoResize
          maxCharCount={300}
          showCharCount
          rows={2}
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
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {lineItems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-secondary-400">No items yet.</p>
            <p className="mt-1 text-xs text-secondary-300">Click "Add Item" to begin building your stock-out request.</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-100">
            {lineItems.map((li, idx) => {
              const isOverStock = li.inventoryItemId && li.quantity > li.quantityAvailable;
              return (
                <div key={li.draftId} className="p-4">
                  <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-4 space-y-3">
                    {/* Row 1: index + combobox + remove */}
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-200 text-xs font-bold text-secondary-600">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <ProductCombobox
                          inventoryItems={inventoryItems}
                          selectedId={li.inventoryItemId}
                          disabledIds={addedInventoryIds.filter((id) => id !== li.inventoryItemId)}
                          onSelect={(item) => selectProduct(li.draftId, item)}
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
                          <label className="mb-1 block text-xs font-medium text-secondary-600">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min={1}
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
                            Available: {li.quantityAvailable}
                            {isOverStock && " — exceeds available stock"}
                          </p>
                        </div>

                        {/* Note — spans 2 cols */}
                        <div className="col-span-2">
                          <label className="mb-1 block text-xs font-medium text-secondary-600">
                            Note
                          </label>
                          <Input
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
        <button
          type="button"
          onClick={() => router.push("/inventory/stock-out")}
          className="rounded-xl border border-secondary-200 px-5 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
        >
          Cancel
        </button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isValid || isSaving}
          isLoading={isSaving}
        >
          Create Stock-Out
        </Button>
      </div>
    </div>
  );
}
