"use client";

import { Tooltip } from "@/src/components/ui/Tooltip";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import type { ReturnLineItem } from "@/src/types/inventory.types";
import type { ItemStockInfo } from "./ReturnApproveDialog";

// ─── InlineStockPanel ─────────────────────────────────────────────────────────

export function InlineStockPanel({
  item,
  info,
  loading,
}: {
  item: ReturnLineItem;
  info?: ItemStockInfo;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="mt-3 space-y-1.5">
        <div className="flex gap-4">
          <div className="h-3 w-24 rounded bg-secondary-100 animate-pulse" />
          <div className="h-3 w-24 rounded bg-secondary-100 animate-pulse" />
        </div>
        {[1, 2].map((n) => (
          <div key={n} className="rounded-lg border border-secondary-100 px-2.5 py-2 space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-32 rounded bg-secondary-100 animate-pulse" />
              <div className="h-3 w-12 rounded bg-secondary-100 animate-pulse" />
            </div>
            <div className="h-1 rounded-full bg-secondary-100 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!info) return null;

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
    <div className="mt-3 pt-3 border-t border-secondary-100">
      {/* Stats row */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mb-2.5 text-xs">
        <span className="text-secondary-400">
          Tồn kho:{" "}
          <span className={["font-semibold", !enough ? "text-red-600" : "text-secondary-700"].join(" ")}>
            {tonKho}
          </span>
        </span>
        <span className="text-secondary-200" aria-hidden>·</span>
        <Tooltip
          content={
            mismatch
              ? `Tổng lô (${batchQty}) ≠ tồn kho (${tonKho}) — có thể do điều chỉnh thủ công hoặc nhập bù chưa tạo lô`
              : `Tổng tồn từ ${info.batches.filter((b) => b.quantityRemaining > 0).length} lô đang có hàng`
          }
          placement="top"
          multiline
          maxWidth="280px"
        >
          <span className={["text-secondary-400", mismatch ? "cursor-help" : "cursor-default"].join(" ")}>
            Thực tế lô:{" "}
            <span className={["font-semibold", mismatch ? "text-amber-600" : "text-secondary-700"].join(" ")}>
              {batchQty}
            </span>
            {mismatch && <span className="ml-1 text-amber-500">⚠</span>}
          </span>
        </Tooltip>
        {!enough && (
          <>
            <span className="text-secondary-200" aria-hidden>·</span>
            <span className="font-semibold text-red-600">
              ✕ Không đủ hàng
            </span>
          </>
        )}
      </div>

      {/* Batch rows */}
      <div className="space-y-1.5">
        {info.batches.length === 0 ? (
          <p className="text-[11px] text-secondary-400 italic">Chưa có dữ liệu lô hàng.</p>
        ) : (
          info.batches.map((batch) => {
            const isFifo  = batch.id === fifoBatch?.id;
            const isEmpty = batch.quantityRemaining === 0;
            const alloc   = allocMap.get(batch.id) ?? 0;
            const importDate = batch.importedAt
              ? new Date(batch.importedAt).toLocaleDateString("vi-VN", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                })
              : null;

            return (
              <div
                key={batch.id}
                className={[
                  "rounded-lg border px-2.5 py-2",
                  isFifo
                    ? "border-amber-200 bg-amber-50/70"
                    : isEmpty
                    ? "border-dashed border-secondary-150 bg-secondary-50/40 opacity-50"
                    : "border-secondary-100 bg-white",
                ].join(" ")}
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isFifo && (
                      <span className="shrink-0 rounded px-1 py-px text-[9px] font-black bg-amber-200 text-amber-800 uppercase tracking-widest leading-none">
                        FIFO
                      </span>
                    )}
                    <Tooltip
                      content={
                        batch.receiptCode
                          ? `Phiếu nhập: ${batch.receiptCode}\nMã lô: ${batch.maLo}`
                          : `Mã lô: ${batch.maLo}`
                      }
                      placement="top"
                      multiline
                      maxWidth="220px"
                    >
                      <span
                        className={[
                          "font-mono text-[11px] cursor-default truncate max-w-[120px]",
                          isEmpty ? "text-secondary-400" : "text-secondary-600",
                        ].join(" ")}
                      >
                        {batch.maLo}
                      </span>
                    </Tooltip>
                    {importDate && (
                      <span className="shrink-0 text-[10px] text-secondary-400">· {importDate}</span>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {alloc > 0 && (
                      <Tooltip
                        content={`Sẽ lấy ${alloc} sản phẩm từ lô này theo thứ tự FIFO`}
                        placement="top"
                        multiline
                        maxWidth="200px"
                      >
                        <span className="cursor-help rounded px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700">
                          xuất {alloc}
                        </span>
                      </Tooltip>
                    )}
                    <span className="text-xs tabular-nums">
                      <span
                        className={
                          isFifo && !isEmpty
                            ? "font-bold text-secondary-800"
                            : "text-secondary-500"
                        }
                      >
                        {batch.quantityRemaining}
                      </span>
                      <span className="text-secondary-300"> / {batch.quantityImported}</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
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

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-1 text-[10px] text-secondary-400">
          <span className="inline-block w-3.5 h-1.5 rounded-sm bg-amber-300" />
          Lô FIFO — xuất trước
        </span>
        <span className="flex items-center gap-1 text-[10px] text-secondary-400">
          <span className="inline-block rounded px-1 py-px text-[9px] font-bold bg-amber-100 text-amber-700 leading-tight">xuất N</span>
          Số lượng sẽ lấy
        </span>
      </div>
    </div>
  );
}
