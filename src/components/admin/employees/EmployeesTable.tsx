"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  DataTable,
  RowActions,
  RowActionEdit,
  RowActionDelete,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { AdminEmptyState } from "@/src/components/admin/shared/AdminEmptyState";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { EmployeeFormModal } from "@/src/components/admin/employees/EmployeeFormModal";
import {
  deleteEmployee,
  bulkUpdateEmployeeStatus,
  getEmployees,
} from "@/src/services/employee.service";
import { getRoles } from "@/src/services/role.service";
import type { NhanVien, EmployeeStatus } from "@/src/types/employee.types";
import type { VaiTro } from "@/src/types/role.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmployeesTableProps {
  initialEmployees: NhanVien[];
}

type EmployeeRow = NhanVien & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** An employee with status "active" and a login within the past 30 days is protected. */
function isProtected(employee: NhanVien): boolean {
  if (employee.status !== "active") return false;
  if (!employee.lastLoginAt) return false;
  const msAgo = Date.now() - new Date(employee.lastLoginAt).getTime();
  return msAgo < 30 * 24 * 60 * 60 * 1000;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_FILTER_OPTIONS = [
  { value: "active",    label: "Đang hoạt động" },
  { value: "inactive",  label: "Tạm ngưng" },
  { value: "suspended", label: "Đình chỉ" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function EmployeesTable({ initialEmployees }: EmployeesTableProps) {
  const { showToast } = useToast();

  const [employees, setEmployees] = useState<NhanVien[]>(initialEmployees);
  const [allRoles, setAllRoles] = useState<VaiTro[]>([]);

  // Load roles for modal (lightweight async fetch)
  useEffect(() => {
    getRoles().then(({ data }) => setAllRoles(data));
  }, []);

  // ── Filter / search / sort / page ─────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { setPage(1); }, [search, statusFilter, roleFilter]);

  // ── Delete state ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<NhanVien | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<NhanVien | null>(null);

  // ── Role filter options ───────────────────────────────────────────────────
  const roleFilterOptions = useMemo(
    () => allRoles.map((r) => ({ value: r.id, label: r.name })),
    [allRoles]
  );

  // ── Filtered → sorted → paginated ────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = employees;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.fullName.toLowerCase().includes(lower) ||
          e.email.toLowerCase().includes(lower) ||
          e.code.toLowerCase().includes(lower)
      );
    }
    if (statusFilter.length) {
      result = result.filter((e) => statusFilter.includes(e.status));
    }
    if (roleFilter.length) {
      result = result.filter((e) => e.roleIds.some((id) => roleFilter.includes(id)));
    }
    return result;
  }, [employees, search, statusFilter, roleFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey];
      const bv = (b as unknown as Record<string, unknown>)[sortKey];
      let cmp = 0;
      if (typeof av === "string" && typeof bv === "string") cmp = av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalRows = sorted.length;
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: ColumnDef<EmployeeRow>[] = useMemo(
    () => [
      {
        key: "fullName",
        header: "Nhân viên",
        sortable: true,
        width: "w-64",
        render: (_, row) => (
          <div className="flex items-center gap-3">
            <Avatar src={row.avatarUrl as string | undefined} name={row.fullName} size="sm" />
            <div className="min-w-0">
              <Tooltip content={row.fullName} placement="top" anchorToContent>
                <Link
                  href={`/employees/${row.id as string}`}
                  className="font-medium text-secondary-900 hover:text-primary-600 transition-colors truncate block"
                >
                  {row.fullName}
                </Link>
              </Tooltip>
              <p className="text-xs text-secondary-400">{row.code}</p>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        width: "w-70",
        render: (_, row) => (
          <span className="text-sm text-secondary-600 truncate">{row.email}</span>
        ),
      },
      {
        key: "roleNames",
        header: "Vai trò",
        render: (_, row) => {
          const names = row.roleNames as string[];
          if (!names.length) return <span className="text-xs text-secondary-400">—</span>;
          const visible = names.slice(0, 2);
          const extra = names.length - 2;
          return (
            <div className="flex flex-wrap gap-1">
              {visible.map((n) => (
                <Badge key={n} variant="primary" size="sm">{n}</Badge>
              ))}
              {extra > 0 && (
                <Badge variant="default" size="sm">+{extra}</Badge>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Trạng thái",
        width: "w-32",
        align: "center",
        render: (_, row) => <StatusBadge status={row.status as EmployeeStatus} />,
      },
      {
        key: "lastLoginAt",
        header: "Đăng nhập gần nhất",
        width: "w-46",
        align: "center",
        render: (_, row) => (
          <span className="text-sm text-secondary-500">
            {row.lastLoginAt ? formatDateTime(row.lastLoginAt as string) : "—"}
          </span>
        ),
      },
      {
        key: "_actions",
        header: "",
        width: "w-20",
        align: "right",
        render: (_, row): ReactNode => (
          <RowActions>
            <Tooltip content="Sửa" placement="top">
              <span className="inline-flex">
                <RowActionEdit
                  ariaLabel={`Chỉnh sửa ${row.fullName as string}`}
                  onClick={() => { setEditEmployee(row as NhanVien); setModalOpen(true); }}
                />
              </span>
            </Tooltip>
            <Tooltip content="Xoá" placement="top">
              <span className="inline-flex">
                <RowActionDelete
                  ariaLabel={`Xoá ${row.fullName as string}`}
                  onClick={() => handleDeleteClick(row as NhanVien)}
                />
              </span>
            </Tooltip>
          </RowActions>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDeleteClick = useCallback((employee: NhanVien) => {
    if (isProtected(employee)) {
      showToast(
        "Không thể xóa nhân viên đang hoạt động và đã đăng nhập gần đây.",
        "error"
      );
      return;
    }
    setDeleteTarget(employee);
  }, [showToast]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Đã xóa nhân viên.", "success");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, showToast]);

  const handleBulkActivate = useCallback((keys: string[]) => {
    void bulkUpdateEmployeeStatus(keys, "active").then(() => {
      setEmployees((prev) =>
        prev.map((e) => keys.includes(e.id) ? { ...e, status: "active" as const } : e)
      );
      showToast(`Đã kích hoạt ${keys.length} nhân viên.`, "success");
    });
  }, [showToast]);

  const handleBulkDeactivate = useCallback((keys: string[]) => {
    void bulkUpdateEmployeeStatus(keys, "inactive").then(() => {
      setEmployees((prev) =>
        prev.map((e) => keys.includes(e.id) ? { ...e, status: "inactive" as const } : e)
      );
      showToast(`Đã tạm ngưng ${keys.length} nhân viên.`, "success");
    });
  }, [showToast]);

  const handleBulkDeleteClick = useCallback((keys: string[]) => {
    const deletable = employees
      .filter((e) => keys.includes(e.id) && !isProtected(e))
      .map((e) => e.id);
    if (deletable.length < keys.length) {
      showToast("Một số nhân viên đang hoạt động không thể xóa và đã bị bỏ qua.", "warning");
    }
    if (deletable.length > 0) setBulkDeleteTargets(deletable);
  }, [employees, showToast]);

  const handleBulkDeleteConfirm = useCallback(async () => {
    setIsBulkDeleting(true);
    try {
      await Promise.all(bulkDeleteTargets.map((id) => deleteEmployee(id)));
      setEmployees((prev) => prev.filter((e) => !bulkDeleteTargets.includes(e.id)));
      setBulkDeleteTargets([]);
      showToast(`Đã xóa ${bulkDeleteTargets.length} nhân viên.`, "success");
    } finally {
      setIsBulkDeleting(false);
    }
  }, [bulkDeleteTargets, showToast]);

  const handleSaved = useCallback((saved: NhanVien) => {
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    // Refresh roles in case they changed
    getEmployees().then(({ data }) => setEmployees(data));
    showToast(editEmployee ? "Đã cập nhật nhân viên." : "Đã thêm nhân viên mới.", "success");
  }, [editEmployee, showToast]);

  const openCreateModal = useCallback(() => {
    setEditEmployee(null);
    setModalOpen(true);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <DataTable
        data={pageData as unknown as EmployeeRow[]}
        columns={columns}
        keyField="id"
        selectable
        bulkActions={[
          { id: "activate",   label: "Kích hoạt",   onClick: handleBulkActivate },
          { id: "deactivate", label: "Tạm ngưng",   onClick: handleBulkDeactivate },
          { id: "delete",     label: "Xóa đã chọn", isDanger: true, onClick: handleBulkDeleteClick },
        ]}
        searchQuery={search}
        onSearchChange={(q) => { setSearch(q); setPage(1); }}
        searchPlaceholder="Tìm theo tên, email, mã NV…"
        toolbarActions={
          <div className="flex items-center gap-2">
            <FilterDropdown
              label="Trạng thái"
              options={STATUS_FILTER_OPTIONS}
              selected={statusFilter}
              onChange={setStatusFilter}
            />
            <FilterDropdown
              label="Vai trò"
              options={roleFilterOptions}
              selected={roleFilter}
              onChange={setRoleFilter}
            />
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <PlusIcon className="h-4 w-4" />
              Thêm nhân viên
            </Button>
          </div>
        }
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(k, d) => { setSortKey(k); setSortDir(d); setPage(1); }}
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        emptyMessage="Không tìm thấy nhân viên nào."
        emptyIcon={<UserGroupIcon className="h-12 w-12" />}
        emptyAction={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            Thêm nhân viên đầu tiên
          </Button>
        }
      />

      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={editEmployee}
        allRoles={allRoles}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa nhân viên"
        description={`Bạn có chắc chắn muốn xóa tài khoản của "${deleteTarget?.fullName}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa nhân viên"
        variant="danger"
        isConfirming={isDeleting}
        requiredPhrase={deleteTarget?.fullName}
      />

      <ConfirmDialog
        isOpen={bulkDeleteTargets.length > 0}
        onClose={() => setBulkDeleteTargets([])}
        onConfirm={handleBulkDeleteConfirm}
        title={`Xóa ${bulkDeleteTargets.length} nhân viên`}
        description="Tất cả tài khoản đã chọn sẽ bị xóa vĩnh viễn."
        confirmLabel="Xóa tất cả"
        variant="danger"
        isConfirming={isBulkDeleting}
        requiredPhrase="DELETE"
      />
    </>
  );
}
