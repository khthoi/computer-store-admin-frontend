export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArchiveBoxIcon, CubeIcon, TagIcon } from "@heroicons/react/24/outline";
import { getBatchesByVariant } from "@/src/services/inventory.service";
import { BatchTable } from "@/src/components/admin/inventory/BatchTable";
import { Badge } from "@/src/components/ui/Badge";
import { formatVND } from "@/src/lib/format";

export default async function BatchesPage({ params }: { params: Promise<{ variantId: string }> }) {
  const { variantId } = await params;
  const batches = await getBatchesByVariant(variantId);

  const first = batches[0];
  const productId = first?.productId;
  const productName = first?.productName;
  const variantName = first?.variantName;
  const sku = first?.sku;
  const sellingPrice = first?.sellingPrice;
  const thumbnailUrl = first?.thumbnailUrl;

  const totalImported = batches.reduce((s, b) => s + b.quantityImported, 0);
  const totalRemaining = batches.reduce((s, b) => s + b.quantityRemaining, 0);
  const activeBatches = batches.filter((b) => b.quantityRemaining > 0).length;
  const pct = totalImported > 0 ? Math.round((totalRemaining / totalImported) * 100) : 0;

  // FIFO batch = oldest with remaining stock
  const fifoBatch = batches.find((b) => b.isNextFifo);
  const hasMarkup = fifoBatch != null && sellingPrice != null && sellingPrice > 0 && fifoBatch.costPrice > 0;
  const fifoProfit = hasMarkup ? sellingPrice! - fifoBatch!.costPrice : 0;
  const fifoMarkup = hasMarkup && fifoBatch!.costPrice > 0
    ? Math.round((fifoProfit / fifoBatch!.costPrice) * 1000) / 10
    : 0;
  const markupBadge = fifoMarkup >= 20 ? "success" : fifoMarkup >= 10 ? "warning" : "error";

  const hasVariantInfo = !!(productName || variantName || sku);

  return (
    <div className="space-y-6 p-6">
      {/* Variant info card */}
      {hasVariantInfo && (
        <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
            {/* Thumbnail */}
            <div className="shrink-0">
              {thumbnailUrl ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-secondary-100 bg-secondary-50">
                  <Image
                    src={thumbnailUrl}
                    alt={variantName ?? ""}
                    fill
                    className="object-contain p-1"
                    sizes="96px"
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-secondary-100 bg-secondary-50">
                  <CubeIcon className="h-10 w-10 text-secondary-300" />
                </div>
              )}
            </div>

            {/* Names + meta */}
            <div className="min-w-0 flex-1">
              {productName && productId && (
                <Link
                  href={`/products/${productId}`}
                  className="text-xs font-medium text-secondary-400 transition-colors hover:text-primary-600 hover:underline"
                >
                  {productName}
                </Link>
              )}
              <h1 className="mt-0.5 text-xl font-bold text-secondary-900">
                {productId ? (
                  <Link
                    href={`/products/${productId}/variants/${variantId}`}
                    className="hover:text-primary-600 hover:underline"
                  >
                    {variantName ?? `Phiên bản #${variantId}`}
                  </Link>
                ) : (
                  variantName ?? `Phiên bản #${variantId}`
                )}
              </h1>
              {sku && (
                <p className="mt-1 font-mono text-sm text-secondary-500">{sku}</p>
              )}
              {sellingPrice != null && sellingPrice > 0 && (
                <div className="mt-3 flex items-center gap-1.5">
                  <TagIcon className="h-3.5 w-3.5 text-secondary-400" />
                  <span className="text-sm font-semibold text-secondary-900">{formatVND(sellingPrice)}</span>
                  <span className="text-xs text-secondary-400">giá bán hiện tại</span>
                </div>
              )}
            </div>

            {/* Summary stats */}
            <div className="flex shrink-0 flex-col gap-3 sm:items-end">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:text-right">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-secondary-400">Tổng nhập</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-secondary-900">{totalImported}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-secondary-400">Còn lại</p>
                  <p className={`mt-0.5 text-lg font-bold tabular-nums ${
                    totalRemaining === 0 ? "text-error-600" : totalRemaining < totalImported * 0.2 ? "text-warning-700" : "text-success-700"
                  }`}>
                    {totalRemaining}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-secondary-400">Lô hoạt động</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-secondary-900">{activeBatches}</p>
                </div>
              </div>
              <div className="hidden w-40 sm:block">
                <div className="mb-1 flex items-center justify-between text-xs text-secondary-400">
                  <span>Tổng tồn</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      totalRemaining === 0 ? "bg-error-400" : totalRemaining < totalImported * 0.2 ? "bg-warning-400" : "bg-success-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FIFO markup panel */}
          {hasMarkup && (
            <div className="border-t border-secondary-100 bg-secondary-50/60 px-6 py-4">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-secondary-400">
                    Lãi dự kiến theo FIFO
                  </p>
                  <p className="mt-0.5 text-xs text-secondary-400">
                    Tính theo lô{" "}
                    <span className="font-mono font-semibold text-secondary-600">{fifoBatch!.maLo}</span>
                    {" "}— lô cũ nhất còn hàng, sẽ được xuất trước
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-xs text-secondary-400">Giá vốn lô</p>
                    <p className="mt-0.5 text-sm font-semibold text-secondary-700">{formatVND(fifoBatch!.costPrice)}</p>
                  </div>
                  <div className="text-secondary-300">→</div>
                  <div>
                    <p className="text-xs text-secondary-400">Giá bán</p>
                    <p className="mt-0.5 text-sm font-semibold text-secondary-700">{formatVND(sellingPrice!)}</p>
                  </div>
                  <div className="text-secondary-300">=</div>
                  <div>
                    <p className="text-xs text-secondary-400">Lãi / sản phẩm</p>
                    <div className="mt-0.5 flex items-baseline gap-2">
                      <span className={`text-sm font-bold ${fifoProfit >= 0 ? "text-success-700" : "text-error-600"}`}>
                        {fifoProfit >= 0 ? "+" : ""}{formatVND(fifoProfit)}
                      </span>
                      <Badge variant={markupBadge} size="sm">{fifoMarkup}%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-secondary-900">
            <ArchiveBoxIcon className="h-5 w-5 text-secondary-400" />
            Danh sách lô hàng
            <Badge variant="default" size="sm">{batches.length}</Badge>
          </h2>
          <p className="mt-0.5 text-sm text-secondary-500">
            Sắp xếp theo thứ tự nhập — lô cũ nhất được xuất trước (FIFO).
          </p>
        </div>
        <Link
          href="/inventory/items"
          className="inline-flex items-center gap-1.5 text-sm text-secondary-500 transition-colors hover:text-secondary-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm">
        <BatchTable batches={batches} />
      </div>
    </div>
  );
}
