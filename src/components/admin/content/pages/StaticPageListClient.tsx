"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon, InboxIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef, SortDir } from "@/src/components/admin/DataTable";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { getStaticPages, deleteStaticPage } from "@/src/services/content.service";
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

export function StaticPageListClient() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortKey, setSortKey] = useState("sortOrder");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [deleteTarget, setDeleteTarget] = useState<StaticPage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getStaticPages({ q: search, status: statusFilter as StaticPageStatus[], page, pageSize })
      .then((res) => {
        if (!cancelled) { setPages(res.data); setTotal(res.total); setIsLoading(false); }
      });
    return () => { cancelled = true; };
  }, [search, statusFilter, page, pageSize]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStaticPage(deleteTarget.id);
      setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setTotal((prev) => prev - 1);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

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
              className="text-error-500 hover:bg-error-50"
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(row as unknown as StaticPage); }}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
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
            <Link href="/content/pages/create">
              <Button size="sm" leftIcon={<PlusIcon className="h-4 w-4" />}>Thêm trang</Button>
            </Link>
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

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa trang"
        description={`Xóa trang "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        variant="danger"
      />
    </>
  );
}
