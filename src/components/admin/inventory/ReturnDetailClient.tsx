"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { DateInput } from "@/src/components/ui/DateInput";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { useToast } from "@/src/components/ui/Toast";
import { formatVND } from "@/src/lib/format";
import {
  updateReturnStatus,
  processRefund,
  processExchange,
  confirmExchangeDelivered,
  initWarranty,
  updateWarrantyStatus,
  processWarranty,
  getReturnAssets,
  type ProcessRefundDto,
  type ProcessExchangeDto,
  type UpdateWarrantyStatusDto,
  type ProcessWarrantyDto,
  type ReturnAssetItem,
} from "@/src/services/returns.service";
import { MediaGallery } from "@/src/components/admin/variant/MediaGallery";
import type { VariantMedia } from "@/src/types/product.types";
import type { ReturnRequest, ReturnResolution } from "@/src/types/inventory.types";

function formatDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
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

// ─── ApproveDialog ────────────────────────────────────────────────────────────

const APPROVE_RESOLUTION_OPTIONS = [
  { value: "HoanTien",    label: "Hoàn tiền",     desc: "Hoàn lại tiền cho khách" },
  { value: "GiaoHangMoi", label: "Giao hàng mới", desc: "Gửi sản phẩm thay thế" },
  { value: "BaoHanh",     label: "Bảo hành",       desc: "Gửi về hãng bảo hành" },
];

interface ApproveDialogProps {
  isOpen: boolean;
  isConfirming: boolean;
  onClose: () => void;
  onConfirm: (resolution: string) => void;
}

function ApproveDialog({ isOpen, isConfirming, onClose, onConfirm }: ApproveDialogProps) {
  const [pendingResolution, setPendingResolution] = useState("");

  function handleClose() {
    setPendingResolution("");
    onClose();
  }

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={handleClose}
        className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-dialog-title"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        <div className="px-6 pb-6 pt-6">
          <h2 id="approve-dialog-title" className="mb-1 text-base font-semibold text-secondary-900">
            Duyệt yêu cầu
          </h2>
          <p className="mb-4 text-sm text-secondary-500">Chọn hướng xử lý trước khi duyệt:</p>
          <div className="space-y-2">
            {APPROVE_RESOLUTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPendingResolution(opt.value)}
                className={[
                  "w-full rounded-xl border-2 px-4 py-3 text-left transition-colors",
                  pendingResolution === opt.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50",
                ].join(" ")}
              >
                <p className="text-sm font-medium text-secondary-900">{opt.label}</p>
                <p className="mt-0.5 text-xs text-secondary-400">{opt.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isConfirming}
              className="flex items-center justify-center rounded-xl border border-secondary-200 px-5 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50 disabled:pointer-events-none disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={() => onConfirm(pendingResolution)}
              disabled={!pendingResolution || isConfirming}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConfirming && (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Xác nhận duyệt
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── HoanTien panel ───────────────────────────────────────────────────────────

function RefundPanel({ returnId, onDone }: { returnId: string; onDone: () => void }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProcessRefundDto>({
    soTienHoan: 0,
    phuongThucHoan: "ChuyenKhoan",
    maGiaoDichHoan: "",
    nganHangViHoan: "",
    ghiChu: "",
  });

  async function handleSubmit() {
    if (!form.soTienHoan || form.soTienHoan <= 0) {
      showToast("Vui lòng nhập số tiền hoàn trả hợp lệ.", "error");
      return;
    }
    setSaving(true);
    try {
      await processRefund(returnId, {
        ...form,
        maGiaoDichHoan: form.maGiaoDichHoan || undefined,
        nganHangViHoan: form.nganHangViHoan || undefined,
        ghiChu: form.ghiChu || undefined,
      });
      showToast("Hoàn tiền thành công.", "success");
      onDone();
    } catch (err) {
      showToast((err as Error)?.message || "Không thể thực hiện hoàn tiền.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-secondary-900">Thực hiện hoàn tiền</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Input
            label="Số tiền hoàn (VNĐ) *"
            type="number"
            min={0}
            value={form.soTienHoan || ""}
            onChange={(e) => setForm((f) => ({ ...f, soTienHoan: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-700">Phương thức hoàn *</label>
          <select value={form.phuongThucHoan}
            onChange={(e) => setForm((f) => ({ ...f, phuongThucHoan: e.target.value }))}
            className="w-full h-10 rounded border border-secondary-300 px-3 text-sm text-secondary-700 bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15 transition-colors"
          >
            <option value="ChuyenKhoan">Chuyển khoản</option>
            <option value="TienMat">Tiền mặt</option>
            <option value="HoanViMomo">Hoàn ví MoMo</option>
            <option value="HoanVNPay">Hoàn VNPay</option>
          </select>
        </div>
        <div>
          <Input
            label="Mã giao dịch hoàn"
            type="text"
            value={form.maGiaoDichHoan || ""}
            onChange={(e) => setForm((f) => ({ ...f, maGiaoDichHoan: e.target.value }))}
          />
        </div>
        <div>
          <Input
            label="Ngân hàng / Ví"
            type="text"
            value={form.nganHangViHoan || ""}
            onChange={(e) => setForm((f) => ({ ...f, nganHangViHoan: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Ghi chú"
            type="text"
            value={form.ghiChu || ""}
            onChange={(e) => setForm((f) => ({ ...f, ghiChu: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSubmit} disabled={saving} isLoading={saving}>
          Xác nhận hoàn tiền
        </Button>
      </div>
    </div>
  );
}

// ─── GiaoHangMoi panel ────────────────────────────────────────────────────────

function ExchangePanel({ returnId, resolutionId, resolutionStatus, onDone }: {
  returnId: string;
  resolutionId?: string;
  resolutionStatus?: string;
  onDone: () => void;
}) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProcessExchangeDto>({
    trackingDoiHang: "",
    carrierDoiHang: "",
    ghiChu: "",
  });

  async function handleExchange() {
    setSaving(true);
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
      showToast((err as Error)?.message || "Không thể xuất hàng đổi.", "error");
    } finally {
      setSaving(false);
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
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Input
            label="Đơn vị vận chuyển"
            type="text"
            value={form.carrierDoiHang || ""}
            onChange={(e) => setForm((f) => ({ ...f, carrierDoiHang: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Mã vận đơn"
            type="text"
            value={form.trackingDoiHang || ""}
            onChange={(e) => setForm((f) => ({ ...f, trackingDoiHang: e.target.value }))}
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

// ─── BaoHanh panel ────────────────────────────────────────────────────────────

function WarrantyPanel({ returnId, resolutionId, resolutionStatus, resolutionRecord, onDone }: {
  returnId: string;
  resolutionId?: string;
  resolutionStatus?: string;
  resolutionRecord?: ReturnRequest["resolutionRecord"];
  onDone: () => void;
}) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [warrantyForm, setWarrantyForm] = useState<UpdateWarrantyStatusDto>({
    maBaoHanhHang: resolutionRecord?.maBaoHanhHang ?? "",
    ngayGuiHangBaoHanh: resolutionRecord?.ngayGuiHangBaoHanh?.slice(0, 10) ?? "",
    ngayNhanHangVe: resolutionRecord?.ngayNhanHangVe?.slice(0, 10) ?? "",
    ketQuaBaoHanh: resolutionRecord?.ketQuaBaoHanh ?? "",
  });
  const [returnForm, setReturnForm] = useState<ProcessWarrantyDto>({
    trackingTraKhach: "",
    ghiChu: "",
  });

  async function handleInitWarranty() {
    setSaving(true);
    try {
      await initWarranty(returnId);
      showToast("Đã khởi tạo bản ghi bảo hành.", "success");
      onDone();
    } catch (err) {
      showToast((err as Error)?.message || "Không thể khởi tạo bảo hành.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateWarranty() {
    if (!resolutionId) return;
    setSaving(true);
    try {
      await updateWarrantyStatus(resolutionId, {
        maBaoHanhHang:      warrantyForm.maBaoHanhHang      || undefined,
        ngayGuiHangBaoHanh: warrantyForm.ngayGuiHangBaoHanh || undefined,
        ngayNhanHangVe:     warrantyForm.ngayNhanHangVe     || undefined,
        ketQuaBaoHanh:      warrantyForm.ketQuaBaoHanh      || undefined,
      });
      showToast("Đã cập nhật trạng thái bảo hành.", "success");
      onDone();
    } catch (err) {
      showToast((err as Error)?.message || "Không thể cập nhật.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleProcessWarranty() {
    if (!returnForm.trackingTraKhach) {
      showToast("Vui lòng nhập mã vận đơn trả khách.", "error");
      return;
    }
    setSaving(true);
    try {
      await processWarranty(returnId, {
        ...returnForm,
        ghiChu: returnForm.ghiChu || undefined,
      });
      showToast("Đã trả hàng bảo hành lại khách.", "success");
      onDone();
    } catch (err) {
      showToast((err as Error)?.message || "Không thể trả hàng.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!resolutionId) {
    return (
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-secondary-900">Bảo hành — khởi tạo</h3>
        <p className="text-sm text-secondary-600">Khởi tạo bản ghi bảo hành sau khi đã nhận hàng từ khách.</p>
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleInitWarranty} disabled={saving} isLoading={saving}>
            Khởi tạo bảo hành
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-5">
      <h3 className="text-sm font-semibold text-secondary-900">Bảo hành — theo dõi & trả hàng</h3>

      {resolutionStatus !== "HoanThanh" && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Cập nhật trạng thái bảo hành</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input
                label="Mã bảo hành hãng"
                type="text"
                value={warrantyForm.maBaoHanhHang || ""}
                onChange={(e) => setWarrantyForm((f) => ({ ...f, maBaoHanhHang: e.target.value }))}
              />
            </div>
            <div>
              <DateInput
                label="Ngày gửi hàng về hãng"
                value={warrantyForm.ngayGuiHangBaoHanh || ""}
                onChange={(v) => setWarrantyForm((f) => ({ ...f, ngayGuiHangBaoHanh: v }))}
              />
            </div>
            <div>
              <DateInput
                label="Ngày nhận hàng về"
                value={warrantyForm.ngayNhanHangVe || ""}
                onChange={(v) => setWarrantyForm((f) => ({ ...f, ngayNhanHangVe: v }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Kết quả bảo hành"
                value={warrantyForm.ketQuaBaoHanh || ""}
                onChange={(e) => setWarrantyForm((f) => ({ ...f, ketQuaBaoHanh: e.target.value }))}
                showCharCount
                maxCharCount={512}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleUpdateWarranty} disabled={saving} isLoading={saving}>
              Lưu cập nhật
            </Button>
          </div>
        </div>
      )}

      {resolutionStatus !== "HoanThanh" && (
        <div className="space-y-3 border-t border-secondary-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Trả hàng lại khách</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input
                label="Mã vận đơn trả khách *"
                type="text"
                value={returnForm.trackingTraKhach}
                onChange={(e) => setReturnForm((f) => ({ ...f, trackingTraKhach: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleProcessWarranty} disabled={saving} isLoading={saving}>
              Trả hàng lại khách
            </Button>
          </div>
        </div>
      )}

      {resolutionStatus === "HoanThanh" && (
        <p className="text-sm text-success-700 font-medium">Bảo hành đã hoàn tất.</p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReturnDetailClient({
  initialReturn,
  backHref = "/orders/returns",
}: {
  initialReturn: ReturnRequest;
  backHref?: string;
}) {
  const { showToast } = useToast();
  const [ret, setRet]                   = useState(initialReturn);
  const [isSaving, setIsSaving]         = useState(false);
  const [approveOpen, setApproveOpen]   = useState(false);
  const [assets, setAssets]             = useState<ReturnAssetItem[]>([]);

  useEffect(() => {
    getReturnAssets(ret.id).then(setAssets).catch(() => {});
  }, [ret.id]);

  const canApprove      = ret.status === "ChoDuyet";
  const canReject       = ret.status === "ChoDuyet";
  const canMarkReceived = ret.status === "DaDuyet";
  const isDangXuLy      = ret.status === "DangXuLy";
  const showResolutionPanel =
    (canMarkReceived || isDangXuLy) &&
    ret.resolution &&
    ret.status !== "HoanThanh" &&
    ret.status !== "TuChoi";

  async function reload() {
    window.location.reload();
  }

  async function handleStatus(status: ReturnRequest["status"]) {
    setIsSaving(true);
    try {
      await updateReturnStatus(ret.id, { status });
      setRet((prev) => ({ ...prev, status }));
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
      await updateReturnStatus(ret.id, { status: "DaDuyet", resolution });
      setRet((prev) => ({ ...prev, status: "DaDuyet", resolution: resolution as ReturnResolution }));
      showToast("Đã duyệt yêu cầu.", "success");
    } catch {
      showToast("Không thể duyệt.", "error");
    } finally {
      setIsSaving(false);
      setApproveOpen(false);
    }
  }

  async function handleMarkReceived(adminNote: string) {
    setIsSaving(true);
    try {
      await updateReturnStatus(ret.id, {
        status: "DangXuLy",
        inspectionResult: adminNote || undefined,
      });
      setRet((prev) => ({
        ...prev,
        status: "DangXuLy",
        inspectionResult: adminNote || prev.inspectionResult,
      }));
      showToast("Đã xác nhận nhận hàng.", "success");
    } catch {
      showToast("Không thể cập nhật trạng thái.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Stepper steps ────────────────────────────────────────────────────────

  const isTuChoi = ret.status === "TuChoi";
  const stepperSteps: { label: string; done: boolean; error: boolean; date?: string }[] = isTuChoi
    ? [
        { label: "Yêu cầu gửi", done: true,  error: false, date: ret.requestedAt },
        { label: "Từ chối",      done: true,  error: true,  date: ret.updatedAt   },
      ]
    : [
        { label: "Yêu cầu gửi", done: true,  error: false, date: ret.requestedAt },
        { label: "Đã duyệt",    done: ret.status !== "ChoDuyet", error: false },
        { label: "Đang xử lý",  done: ret.status === "DangXuLy" || ret.status === "HoanThanh", error: false },
        { label: "Hoàn thành",  done: ret.status === "HoanThanh", error: false, date: ret.status === "HoanThanh" ? ret.updatedAt : undefined },
      ];

  const visibleAssets = assets.filter((a) => !!a.assetUrl);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
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
            <Button variant="primary" onClick={() => handleMarkReceived("")} disabled={isSaving} isLoading={isSaving}>
              Đã nhận hàng
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start">
        <div className="space-y-6">
          {/* Return details */}
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
                <p className="mt-1 text-sm text-secondary-700">{ret.reason}</p>
              </div>
              {ret.resolution && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Hướng xử lý</p>
                  <p className="mt-1 text-sm font-medium text-secondary-800">
                    {RESOLUTION_LABELS[ret.resolution] ?? ret.resolution}
                  </p>
                </div>
              )}
              {ret.resolutionRecord?.soTienHoan && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Số tiền hoàn trả</p>
                  <p className="mt-1 text-sm font-semibold text-secondary-900">
                    {formatVND(ret.resolutionRecord.soTienHoan)}
                  </p>
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

            {(ret.description || ret.inspectionResult) && (
              <div className="mt-5 space-y-3 border-t border-secondary-100 pt-4">
                {ret.description && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Mô tả của khách</p>
                    <p className="mt-1 text-sm text-secondary-700">{ret.description}</p>
                  </div>
                )}
                {ret.inspectionResult && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Kết quả kiểm tra</p>
                    <p className="mt-1 text-sm text-secondary-700">{ret.inspectionResult}</p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Attached media */}
          {visibleAssets.length > 0 && (
            <MediaGallery
              media={visibleAssets.map<VariantMedia>((a) => ({
                id: String(a.id),
                variantId: "",
                url: a.assetUrl!,
                assetId: String(a.assetId),
                type: "gallery",
                order: a.sortOrder,
                altText: "Ảnh bằng chứng",
              }))}
            />
          )}

          {/* Line items */}
          <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <div className="border-b border-secondary-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-secondary-900">Sản phẩm yêu cầu</h2>
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
                    <tr key={item.id} className="text-secondary-700">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.thumbnailUrl ? (
                            <img src={item.thumbnailUrl} alt={item.productName}
                              className="h-9 w-9 rounded-lg border border-secondary-100 object-cover shrink-0" />
                          ) : (
                            <div className="h-9 w-9 rounded-lg border border-secondary-100 bg-secondary-50 shrink-0" />
                          )}
                          <div className="min-w-0">
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

          {/* Resolution panel */}
          {showResolutionPanel && ret.resolution === "HoanTien" && (
            <RefundPanel returnId={ret.id} onDone={reload} />
          )}
          {showResolutionPanel && ret.resolution === "GiaoHangMoi" && (
            <ExchangePanel
              returnId={ret.id}
              resolutionId={ret.resolutionRecord?.id}
              resolutionStatus={ret.resolutionRecord?.status}
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
        </div>

        {/* Right column — status + processor */}
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
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApprove}
      />
    </div>
  );
}
