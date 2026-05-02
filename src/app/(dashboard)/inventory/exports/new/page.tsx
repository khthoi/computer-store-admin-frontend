export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ExportReceiptForm } from "@/src/components/admin/inventory/ExportReceiptForm";

export default function NewExportReceiptPage() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/inventory/exports"
          className="flex items-center gap-1.5 text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Phiếu xuất kho
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Tạo Phiếu Xuất Kho</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Tìm sản phẩm, chọn loại xuất và điền thông tin để tạo phiếu
        </p>
      </div>

      <ExportReceiptForm />
    </div>
  );
}
