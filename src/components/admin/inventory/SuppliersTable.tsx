"use client";

import { useEffect, useRef, useState } from "react";
import {
  DataTable,
  RowActions,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { SupplierFormModal } from "@/src/components/admin/inventory/SupplierFormModal";
import { PlusIcon, PencilIcon } from "@heroicons/react/24/outline";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
} from "@/src/services/inventory.service";
import { useToast } from "@/src/components/ui/Toast";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Button } from "@/src/components/ui/Button";
import type { Supplier } from "@/src/types/inventory.types";

type Row = Supplier & Record<string, unknown>;

const PAGE_SIZE = 10;

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const STATUS_OPTIONS = [
  { value: "active", label: "Đang hợp tác" },
  { value: "inactive", label: "Ngưng hợp tác" },
];

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: "name",
    header: "Nhà cung cấp",
    sortable: true,
    render: (_, row) => (
      <div className="space-y-0.5">
        <Tooltip content={row.name as string} placement="top" anchorToContent>
          <p className="truncate max-w-[200px] text-sm font-semibold text-secondary-900">
            {row.name as string}
          </p>
        </Tooltip>
        <p className="text-xs text-secondary-500">{row.contactName as string}</p>
        {row.notes && (
          <Tooltip content={row.notes as string} placement="bottom" multiline maxWidth="320px">
            <p className="truncate max-w-[200px] text-xs text-secondary-400 italic cursor-default">
              {row.notes as string}
            </p>
          </Tooltip>
        )}
      </div>
    ),
  },
  {
    key: "email",
    header: "Liên hệ",
    render: (_, row) => (
      <div className="space-y-0.5">
        {row.email ? (
          <Tooltip content={row.email as string} placement="top" copy anchorToContent>
            <p className="text-sm text-secondary-700 cursor-pointer hover:text-blue-600 transition-colors">
              {row.email as string}
            </p>
          </Tooltip>
        ) : (
          <p className="text-sm text-secondary-300">—</p>
        )}
        {row.phone ? (
          <Tooltip content={row.phone as string} placement="bottom" copy anchorToContent>
            <p className="text-xs text-secondary-500 cursor-pointer hover:text-blue-600 transition-colors">
              {row.phone as string}
            </p>
          </Tooltip>
        ) : (
          <p className="text-xs text-secondary-300">—</p>
        )}
      </div>
    ),
  },
  {
    key: "status",
    header: "Trạng thái",
    sortable: true,
    align: "center",
    render: (_, row) => <StatusBadge status={row.status as string} size="sm" />,
  },
  {
    key: "productCount",
    header: "Sản phẩm",
    sortable: true,
    align: "center",
    render: (_, row) => (
      <Tooltip content="Số lượng mã hàng đã nhập từ nhà cung cấp này" placement="top">
        <span className="text-sm font-medium text-secondary-700">{row.productCount as number}</span>
      </Tooltip>
    ),
  },
  {
    key: "totalOrders",
    header: "Phiếu nhập",
    sortable: true,
    align: "center",
    render: (_, row) => (
      <Tooltip content="Tổng số phiếu nhập kho từ nhà cung cấp này" placement="top">
        <span className="text-sm font-medium text-secondary-700">{row.totalOrders as number}</span>
      </Tooltip>
    ),
  },
  {
    key: "leadTimeDays",
    header: "Lead time",
    align: "center",
    render: (_, row) => (
      <Tooltip content="Thời gian giao hàng dự kiến (ngày)" placement="top">
        <span className="text-sm text-secondary-500">{row.leadTimeDays as number}d</span>
      </Tooltip>
    ),
  },
  {
    key: "createdAt",
    header: "Ngày thêm",
    sortable: true,
    align: "center",
    render: (_, row) => (
      <span className="whitespace-nowrap text-sm text-secondary-400">
        {formatDate(row.createdAt as string)}
      </span>
    ),
  },
  {
    key: "updatedAt",
    header: "Cập nhật lần cuối",
    sortable: true,
    align: "center",
    render: (_, row) => (
      <span className="whitespace-nowrap text-sm text-secondary-400">
        {formatDate(row.updatedAt as string)}
      </span>
    ),
  },
  {
    key: "_actions",
    header: "",
    render: () => null,
  },
];

export function SuppliersTable() {
  const { showToast } = useToast();

  const [data, setData] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const prevNonPageKey = useRef(
    JSON.stringify({ search: "", statusFilter: [], sortKey: "name", sortDir: "asc", pageSize: PAGE_SIZE })
  );
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const prevSearchRef = useRef("");

  async function fetchData(opts: { showLoader: boolean }) {
    if (opts.showLoader) setLoading(true);
    try {
      const result = await getSuppliers({
        page,
        limit: pageSize,
        search: q || undefined,
        status: statusFilter[0] || undefined,
        sortBy: sortKey,
        sortDir: sortDir as "asc" | "desc",
      });
      setData(result.data);
      setTotal(result.total);
    } catch {
      showToast("Không thể tải danh sách nhà cung cấp.", "error");
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    fetchData({ showLoader: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subsequent changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const nonPageKey = JSON.stringify({ search: q, statusFilter, sortKey, sortDir, pageSize });
    const isPageOnly = nonPageKey === prevNonPageKey.current;
    prevNonPageKey.current = nonPageKey;

    const isSearchChange = q !== prevSearchRef.current;
    prevSearchRef.current = q;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(
      () => fetchData({ showLoader: !isPageOnly }),
      isSearchChange ? 300 : 0
    );

    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q, statusFilter, sortKey, sortDir]);

  // Reset page when filters/sort change
  useEffect(() => {
    setPage(1);
  }, [q, statusFilter, sortKey, sortDir, pageSize]);

  async function handleCreate(
    payload: Omit<Supplier, "id" | "productCount" | "totalOrders" | "createdAt" | "updatedAt">
  ) {
    setIsSaving(true);
    try {
      await createSupplier(payload);
      setModalOpen(false);
      showToast("Đã thêm nhà cung cấp.", "success");
      fetchData({ showLoader: false });
    } catch {
      showToast("Không thể thêm nhà cung cấp.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEdit(
    payload: Omit<Supplier, "id" | "productCount" | "totalOrders" | "createdAt" | "updatedAt">
  ) {
    if (!editingSupplier) return;
    setIsSaving(true);
    try {
      await updateSupplier(editingSupplier.id, payload);
      setModalOpen(false);
      setEditingSupplier(undefined);
      showToast("Đã cập nhật nhà cung cấp.", "success");
      fetchData({ showLoader: false });
    } catch {
      showToast("Không thể cập nhật nhà cung cấp.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  const columnsWithActions: ColumnDef<Row>[] = [
    ...COLUMNS.slice(0, -1),
    {
      key: "_actions",
      header: "",
      render: (_, row) => (
        <RowActions>
          <button
            type="button"
            onClick={() => {
              setEditingSupplier(row as unknown as Supplier);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-secondary-600 hover:bg-secondary-100 transition-colors"
          >
            <PencilIcon className="w-3.5 h-3.5" />
            Sửa
          </button>
        </RowActions>
      ),
    },
  ];

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Trạng thái"
        options={STATUS_OPTIONS}
        selected={statusFilter}
        onChange={(v) => setStatusFilter(v)}
      />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {total} nhà cung cấp
      </span>
      <Button
        variant="primary"
        onClick={() => {
          setEditingSupplier(undefined);
          setModalOpen(true);
        }}
        className="rounded-lg"
      >
        <PlusIcon className="w-4 h-4" />
        Thêm
      </Button>
    </>
  );

  return (
    <>
      <DataTable<Row>
        columns={columnsWithActions}
        data={data as Row[]}
        keyField="id"
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(key, dir) => {
          setSortKey(key);
          setSortDir(dir);
        }}
        searchQuery={q}
        onSearchChange={(val) => setQ(val)}
        searchPlaceholder="Tìm theo tên, người liên hệ, email…"
        toolbarActions={toolbarActions}
        page={page}
        pageSize={pageSize}
        totalRows={total}
        pageSizeOptions={[10, 25, 50]}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        emptyMessage="Không tìm thấy nhà cung cấp nào."
        isLoading={loading}
      />
      <SupplierFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSupplier(undefined);
        }}
        onConfirm={editingSupplier ? handleEdit : handleCreate}
        initialData={editingSupplier}
        isConfirming={isSaving}
      />
    </>
  );
}
