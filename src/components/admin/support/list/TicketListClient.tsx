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
import { TicketStatusBadge } from "../badges/TicketStatusBadge";
import { TicketPriorityBadge } from "../badges/TicketPriorityBadge";
import { TicketIssueTypeBadge } from "../badges/TicketIssueTypeBadge";
import { TicketChannelIcon } from "../badges/TicketChannelIcon";
import { TicketSLATimer } from "../badges/TicketSLATimer";
import { TicketAssignModal } from "../detail/TicketAssignModal";
import { TicketCreateModal } from "../detail/TicketCreateModal";
import {
  getTickets,
  getTicketStats,
  getStaffOptions,
  createTicket,
  assignTicket,
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

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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
      key: "loaiVanDe",
      header: "Loại vấn đề",
      width: "140px",
      align: "center",
      render: (_, row) => (
        <TicketIssueTypeBadge issueType={row.loaiVanDe as TicketSummary["loaiVanDe"]} size="sm" />
      ),
    },
    {
      key: "trangThai",
      header: "Trạng thái",
      width: "140px",
      align: "center",
      render: (_, row) => (
        <TicketStatusBadge
          status={row.trangThai as TicketSummary["trangThai"]}
          lastSenderType={row.lastSenderType as TicketSummary["lastSenderType"]}
          size="sm"
        />
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
            isClosed={row.trangThai === "DaDong"}
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
      render: (_, row) => {
        const at = row.lastMessageAt as string | undefined;
        return at ? (
          <span className="text-xs text-secondary-500">{formatDate(at)}</span>
        ) : (
          <span className="text-xs text-secondary-300">—</span>
        );
      },
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
          dateFrom: filters.dateRange.from
            ? toLocalDateString(filters.dateRange.from)
            : undefined,
          dateTo: filters.dateRange.to
            ? toLocalDateString(filters.dateRange.to)
            : undefined,
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

  async function handleAssignOne(ticketId: string, staffId: string) {
    await assignTicket(Number(ticketId), Number(staffId));
  }

  async function handleAssignDone(result: { successIds: string[]; failedIds: string[]; staffName: string }) {
    setSelected([]);
    await loadData();
    if (result.failedIds.length === 0) {
      showToast(`Đã phân công ${result.successIds.length} phiếu cho ${result.staffName}`, "success");
    } else {
      showToast(
        `Phân công hoàn tất: ${result.successIds.length} thành công, ${result.failedIds.length} thất bại`,
        "error"
      );
    }
  }

  const staffSelectOptions = staffOptions.map((s) => ({
    value:       s.value,
    label:       s.label,
    subLabel:    s.email,
    description: s.phone,
    badge:       { text: `${s.openTicketCount} mở`, variant: s.openTicketCount > 0 ? "warning" as const : "default" as const },
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
        onAssignOne={handleAssignOne}
        onDone={handleAssignDone}
        ticketIds={selected}
        ticketSummaries={tickets
          .filter((t) => selected.includes(String(t.ticketId)))
          .map((t) => ({ ticketId: String(t.ticketId), maTicket: t.maTicket, tieuDe: t.tieuDe }))}
        staffOptions={staffSelectOptions}
      />
    </div>
  );
}
