export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getFlashSaleById } from "@/src/services/flash-sale.service";
import { FlashSaleFormClient } from "@/src/components/admin/flash-sale/FlashSaleFormClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Chỉnh sửa Flash Sale #${id}` };
}

export default async function EditFlashSalePage({ params }: Props) {
  const { id } = await params;
  const flashSale = await getFlashSaleById(id);

  if (!flashSale) notFound();

  return (
    <div className="min-h-screen bg-secondary-50">
      <FlashSaleFormClient initialData={flashSale} />
    </div>
  );
}
