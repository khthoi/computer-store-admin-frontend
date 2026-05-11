"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowPathIcon, PlusIcon, UserGroupIcon, MapPinIcon } from "@heroicons/react/24/outline";
import {
  DataTable,
  RowActions,
  RowActionEdit,
  RowActionDelete,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { CustomerFormModal } from "@/src/components/admin/customers/CustomerFormModal";
import { Tooltip } from "@/src/components/ui/Tooltip";
import {
  getCustomers,
  deleteCustomer,
  bulkUpdateCustomerStatus,
} from "@/src/services/customer.service";
import { formatVND } from "@/src/lib/format";
import type { KhachHang, DiaChiGiaoHang, CustomerStatus } from "@/src/types/customer.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomersTableProps {
  initialCustomers: KhachHang[];
  initialTotal: number;
}

type CustomerRow = KhachHang & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const STATUS_FILTER_OPTIONS = [
  { value: "active",   label: "Đang hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "banned",   label: "Đã bị cấm" },
];

// ─── Columns (static — no closures over changing state) ───────────────────────

const COLUMNS: ColumnDef<CustomerRow>[] = [
  {
    key: "fullName",
    header: "Khách hàng",
    sortable: true,
    width: "w-64",
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.avatarUrl as string | undefined} name={row.fullName} size="sm" />
        <div className="min-w-0">
          <Tooltip content={row.fullName} placement="top" anchorToContent>
            <Link
              href={`/customers/${row.id as string}`}
              className="block truncate font-medium text-secondary-900 transition-colors hover:text-primary-600"
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
    width: "w-80",
    render: (_, row) => (
      <span className="truncate text-sm text-secondary-600">{row.email}</span>
    ),
  },
  {
    key: "phone",
    header: "Điện thoại",
    width: "w-32",
    render: (_, row) => (
      <span className="text-sm text-secondary-600">{row.phone}</span>
    ),
  },
  {
    key: "status",
    header: "Trạng thái",
    width: "w-32",
    align: "center",
    render: (_, row) => <StatusBadge status={row.status as CustomerStatus} />,
  },
  {
    key: "totalOrders",
    header: "Đơn hàng",
    align: "center",
    width: "w-33",
    sortable: true,
    render: (_, row) => (
      <span className="text-sm text-secondary-700">
        {(row.totalOrders as number).toLocaleString("vi-VN")}
      </span>
    ),
  },
  {
    key: "totalSpent",
    header: "Chi tiêu",
    align: "center",
    width: "w-33",
    sortable: true,
    render: (_, row) => (
      <span className="text-sm font-medium text-secondary-900">
        {formatVND(row.totalSpent as number)}
      </span>
    ),
  },
  {
    key: "registeredAt",
    header: "Ngày đăng ký",
    sortable: true,
    width: "w-38",
    align: "center",
    render: (_, row) => (
      <span className="text-sm text-secondary-500">
        {formatDate(row.registeredAt as string)}
      </span>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomersTable({ initialCustomers, initialTotal }: CustomersTableProps) {
  const { showToast } = useToast();

  const [customers, setCustomers]       = useState<KhachHang[]>(initialCustomers);
  const [serverTotal, setServerTotal]   = useState<number>(initialTotal);
  const [loading, setLoading]           = useState(false);

  const fetchTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender     = useRef(true);
  const prevSearchRef     = useRef("");
  const nonPageChangedRef = useRef(false);

  // ── Filter / search / sort / page ──────────────────────────────────────────

  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortKey, setSortKey]         = useState("registeredAt");
  const [sortDir, setSortDir]         = useState<SortDir>("desc");
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(PAGE_SIZE);

  // ── Server-fetch effect ─────────────────────────────────────────────────────

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const isSearchChange  = search !== prevSearchRef.current;
    prevSearchRef.current = search;
    const isNonPageChange = nonPageChangedRef.current;
    nonPageChangedRef.current = false;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(async () => {
      if (isNonPageChange) setLoading(true);
      try {
        const result = await getCustomers({
          q:      search || undefined,
          status: statusFilter.length === 1 ? statusFilter[0] : undefined,
          page,
          limit:  pageSize,
        });
        setCustomers(result.data);
        setServerTotal(result.total);
      } catch {
        // keep existing data on error
      } finally {
        setLoading(false);
      }
    }, isSearchChange ? 300 : 0);

    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  }, [page, pageSize, search, statusFilter, sortKey, sortDir]);

  // ── Client-side sort on current page ───────────────────────────────────────

  const sorted = useMemo(() => {
    const arr = [...customers];
    arr.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey];
      const bv = (b as unknown as Record<string, unknown>)[sortKey];
      let cmp = 0;
      if (typeof av === "string" && typeof bv === "string") cmp = av.localeCompare(bv);
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [customers, sortKey, sortDir]);

  // ── Delete state ────────────────────────────────────────────────────────────

  const [deleteTarget, setDeleteTarget] = useState<KhachHang | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  // ── Modal state ─────────────────────────────────────────────────────────────

  const [modalOpen, setModalOpen]       = useState(false);
  const [editCustomer, setEditCustomer] = useState<KhachHang | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSortChange = useCallback((key: string, dir: SortDir) => {
    nonPageChangedRef.current = true;
    setSortKey(key); setSortDir(dir); setPage(1);
  }, []);

  const handleSearchChange = useCallback((val: string) => {
    nonPageChangedRef.current = true;
    setSearch(val); setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((values: string[]) => {
    nonPageChangedRef.current = true;
    setStatusFilter(values); setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    nonPageChangedRef.current = true;
    setPageSize(size); setPage(1);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(deleteTarget.id);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setServerTotal((t) => Math.max(0, t - 1));
      setDeleteTarget(null);
      showToast("Đã xóa khách hàng.", "success");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, showToast]);

  const handleBulkBan = useCallback((keys: string[]) => {
    void bulkUpdateCustomerStatus(keys, "banned")
      .then(() => {
        setCustomers((prev) =>
          prev.map((c) => keys.includes(c.id) ? { ...c, status: "banned" as const } : c)
        );
        showToast(`Đã cấm ${keys.length} khách hàng.`, "success");
      })
      .catch(() => showToast("Không thể cấm tài khoản. Vui lòng thử lại.", "error"));
  }, [showToast]);

  const handleBulkActivate = useCallback((keys: string[]) => {
    void bulkUpdateCustomerStatus(keys, "active")
      .then(() => {
        setCustomers((prev) =>
          prev.map((c) => keys.includes(c.id) ? { ...c, status: "active" as const } : c)
        );
        showToast(`Đã kích hoạt ${keys.length} khách hàng.`, "success");
      })
      .catch(() => showToast("Không thể kích hoạt tài khoản. Vui lòng thử lại.", "error"));
  }, [showToast]);

  const handleSaved = useCallback((saved: KhachHang) => {
    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...prev[idx], ...saved };
        return next;
      }
      setServerTotal((t) => t + 1);
      return [saved, ...prev];
    });
    showToast(editCustomer ? "Đã cập nhật khách hàng." : "Đã thêm khách hàng mới.", "success");
  }, [editCustomer, showToast]);

  const openCreateModal = useCallback(() => {
    setEditCustomer(null);
    setModalOpen(true);
  }, []);

  // ── Expandable sub-rows (shipping addresses) ────────────────────────────────

  const getSubRows = useCallback((row: CustomerRow) => {
    const addresses = row.shippingAddresses as DiaChiGiaoHang[];
    return addresses?.length ? (addresses as unknown as Record<string, unknown>[]) : undefined;
  }, []);

  const renderSubRow = useCallback((subRow: Record<string, unknown>): ReactNode => {
    const addr = subRow as unknown as DiaChiGiaoHang;
    const fullAddress = [addr.addressLine, addr.ward, addr.district, addr.province]
      .filter(Boolean)
      .join(", ");
    return (
      <tr className="bg-secondary-50/60">
        <td className="w-10 px-4 py-2.5" />
        <td className="w-8 px-2 py-2.5" />
        <td className="overflow-hidden px-4 py-2.5">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 shrink-0 text-secondary-400" />
            <span className="truncate text-sm text-secondary-700">{addr.recipientName}</span>
          </div>
        </td>
        <td className="max-w-[32] overflow-hidden px-4 py-2.5 text-sm text-secondary-500">
          <Tooltip content={fullAddress} placement="top">
            <span className="inline-block max-w-full truncate align-middle">{fullAddress}</span>
          </Tooltip>
        </td>
        <td className="whitespace-nowrap px-4 py-2.5 text-sm text-secondary-500">{addr.phone}</td>
        <td className="flex items-center justify-center gap-1 px-4 py-2.5">
          {addr.isDefault && (
            <Badge variant="success" size="sm" dot>
              Mặc định
            </Badge>
          )}
        </td>
        <td className="px-4 py-2.5" />
        <td className="px-4 py-2.5" />
      </tr>
    );
  }, []);

  const rowClassName = useCallback((row: CustomerRow) => {
    return row.status === "banned" ? "opacity-60" : undefined;
  }, []);

  // ── Columns with action handlers ────────────────────────────────────────────

  const columns: ColumnDef<CustomerRow>[] = useMemo(() => [
    ...COLUMNS,
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
                onClick={() => { setEditCustomer(row as unknown as KhachHang); setModalOpen(true); }}
              />
            </span>
          </Tooltip>
          <Tooltip content="Xoá" placement="top">
            <span className="inline-flex">
              <RowActionDelete
                ariaLabel={`Xoá ${row.fullName as string}`}
                onClick={() => setDeleteTarget(row as unknown as KhachHang)}
              />
            </span>
          </Tooltip>
        </RowActions>
      ),
    },
  ], []);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
            <ArrowPathIcon className="h-6 w-6 animate-spin text-primary-600" aria-hidden="true" />
          </div>
        )}
        <DataTable
          data={sorted as unknown as CustomerRow[]}
          columns={columns}
          keyField="id"
          selectable
          bulkActions={[
            { id: "activate", label: "Kích hoạt",     onClick: handleBulkActivate },
            { id: "ban",      label: "Cấm tài khoản", isDanger: true, onClick: handleBulkBan },
          ]}
          getSubRows={getSubRows}
          renderSubRow={renderSubRow}
          expandedByDefault={false}
          rowClassName={rowClassName}
          searchQuery={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm theo tên, email, SĐT…"
          toolbarActions={
            <div className="flex items-center gap-2">
              <FilterDropdown
                label="Trạng thái"
                options={STATUS_FILTER_OPTIONS}
                selected={statusFilter}
                onChange={handleStatusFilterChange}
              />
              <span className="whitespace-nowrap text-sm text-secondary-400">
                {serverTotal} khách hàng
              </span>
              <Button variant="primary" size="sm" onClick={openCreateModal}>
                <PlusIcon className="h-4 w-4" />
                Thêm khách hàng
              </Button>
            </div>
          }
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          page={page}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50]}
          totalRows={serverTotal}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          emptyMessage="Không tìm thấy khách hàng nào."
          emptyIcon={<UserGroupIcon className="h-12 w-12" />}
          emptyAction={
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              Thêm khách hàng đầu tiên
            </Button>
          }
        />
      </div>

      <CustomerFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={editCustomer}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa khách hàng"
        description={`Bạn có chắc chắn muốn xóa hồ sơ của "${deleteTarget?.fullName}"? Tất cả địa chỉ giao hàng cũng sẽ bị xóa.`}
        confirmLabel="Xóa khách hàng"
        variant="danger"
        isConfirming={isDeleting}
        requiredPhrase={deleteTarget?.fullName}
      />
    </>
  );
}
