"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Spinner } from "@/src/components/ui/Spinner";

// ─── Types ────────────────────────────────────────────────────────────────────

type BulkField =
  | "status"
  | "category"
  | "brand"
  | "price_adjust"
  | "tags_add"
  | "tags_remove";

export interface ProductBulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkEdit: (payload: {
    field: BulkField;
    value: string;
    productIds: string[];
  }) => void;
  selectedProductIds: string[];
  isConfirming?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BULK_FIELD_OPTIONS = [
  { value: "status", label: "Trạng thái" },
  { value: "category", label: "Danh mục" },
  { value: "brand", label: "Thương hiệu" },
  { value: "price_adjust", label: "Điều chỉnh giá (%)" },
  { value: "tags_add", label: "Thêm tags" },
  { value: "tags_remove", label: "Xóa tags" },
];

const STATUS_OPTIONS = [
  { value: "published", label: "Đã xuất bản" },
  { value: "draft", label: "Bản nháp" },
  { value: "archived", label: "Đã lưu trữ" },
];

const CATEGORY_OPTIONS = [
  { value: "cpu", label: "CPU / Vi xử lý" },
  { value: "gpu", label: "GPU / Card đồ họa" },
  { value: "mainboard", label: "Mainboard" },
  { value: "ram", label: "RAM" },
  { value: "ssd", label: "SSD" },
  { value: "hdd", label: "HDD" },
  { value: "psu", label: "Nguồn máy tính" },
  { value: "case", label: "Vỏ máy tính" },
  { value: "cooling", label: "Tản nhiệt" },
  { value: "monitor", label: "Màn hình" },
];

const BRAND_OPTIONS = [
  { value: "asus", label: "ASUS" },
  { value: "msi", label: "MSI" },
  { value: "gigabyte", label: "Gigabyte" },
  { value: "intel", label: "Intel" },
  { value: "amd", label: "AMD" },
  { value: "nvidia", label: "NVIDIA" },
  { value: "samsung", label: "Samsung" },
  { value: "corsair", label: "Corsair" },
  { value: "g-skill", label: "G.Skill" },
  { value: "nzxt", label: "NZXT" },
  { value: "cooler-master", label: "Cooler Master" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductBulkEditModal({
  isOpen,
  onClose,
  onBulkEdit,
  selectedProductIds,
  isConfirming = false,
}: ProductBulkEditModalProps) {
  const [selectedField, setSelectedField] = useState<BulkField>("status");
  const [fieldValue, setFieldValue] = useState("");

  function handleConfirm() {
    if (!fieldValue) return;
    onBulkEdit({
      field: selectedField,
      value: fieldValue,
      productIds: selectedProductIds,
    });
  }

  function handleFieldChange(field: BulkField) {
    setSelectedField(field);
    setFieldValue("");
  }

  // ── Dynamic value input based on selected field ───────────────────────────

  function renderValueInput() {
    switch (selectedField) {
      case "status":
        return (
          <Select
            label="Trạng thái mới"
            options={STATUS_OPTIONS}
            value={fieldValue}
            onChange={(v) => setFieldValue(v as string)}
            placeholder="Chọn trạng thái…"
          />
        );

      case "category":
        return (
          <Select
            label="Danh mục mới"
            options={CATEGORY_OPTIONS}
            value={fieldValue}
            onChange={(v) => setFieldValue(v as string)}
            placeholder="Chọn danh mục…"
            searchable
          />
        );

      case "brand":
        return (
          <Select
            label="Thương hiệu mới"
            options={BRAND_OPTIONS}
            value={fieldValue}
            onChange={(v) => setFieldValue(v as string)}
            placeholder="Chọn thương hiệu…"
            searchable
          />
        );

      case "price_adjust":
        return (
          <Input
            type="number"
            label="% điều chỉnh giá"
            placeholder="VD: 10 để tăng 10%, -5 để giảm 5%"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            helperText="Nhập số âm để giảm giá, số dương để tăng giá"
          />
        );

      case "tags_add":
        return (
          <Input
            label="Tags (phân cách bằng dấu phẩy)"
            placeholder="VD: gaming, high-end, sale"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            helperText="Các tag sẽ được thêm vào sản phẩm đã chọn"
          />
        );

      case "tags_remove":
        return (
          <Input
            label="Tags (phân cách bằng dấu phẩy)"
            placeholder="VD: old-tag, outdated"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            helperText="Các tag sẽ bị xóa khỏi sản phẩm đã chọn"
          />
        );

      default:
        return null;
    }
  }

  const canConfirm = Boolean(fieldValue) && !isConfirming;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chỉnh sửa hàng loạt (${selectedProductIds.length} sản phẩm)`}
      size="md"
      animated
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isConfirming}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="min-w-[100px]"
          >
            {isConfirming ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" color="white" label="Đang cập nhật…" />
                Đang xử lý…
              </span>
            ) : (
              "Xác nhận"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Field selector */}
        <Select
          label="Trường cần thay đổi"
          options={BULK_FIELD_OPTIONS}
          value={selectedField}
          onChange={(v) => handleFieldChange(v as BulkField)}
        />

        {/* Dynamic value input */}
        {renderValueInput()}

        {/* Preview count */}
        <div className="rounded-lg bg-info-50 border border-info-200 px-4 py-3">
          <p className="text-sm text-info-700 font-medium">
            Sẽ cập nhật{" "}
            <span className="font-bold">
              {selectedProductIds.length} sản phẩm
            </span>
          </p>
          {selectedProductIds.length > 0 && (
            <p className="text-xs text-info-600 mt-0.5">
              Thao tác này không thể hoàn tác sau khi xác nhận.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
