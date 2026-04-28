import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getVariantById, getVariantSalesStats } from "@/src/services/product.service";
import {
  VariantHeader,
  ProductSummaryCard,
  VariantInfoSection,
  PricingStatusSection,
  VariantDescriptionSection,
  SpecificationGroupPanel,
  MediaGallery,
  VariantSalesStatsCard,
  VariantReviewsSection,
} from "@/src/components/admin/variant";

// ─── Route config ──────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}): Promise<Metadata> {
  const { id, variantId } = await params;
  const variant = await getVariantById(id, variantId);
  return {
    title: variant
      ? `${variant.name} — Variant — Admin`
      : "Variant not found — Admin",
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function VariantDetailPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}) {
  const { id, variantId } = await params;

  const [product, variant, salesStats] = await Promise.all([
    getProductById(id),
    getVariantById(id, variantId),
    getVariantSalesStats(id, variantId),
  ]);

  if (!product || !variant) notFound();

  return (
    <div className="space-y-6 p-6">
      <VariantHeader product={product} variant={variant} />

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        {/* ── Left column ── */}
        <div className="space-y-4">
          <ProductSummaryCard product={product} />
          <PricingStatusSection variant={variant} />
          <VariantInfoSection variant={variant} />
          <VariantSalesStatsCard stats={salesStats} />
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">
          <VariantDescriptionSection
            description={variant.description}
            productId={product.id}
            variantId={variant.id}
          />

          {/* Specifications — one card per group */}
          {variant.specificationGroups.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">
                Thông số kỹ thuật
              </h2>
              {variant.specificationGroups.map((group) => (
                <SpecificationGroupPanel key={group.id} group={group} />
              ))}
            </div>
          )}

          <MediaGallery media={variant.media} />

          {/* ── Customer reviews ── */}
          <VariantReviewsSection variantId={variantId} />
        </div>
      </div>
    </div>
  );
}
