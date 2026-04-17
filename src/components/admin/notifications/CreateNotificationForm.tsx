"use client";

import { useState } from "react";
import {
  UsersIcon,
  UserGroupIcon,
  UserIcon,
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PaperAirplaneIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { createNotification } from "@/src/services/notification.service";
import { useToast } from "@/src/components/ui/Toast";
import { DateInput } from "@/src/components/ui/DateInput";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Radio, RadioGroup } from "@/src/components/ui/Radio";
import type { SelectOption } from "@/src/components/ui/Select";
import type {
  TargetType,
  NotificationChannel,
  NotificationLoai,
  CreateNotificationPayload,
} from "@/src/types/notification.types";

// ─── Mock data for selects ────────────────────────────────────────────────────

const MOCK_CUSTOMERS: SelectOption[] = [
  { value: "101", label: "Nguyễn Quốc Bảo",      description: "ID: 101 · bao.nguyen@gmail.com" },
  { value: "102", label: "Trần Văn Khoa",          description: "ID: 102 · khoa.tran@techsv.vn" },
  { value: "103", label: "Lê Thị Phương Anh",      description: "ID: 103 · anh.le@outlook.com" },
  { value: "104", label: "Phạm Đức Minh",           description: "ID: 104 · minh.pham@gamer.vn" },
  { value: "105", label: "Hoàng Thị Bích Ngọc",    description: "ID: 105 · ngoc.hoang@gmail.com" },
  { value: "106", label: "Vũ Văn Thắng",            description: "ID: 106 · thang.vu@gmail.com" },
  { value: "107", label: "Ngô Thanh Tùng",          description: "ID: 107 · tung.ngo@gmail.com" },
  { value: "108", label: "Đinh Thị Cẩm Tú",        description: "ID: 108 · tu.dinh@gmail.com" },
  { value: "109", label: "Bùi Thị Lan",             description: "ID: 109 · lan.bui@gmail.com" },
  { value: "110", label: "Lý Văn Hòa",              description: "ID: 110 · hoa.ly@gmail.com" },
  { value: "111", label: "Đặng Quốc Trung",         description: "ID: 111 · trung.dang@gmail.com" },
  { value: "112", label: "Phùng Thị Mai Anh",       description: "ID: 112 · maianh.phung@gmail.com" },
];

/** Mock entity options keyed by entityLienQuan type */
const MOCK_ENTITIES: Record<string, SelectOption[]> = {
  DonHang: [
    { value: "1",  label: "ORD-2024-0001", description: "ID: 1 · 25.990.000 ₫ · Nguyễn Quốc Bảo" },
    { value: "2",  label: "ORD-2024-0002", description: "ID: 2 · 8.500.000 ₫ · Trần Văn Khoa" },
    { value: "3",  label: "ORD-2024-0003", description: "ID: 3 · 4.200.000 ₫ · Lê Thị Phương Anh" },
    { value: "4",  label: "ORD-2024-0004", description: "ID: 4 · 15.750.000 ₫ · Phạm Đức Minh" },
    { value: "5",  label: "ORD-2024-0005", description: "ID: 5 · 6.300.000 ₫ · Hoàng Thị Bích Ngọc" },
    { value: "6",  label: "ORD-2024-0006", description: "ID: 6 · 5.600.000 ₫ · Vũ Văn Thắng" },
    { value: "10", label: "ORD-2024-0010", description: "ID: 10 · 12.100.000 ₫ · Lý Văn Hòa" },
  ],
  GiaoDich: [
    { value: "1001", label: "VNP20240417143201001", description: "ID: 1001 · 25.990.000 ₫ · VNPAY" },
    { value: "1002", label: "ZALO20240416080012",   description: "ID: 1002 · 8.500.000 ₫ · ZaloPay" },
    { value: "1003", label: "MOMO20240415110023",   description: "ID: 1003 · 4.200.000 ₫ · MoMo" },
    { value: "1004", label: "VNP20240416220110004", description: "ID: 1004 · 15.750.000 ₫ · VNPAY" },
    { value: "1006", label: "ZALO20240415160023",   description: "ID: 1006 · 5.600.000 ₫ · ZaloPay" },
  ],
  HoanHang: [
    { value: "6",  label: "RET-2024-006", description: "ID: 6 · ORD-2024-0006 · Vũ Văn Thắng" },
    { value: "7",  label: "RET-2024-007", description: "ID: 7 · ORD-2024-0007 · Ngô Thanh Tùng" },
  ],
  KhuyenMai: [
    { value: "5",  label: "Flash Sale tháng 4",     description: "ID: 5 · Giảm đến 40% linh kiện PC" },
    { value: "8",  label: "TECH20",                 description: "ID: 8 · Giảm 20% tối đa 500k" },
    { value: "12", label: "LOYAL15",                description: "ID: 12 · Giảm 15% tối đa 1.000.000 ₫" },
  ],
};

// ─── Constants ────────────────────────────────────────────────────────────────

const LOAI_OPTIONS: { value: NotificationLoai; label: string; desc: string }[] = [
  { value: "DonHang",   label: "Đơn hàng",   desc: "Liên quan đến đơn hàng cụ thể" },
  { value: "GiaoDich",  label: "Giao dịch",  desc: "Thanh toán / hoàn tiền" },
  { value: "HoanHang",  label: "Hoàn trả",   desc: "Yêu cầu hoàn trả, đổi hàng" },
  { value: "KhuyenMai", label: "Khuyến mãi", desc: "Flash sale, coupon, deal" },
  { value: "Loyalty",   label: "Loyalty",    desc: "Điểm thưởng, thăng hạng" },
  { value: "NhacNho",   label: "Nhắc nhở",   desc: "Giỏ bỏ quên, sản phẩm có hàng" },
  { value: "HeThong",   label: "Hệ thống",   desc: "Thông báo broadcast từ admin" },
];

const STATUS_SELECT_OPTIONS: SelectOption[] = [
  { value: "active",   label: "Đang hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "banned",   label: "Bị khóa" },
];

const TIER_SELECT_OPTIONS: SelectOption[] = [
  { value: "Bronze",   label: "Bronze",   description: "Hạng đồng — khách mới" },
  { value: "Silver",   label: "Silver",   description: "Hạng bạc" },
  { value: "Gold",     label: "Gold",     description: "Hạng vàng" },
  { value: "Platinum", label: "Platinum", description: "Hạng bạch kim — VIP" },
];

const ENTITY_TYPE_SELECT_OPTIONS: SelectOption[] = [
  { value: "DonHang",   label: "Đơn hàng",   description: "Liên kết tới đơn hàng cụ thể" },
  { value: "GiaoDich",  label: "Giao dịch",  description: "Liên kết tới giao dịch thanh toán" },
  { value: "HoanHang",  label: "Hoàn trả",   description: "Liên kết tới yêu cầu hoàn trả" },
  { value: "KhuyenMai", label: "Khuyến mãi", description: "Liên kết tới chương trình khuyến mãi" },
];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const steps = ["Đối tượng nhận", "Nội dung", "Xem lại & Gửi"];
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, idx) => {
        const step = idx + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done   ? "bg-success-500 text-white" :
                  active ? "bg-primary-600 text-white" :
                           "bg-secondary-100 text-secondary-400",
                ].join(" ")}
              >
                {done ? "✓" : step}
              </div>
              <span className={[
                "mt-1 text-[11px] font-medium whitespace-nowrap",
                active ? "text-primary-600" : done ? "text-success-600" : "text-secondary-400",
              ].join(" ")}>
                {label}
              </span>
            </div>
            {idx < total - 1 && (
              <div className={[
                "mx-3 mb-4 h-px w-12 transition-colors",
                done ? "bg-success-400" : "bg-secondary-200",
              ].join(" ")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-secondary-700">{title}</h3>
      {children}
    </div>
  );
}

// ─── Channel checkbox ─────────────────────────────────────────────────────────

function ChannelCheckbox({
  channel, checked, onChange,
}: {
  channel: NotificationChannel;
  checked: boolean;
  onChange: (ch: NotificationChannel, val: boolean) => void;
}) {
  const ICONS: Record<NotificationChannel, React.ReactNode> = {
    Email: <EnvelopeIcon className="h-4 w-4" />,
    SMS:   <DevicePhoneMobileIcon className="h-4 w-4" />,
    Push:  <BellIcon className="h-4 w-4" />,
  };
  const COLORS: Record<NotificationChannel, string> = {
    Email: "border-primary-300 bg-primary-50 text-primary-600",
    SMS:   "border-violet-300 bg-violet-50 text-violet-600",
    Push:  "border-amber-300 bg-amber-50 text-amber-600",
  };
  return (
    <label className={[
      "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 transition-all select-none",
      checked
        ? COLORS[channel]
        : "border-secondary-200 bg-white text-secondary-500 hover:border-secondary-300",
    ].join(" ")}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(channel, e.target.checked)}
      />
      {ICONS[channel]}
      <span className="text-sm font-medium">{channel}</span>
    </label>
  );
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  // Step 1
  targetType: TargetType;
  groupStatus: string;
  groupTier: string;
  specificCustomerIds: string[];   // selected customer IDs (string values from Select)
  // Step 2
  loaiThongBao: NotificationLoai | "";
  channels: NotificationChannel[];
  tieuDe: string;
  noiDung: string;
  entityType: string;
  entityId: string;
  guiNgay: boolean;
  thoiGianGui: string;
}

const INITIAL: FormState = {
  targetType: "all",
  groupStatus: "", groupTier: "", specificCustomerIds: [],
  loaiThongBao: "", channels: ["Push"],
  tieuDe: "", noiDung: "",
  entityType: "", entityId: "",
  guiNgay: true, thoiGianGui: "",
};

// ─── Preview count (mock) ─────────────────────────────────────────────────────

function estimateCount(form: FormState): number {
  const base =
    form.targetType === "all"      ? 1243 :
    form.targetType === "group"    ? 312  :
    form.specificCustomerIds.length;
  return Math.max(base, 0) * form.channels.length;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateNotificationForm() {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function toggleChannel(ch: NotificationChannel, on: boolean) {
    setForm((prev) => ({
      ...prev,
      channels: on
        ? [...prev.channels, ch]
        : prev.channels.filter((c) => c !== ch),
    }));
  }

  // ── Validation per step ───────────────────────────────────────────────────
  function step1Valid(): boolean {
    if (form.targetType === "specific" && form.specificCustomerIds.length === 0) return false;
    return true;
  }

  function step2Valid(): boolean {
    return (
      !!form.loaiThongBao &&
      form.channels.length > 0 &&
      form.tieuDe.trim().length > 0 &&
      form.noiDung.trim().length > 0 &&
      (form.guiNgay || !!form.thoiGianGui)
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload: CreateNotificationPayload = {
        targetType: form.targetType,
        khachHangIds: form.targetType === "specific"
          ? form.specificCustomerIds.map(Number)
          : undefined,
        groupFilter: form.targetType === "group"
          ? { status: form.groupStatus || undefined, tier: form.groupTier || undefined }
          : undefined,
        loaiThongBao: form.loaiThongBao as NotificationLoai,
        kenhGui: form.channels,
        tieuDe: form.tieuDe,
        noiDung: form.noiDung,
        entityLienQuan: effectiveEntityType || undefined,
        entityLienQuanId: (effectiveEntityType && form.entityId)
          ? parseInt(form.entityId)
          : undefined,
        guiNgay: form.guiNgay,
        thoiGianGui: !form.guiNgay ? form.thoiGianGui : undefined,
      };
      const { created } = await createNotification(payload);
      showToast(`Đã tạo ${created} thông báo vào hàng đợi gửi.`, "success");
      setForm(INITIAL);
      setStep(1);
    } catch {
      showToast("Không thể tạo thông báo. Vui lòng thử lại.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const estimatedCount = estimateCount(form);

  // ── Entity type constraints ───────────────────────────────────────────────
  // DonHang/GiaoDich/HoanHang thuộc về 1 khách cụ thể → chỉ cho phép khi
  // targetType=specific VÀ đúng 1 khách được chọn.
  // KhuyenMai có thể broadcast hợp lệ cho nhiều/tất cả khách.
  const isSingleSpecific =
    form.targetType === "specific" && form.specificCustomerIds.length === 1;

  const allowedEntityTypeOptions = isSingleSpecific
    ? ENTITY_TYPE_SELECT_OPTIONS
    : ENTITY_TYPE_SELECT_OPTIONS.filter((o) => o.value === "KhuyenMai");

  const entityLinkRestricted = !isSingleSpecific;

  // Reset entityType/entityId nếu loại hiện tại không còn được phép
  const effectiveEntityType =
    allowedEntityTypeOptions.some((o) => o.value === form.entityType)
      ? form.entityType
      : "";

  // Entity record options based on selected type
  const entityOptions = effectiveEntityType
    ? (MOCK_ENTITIES[effectiveEntityType] ?? [])
    : [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl space-y-8">
      {/* Step indicator */}
      <StepIndicator current={step} total={3} />

      {/* ── Step 1: Đối tượng nhận ── */}
      {step === 1 && (
        <div className="space-y-6">
          <Section title="Chọn đối tượng nhận">
            <div className="grid grid-cols-3 gap-3">
              {(["all", "group", "specific"] as TargetType[]).map((t) => {
                const cfg = {
                  all:      { icon: <UsersIcon className="h-5 w-5" />,      label: "Tất cả KH",    desc: "Gửi đến toàn bộ khách hàng" },
                  group:    { icon: <UserGroupIcon className="h-5 w-5" />,   label: "Theo nhóm",    desc: "Lọc theo trạng thái, hạng" },
                  specific: { icon: <UserIcon className="h-5 w-5" />,        label: "Khách cụ thể", desc: "Chọn khách hàng từ danh sách" },
                }[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("targetType", t)}
                    className={[
                      "flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all",
                      form.targetType === t
                        ? "border-primary-400 bg-primary-50 text-primary-700"
                        : "border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300",
                    ].join(" ")}
                  >
                    {cfg.icon}
                    <span className="text-sm font-semibold">{cfg.label}</span>
                    <span className="text-[11px] text-secondary-400">{cfg.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Group filter options */}
            {form.targetType === "group" && (
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-secondary-100 bg-secondary-50/60 p-4">
                <Select
                  label="Trạng thái tài khoản"
                  placeholder="— Tất cả —"
                  options={STATUS_SELECT_OPTIONS}
                  value={form.groupStatus}
                  onChange={(v) => set("groupStatus", v as string)}
                  clearable
                  size="sm"
                />
                <Select
                  label="Hạng thành viên"
                  placeholder="— Tất cả hạng —"
                  options={TIER_SELECT_OPTIONS}
                  value={form.groupTier}
                  onChange={(v) => set("groupTier", v as string)}
                  clearable
                  boldLabel
                  size="sm"
                />
              </div>
            )}

            {/* Specific customers — multi select */}
            {form.targetType === "specific" && (
              <div className="space-y-1.5">
                <Select
                  label="Chọn khách hàng *"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  options={MOCK_CUSTOMERS}
                  value={form.specificCustomerIds}
                  onChange={(v) => set("specificCustomerIds", v as string[])}
                  multiple
                  searchable
                  clearable
                  boldLabel
                />
                {form.specificCustomerIds.length > 0 && (
                  <p className="text-[11px] text-secondary-400">
                    Đã chọn {form.specificCustomerIds.length} khách hàng ·{" "}
                    {form.channels.length} kênh → ước tính{" "}
                    <strong className="text-secondary-600">
                      {(form.specificCustomerIds.length * Math.max(form.channels.length, 1)).toLocaleString("vi-VN")}
                    </strong>{" "}
                    thông báo
                  </p>
                )}
              </div>
            )}
          </Section>

          {/* Preview count */}
          <div className="flex items-center gap-2 rounded-xl border border-secondary-100 bg-secondary-50/60 px-4 py-3 text-sm text-secondary-600">
            <InformationCircleIcon className="h-4 w-4 shrink-0 text-secondary-400" />
            Ước tính sẽ tạo{" "}
            <strong className="text-secondary-800">{estimatedCount.toLocaleString("vi-VN")}</strong>{" "}
            thông báo (1 kênh được chọn ở bước 2).
          </div>
        </div>
      )}

      {/* ── Step 2: Nội dung ── */}
      {step === 2 && (
        <div className="space-y-6">
          <Section title="Loại thông báo">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LOAI_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("loaiThongBao", opt.value)}
                  className={[
                    "flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-all",
                    form.loaiThongBao === opt.value
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300",
                  ].join(" ")}
                >
                  <span className="text-xs font-semibold">{opt.label}</span>
                  <span className="text-[11px] text-secondary-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Kênh gửi">
            <div className="flex flex-wrap gap-3">
              {(["Push", "Email", "SMS"] as NotificationChannel[]).map((ch) => (
                <ChannelCheckbox
                  key={ch}
                  channel={ch}
                  checked={form.channels.includes(ch)}
                  onChange={toggleChannel}
                />
              ))}
            </div>
            {form.channels.length > 1 && (
              <p className="flex items-center gap-1.5 text-xs text-secondary-500">
                <InformationCircleIcon className="h-3.5 w-3.5 shrink-0" />
                {form.channels.length} kênh được chọn → mỗi khách hàng sẽ nhận{" "}
                {form.channels.length} thông báo riêng biệt.
              </p>
            )}
          </Section>

          <Section title="Nội dung thông báo">
            <div className="space-y-4">
              <Input
                label="Tiêu đề"
                required
                maxLength={300}
                value={form.tieuDe}
                onChange={(e) => set("tieuDe", e.target.value)}
                placeholder="Tiêu đề thông báo..."
                helperText={`${form.tieuDe.length}/300 ký tự`}
              />
              <Textarea
                label="Nội dung"
                required
                value={form.noiDung}
                onChange={(e) => set("noiDung", e.target.value)}
                placeholder="Nội dung chi tiết của thông báo..."
                rows={4}
                autoResize
                showCharCount
                maxCharCount={1000}
              />
            </div>
          </Section>

          <Section title="Liên kết thực thể (tuỳ chọn)">
            {entityLinkRestricted && (
              <div className="flex items-start gap-1.5 rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-700">
                <InformationCircleIcon className="mt-px h-3.5 w-3.5 shrink-0" />
                <span>
                  Chỉ có thể liên kết Đơn hàng, Giao dịch hoặc Hoàn trả khi gửi đến{" "}
                  <strong>đúng 1 khách hàng cụ thể</strong>. Với đối tượng hiện tại chỉ cho phép liên kết Khuyến mãi.
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Loại thực thể"
                placeholder="— Không liên kết —"
                options={allowedEntityTypeOptions}
                value={effectiveEntityType}
                onChange={(v) => {
                  setForm((prev) => ({
                    ...prev,
                    entityType: v as string,
                    entityId: "",
                  }));
                }}
                clearable
                boldLabel
              />
              <Select
                label="Thực thể liên kết"
                placeholder={effectiveEntityType ? "Tìm kiếm..." : "— Chọn loại trước —"}
                options={entityOptions}
                value={effectiveEntityType === form.entityType ? form.entityId : ""}
                onChange={(v) => set("entityId", v as string)}
                searchable
                clearable
                boldLabel
                disabled={!effectiveEntityType}
              />
            </div>
          </Section>

          <Section title="Thời gian gửi">
            <RadioGroup direction="horizontal">
              <Radio
                name="guiNgay"
                label="Gửi ngay"
                checked={form.guiNgay}
                onChange={() => set("guiNgay", true)}
              />
              <Radio
                name="guiNgay"
                label="Lên lịch"
                checked={!form.guiNgay}
                onChange={() => set("guiNgay", false)}
              />
            </RadioGroup>
            {!form.guiNgay && (
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                <div className="w-64">
                  <DateInput
                    value={form.thoiGianGui}
                    onChange={(v) => set("thoiGianGui", v)}
                    showTime
                    placeholder="Chọn ngày giờ gửi"
                  />
                </div>
              </div>
            )}
          </Section>
        </div>
      )}

      {/* ── Step 3: Xem lại & Gửi ── */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-secondary-700">Xem lại trước khi gửi</h3>

          <div className="rounded-xl border border-secondary-200 bg-white divide-y divide-secondary-100">
            {[
              {
                label: "Đối tượng",
                value:
                  form.targetType === "all"
                    ? "Tất cả khách hàng"
                    : form.targetType === "group"
                    ? [
                        "Theo nhóm",
                        form.groupStatus && `· Trạng thái: ${STATUS_SELECT_OPTIONS.find((o) => o.value === form.groupStatus)?.label}`,
                        form.groupTier   && `· Hạng: ${form.groupTier}`,
                      ].filter(Boolean).join(" ")
                    : `Khách cụ thể (${form.specificCustomerIds.length} KH): ${
                        form.specificCustomerIds
                          .map((id) => MOCK_CUSTOMERS.find((c) => c.value === id)?.label ?? `#${id}`)
                          .join(", ")
                      }`,
              },
              { label: "Loại thông báo", value: LOAI_OPTIONS.find((o) => o.value === form.loaiThongBao)?.label ?? "—" },
              { label: "Kênh gửi", value: form.channels.join(", ") },
              { label: "Tiêu đề", value: form.tieuDe },
              {
                label: "Liên kết",
                value: effectiveEntityType
                  ? `${ENTITY_TYPE_SELECT_OPTIONS.find((o) => o.value === effectiveEntityType)?.label} #${form.entityId || "—"}`
                  : "Không liên kết",
              },
              { label: "Thời gian", value: form.guiNgay ? "Gửi ngay" : `Lên lịch: ${form.thoiGianGui}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-4 px-4 py-3">
                <span className="w-36 shrink-0 text-xs font-medium text-secondary-400">{label}</span>
                <span className="flex-1 text-sm text-secondary-800">{value}</span>
              </div>
            ))}
            <div className="flex items-start gap-4 px-4 py-3">
              <span className="w-36 shrink-0 text-xs font-medium text-secondary-400">Nội dung</span>
              <p className="flex-1 text-sm text-secondary-700 whitespace-pre-line leading-relaxed">
                {form.noiDung}
              </p>
            </div>
          </div>

          {/* Estimated count */}
          <div className="flex items-center gap-2 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700">
            <InformationCircleIcon className="h-4 w-4 shrink-0" />
            Sẽ tạo{" "}
            <strong>{estimatedCount.toLocaleString("vi-VN")}</strong>{" "}
            thông báo vào hàng đợi.
          </div>
        </div>
      )}

      {/* ── Navigation buttons ── */}
      <div className="flex items-center justify-between border-t border-secondary-100 pt-4">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="inline-flex items-center gap-1.5 rounded-xl border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Quay lại
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 ? !step1Valid() : !step2Valid()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Tiếp theo
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {submitting ? "Đang tạo..." : "Tạo & Gửi"}
          </button>
        )}
      </div>
    </div>
  );
}
