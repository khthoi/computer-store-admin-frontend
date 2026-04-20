"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { createVariantDetail } from "@/src/services/product.service";
import { VariantInfoForm } from "@/src/components/admin/variantEdit/VariantInfoForm";
import { PricingStatusForm } from "@/src/components/admin/variantEdit/PricingStatusForm";
import { SpecificationEditor } from "@/src/components/admin/variantEdit/SpecificationEditor";
import { MediaManager } from "@/src/components/admin/variantEdit/MediaManager";
import type { SpecificationGroup, VariantMedia } from "@/src/types/product.types";
import type { VariantInfoFormValue } from "@/src/components/admin/variantEdit/VariantInfoForm";
import type { PricingStatusFormValue } from "@/src/components/admin/variantEdit/PricingStatusForm";

// ─── Dynamic import — CKEditor must be client-only ───────────────────────────

const RichTextEditor = dynamic(
  () => import("@/src/components/editor").then((m) => ({ default: m.RichTextEditor })),
  {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse rounded-lg bg-secondary-100" />,
  }
);

// ─── VariantFormPage ──────────────────────────────────────────────────────────

export interface VariantFormPageProps {
  mode: "create";
  productId: string;
  productName: string;
  /** Spec groups seeded from the product's category template, values pre-set to "". */
  specTemplate?: SpecificationGroup[];
}

export function VariantFormPage({ productId, productName, specTemplate = [] }: VariantFormPageProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // ── Section state ─────────────────────────────────────────────────────────

  const [info, setInfo] = useState<VariantInfoFormValue>({
    name:   "",
    sku:    "",
    weight: "",
  });

  const [pricing, setPricing] = useState<PricingStatusFormValue>({
    originalPrice: "",
    salePrice:     "",
    status:        "visible",
    isDefault:     false,
  });

  const [description, setDescription] = useState("");
  const [specs, setSpecs]             = useState<SpecificationGroup[]>(specTemplate);
  const [media, setMedia]             = useState<VariantMedia[]>([]);

  const [errors, setErrors]   = useState<Record<string, string>>({});
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

  async function handleCreate() {
    if (!validate()) {
      showToast("Please fix the errors before saving.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const created = await createVariantDetail(productId, {
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
      showToast("Variant created successfully.", "success");
      router.push(`/products/${productId}/variants/${created.id}`);
    } catch {
      showToast("Failed to create variant. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  }

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
              href={`/products/${productId}`}
              className="max-w-[200px] truncate transition-colors hover:text-secondary-700"
              title={productName}
            >
              {productName}
            </Link>
            <span aria-hidden="true">›</span>
            <Link
              href={`/products/${productId}/variants`}
              className="transition-colors hover:text-secondary-700"
            >
              Phiên bản
            </Link>
            <span aria-hidden="true">›</span>
            <span className="text-secondary-600">Thêm mới</span>
          </nav>

          {/* Title */}
          <h1 className="mt-2 text-2xl font-bold text-secondary-900">Thêm mới phiên bản</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 fixed right-8 top-25 z-30">
          <Link
            href={`/products/${productId}`}
            className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Huỷ
          </Link>
          <Button
            variant="primary"
            isLoading={isSaving}
            onClick={handleCreate}
          >
            Xác nhận
          </Button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid gap-6 xl:grid-cols-[400px_1fr] xl:items-start">

        {/* ── Left column ── */}
        <div className="space-y-4 xl:relative xl:top-0">
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
          <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
              Mô tả phiên bản
            </h2>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Write the variant description…"
              minHeight={240}
            />
          </div>

          {/* Specifications */}
          <SpecificationEditor groups={specs} onChange={setSpecs} />
          {specs.length === 0 && (
            <p className="text-sm text-secondary-400">
              No specification template found for this category.
            </p>
          )}

          {/* Media */}
          <MediaManager
            variantId=""
            media={media}
            onChange={setMedia}
          />
        </div>
      </div>
    </div>
  );
}
