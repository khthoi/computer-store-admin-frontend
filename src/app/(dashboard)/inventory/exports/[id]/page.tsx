export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getExportReceiptById } from "@/src/services/inventory-exports.service";
import { ExportReceiptDetail } from "@/src/components/admin/inventory/ExportReceiptDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExportReceiptDetailPage({ params }: Props) {
  const { id } = await params;
  const receipt = await getExportReceiptById(id).catch(() => null);
  if (!receipt) notFound();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/inventory/exports"
          className="flex items-center gap-1.5 text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Quay lại
        </Link>
      </div>

      <ExportReceiptDetail receipt={receipt} />
    </div>
  );
}
