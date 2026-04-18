"use client";

import { useMemo, useState } from "react";
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
import { createSupplier, updateSupplier } from "@/src/services/inventory.service";
import { useToast } from "@/src/components/ui/Toast";
import type { Supplier } from "@/src/types/inventory.types";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Button } from "@/src/components/ui/Button";

type Row = Supplier & Record<string, unknown>;

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

const STATUS_OPTIONS = [
  { value: "active",   label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: "name",
    header: "Nhà cung cấp",
    sortable: true,
    render: (_, row) => (
      <div>
        <Tooltip content={row.name as string} placement="top" anchorToContent>
          <p className="text-sm font-semibold text-secondary-900">{row.name as string}</p>
        </Tooltip>
        <p className="text-xs text-secondary-500">{row.contactName as string}</p>
      </div>
    ),
  },
  {
    key: "email",
    header: "Liên hệ",
    render: (_, row) => (
      <div>
        <p className="text-sm text-secondary-700">{row.email as string}</p>
        <p className="text-xs text-secondary-500">{row.phone as string}</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "trạng thái",
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
      <span className="text-sm text-secondary-600">{row.productCount as number}</span>
    ),
  },
  {
    key: "totalOrders",
    header: "Đơn hàng",
    sortable: true,
    align: "center",
    render: (_, row) => (
      <span className="text-sm text-secondary-600">{row.totalOrders as number}</span>
    ),
  },
  {
    key: "createdAt",
    header: "Đã thêm lúc",
    sortable: true,
    align: "center",
    render: (_, row) => (
      <span className="whitespace-nowrap text-sm text-secondary-500">
        {formatDate(row.createdAt as string)}
      </span>
    ),
  },
  {
    key: "_actions",
    header: "",
    render: () => null, // replaced dynamically
  },
];

export function SuppliersTable({ initialSuppliers }: { initialSuppliers: Supplier[] }) {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const filtered = useMemo(() => {
    let rows = [...suppliers] as Row[];
    if (q.trim()) {
      const lower = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.name as string).toLowerCase().includes(lower) ||
          (r.contactName as string).toLowerCase().includes(lower) ||
          (r.email as string).toLowerCase().includes(lower)
      );
    }
    if (statusFilter.length > 0) {
      rows = rows.filter((r) => statusFilter.includes(r.status as string));
    }
    rows.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] as string | number;
      const bv = (b as unknown as Record<string, unknown>)[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [suppliers, q, statusFilter, sortKey, sortDir]);

  const totalRows = filtered.length;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleCreate(payload: Omit<Supplier, "id" | "productCount" | "totalOrders" | "createdAt" | "updatedAt">) {
    setIsSaving(true);
    try {
      const created = await createSupplier(payload);
      setSuppliers((prev) => [...prev, created]);
      setModalOpen(false);
      showToast("Supplier added.", "success");
    } catch {
      showToast("Failed to add supplier.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEdit(payload: Omit<Supplier, "id" | "productCount" | "totalOrders" | "createdAt" | "updatedAt">) {
    if (!editingSupplier) return;
    setIsSaving(true);
    try {
      const updated = await updateSupplier(editingSupplier.id, payload);
      setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setModalOpen(false);
      setEditingSupplier(undefined);
      showToast("Supplier updated.", "success");
    } catch {
      showToast("Failed to update supplier.", "error");
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
            onClick={() => { setEditingSupplier(row as unknown as Supplier); setModalOpen(true); }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-secondary-600 hover:bg-secondary-100 transition-colors"
          >
            <PencilIcon className="w-3.5 h-3.5" />
            Edit
          </button>
        </RowActions>
      ),
    },
  ];

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Status"
        options={STATUS_OPTIONS}
        selected={statusFilter}
        onChange={(v) => { setStatusFilter(v); setPage(1); }}
      />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {totalRows} supplier{totalRows !== 1 ? "s" : ""}
      </span>
      <Button
        variant="primary"
        onClick={() => { setEditingSupplier(undefined); setModalOpen(true); }}
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
        data={pageRows}
        keyField="id"
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
        searchQuery={q}
        onSearchChange={(val) => { setQ(val); setPage(1); }}
        searchPlaceholder="Search by name, contact or email…"
        toolbarActions={toolbarActions}
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        pageSizeOptions={[10, 25, 50]}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        emptyMessage="No suppliers found."
      />
      <SupplierFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSupplier(undefined); }}
        onConfirm={editingSupplier ? handleEdit : handleCreate}
        initialData={editingSupplier}
        isConfirming={isSaving}
      />
    </>
  );
}
