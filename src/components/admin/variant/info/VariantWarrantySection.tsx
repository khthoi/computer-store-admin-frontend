"use client";

import "@/src/components/editor/styles/editor.css";

// ─── VariantWarrantySection ───────────────────────────────────────────────────
//
// View-only card displaying the variant's warranty policy (HTML). Editing is
// done via the variant edit page, so no inline editor is provided here.

interface VariantWarrantySectionProps {
  warrantyMonths: number | null;
  warrantyPolicy: string | null;
}

export function VariantWarrantySection({
  warrantyMonths,
  warrantyPolicy,
}: VariantWarrantySectionProps) {
  const hasPolicy = !!warrantyPolicy && warrantyPolicy.trim().length > 0;
  const hasMonths = warrantyMonths != null && warrantyMonths > 0;

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">
          Chính sách bảo hành
        </h2>
        {hasMonths && (
          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-200">
            {warrantyMonths} tháng
          </span>
        )}
      </div>

      {hasPolicy ? (
        <div
          className="rte-preview"
          dangerouslySetInnerHTML={{ __html: warrantyPolicy as string }}
        />
      ) : (
        <p className="text-sm text-secondary-400">
          Chưa có chính sách bảo hành chi tiết cho phiên bản này.
        </p>
      )}
    </div>
  );
}
