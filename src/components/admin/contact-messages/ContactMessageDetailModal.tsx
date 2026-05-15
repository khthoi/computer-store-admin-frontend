"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";
import type {
  ContactMessageDetail,
  ContactMessageStatus,
} from "@/src/types/contact-message.types";

const STATUS_OPTIONS = [
  { value: "moi", label: "Mới" },
  { value: "da_xu_ly", label: "Đã xử lý" },
];

const SUBJECT_LABELS: Record<string, string> = {
  "tu-van-san-pham": "Tư vấn sản phẩm",
  "don-hang": "Hỏi về đơn hàng",
  "bao-hanh": "Bảo hành / sửa chữa",
  "doi-tra": "Đổi trả hàng",
  "hop-tac": "Hợp tác kinh doanh",
  khac: "Khác",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  item: ContactMessageDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onSave: (
    id: number,
    payload: { status: ContactMessageStatus; adminNote: string },
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function ContactMessageDetailModal({
  item,
  isLoading,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [status, setStatus] = useState<ContactMessageStatus>("moi");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setStatus(item.status);
      setNote(item.adminNote ?? "");
    }
  }, [item]);

  const isOpen = item !== null || isLoading;

  async function handleSubmit() {
    if (!item) return;
    setSaving(true);
    try {
      await onSave(item.id, { status, adminNote: note });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết liên hệ"
      size="2xl"
      footer={
        item ? (
          <div className="flex items-center justify-between gap-2">
            <Button variant="danger" onClick={() => onDelete(item.id)}>
              Xoá
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose}>
                Đóng
              </Button>
              <Button variant="primary" onClick={handleSubmit} isLoading={saving}>
                Lưu thay đổi
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {!item ? (
        <div className="py-10 text-center text-sm text-secondary-500">Đang tải...</div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-secondary-500 mb-0.5">Họ và tên</p>
              <p className="font-medium text-secondary-900">{item.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-500 mb-0.5">Email</p>
              <p className="font-medium text-secondary-900">{item.email}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-500 mb-0.5">Số điện thoại</p>
              <p className="text-secondary-700">{item.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-500 mb-0.5">Chủ đề</p>
              <p className="text-secondary-700">
                {SUBJECT_LABELS[item.subject] ?? item.subject}
              </p>
            </div>
            <div>
              <p className="text-xs text-secondary-500 mb-0.5">Ngày gửi</p>
              <p className="text-secondary-700">{formatDate(item.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-500 mb-0.5">Ngày xử lý</p>
              <p className="text-secondary-700">{formatDate(item.resolvedAt)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-secondary-500 mb-0.5">Địa chỉ IP</p>
              <p className="text-secondary-700 font-mono text-xs">
                {item.ipAddress ?? "—"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-secondary-500 mb-1">Nội dung</p>
            <div className="rounded border border-secondary-200 bg-secondary-50 p-3 text-sm text-secondary-800 whitespace-pre-wrap">
              {item.message}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Trạng thái"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(v) => setStatus(v as ContactMessageStatus)}
            />
          </div>

          <Textarea
            label="Ghi chú nội bộ"
            placeholder="Ghi chú về cách xử lý, người liên hệ lại..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoResize
          />
        </div>
      )}
    </Modal>
  );
}
