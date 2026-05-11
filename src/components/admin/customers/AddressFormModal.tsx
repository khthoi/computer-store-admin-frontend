"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { addAddress, updateAddress } from "@/src/services/customer.service";
import type { DiaChiGiaoHang } from "@/src/types/customer.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  address?: DiaChiGiaoHang | null;
  onSaved: (address: DiaChiGiaoHang) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddressFormModal({
  isOpen,
  onClose,
  customerId,
  address,
  onSaved,
}: AddressFormModalProps) {
  const isEdit = Boolean(address);

  const [recipientName, setRecipientName] = useState(address?.recipientName ?? "");
  const [phone, setPhone] = useState(address?.phone ?? "");
  const [ward, setWard] = useState(address?.ward ?? "");
  const [district, setDistrict] = useState(address?.district ?? "");
  const [province, setProvince] = useState(address?.province ?? "");
  const [addressLine, setAddressLine] = useState(address?.addressLine ?? "");
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRecipientName(address?.recipientName ?? "");
      setPhone(address?.phone ?? "");
      setWard(address?.ward ?? "");
      setDistrict(address?.district ?? "");
      setProvince(address?.province ?? "");
      setAddressLine(address?.addressLine ?? "");
      setIsDefault(address?.isDefault ?? false);
      setErrors({});
    }
  }, [isOpen, address]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!recipientName.trim()) next.recipientName = "Họ tên người nhận không được để trống.";
    if (!phone.trim()) next.phone = "Số điện thoại không được để trống.";
    if (!ward.trim()) next.ward = "Phường/Xã không được để trống.";
    if (!district.trim()) next.district = "Quận/Huyện không được để trống.";
    if (!province.trim()) next.province = "Tỉnh/Thành phố không được để trống.";
    if (!addressLine.trim()) next.addressLine = "Địa chỉ chi tiết không được để trống.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = {
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        addressLine: addressLine.trim(),
        ward: ward.trim(),
        district: district.trim(),
        province: province.trim(),
        isDefault,
      };
      const saved = isEdit && address
        ? await updateAddress(customerId, address.id, payload)
        : await addAddress(customerId, payload);
      onSaved(saved);
      onClose();
    } finally {
      setIsSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, address, customerId, recipientName, phone, addressLine, ward, district, province, isDefault, onSaved, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ giao hàng"}
      size="lg"
      animated
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Thêm địa chỉ"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Họ tên người nhận"
            placeholder="VD: Nguyễn Văn A"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            errorMessage={errors.recipientName}
            required
          />
          <Input
            label="Số điện thoại"
            placeholder="09xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            errorMessage={errors.phone}
            required
          />
        </div>

        <Input
          label="Phường/Xã"
          placeholder="VD: Phường Bến Nghé"
          value={ward}
          onChange={(e) => setWard(e.target.value)}
          errorMessage={errors.ward}
          required
        />

        <Input
          label="Quận/Huyện"
          placeholder="VD: Quận 1"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          errorMessage={errors.district}
          required
        />

        <Input
          label="Tỉnh/Thành phố"
          placeholder="VD: TP. Hồ Chí Minh"
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          errorMessage={errors.province}
          required
        />

        <Textarea
          label="Địa chỉ chi tiết"
          placeholder="Số nhà, tên đường, tòa nhà…"
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          errorMessage={errors.addressLine}
          rows={3}
          showCharCount
          maxCharCount={400}
          required
        />

        <Checkbox
          label="Đặt làm địa chỉ mặc định"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
      </div>
    </Modal>
  );
}
