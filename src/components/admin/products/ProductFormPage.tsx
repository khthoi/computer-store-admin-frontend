"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { CategoryTreeSelect } from "@/src/components/admin/CategoryTreeSelect";
import type { CategoryNode } from "@/src/components/admin/CategoryTreeSelect";
import {
  RowActions,
  RowActionView,
  RowActionDelete,
} from "@/src/components/admin/DataTable";
import { useToast } from "@/src/components/ui/Toast";
import {
  createProduct,
  updateProduct,
  deleteVariant,
} from "@/src/services/product.service";
import { formatVND } from "@/src/lib/format";
import type { Product, ProductVariant } from "@/src/types/product.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductFormPageProps {
  mode: "create" | "edit";
  product?: Product;
  categories: CategoryNode[];
  brands: string[];
}

interface FormErrors {
  name?: string;
  category?: string;
  brand?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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

const STATUS_OPTIONS = [
  { value: "draft",     label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived",  label: "Archived" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductFormPage({
  mode,
  product,
  categories,
  brands,
}: ProductFormPageProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // ── Field state ─────────────────────────────────────────────────────────
  const [name,     setName]     = useState(product?.name     ?? "");
  const [slug,     setSlug]     = useState(product?.slug     ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [brand,    setBrand]    = useState<string[]>(product?.brands ?? []);
  const [status,   setStatus]   = useState<string>(product?.status ?? "draft");
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track whether the user has manually edited the slug field
  const slugTouched = useRef(mode === "edit");

  // ── Variant list state (edit mode — deletions reflected immediately) ─────
  const [variantList, setVariantList] = useState<ProductVariant[]>(
    product?.variants ?? []
  );
  const [deleteTarget,  setDeleteTarget]  = useState<ProductVariant | null>(null);
  const [isDeleting,    setIsDeleting]    = useState(false);

  // ── Name → auto-slug ────────────────────────────────────────────────────
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (!slugTouched.current) setSlug(slugify(value));
    setErrors((prev) => ({ ...prev, name: undefined }));
  }, []);

  const handleSlugChange = useCallback((value: string) => {
    slugTouched.current = true;
    setSlug(slugify(value));
  }, []);

  // ── Variant delete ───────────────────────────────────────────────────────
  const handleVariantDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteVariant(deleteTarget.id);
      setVariantList((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!name.trim())     newErrors.name     = "Product name is required.";
    if (!category.trim()) newErrors.category = "Category is required.";
    if (brand.length === 0) newErrors.brand  = "Brand is required.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const finalSlug = slug.trim() || slugify(name.trim());

      if (mode === "create") {
        const created = await createProduct({
          name:     name.trim(),
          slug:     finalSlug,
          category: category.trim(),
          brands:   brand,
          status:   status as Product["status"],
          variants: [],
        });
        showToast("Product created successfully.", "success");
        router.push(`/products/${created.id}`);
      } else {
        const updated = await updateProduct(product!.id, {
          name:     name.trim(),
          slug:     finalSlug,
          category: category.trim(),
          brands:   brand,
          status:   status as Product["status"],
          // variants intentionally omitted — managed via the detail page
        });
        showToast("Product updated successfully.", "success");
        router.push(`/products/${updated.id}`);
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const backHref = mode === "edit" ? `/products/${product!.id}` : "/products";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-secondary-500 transition-colors hover:text-secondary-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {mode === "edit" ? "Back to product" : "Products"}
      </Link>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          {mode === "create" ? "Add Product" : `Edit: ${product!.name}`}
        </h1>
        <p className="mt-1 text-sm text-secondary-500">
          {mode === "create"
            ? "Fill in the details below to create a new product."
            : "Update the product details below."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* ── Basic Info ── */}
        <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-secondary-500">
            Basic Info
          </h2>

          <div className="space-y-5">
            {/* Name + Slug */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Product Name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. ASUS ROG Strix GeForce RTX 4090"
                required
                fullWidth
                errorMessage={errors.name}
              />
              <Input
                label="Slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-generated from name"
                fullWidth
                helperText="Used in the URL. Auto-generated from name."
              />
            </div>

            {/* Category + Brand */}
            <div className="grid gap-5 sm:grid-cols-2">
              <CategoryTreeSelect
                label="Category"
                categories={categories}
                value={category || undefined}
                onChange={(id) => {
                  setCategory(id);
                  setErrors((prev) => ({ ...prev, category: undefined }));
                }}
                placeholder="Select a category"
                required
                helperText="Browse the hierarchy and select the most specific category."
                errorMessage={errors.category}
              />
              <Select
                label="Brand"
                value={brand}
                onChange={(v) => setBrand(v as string[])}
                placeholder="e.g. ASUS"
                required
                multiple
                searchable
                clearable
                creatable
                helperText="Select existing brands or type to create a new one."
                options={brands.map((b) => ({ value: b, label: b }))}
                errorMessage={errors.brand}
              />
            </div>

            {/* Status */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(v) => setStatus(v as string)}
                required
              />
            </div>
          </div>
        </div>

        {/* ── Variants ── */}
        <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">
              Variants
              {variantList.length > 0 && (
                <span className="ml-2 font-normal normal-case text-secondary-400">
                  ({variantList.length})
                </span>
              )}
            </h2>
          </div>

          {variantList.length === 0 ? (
            <p className="py-6 text-center text-sm text-secondary-400">
              {mode === "create"
                ? "Variants can be added after saving the product."
                : "No variants yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-secondary-100">
                    <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-secondary-500">
                      Variant
                    </th>
                    <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-secondary-500">
                      SKU
                    </th>
                    <th className="pb-3 pr-4 text-right text-xs font-medium uppercase tracking-wide text-secondary-500">
                      Price
                    </th>
                    <th className="pb-3 pr-4 text-center text-xs font-medium uppercase tracking-wide text-secondary-500">
                      Stock
                    </th>
                    <th className="pb-3 pr-4 text-center text-xs font-medium uppercase tracking-wide text-secondary-500">
                      Status
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-secondary-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {variantList.map((v) => (
                    <tr key={v.id} className="transition-colors hover:bg-secondary-50/50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-secondary-800">{v.name}</p>
                        <p className="mt-0.5 text-xs text-secondary-400">
                          {formatDateTime(v.updatedAt)}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs text-secondary-600">{v.sku}</span>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <span className="font-medium tabular-nums text-secondary-800">
                          {formatVND(v.price)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        {v.stock === 0 ? (
                          <Badge variant="error" size="sm">Out of stock</Badge>
                        ) : v.stock <= 5 ? (
                          <Badge variant="warning" size="sm">{v.stock} left</Badge>
                        ) : (
                          <span className="text-secondary-700">{v.stock.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <StatusBadge status={v.status} size="sm" />
                      </td>
                      <td className="py-3 text-right">
                        <RowActions>
                          <RowActionView
                            href={`/products/${product!.id}/variants/${v.id}`}
                            ariaLabel={`View variant ${v.name}`}
                          />
                          <RowActionDelete
                            ariaLabel={`Delete variant ${v.name}`}
                            onClick={() => setDeleteTarget(v)}
                          />
                        </RowActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Submit bar ── */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400"
          >
            Cancel
          </Link>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mode === "create" ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Variant delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleVariantDeleteConfirm}
        title="Delete Variant"
        description={`This will permanently delete "${deleteTarget?.name}" (${deleteTarget?.sku}). This action cannot be undone.`}
        confirmLabel="Delete Variant"
        requiredPhrase={deleteTarget?.sku}
        isConfirming={isDeleting}
      />
    </div>
  );
}
