export const dynamic = "force-dynamic";

import { FlashSaleDetailClient } from "@/src/components/admin/flash-sale/FlashSaleDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Flash Sale #${id}` };
}

export default async function FlashSaleDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-secondary-50">
      <FlashSaleDetailClient flashSaleId={id} />
    </div>
  );
}
