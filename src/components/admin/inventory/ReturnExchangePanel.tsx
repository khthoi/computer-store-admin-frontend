"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { useToast } from "@/src/components/ui/Toast";
import {
  processExchange,
  confirmExchangeDelivered,
  changeResolution,
  type ProcessExchangeDto,
} from "@/src/services/returns.service";
import { getVariantStockLevel, getBatchesByVariant } from "@/src/services/inventory.service";
import type { ReturnLineItem, VariantStockLevel, StockBatch } from "@/src/types/inventory.types";

// ─── ExchangePanel ────────────────────────────────────────────────────────────

interface ExchangeStockRow {
  item: ReturnLineItem;
  tonKho: number;
  batchQty: number;
}

export function ExchangePanel({ returnId, resolutionId, resolutionStatus, lineItems = [], onDone }: {
  returnId: string;
  resolutionId?: string;
  resolutionStatus?: string;
  lineItems?: ReturnLineItem[];
  onDone: () => void;
}) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [stockRows, setStockRows] = useState<ExchangeStockRow[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [outOfStockError, setOutOfStockError] = useState(false);
  const [switchingResolution, setSwitchingResolution] = useState(false);
  const [form, setForm] = useState<ProcessExchangeDto>({
    trackingDoiHang: "",
    carrierDoiHang:  "",
    ghiChu:          "",
  });

  useEffect(() => {
    if (!lineItems.length || resolutionId) return;
    setStockLoading(true);
    Promise.all(
      lineItems.map(async (item) => {
        const [sl, batches] = await Promise.all([
          getVariantStockLevel(item.variantId).catch((): VariantStockLevel | null => null),
          getBatchesByVariant(item.variantId).catch((): StockBatch[] => []),
        ]);
        return {
          item,
          tonKho:   sl?.quantityOnHand ?? 0,
          batchQty: batches.reduce((s, b) => s + b.quantityRemaining, 0),
        };
      }),
    ).then(setStockRows).finally(() => setStockLoading(false));
  }, [lineItems, resolutionId]);

  async function handleExchange() {
    setSaving(true);
    setOutOfStockError(false);
    try {
      await processExchange(returnId, {
        ...form,
        trackingDoiHang: form.trackingDoiHang || undefined,
        carrierDoiHang:  form.carrierDoiHang  || undefined,
        ghiChu:          form.ghiChu          || undefined,
      });
      showToast("Đã xuất hàng đổi thành công.", "success");
      onDone();
    } catch (err) {
      const body = (err as any)?.body;
      if (body?.error === "OUT_OF_STOCK") {
        setOutOfStockError(true);
      } else {
        showToast((err as Error)?.message || "Không thể xuất hàng đổi.", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSwitchToRefund() {
    setSwitchingResolution(true);
    try {
      await changeResolution(returnId, { newResolution: "HoanTien", ghiChu: "Hết tồn kho, chuyển sang hoàn tiền" });
      showToast("Đã chuyển sang hướng hoàn tiền.", "success");
      onDone();
    } catch (err) {
      showToast((err as Error)?.message || "Không thể đổi hướng xử lý.", "error");
    } finally {
      setSwitchingResolution(false);
    }
  }

  async function handleConfirmDelivered() {
    if (!resolutionId) return;
    setSaving(true);
    try {
      await confirmExchangeDelivered(resolutionId);
      showToast("Đã xác nhận khách nhận được hàng.", "success");
      onDone();
    } catch (err) {
      showToast((err as Error)?.message || "Không thể xác nhận.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (resolutionId && resolutionStatus !== "HoanThanh") {
    return (
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-secondary-900">Đổi hàng — xác nhận giao thành công</h3>
        <p className="text-sm text-secondary-600">Xác nhận khách hàng đã nhận được hàng đổi để hoàn tất quy trình.</p>
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleConfirmDelivered} disabled={saving} isLoading={saving}>
            Xác nhận khách đã nhận
          </Button>
        </div>
      </div>
    );
  }

  if (resolutionId) return null;

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-secondary-900">Xuất hàng đổi</h3>

      {/* Stock info */}
      {stockLoading && (
        <p className="text-xs text-secondary-400">Đang kiểm tra tồn kho...</p>
      )}
      {!stockLoading && stockRows.length > 0 && (
        <div className="space-y-2">
          {stockRows.map(({ item, tonKho, batchQty }) => {
            const enough   = tonKho >= item.quantity;
            const mismatch = tonKho !== batchQty;
            return (
              <div
                key={item.variantId}
                className={[
                  "rounded-xl border px-4 py-3 text-xs",
                  !enough
                    ? "border-error-200 bg-error-50"
                    : mismatch
                    ? "border-warning-200 bg-warning-50"
                    : "border-secondary-200 bg-secondary-50",
                ].join(" ")}
              >
                <p className="mb-1 font-medium text-secondary-700 truncate">
                  {item.productName} — {item.variantName}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                  <span className="text-secondary-500">
                    Cần: <span className="font-semibold text-secondary-800">{item.quantity}</span>
                  </span>
                  <span className={!enough ? "text-error-700" : "text-secondary-500"}>
                    Tồn kho:{" "}
                    <span className={`font-semibold ${!enough ? "text-error-700" : "text-secondary-800"}`}>
                      {tonKho}
                    </span>
                  </span>
                  <span className={mismatch ? "text-warning-700" : "text-secondary-500"}>
                    Thực tế (lô):{" "}
                    <span className={`font-semibold ${mismatch ? "text-warning-700" : "text-secondary-800"}`}>
                      {batchQty}
                    </span>
                  </span>
                </div>
                {mismatch && (
                  <p className="mt-1 text-warning-700">
                    ⚠ Số lượng lô ({batchQty}) không khớp tồn kho ({tonKho}) — kiểm tra trước khi xuất.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Out-of-stock error banner */}
      {outOfStockError && (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-4 space-y-3">
          <p className="text-sm font-medium text-error-800">
            Không thể xuất hàng đổi — kho đã hết hàng cho sản phẩm này.
          </p>
          <p className="text-xs text-error-700">
            Bạn có thể chuyển sang hướng hoàn tiền để tiếp tục xử lý yêu cầu của khách.
          </p>
          <Button
            variant="danger"
            onClick={handleSwitchToRefund}
            disabled={switchingResolution}
            isLoading={switchingResolution}
          >
            Đổi sang Hoàn tiền
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Input
            label="Đơn vị vận chuyển"
            type="text"
            value={form.carrierDoiHang || ""}
            onChange={(e) => setForm((f) => ({ ...f, carrierDoiHang: e.target.value }))}
          />
        </div>
        <div>
          <Input
            label="Mã vận đơn"
            type="text"
            value={form.trackingDoiHang || ""}
            onChange={(e) => setForm((f) => ({ ...f, trackingDoiHang: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Ghi chú"
            value={form.ghiChu || ""}
            onChange={(e) => setForm((f) => ({ ...f, ghiChu: e.target.value }))}
            showCharCount
            maxCharCount={512}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleExchange} disabled={saving} isLoading={saving}>
          Xuất hàng đổi
        </Button>
      </div>
    </div>
  );
}
