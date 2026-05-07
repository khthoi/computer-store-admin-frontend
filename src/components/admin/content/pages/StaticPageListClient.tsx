"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import {
  PlusIcon, InboxIcon, PencilIcon, TrashIcon, Bars3Icon, ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef, SortDir } from "@/src/components/admin/DataTable";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { useToast } from "@/src/components/ui/Toast";
import { getStaticPages, deleteStaticPage, reorderPages } from "@/src/services/content.service";
import type { StaticPage, StaticPageStatus } from "@/src/types/content.types";

type PageRow = StaticPage & Record<string, unknown>;

const STATUS_CONFIG: Record<StaticPageStatus, { label: string; variant: "success" | "warning" | "error" | "default" }> = {
  published: { label: "Đã xuất bản", variant: "success" },
  draft:     { label: "Nháp",        variant: "default" },
  archived:  { label: "Lưu trữ",     variant: "error" },
};

const STATUS_OPTIONS = [
  { value: "published", label: "Đã xuất bản" },
  { value: "draft",     label: "Nháp" },
  { value: "archived",  label: "Lưu trữ" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Sortable page row ────────────────────────────────────────────────────────

function SortablePageRow({
  page, index, onDelete,
}: {
  page: StaticPage;
  index: number;
  onDelete: (p: StaticPage) => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const cfg = STATUS_CONFIG[page.status];

  return (
    <Reorder.Item
      value={page}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{ userSelect: "none", zIndex: isDragging ? 50 : "auto", position: "relative" }}
      animate={
        isDragging
          ? { scale: 1.015, boxShadow: "0 8px 28px rgba(0,0,0,0.10)" }
          : { scale: 1,     boxShadow: "0 0px  0px rgba(0,0,0,0.00)" }
      }
      className="group flex items-center gap-3 rounded-xl border border-secondary-200 bg-white px-4 py-3 transition-colors hover:border-secondary-300"
    >
      {/* Drag handle */}
      <span
        className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing"
        onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
        aria-label="Kéo để sắp xếp"
      >
        <Bars3Icon className="h-4 w-4" />
      </span>

      {/* Order badge */}
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-500">
        {index}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-secondary-800 select-none">{page.title}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="font-mono text-xs text-secondary-400">/{page.slug}</span>
          <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content="Chỉnh sửa" placement="top">
          <Link href={`/content/pages/${page.id}/edit`}>
            <Button variant="ghost" size="xs"><PencilIcon className="h-3.5 w-3.5" /></Button>
          </Link>
        </Tooltip>
        <Tooltip content="Xóa" placement="top">
          <Button
            variant="ghost" size="xs"
            color="danger"
            onClick={(e) => { e.stopPropagation(); onDelete(page); }}
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </div>
    </Reorder.Item>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StaticPageListClient() {
  const { showToast } = useToast();

  // ── Table mode state
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortKey, setSortKey] = useState("sortOrder");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // ── Drag mode state
  const [isDragMode, setIsDragMode] = useState(false);
  const [dragPages, setDragPages] = useState<StaticPage[]>([]);
  const dragPagesRef = useRef<StaticPage[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Shared
  const [deleteTarget, setDeleteTarget] = useState<StaticPage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Table: reset page on filter change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // ── Table: fetch
  useEffect(() => {
    if (isDragMode) return;
    let cancelled = false;
    setIsLoading(true);
    getStaticPages({ q: search, status: statusFilter as StaticPageStatus[], page, pageSize })
      .then((res) => {
        if (!cancelled) { setPages(res.data); setTotal(res.total); setIsLoading(false); }
      });
    return () => { cancelled = true; };
  }, [isDragMode, search, statusFilter, page, pageSize]);

  // ── Drag: load all pages when entering drag mode
  useEffect(() => {
    if (!isDragMode) return;
    let cancelled = false;
    setIsLoading(true);
    setIsDirty(false);
    getStaticPages({ pageSize: 200 }).then((res) => {
      if (!cancelled) {
        const sorted = [...res.data].sort((a, b) => a.sortOrder - b.sortOrder);
        setDragPages(sorted);
        dragPagesRef.current = sorted;
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [isDragMode]);

  function handleReorder(newOrder: StaticPage[]) {
    setDragPages(newOrder);
    dragPagesRef.current = newOrder;
    setIsDirty(true);
  }

  async function handleSaveOrder() {
    setIsSaving(true);
    try {
      await reorderPages(dragPagesRef.current.map((p) => p.id));
      setIsDirty(false);
      showToast("Đã lưu thứ tự trang", "success");
    } catch {
      showToast("Lưu thứ tự thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  }

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStaticPage(deleteTarget.id);
      if (isDragMode) {
        const next = dragPagesRef.current.filter((p) => p.id !== deleteTarget.id);
        setDragPages(next);
        dragPagesRef.current = next;
        setIsDirty(true);
      } else {
        setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setTotal((prev) => prev - 1);
      }
      setDeleteTarget(null);
      showToast(`Đã xóa trang "${deleteTarget.title}"`, "success");
    } catch {
      showToast("Xóa trang thất bại", "error");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, isDragMode, showToast]);

  const columns: ColumnDef<PageRow>[] = [
    {
      key: "title",
      header: "Trang",
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium text-secondary-800 truncate">{value as string}</span>
          <span className="text-xs text-secondary-400 font-mono">/{row.slug as string}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      width: "w-36",
      align: "center",
      render: (value) => {
        const cfg = STATUS_CONFIG[value as StaticPageStatus];
        return <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>;
      },
    },
    {
      key: "showInFooter",
      header: "Footer",
      width: "w-20",
      align: "center",
      render: (value) => (
        <span className={`text-xs font-medium ${value ? "text-success-600" : "text-secondary-400"}`}>
          {value ? "Có" : "Không"}
        </span>
      ),
    },
    {
      key: "viewCount",
      header: "Lượt xem",
      width: "w-32",
      align: "center",
      sortable: true,
      render: (value) => (
        <span className="tabular-nums text-sm text-secondary-600">{(value as number).toLocaleString("vi-VN")}</span>
      ),
    },
    {
      key: "updatedAt",
      header: "Cập nhật",
      width: "w-32",
      sortable: true,
      render: (value) => (
        <span className="text-xs text-secondary-500">{formatDate(value as string)}</span>
      ),
    },
    {
      key: "id",
      header: "",
      width: "w-24",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-center">
          <Tooltip content="Chỉnh sửa" placement="top">
            <Link href={`/content/pages/${row.id as string}/edit`}>
              <Button variant="ghost" size="xs"><PencilIcon className="h-3.5 w-3.5" /></Button>
            </Link>
          </Tooltip>
          <Tooltip content="Xóa" placement="top">
            <Button
              variant="ghost" size="xs"
              color="danger"
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(row as unknown as StaticPage); }}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const addPageBtn = (
    <Link href="/content/pages/create">
      <Button size="sm" leftIcon={<PlusIcon className="h-4 w-4" />}>Thêm trang</Button>
    </Link>
  );

  return (
    <>
      {/* ── Mode toggle toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-xl border border-secondary-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setIsDragMode(false)}
            className={[
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              !isDragMode ? "bg-primary-600 text-white shadow-sm" : "text-secondary-600 hover:bg-secondary-100",
            ].join(" ")}
          >
            Danh sách
          </button>
          <button
            type="button"
            onClick={() => setIsDragMode(true)}
            className={[
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              isDragMode ? "bg-primary-600 text-white shadow-sm" : "text-secondary-600 hover:bg-secondary-100",
            ].join(" ")}
          >
            <ArrowsUpDownIcon className="h-3.5 w-3.5" />
            Sắp xếp
          </button>
        </div>
        {isDragMode && isDirty && (
          <Button size="sm" onClick={handleSaveOrder} isLoading={isSaving}>
            Lưu thứ tự
          </Button>
        )}
      </div>

      {/* ── Table mode */}
      {!isDragMode && (
        <DataTable<PageRow>
          columns={columns}
          data={pages as PageRow[]}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="Chưa có trang nào"
          emptyIcon={<InboxIcon className="h-10 w-10 text-secondary-300" />}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm tiêu đề hoặc slug..."
          toolbarActions={
            <div className="flex items-center gap-2">
              <FilterDropdown label="Trạng thái" options={STATUS_OPTIONS} selected={statusFilter} onChange={setStatusFilter} />
              {addPageBtn}
            </div>
          }
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={(k, d) => { setSortKey(k); setSortDir(d); }}
          page={page}
          pageSize={pageSize}
          totalRows={total}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          tableLayout="fixed"
        />
      )}

      {/* ── Drag mode */}
      {isDragMode && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-secondary-500">
              {!isLoading && dragPages.length > 0 && (
                <>
                  <span className="font-semibold text-secondary-700">{dragPages.length}</span>
                  {" trang"}
                  {dragPages.length > 1 && (
                    <span className="ml-1.5 text-secondary-400">
                      · kéo <Bars3Icon className="inline h-3 w-3" /> để sắp xếp
                    </span>
                  )}
                </>
              )}
            </p>
            {addPageBtn}
          </div>

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
          ) : dragPages.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-secondary-200 py-16 text-center">
              <InboxIcon className="h-10 w-10 text-secondary-300" />
              <p className="text-sm text-secondary-500">Chưa có trang nào</p>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={dragPages}
              onReorder={handleReorder}
              as="div"
              className="flex flex-col gap-2"
              style={{ touchAction: "none" }}
            >
              {dragPages.map((p, idx) => (
                <SortablePageRow
                  key={p.id}
                  page={p}
                  index={idx + 1}
                  onDelete={setDeleteTarget}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa trang"
        description={`Xóa trang "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        variant="danger"
        isConfirming={isDeleting}
      />
    </>
  );
}
