"use client";

import { useEffect, useRef, useState } from "react";
import { PencilSquareIcon, TrashIcon, ArrowPathIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import type { MembershipTier } from "@/src/types/loyalty.types";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef } from "@/src/components/admin/DataTable";
import { Toggle } from "@/src/components/ui/Toggle";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { useToast } from "@/src/components/ui/Toast";
import {
  getMembershipTiersAdmin,
  updateMembershipTier,
  deleteMembershipTier,
} from "@/src/services/loyalty.service";
import { MembershipTierFormModal } from "./MembershipTierFormModal";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onTotalChange?: (count: number) => void;
  showAddForm?: boolean;
  onAddFormClose?: () => void;
  onAddFormSaved?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MembershipTiersTable({ onTotalChange, showAddForm, onAddFormClose, onAddFormSaved }: Props) {
  const { showToast } = useToast();

  const [items, setItems]           = useState<MembershipTier[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [search, setSearch]         = useState("");

  const [editingTier, setEditingTier]   = useState<MembershipTier | undefined>(undefined);
  const [showForm, setShowForm]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const fetchTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSearchRef     = useRef("");
  const nonPageChangedRef = useRef(true);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const isSearchChange = search !== prevSearchRef.current;
    prevSearchRef.current = search;
    const isNonPageChange = nonPageChangedRef.current;
    nonPageChangedRef.current = false;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(async () => {
      if (isNonPageChange) setLoading(true);
      try {
        const result = await getMembershipTiersAdmin(page, pageSize, search || undefined);
        setItems(result.data);
        setServerTotal(result.total);
        onTotalChange?.(result.total);
      } catch { /* keep existing */ }
      finally { setLoading(false); }
    }, isSearchChange ? 300 : 0);

    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
  }, [page, pageSize, search]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePageSizeChange = (size: number) => {
    nonPageChangedRef.current = true; setPageSize(size); setPage(1);
  };
  const handleSearchChange = (val: string) => {
    nonPageChangedRef.current = true; setSearch(val); setPage(1);
  };

  async function handleToggleActive(id: number, isActive: boolean) {
    const snapshot = items;
    setItems(items.map((t) => (t.id === id ? { ...t, isActive } : t)));
    try {
      await updateMembershipTier(id, { isActive });
    } catch {
      setItems(snapshot);
      showToast("Không thể cập nhật trạng thái.", "error");
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteMembershipTier(deleteTarget.id);
      showToast("Đã xóa bậc thứ hạng.", "success");
      nonPageChangedRef.current = true;
      const result = await getMembershipTiersAdmin(page, pageSize, search || undefined);
      setItems(result.data);
      setServerTotal(result.total);
      onTotalChange?.(result.total);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể xóa.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleSaved() {
    setShowForm(false);
    setEditingTier(undefined);
    nonPageChangedRef.current = true;
    getMembershipTiersAdmin(page, pageSize, search || undefined).then((result) => {
      setItems(result.data);
      setServerTotal(result.total);
      onTotalChange?.(result.total);
    }).catch(() => {});
  }

  // ── Columns ───────────────────────────────────────────────────────────────
  type Row = MembershipTier & Record<string, unknown>;

  const columns: ColumnDef<Row>[] = [
    {
      key: "displayName",
      header: "Tên bậc",
      width: "w-[22%]",
      render: (v, row) => {
        const inner = (
          <div>
            <p className="text-sm font-semibold text-secondary-900">{v as string}</p>
            {row.description && (
              <p className="text-[11px] text-secondary-400 truncate mt-0.5 max-w-[160px]">
                {row.description as string}
              </p>
            )}
          </div>
        );
        return (
          <div className="flex items-center gap-2">
            {row.color && (
              <span
                className="inline-block h-4 w-4 rounded-full border border-secondary-200 shrink-0"
                style={{ backgroundColor: row.color as string }}
              />
            )}
            {row.description ? (
              <Tooltip
                content={
                  <div className="space-y-1">
                    <p className="font-semibold leading-snug">{v as string}</p>
                    <p className="text-[11px] text-secondary-300 leading-relaxed">
                      {row.description as string}
                    </p>
                  </div>
                }
                placement="top"
                multiline
                maxWidth="280px"
              >
                {inner}
              </Tooltip>
            ) : inner}
          </div>
        );
      },
    },
    {
      key: "minPoints",
      header: "Điểm tối thiểu",
      width: "w-[14%]",
      align: "center",
      render: (v) => (
        <span className="text-sm font-semibold text-secondary-700">
          {(v as number).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "maxPoints",
      header: "Điểm tối đa",
      width: "w-[14%]",
      align: "center",
      render: (v) =>
        v == null ? (
          <span className="text-sm font-bold text-primary-600">∞</span>
        ) : (
          <span className="text-sm font-semibold text-secondary-700">
            {(v as number).toLocaleString("vi-VN")}
          </span>
        ),
    },
    {
      key: "color",
      header: "Màu / Icon",
      width: "w-[12%]",
      align: "center",
      render: (v) =>
        v ? (
          <div className="flex flex-col items-center gap-1">
            <span
              className="inline-block h-6 w-6 rounded-full border border-secondary-300"
              style={{ backgroundColor: v as string }}
            />
            <span className="text-[10px] text-secondary-400">{v as string}</span>
          </div>
        ) : (
          <span className="text-secondary-300 text-sm">—</span>
        ),
    },
    {
      key: "customerCount",
      header: "Số khách hàng",
      width: "w-[14%]",
      align: "center",
      render: (v) => (
        <span className="inline-flex items-center justify-center rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-semibold text-secondary-700">
          {(v as number).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Kích hoạt",
      width: "w-[8%]",
      align: "left",
      render: (v, row) => (
        <Toggle
          checked={v as boolean}
          onChange={(e) => handleToggleActive(row.id as number, e.target.checked)}
          size="sm"
        />
      ),
    },
    {
      key: "id",
      header: "Thao tác",
      width: "w-[8%]",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip content="Chỉnh sửa">
            <button
              type="button"
              className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
              onClick={() => { setEditingTier(row as unknown as MembershipTier); setShowForm(true); }}
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Xoá">
            <button
              type="button"
              className="rounded p-1 text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
              onClick={() => setDeleteTarget({ id: row.id as number, name: row.displayName as string })}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Inline guide */}
      <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-4 text-sm text-secondary-700">
        <div className="flex gap-2">
          <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-500" />
          <div className="space-y-1">
            <p className="font-semibold text-secondary-800">Cách hoạt động của bậc thứ hạng</p>
            <ul className="list-disc space-y-0.5 pl-4">
              <li>Mỗi khách hàng tích lũy điểm qua các đơn hàng.</li>
              <li>Hệ thống tự động xếp hạng dựa trên <strong>tổng điểm tích lũy</strong>.</li>
              <li>Khoảng điểm của các bậc <strong>không được chồng lấp nhau</strong> — ví dụ: nếu bậc Bạc là 1000–2999, bậc Vàng phải bắt đầu từ 3000 trở lên.</li>
              <li>Chỉ <strong>một bậc</strong> được phép có điểm tối đa "Không giới hạn" (thường là bậc cao nhất).</li>
              <li>Sau khi lưu, hệ thống tự động cập nhật lại rank cho toàn bộ khách hàng.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        )}
        <DataTable
          data={items as Row[]}
          columns={columns}
          keyField="id"
          page={page}
          pageSize={pageSize}
          totalRows={serverTotal}
          pageSizeOptions={[10, 25, 50]}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          searchQuery={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm theo tên bậc…"
          tableLayout="fixed"
          emptyMessage="Chưa có bậc thứ hạng nào."
        />
      </div>

      {/* Edit form (internal) */}
      {showForm && (
        <MembershipTierFormModal
          tier={editingTier}
          onClose={() => { setShowForm(false); setEditingTier(undefined); }}
          onSaved={handleSaved}
        />
      )}

      {/* Add form (controlled by parent) */}
      {showAddForm && !showForm && (
        <MembershipTierFormModal
          onClose={() => onAddFormClose?.()}
          onSaved={() => {
            onAddFormSaved?.();
            nonPageChangedRef.current = true;
            getMembershipTiersAdmin(page, pageSize, search || undefined).then((result) => {
              setItems(result.data);
              setServerTotal(result.total);
              onTotalChange?.(result.total);
            }).catch(() => {});
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xoá bậc thứ hạng"
        description={`Bạn có chắc muốn xoá bậc "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
        variant="danger"
      />
    </>
  );
}
