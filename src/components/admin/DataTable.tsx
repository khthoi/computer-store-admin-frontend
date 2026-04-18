"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Select } from "@/src/components/ui/Select";
import { Tooltip } from "@/src/components/ui/Tooltip";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InboxIcon,
  XMarkIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDir = "asc" | "desc";

export interface ColumnDef<T = Record<string, unknown>> {
  /** Maps to a key in the data row for default rendering. Can be a dot-path-free field name. */
  key: string;
  header: string;
  /** Custom cell renderer. Receives the raw cell value and the full row. */
  render?: (value: unknown, row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  /** Tailwind width class (e.g. "w-48", "w-24") */
  width?: string;
  /**
   * Show a tooltip on hover.
   * - `true` → tooltip content = String(rawValue)
   * - `(value, row) => string` → derive content dynamically
   * Cell content is wrapped in a truncating span so long values are clipped.
   */
  tooltip?: boolean | ((value: unknown, row: T) => string);
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: ReactNode;
  isDanger?: boolean;
  /** Receives the array of selected row key strings */
  onClick: (selectedKeys: string[]) => void;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  /**
   * Field name whose value uniquely identifies each row (e.g. "id").
   * Values must be string-coercible.
   */
  keyField: keyof T & string;

  // ── Selection ──────────────────────────────────────────────────────────────
  selectable?: boolean;
  /** Called whenever the selection changes */
  onSelectionChange?: (selectedKeys: string[]) => void;

  // ── Bulk actions ──────────────────────────────────────────────────────────
  bulkActions?: BulkAction[];

  // ── Sort (server-side — parent owns data) ─────────────────────────────────
  sortKey?: string;
  sortDir?: SortDir;
  onSortChange?: (key: string, dir: SortDir) => void;

  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;

  // ── Toolbar ───────────────────────────────────────────────────────────────
  /** Slot for filter dropdowns, action buttons, etc. */
  toolbarActions?: ReactNode;

  // ── Pagination ────────────────────────────────────────────────────────────
  page: number;
  pageSize: number;
  totalRows: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // ── State ─────────────────────────────────────────────────────────────────
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  /** CTA rendered beneath empty state message */
  emptyAction?: ReactNode;

  // ── Controlled selection ───────────────────────────────────────────────────
  /**
   * Externally controlled selected keys. When provided, the DataTable will
   * sync its internal selection state whenever this array changes — useful for
   * resetting selection from a parent (e.g. when switching between product/variant
   * selection modes). Does NOT fire `onSelectionChange` when syncing.
   */
  selectedKeys?: string[];

  // ── Expandable rows ────────────────────────────────────────────────────────
  /**
   * If provided, each parent row can expand to reveal sub-rows.
   * Return `undefined` or an empty array to indicate no sub-rows for a row.
   * Sub-rows are typed as `Record<string, unknown>` to support heterogeneous
   * child data (e.g. Product → ProductVariant).
   *
   * Omitting this prop keeps the DataTable fully backward-compatible.
   */
  getSubRows?: (row: T) => Record<string, unknown>[] | undefined;
  /**
   * Custom renderer for each sub-row. Must return a complete `<tr>` element
   * (with all `<td>` cells) to maintain column alignment.
   *
   * When omitted, sub-rows fall back to the same column definitions as
   * parent rows with a left-indent on the first data cell.
   */
  renderSubRow?: (subRow: Record<string, unknown>, parentRow: T) => ReactNode;
  /**
   * When `true`, all expandable rows start expanded.
   * @default false
   */
  expandedByDefault?: boolean;

  /**
   * Optional per-row className. Called with the row data; return a Tailwind
   * class string (or undefined) to apply extra styling to the `<tr>` element.
   * Applied in addition to the existing selection / hover classes.
   */
  rowClassName?: (row: T) => string | undefined;

  /**
   * When `true`, the pagination footer (row count, page-size selector,
   * prev/next navigation) is hidden entirely. Useful for embedded tables
   * where all rows always fit on one screen (e.g. a detail-page address list).
   */
  hidePagination?: boolean;

  /**
   * When `true`, the search/toolbar row is hidden entirely.
   * Useful when the parent component provides its own header or the table
   * is embedded in a detail page where search is not needed.
   */
  hideToolbar?: boolean;

  /**
   * When `true`, the outer wrapper `<div>` (border, rounded corners, bg) is
   * omitted and the component renders its inner sections (toolbar, table,
   * pagination) directly into a `<>Fragment</>`.
   *
   * Use this when the parent supplies the container so DataTable doesn't
   * double-wrap with conflicting border/radius styles.
   */
  bare?: boolean;

  /**
   * CSS table-layout algorithm.
   * - `"auto"` (default): column widths are determined by content — each tab
   *   or data state may render with different column widths.
   * - `"fixed"`: column widths strictly follow the `width` prop on each
   *   `ColumnDef`. All tabs / filter states share identical column widths,
   *   regardless of what data is currently visible.
   *
   * @default "auto"
   */
  tableLayout?: "auto" | "fixed";

  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 300;

const ALIGN: Record<string, string> = {
  left:   "text-left",
  center: "text-center",
  right:  "text-right",
};

function cellValue<T extends Record<string, unknown>>(
  row: T,
  key: string
): unknown {
  return (row as Record<string, unknown>)[key];
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow({
  colCount,
  selectable,
  expandable,
}: {
  colCount: number;
  selectable: boolean;
  expandable: boolean;
}) {
  return (
    <tr aria-hidden="true">
      {selectable && (
        <td className="w-10 px-4 py-3">
          <div className="h-4 w-4 rounded animate-pulse bg-secondary-200" />
        </td>
      )}
      {expandable && <td className="w-8 px-2 py-3" />}
      {Array.from({ length: colCount }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded animate-pulse bg-secondary-200"
            style={{ width: `${60 + ((i * 37) % 30)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * DataTable — full-featured admin data table.
 *
 * Features: sortable columns (server-side), row selection + bulk actions,
 * debounced search, toolbar slot, pagination with page-size selector,
 * loading skeleton, empty state, responsive horizontal scroll,
 * **expandable sub-rows** (opt-in via `getSubRows`).
 *
 * ```tsx
 * // Basic usage (unchanged from before)
 * <DataTable
 *   data={products}
 *   keyField="id"
 *   columns={[
 *     { key: "name",   header: "Product", sortable: true },
 *     { key: "status", header: "Status",
 *       render: (v) => <StatusBadge status={v as AdminStatus} /> },
 *   ]}
 *   page={page}  pageSize={pageSize}  totalRows={total}
 *   onPageChange={setPage}  onPageSizeChange={setPageSize}
 * />
 *
 * // With expandable sub-rows
 * <DataTable
 *   ...
 *   getSubRows={(row) => row.variants.length ? row.variants : undefined}
 *   renderSubRow={(sub, parent) => <tr>...</tr>}
 * />
 * ```
 */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  selectable = false,
  onSelectionChange,
  selectedKeys: externalSelectedKeys,
  bulkActions = [],
  sortKey,
  sortDir,
  onSortChange,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search…",
  toolbarActions,
  page,
  pageSize,
  totalRows,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  emptyMessage = "No results found.",
  emptyIcon,
  emptyAction,
  getSubRows,
  renderSubRow,
  expandedByDefault = false,
  rowClassName,
  hidePagination = false,
  hideToolbar = false,
  bare = false,
  tableLayout = "auto",
  className = "",
}: DataTableProps<T>) {
  const searchId = useId();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Keep a synchronous ref so handleSelectRow can read the current set without
  // the functional-updater form (which caused the "setState during render" error
  // when onSelectionChange called ProductsTable's setSelectedProductIds inside it).
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // Sync when parent resets selection (e.g. switching between product/variant mode).
  // Deliberately does NOT call onSelectionChange — this is an external override.
  useEffect(() => {
    if (externalSelectedKeys !== undefined) {
      setSelected(new Set(externalSelectedKeys));
    }
  }, [externalSelectedKeys]);

  // ── Expanded rows state ────────────────────────────────────────────────────
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => {
    if (!expandedByDefault || !getSubRows) return new Set<string>();
    return new Set(data.map((row) => String(cellValue(row, keyField))));
  });

  // Clean up expanded state when rows are removed from data
  useEffect(() => {
    if (!getSubRows) return;
    const currentKeys = new Set(data.map((row) => String(cellValue(row, keyField))));
    setExpandedRows((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const k of prev) {
        if (!currentKeys.has(k)) {
          next.delete(k);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [data, keyField, getSubRows]);

  const toggleExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // ── Column span calculation ────────────────────────────────────────────────
  const extraCols = (selectable ? 1 : 0) + (getSubRows ? 1 : 0);
  const totalColSpan = columns.length + extraCols;

  const allKeys = data.map((row) => String(cellValue(row, keyField)));
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selected.has(k));
  const someSelected = !allSelected && allKeys.some((k) => selected.has(k));
  const selectedKeys = Array.from(selected);

  // ── Selection handlers ────────────────────────────────────────────────────

  const handleSelectAll = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = new Set(e.target.checked ? allKeys : []);
      setSelected(next);
      onSelectionChange?.(Array.from(next));
    },
    [allKeys, onSelectionChange]
  );

  const handleSelectRow = useCallback(
    (key: string, checked: boolean) => {
      // Build next set from the ref (synchronous snapshot) — avoids the functional
      // updater form, which would call onSelectionChange inside a state setter and
      // trigger React's "setState during render" warning.
      const next = new Set(selectedRef.current);
      checked ? next.add(key) : next.delete(key);
      setSelected(next);
      onSelectionChange?.(Array.from(next));
    },
    [onSelectionChange]
  );

  // ── Search ────────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalSearch(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearchChange?.(val), DEBOUNCE_MS);
    },
    [onSearchChange]
  );

  const clearSearch = useCallback(() => {
    setLocalSearch("");
    onSearchChange?.("");
  }, [onSearchChange]);

  // ── Sort ──────────────────────────────────────────────────────────────────

  const handleSortClick = useCallback(
    (key: string) => {
      if (!onSortChange) return;
      if (sortKey === key) {
        onSortChange(key, sortDir === "asc" ? "desc" : "asc");
      } else {
        onSortChange(key, "asc");
      }
    },
    [onSortChange, sortDir, sortKey]
  );

  // ── Pagination ────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const pageStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, totalRows);

  const goTo = useCallback(
    (p: number) => {
      const clamped = Math.max(1, Math.min(totalPages, p));
      if (clamped !== page) onPageChange(clamped);
    },
    [page, totalPages, onPageChange]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  const inner = (
    <>
      {/* ── Toolbar ── */}
      {!hideToolbar && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary-200 px-4 py-3">
        {/* Search */}
        <div className="relative w-full sm:w-120">
          <label htmlFor={searchId} className="sr-only">
            {searchPlaceholder}
          </label>
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400"
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-secondary-200 bg-white py-2 pl-9 pr-8 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {localSearch && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-700 focus-visible:outline-none"
            >
              <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Right-side actions */}
        {toolbarActions && (
          <div className="flex flex-wrap items-center gap-2">
            {toolbarActions}
          </div>
        )}
      </div>}

      {/* ── Bulk action bar ── */}
      {selectable && selectedKeys.length > 0 && (
        <div
          role="toolbar"
          aria-label="Bulk actions"
          className="flex flex-wrap items-center gap-3 border-b border-primary-200 bg-primary-50 px-4 py-2.5"
        >
          <span className="text-sm font-medium text-primary-700">
            {selectedKeys.length} selected
          </span>
          <div className="flex flex-wrap gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => action.onClick(selectedKeys)}
                className={[
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  action.isDanger
                    ? "border-error-300 bg-white text-error-600 hover:bg-error-50"
                    : "border-secondary-200 bg-white text-secondary-700 hover:bg-secondary-50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                ].join(" ")}
              >
                {action.icon && (
                  <span className="w-3.5 h-3.5" aria-hidden="true">
                    {action.icon}
                  </span>
                )}
                {action.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(new Set());
              onSelectionChange?.([]);
            }}
            className="ml-auto text-xs text-secondary-500 hover:text-secondary-800 focus-visible:outline-none"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className={["w-full min-w-[600px] text-sm", tableLayout === "fixed" ? "table-fixed" : ""].filter(Boolean).join(" ")}>
          {/* Header */}
          <thead className="bg-secondary-50">
            <tr className="border-b border-secondary-200">
              {/* Select-all checkbox */}
              {selectable && (
                <th scope="col" className="w-10 px-4 py-3">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      size="sm"
                      aria-label="Select all rows"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
              )}

              {/* Expand column header — no label, reserved for chevron toggles */}
              {getSubRows && <th scope="col" className="w-8 px-2 py-3" aria-label="Expand" />}

              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={[
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-secondary-500",
                    ALIGN[col.align ?? "left"],
                    col.width ?? "",
                    col.sortable && onSortChange ? "cursor-pointer select-none hover:text-secondary-800" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={col.sortable ? () => handleSortClick(col.key) : undefined}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : col.sortable
                      ? "none"
                      : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-secondary-400" aria-hidden="true">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUpIcon className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                          )
                        ) : (
                          <ChevronUpDownIcon className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-secondary-100">
            {isLoading ? (
              <>
                {Array.from({ length: pageSize > 10 ? 10 : pageSize }, (_, i) => (
                  <SkeletonRow
                    key={i}
                    colCount={columns.length}
                    selectable={selectable}
                    expandable={!!getSubRows}
                  />
                ))}
                <tr>
                  <td
                    colSpan={totalColSpan}
                    className="sr-only"
                    aria-busy="true"
                  >
                    Loading…
                  </td>
                </tr>
              </>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColSpan}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-secondary-300" aria-hidden="true">
                      {emptyIcon ?? <InboxIcon className="w-12 h-12" />}
                    </span>
                    <p className="text-sm font-medium text-secondary-500">
                      {emptyMessage}
                    </p>
                    {emptyAction && <div className="mt-1">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const key = String(cellValue(row, keyField));
                const isSelected = selected.has(key);

                // ── Expandable row logic ─────────────────────────────────────
                const subRows = getSubRows ? getSubRows(row) : undefined;
                const hasSubRows = !!subRows?.length;
                const isExpanded = expandedRows.has(key);

                return (
                  <Fragment key={key}>
                    {/* ── Parent row ── */}
                    <tr
                      className={[
                        "transition-colors",
                        isSelected
                          ? "bg-primary-50"
                          : "hover:bg-secondary-50/70",
                        rowClassName?.(row) ?? "",
                      ].filter(Boolean).join(" ")}
                    >
                      {/* Select checkbox */}
                      {selectable && (
                        <td className="w-10 px-4 py-3">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              size="sm"
                              aria-label={`Select row ${key}`}
                              checked={isSelected}
                              onChange={(e) =>
                                handleSelectRow(key, e.target.checked)
                              }
                            />
                          </div>
                        </td>
                      )}

                      {/* Expand toggle */}
                      {getSubRows && (
                        <td className="w-8 px-2 py-3">
                          {hasSubRows ? (
                            <button
                              type="button"
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? "Collapse row" : "Expand row"}
                              onClick={() => toggleExpanded(key)}
                              className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            >
                              <ChevronRightIcon
                                className={[
                                  "w-4 h-4 transition-transform duration-150",
                                  isExpanded ? "rotate-90" : "",
                                ].join(" ")}
                                aria-hidden="true"
                              />
                            </button>
                          ) : null}
                        </td>
                      )}

                      {/* Data cells */}
                      {columns.map((col) => {
                        const raw = cellValue(row, col.key);
                        const display = col.render
                          ? col.render(raw, row)
                          : raw == null
                          ? "—"
                          : String(raw);

                        const cellContent = col.tooltip ? (
                          <Tooltip
                            content={
                              typeof col.tooltip === "function"
                                ? col.tooltip(raw, row)
                                : raw == null ? "" : String(raw)
                            }
                            placement="top"
                          >
                            <span className="inline-block max-w-full truncate align-middle">{display}</span>
                          </Tooltip>
                        ) : display;

                        return (
                          <td
                            key={col.key}
                            className={[
                              "px-4 py-3 text-secondary-700",
                              ALIGN[col.align ?? "left"],
                              col.tooltip ? "overflow-hidden" : "",
                            ].filter(Boolean).join(" ")}
                          >
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>

                    {/* ── Sub-rows (only when expanded) ── */}
                    {hasSubRows &&
                      isExpanded &&
                      subRows!.map((subRow, idx) => (
                        <Fragment key={`${key}-sub-${idx}`}>
                          {renderSubRow ? (
                            // Custom renderer returns a complete <tr>
                            renderSubRow(subRow, row)
                          ) : (
                            // Default: same columns with first cell indented
                            <tr className="bg-secondary-50">
                              {selectable && <td className="w-10 px-4 py-2" />}
                              {getSubRows && <td className="w-8 px-2 py-2" />}
                              {columns.map((col, colIdx) => {
                                const raw = cellValue(
                                  subRow as unknown as T,
                                  col.key
                                );
                                const display = col.render
                                  ? col.render(raw, subRow as unknown as T)
                                  : raw == null
                                  ? "—"
                                  : String(raw);

                                const subCellContent = col.tooltip ? (
                                  <Tooltip
                                    content={
                                      typeof col.tooltip === "function"
                                        ? col.tooltip(raw, subRow as unknown as T)
                                        : raw == null ? "" : String(raw)
                                    }
                                    placement="top"
                                  >
                                    <span className="inline-block max-w-full truncate align-middle">{display}</span>
                                  </Tooltip>
                                ) : (
                                  <span className="inline-block max-w-full truncate align-middle">{display}</span>
                                );

                                return (
                                  <td
                                    key={col.key}
                                    className={[
                                      colIdx === 0 ? "pl-10 pr-4" : "px-4",
                                      "py-2 text-sm text-secondary-600 overflow-hidden",
                                      ALIGN[col.align ?? "left"],
                                    ].join(" ")}
                                  >
                                    {subCellContent}
                                  </td>
                                );
                              })}
                            </tr>
                          )}
                        </Fragment>
                      ))}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: pagination ── */}
      {!hidePagination && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-secondary-200 px-4 py-3">
        {/* Row count info */}
        <p className="text-xs text-secondary-500">
          {totalRows === 0
            ? "No results"
            : `Showing ${pageStart}–${pageEnd} of ${totalRows.toLocaleString()} rows`}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {/* Page size */}
          <div className="flex items-center gap-2 text-xs text-secondary-600">
            <span>Rows per page:</span>
            <div className="w-20">
              <Select
                size="sm"
                options={pageSizeOptions.map((opt) => ({
                  value: String(opt),
                  label: String(opt),
                }))}
                value={String(pageSize)}
                onChange={(v) => onPageSizeChange(parseInt(v as string, 10))}
              />
            </div>
          </div>

          {/* Page nav */}
          <nav aria-label="Table pagination" className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1 || isLoading}
              onClick={() => goTo(page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded text-secondary-500 transition-colors hover:bg-secondary-100 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <ChevronUpIcon className="w-4 h-4 -rotate-90" aria-hidden="true" />
            </button>

            <span className="min-w-[5rem] text-center text-xs text-secondary-600">
              {isLoading ? (
                <ArrowPathIcon
                  className="inline w-4 h-4 animate-spin text-secondary-400"
                  aria-hidden="true"
                />
              ) : (
                <>
                  Page{" "}
                  <span className="font-semibold text-secondary-900">{page}</span>
                  {" "}of{" "}
                  <span className="font-semibold text-secondary-900">{totalPages}</span>
                </>
              )}
            </span>

            <button
              type="button"
              aria-label="Next page"
              disabled={page >= totalPages || isLoading}
              onClick={() => goTo(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded text-secondary-500 transition-colors hover:bg-secondary-100 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <ChevronDownIcon className="w-4 h-4 -rotate-90" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>}
    </>
  );

  if (bare) return inner;

  return (
    <div
      className={[
        "flex flex-col rounded-xl border border-secondary-200 bg-white overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {inner}
    </div>
  );
}

// ─── Row action components ────────────────────────────────────────────────────

const ROW_ACTION_BASE =
  "flex h-7 w-7 items-center justify-center rounded text-secondary-400 " +
  "transition-colors hover:bg-secondary-100 hover:text-secondary-700 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";

const ROW_ACTION_DANGER =
  "flex h-7 w-7 items-center justify-center rounded text-secondary-400 " +
  "transition-colors hover:bg-error-50 hover:text-error-600 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500";

/** Flex container that groups row action buttons with consistent spacing. */
export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-1">{children}</div>;
}

/** View-detail link button (renders as `<a>`). */
export function RowActionView({
  href,
  ariaLabel = "Xem chi tiết",
}: {
  href: string;
  ariaLabel?: string;
}) {
  return (
    <Link href={href} aria-label={ariaLabel} className={ROW_ACTION_BASE}>
      <EyeIcon className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

/**
 * Edit action — renders as `<Link>` when `href` is provided, otherwise `<button>`.
 * Pass exactly one of `href` or `onClick`.
 */
export function RowActionEdit({
  href,
  onClick,
  ariaLabel = "Chỉnh sửa",
}: {
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={ROW_ACTION_BASE}>
        <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
      </Link>
    );
  }
  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick} className={ROW_ACTION_BASE}>
      <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

/** Delete action button (danger hover style). */
export function RowActionDelete({
  onClick,
  ariaLabel = "Xóa",
}: {
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick} className={ROW_ACTION_DANGER}>
      <TrashIcon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name               Type                              Default   Description
 * ──────────────────────────────────────────────────────────────────────────────
 * data               T[]                               required  Row data
 * columns            ColumnDef<T>[]                    required  Column definitions
 * keyField           keyof T & string                  required  Unique row identifier field
 * selectable         boolean                           false     Show row checkboxes
 * onSelectionChange  (keys: string[]) => void          —         Selection change callback
 * bulkActions        BulkAction[]                      []        Actions shown when rows selected
 * sortKey            string                            —         Currently sorted column key
 * sortDir            "asc"|"desc"                      —         Current sort direction
 * onSortChange       (key, dir) => void                —         Sort change callback
 * searchQuery        string                            ""        Controlled search value
 * onSearchChange     (query: string) => void           —         Search change callback (300ms debounce)
 * searchPlaceholder  string                            "Search…" Input placeholder
 * toolbarActions     ReactNode                         —         Filter dropdowns / action buttons
 * page               number                            required  Current page (1-based)
 * pageSize           number                            required  Rows per page
 * totalRows          number                            required  Total row count for pagination
 * pageSizeOptions    number[]                          [10,25,50,100] Page size choices
 * onPageChange       (page: number) => void            required  Page change callback
 * onPageSizeChange   (size: number) => void            required  Page size change callback
 * isLoading          boolean                           false     Show skeleton rows
 * emptyMessage       string                            "No results found." Empty state label
 * emptyIcon          ReactNode                         InboxIcon Empty state icon
 * emptyAction        ReactNode                         —         CTA beneath empty message
 * getSubRows         (row: T) => Record<string,unknown>[] | undefined  —  Returns sub-rows for a row
 * renderSubRow       (sub, parent) => ReactNode        —         Custom sub-row renderer (full <tr>)
 * expandedByDefault  boolean                           false     Start all rows expanded
 * className          string                            ""        Extra classes on root div
 */
