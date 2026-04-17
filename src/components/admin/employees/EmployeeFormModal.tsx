"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { DateInput } from "@/src/components/ui/DateInput";
import { Button } from "@/src/components/ui/Button";
import { RadioGroup, Radio } from "@/src/components/ui/Radio";
import { ImageField, emptyImageField, imageFieldFromUrl } from "@/src/components/ui/ImageField";
import type { ImageFieldValue } from "@/src/components/ui/ImageField";
import { createEmployee, updateEmployee } from "@/src/services/employee.service";
import type { NhanVien, EmployeeStatus, GenderType } from "@/src/types/employee.types";
import type { VaiTro } from "@/src/types/role.types";
import { MOCK_EMPLOYEES } from "@/src/app/(dashboard)/employees/_mock";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: NhanVien | null;
  allRoles: VaiTro[];
  onSaved: (employee: NhanVien) => void;
}

const STATUS_OPTIONS = [
  { value: "active",    label: "Đang hoạt động" },
  { value: "inactive",  label: "Tạm ngưng" },
  { value: "suspended", label: "Đình chỉ" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function EmployeeFormModal({
  isOpen,
  onClose,
  employee,
  allRoles,
  onSaved,
}: EmployeeFormModalProps) {
  const isEdit = Boolean(employee);

  const [code, setCode] = useState(employee?.code ?? "");
  const [fullName, setFullName] = useState(employee?.fullName ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [roleIds, setRoleIds] = useState<string[]>(employee?.roleIds ?? []);
  const [status, setStatus] = useState<EmployeeStatus>(employee?.status ?? "active");
  const [hireDate, setHireDate] = useState(employee?.hireDate ?? "");
  const [gender, setGender] = useState<GenderType | null>(employee?.gender ?? null);
  const [dateOfBirth, setDateOfBirth] = useState(employee?.dateOfBirth ?? "");
  const [avatarImage, setAvatarImage] = useState<ImageFieldValue>(
    employee?.avatarUrl ? imageFieldFromUrl(employee.avatarUrl) : emptyImageField()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Sync form fields when the modal re-opens with different employee data
  useEffect(() => {
    if (isOpen) {
      setCode(employee?.code ?? "");
      setFullName(employee?.fullName ?? "");
      setEmail(employee?.email ?? "");
      setPhone(employee?.phone ?? "");
      setRoleIds(employee?.roleIds ?? []);
      setStatus(employee?.status ?? "active");
      setHireDate(employee?.hireDate ?? "");
      setGender(employee?.gender ?? null);
      setDateOfBirth(employee?.dateOfBirth ?? "");
      setErrors({});
    }
  }, [isOpen, employee]);

  const roleOptions = allRoles.map((r) => ({ value: r.id, label: r.name }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!code.trim()) next.code = "Mã nhân viên không được để trống.";
    if (!fullName.trim()) next.fullName = "Họ tên không được để trống.";
    if (!email.trim()) {
      next.email = "Email không được để trống.";
    } else {
      // Check email uniqueness against mock data (excluding self when editing)
      const duplicate = MOCK_EMPLOYEES.find(
        (e) => e.email === email.trim() && e.id !== employee?.id
      );
      if (duplicate) next.email = "Email này đã được sử dụng bởi nhân viên khác.";
    }
    if (!phone.trim()) next.phone = "Số điện thoại không được để trống.";
    if (!hireDate) next.hireDate = "Ngày vào làm không được để trống.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setIsSaving(true);
    const selectedRoleNames = allRoles
      .filter((r) => roleIds.includes(r.id))
      .map((r) => r.name);
    try {
      const saved = isEdit && employee
        ? await updateEmployee(employee.id, {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            roleIds,
            roleNames: selectedRoleNames,
            status,
            hireDate,
            gender,
            dateOfBirth: dateOfBirth || null,
          })
        : await createEmployee({
            code: code.trim(),
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            roleIds,
            roleNames: selectedRoleNames,
            status,
            hireDate,
            gender,
            dateOfBirth: dateOfBirth || null,
            avatarUrl: avatarImage.displayUrl ?? undefined,
            avatarAssetId: avatarImage.assetId ?? undefined,
          });
      onSaved(saved);
      onClose();
    } finally {
      setIsSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, employee, code, fullName, email, phone, roleIds, status, hireDate, gender, dateOfBirth, allRoles, onSaved, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
      size="2xl"
      animated
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Tạo nhân viên"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mã nhân viên"
            placeholder="VD: NV-016"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            errorMessage={errors.code}
            disabled={isEdit}
            required
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="email@techstore.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            errorMessage={errors.email}
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

        <Select
          label="Vai trò"
          options={roleOptions}
          value={roleIds}
          onChange={(v) => setRoleIds(v as string[])}
          multiple
          placeholder="Chọn vai trò…"
        />

        <ImageField
          label="Ảnh đại diện"
          value={avatarImage}
          onChange={setAvatarImage}
          aspectRatioHint="1:1 — Kích thước đề nghị 200 × 200 px"
          allowedTypes={["image"]}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Trạng thái"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(v) => setStatus(v as EmployeeStatus)}
          />
          <DateInput
            label="Ngày vào làm"
            value={hireDate}
            onChange={(v) => setHireDate(v)}
            errorMessage={errors.hireDate}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <RadioGroup legend="Giới tính" direction="horizontal">
            <Radio
              name="employee-gender"
              value="male"
              label="Nam"
              checked={gender === "male"}
              onChange={() => setGender("male")}
            />
            <Radio
              name="employee-gender"
              value="female"
              label="Nữ"
              checked={gender === "female"}
              onChange={() => setGender("female")}
            />
            <Radio
              name="employee-gender"
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
      </div>
    </Modal>
  );
}
