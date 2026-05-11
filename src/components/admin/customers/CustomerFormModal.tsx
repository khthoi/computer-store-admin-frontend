"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Button } from "@/src/components/ui/Button";
import { RadioGroup, Radio } from "@/src/components/ui/Radio";
import { DateInput } from "@/src/components/ui/DateInput";
import { useToast } from "@/src/components/ui/Toast";
import { createCustomer, getNextCustomerCode, updateCustomer } from "@/src/services/customer.service";
import type { KhachHang, CustomerStatus, GenderType } from "@/src/types/customer.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: KhachHang | null;
  onSaved: (customer: KhachHang) => void;
}

const STATUS_OPTIONS = [
  { value: "active",   label: "Đang hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "banned",   label: "Đã bị cấm" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomerFormModal({ isOpen, onClose, customer, onSaved }: CustomerFormModalProps) {
  const isEdit = Boolean(customer);
  const { showToast } = useToast();

  const [code, setCode] = useState(customer?.code ?? "");
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [fullName, setFullName] = useState(customer?.fullName ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [status, setStatus] = useState<CustomerStatus>(customer?.status ?? "active");
  const [gender, setGender] = useState<GenderType | null>(customer?.gender ?? null);
  const [dateOfBirth, setDateOfBirth] = useState(customer?.dateOfBirth ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // AbortController to cancel in-flight next-code requests when modal closes/reopens
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen) {
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }

    setCode(customer?.code ?? "");
    setFullName(customer?.fullName ?? "");
    setEmail(customer?.email ?? "");
    setPhone(customer?.phone ?? "");
    setStatus(customer?.status ?? "active");
    setGender(customer?.gender ?? null);
    setDateOfBirth(customer?.dateOfBirth ?? "");
    setErrors({});

    if (!isEdit) {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoadingCode(true);
      setCode("");

      getNextCustomerCode(controller.signal)
        .then(({ code: nextCode }) => {
          if (!controller.signal.aborted) setCode(nextCode);
        })
        .catch(() => {
          // Aborted or network error — leave code empty
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoadingCode(false);
        });
    }

    return () => {
      abortRef.current?.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Họ tên không được để trống.";
    if (!email.trim()) next.email = "Email không được để trống.";
    if (!phone.trim()) next.phone = "Số điện thoại không được để trống.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const saved = isEdit && customer
        ? await updateCustomer(customer.id, {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            status,
            gender,
            dateOfBirth: dateOfBirth || null,
          })
        : await createCustomer({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            status,
            gender,
            dateOfBirth: dateOfBirth || null,
          });
      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Đã xảy ra lỗi, vui lòng thử lại.";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, customer, fullName, email, phone, status, gender, dateOfBirth, onSaved, onClose, showToast]);

  const codeHelperText = isEdit
    ? undefined
    : isLoadingCode
      ? "Đang lấy mã…"
      : "Mã khách hàng được hệ thống tự động tạo và không thể chỉnh sửa.";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
      size="2xl"
      animated
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving || isLoadingCode}>
            {isSaving ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Tạo khách hàng"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mã khách hàng"
            placeholder={isLoadingCode ? "Đang tải…" : "KH-XXXX"}
            value={code}
            readOnly
            disabled={isLoadingCode}
            helperText={codeHelperText}
          />
          <Input
            label="Họ và tên"
            placeholder="VD: Nguyễn Văn A"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            errorMessage={errors.fullName}
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="khachhang@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          errorMessage={errors.email}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Số điện thoại"
            placeholder="09xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            errorMessage={errors.phone}
            required
          />
          <Select
            label="Trạng thái"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(v) => setStatus(v as CustomerStatus)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <RadioGroup legend="Giới tính" direction="horizontal">
            <Radio
              name="customer-gender"
              value="male"
              label="Nam"
              checked={gender === "male"}
              onChange={() => setGender("male")}
            />
            <Radio
              name="customer-gender"
              value="female"
              label="Nữ"
              checked={gender === "female"}
              onChange={() => setGender("female")}
            />
            <Radio
              name="customer-gender"
              value="other"
              label="Khác"
              checked={gender === "other"}
              onChange={() => setGender("other")}
            />
          </RadioGroup>

          <DateInput
            label="Ngày sinh"
            value={dateOfBirth}
            onChange={setDateOfBirth}
            placeholder="DD/MM/YYYY"
          />
        </div>

        <p className="text-xs text-secondary-500">
          * Địa chỉ giao hàng được quản lý riêng từ trang chi tiết khách hàng.
        </p>
      </div>
    </Modal>
  );
}
