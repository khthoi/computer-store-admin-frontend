"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, ArchiveBoxIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Textarea } from "@/src/components/ui/Textarea";
import { useToast } from "@/src/components/ui/Toast";
import { DataTable, type ColumnDef } from "@/src/components/admin/DataTable";
import { receiveStockIn, updateStockInStatus, completeStockIn, resolvePartialReceipt } from "@/src/services/inventory.service";
import { formatVND } from "@/src/lib/format";
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { StockBatch, StockInLineItem, StockInRecord } from "@/src/types/inventory.types";

type LineItemRow = StockInLineItem & Record<string, unknown>;

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

function BatchProgressBar({ remaining, imported }: { remaining: number; imported: number }) {
  const pct = imported > 0 ? Math.round((remaining / imported) * 100) : 0;
  const isEmpty = remaining === 0;
  const isLow = !isEmpty && remaining < imported * 0.2;
  const barColor = isEmpty ? "bg-error-400" : isLow ? "bg-warning-400" : "bg-success-400";
  const textColor = isEmpty ? "text-error-600" : isLow ? "text-warning-700" : "text-success-700";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1">
        <span className={`tabular-nums text-sm font-bold ${textColor}`}>{remaining}</span>
        <span className="text-xs text-secondary-400">/ {imported}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary-100">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-secondary-400">{pct}% còn lại</span>
    </div>
  );
}

const BATCH_STATUS_CONFIG = {
  con_hang: { label: 'Còn hàng', variant: 'success' as const },
  da_het:   { label: 'Đã hết',   variant: 'error'   as const },
};

function BatchCard({ batch, lineItem }: { batch: StockBatch; lineItem: StockInLineItem }) {
  const status = batch.trangThai ?? 'con_hang';
  const statusCfg = BATCH_STATUS_CONFIG[status] ?? BATCH_STATUS_CONFIG['con_hang'];
  return (
    <div className="rounded-xl border border-secondary-100 bg-secondary-50/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-50 px-2.5 py-1 font-mono text-xs font-semibold text-primary-700">
          <ArchiveBoxIcon className="h-3.5 w-3.5" />
          {batch.maLo}
        </span>
        <div className="flex items-center gap-2">
          <Badge variant={statusCfg.variant} size="sm">{statusCfg.label}</Badge>
          <span className="text-xs text-secondary-400">{formatDate(batch.importedAt)}</span>
        </div>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-secondary-400">Giá nhập</p>
          <p className="text-sm font-semibold text-secondary-900">{formatVND(batch.costPrice)}</p>
        </div>
        <div>
          <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-secondary-400">Giá bán</p>
          <p className="text-sm font-semibold text-secondary-900">
            {lineItem.sellingPrice ? formatVND(lineItem.sellingPrice) : <span className="text-secondary-400">—</span>}
          </p>
        </div>
      </div>
      <div className="mb-3">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-secondary-400">Tồn kho lô</p>
        <BatchProgressBar remaining={batch.quantityRemaining} imported={batch.quantityImported} />
      </div>
      {batch.note && (
        <Tooltip content={batch.note} multiline maxWidth="260px" placement="top">
          <p className="block max-w-[200px] truncate text-xs italic text-secondary-500">{batch.note}</p>
        </Tooltip>
      )}
    </div>
  );
}

export function StockInDetailClient({
  initialRecord,
  initialBatches = {},
}: {
  initialRecord: StockInRecord;
  initialBatches?: Record<string, StockBatch[]>;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [record, setRecord] = useState(initialRecord);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>(
    Object.fromEntries(record.lineItems.map((l) => [l.id, l.quantityReceived]))
  );
  const [lineItemNotes, setLineItemNotes] = useState<Record<string, string>>(
    Object.fromEntries(record.lineItems.map((l) => [l.id, l.note ?? ""]))
  );
  const [lineItemDamaged, setLineItemDamaged] = useState<Record<string, number>>(
    Object.fromEntries(record.lineItems.map((l) => [l.id, l.quantityDamaged ?? 0]))
  );
  const [isSaving, setIsSaving] = useState(false);

  const canReceive = record.status === "pending";
  const canComplete = record.status === "partial" && !record.successorId;
  const canResolve = record.status === "partial" && !record.successorId;
  const canCancel = record.status === "pending";

  const hasAllNotes = useMemo(
    () => record.lineItems.every((li) => (lineItemNotes[li.id] ?? "").trim().length > 0),
    [record.lineItems, lineItemNotes]
  );

  const shortItemCount = useMemo(
    () => record.lineItems.filter((li) => {
      const received = receivedQtys[li.id] ?? 0;
      const damaged = lineItemDamaged[li.id] ?? 0;
      return (received - damaged) < li.quantityOrdered;
    }).length,
    [record.lineItems, receivedQtys, lineItemDamaged]
  );

  async function handleReceive() {
    setIsSaving(true);
    try {
      const updated = await receiveStockIn(record.id, receivedQtys, record.lineItems, lineItemNotes, lineItemDamaged);
      setRecord(updated);
      showToast("Đã nhận hàng và cập nhật tồn kho.", "success");
    } catch {
      showToast("Nhận hàng thất bại.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleComplete() {
    setIsSaving(true);
    try {
      const updated = await completeStockIn(record.id);
      setRecord(updated);
      showToast("Đã duyệt hoàn tất phiếu nhập.", "success");
    } catch {
      showToast("Duyệt hoàn tất thất bại.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancel() {
    setIsSaving(true);
    try {
      const updated = await updateStockInStatus(record.id, "cancelled");
      setRecord(updated);
      showToast("Đã huỷ phiếu nhập.", "success");
    } catch {
      showToast("Huỷ phiếu thất bại.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResolve() {
    setIsSaving(true);
    try {
      const newReceipt = await resolvePartialReceipt(record.id);
      showToast(`Đã tạo phiếu bổ sung ${newReceipt.receiptCode}.`, "success");
      router.push(`/inventory/stock-in/${newReceipt.id}`);
    } catch {
      showToast("Tạo phiếu bổ sung thất bại.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  const lineItems = record.lineItems as LineItemRow[];

  const columns = useMemo<ColumnDef<LineItemRow>[]>(() => [
    {
      key: "productName",
      header: "Sản phẩm / SKU",
      render: (_, row) => (
        <div>
          <Tooltip content={row.productName as string} placement="top">
            <Link
              href={`/products/${row.productId as string}`}
              className="inline-block max-w-[200px] truncate font-medium text-primary-600 hover:underline"
            >
              {row.productName as string}
            </Link>
          </Tooltip>
          <div>
            <Tooltip content={row.variantName as string} placement="top">
              <span className="inline-block max-w-[200px] truncate">
                <Link
                  href={`/products/${row.productId as string}/variants/${row.variantId as string}`}
                  className="text-xs text-secondary-500 hover:text-primary-500 hover:underline"
                >
                  {row.variantName as string}
                </Link>
              </span>
            </Tooltip>
          </div>
          <p className="font-mono text-xs text-secondary-400">{row.sku as string}</p>
        </div>
      ),
    },
    {
      key: "quantityOrdered",
      header: "SL đặt",
      align: "center",
    },
    {
      key: "quantityReceived",
      header: "Đã nhận",
      align: "center",
      render: (_, row) => {
        if (canReceive) {
          return (
            <input
              type="number"
              min={0}
              max={row.quantityOrdered as number}
              value={receivedQtys[row.id as string] ?? 0}
              onChange={(e) =>
                setReceivedQtys((prev) => ({
                  ...prev,
                  [row.id as string]: Math.min(
                    row.quantityOrdered as number,
                    Math.max(0, parseInt(e.target.value, 10) || 0)
                  ),
                }))
              }
              className="w-20 rounded-lg border border-secondary-300 px-2 py-1 text-center text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          );
        }
        const received = row.quantityReceived as number;
        const ordered = row.quantityOrdered as number;
        return (
          <span className={[
            "font-semibold",
            received >= ordered ? "text-success-700" : received > 0 ? "text-warning-700" : "text-secondary-500",
          ].join(" ")}>
            {received}
          </span>
        );
      },
    },
    {
      key: "quantityDamaged",
      header: "Hàng hỏng",
      align: "center",
      render: (_, row) => {
        const id = row.id as string;
        if (canReceive) {
          const maxDamaged = receivedQtys[id] ?? 0;
          return (
            <input
              type="number"
              min={0}
              max={maxDamaged}
              value={lineItemDamaged[id] ?? 0}
              onChange={(e) =>
                setLineItemDamaged((prev) => ({
                  ...prev,
                  [id]: Math.min(maxDamaged, Math.max(0, parseInt(e.target.value, 10) || 0)),
                }))
              }
              className="w-20 rounded-lg border border-secondary-300 px-2 py-1 text-center text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          );
        }
        const damaged = (row.quantityDamaged as number) ?? 0;
        if (damaged === 0) return <span className="text-secondary-300">—</span>;
        return <Badge variant="error" size="sm">{damaged}</Badge>;
      },
    },
    {
      key: "_quantityShort",
      header: "Hàng thiếu",
      align: "center",
      render: (_, row) => {
        const id = row.id as string;
        const ordered = row.quantityOrdered as number;
        const received = canReceive ? (receivedQtys[id] ?? 0) : (row.quantityReceived as number);
        const short = Math.max(0, ordered - received);
        if (short === 0) return <span className="text-secondary-300">—</span>;
        return <Badge variant="warning" size="sm">{short}</Badge>;
      },
    },
    {
      key: "costPrice",
      header: "Giá nhập",
      align: "right",
      render: (v) => <span className="whitespace-nowrap">{formatVND(v as number)}</span>,
    },
    {
      key: "sellingPrice",
      header: "Giá bán",
      align: "right",
      render: (v) => v ? <span className="whitespace-nowrap">{formatVND(v as number)}</span> : <span className="text-secondary-400">—</span>,
    },
    {
      key: "lineTotal",
      header: "Tổng cộng",
      align: "right",
      render: (_, row) => {
        const id = row.id as string;
        const costPrice = row.costPrice as number;
        const received = canReceive ? (receivedQtys[id] ?? 0) : (row.quantityReceived as number);
        const damaged = canReceive ? (lineItemDamaged[id] ?? 0) : ((row.quantityDamaged as number) ?? 0);
        const goodQty = Math.max(0, received - damaged);
        return (
          <span className="whitespace-nowrap font-semibold text-secondary-900">
            {formatVND(costPrice * goodQty)}
          </span>
        );
      },
    },
  ], [canReceive, receivedQtys, lineItemDamaged]);

  const getSubRows = useCallback((row: LineItemRow) => {
    const id = row.id as string;
    if (canReceive) return [{ _noteRow: true, _id: id }];
    const note = lineItemNotes[id] ?? (row.note as string | undefined) ?? "";
    return note ? [{ _noteRow: true, _id: id }] : [];
  }, [canReceive, lineItemNotes]);

  const renderSubRow = useCallback((_: Record<string, unknown>, parentRow: LineItemRow) => {
    const id = parentRow.id as string;
    const note = lineItemNotes[id] ?? "";
    return (
      <tr className="bg-secondary-50/40">
        <td colSpan={20} className="px-4 pb-3 pt-1">
          {canReceive ? (
            <Textarea
              size="sm"
              label="Ghi chú kiểm kê"
              placeholder="Nhập ghi chú…"
              value={note}
              onChange={(e) => setLineItemNotes((prev) => ({ ...prev, [id]: e.target.value }))}
              autoResize
              maxCharCount={500}
              required
              showCharCount
              rows={2}
              className="!min-h-[60px]"
            />
          ) : (
            <p className="text-sm italic text-secondary-500">{note}</p>
          )}
        </td>
      </tr>
    );
  }, [canReceive, lineItemNotes]);

  const liveTotal = useMemo(() => {
    if (!canReceive) return record.totalCost;
    return record.lineItems.reduce((sum, li) => {
      const received = receivedQtys[li.id] ?? 0;
      const damaged = lineItemDamaged[li.id] ?? 0;
      return sum + li.costPrice * Math.max(0, received - damaged);
    }, 0);
  }, [canReceive, record.lineItems, record.totalCost, receivedQtys, lineItemDamaged]);

  const hasBatches = Object.values(initialBatches).some((arr) => arr.length > 0);

  return (
    <div className="space-y-6 p-6">
      {/* Banner liên kết phiếu tiền nhiệm / kế tiếp */}
      {(record.predecessorId || record.successorId) && (
        <div className="flex flex-col gap-2 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3">
          {record.predecessorId && (
            <div className="flex items-center gap-2 text-sm text-primary-700">
              <ArrowRightIcon className="h-4 w-4 shrink-0 rotate-180" />
              <span>Phiếu này bổ sung cho</span>
              <Link
                href={`/inventory/stock-in/${record.predecessorId}`}
                className="font-mono font-semibold underline underline-offset-2 hover:text-primary-900"
              >
                {record.predecessorCode ?? record.predecessorId}
              </Link>
            </div>
          )}
          {record.successorId && (
            <div className="flex items-center gap-2 text-sm text-primary-700">
              <ArrowRightIcon className="h-4 w-4 shrink-0" />
              <span>Đã tạo phiếu bổ sung</span>
              <Link
                href={`/inventory/stock-in/${record.successorId}`}
                className="font-mono font-semibold underline underline-offset-2 hover:text-primary-900"
              >
                {record.successorCode ?? record.successorId}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/inventory/stock-in" className="transition-colors hover:text-secondary-700">
              Nhập hàng
            </Link>
            <span aria-hidden="true">›</span>
            <span className="font-mono text-secondary-600">{record.receiptCode}</span>
          </nav>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900">{record.receiptCode}</h1>
            <StatusBadge status={record.status} />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {canReceive && (
            <p className={`text-xs font-medium ${shortItemCount > 0 ? "text-warning-600" : "text-success-600"}`}>
              {shortItemCount > 0
                ? `${shortItemCount} mặt hàng thiếu → sẽ chuyển sang Tiếp nhận một phần`
                : "Đủ số lượng → phiếu sẽ được duyệt hoàn toàn"}
            </p>
          )}
          <div className="flex gap-2">
            <Button href="/inventory/stock-in" variant="secondary" leftIcon={<ArrowLeftIcon />}>
              Quay lại
            </Button>
            {canCancel && (
              <Button variant="danger" onClick={handleCancel} disabled={isSaving} isLoading={isSaving}>
                Huỷ phiếu
              </Button>
            )}
            {canReceive && (
              <Button variant="primary" onClick={handleReceive} disabled={isSaving || !hasAllNotes} isLoading={isSaving}>
                Xác nhận nhận hàng
              </Button>
            )}
            {canResolve && (
              <Button variant="warning" onClick={handleResolve} disabled={isSaving} isLoading={isSaving}>
                Giải quyết phiếu thiếu
              </Button>
            )}
            {canComplete && (
              <Button variant="primary" onClick={handleComplete} disabled={isSaving} isLoading={isSaving}>
                Duyệt hoàn tất
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Mã phiếu</p>
            <p className="mt-1 font-mono text-sm font-medium text-secondary-800">{record.receiptCode}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Nhà cung cấp</p>
            <p className="mt-1 text-sm font-medium text-secondary-800">{record.supplierName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Ngày dự kiến</p>
            <p className="mt-1 text-sm text-secondary-800">{formatDate(record.expectedDate)}</p>
          </div>
          {record.receivedDate && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Ngày nhận</p>
              <p className="mt-1 text-sm text-secondary-800">{formatDate(record.receivedDate)}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Tạo bởi</p>
            <p className="mt-1 text-sm text-secondary-800">
              {record.createdByCode ? (
                <Tooltip content={`Xem hồ sơ: ${record.createdBy}`} placement="top">
                  <Link
                    href={`/employees/${record.createdByCode}`}
                    className="font-medium text-primary-600 hover:underline"
                  >
                    {record.createdBy}
                  </Link>
                </Tooltip>
              ) : (
                record.createdBy
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Tổng chi phí</p>
            <p className="mt-1 text-sm font-semibold text-secondary-900">{formatVND(liveTotal)}</p>
          </div>
          {record.note && (
            <div className="sm:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Ghi chú phiếu</p>
              <p className="mt-1 text-sm text-secondary-700">{record.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Line items */}
      <div className="overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm">
        <div className="border-b border-secondary-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-secondary-900">Chi tiết các mặt hàng</h2>
          {canReceive && (
            <p className="mt-0.5 text-xs text-secondary-500">
              Nhập số lượng thực nhận, số lượng hư hỏng và ghi chú cho từng mặt hàng trước khi xác nhận.
            </p>
          )}
        </div>
        <DataTable
          data={lineItems}
          columns={columns}
          keyField="id"
          className="!rounded-none !border-0 !shadow-none"
          page={1}
          pageSize={lineItems.length || 10}
          totalRows={lineItems.length}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          hidePagination
          hideToolbar
          emptyMessage="Không có mặt hàng nào."
          getSubRows={getSubRows}
          renderSubRow={renderSubRow}
          expandedByDefault
        />
        <div className="flex items-center justify-end gap-6 border-t-2 border-secondary-200 px-6 py-3">
          <span className="text-sm font-semibold text-secondary-700">Tổng chi phí</span>
          <span className="text-base font-bold text-secondary-900">{formatVND(liveTotal)}</span>
        </div>
      </div>

      {/* Batches */}
      {(record.status === "received" || record.status === "partial") && (
        <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-secondary-900">Lô hàng nhập</h2>
            <p className="mt-0.5 text-xs text-secondary-500">
              Các lô hàng được tạo khi phiếu nhập được duyệt.
            </p>
          </div>

          {hasBatches ? (
            <div className="space-y-6">
              {record.lineItems.map((li) => {
                const batches = initialBatches[li.variantId] ?? [];
                return (
                  <div key={li.id}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Tooltip content={li.productName} placement="top">
                            <Link
                              href={`/products/${li.productId}`}
                              className="truncate font-semibold text-secondary-900 hover:text-primary-600 hover:underline"
                            >
                              {li.productName}
                            </Link>
                          </Tooltip>
                          {li.quantityDamaged > 0 && (
                            <Badge variant="error" size="sm">{li.quantityDamaged} hỏng</Badge>
                          )}
                          {li.quantityShort > 0 && (
                            <Badge variant="warning" size="sm">{li.quantityShort} thiếu</Badge>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Tooltip content={li.variantName} placement="top">
                            <Link
                              href={`/products/${li.productId}/variants/${li.variantId}`}
                              className="text-sm text-secondary-500 hover:text-primary-500 hover:underline"
                            >
                              {li.variantName}
                            </Link>
                          </Tooltip>
                          <span className="text-secondary-300">·</span>
                          <span className="font-mono text-xs text-secondary-400">{li.sku}</span>
                        </div>
                      </div>
                      <Link
                        href={`/inventory/items/${li.variantId}/batches`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-xs font-medium text-secondary-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                      >
                        <ArchiveBoxIcon className="h-3.5 w-3.5" />
                        Xem tất cả lô hàng
                      </Link>
                    </div>

                    {batches.length > 0 ? (
                      <div className="grid grid-cols-7 gap-3">
                        {batches.map((batch) => (
                          <div key={batch.id} className="col-span-6">
                            <BatchCard batch={batch} lineItem={li} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-lg border border-dashed border-secondary-200 py-4 text-center text-sm text-secondary-400">
                        Chưa có lô hàng nào được ghi nhận.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-secondary-200 py-8 text-center">
              <ArchiveBoxIcon className="mx-auto mb-2 h-8 w-8 text-secondary-300" />
              <p className="text-sm text-secondary-400">Chưa có lô hàng nào được ghi nhận.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
