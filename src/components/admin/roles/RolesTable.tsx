"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  ShieldCheckIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { DataTable, type ColumnDef, type SortDir } from "@/src/components/admin/DataTable";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { RoleFormModal } from "@/src/components/admin/roles/RoleFormModal";
import Link from "next/link";
import { getRoles, bulkDeleteRoles, deleteRole } from "@/src/services/role.service";
import type { VaiTro, NhanVienVaiTro } from "@/src/types/role.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RolesTableProps {
  initialRoles: VaiTro[];
  initialTotal: number;
  initialTotalPages: number;
}

type RoleRow = VaiTro & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RolesTable({ initialRoles, initialTotal, initialTotalPages }: RolesTableProps) {
  const { showToast } = useToast();

  // ── Server data ───────────────────────────────────────────────────────────
  const [roles, setRoles] = useState<VaiTro[]>(initialRoles);
  const [loading, setLoading] = useState(false);
  const [serverTotal, setServerTotal] = useState(initialTotal);
  const [serverTotalPages, setServerTotalPages] = useState(initialTotalPages);

  // ── Fetch control refs ────────────────────────────────────────────────────
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const prevSearchRef = useRef("");
  // Set to true when sort/search/pageSize changes — triggers loading overlay
  const nonPageChangedRef = useRef(false);

  // ── Search / sort / page ──────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Delete state ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<VaiTro | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<VaiTro | null>(null);

  // ── Server fetch on every relevant state change ────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const isSearchChange = search !== prevSearchRef.current;
    prevSearchRef.current = search;

    const isNonPageChange = nonPageChangedRef.current;
    nonPageChangedRef.current = false;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(async () => {
      if (isNonPageChange) setLoading(true);
      try {
        const result = await getRoles({
          q: search || undefined,
          page,
          limit: pageSize,
          sortBy: sortKey,
          sortOrder: sortDir,
        });
        setRoles(result.data);
        setServerTotal(result.total);
        setServerTotalPages(result.totalPages);
      } catch {
        // keep existing data on error
      } finally {
        setLoading(false);
      }
    }, isSearchChange ? 300 : 0);

    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  }, [page, pageSize, search, sortKey, sortDir]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback((q: string) => {
    nonPageChangedRef.current = true;
    setSearch(q);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((key: string, dir: SortDir) => {
    nonPageChangedRef.current = true;
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    nonPageChangedRef.current = true;
    setPageSize(size);
    setPage(1);
  }, []);

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: ColumnDef<RoleRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Tên vai trò",
        sortable: true,
        width: "w-48",
        render: (_, row) => (
          <span className="font-medium text-secondary-900">{row.name}</span>
        ),
      },
      {
        key: "description",
        header: "Mô tả",
        render: (_, row) => (
          <span className="text-sm text-secondary-600 line-clamp-2">
            {row.description}
          </span>
        ),
      },
      {
        key: "permissions",
        header: "Số quyền",
        align: "center",
        width: "w-28",
        render: (_, row) => (
          <Badge variant="primary" size="sm">
            {row.permissions.length} quyền
          </Badge>
        ),
      },
      {
        key: "employeeCount",
        header: "Nhân viên",
        align: "center",
        width: "w-32",
        sortable: true,
        render: (_, row) => (
          <span className="text-sm text-secondary-700">
            {row.employeeCount}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Ngày tạo",
        sortable: true,
        width: "w-32",
        render: (_, row) => (
          <span className="text-sm text-secondary-500">{formatDate(row.createdAt)}</span>
        ),
      },
      {
        key: "_actions",
        header: "",
        width: "w-20",
        align: "right",
        render: (_, row): ReactNode => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              aria-label="Chỉnh sửa vai trò"
              onClick={() => { setEditRole(row as VaiTro); setModalOpen(true); }}
              className="flex h-7 w-7 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-400"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Xóa vai trò"
              onClick={() => setDeleteTarget(row as VaiTro)}
              className="flex h-7 w-7 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-error-50 hover:text-error-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error-400"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // ── Sub-row renderer (NhanVienVaiTro) ─────────────────────────────────────

  const getSubRows = useCallback(
    (row: RoleRow) => {
      const assignments = row.assignments as NhanVienVaiTro[];
      return assignments?.length ? (assignments as unknown as Record<string, unknown>[]) : undefined;
    },
    []
  );

  const renderSubRow = useCallback(
    (subRow: Record<string, unknown>): ReactNode => {
      const assignment = subRow as unknown as NhanVienVaiTro;
      return (
        <tr className="bg-secondary-50/60">
          <td className="w-10 px-4 py-2.5" />
          <td className="w-8 px-2 py-2.5" />
          <td className="px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary-100 text-center text-xs leading-6 font-medium text-primary-700">
                {assignment.employeeName.charAt(0)}
              </div>
              <Link
                href={`/employees/${assignment.employeeId}`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-400 rounded"
              >
                {assignment.employeeName}
              </Link>
            </div>
          </td>
          <td className="px-4 py-2.5 text-sm text-secondary-500">{assignment.employeeEmail}</td>
          <td className="px-4 py-2.5" />
          <td className="px-4 py-2.5" />
          <td className="px-4 py-2.5 text-sm text-secondary-400">
            {formatDate(assignment.assignedAt)}
          </td>
          <td className="px-4 py-2.5" />
        </tr>
      );
    },
    []
  );

  // ── Mutation handlers ──────────────────────────────────────────────────────

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteRole(deleteTarget.id);
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setServerTotal((t) => t - 1);
      setDeleteTarget(null);
      showToast("Đã xóa vai trò.", "success");
    } catch {
      showToast("Không thể xóa vai trò. Vui lòng thử lại.", "error");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, showToast]);

  const handleBulkDelete = useCallback((keys: string[]) => {
    if (keys.length > 0) setBulkDeleteTargets(keys);
  }, []);

  const handleBulkDeleteConfirm = useCallback(async () => {
    setIsBulkDeleting(true);
    try {
      await bulkDeleteRoles(bulkDeleteTargets);
      setRoles((prev) => prev.filter((r) => !bulkDeleteTargets.includes(r.id)));
      setServerTotal((t) => t - bulkDeleteTargets.length);
      setBulkDeleteTargets([]);
      showToast(`Đã xóa ${bulkDeleteTargets.length} vai trò.`, "success");
    } catch {
      showToast("Không thể xóa vai trò. Vui lòng thử lại.", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  }, [bulkDeleteTargets, showToast]);

  const handleSaved = useCallback((saved: VaiTro) => {
    setRoles((prev) => {
      const idx = prev.findIndex((r) => r.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...prev[idx], ...saved };
        return next;
      }
      setServerTotal((t) => t + 1);
      return [saved, ...prev];
    });
    showToast(editRole ? "Đã cập nhật vai trò." : "Đã tạo vai trò mới.", "success");
  }, [editRole, showToast]);

  const openCreateModal = useCallback(() => {
    setEditRole(null);
    setModalOpen(true);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
            <ArrowPathIcon className="h-6 w-6 animate-spin text-primary-600" aria-hidden="true" />
          </div>
        )}
        <DataTable
          data={roles as unknown as RoleRow[]}
          columns={columns}
          keyField="id"
          selectable
          bulkActions={[
            {
              id: "bulk-delete",
              label: "Xóa đã chọn",
              isDanger: true,
              onClick: handleBulkDelete,
            },
          ]}
          getSubRows={getSubRows}
          renderSubRow={renderSubRow}
          expandedByDefault={false}
          searchQuery={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm theo tên vai trò, mô tả…"
          toolbarActions={
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <PlusIcon className="h-4 w-4" />
              Thêm vai trò
            </Button>
          }
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          page={page}
          pageSize={pageSize}
          totalRows={serverTotal}
          pageSizeOptions={[10, 25, 50]}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          emptyMessage="Không tìm thấy vai trò nào."
          emptyIcon={<ShieldCheckIcon className="h-12 w-12" />}
          emptyAction={
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              Thêm vai trò đầu tiên
            </Button>
          }
        />
      </div>

      {/* Create / Edit modal */}
      <RoleFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        role={editRole}
        onSaved={handleSaved}
      />

      {/* Single delete confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa vai trò"
        description={`Bạn có chắc chắn muốn xóa vai trò "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa vai trò"
        variant="danger"
        isConfirming={isDeleting}
        requiredPhrase={deleteTarget?.name}
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        isOpen={bulkDeleteTargets.length > 0}
        onClose={() => setBulkDeleteTargets([])}
        onConfirm={handleBulkDeleteConfirm}
        title={`Xóa ${bulkDeleteTargets.length} vai trò`}
        description="Tất cả vai trò đã chọn sẽ bị xóa vĩnh viễn. Nhân viên thuộc các vai trò này sẽ mất quyền liên quan."
        confirmLabel="Xóa tất cả"
        variant="danger"
        isConfirming={isBulkDeleting}
        requiredPhrase="DELETE"
      />
    </>
  );
}
