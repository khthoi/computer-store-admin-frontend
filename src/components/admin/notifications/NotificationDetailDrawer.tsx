"use client";

import Link from "next/link";
import { ArrowTopRightOnSquareIcon, CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Drawer } from "@/src/components/ui/Drawer";
import { Alert } from "@/src/components/ui/Alert";
import { NotificationStatusBadge } from "@/src/components/admin/notifications/NotificationStatusBadge";
import { NotificationChannelBadge } from "@/src/components/admin/notifications/NotificationChannelBadge";
import type { ThongBaoRow } from "@/src/types/notification.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

/** Map entity type → readable label + URL builder */
const ENTITY_CONFIG: Record<string, { label: string; href: (id: number) => string }> = {
  DonHang:   { label: "Đơn hàng",   href: (id) => `/orders/${id}` },
  GiaoDich:  { label: "Giao dịch",  href: (id) => `/orders/transactions` },
  HoanHang:  { label: "Hoàn trả",   href: (id) => `/orders/returns` },
  KhuyenMai: { label: "Khuyến mãi", href: (id) => `/promotions/${id}` },
};

const LOAI_LABEL: Record<string, string> = {
  DonHang:   "Đơn hàng",
  GiaoDich:  "Giao dịch",
  HoanHang:  "Hoàn trả",
  KhuyenMai: "Khuyến mãi",
  Loyalty:   "Loyalty",
  NhacNho:   "Nhắc nhở",
  HeThong:   "Hệ thống",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-secondary-400">
        {label}
      </span>
      <span className="text-sm text-secondary-800">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-secondary-100" aria-hidden />;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationDetailDrawerProps {
  notification: ThongBaoRow | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationDetailDrawer({
  notification: n,
  onClose,
}: NotificationDetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const entityCfg = n?.entityLienQuan ? ENTITY_CONFIG[n.entityLienQuan] : null;

  return (
    <Drawer
      isOpen={n !== null}
      onClose={onClose}
      position="right"
      size="lg"
      title={n ? `Thông báo #${n.thongBaoId}` : ""}
      footer={
        n ? (
          <Link
            href={`/customers/${n.khachHangId}`}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
            Xem trang khách hàng
          </Link>
        ) : null
      }
    >
      {n && (
        <div className="space-y-3">
          {/* Status header */}
          <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <NotificationChannelBadge channel={n.kenhGui} />
                <NotificationStatusBadge status={n.trangThai} />
                {n.kenhGui === "Push" && (
                  <span className={[
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                    n.daDoc
                      ? "bg-secondary-100 text-secondary-500"
                      : "bg-warning-100 text-warning-600",
                  ].join(" ")}>
                    {n.daDoc ? "Đã đọc" : "Chưa đọc"}
                  </span>
                )}
              </div>
              <span className="text-xs text-secondary-400">{formatDatetime(n.ngayTao)}</span>
            </div>
          </div>

          {/* Alert ThatBai */}
          {n.trangThai === "ThatBai" && (
            <Alert variant="error" title="Gửi thất bại">
              Thông báo này chưa được gửi đến người dùng. Bạn có thể gửi lại từ danh sách.
            </Alert>
          )}

          {/* Nội dung thông báo */}
          <div className="rounded-xl border border-secondary-100 bg-white px-4 divide-y divide-secondary-100">
            <DetailRow
              label="Tiêu đề"
              value={<span className="font-semibold">{n.tieuDe}</span>}
            />
            <DetailRow
              label="Nội dung"
              value={
                <p className="whitespace-pre-line text-sm leading-relaxed text-secondary-700">
                  {n.noiDung}
                </p>
              }
            />
          </div>

          {/* Thông tin gửi */}
          <div className="rounded-xl border border-secondary-100 bg-white px-4 divide-y divide-secondary-100">
            <DetailRow label="Khách hàng" value={
              <div className="flex flex-col">
                <Link
                  href={`/customers/${n.khachHangId}`}
                  className="font-semibold text-primary-600 hover:underline"
                  onClick={onClose}
                >
                  {n.tenKhachHang}
                </Link>
                <span className="text-xs text-secondary-400">{n.emailKhachHang}</span>
              </div>
            } />
            <Divider />
            <DetailRow label="Loại thông báo" value={LOAI_LABEL[n.loaiThongBao] ?? n.loaiThongBao} />
            <DetailRow label="Kênh gửi" value={<NotificationChannelBadge channel={n.kenhGui} />} />
            <Divider />
            <DetailRow label="Ngày tạo" value={formatDatetime(n.ngayTao)} />

            {/* Liên kết thực thể */}
            {entityCfg && n.entityLienQuanId && (
              <>
                <Divider />
                <DetailRow
                  label={`Liên kết — ${entityCfg.label}`}
                  value={
                    <Link
                      href={entityCfg.href(n.entityLienQuanId)}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                    >
                      #{n.entityLienQuanId}
                      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  }
                />
              </>
            )}
          </div>

          {/* ID kỹ thuật */}
          <div className="flex items-center justify-between rounded-xl border border-secondary-100 bg-secondary-50/50 px-4 py-3 text-xs text-secondary-400">
            <span>
              <span className="font-medium">thong_bao_id:</span>{" "}
              <span className="font-mono">{n.thongBaoId}</span>
              {" · "}
              <span className="font-medium">khach_hang_id:</span>{" "}
              <span className="font-mono">{n.khachHangId}</span>
            </span>
            <button
              type="button"
              aria-label="Sao chép ID"
              onClick={() => handleCopy(`${n.thongBaoId}`)}
              className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {copied
                ? <CheckIcon className="h-3.5 w-3.5 text-success-600" aria-hidden />
                : <ClipboardDocumentIcon className="h-3.5 w-3.5" aria-hidden />
              }
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
