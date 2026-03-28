"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { createVariant, updateVariant } from "@/src/services/variant.service";
import type { PhienBanSanPham } from "@/src/types/variant.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VariantFormPageProps {
  mode: "create" | "edit";
  productId: string;
  productName: string;
  variant?: PhienBanSanPham;
}

interface FormErrors {
  name?: string;
  sku?: string;
  price?: string;
  stock?: string;
}

const STATUS_OPTIONS = [
  { value: "active",   label: "Kích hoạt" },
  { value: "inactive", label: "Tắt" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function VariantFormPage({
  mode,
  productId,
  productName,
  variant,
}: VariantFormPageProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [name,     setName]     = useState(variant?.name  ?? "");
  const [sku,      setSku]      = useState(variant?.sku   ?? "");
  const [price,    setPrice]    = useState(variant ? String(variant.price) : "");
  const [stock,    setStock]    = useState(variant ? String(variant.stock) : "");
  const [status,   setStatus]   = useState<string>(variant?.status ?? "active");
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const backHref = `/products/${productId}/variants`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Tên phiên bản là bắt buộc.";
    if (!sku.trim())  newErrors.sku  = "SKU là bắt buộc.";
    const priceNum = Number(price);
    if (price === "" || isNaN(priceNum) || priceNum < 0) {
      newErrors.price = "Nhập giá hợp lệ (≥ 0).";
    }
    const stockNum = Number(stock);
    if (stock === "" || isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      newErrors.stock = "Số nguyên ≥ 0.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    try {
      if (mode === "create") {
        await createVariant(productId, productName, {
          name: name.trim(),
          sku: sku.trim(),
          price: priceNum,
          stock: stockNum,
          status: status as "active" | "inactive",
        });
        showToast("Đã thêm phiên bản.", "success");
      } else {
        await updateVariant(productId, variant!.id, {
          name: name.trim(),
          sku: sku.trim(),
          price: priceNum,
          stock: stockNum,
          status: status as "active" | "inactive",
        });
        showToast("Đã cập nhật phiên bản.", "success");
      }
      router.push(backHref);
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-secondary-500 transition-colors hover:text-secondary-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Phiên bản sản phẩm
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          {mode === "create" ? "Thêm phiên bản" : `Sửa: ${variant!.name}`}
        </h1>
        <p className="mt-1 text-sm text-secondary-500">{productName}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-secondary-500">
            Thông tin phiên bản
          </h2>

          <div className="space-y-5">
            {/* Name + SKU */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Tên phiên bản"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="Ví dụ: 16GB DDR5-6400"
                required
                fullWidth
                errorMessage={errors.name}
              />
              <Input
                label="SKU"
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value);
                  setErrors((p) => ({ ...p, sku: undefined }));
                }}
                placeholder="Ví dụ: SAM-990PRO-1TB"
                required
                fullWidth
                errorMessage={errors.sku}
              />
            </div>

            {/* Price + Stock + Status */}
            <div className="grid gap-5 sm:grid-cols-3">
              <Input
                label="Giá (VND)"
                type="number"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setErrors((p) => ({ ...p, price: undefined }));
                }}
                placeholder="0"
                min={0}
                required
                fullWidth
                errorMessage={errors.price}
              />
              <Input
                label="Tồn kho"
                type="number"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  setErrors((p) => ({ ...p, stock: undefined }));
                }}
                placeholder="0"
                min={0}
                step={1}
                required
                fullWidth
                errorMessage={errors.stock}
              />
              <Select
                label="Trạng thái"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(v) => setStatus(v as string)}
                required
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
          >
            Hủy
          </Link>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            {mode === "create" ? "Thêm phiên bản" : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
