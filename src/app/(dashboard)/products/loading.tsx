// ─── Products page loading skeleton ──────────────────────────────────────────
//
// Mirrors the layout of ProductsPage so there is no layout shift when the
// server component resolves:
//   • Page header  (h1 + description + Add Product button)
//   • DataTable    (toolbar → header row → 8 data rows → footer)

export default function ProductsLoading() {
  return (
    <div className="space-y-6 p-6" aria-hidden="true">
      {/* ── Page header skeleton ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 rounded-lg animate-pulse bg-secondary-200" />
          <div className="h-4 w-72 rounded animate-pulse bg-secondary-100" />
        </div>
        <div className="h-10 w-32 rounded-lg animate-pulse bg-secondary-200" />
      </div>

      {/* ── Table skeleton ── */}
      <div className="rounded-xl border border-secondary-200 bg-white overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary-200 px-4 py-3">
          <div className="h-9 w-64 rounded-lg animate-pulse bg-secondary-100" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 rounded-lg animate-pulse bg-secondary-100" />
            <div className="h-9 w-28 rounded-lg animate-pulse bg-secondary-100" />
            <div className="h-9 w-20 rounded-lg animate-pulse bg-secondary-100" />
          </div>
        </div>

        {/* Table header */}
        <div className="border-b border-secondary-200 bg-secondary-50 px-4 py-3 flex items-center gap-3">
          <div className="h-4 w-4 rounded animate-pulse bg-secondary-200 shrink-0" />
          <div className="h-4 w-4 rounded animate-pulse bg-secondary-200 shrink-0" />
          <div className="h-4 w-10 rounded animate-pulse bg-secondary-200 shrink-0" />
          {[180, 96, 100, 64, 80, 80, 72].map((w, i) => (
            <div
              key={i}
              className="h-4 rounded animate-pulse bg-secondary-200"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="border-b border-secondary-100 px-4 py-3 flex items-center gap-3"
          >
            <div className="h-4 w-4 rounded animate-pulse bg-secondary-100 shrink-0" />
            <div className="h-4 w-4 rounded animate-pulse bg-secondary-100 shrink-0" />
            {/* Thumbnail */}
            <div className="h-10 w-10 rounded-lg animate-pulse bg-secondary-100 shrink-0" />
            {/* Name + slug */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <div
                className="h-4 rounded animate-pulse bg-secondary-100"
                style={{ width: `${45 + (i * 17) % 35}%` }}
              />
              <div className="h-3 w-36 rounded animate-pulse bg-secondary-100" />
            </div>
            {/* Category */}
            <div className="h-4 w-20 rounded animate-pulse bg-secondary-100 shrink-0" />
            {/* Price */}
            <div className="h-4 w-24 rounded animate-pulse bg-secondary-100 shrink-0" />
            {/* Stock */}
            <div className="h-4 w-10 rounded animate-pulse bg-secondary-100 shrink-0" />
            {/* Status badge */}
            <div className="h-5 w-20 rounded-full animate-pulse bg-secondary-100 shrink-0" />
            {/* Updated */}
            <div className="h-4 w-20 rounded animate-pulse bg-secondary-100 shrink-0" />
            {/* Actions */}
            <div className="flex gap-1 shrink-0">
              <div className="h-7 w-7 rounded animate-pulse bg-secondary-100" />
              <div className="h-7 w-7 rounded animate-pulse bg-secondary-100" />
              <div className="h-7 w-7 rounded animate-pulse bg-secondary-100" />
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-secondary-200">
          <div className="h-4 w-36 rounded animate-pulse bg-secondary-100" />
          <div className="flex items-center gap-4">
            <div className="h-7 w-32 rounded animate-pulse bg-secondary-100" />
            <div className="h-8 w-24 rounded animate-pulse bg-secondary-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
