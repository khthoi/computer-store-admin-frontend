"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { useToast } from "@/src/components/ui/Toast";
import { formatVND } from "@/src/lib/format";
import {
  updateReturnStatus,
  getReturnAssets,
  confirmReceived,
  type ReturnAssetItem,
  type ConfirmReceivedDto,
} from "@/src/services/returns.service";
import { getVariantStockLevel, getBatchesByVariant } from "@/src/services/inventory.service";
import type { StockBatch, ReturnRequest } from "@/src/types/inventory.types";
import { ProductImageGallery, type GalleryMedia } from "@/src/components/product/ProductImageGallery";
import { InspectionPanel, InspectionEvidencePanel, ConfirmInspectionPanel } from "./ReturnInspectionSection";
import {
  RefundPanel,
  ExchangePanel,
  WarrantyPanel,
  DefectiveHandlingPanel,
  CompleteReusePanel,
  RejectGoodsPanel,
} from "./ReturnResolutionPanels";
import { ApproveDialog, type ItemStockInfo } from "./ReturnApproveDialog";
import { InlineStockPanel } from "./ReturnInlineStock";
import { ConfirmReceivedModal } from "./ReturnConfirmReceivedModal";

// ─── Helpers / label maps ─────────────────────────────────────────────────────

function formatDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${time} ${date}`;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  DoiHang: "Đổi hàng",
  TraHang: "Trả hàng",
  BaoHanh: "Bảo hành",
};

const RESOLUTION_LABELS: Record<string, string> = {
  GiaoHangMoi: "Giao hàng mới",
  HoanTien:    "Hoàn tiền",
  BaoHanh:     "Bảo hành",
};

const REASON_LABELS: Record<string, string> = {
  LoiNhaSanXuat:      "Lỗi từ nhà sản xuất",
  GuiNhamHang:        "Store gửi nhầm hàng",
  HuHongKhiVanChuyen: "Hư hỏng khi vận chuyển",
  ThieuPhuKien:       "Thiếu phụ kiện trong hộp",
  KhongDungMoTa:      "Sản phẩm không đúng mô tả",
  DoiYKien:           "Khách đổi ý",
  KhongTuongThich:    "Không tương thích thiết bị",
  HieuNangKemHon:     "Hiệu năng kém hơn mô tả",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function ReturnDetailClient({
  initialReturn,
  backHref = "/orders/returns",
}: {
  initialReturn: ReturnRequest;
  backHref?: string;
}) {
  const { showToast } = useToast();
  const [ret, setRet]                                   = useState(initialReturn);
  const [isSaving, setIsSaving]                         = useState(false);
  const [approveOpen, setApproveOpen]                   = useState(false);
  const [confirmReceivedOpen, setConfirmReceivedOpen]   = useState(false);
  const [assets, setAssets]                             = useState<ReturnAssetItem[]>([]);
  const [goodsAccepted, setGoodsAccepted]               = useState(false);
  const [lineStockMap, setLineStockMap]                 = useState<Record<string, ItemStockInfo>>({});
  const [lineStockLoading, setLineStockLoading]         = useState(false);

  useEffect(() => {
    getReturnAssets(ret.id).then(setAssets).catch(() => {});
  }, [ret.id]);

  // Fetch stock info per line item only for DoiHang requests
  useEffect(() => {
    if (ret.requestType !== "DoiHang" || !ret.lineItems.length) return;
    setLineStockLoading(true);
    Promise.all(
      ret.lineItems.map(async (item) => {
        const [stockLevel, batches] = await Promise.all([
          getVariantStockLevel(item.variantId).catch(() => null),
          getBatchesByVariant(item.variantId).catch((): StockBatch[] => []),
        ]);
        return { variantId: item.variantId, stockLevel, batches };
      }),
    ).then((results) => {
      const map: Record<string, ItemStockInfo> = {};
      for (const r of results) map[r.variantId] = { stockLevel: r.stockLevel, batches: r.batches };
      setLineStockMap(map);
    }).finally(() => setLineStockLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ret.id]);

  const canApprove       = ret.status === "ChoDuyet";
  const canReject        = ret.status === "ChoDuyet";
  const canMarkReceived  = ret.status === "DaDuyet";
  const isDaKiemTra      = ret.status === "DaKiemTra";
  const isDangXuLy       = ret.status === "DangXuLy";
  const isTuChoiNhanHang = ret.status === "TuChoiNhanHang";
  const showResolutionPanel =
    (isDangXuLy || (isDaKiemTra && goodsAccepted)) &&
    ret.resolution &&
    ret.status !== "HoanThanh" &&
    ret.status !== "TuChoi";

  async function reload() {
    window.location.reload();
  }

  async function handleStatus(status: ReturnRequest["status"]) {
    setIsSaving(true);
    try {
      const updated = await updateReturnStatus(ret.id, { status });
      setRet((prev) => ({ ...prev, ...updated, lineItems: updated.lineItems.length ? updated.lineItems : prev.lineItems }));
      showToast("Đã cập nhật trạng thái.", "success");
    } catch {
      showToast("Không thể cập nhật trạng thái.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleApprove(resolution: string) {
    setIsSaving(true);
    try {
      const updated = await updateReturnStatus(ret.id, { status: "DaDuyet", resolution });
      setRet((prev) => ({ ...prev, ...updated, lineItems: updated.lineItems.length ? updated.lineItems : prev.lineItems }));
      showToast("Đã duyệt yêu cầu.", "success");
    } catch {
      showToast("Không thể duyệt.", "error");
    } finally {
      setIsSaving(false);
      setApproveOpen(false);
    }
  }

  async function handleConfirmReceived(dto: ConfirmReceivedDto) {
    setIsSaving(true);
    try {
      const updated = await confirmReceived(ret.id, dto);
      setRet(updated);
      setConfirmReceivedOpen(false);
      showToast("Đã xác nhận kho nhận hàng.", "success");
    } catch (err) {
      showToast((err as Error)?.message || "Không thể xác nhận nhận hàng.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Stepper ───────────────────────────────────────────────────────────────

  const isTuChoi          = ret.status === "TuChoi";
  const receivedStatuses  = ["DaNhanHang", "DaKiemTra", "TuChoiNhanHang", "DangXuLy", "HoanThanh"];
  const inspectedStatuses = ["DaKiemTra", "TuChoiNhanHang", "DangXuLy", "HoanThanh"];

  const stepperSteps: { label: string; done: boolean; error: boolean; date?: string }[] = isTuChoi
    ? [
        { label: "Yêu cầu gửi", done: true, error: false, date: ret.requestedAt },
        { label: "Từ chối",     done: true, error: true,  date: ret.updatedAt   },
      ]
    : isTuChoiNhanHang
    ? [
        { label: "Yêu cầu gửi",  done: true, error: false, date: ret.requestedAt },
        { label: "Đã duyệt",     done: true, error: false, date: ret.approvedAt ?? undefined },
        { label: "Đã nhận hàng", done: true, error: false, date: ret.returnReceivedAt ?? undefined },
        { label: "Đã kiểm tra",  done: true, error: false, date: ret.inspectedAt ?? undefined },
        { label: "Từ chối nhận", done: true, error: true,  date: ret.rejectedAt ?? undefined },
      ]
    : [
        { label: "Yêu cầu gửi",  done: true,                                                    error: false, date: ret.requestedAt },
        { label: "Đã duyệt",     done: ret.status !== "ChoDuyet",                               error: false, date: ret.approvedAt ?? undefined },
        { label: "Đã nhận hàng", done: receivedStatuses.includes(ret.status),                   error: false, date: ret.returnReceivedAt ?? undefined },
        { label: "Đã kiểm tra",  done: inspectedStatuses.includes(ret.status),                  error: false, date: ret.inspectedAt ?? undefined },
        { label: "Đang xử lý",   done: ret.status === "DangXuLy" || ret.status === "HoanThanh", error: false, date: ret.processingStartedAt ?? undefined },
        { label: "Hoàn thành",   done: ret.status === "HoanThanh",                              error: false, date: ret.status === "HoanThanh" ? ret.updatedAt : undefined },
      ];

  const customerAssets   = assets.filter((a) => !!a.assetUrl && a.loaiAsset !== "inspection_evidence");
  const inspectionAssets = assets.filter((a) => !!a.assetUrl && a.loaiAsset === "inspection_evidence");

  const rec = ret.resolutionRecord;
  const hasReturnToCustomerInfo = rec && (rec.trackingTraKhach || rec.trackingDoiHang);

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href={backHref} className="hover:text-secondary-700 transition-colors">
              Đổi / Trả hàng
            </Link>
            <span aria-hidden="true">›</span>
            <span className="font-mono text-secondary-600">#{ret.id}</span>
          </nav>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-secondary-900">#{ret.id}</h1>
            <span className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-semibold text-secondary-600">
              {REQUEST_TYPE_LABELS[ret.requestType] ?? ret.requestType}
            </span>
            <StatusBadge status={ret.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Quay lại
          </Link>
          {canReject && (
            <Button variant="danger" onClick={() => handleStatus("TuChoi")} disabled={isSaving} isLoading={isSaving}>
              Từ chối
            </Button>
          )}
          {canApprove && (
            <Button variant="secondary" onClick={() => setApproveOpen(true)} disabled={isSaving}>
              Duyệt
            </Button>
          )}
          {canMarkReceived && (
            <Button variant="primary" onClick={() => setConfirmReceivedOpen(true)} disabled={isSaving}>
              Đã nhận hàng
            </Button>
          )}
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start">
        <div className="space-y-6">

          {/* ── Chi tiết yêu cầu ── */}
          <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-secondary-900">Chi tiết yêu cầu</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Đơn hàng</p>
                <Link
                  href={`/orders/${ret.orderCode ?? ret.orderId}`}
                  className="mt-1 block font-mono text-sm font-medium text-primary-600 hover:underline"
                >
                  {ret.orderCode ?? `#${ret.orderId}`}
                </Link>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Khách hàng</p>
                <Link
                  href={`/customers/${ret.customerId}`}
                  className="mt-1 block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {ret.customerName}
                </Link>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Loại yêu cầu</p>
                <p className="mt-1 text-sm text-secondary-700">
                  {REQUEST_TYPE_LABELS[ret.requestType] ?? ret.requestType}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Lý do</p>
                <p className="mt-1 text-sm text-secondary-700">{REASON_LABELS[ret.reason] ?? ret.reason}</p>
              </div>
              {ret.resolution && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Hướng xử lý</p>
                  <p className="mt-1 text-sm font-medium text-secondary-800">
                    {RESOLUTION_LABELS[ret.resolution] ?? ret.resolution}
                  </p>
                </div>
              )}
              {rec?.soTienHoan && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Số tiền hoàn trả</p>
                  <p className="mt-1 text-sm font-semibold text-secondary-900">{formatVND(rec.soTienHoan)}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Ngày yêu cầu</p>
                <p className="mt-1 text-sm text-secondary-700">{formatDate(ret.requestedAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Cập nhật lần cuối</p>
                <p className="mt-1 text-sm text-secondary-700">{formatDate(ret.updatedAt)}</p>
              </div>
            </div>

            {/* Mô tả của khách */}
            {ret.description && (
              <div className="mt-5 border-t border-secondary-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Mô tả của khách</p>
                <p className="mt-1 text-sm text-secondary-700">{ret.description}</p>
              </div>
            )}

            {/* Kết quả kiểm tra hàng */}
            {ret.inspectionResult && (
              <div className="mt-4 border-t border-secondary-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Kết quả kiểm tra hàng</p>
                <p className="mt-1 text-sm text-secondary-700">{ret.inspectionResult}</p>
              </div>
            )}

            {/* Thông tin hàng hoàn trả */}
            {(ret.returnReceivedAt || ret.returnTrackingCode) && (
              <div className="mt-5 space-y-3 border-t border-secondary-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Thông tin hàng hoàn trả</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ret.returnTrackingCode && (
                    <div>
                      <p className="text-xs text-secondary-400">Mã vận đơn hoàn trả</p>
                      <p className="mt-0.5 font-mono text-sm font-medium text-secondary-800">{ret.returnTrackingCode}</p>
                    </div>
                  )}
                  {ret.returnCarrier && (
                    <div>
                      <p className="text-xs text-secondary-400">Đơn vị vận chuyển</p>
                      <p className="mt-0.5 text-sm text-secondary-800">{ret.returnCarrier}</p>
                    </div>
                  )}
                  {ret.returnReceivedAt && (
                    <div>
                      <p className="text-xs text-secondary-400">Ngày kho nhận</p>
                      <p className="mt-0.5 text-sm text-secondary-800">{formatDate(ret.returnReceivedAt)}</p>
                    </div>
                  )}
                  {ret.returnReceivedByName && (
                    <div>
                      <p className="text-xs text-secondary-400">Nhân viên xác nhận</p>
                      <p className="mt-0.5 text-sm text-secondary-800">{ret.returnReceivedByName}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thông tin từ chối nhận hàng */}
            {isTuChoiNhanHang && (ret.rejectTrackingCode || ret.rejectCarrier || ret.rejectNotes) && (
              <div className="mt-5 space-y-3 border-t border-secondary-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-error-600">Thông tin từ chối nhận hàng</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ret.rejectTrackingCode && (
                    <div>
                      <p className="text-xs text-secondary-400">Mã vận đơn trả khách</p>
                      <p className="mt-0.5 font-mono text-sm font-medium text-secondary-800">{ret.rejectTrackingCode}</p>
                    </div>
                  )}
                  {ret.rejectCarrier && (
                    <div>
                      <p className="text-xs text-secondary-400">Đơn vị vận chuyển</p>
                      <p className="mt-0.5 text-sm text-secondary-800">{ret.rejectCarrier}</p>
                    </div>
                  )}
                  {ret.rejectedAt && (
                    <div>
                      <p className="text-xs text-secondary-400">Ngày từ chối</p>
                      <p className="mt-0.5 text-sm text-secondary-800">{formatDate(ret.rejectedAt)}</p>
                    </div>
                  )}
                  {ret.rejectedByName && (
                    <div>
                      <p className="text-xs text-secondary-400">Nhân viên từ chối</p>
                      <p className="mt-0.5 text-sm text-secondary-800">{ret.rejectedByName}</p>
                    </div>
                  )}
                  {ret.rejectNotes && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-secondary-400">Lý do từ chối</p>
                      <p className="mt-0.5 text-sm text-secondary-700">{ret.rejectNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vận đơn trả khách (exchange / warranty) */}
            {hasReturnToCustomerInfo && (
              <div className="mt-5 space-y-3 border-t border-secondary-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Thông tin giao hàng trả khách</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {rec?.trackingDoiHang && (
                    <div>
                      <p className="text-xs text-secondary-400">Mã vận đơn đổi hàng</p>
                      <p className="mt-0.5 font-mono text-sm font-medium text-secondary-800">{rec.trackingDoiHang}</p>
                      {rec.carrierDoiHang && <p className="text-xs text-secondary-500">{rec.carrierDoiHang}</p>}
                    </div>
                  )}
                  {rec?.trackingTraKhach && (
                    <div>
                      <p className="text-xs text-secondary-400">Mã vận đơn trả khách</p>
                      <p className="mt-0.5 font-mono text-sm font-medium text-secondary-800">{rec.trackingTraKhach}</p>
                      {rec.carrierTraKhach && <p className="text-xs text-secondary-500">{rec.carrierTraKhach}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Ảnh bằng chứng của khách ── */}
          {customerAssets.length > 0 && (
            <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-secondary-900">Ảnh bằng chứng của khách</h3>
              <div className="mx-auto max-w-sm xl:max-w-md">
                <ProductImageGallery
                  items={customerAssets.map<GalleryMedia>((a) => ({
                    key:  String(a.id),
                    src:  a.assetUrl!,
                    alt:  "Ảnh bằng chứng khách",
                    type: "image",
                  }))}
                />
              </div>
            </div>
          )}

          {/* ── Sản phẩm yêu cầu ── */}
          <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <div className="border-b border-secondary-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-secondary-900">Sản phẩm yêu cầu</h2>
              {ret.requestType === "DoiHang" && (
                <span className="text-[11px] text-secondary-400 flex items-center gap-1">
                  <span className="inline-block w-2.5 h-1.5 rounded-sm bg-amber-300" />
                  Tồn kho &amp; lô hàng đổi
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50 text-left text-xs font-semibold uppercase tracking-wide text-secondary-500">
                  <tr>
                    <th className="px-4 py-3">Sản phẩm / SKU</th>
                    <th className="px-4 py-3 text-center">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {ret.lineItems.map((item) => (
                    <tr key={item.id} className="text-secondary-700 align-top">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.productName}
                              className="mt-0.5 h-9 w-9 rounded-lg border border-secondary-100 object-cover shrink-0"
                            />
                          ) : (
                            <div className="mt-0.5 h-9 w-9 rounded-lg border border-secondary-100 bg-secondary-50 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            {item.productId ? (
                              <Tooltip content={item.productName} multiline maxWidth="320px">
                                <Link
                                  href={`/products/${item.productId}`}
                                  className="block truncate max-w-[280px] font-medium text-primary-600 hover:underline"
                                >
                                  {item.productName}
                                </Link>
                              </Tooltip>
                            ) : (
                              <p className="font-medium text-secondary-800">{item.productName}</p>
                            )}
                            <p className="text-xs text-secondary-500">{item.variantName}</p>
                            {item.sku && <p className="font-mono text-xs text-secondary-400">{item.sku}</p>}

                            {/* Stock + batch breakdown — DoiHang only */}
                            {ret.requestType === "DoiHang" && (
                              <InlineStockPanel
                                item={item}
                                info={lineStockMap[item.variantId]}
                                loading={lineStockLoading && !lineStockMap[item.variantId]}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Kết quả kiểm tra (editable) ── */}
          {(ret.status === "DaNhanHang" || ret.status === "DaKiemTra" || ret.status === "DangXuLy") && (
            <InspectionPanel
              returnId={ret.id}
              existingResult={ret.inspectionResult}
              onDone={(updated) => setRet(updated)}
            />
          )}

          {/* ── Ảnh bằng chứng kiểm tra ── */}
          {(ret.status === "DaNhanHang" || ret.status === "DaKiemTra" || ret.status === "TuChoiNhanHang" || inspectionAssets.length > 0) && (
            <InspectionEvidencePanel
              returnId={ret.id}
              canUpload={ret.status === "DaNhanHang" || ret.status === "DaKiemTra"}
              assets={inspectionAssets}
              onUploaded={(updated) => setAssets(updated)}
            />
          )}

          {/* ── Xác nhận hoàn tất kiểm tra ── */}
          {ret.status === "DaNhanHang" && (
            <ConfirmInspectionPanel
              returnId={ret.id}
              hasResult={!!ret.inspectionResult?.trim()}
              hasPhotos={inspectionAssets.length > 0}
              onDone={(updated) => setRet(updated)}
            />
          )}

          {/* ── Quyết định sau kiểm tra ── */}
          {ret.status === "DaKiemTra" && !goodsAccepted && (
            <RejectGoodsPanel
              returnId={ret.id}
              onDone={(updated) => setRet(updated)}
              onAccept={() => setGoodsAccepted(true)}
            />
          )}

          {/* ── Resolution panels ── */}
          {showResolutionPanel && ret.resolution === "HoanTien" && (
            <RefundPanel returnId={ret.id} onDone={reload} />
          )}
          {showResolutionPanel && ret.resolution === "GiaoHangMoi" && (
            <ExchangePanel
              returnId={ret.id}
              resolutionId={ret.resolutionRecord?.id}
              resolutionStatus={ret.resolutionRecord?.status}
              lineItems={ret.lineItems}
              onDone={reload}
            />
          )}
          {showResolutionPanel && ret.resolution === "BaoHanh" && (
            <WarrantyPanel
              returnId={ret.id}
              resolutionId={ret.resolutionRecord?.id}
              resolutionStatus={ret.resolutionRecord?.status}
              resolutionRecord={ret.resolutionRecord}
              onDone={reload}
            />
          )}

          {ret.resolutionRecord?.status === "HoanThanh" && ret.resolutionRecord.id && (
            <DefectiveHandlingPanel
              resolutionId={ret.resolutionRecord.id}
              defectiveHandling={ret.resolutionRecord.defectiveHandling}
              defectiveHandledAt={ret.resolutionRecord.defectiveHandledAt}
              defectiveNotes={ret.resolutionRecord.defectiveNotes}
              onDone={reload}
            />
          )}

          {ret.resolutionRecord?.status === "HoanThanh" &&
           ret.resolutionRecord.id &&
           ret.resolutionRecord.defectiveHandling === "TaiSuDung" &&
           !ret.resolutionRecord.defectiveHandledAt && (
            <CompleteReusePanel resolutionId={ret.resolutionRecord.id} onDone={reload} />
          )}
        </div>

        {/* ── Right column: stepper + processor ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-secondary-900">Tiến trình xử lý</h3>
            <ol className="space-y-4">
              {stepperSteps.map((step) => (
                <li key={step.label} className="flex items-start gap-3">
                  <span className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    step.error
                      ? "bg-error-100 text-error-700"
                      : step.done
                        ? "bg-success-100 text-success-700"
                        : "bg-secondary-100 text-secondary-400",
                  ].join(" ")}>
                    {step.error ? "✕" : step.done ? "✓" : "○"}
                  </span>
                  <div>
                    <p className={[
                      "text-sm font-medium",
                      step.done || step.error ? "text-secondary-900" : "text-secondary-400",
                    ].join(" ")}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-secondary-400">{formatDate(step.date)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {ret.processedByName && (
            <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-secondary-900">Nhân viên xử lý</h3>
              {ret.processedById ? (
                <Link
                  href={`/employees/${ret.processedById}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {ret.processedByName}
                </Link>
              ) : (
                <p className="text-sm text-secondary-700">{ret.processedByName}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <ApproveDialog
        isOpen={approveOpen}
        isConfirming={isSaving}
        requestType={ret.requestType}
        lineItems={ret.lineItems}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApprove}
      />
      <ConfirmReceivedModal
        isOpen={confirmReceivedOpen}
        isSaving={isSaving}
        onClose={() => setConfirmReceivedOpen(false)}
        onConfirm={handleConfirmReceived}
      />
    </div>
  );
}
