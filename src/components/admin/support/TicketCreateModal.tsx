"use client";

import { useState } from "react";
import { Modal }     from "@/src/components/ui/Modal";
import { Button }    from "@/src/components/ui/Button";
import { Input }     from "@/src/components/ui/Input";
import { Textarea }  from "@/src/components/ui/Textarea";
import { Select }    from "@/src/components/ui/Select";
import type { SelectOption } from "@/src/components/ui/Select";
import type {
  CreateTicketPayload,
  TicketIssueType,
  TicketPriority,
  TicketChannel,
} from "@/src/types/ticket.types";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const CUSTOMER_OPTIONS: SelectOption[] = [
  { value: "1", label: "Lê Văn Hùng",        description: "lehung@gmail.com"    },
  { value: "2", label: "Nguyễn Thị Mai",     description: "ntmai@outlook.com"   },
  { value: "3", label: "Phạm Quốc Bảo",     description: "pqbao@yahoo.com"     },
  { value: "4", label: "Trần Thị Kim Oanh",  description: "tkoanh@gmail.com"    },
  { value: "5", label: "Đỗ Minh Tú",         description: "dominhtu@gmail.com"  },
  { value: "6", label: "Vũ Thị Thu",         description: "vuthu@company.vn"    },
  { value: "7", label: "Hoàng Văn Long",     description: "hvlong@hotmail.com"  },
  { value: "8", label: "Bùi Thị Ngọc",       description: "btngoc@gmail.com"    },
];

const ORDER_OPTIONS: SelectOption[] = [
  { value: "101", label: "DH-2025-0101", description: "2.450.000 ₫ — 03/01/2025" },
  { value: "102", label: "DH-2025-0102", description: "890.000 ₫ — 07/01/2025"   },
  { value: "103", label: "DH-2025-0103", description: "5.100.000 ₫ — 10/01/2025" },
  { value: "104", label: "DH-2025-0104", description: "340.000 ₫ — 15/01/2025"   },
  { value: "105", label: "DH-2025-0105", description: "1.230.000 ₫ — 18/01/2025" },
];

// ─── Dropdown options ──────────────────────────────────────────────────────────

const ISSUE_OPTIONS: { value: TicketIssueType; label: string }[] = [
  { value: "HoiTin",       label: "Hỏi thông tin"    },
  { value: "KhieuNai",     label: "Khiếu nại"        },
  { value: "YeuCauDoiTra", label: "Yêu cầu đổi/trả"  },
  { value: "LoiKyThuat",   label: "Lỗi kỹ thuật"     },
  { value: "Khac",         label: "Khác"              },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "Thap",      label: "Thấp"       },
  { value: "TrungBinh", label: "Trung bình" },
  { value: "Cao",       label: "Cao"        },
  { value: "KhanCap",   label: "Khẩn cấp"  },
];

const CHANNEL_OPTIONS: { value: TicketChannel; label: string }[] = [
  { value: "Chat",      label: "Chat"        },
  { value: "Email",     label: "Email"       },
  { value: "DienThoai", label: "Điện thoại"  },
  { value: "Form",      label: "Form"        },
];

const MO_TA_MAX = 300;

// ─── Form state ────────────────────────────────────────────────────────────────

interface FormState {
  khachHangId: string;
  donHangId:   string;
  loaiVanDe:   string;
  mucDoUuTien: string;
  tieuDe:      string;
  moTa:        string;
  kenhLienHe:  string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
  const errs: FormErrors = {};
  if (!form.khachHangId)   errs.khachHangId = "Vui lòng chọn khách hàng";
  if (!form.loaiVanDe)     errs.loaiVanDe   = "Vui lòng chọn loại vấn đề";
  if (!form.mucDoUuTien)   errs.mucDoUuTien = "Vui lòng chọn mức độ ưu tiên";
  if (!form.tieuDe.trim()) errs.tieuDe      = "Vui lòng nhập tiêu đề";
  if (!form.moTa.trim())   errs.moTa        = "Vui lòng mô tả vấn đề";
  if (form.moTa.length > MO_TA_MAX) errs.moTa = `Mô tả không được vượt quá ${MO_TA_MAX} ký tự`;
  if (!form.kenhLienHe)    errs.kenhLienHe  = "Vui lòng chọn kênh liên hệ";
  return errs;
}

const EMPTY: FormState = {
  khachHangId: "",
  donHangId:   "",
  loaiVanDe:   "",
  mucDoUuTien: "TrungBinh",
  tieuDe:      "",
  moTa:        "",
  kenhLienHe:  "Form",
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TicketCreateModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSubmit:  (payload: CreateTicketPayload) => Promise<void>;
  isSaving?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * TicketCreateModal — form modal to manually create a new support ticket.
 */
export function TicketCreateModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving = false,
}: TicketCreateModalProps) {
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleClose() {
    setForm(EMPTY);
    setErrors({});
    onClose();
  }

  async function handleSubmit() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    await onSubmit({
      khachHangId: Number(form.khachHangId),
      donHangId:   form.donHangId ? Number(form.donHangId) : undefined,
      loaiVanDe:   form.loaiVanDe   as TicketIssueType,
      mucDoUuTien: form.mucDoUuTien as TicketPriority,
      tieuDe:      form.tieuDe,
      moTa:        form.moTa,
      kenhLienHe:  form.kenhLienHe  as TicketChannel,
    });
    handleClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo phiếu hỗ trợ mới"
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSaving}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSaving}
            disabled={isSaving}
          >
            Tạo phiếu
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Khách hàng */}
        <Select
          label="Khách hàng"
          required
          placeholder="Tìm khách hàng..."
          options={CUSTOMER_OPTIONS}
          value={form.khachHangId}
          onChange={(v) => set("khachHangId", v as string)}
          searchable
          clearable
          errorMessage={errors.khachHangId}
          disabled={isSaving}
        />

        {/* Đơn hàng liên quan */}
        <Select
          label="Đơn hàng liên quan (tuỳ chọn)"
          placeholder="Tìm theo mã đơn hàng..."
          options={ORDER_OPTIONS}
          value={form.donHangId}
          onChange={(v) => set("donHangId", v as string)}
          searchable
          clearable
          disabled={isSaving}
        />

        {/* Loại vấn đề + Mức độ ưu tiên */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Loại vấn đề"
            required
            placeholder="Chọn loại..."
            options={ISSUE_OPTIONS}
            value={form.loaiVanDe}
            onChange={(v) => set("loaiVanDe", v as string)}
            errorMessage={errors.loaiVanDe}
            disabled={isSaving}
          />
          <Select
            label="Mức độ ưu tiên"
            required
            options={PRIORITY_OPTIONS}
            value={form.mucDoUuTien}
            onChange={(v) => set("mucDoUuTien", v as string)}
            errorMessage={errors.mucDoUuTien}
            disabled={isSaving}
          />
        </div>

        {/* Kênh liên hệ */}
        <Select
          label="Kênh liên hệ"
          required
          options={CHANNEL_OPTIONS}
          value={form.kenhLienHe}
          onChange={(v) => set("kenhLienHe", v as string)}
          errorMessage={errors.kenhLienHe}
          disabled={isSaving}
        />

        {/* Tiêu đề */}
        <Input
          label="Tiêu đề"
          required
          placeholder="Mô tả ngắn vấn đề..."
          value={form.tieuDe}
          onChange={(e) => set("tieuDe", e.target.value)}
          errorMessage={errors.tieuDe}
          disabled={isSaving}
        />

        {/* Mô tả chi tiết */}
        <Textarea
          label="Mô tả chi tiết"
          required
          placeholder="Mô tả đầy đủ vấn đề của khách hàng..."
          rows={4}
          value={form.moTa}
          onChange={(e) => set("moTa", e.target.value)}
          errorMessage={errors.moTa}
          disabled={isSaving}
          maxCharCount={MO_TA_MAX}
          showCharCount
        />
      </div>
    </Modal>
  );
}
