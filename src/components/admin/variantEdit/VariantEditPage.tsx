"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { updateVariantDetail } from "@/src/services/product.service";
import { VariantInfoForm } from "./VariantInfoForm";
import { PricingStatusForm } from "./PricingStatusForm";
import { SpecificationEditor } from "./SpecificationEditor";
import { MediaManager } from "./MediaManager";
import { VariantDescriptionSection } from "@/src/components/admin/variant/VariantDescriptionSection";
import type { Product, ProductVariantDetail, SpecificationGroup, VariantMedia } from "@/src/types/product.types";
import type { VariantInfoFormValue } from "./VariantInfoForm";
import type { PricingStatusFormValue } from "./PricingStatusForm";

// ─── VariantEditPage ──────────────────────────────────────────────────────────

interface VariantEditPageProps {
  product: Product;
  variant: ProductVariantDetail;
}

export function VariantEditPage({ product, variant }: VariantEditPageProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // ── Section state ─────────────────────────────────────────────────────────

  const [info, setInfo] = useState<VariantInfoFormValue>({
    name:   variant.name,
    sku:    variant.sku,
    weight: variant.weight !== undefined ? String(variant.weight) : "",
  });

  const [pricing, setPricing] = useState<PricingStatusFormValue>({
    originalPrice: String(variant.originalPrice),
    salePrice:     String(variant.salePrice),
    status:        variant.status,
    isDefault:     variant.isDefault ?? false,
  });

  const [description, setDescription] = useState(variant.description);
  const [specs, setSpecs]             = useState<SpecificationGroup[]>(variant.specificationGroups);
  const [media, setMedia]             = useState<VariantMedia[]>(variant.media);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!info.name.trim())      next.name          = "Name is required.";
    if (!info.sku.trim())       next.sku           = "SKU is required.";
    if (!pricing.originalPrice) next.originalPrice = "Original price is required.";
    if (!pricing.salePrice)     next.salePrice     = "Sale price is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!validate()) {
      showToast("Please fix the errors before saving.", "error");
      return;
    }

    setIsSaving(true);
    try {
      await updateVariantDetail(product.id, variant.id, {
        name:                info.name.trim(),
        sku:                 info.sku.trim(),
        weight:              info.weight !== "" ? parseFloat(info.weight) : null,
        originalPrice:       parseFloat(pricing.originalPrice),
        salePrice:           parseFloat(pricing.salePrice),
        status:              pricing.status,
        description,
        specificationGroups: specs,
        media,
      });
      showToast("Variant saved successfully.", "success");
      router.push(`/products/${product.id}/variants/${variant.id}`);
    } catch {
      showToast("Failed to save variant. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  const cancelHref = `/products/${product.id}/variants/${variant.id}`;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/products" className="transition-colors hover:text-secondary-700">
              Danh sách sản phẩm
            </Link>
            <span aria-hidden="true">›</span>
            <Link
              href={`/products/${product.id}`}
              className="max-w-[200px] truncate transition-colors hover:text-secondary-700"
              title={product.name}
            >
              {product.name}
            </Link>
            <span aria-hidden="true">›</span>
            <Link
              href={`/products/${product.id}/variants`}
              className="transition-colors hover:text-secondary-700"
            >
              Phiên bản
            </Link>
            <span aria-hidden="true">›</span>
            <Link
              href={`/products/${product.id}/variants/${variant.id}`}
              className="max-w-[180px] truncate transition-colors hover:text-secondary-700"
              title={variant.name}
            >
              {variant.name}
            </Link>
            <span aria-hidden="true">›</span>
            <span className="text-secondary-600">Chỉnh sửa</span>
          </nav>

          {/* Title */}
          <h1 className="mt-2 text-2xl font-bold text-secondary-900">Chỉnh sửa Phiên bản</h1>
          <p className="mt-0.5 font-mono text-xs text-secondary-400">{variant.sku}</p>
        </div>

        {/* Actions
            fixed top-[80px] = below AdminHeader (h-16 = 64px) + 16px gap
            right-6 = always within content area regardless of sidebar state   */}
        <div className="fixed right-6 top-[80px] z-20 flex items-center gap-3">
          <Link
            href={cancelHref}
            className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 shadow-sm transition-colors hover:bg-secondary-50"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Hủy
          </Link>
          <Button variant="primary" isLoading={isSaving} onClick={handleSave}>
            Lưu Thay Đổi
          </Button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid gap-6 xl:grid-cols-[400px_1fr] xl:items-start">

        {/* ── Left column ── */}
        <div className="space-y-4">
          <VariantInfoForm
            value={info}
            onChange={setInfo}
            errors={{ name: errors.name, sku: errors.sku, weight: errors.weight }}
          />
          <PricingStatusForm
            value={pricing}
            onChange={setPricing}
            errors={{ originalPrice: errors.originalPrice, salePrice: errors.salePrice }}
          />
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">
          {/* Description */}
          <VariantDescriptionSection
            description={description}
            onChange={setDescription}
          />

          {/* Specifications */}
          <SpecificationEditor groups={specs} onChange={setSpecs} />

          {/* Media */}
          <MediaManager
            variantId={variant.id}
            media={media}
            onChange={setMedia}
          />
        </div>
      </div>
    </div>
  );
}
