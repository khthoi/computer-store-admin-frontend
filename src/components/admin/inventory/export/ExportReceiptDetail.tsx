"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { formatVND } from "@/src/lib/format";
import type { ExportReceiptDetailDto, LoaiPhieuXuat } from "@/src/types/inventory.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTE_MAX = 40;

const BADGE: Record<LoaiPhieuXuat, { label: string; cls: string }> = {
  XuatHuy:       { label: "Huỷ hàng hỏng", cls: "bg-error-100 text-error-700" },
  XuatDieuChinh: { label: "Điều chỉnh",    cls: "bg-warning-100 text-warning-700" },
  XuatNoiBo:     { label: "Xuất nội bộ",   cls: "bg-info-100 text-info-700" },
  XuatBan:       { label: "Xuất bán",      cls: "bg-success-100 text-success-700" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  receipt: ExportReceiptDetailDto;
}

export function ExportReceiptDetail({ receipt }: Props) {
  const badge =
    BADGE[receipt.loaiPhieu] ?? { label: receipt.loaiPhieu, cls: "bg-secondary-100 text-secondary-600" };

  const hasAnyNote = receipt.lineItems.some((item) => item.note);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-secondary-900">{receipt.receiptCode}</h1>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-secondary-500">
            {new Date(receipt.createdAt).toLocaleString("vi-VN", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-secondary-400">Tổng giá vốn</p>
          <p className="text-2xl font-bold text-secondary-900">{formatVND(receipt.tongGiaVon)}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="rounded-xl border border-secondary-200 bg-white p-5 space-y-3">
        <MetaRow label="Nhân viên xuất" value={`${receipt.createdBy}${receipt.createdByCode ? ` (${receipt.createdByCode})` : ""}`} />
        <MetaRow label="Lý do" value={receipt.lyDo} />
        {receipt.ghiChu && <MetaRow label="Ghi chú phiếu" value={receipt.ghiChu} />}
        <MetaRow label="Số mặt hàng" value={`${receipt.itemCount} mặt hàng · ${receipt.totalQty} units`} />
      </div>

      {/* Line items */}
      <div className="rounded-xl border border-secondary-200 bg-white overflow-hidden">
        <div className="border-b border-secondary-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-secondary-700">Chi tiết hàng xuất</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary-100 bg-secondary-50 text-xs font-semibold uppercase tracking-wide text-secondary-500">
              <th className="px-5 py-3 text-left">Sản phẩm</th>
              <th className="px-5 py-3 text-right">SL</th>
              <th className="px-5 py-3 text-right">Giá vốn TB</th>
              <th className="px-5 py-3 text-right">Tổng GV</th>
              {hasAnyNote && <th className="px-5 py-3 text-left">Ghi chú</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {receipt.lineItems.map((item) => (
              <Fragment key={item.id}>
                <tr className="bg-white hover:bg-secondary-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-semibold text-primary-600 hover:underline"
                    >
                      {item.productName}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Tooltip content={item.variantName} placement="top">
                        <Link
                          href={`/products/${item.productId}/variants/${item.variantId}`}
                          className="text-secondary-500 hover:text-primary-500 hover:underline"
                        >
                          {item.variantName}
                        </Link>
                      </Tooltip>
                      <span className="text-secondary-300">·</span>
                      <span className="font-mono text-secondary-400">{item.sku}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold">{item.quantityExported}</td>
                  <td className="px-5 py-3 text-right text-secondary-600">{formatVND(item.costPrice)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatVND(item.totalCost)}</td>
                  {hasAnyNote && (
                    <td className="px-5 py-3">
                      {item.note ? (
                        item.note.length > NOTE_MAX ? (
                          <Tooltip
                            content={item.note}
                            placement="top"
                            multiline
                            maxWidth="320px"
                          >
                            <span className="cursor-default text-xs text-secondary-500">
                              {truncate(item.note, NOTE_MAX)}
                            </span>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-secondary-500">{item.note}</span>
                        )
                      ) : (
                        <span className="text-xs text-secondary-300">—</span>
                      )}
                    </td>
                  )}
                </tr>

                {item.batchesDeducted.length > 0 && (
                  <tr className="bg-secondary-50/40">
                    <td colSpan={hasAnyNote ? 5 : 4} className="px-5 pb-3 pt-0">
                      <div className="flex flex-wrap gap-2 border-l-2 border-secondary-200 pl-4 pt-2">
                        {item.batchesDeducted.map((b) => (
                          <Link
                            key={b.loId}
                            href={`/inventory/items/${item.variantId}/batches`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-secondary-200 bg-white px-2.5 py-1 text-xs font-medium text-secondary-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                          >
                            <ArchiveBoxIcon className="h-3.5 w-3.5 text-secondary-400" />
                            <span className="font-mono font-semibold">{b.maLo || `Lô #${b.loId}`}</span>
                            <span className="text-secondary-300">·</span>
                            <span>{b.soLuong} units</span>
                            <span className="text-secondary-300">×</span>
                            <span className="text-secondary-600">{formatVND(b.giaVon)}</span>
                          </Link>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-secondary-200 bg-secondary-50">
              <td
                colSpan={hasAnyNote ? 4 : 3}
                className="px-5 py-3 text-right text-sm font-semibold text-secondary-700"
              >
                Tổng cộng
              </td>
              <td className="px-5 py-3 text-right text-base font-bold text-secondary-900">
                {formatVND(receipt.tongGiaVon)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-36 shrink-0 text-secondary-400">{label}</span>
      <span className="text-secondary-900">{value}</span>
    </div>
  );
}
