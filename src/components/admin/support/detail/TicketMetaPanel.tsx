"use client";

import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Select } from "@/src/components/ui/Select";
import { Button } from "@/src/components/ui/Button";
import { TicketStatusBadge } from "../badges/TicketStatusBadge";
import type {
  MessageSenderType,
  TicketStatus,
  TicketPriority,
  StaffOption,
} from "@/src/types/ticket.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketMeta {
  trangThai:               TicketStatus;
  lastSenderType?:         MessageSenderType;
  mucDoUuTien:             TicketPriority;
  nhanVienPhuTrachId?:     string;
  nhanVienPhuTrachTen?:    string;
  nhanVienPhuTrachMa?:     string;
  khachHangId:             number;
  khachHangTen:            string;
  khachHangEmail:          string;
  donHangId?:              string;
  donHangMa?:              string;
  ngayTao:                 string;
  ngayCapNhat:             string;
}

interface TicketMetaPanelProps {
  meta:          TicketMeta;
  onMetaChange:  (field: string, value: string | null) => void;
  staffOptions?: StaffOption[];
  isReadonly?:   boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

export function TicketMetaPanel({
  meta,
  onMetaChange,
  staffOptions = [],
  isReadonly = false,
}: TicketMetaPanelProps) {
  const staffSelectOptions = staffOptions.map((s) => ({
    value:       s.value,
    label:       s.label,
    subLabel:    s.email,
    description: s.phone,
    badge:       { text: `${s.openTicketCount} mở`, variant: s.openTicketCount > 0 ? "warning" as const : "default" as const },
  }));

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-4 max-h-[70vh] overflow-y-auto">
      <p className="text-sm font-semibold text-secondary-800 border-b border-secondary-100 pb-3 mb-3">
        Thông tin phiếu hỗ trợ
      </p>

      {/* Status + Priority + Assignment */}
      <div className="space-y-3">
        {/* Status */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-secondary-600">Trạng thái</p>
          <TicketStatusBadge status={meta.trangThai} lastSenderType={meta.lastSenderType} size="sm" />
          {!isReadonly && meta.trangThai !== "DaDong" && (
            <div className="flex gap-2 flex-wrap">
              {meta.trangThai !== "DaGiaiQuyet" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onMetaChange("trangThai", "DaGiaiQuyet")}
                >
                  Đánh dấu giải quyết
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMetaChange("trangThai", "DaDong")}
              >
                Đóng phiếu
              </Button>
            </div>
          )}
          {!isReadonly && meta.trangThai === "DaGiaiQuyet" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMetaChange("trangThai", "DaDong")}
            >
              Đóng phiếu
            </Button>
          )}
        </div>

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
          boldLabel
          size="sm"
          disabled={isReadonly}
        />
      </div>

      <Divider />

      {/* Customer info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <UserCircleIcon className="w-4 h-4 text-secondary-400 shrink-0" aria-hidden="true" />
          <Link
            href={`/customers/${meta.khachHangId}`}
            className="font-medium text-sm text-primary-700 hover:underline"
          >
            {meta.khachHangTen}
          </Link>
        </div>
        <p className="text-xs text-secondary-400 pl-6">{meta.khachHangEmail}</p>
        {meta.nhanVienPhuTrachMa && meta.nhanVienPhuTrachTen && (
          <div className="flex items-center gap-1 pl-6">
            <span className="text-xs text-secondary-400">Phụ trách:</span>
            <Link
              href={`/employees/${meta.nhanVienPhuTrachMa}`}
              className="text-xs text-primary-600 hover:underline"
            >
              {meta.nhanVienPhuTrachTen}
            </Link>
          </div>
        )}
        {meta.donHangId && (
          <div className="pl-6">
            <Link
              href={`/orders/${meta.donHangId}`}
              className="text-xs text-primary-600 hover:underline"
            >
              Đơn hàng #{meta.donHangMa ?? meta.donHangId}
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
    </div>
  );
}
