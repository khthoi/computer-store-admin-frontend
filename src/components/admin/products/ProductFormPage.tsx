"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import {
  createProduct,
  updateProduct,
} from "@/src/services/product.service";
import type { Product, ProductVariant } from "@/src/types/product.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductFormPageProps {
  mode: "create" | "edit";
  product?: Product;
  categories: string[];
  brands: string[];
}

interface DraftVariant {
  /** Stable React key — equals variant id for existing, random for new */
  _key: string;
  /** Only set for existing variants */
  id?: string;
  name: string;
  sku: string;
  /** Stored as string to work cleanly with number inputs */
  price: string;
  stock: string;
  status: "active" | "inactive";
}

interface VariantErrors {
  name?: string;
  sku?: string;
  price?: string;
  stock?: string;
}

interface FormErrors {
  name?: string;
  category?: string;
  brand?: string;
  basePrice?: string;
  variants?: Record<string, VariantErrors>;
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

function newKey(): string {
  return `v-${Math.random().toString(36).slice(2, 9)}`;
}

function variantToDraft(v: ProductVariant): DraftVariant {
  return {
    _key: v.id,
    id: v.id,
    name: v.name,
    sku: v.sku,
    price: String(v.price),
    stock: String(v.stock),
    status: v.status,
  };
}

const STATUS_OPTIONS = [
  { value: "draft",     label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived",  label: "Archived" },
];

const VARIANT_STATUS_OPTIONS = [
  { value: "active",   label: "Active" },
  { value: "inactive", label: "Inactive" },
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
  const [name,      setName]      = useState(product?.name      ?? "");
  const [slug,      setSlug]      = useState(product?.slug      ?? "");
  const [category,  setCategory]  = useState(product?.category  ?? "");
  const [brand,     setBrand]     = useState<string[]>(
    product?.brand ? [product.brand] : []
  );
  const [status,    setStatus]    = useState<string>(product?.status ?? "draft");
  const [variants,  setVariants]  = useState<DraftVariant[]>(
    product?.variants.map(variantToDraft) ?? []
  );
  const [errors,       setErrors]       = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track whether the user has manually edited the slug field
  const slugTouched = useRef(mode === "edit");

  // ── Category / brand datalist options ───────────────────────────────────
  const categoryListId = "product-form-categories";
  const brandListId    = "product-form-brands";

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

  // ── Variant helpers ──────────────────────────────────────────────────────
  const addVariant = useCallback(() => {
    setVariants((prev) => [
      ...prev,
      { _key: newKey(), name: "", sku: "", price: "", stock: "", status: "active" },
    ]);
  }, []);

  const removeVariant = useCallback((key: string) => {
    setVariants((prev) => prev.filter((v) => v._key !== key));
  }, []);

  const updateVariantField = useCallback(
    (key: string, field: keyof Omit<DraftVariant, "_key" | "id">, value: string) => {
      setVariants((prev) =>
        prev.map((v) => (v._key === key ? { ...v, [field]: value } : v))
      );
      setErrors((prev) => {
        if (!prev.variants?.[key]) return prev;
        const updated = { ...prev.variants[key] };
        delete updated[field as keyof VariantErrors];
        return { ...prev, variants: { ...prev.variants, [key]: updated } };
      });
    },
    []
  );

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Product name is required.";
    if (!category.trim()) newErrors.category = "Category is required.";
    if (brand.length === 0) newErrors.brand = "Brand is required.";

    const variantErrors: Record<string, VariantErrors> = {};
    variants.forEach((v) => {
      const ve: VariantErrors = {};
      if (!v.name.trim()) ve.name = "Required";
      if (!v.sku.trim())  ve.sku  = "Required";
      const p = Number(v.price);
      if (v.price === "" || isNaN(p) || p < 0) ve.price = "Must be ≥ 0";
      const s = Number(v.stock);
      if (v.stock === "" || isNaN(s) || s < 0 || !Number.isInteger(s)) ve.stock = "Whole number ≥ 0";
      if (Object.keys(ve).length > 0) variantErrors[v._key] = ve;
    });
    if (Object.keys(variantErrors).length > 0) newErrors.variants = variantErrors;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Build variant payload
    const variantData = variants.map((v) => ({
      ...(v.id ? { id: v.id } : {}),
      name:   v.name.trim(),
      sku:    v.sku.trim().toUpperCase(),
      price:  Number(v.price),
      stock:  Number(v.stock),
      status: v.status,
    }));

    setIsSubmitting(true);
    try {
      const finalSlug = slug.trim() || slugify(name.trim());

      if (mode === "create") {
        const created = await createProduct({
          name:      name.trim(),
          slug:      finalSlug,
          category:  category.trim(),
          brand:     brand.join(", "),
          status:    status as Product["status"],
          variants:  variantData,
        });
        showToast("Product created successfully.", "success");
        router.push(`/products/${created.id}`);
      } else {
        const updated = await updateProduct(product!.id, {
          name:      name.trim(),
          slug:      finalSlug,
          category:  category.trim(),
          brand:     brand.join(", "),
          status:    status as Product["status"],
          variants:  variantData,
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
            : "Update the product details and variants."}
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
              <div>
                <Select
                  label="Category"
                  value={category}
                  onChange={(v) => setCategory(v as string)}
                  placeholder="e.g. GPU"
                  required
                  searchable
                  clearable
                  creatable
                  options={categories.map((c) => ({ value: c, label: c }))}
                  helperText="Select an existing category or type to create a new one."
                  errorMessage={errors.category}
                />
              </div>
              <div>
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
            </div>

            {/* Base Price + Status */}
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
              {variants.length > 0 && (
                <span className="ml-2 text-secondary-400 normal-case font-normal">
                  ({variants.length})
                </span>
              )}
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addVariant}
            >
              <PlusIcon className="h-4 w-4" />
              Add Variant
            </Button>
          </div>

          {variants.length === 0 ? (
            <p className="py-6 text-center text-sm text-secondary-400">
              No variants yet — click "Add Variant" to add the first one.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, idx) => {
                const vErr = errors.variants?.[v._key];
                return (
                  <div
                    key={v._key}
                    className="rounded-lg border border-secondary-100 bg-secondary-50/50 p-4"
                  >
                    {/* Variant header */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-secondary-400">
                        Variant {idx + 1}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove variant ${idx + 1}`}
                        onClick={() => removeVariant(v._key)}
                        className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-error-50 hover:text-error-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Name + SKU */}
                    <div className="mb-3 grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Variant Name"
                        value={v.name}
                        onChange={(e) => updateVariantField(v._key, "name", e.target.value)}
                        placeholder="e.g. 24GB GDDR6X — Standard"
                        required
                        fullWidth
                        errorMessage={vErr?.name}
                      />
                      <Input
                        label="SKU"
                        value={v.sku}
                        onChange={(e) => updateVariantField(v._key, "sku", e.target.value)}
                        placeholder="e.g. ROG-RTX4090-24G"
                        required
                        fullWidth
                        errorMessage={vErr?.sku}
                      />
                    </div>

                    {/* Price + Stock + Status */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input
                        label="Price (VND)"
                        type="number"
                        value={v.price}
                        onChange={(e) => updateVariantField(v._key, "price", e.target.value)}
                        placeholder="0"
                        min={0}
                        required
                        fullWidth
                        errorMessage={vErr?.price}
                      />
                      <Input
                        label="Stock"
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariantField(v._key, "stock", e.target.value)}
                        placeholder="0"
                        min={0}
                        step={1}
                        required
                        fullWidth
                        errorMessage={vErr?.stock}
                      />
                      <Select
                        label="Status"
                        options={VARIANT_STATUS_OPTIONS}
                        value={v.status}
                        onChange={(val) => updateVariantField(v._key, "status", val as string)}
                      />
                    </div>
                  </div>
                );
              })}
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
    </div>
  );
}
