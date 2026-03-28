import type { Metadata } from "next";
import { getBrands } from "@/src/services/brand.service";
import { BrandsPageClient } from "@/src/components/admin/catalog/BrandsPageClient";

// ─── Route config ──────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thương hiệu — Admin",
  description: "Quản lý thương hiệu sản phẩm.",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function BrandsPage() {
  const { data, total } = await getBrands({ pageSize: 20 });

  return <BrandsPageClient initialData={data} initialTotal={total} />;
}
