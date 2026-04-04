export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getReturnById } from "@/src/services/inventory.service";
import { ReturnDetailClient } from "@/src/components/admin/inventory/ReturnDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderReturnDetailPage({ params }: Props) {
  const { id } = await params;
  const ret = await getReturnById(id);
  if (!ret) notFound();
  return <ReturnDetailClient initialReturn={ret} backHref="/orders/returns" />;
}
