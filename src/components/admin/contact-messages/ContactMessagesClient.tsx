"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef } from "@/src/components/admin/DataTable";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { Select } from "@/src/components/ui/Select";
import {
  deleteContactMessage,
  getContactMessage,
  getContactMessages,
  getContactMessageStats,
  updateContactMessage,
} from "@/src/services/contact-message.service";
import type {
  ContactMessageDetail,
  ContactMessageStats,
  ContactMessageStatus,
  ContactMessageSummary,
} from "@/src/types/contact-message.types";
import { ContactMessageDetailModal } from "./ContactMessageDetailModal";

const SUBJECT_LABELS: Record<string, string> = {
  "tu-van-san-pham": "Tư vấn sản phẩm",
  "don-hang": "Hỏi về đơn hàng",
  "bao-hanh": "Bảo hành / sửa chữa",
  "doi-tra": "Đổi trả hàng",
  "hop-tac": "Hợp tác kinh doanh",
  khac: "Khác",
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "moi", label: "Mới" },
  { value: "da_xu_ly", label: "Đã xử lý" },
];

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-secondary-100 shadow-sm px-5 py-4 min-w-[120px]">
      <p className="text-xs text-secondary-500 mb-1">{label}</p>
      <p className="text-2xl font-bold tracking-tight text-secondary-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ContactMessageStatus }) {
  if (status === "moi") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
        Mới
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">
      Đã xử lý
    </span>
  );
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

export function ContactMessagesClient() {
  const { showToast } = useToast();

  const [items, setItems] = useState<ContactMessageSummary[]>([]);
  const [stats, setStats] = useState<ContactMessageStats | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ContactMessageStatus>("");

  const [detail, setDetail] = useState<ContactMessageDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [list, statsResult] = await Promise.all([
        getContactMessages({
          page,
          limit: pageSize,
          search: search || undefined,
          status: statusFilter || undefined,
        }),
        getContactMessageStats(),
      ]);
      setItems(list.data);
      setTotal(list.total);
      setStats(statsResult);
    } catch {
      showToast("Không tải được danh sách liên hệ", "error");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function openDetail(id: number) {
    setDetailLoading(true);
    try {
      const data = await getContactMessage(id);
      setDetail(data);
    } catch {
      showToast("Không tải được chi tiết liên hệ", "error");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSave(
    id: number,
    payload: { status: ContactMessageStatus; adminNote: string },
  ) {
    try {
      const updated = await updateContactMessage(id, payload);
      setDetail(updated);
      showToast("Đã cập nhật liên hệ", "success");
      await loadData();
    } catch {
      showToast("Cập nhật thất bại", "error");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Xoá liên hệ này? Hành động không thể hoàn tác.")) return;
    try {
      await deleteContactMessage(id);
      showToast("Đã xoá liên hệ", "success");
      setDetail(null);
      await loadData();
    } catch {
      showToast("Xoá thất bại", "error");
    }
  }

  const columns: ColumnDef<ContactMessageSummary & Record<string, unknown>>[] = [
    {
      key: "fullName",
      header: "Người gửi",
      width: "200px",
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium text-secondary-900">{row.fullName as string}</p>
          <p className="text-xs text-secondary-500">{row.email as string}</p>
          {row.phone ? (
            <p className="text-xs text-secondary-500">{row.phone as string}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "subject",
      header: "Chủ đề",
      width: "180px",
      render: (_, row) => (
        <span className="text-sm text-secondary-700">
          {SUBJECT_LABELS[row.subject as string] ?? (row.subject as string)}
        </span>
      ),
    },
    {
      key: "message",
      header: "Nội dung",
      render: (_, row) => (
        <p className="text-sm text-secondary-600 line-clamp-2 max-w-[420px]">
          {row.message as string}
        </p>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      width: "120px",
      align: "center",
      render: (_, row) => <StatusBadge status={row.status as ContactMessageStatus} />,
    },
    {
      key: "createdAt",
      header: "Ngày gửi",
      width: "150px",
      align: "center",
      render: (_, row) => (
        <span className="text-xs text-secondary-500">
          {formatDate(row.createdAt as string)}
        </span>
      ),
    },
    {
      key: "_actions",
      header: "",
      width: "100px",
      align: "center",
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openDetail(row.id as number)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {stats && (
        <div className="flex flex-wrap gap-4">
          <StatItem label="Tổng liên hệ" value={stats.total} />
          <StatItem label="Chưa xử lý" value={stats.new} />
          <StatItem label="Đã xử lý" value={stats.resolved} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-48">
          <Select
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter((v as ContactMessageStatus | "") ?? "");
              setPage(1);
            }}
            placeholder="Lọc trạng thái"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items as (ContactMessageSummary & Record<string, unknown>)[]}
        keyField="id"
        isLoading={isLoading}
        searchQuery={search}
        onSearchChange={(q) => {
          setSearch(q);
          setPage(1);
        }}
        searchPlaceholder="Tìm theo tên, email, nội dung..."
        page={page}
        pageSize={pageSize}
        totalRows={total}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        emptyMessage="Chưa có liên hệ nào"
      />

      <ContactMessageDetailModal
        item={detail}
        isLoading={detailLoading}
        onClose={() => setDetail(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
