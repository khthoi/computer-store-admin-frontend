export const dynamic = "force-dynamic";

import Link from "next/link";
import { getExportReceipts } from "@/src/services/inventory-exports.service";
import { ExportReceiptsTable } from "@/src/components/admin/inventory/ExportReceiptsTable";

export default async function ExportReceiptsPage() {
  const result = await getExportReceipts({ page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Phiếu Xuất Kho</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Danh sách phiếu xuất kho — huỷ hỏng, điều chỉnh, nội bộ
          </p>
        </div>
        <Link
          href="/inventory/exports/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          + Tạo phiếu xuất
        </Link>
      </div>

      <ExportReceiptsTable initialData={result?.data ?? []} initialTotal={result?.total ?? 0} />
    </div>
  );
}
