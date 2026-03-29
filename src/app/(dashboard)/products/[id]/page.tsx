import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  TagIcon,
  CubeIcon,
  CalendarDaysIcon,
  ArchiveBoxIcon,
  PencilSquareIcon,
  StarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { getProductById } from "@/src/services/product.service";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Badge } from "@/src/components/ui/Badge";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { VariantsPanel } from "@/src/app/(dashboard)/products/[id]/VariantsPanel";
import type { CreatorRole } from "@/src/types/product.types";
import type { BadgeVariant } from "@/src/components/ui/Badge";

// ─── Route config ──────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return {
    title: product
      ? `${product.name} — Products — Admin`
      : "Product not found — Admin",
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ROLE_VARIANT: Record<CreatorRole, BadgeVariant> = {
  Admin:  "primary",
  Editor: "success",
  Staff:  "warning",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const activeCount   = product.variants.filter((v) => v.status === "active").length;
  const lowStockCount = product.variants.filter((v) => v.stock > 0 && v.stock <= 5).length;
  const outOfStock    = product.variants.filter((v) => v.stock === 0).length;

  return (
    <div className="space-y-6 p-6">
      {/* Back link */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-secondary-500 transition-colors hover:text-secondary-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Products
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{product.name}</h1>
          <p className="mt-1 font-mono text-xs text-secondary-400">{product.slug}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={product.status} />
            {product.hasActiveOrders && (
              <Badge variant="warning" size="sm">Has active orders</Badge>
            )}
          </div>

          {/* Creator info */}
          {product.createdBy && (
            <div className="mt-3 flex items-center gap-2">
              <UserCircleIcon className="h-4 w-4 shrink-0 text-secondary-400" />
              <span className="text-sm text-secondary-400">Created by</span>
              {/*
               * Superscript / exponent layout:
               * The role Badge sits on a raised baseline (-top-2) relative to the
               * creator name, visually mimicking the "x²" exponent notation.
               */}
              <span className="inline-flex items-baseline gap-1">
                <span className="text-sm font-medium text-secondary-700">
                  {product.createdBy.name}
                </span>
                <span className="relative -top-2">
                  <Badge
                    variant={ROLE_VARIANT[product.createdBy.role]}
                    size="sm"
                  >
                    {product.createdBy.role}
                  </Badge>
                </span>
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/products/${product.id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
          Edit Product
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        {/* ── Left: Info + Stats ── */}
        <div className="space-y-4">
          {/* Product info card */}
          <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
              Product Info
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-secondary-700">
                <TagIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
                <span>
                  <span className="text-secondary-400">Category: </span>
                  {product.category}
                </span>
              </li>

              {/* Brand — one or more badges */}
              <li className="flex items-start gap-3">
                <CubeIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
                <div>
                  <span className="text-secondary-400">
                    {product.brands.length === 1 ? "Brand" : "Brands"}
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {product.brands.map((b) => (
                      <Badge key={b} variant="default" size="sm">{b}</Badge>
                    ))}
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3 text-secondary-700">
                <ArchiveBoxIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
                <span>
                  <span className="text-secondary-400">Total stock: </span>
                  <span
                    className={`font-medium ${
                      product.totalStock === 0
                        ? "text-error-600"
                        : product.totalStock <= 5
                        ? "text-warning-600"
                        : "text-secondary-900"
                    }`}
                  >
                    {product.totalStock}
                  </span>
                </span>
              </li>

              {/* Rating + reviews */}
              {product.averageRating !== undefined && (
                <li className="flex items-start gap-3 text-secondary-700">
                  <StarIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
                  <span>
                    <span className="text-secondary-400">Rating: </span>
                    <span className="font-medium text-secondary-900">
                      {product.averageRating.toFixed(1)}
                    </span>
                    <span className="text-secondary-400"> / 5</span>
                    {product.reviewCount !== undefined && (
                      <span className="ml-2 text-xs text-secondary-400">
                        ({product.reviewCount.toLocaleString()} reviews)
                      </span>
                    )}
                  </span>
                </li>
              )}

              <li className="flex items-start gap-3 text-secondary-700">
                <CalendarDaysIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
                <span>
                  <span className="text-secondary-400">Created: </span>
                  {formatDate(product.createdAt)}
                </span>
              </li>
              <li className="flex items-start gap-3 text-secondary-700">
                <CalendarDaysIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
                <span>
                  <span className="text-secondary-400">Updated: </span>
                  {formatDateTime(product.updatedAt)}
                </span>
              </li>
            </ul>
          </div>

          {/* Variant summary stats */}
          <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
              Variant Summary
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-500">Total variants</span>
                <span className="font-semibold text-secondary-900">
                  {product.variants.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-500">Active</span>
                <span className="font-semibold text-secondary-900">{activeCount}</span>
              </div>
              {lowStockCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-500">Low stock (≤ 5)</span>
                  <span className="font-semibold text-warning-600">{lowStockCount}</span>
                </div>
              )}
              {outOfStock > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-500">Out of stock</span>
                  <span className="font-semibold text-error-600">{outOfStock}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Variants tab ── */}
        <div className="overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-sm">
          <Tabs
            tabs={[
              {
                value: "variants",
                label: `Variants (${product.variants.length})`,
                icon: <CubeIcon className="h-4 w-4" />,
              },
            ]}
            defaultValue="variants"
            className="border-b border-secondary-200 px-6"
          >
            <TabPanel value="variants" className="p-6">
              <VariantsPanel
                productId={product.id}
                initialVariants={product.variants}
              />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
