"use client";

import { useRef, type KeyboardEvent } from "react";
import Link from "next/link";
import { UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import type {
  TicketStatus,
  TicketPriority,
  StaffOption,
} from "@/src/types/ticket.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketMeta {
  trangThai:               TicketStatus;
  mucDoUuTien:             TicketPriority;
  nhanVienPhuTrachId?:     string;
  nhanVienPhuTrachTen?:    string;
  khachHangTen:            string;
  khachHangEmail:          string;
  donHangId?:              string;
  ngayTao:                 string;
  ngayCapNhat:             string;
  tags:                    string[];
}

interface TicketMetaPanelProps {
  meta:          TicketMeta;
  onMetaChange:  (field: string, value: string | string[] | null) => void;
  staffOptions?: StaffOption[];
  isReadonly?:   boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "Moi",         label: "Mới"            },
  { value: "DangXuLy",    label: "Đang xử lý"    },
  { value: "ChoKhach",    label: "Chờ khách"      },
  { value: "DaGiaiQuyet", label: "Đã giải quyết"  },
  { value: "Dong",        label: "Đóng"           },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "Thap",      label: "Thấp"       },
  { value: "TrungBinh", label: "Trung bình" },
  { value: "Cao",       label: "Cao"        },
  { value: "KhanCap",   label: "Khẩn cấp"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function Divider() {
  return <div className="border-t border-secondary-100 my-3" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TicketMetaPanel — sidebar card with ticket metadata, assignment,
 * customer info, and tags. Uses real TicketStatus / TicketPriority enums.
 */
export function TicketMetaPanel({
  meta,
  onMetaChange,
  staffOptions = [],
  isReadonly = false,
}: TicketMetaPanelProps) {
  const tagInputRef = useRef<HTMLInputElement>(null);

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const raw = tagInputRef.current?.value.trim();
      if (!raw) return;
      const newTag = raw.toLowerCase();
      if (!meta.tags.includes(newTag)) {
        onMetaChange("tags", [...meta.tags, newTag]);
      }
      if (tagInputRef.current) tagInputRef.current.value = "";
    }
  }

  function removeTag(tag: string) {
    onMetaChange("tags", meta.tags.filter((t) => t !== tag));
  }

  const staffSelectOptions = staffOptions.map((s) => ({
    value: s.value,
    label: s.openTicketCount !== undefined
      ? `${s.label} (${s.openTicketCount} mở)`
      : s.label,
  }));

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-4 max-h-[70vh] overflow-y-auto">
      <p className="text-sm font-semibold text-secondary-800 border-b border-secondary-100 pb-3 mb-3">
        Thông tin phiếu hỗ trợ
      </p>

      {/* Status + Priority + Assignment */}
      <div className="space-y-3">
        <Select
          label="Trạng thái"
          options={STATUS_OPTIONS}
          value={meta.trangThai}
          onChange={(v) => onMetaChange("trangThai", v as string)}
          size="sm"
          disabled={isReadonly}
        />

        <Select
          label="Ưu tiên"
          options={PRIORITY_OPTIONS}
          value={meta.mucDoUuTien}
          onChange={(v) => onMetaChange("mucDoUuTien", v as string)}
          size="sm"
          disabled={isReadonly}
        />

        <Select
          label="Phụ trách"
          placeholder="Chưa phân công"
          options={staffSelectOptions}
          value={meta.nhanVienPhuTrachId ?? ""}
          onChange={(v) =>
            onMetaChange("nhanVienPhuTrachId", (v as string) || null)
          }
          searchable
          clearable
          size="sm"
          disabled={isReadonly}
        />
      </div>

      <Divider />

      {/* Customer info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <UserCircleIcon className="w-4 h-4 text-secondary-400 shrink-0" aria-hidden="true" />
          <span className="font-medium text-sm text-secondary-800">
            {meta.khachHangTen}
          </span>
        </div>
        <p className="text-xs text-secondary-400 pl-6">{meta.khachHangEmail}</p>
        {meta.donHangId && (
          <div className="pl-6">
            <Link
              href={`/admin/orders/${meta.donHangId}`}
              className="text-xs text-primary-600 hover:underline"
            >
              Đơn hàng #{meta.donHangId}
            </Link>
          </div>
        )}
      </div>

      <Divider />

      {/* Timestamps */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-secondary-400 shrink-0">Tạo lúc</span>
          <span className="text-xs text-secondary-600 text-right">{formatDate(meta.ngayTao)}</span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-secondary-400 shrink-0">Cập nhật</span>
          <span className="text-xs text-secondary-600 text-right">{formatDate(meta.ngayCapNhat)}</span>
        </div>
      </div>

      <Divider />

      {/* Tags */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-secondary-600">Nhãn</p>

        {meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700 text-xs font-medium"
              >
                {tag}
                {!isReadonly && (
                  <button
                    type="button"
                    aria-label={`Xóa nhãn ${tag}`}
                    onClick={() => removeTag(tag)}
                    className="rounded-full hover:bg-secondary-200 p-0.5 transition-colors"
                  >
                    <XMarkIcon className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {!isReadonly && (
          <input
            ref={tagInputRef}
            type="text"
            placeholder="Thêm nhãn (Enter)..."
            onKeyDown={handleTagKeyDown}
            className="w-full h-8 px-2.5 text-xs rounded-lg border border-secondary-200 bg-white text-secondary-700 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:border-primary-400 focus:ring-primary-500/15"
          />
        )}
      </div>
    </div>
  );
}
