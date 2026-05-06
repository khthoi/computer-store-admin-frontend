"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";
import { DateInput } from "@/src/components/ui/DateInput";
import { useToast } from "@/src/components/ui/Toast";
import {
  initWarranty,
  updateWarrantyStatus,
  processWarranty,
  type UpdateWarrantyStatusDto,
  type ProcessWarrantyDto,
} from "@/src/services/returns.service";
import type { ReturnRequest } from "@/src/types/inventory.types";

// ─── WarrantyPanel ────────────────────────────────────────────────────────────

export function WarrantyPanel({ returnId, resolutionId, resolutionStatus, resolutionRecord, onDone }: {
  returnId: string;
  resolutionId?: string;
  resolutionStatus?: string;
  resolutionRecord?: ReturnRequest["resolutionRecord"];
  onDone: () => void;
}) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [warrantyForm, setWarrantyForm] = useState<UpdateWarrantyStatusDto>({
    maBaoHanhHang:         resolutionRecord?.maBaoHanhHang         ?? "",
    ngayGuiHangBaoHanh:    resolutionRecord?.ngayGuiHangBaoHanh?.slice(0, 10) ?? "",
    ngayNhanHangVe:        resolutionRecord?.ngayNhanHangVe?.slice(0, 10)     ?? "",
    ketQuaBaoHanh:         resolutionRecord?.ketQuaBaoHanh         ?? "",
    tinhTrangHangNhan:     undefined,
    trackingGuiNhaSanXuat: resolutionRecord?.trackingGuiNhaSanXuat ?? "",
    carrierGuiNhaSanXuat:  resolutionRecord?.carrierGuiNhaSanXuat  ?? "",
  });
  const [returnForm, setReturnForm] = useState<ProcessWarrantyDto>({
    trackingTraKhach: "",
    carrierTraKhach:  "",
    ghiChu:           "",
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
        maBaoHanhHang:         warrantyForm.maBaoHanhHang         || undefined,
        ngayGuiHangBaoHanh:    warrantyForm.ngayGuiHangBaoHanh    || undefined,
        ngayNhanHangVe:        warrantyForm.ngayNhanHangVe        || undefined,
        ketQuaBaoHanh:         warrantyForm.ketQuaBaoHanh         || undefined,
        tinhTrangHangNhan:     warrantyForm.tinhTrangHangNhan,
        trackingGuiNhaSanXuat: warrantyForm.trackingGuiNhaSanXuat || undefined,
        carrierGuiNhaSanXuat:  warrantyForm.carrierGuiNhaSanXuat  || undefined,
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
    if (!returnForm.carrierTraKhach) {
      showToast("Vui lòng nhập đơn vị vận chuyển trả khách.", "error");
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

  type TinhTrang = "NguyenVen" | "HuHong" | "ThieuPhuKien";

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
      <h3 className="text-sm font-semibold text-secondary-900">Bảo hành — theo dõi &amp; trả hàng</h3>

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
              <Input
                label="Đơn vị vận chuyển gửi hãng"
                type="text"
                value={warrantyForm.carrierGuiNhaSanXuat || ""}
                onChange={(e) => setWarrantyForm((f) => ({ ...f, carrierGuiNhaSanXuat: e.target.value }))}
              />
            </div>
            <div>
              <Input
                label="Mã vận đơn gửi hãng"
                type="text"
                value={warrantyForm.trackingGuiNhaSanXuat || ""}
                onChange={(e) => setWarrantyForm((f) => ({ ...f, trackingGuiNhaSanXuat: e.target.value }))}
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
            <div>
              <Select
                label="Tình trạng hàng nhận"
                options={[
                  { value: "",             label: "Chưa xác định" },
                  { value: "NguyenVen",    label: "Nguyên vẹn" },
                  { value: "HuHong",       label: "Hư hỏng" },
                  { value: "ThieuPhuKien", label: "Thiếu phụ kiện" },
                ]}
                value={warrantyForm.tinhTrangHangNhan ?? ""}
                onChange={(v) => {
                  const s = v as string;
                  setWarrantyForm((f) => ({
                    ...f,
                    tinhTrangHangNhan: s ? (s as TinhTrang) : undefined,
                  }));
                }}
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
                label="Mã vận đơn trả khách"
                required
                type="text"
                value={returnForm.trackingTraKhach}
                onChange={(e) => setReturnForm((f) => ({ ...f, trackingTraKhach: e.target.value }))}
              />
            </div>
            <div>
              <Input
                label="Đơn vị vận chuyển trả khách"
                required
                type="text"
                value={returnForm.carrierTraKhach}
                onChange={(e) => setReturnForm((f) => ({ ...f, carrierTraKhach: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Ghi chú"
                value={returnForm.ghiChu || ""}
                onChange={(e) => setReturnForm((f) => ({ ...f, ghiChu: e.target.value }))}
                showCharCount
                maxCharCount={512}
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
        <div className="space-y-3">
          <p className="text-sm font-medium text-success-700">Bảo hành đã hoàn tất.</p>
          {(resolutionRecord?.trackingTraKhach || resolutionRecord?.trackingGuiNhaSanXuat) && (
            <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Vận chuyển bảo hành</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {resolutionRecord.trackingGuiNhaSanXuat && (
                  <div>
                    <p className="text-xs text-secondary-400">Mã vận đơn gửi hãng</p>
                    <p className="mt-0.5 font-mono text-sm font-medium text-secondary-800">{resolutionRecord.trackingGuiNhaSanXuat}</p>
                    {resolutionRecord.carrierGuiNhaSanXuat && (
                      <p className="text-xs text-secondary-500">{resolutionRecord.carrierGuiNhaSanXuat}</p>
                    )}
                  </div>
                )}
                {resolutionRecord.trackingTraKhach && (
                  <div>
                    <p className="text-xs text-secondary-400">Mã vận đơn trả khách</p>
                    <p className="mt-0.5 font-mono text-sm font-medium text-secondary-800">{resolutionRecord.trackingTraKhach}</p>
                    {resolutionRecord.carrierTraKhach && (
                      <p className="text-xs text-secondary-500">{resolutionRecord.carrierTraKhach}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
