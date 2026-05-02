"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Textarea } from "@/src/components/ui";
import { formatVND } from "@/src/lib/format";
import { getInventoryItems } from "@/src/services/inventory.service";
import { createExportReceipt } from "@/src/services/inventory-exports.service";
import { useToast } from "@/src/components/ui/Toast";
import type { InventoryItem } from "@/src/types/inventory.types";
import type { SelectOption } from "@/src/components/ui/Select";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOAI_OPTIONS = [
  {
    value: "XuatHuy" as const,
    label: "Huỷ hàng hỏng",
    desc: "Hàng bị phá huỷ, hỏng hóc, không còn dùng được",
  },
  {
    value: "XuatDieuChinh" as const,
    label: "Xuất điều chỉnh",
    desc: "Kiểm kê phát hiện thiếu so với hệ thống, chưa rõ nguyên nhân",
  },
  {
    value: "XuatNoiBo" as const,
    label: "Xuất nội bộ",
    desc: "Dùng trong công ty: showroom, văn phòng, kỹ thuật viên",
  },
];

type LoaiXuat = "XuatHuy" | "XuatDieuChinh" | "XuatNoiBo";

interface LineItem {
  variantId: string;
  soLuong: number;
  ghiChu: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExportReceiptForm() {
  const router = useRouter();
  const { showToast } = useToast();

  // ── Inventory options ─────────────────────────────────────────────────────
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  useEffect(() => {
    getInventoryItems({ limit: 200, sortKey: "productName", sortDir: "asc" })
      .then((r) => setInventoryItems(r.data))
      .catch(() => {})
      .finally(() => setIsLoadingItems(false));
  }, []);

  // ── Form state ────────────────────────────────────────────────────────────
  const [loaiPhieu, setLoaiPhieu] = useState<LoaiXuat>("XuatHuy");
  const [lyDo, setLyDo] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { variantId: "", soLuong: 1, ghiChu: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Build Select options — loại trừ các variant đã được chọn ở dòng khác
  function buildSelectOptions(currentIdx: number): SelectOption[] {
    const selectedElsewhere = new Set(
      lineItems
        .filter((_, i) => i !== currentIdx)
        .map((li) => li.variantId)
        .filter(Boolean),
    );
    return inventoryItems.map((item) => ({
      value: item.variantId,
      label: item.productName,
      subLabel: item.variantName,
      description: item.sku,
      badge:
        item.alertLevel === "out_of_stock_inv"
          ? { text: "Hết hàng", variant: "error" as const }
          : item.alertLevel === "low_stock"
            ? { text: `${item.quantityOnHand} đơn vị`, variant: "warning" as const }
            : { text: `${item.quantityOnHand} đơn vị`, variant: "success" as const },
      disabled: item.quantityOnHand === 0 || selectedElsewhere.has(item.variantId),
    }));
  }

  // ── Line item handlers ────────────────────────────────────────────────────
  function addLine() {
    setLineItems((prev) => [...prev, { variantId: "", soLuong: 1, ghiChu: "" }]);
  }

  function removeLine(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, patch: Partial<LineItem>) {
    setLineItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    );
  }

  function getMaxQty(variantId: string): number {
    return inventoryItems.find((i) => i.variantId === variantId)?.quantityOnHand ?? 0;
  }

  function getItemInfo(variantId: string): InventoryItem | undefined {
    return inventoryItems.find((i) => i.variantId === variantId);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const canSubmit =
    lyDo.trim().length > 0 &&
    lineItems.length > 0 &&
    lineItems.every(
      (li) => li.variantId !== "" && li.soLuong >= 1 && li.soLuong <= getMaxQty(li.variantId),
    );

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const receipt = await createExportReceipt({
        loaiPhieu,
        lyDo: lyDo.trim(),
        ghiChu: ghiChu.trim() || undefined,
        items: lineItems.map((li) => ({
          phienBanId: Number(li.variantId),
          soLuong: li.soLuong,
          ghiChu: li.ghiChu.trim() || undefined,
        })),
      });
      showToast("Tạo phiếu xuất thành công.", "success");
      router.push(`/inventory/exports/${receipt.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tạo phiếu xuất thất bại.";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl space-y-5">

      {/* ── Loại xuất ─────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-secondary-700">1. Loại xuất</h2>
        <div className="space-y-2">
          {LOAI_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
                loaiPhieu === opt.value
                  ? "border-primary-400 bg-primary-50"
                  : "border-secondary-200 hover:bg-secondary-50",
              ].join(" ")}
            >
              <input
                type="radio"
                name="loaiPhieu"
                value={opt.value}
                checked={loaiPhieu === opt.value}
                onChange={() => setLoaiPhieu(opt.value)}
                className="mt-0.5 accent-primary-600"
              />
              <div>
                <p className="text-sm font-semibold text-secondary-800">{opt.label}</p>
                <p className="text-xs text-secondary-400">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* ── Danh sách sản phẩm xuất ───────────────────────────────────────── */}
      <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-secondary-700">2. Sản phẩm cần xuất</h2>

        <div className="space-y-3">
          {lineItems.map((line, idx) => {
            const info = getItemInfo(line.variantId);
            const maxQty = info?.quantityOnHand ?? 0;
            const remainingQty = info ? Math.max(0, maxQty - line.soLuong) : null;

            return (
              <div
                key={idx}
                className="rounded-lg border border-secondary-200 bg-secondary-50 p-3 space-y-3"
              >
                {/* Row header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-secondary-400 uppercase tracking-wide">
                    Dòng {idx + 1}
                  </span>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-error-600 hover:bg-error-50 transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      Xoá
                    </button>
                  )}
                </div>

                {/* Product select */}
                <Select
                  label="Sản phẩm"
                  placeholder={isLoadingItems ? "Đang tải..." : "Chọn sản phẩm..."}
                  options={buildSelectOptions(idx)}
                  value={line.variantId || undefined}
                  onChange={(v) => updateLine(idx, { variantId: v as string, soLuong: 1 })}
                  searchable
                  boldLabel
                  clearable
                  disabled={isLoadingItems}
                />

                {/* Quantity + preview */}
                {line.variantId && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={`Số lượng (tối đa: ${maxQty})`}
                      type="number"
                      min={1}
                      max={maxQty}
                      value={line.soLuong}
                      onChange={(e) => {
                        const n = Math.max(1, Math.min(parseInt(e.target.value, 10) || 1, maxQty));
                        updateLine(idx, { soLuong: n });
                      }}
                    />
                    <div
                      className={[
                        "rounded-xl border px-4 py-3 flex flex-col justify-center",
                        remainingQty === 0
                          ? "border-error-200 bg-error-50"
                          : "border-secondary-100 bg-white",
                      ].join(" ")}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">
                        Tồn sau xuất
                      </p>
                      <p
                        className={[
                          "text-xl font-bold",
                          remainingQty === 0 ? "text-error-700" : "text-secondary-900",
                        ].join(" ")}
                      >
                        {remainingQty}
                      </p>
                      {info && info.costPrice > 0 && (
                        <p className="text-xs text-secondary-400 mt-0.5">
                          GV TB: {formatVND(info.costPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Ghi chú dòng (optional) */}
                {line.variantId && (
                  <Input
                    label="Ghi chú dòng (không bắt buộc)"
                    value={line.ghiChu}
                    onChange={(e) => updateLine(idx, { ghiChu: e.target.value })}
                    placeholder="VD: Hỏng màn hình…"
                  />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addLine}
          className="flex items-center gap-2 rounded-lg border border-dashed border-secondary-300 px-4 py-2.5 text-sm text-secondary-500 hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center"
        >
          <PlusIcon className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </section>

      {/* ── Thông tin phiếu ───────────────────────────────────────────────── */}
      <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-secondary-700">3. Thông tin phiếu</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700">
            Lý do <span className="text-error-600" aria-hidden="true">*</span>
          </label>
          <Textarea
            rows={2}
            value={lyDo}
            onChange={(e) => setLyDo(e.target.value)}
            placeholder="VD: Hư hỏng khi vận chuyển, kiểm kê tháng 5/2026…"
            className="w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            showCharCount
            maxCharCount={500}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700">
            Ghi chú phiếu
          </label>
          <Textarea
            rows={2}
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            placeholder="Ghi chú thêm (không bắt buộc)"
            className="w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            showCharCount
            maxCharCount={250}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-secondary-100 pt-4">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            isLoading={isSubmitting}
          >
            Tạo phiếu xuất
          </Button>
        </div>
      </section>
    </div>
  );
}
