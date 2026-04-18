"use client";

import { useState } from "react";
import Link from "next/link";
import { PencilSquareIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import type { LoyaltyEarnRule } from "@/src/types/loyalty.types";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef } from "@/src/components/admin/DataTable";
import { Toggle } from "@/src/components/ui/Toggle";
import { Tooltip } from "@/src/components/ui/Tooltip";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  items: LoyaltyEarnRule[];
  /** kept for API compat with PromotionsListClient — not used; navigation via Link */
  onEdit?: (item: LoyaltyEarnRule) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const BONUS_LABELS: Record<string, string> = {
  first_order: "Đơn đầu tiên",
  birthday:    "Sinh nhật",
  manual:      "Thủ công",
};

const BONUS_STYLES: Record<string, string> = {
  first_order: "bg-primary-50 text-primary-700 border-primary-200",
  birthday:    "bg-warning-50 text-warning-700 border-warning-200",
  manual:      "bg-secondary-100 text-secondary-600 border-secondary-200",
};

// ─── 2-step delete button ─────────────────────────────────────────────────────

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (confirming) {
      onConfirm();
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={confirming ? "Click to confirm deletion" : "Delete"}
      className={[
        "rounded px-1.5 py-1 text-xs font-medium transition-colors",
        confirming
          ? "bg-error-100 text-error-700 hover:bg-error-200"
          : "text-secondary-400 hover:bg-error-50 hover:text-error-600",
      ].join(" ")}
    >
      {confirming ? "Confirm?" : <TrashIcon className="w-4 h-4" />}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EarnRulesTable({ items, onDelete, onToggleActive }: Props) {
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  type Row = LoyaltyEarnRule & Record<string, unknown>;

  const columns: ColumnDef<Row>[] = [
    {
      key: "name",
      header: "Name",
      width: "w-[18%]",
      render: (v, row) => (
        <div>
          <Tooltip content={v as string} anchorToContent>
            <Link
              href={`/promotions/earn-rules/${row.id as string}`}
              className="block truncate text-sm font-medium text-primary-600 hover:underline"
            >
              {v as string}
            </Link>
          </Tooltip>
          {row.description && (
            <p className="text-[11px] text-secondary-400 truncate mt-0.5">
              {row.description as string}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      width: "w-[7%]",
      align: "center",
      render: (v) => (
        <span className="inline-flex items-center justify-center rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-700">
          {v as number}
        </span>
      ),
    },
    {
      key: "pointsPerUnit",
      header: "Rate",
      width: "w-[12%]",
      render: (v, row) => (
        <span className="text-sm font-semibold text-primary-700 whitespace-nowrap">
          {v as number} pt / {((row.spendPerUnit as number) / 1000).toFixed(0)}k VND
        </span>
      ),
    },
    {
      key: "minOrderValue",
      header: "Min Order",
      width: "w-[10%]",
      align: "right",
      render: (v) => (
        <span className="text-sm text-secondary-600">
          {v != null
            ? `${(v as number).toLocaleString("vi-VN")}₫`
            : <span className="text-secondary-400">—</span>
          }
        </span>
      ),
    },
    {
      key: "scopes",
      header: "Scope",
      width: "w-[16%]",
      render: (v) => {
        const scopes = v as LoyaltyEarnRule["scopes"];
        if (!scopes || scopes.length === 0) {
          return (
            <span className="inline-flex items-center rounded-full border border-secondary-200 bg-secondary-50 px-2 py-0.5 text-[10px] font-semibold text-secondary-500">
              Global
            </span>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {scopes.map((s) => (
              <Tooltip
                key={s.id}
                content={`${s.scopeType === "category" ? "Category" : s.scopeType === "brand" ? "Brand" : "Product Variant"}: ${s.scopeRefLabel} — ${s.multiplier}×`}
              >
                <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 cursor-default">
                  {s.multiplier}× {s.scopeRefLabel}
                </span>
              </Tooltip>
            ))}
          </div>
        );
      },
    },
    {
      key: "bonusTrigger",
      header: "Bonus",
      width: "w-[10%]",
      align: "center",
      render: (v, row) => {
        if (!v) return <span className="text-secondary-300 text-sm">—</span>;
        const trigger = v as string;
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${BONUS_STYLES[trigger] ?? "bg-secondary-100 text-secondary-600 border-secondary-200"}`}>
              {BONUS_LABELS[trigger] ?? trigger}
            </span>
            {row.bonusPoints != null && (
              <span className="text-[10px] text-secondary-500">
                +{(row.bonusPoints as number).toLocaleString("vi-VN")} pts
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "isActive",
      header: "Active",
      width: "w-[7%]",
      align: "center",
      render: (v, row) => (
        <Toggle
          checked={v as boolean}
          onChange={(e) => onToggleActive(row.id as string, e.target.checked)}
          size="sm"
        />
      ),
    },
    {
      key: "validFrom",
      header: "Valid Period",
      width: "w-[12%]",
      render: (v, row) => {
        const from = formatDate(v as string | undefined);
        const until = formatDate(row.validUntil as string | undefined);
        if (!from && !until)
          return <span className="text-sm text-secondary-400">Always</span>;
        return (
          <span className="text-xs text-secondary-600">
            {from || "—"} – {until || "—"}
          </span>
        );
      },
    },
    {
      key: "id",
      header: "Actions",
      width: "w-[8%]",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip content="View details">
            <Link
              href={`/promotions/earn-rules/${row.id as string}`}
              className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
          </Tooltip>
          <Tooltip content="Edit">
            <Link
              href={`/promotions/earn-rules/${row.id as string}/edit`}
              className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </Link>
          </Tooltip>
          <DeleteButton onConfirm={() => onDelete(row.id as string)} />
        </div>
      ),
    },
  ];

  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <DataTable
      data={pagedItems as Row[]}
      columns={columns}
      keyField="id"
      page={page}
      pageSize={pageSize}
      totalRows={items.length}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      tableLayout="fixed"
      emptyMessage="No earn rules configured yet."
    />
  );
}
