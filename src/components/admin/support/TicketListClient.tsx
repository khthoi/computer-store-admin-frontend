"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef } from "@/src/components/admin/DataTable";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { TicketListToolbar, DEFAULT_TICKET_FILTERS } from "./TicketListToolbar";
import type { TicketFilters } from "./TicketListToolbar";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { TicketPriorityBadge } from "./TicketPriorityBadge";
import { TicketChannelIcon } from "./TicketChannelIcon";
import { TicketSLATimer } from "./TicketSLATimer";
import { TicketAssignModal } from "./TicketAssignModal";
import { TicketCreateModal } from "./TicketCreateModal";
import {
  getTickets,
  getTicketStats,
  getStaffOptions,
  createTicket,
  bulkAssign,
} from "@/src/services/ticket.service";
import type {
  TicketSummary,
  TicketStats,
  StaffOption,
  CreateTicketPayload,
} from "@/src/types/ticket.types";

// ─── Stat item ─────────────────────────────────────────────────────────────────

function StatItem({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-secondary-100 shadow-sm px-5 py-4 min-w-[110px]">
      <p className="text-xs text-secondary-500 mb-1">{label}</p>
      <p className={["text-2xl font-bold tracking-tight text-secondary-900", valueClass].join(" ")}>
        {value}
      </p>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Table columns ─────────────────────────────────────────────────────────────

function buildColumns(): ColumnDef<TicketSummary & Record<string, unknown>>[] {
  return [
    {
      key: "maTicket",
      header: "Mã phiếu",
      width: "120px",
      render: (_, row) => (
        <Link
          href={`/support/${row.ticketId}`}
          className="font-mono text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline"
        >
          {row.maTicket as string}
        </Link>
      ),
    },
    {
      key: "tieuDe",
      header: "Tiêu đề",
      tooltip: (_, row) => row.tieuDe as string,
      render: (_, row) => (
        <div className="space-y-0.5">
          <Link
            href={`/support/${row.ticketId}`}
            className="block text-sm font-medium text-secondary-800 hover:text-primary-700 truncate max-w-[280px]"
          >
            {row.tieuDe as string}
          </Link>
          <p className="text-xs text-secondary-400 truncate max-w-[280px]">
            {row.khachHangTen as string}
          </p>
        </div>
      ),
    },
    {
      key: "trangThai",
      header: "Trạng thái",
      width: "140px",
      align: "center",
      render: (_, row) => (
        <TicketStatusBadge status={row.trangThai as TicketSummary["trangThai"]} size="sm" />
      ),
    },
    {
      key: "mucDoUuTien",
      header: "Ưu tiên",
      width: "90px",
      align: "center",
      render: (_, row) => (
        <TicketPriorityBadge priority={row.mucDoUuTien as TicketSummary["mucDoUuTien"]} size="sm" />
      ),
    },
    {
      key: "kenhLienHe",
      header: "Kênh",
      width: "80px",
      align: "center",
      render: (_, row) => (
        <TicketChannelIcon
          channel={row.kenhLienHe as TicketSummary["kenhLienHe"]}
          className="w-4 h-4 text-secondary-500"
          showLabel
        />
      ),
    },
    {
      key: "nhanVienPhuTrachTen",
      header: "Phụ trách",
      width: "150px",
      align: "center",
      render: (_, row) => {
        const name = row.nhanVienPhuTrachTen as string | undefined;
        const ma = row.nhanVienPhuTrachMa as string | undefined;
        if (!name || !ma) {
          return <span className="text-xs text-secondary-400 italic">Chưa phân công</span>;
        }
        return (
          <Link
            href={`/employees/${ma}`}
            className="text-xs text-primary-700 hover:text-primary-800 hover:underline"
          >
            {name}
          </Link>
        );
      },
    },
    {
      key: "slaDeadline",
      header: "SLA",
      width: "110px",
      align: "center",
      render: (_, row) =>
        row.slaDeadline ? (
          <TicketSLATimer
            deadline={row.slaDeadline as string}
            isClosed={row.trangThai === "Dong"}
          />
        ) : (
          <span className="text-xs text-secondary-300">—</span>
        ),
    },
    {
      key: "lastMessageAt",
      header: "Hoạt động",
      width: "140px",
      align: "center",
      render: (_, row) => (
        <span className="text-xs text-secondary-500">
          {formatDate(row.lastMessageAt as string)}
        </span>
      ),
    },
  ];
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * TicketListClient — full ticket management list page with filters,
 * stats cards, DataTable, bulk-assign and create modal.
 */
export function TicketListClient() {
  const { showToast } = useToast();

  // ── Data ────────────────────────────────────────────────────────────────────
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ── Pagination + filters ────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<TicketFilters>(DEFAULT_TICKET_FILTERS);

  // ── Selection ───────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<string[]>([]);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const columns = buildColumns();

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [paged, ticketStats, staff] = await Promise.all([
        getTickets({
          page,
          limit: pageSize,
          search: filters.search || undefined,
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          loaiVanDe: filters.loaiVanDe || undefined,
          assignedTo: filters.assignedTo ? Number(filters.assignedTo) : undefined,
          myOnly: filters.myTicketsOnly || undefined,
          dateFrom: filters.dateRange.from?.toISOString() || undefined,
          dateTo: filters.dateRange.to?.toISOString() || undefined,
        }),
        getTicketStats(),
        getStaffOptions(),
      ]);
      setTickets(paged.data);
      setTotal(paged.total);
      setStats(ticketStats);
      setStaffOptions(staff);
    } catch {
      showToast("Lỗi tải danh sách phiếu", "error");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => { loadData(); }, [loadData]);

  function handleFilterChange(v: TicketFilters) {
    setFilters(v);
    setPage(1);
    setSelected([]);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleCreate(payload: CreateTicketPayload) {
    setIsCreating(true);
    try {
      await createTicket(payload);
      showToast("Tạo phiếu thành công", "success");
      await loadData();
    } catch {
      showToast("Không thể tạo phiếu", "error");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleAssign(payload: {
    staffId: string;
    staffName: string;
    ticketIds: string[];
  }) {
    setIsAssigning(true);
    try {
      await bulkAssign(payload.ticketIds.map(Number), Number(payload.staffId));
      showToast(`Đã phân công ${payload.ticketIds.length} phiếu cho ${payload.staffName}`, "success");
      setSelected([]);
      setShowAssign(false);
      await loadData();
    } catch {
      showToast("Không thể phân công", "error");
    } finally {
      setIsAssigning(false);
    }
  }

  const staffSelectOptions = staffOptions.map((s) => ({
    value: s.value,
    label: s.label,
    openTicketCount: s.openTicketCount,
  }));

  return (
    <div className="space-y-6">
      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      {stats && (
        <div className="flex flex-wrap gap-4">
          <StatItem label="Tổng phiếu" value={stats.tongSoTicket} />
          <StatItem label="Đang mở" value={stats.dangMo} />
          <StatItem label="Chưa xử lý" value={stats.chuaXuLy} valueClass="text-amber-600" />
          <StatItem label="Khẩn cấp" value={stats.khanCap} valueClass="text-red-600" />
          <StatItem label="Quá SLA" value={stats.slaBreached} valueClass="text-red-600" />
          <StatItem label="TB giải quyết" value={`${stats.trungBinhGiaiQuyet}g`} />
        </div>
      )}

      {/* ── Toolbar + Create button ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <TicketListToolbar
          value={filters}
          onChange={handleFilterChange}
          staffOptions={staffSelectOptions}
        />

        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusIcon className="w-4 h-4" aria-hidden="true" />}
          onClick={() => setShowCreate(true)}
        >
          Tạo phiếu
        </Button>
      </div>

      {/* ── Bulk action bar ───────────────────────────────────────────────── */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary-50 border border-primary-100 rounded-xl text-sm">
          <span className="text-primary-700 font-medium">
            Đã chọn {selected.length} phiếu
          </span>
          <Button variant="secondary" size="sm" onClick={() => setShowAssign(true)}>
            Phân công
          </Button>
          <button
            type="button"
            className="ml-auto text-xs text-secondary-400 hover:text-secondary-600"
            onClick={() => setSelected([])}
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={tickets as (TicketSummary & Record<string, unknown>)[]}
        keyField="ticketId"
        isLoading={isLoading}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        searchQuery={filters.search}
        onSearchChange={(q) => handleFilterChange({ ...filters, search: q })}
        searchPlaceholder="Tìm theo tiêu đề, mã phiếu, khách hàng..."
        page={page}
        pageSize={pageSize}
        totalRows={total}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="Không tìm thấy phiếu hỗ trợ nào"
      />

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <TicketCreateModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        isSaving={isCreating}
      />

      <TicketAssignModal
        isOpen={showAssign}
        onClose={() => setShowAssign(false)}
        onAssign={handleAssign}
        ticketIds={selected}
        staffOptions={staffSelectOptions}
        isSaving={isAssigning}
      />
    </div>
  );
}
