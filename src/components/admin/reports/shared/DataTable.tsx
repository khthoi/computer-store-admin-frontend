import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportColumn {
  key:     string;
  label:   string;
  align?:  "left" | "right" | "center";
  width?:  string;
}

interface DataTableProps {
  columns:       ReportColumn[];
  rows:          Record<string, ReactNode>[];
  emptyMessage?: string;
}

// ─── Align map ────────────────────────────────────────────────────────────────

const ALIGN: Record<string, string> = {
  left:   "text-left",
  right:  "text-right",
  center: "text-center",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable({ columns, rows, emptyMessage = "Không có dữ liệu" }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-secondary-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  "px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-secondary-500 whitespace-nowrap",
                  ALIGN[col.align ?? "left"],
                  col.width ?? "",
                ].join(" ")}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-secondary-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-t border-secondary-100 hover:bg-secondary-50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      "px-4 py-3 text-secondary-700",
                      ALIGN[col.align ?? "left"],
                      col.width ?? "",
                    ].join(" ")}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
