import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CubeIcon } from "@heroicons/react/24/outline";
import { getProductById } from "@/src/services/product.service";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { VariantsPanel } from "@/src/app/(dashboard)/products/[id]/VariantsPanel";
import { ProductDetailHeader } from "@/src/components/admin/products/ProductDetailHeader";
import { ProductInfoCard } from "@/src/components/admin/products/ProductInfoCard";
import { ProductVariantStats } from "@/src/components/admin/products/ProductVariantStats";

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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="space-y-6 p-6">
      <ProductDetailHeader product={product} />

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <ProductInfoCard product={product} />
          <ProductVariantStats variants={product.variants} />
        </div>

        <div className="overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-sm">
          <Tabs
            tabs={[
              {
                value: "variants",
                label: `Phiên bản (${product.variants.length})`,
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
