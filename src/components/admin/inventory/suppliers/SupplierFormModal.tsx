"use client";

import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Modal } from "@/src/components/ui/Modal";
import type { Supplier } from "@/src/types/inventory.types";
import { Textarea } from "@/src/components/ui/Textarea";

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: Omit<Supplier, "id" | "productCount" | "totalOrders" | "createdAt" | "updatedAt">) => Promise<void>;
  initialData?: Supplier;
  isConfirming: boolean;
}

const STATUS_OPTIONS = [
  { value: "active",   label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
];

export function SupplierFormModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  isConfirming,
}: SupplierFormModalProps) {
  const [name, setName]               = useState(initialData?.name ?? "");
  const [contactName, setContactName] = useState(initialData?.contactName ?? "");
  const [email, setEmail]             = useState(initialData?.email ?? "");
  const [phone, setPhone]             = useState(initialData?.phone ?? "");
  const [address, setAddress]         = useState(initialData?.address ?? "");
  const [status, setStatus]           = useState<"active" | "inactive">(initialData?.status ?? "active");
  const [leadTimeDays, setLeadTimeDays] = useState(String(initialData?.leadTimeDays ?? 7));
  const [notes, setNotes]             = useState(initialData?.notes ?? "");

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? "");
      setContactName(initialData?.contactName ?? "");
      setEmail(initialData?.email ?? "");
      setPhone(initialData?.phone ?? "");
      setAddress(initialData?.address ?? "");
      setStatus(initialData?.status ?? "active");
      setLeadTimeDays(String(initialData?.leadTimeDays ?? 7));
      setNotes(initialData?.notes ?? "");
    }
  }, [isOpen, initialData]);

  const leadTimeParsed = parseInt(leadTimeDays, 10);
  const leadTimeValid = !isNaN(leadTimeParsed) && leadTimeParsed >= 1 && leadTimeParsed <= 365;
  const isValid = name.trim() && contactName.trim() && email.trim() && phone.trim() && leadTimeValid;

  async function handleSubmit() {
    if (!isValid) return;
    await onConfirm({
      name: name.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      status,
      leadTimeDays: leadTimeParsed,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      hideCloseButton
      animated
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-lg"
          >
            Huỷ
          </Button>
          <Button
            variant="primary"
            className="rounded-lg"
            onClick={handleSubmit}
            disabled={!isValid || isConfirming}
            isLoading={isConfirming}
          >
            {initialData ? "Lưu thay đổi" : "Thêm nhà cung cấp"}
          </Button>
        </>
      }
    >
      {/* Custom header — break out of Modal body padding to sit flush at top */}
      <div className="-mx-6 -mt-5 mb-5 flex items-center justify-between border-b border-secondary-100 px-6 py-4">
        <h2 className="text-base font-semibold text-secondary-900">
          {initialData ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Tên công ty"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Intel Vietnam Distribution"
            />
          </div>
          <Input
            label="Người liên hệ"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="VD: Nguyễn Văn A"
          />
          <Input
            label="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="VD: 028 3456 7890"
          />
          <div className="sm:col-span-2">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="VD: supply@supplier.com"
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Địa chỉ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, quận/huyện, thành phố"
              rows={2}
              showCharCount
              maxCharCount={200}
            />
          </div>
          <Select
            label="Trạng thái"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(v) => setStatus(v as "active" | "inactive")}
          />
          <div>
            <Input
              label="Lead time (ngày)"
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
              placeholder="VD: 7"
              min={1}
              max={365}
              errorMessage={leadTimeDays !== "" && !leadTimeValid ? "Nhập số ngày từ 1 đến 365" : undefined}
            />
            <p className="mt-1 text-xs text-secondary-400">
              Thời gian giao hàng dự kiến từ khi đặt đến khi nhận hàng.
            </p>
          </div>
        </div>
        <div>
          <Textarea
            label="Ghi chú (tuỳ chọn)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Điều khoản thanh toán, ghi chú giao hàng…"
            rows={2}
            showCharCount
            maxCharCount={200}
          />
        </div>
      </div>
    </Modal>
  );
}
