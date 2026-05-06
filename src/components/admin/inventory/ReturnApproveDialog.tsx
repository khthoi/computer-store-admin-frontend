"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { getVariantStockLevel, getBatchesByVariant } from "@/src/services/inventory.service";
import type { VariantStockLevel, StockBatch, ReturnLineItem } from "@/src/types/inventory.types";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface ItemStockInfo {
  stockLevel: VariantStockLevel | null;
  batches: StockBatch[];
}

// ─── ModalFooter ──────────────────────────────────────────────────────────────

export function ModalFooter({
  onClose,
  onConfirm,
  confirmLabel,
  isLoading,
  disabled,
}: {
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  isLoading: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="flex items-center justify-center rounded-xl border border-secondary-200 px-5 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50 disabled:pointer-events-none disabled:opacity-50"
      >
        Huỷ
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled || isLoading}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {confirmLabel}
      </button>
    </div>
  );
}

// ─── Resolution options ───────────────────────────────────────────────────────

const ALL_RESOLUTION_OPTIONS = [
  { value: "HoanTien",    label: "Hoàn tiền",     desc: "Hoàn lại tiền cho khách" },
  { value: "GiaoHangMoi", label: "Giao hàng mới", desc: "Gửi sản phẩm thay thế" },
  { value: "BaoHanh",     label: "Bảo hành",       desc: "Gửi về hãng bảo hành" },
];

const RESOLUTION_BY_TYPE: Record<string, string[]> = {
  TraHang: ["HoanTien", "GiaoHangMoi"],
  DoiHang: ["GiaoHangMoi", "HoanTien"],
  BaoHanh: ["BaoHanh"],
};

// ─── StockItemCard ────────────────────────────────────────────────────────────

function StockItemCard({ item, info }: { item: ReturnLineItem; info: ItemStockInfo }) {
  const tonKho   = info.stockLevel?.quantityOnHand ?? 0;
  const batchQty = info.batches.reduce((s, b) => s + b.quantityRemaining, 0);
  const mismatch = tonKho !== batchQty;
  const enough   = tonKho >= item.quantity;

  const fifoBatch = info.batches.find((b) => b.quantityRemaining > 0);

  let need = item.quantity;
  const allocMap = new Map<string, number>();
  for (const b of info.batches) {
    if (need <= 0) break;
    const take = Math.min(b.quantityRemaining, need);
    if (take > 0) { allocMap.set(b.id, take); need -= take; }
  }

  return (
    <div className={[
      "rounded-xl border",
      !enough   ? "border-red-200"
      : mismatch ? "border-amber-200"
      :            "border-secondary-100",
    ].join(" ")}>

      {/* ── Product header ── */}
      <div className="px-4 pt-3.5 pb-3 border-b border-secondary-100">
        <Tooltip content={item.productName} placement="top" multiline maxWidth="360px">
          <p className="truncate text-sm font-semibold text-secondary-900 cursor-default leading-snug">
            {item.productName}
          </p>
        </Tooltip>
        <Tooltip
          content={item.sku ? `${item.variantName} · ${item.sku}` : item.variantName}
          placement="top"
          multiline
          maxWidth="360px"
        >
          <p className="mt-0.5 truncate text-xs text-secondary-400 cursor-default">
            {item.variantName}
            {item.sku && <span className="ml-1.5 font-mono text-secondary-300">· {item.sku}</span>}
          </p>
        </Tooltip>

        {/* Stats strip */}
        <div className="mt-2.5 flex items-center gap-0 divide-x divide-secondary-100 rounded-lg border border-secondary-100 bg-secondary-50 overflow-hidden text-xs">
          <div className="flex-1 px-3 py-1.5 text-center">
            <p className="text-[10px] text-secondary-400 leading-none mb-0.5">Cần xuất</p>
            <p className="font-bold text-secondary-800 tabular-nums">{item.quantity}</p>
          </div>
          <div className="flex-1 px-3 py-1.5 text-center">
            <p className="text-[10px] text-secondary-400 leading-none mb-0.5">Tồn kho</p>
            <p className={["font-bold tabular-nums", !enough ? "text-red-600" : "text-secondary-800"].join(" ")}>
              {tonKho}
            </p>
          </div>
          <div className="flex-1 px-3 py-1.5 text-center">
            <p className="text-[10px] text-secondary-400 leading-none mb-0.5">Thực tế lô</p>
            <p className={["font-bold tabular-nums", mismatch ? "text-amber-600" : "text-secondary-800"].join(" ")}>
              {batchQty}
            </p>
          </div>
        </div>

        {mismatch && (
          <p className="mt-2 text-[11px] text-amber-700 flex items-start gap-1">
            <span className="mt-px shrink-0">⚠</span>
            <span>Tổng lô ({batchQty}) ≠ tồn kho ({tonKho}) — có thể do điều chỉnh thủ công hoặc nhập bù.</span>
          </p>
        )}
        {!enough && (
          <p className="mt-1.5 text-[11px] font-semibold text-red-600 flex items-center gap-1">
            <span>✕</span>
            <span>Không đủ hàng để đổi.</span>
          </p>
        )}
      </div>

      {/* ── Batch list ── */}
      <div className="px-4 py-3 space-y-2">
        {info.batches.length === 0 ? (
          <p className="text-xs text-secondary-400 text-center py-1">Chưa có dữ liệu lô hàng.</p>
        ) : (
          info.batches.map((batch) => {
            const isFifo  = batch.id === fifoBatch?.id;
            const isEmpty = batch.quantityRemaining === 0;
            const alloc   = allocMap.get(batch.id) ?? 0;
            const importDate = batch.importedAt
              ? new Date(batch.importedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
              : null;

            return (
              <div
                key={batch.id}
                className={[
                  "rounded-lg border px-3 py-2.5",
                  isFifo   ? "border-amber-200 bg-amber-50"
                  : isEmpty ? "border-secondary-100 bg-secondary-50/60 opacity-55"
                  :           "border-secondary-100 bg-white",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isFifo && (
                      <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black bg-amber-200 text-amber-800 uppercase tracking-widest">
                        FIFO
                      </span>
                    )}
                    <Tooltip
                      content={batch.receiptCode ? `Phiếu nhập: ${batch.receiptCode}` : batch.maLo}
                      placement="top"
                    >
                      <span className={[
                        "font-mono text-[11px] truncate max-w-[110px] cursor-default",
                        isEmpty ? "text-secondary-400" : "text-secondary-600",
                      ].join(" ")}>
                        {batch.maLo}
                      </span>
                    </Tooltip>
                    {importDate && (
                      <span className="shrink-0 text-[10px] text-secondary-400">· {importDate}</span>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {alloc > 0 && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700">
                        xuất {alloc}
                      </span>
                    )}
                    <span className="text-xs tabular-nums">
                      <span className={isFifo && !isEmpty ? "font-bold text-secondary-800" : "text-secondary-500"}>
                        {batch.quantityRemaining}
                      </span>
                      <span className="text-secondary-300"> / {batch.quantityImported}</span>
                    </span>
                  </div>
                </div>

                <ProgressBar
                  value={batch.quantityRemaining}
                  max={Math.max(batch.quantityImported, 1)}
                  size="xs"
                  variant={isFifo && !isEmpty ? "warning" : "default"}
                  animated
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── StockPanel ───────────────────────────────────────────────────────────────

function StockPanel({
  lineItems,
  loading,
  infoMap,
}: {
  lineItems: ReturnLineItem[];
  loading: boolean;
  infoMap: Record<string, ItemStockInfo>;
}) {
  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">
          Kiểm tra tồn kho
        </p>
        <span className="text-xs text-secondary-400">{lineItems.length} sản phẩm</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 min-h-0">
        {loading ? (
          lineItems.map((item) => (
            <div key={item.variantId} className="rounded-xl border border-secondary-100 overflow-hidden">
              <div className="px-4 pt-3.5 pb-3 border-b border-secondary-100 space-y-2">
                <div className="h-4 w-3/4 rounded bg-secondary-100 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-secondary-100 animate-pulse" />
                <div className="h-10 rounded-lg bg-secondary-100 animate-pulse mt-3" />
              </div>
              <div className="px-4 py-3 space-y-2">
                {[1, 2].map((n) => (
                  <div key={n} className="rounded-lg border border-secondary-100 px-3 py-2.5 space-y-2">
                    <div className="h-3 w-1/2 rounded bg-secondary-100 animate-pulse" />
                    <div className="h-1.5 rounded-full bg-secondary-100 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          lineItems.map((item) => {
            const info = infoMap[item.variantId];
            if (!info) return (
              <div key={item.variantId} className="rounded-xl border border-secondary-100 px-4 py-3 text-xs text-secondary-400">
                Không tải được dữ liệu tồn kho.
              </div>
            );
            return <StockItemCard key={item.variantId} item={item} info={info} />;
          })
        )}
      </div>

      {!loading && (
        <div className="shrink-0 mt-3 pt-3 border-t border-secondary-100 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1.5 text-[10px] text-secondary-400">
            <span className="inline-block w-4 h-2 rounded-sm bg-amber-300" />
            Lô FIFO — xuất trước
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-secondary-400">
            <span className="inline-block rounded px-1 py-px text-[9px] font-bold bg-amber-100 text-amber-700">xuất N</span>
            Số lượng sẽ lấy từ lô này
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-secondary-400">
            <span className="opacity-50">░░</span>
            Lô đã hết hàng
          </span>
        </div>
      )}
    </div>
  );
}

// ─── ApproveDialog ────────────────────────────────────────────────────────────

interface ApproveDialogProps {
  isOpen: boolean;
  isConfirming: boolean;
  requestType: string;
  lineItems: ReturnLineItem[];
  onClose: () => void;
  onConfirm: (resolution: string) => void;
}

export function ApproveDialog({ isOpen, isConfirming, requestType, lineItems, onClose, onConfirm }: ApproveDialogProps) {
  const [pendingResolution, setPendingResolution] = useState("");
  const [infoMap, setInfoMap] = useState<Record<string, ItemStockInfo>>({});
  const [stockLoading, setStockLoading] = useState(false);

  const allowedValues = RESOLUTION_BY_TYPE[requestType] ?? ALL_RESOLUTION_OPTIONS.map((o) => o.value);
  const options = ALL_RESOLUTION_OPTIONS.filter((o) => allowedValues.includes(o.value));
  const showStock = pendingResolution === "GiaoHangMoi" && lineItems.length > 0;

  useEffect(() => {
    if (!showStock) return;
    if (Object.keys(infoMap).length > 0) return;
    setStockLoading(true);
    Promise.all(
      lineItems.map(async (item) => {
        const [stockLevel, batches] = await Promise.all([
          getVariantStockLevel(item.variantId).catch(() => null),
          getBatchesByVariant(item.variantId).catch((): StockBatch[] => []),
        ]);
        return { variantId: item.variantId, stockLevel, batches };
      }),
    ).then((results) => {
      const map: Record<string, ItemStockInfo> = {};
      for (const r of results) map[r.variantId] = { stockLevel: r.stockLevel, batches: r.batches };
      setInfoMap(map);
    }).finally(() => setStockLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showStock]);

  function handleClose() {
    setPendingResolution("");
    onClose();
  }

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={handleClose} className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-dialog-title"
        className={[
          "relative z-10 w-full rounded-2xl bg-white shadow-2xl flex flex-col",
          "transition-[max-width] duration-300 ease-out",
          showStock ? "max-w-3xl max-h-[88vh]" : "max-w-lg",
        ].join(" ")}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 shrink-0 border-b border-secondary-100">
          <h2 id="approve-dialog-title" className="text-[15px] font-semibold text-secondary-900">
            Duyệt yêu cầu
          </h2>
          <p className="mt-0.5 text-xs text-secondary-400">Chọn hướng xử lý trước khi duyệt</p>
        </div>

        {/* ── Body ── */}
        <div className={[
          "flex-1 overflow-hidden px-6 py-5",
          showStock ? "grid grid-cols-[220px_1fr] gap-6" : "",
        ].join(" ")}>

          {/* Options column */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-secondary-400 uppercase tracking-widest mb-3">
              Hướng xử lý
            </p>
            {options.map((opt) => {
              const selected = pendingResolution === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPendingResolution(opt.value)}
                  className={[
                    "w-full rounded-xl border px-4 py-3 text-left transition-all duration-150",
                    "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 outline-none",
                    selected
                      ? "border-primary-400 bg-primary-50 shadow-sm"
                      : "border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className={[
                        "text-sm font-semibold",
                        selected ? "text-primary-700" : "text-secondary-800",
                      ].join(" ")}>
                        {opt.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-secondary-400 leading-snug">{opt.desc}</p>
                    </div>
                    <div className={[
                      "shrink-0 w-4 h-4 rounded-full border-2 transition-all duration-150 flex items-center justify-center",
                      selected
                        ? "border-primary-500 bg-primary-500"
                        : "border-secondary-300",
                    ].join(" ")}>
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stock panel column */}
          {showStock && (
            <div className="min-h-0 flex flex-col overflow-hidden">
              <StockPanel
                lineItems={lineItems}
                loading={stockLoading}
                infoMap={infoMap}
              />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-5 pt-4 shrink-0 border-t border-secondary-100">
          <ModalFooter
            onClose={handleClose}
            onConfirm={() => onConfirm(pendingResolution)}
            confirmLabel="Xác nhận duyệt"
            isLoading={isConfirming}
            disabled={!pendingResolution}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
