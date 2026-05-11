"use client";

import { useState, useEffect, useCallback } from "react";
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
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  TagIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ArrowUturnLeftIcon,
  StarIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import { createNotification } from "@/src/services/notification.service";
import { getCustomers } from "@/src/services/customer.service";
import { getOrders } from "@/src/services/order.service";
import { getTransactions } from "@/src/services/transaction.service";
import { getReturns } from "@/src/services/returns.service";
import { getPromotionList } from "@/src/services/promotion.service";
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
import type { MembershipTier } from "@/src/types/loyalty.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOAI_OPTIONS: { value: NotificationLoai; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "DonHang",   label: "Đơn hàng",   desc: "Cập nhật đơn hàng",       icon: <ShoppingCartIcon className="h-4 w-4" /> },
  { value: "GiaoDich",  label: "Giao dịch",  desc: "Thanh toán / hoàn tiền",  icon: <CreditCardIcon className="h-4 w-4" /> },
  { value: "HoanHang",  label: "Hoàn trả",   desc: "Đổi hàng, hoàn trả",      icon: <ArrowUturnLeftIcon className="h-4 w-4" /> },
  { value: "KhuyenMai", label: "Khuyến mãi", desc: "Flash sale, coupon",       icon: <TagIcon className="h-4 w-4" /> },
  { value: "Loyalty",   label: "Loyalty",    desc: "Điểm thưởng, thăng hạng", icon: <StarIcon className="h-4 w-4" /> },
  { value: "NhacNho",   label: "Nhắc nhở",   desc: "Giỏ bỏ quên, hàng về",    icon: <BellIcon className="h-4 w-4" /> },
  { value: "HeThong",   label: "Hệ thống",   desc: "Broadcast từ admin",       icon: <MegaphoneIcon className="h-4 w-4" /> },
];

const STATUS_SELECT_OPTIONS: SelectOption[] = [
  { value: "active",  label: "Đang hoạt động" },
  { value: "pending", label: "Chờ xác minh" },
  { value: "banned",  label: "Bị khóa" },
];

const ENTITY_TYPE_SELECT_OPTIONS: SelectOption[] = [
  { value: "DonHang",   label: "Đơn hàng",   description: "Liên kết tới đơn hàng cụ thể" },
  { value: "GiaoDich",  label: "Giao dịch",  description: "Liên kết tới giao dịch thanh toán" },
  { value: "HoanHang",  label: "Hoàn trả",   description: "Liên kết tới yêu cầu hoàn trả" },
  { value: "KhuyenMai", label: "Khuyến mãi", description: "Liên kết tới chương trình khuyến mãi" },
];

const CHANNEL_CONFIG: Record<NotificationChannel, {
  icon: React.ReactNode;
  color: string;
  activeCls: string;
  previewBg: string;
  previewBorder: string;
  label: string;
}> = {
  Push: {
    icon: <BellIcon className="h-4 w-4" />,
    color: "text-amber-600",
    activeCls: "border-amber-300 bg-amber-50 text-amber-700",
    previewBg: "bg-secondary-50",
    previewBorder: "border-secondary-200",
    label: "Push Notification",
  },
  Email: {
    icon: <EnvelopeIcon className="h-4 w-4" />,
    color: "text-primary-600",
    activeCls: "border-primary-300 bg-primary-50 text-primary-700",
    previewBg: "bg-primary-50/50",
    previewBorder: "border-primary-200",
    label: "Email",
  },
  SMS: {
    icon: <DevicePhoneMobileIcon className="h-4 w-4" />,
    color: "text-blue-600",
    activeCls: "border-blue-300 bg-blue-50 text-blue-700",
    previewBg: "bg-blue-50/50",
    previewBorder: "border-blue-200",
    label: "SMS",
  },
};

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
  const cfg = CHANNEL_CONFIG[channel];
  return (
    <label className={[
      "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 transition-all select-none",
      checked ? cfg.activeCls : "border-secondary-200 bg-white text-secondary-500 hover:border-secondary-300",
    ].join(" ")}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(channel, e.target.checked)}
      />
      {cfg.icon}
      <span className="text-sm font-medium">{channel}</span>
    </label>
  );
}

// ─── Group preview card ───────────────────────────────────────────────────────

function GroupPreviewCard({
  groupStatus,
  groupTier,
  tierOptions,
}: {
  groupStatus: string;
  groupTier: string;
  tierOptions: SelectOption[];
}) {
  const statusLabel = STATUS_SELECT_OPTIONS.find((o) => o.value === groupStatus)?.label;
  const tierLabel   = tierOptions.find((o) => o.value === groupTier)?.label;
  const tierDesc    = tierOptions.find((o) => o.value === groupTier)?.description;
  const hasFilter   = !!(groupStatus || groupTier);

  return (
    <div className={[
      "rounded-xl border p-4 space-y-3 transition-colors",
      hasFilter
        ? "border-primary-100 bg-primary-50/60"
        : "border-secondary-100 bg-secondary-50/40",
    ].join(" ")}>
      <div className="flex items-center gap-2">
        <UserGroupIcon className={["h-4 w-4", hasFilter ? "text-primary-600" : "text-secondary-400"].join(" ")} />
        <span className={["text-xs font-semibold", hasFilter ? "text-primary-700" : "text-secondary-500"].join(" ")}>
          Nhóm đối tượng nhận
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3 py-1 text-xs font-medium text-primary-700">
            <ShieldCheckIcon className="h-3 w-3" />
            {statusLabel}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-200 bg-white px-3 py-1 text-[11px] text-secondary-400">
            Mọi trạng thái
          </span>
        )}
        {tierLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <SparklesIcon className="h-3 w-3" />
            {tierLabel}
            {tierDesc && <span className="text-amber-500 font-normal">· {tierDesc}</span>}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-200 bg-white px-3 py-1 text-[11px] text-secondary-400">
            Mọi hạng thành viên
          </span>
        )}
      </div>

      <p className="text-[11px] text-secondary-500 leading-relaxed">
        {hasFilter
          ? "Thông báo sẽ gửi đến khách hàng thỏa mãn tất cả điều kiện trên."
          : "Chưa áp dụng bộ lọc — thông báo sẽ gửi đến toàn bộ nhóm khách hàng."}
      </p>
    </div>
  );
}

// ─── Notification preview card (Step 3) ──────────────────────────────────────

function NotificationPreviewCard({
  channels,
  tieuDe,
  noiDung,
}: {
  channels: NotificationChannel[];
  tieuDe: string;
  noiDung: string;
}) {
  const title   = tieuDe  || "Tiêu đề thông báo";
  const content = noiDung || "Nội dung thông báo sẽ hiển thị tại đây...";
  const short   = content.length > 90 ? content.slice(0, 90) + "…" : content;

  return (
    <div className="space-y-2">
      {channels.includes("Push") && (
        <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
              <BellIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[11px] font-semibold text-secondary-500 uppercase tracking-wide">Online PC Store</span>
                <span className="text-[10px] text-secondary-400 shrink-0">Vừa xong</span>
              </div>
              <p className="text-xs font-semibold text-secondary-900 truncate">{title}</p>
              <p className="text-xs text-secondary-500 line-clamp-2 leading-relaxed mt-0.5">{short}</p>
            </div>
          </div>
          <p className="mt-2 text-right text-[10px] font-medium text-amber-600">Push Notification</p>
        </div>
      )}

      {channels.includes("Email") && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <EnvelopeIcon className="h-3.5 w-3.5 text-primary-500" />
              <span className="text-[10px] font-semibold text-primary-600 uppercase tracking-wide">Email Preview</span>
            </div>
          </div>
          <div className="space-y-0.5 text-[11px]">
            <p className="text-secondary-400">Từ: <span className="text-secondary-600">noreply@online-pc-store.vn</span></p>
            <p className="text-secondary-400">Chủ đề: <span className="font-medium text-secondary-800">{title}</span></p>
          </div>
          <div className="border-t border-primary-100 pt-2 text-xs text-secondary-600 line-clamp-3 leading-relaxed whitespace-pre-line">
            {content}
          </div>
        </div>
      )}

      {channels.includes("SMS") && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <DevicePhoneMobileIcon className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">SMS Preview</span>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white px-3 py-2">
            <p className="text-xs text-secondary-700 leading-relaxed">
              {tieuDe ? `[${tieuDe}] ` : ""}{short}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  // Step 1
  targetType: TargetType;
  groupStatus: string;
  groupTier: string;
  specificCustomerIds: string[];
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

// ─── Preview count ────────────────────────────────────────────────────────────

function estimateCount(form: FormState, totalCustomers: number): number {
  const base =
    form.targetType === "all"      ? totalCustomers :
    form.targetType === "group"    ? Math.round(totalCustomers * 0.25) :
    form.specificCustomerIds.length;
  return Math.max(base, 0) * form.channels.length;
}

// ─── Review row helper ────────────────────────────────────────────────────────

function ReviewRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <div className="mt-0.5 shrink-0 text-secondary-400">{icon}</div>
      <span className="w-32 shrink-0 text-xs font-medium text-secondary-400">{label}</span>
      <div className="flex-1 text-sm text-secondary-800">{children}</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateNotificationForm({ membershipTiers }: { membershipTiers: MembershipTier[] }) {
  const tierSelectOptions: SelectOption[] = membershipTiers.map((t) => ({
    value: t.name,
    label: t.displayName,
    description: t.maxPoints !== null
      ? `${t.minPoints.toLocaleString("vi-VN")} – ${t.maxPoints.toLocaleString("vi-VN")} điểm`
      : `Từ ${t.minPoints.toLocaleString("vi-VN")} điểm trở lên`,
  }));

  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  // ── Customer data ─────────────────────────────────────────────────────────
  const [customers, setCustomers]               = useState<SelectOption[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError]     = useState(false);
  const [customersTotal, setCustomersTotal]     = useState(0);

  const loadCustomers = useCallback(() => {
    setCustomersLoading(true);
    setCustomersError(false);
    // backend PaginationDto has @Max(100) — fetch 2 pages in parallel for up to 200 customers
    Promise.all([
      getCustomers({ limit: 100, page: 1 }),
      getCustomers({ limit: 100, page: 2 }),
    ])
      .then(([p1, p2]) => {
        const merged = [
          ...p1.data,
          ...(p2.data.length > 0 ? p2.data : []),
        ];
        setCustomers(
          merged.map((c) => ({
            value: String(c.id),
            label: c.fullName,
            description: `${c.phone ?? ""} · ${c.email}`,
          }))
        );
        setCustomersTotal(p1.total);
      })
      .catch(() => {
        setCustomers([]);
        setCustomersError(true);
      })
      .finally(() => setCustomersLoading(false));
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  // ── Entity options ────────────────────────────────────────────────────────
  const [entityOptions, setEntityOptions]               = useState<SelectOption[]>([]);
  const [entityOptionsLoading, setEntityOptionsLoading] = useState(false);

  const isSingleSpecific =
    form.targetType === "specific" && form.specificCustomerIds.length === 1;

  const allowedEntityTypeOptions = isSingleSpecific
    ? ENTITY_TYPE_SELECT_OPTIONS
    : ENTITY_TYPE_SELECT_OPTIONS.filter((o) => o.value === "KhuyenMai");

  const entityLinkRestricted = !isSingleSpecific;

  const effectiveEntityType =
    allowedEntityTypeOptions.some((o) => o.value === form.entityType)
      ? form.entityType
      : "";

  useEffect(() => {
    if (!effectiveEntityType) {
      setEntityOptions([]);
      return;
    }
    setEntityOptionsLoading(true);
    setEntityOptions([]);

    async function load() {
      try {
        let opts: SelectOption[] = [];

        if (effectiveEntityType === "DonHang") {
          const result = await getOrders({ pageSize: 100 });
          opts = result.data.map((o) => ({
            value: String(o.numericId),
            label: o.id,
            description: `ID: ${o.numericId} · ${o.grandTotal.toLocaleString("vi-VN")} ₫ · ${o.customerName}`,
          }));
        } else if (effectiveEntityType === "GiaoDich") {
          const result = await getTransactions({ pageSize: 100 });
          opts = result.data.map((row) => ({
            value: String(row.giaoDichId),
            label: row.maGiaoDichNgoai ?? `TX-${row.giaoDichId}`,
            description: `ID: ${row.giaoDichId} · ${row.soTien.toLocaleString("vi-VN")} ₫ · ${row.tenKhachHang}`,
          }));
        } else if (effectiveEntityType === "HoanHang") {
          const result = await getReturns({ limit: 100 });
          opts = result.items.map((r) => ({
            value: r.id,
            label: r.orderCode ?? `RET-${r.id}`,
            description: `ID: ${r.id} · ${r.customerName ?? ""}`,
          }));
        } else if (effectiveEntityType === "KhuyenMai") {
          const result = await getPromotionList({ limit: 100 });
          opts = result.data.map((p) => ({
            value: p.id,
            label: p.name,
            description: `ID: ${p.id}${p.code ? ` · Mã: ${p.code}` : ""}`,
          }));
        }

        setEntityOptions(opts);
      } catch {
        setEntityOptions([]);
      } finally {
        setEntityOptionsLoading(false);
      }
    }

    load();
  }, [effectiveEntityType]);

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

  const estimatedCount   = estimateCount(form, customersTotal);
  const loaiInfo         = LOAI_OPTIONS.find((o) => o.value === form.loaiThongBao);
  const entityTypelabel  = ENTITY_TYPE_SELECT_OPTIONS.find((o) => o.value === effectiveEntityType)?.label;
  const entityName       = entityOptions.find((o) => o.value === form.entityId)?.label;

  // ── Helpers for step 3 audience description ──────────────────────────────
  const audienceDescription = (() => {
    if (form.targetType === "all") return "Tất cả khách hàng";
    if (form.targetType === "group") {
      const parts: string[] = [];
      const statusLbl = STATUS_SELECT_OPTIONS.find((o) => o.value === form.groupStatus)?.label;
      const tierLbl   = tierSelectOptions.find((o) => o.value === form.groupTier)?.label;
      if (statusLbl) parts.push(statusLbl);
      if (tierLbl)   parts.push(`Hạng ${tierLbl}`);
      return parts.length ? `Nhóm: ${parts.join(" · ")}` : "Theo nhóm (tất cả)";
    }
    return `${form.specificCustomerIds.length} khách hàng được chọn`;
  })();

  const audienceBase =
    form.targetType === "all"      ? customersTotal :
    form.targetType === "group"    ? Math.round(customersTotal * 0.25) :
    form.specificCustomerIds.length;

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
                  specific: { icon: <UserIcon className="h-5 w-5" />,        label: "Khách cụ thể", desc: "Chọn từ danh sách" },
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

            {/* Group filter options + preview */}
            {form.targetType === "group" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 items-start gap-4 rounded-xl border border-secondary-100 bg-secondary-50/60 p-4">
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
                    options={tierSelectOptions}
                    value={form.groupTier}
                    onChange={(v) => set("groupTier", v as string)}
                    clearable
                    boldLabel
                    showDescriptionInTrigger={false}
                    size="sm"
                  />
                </div>

                {/* Group preview card */}
                <GroupPreviewCard
                  groupStatus={form.groupStatus}
                  groupTier={form.groupTier}
                  tierOptions={tierSelectOptions}
                />
              </div>
            )}

            {/* Specific customers — multi select */}
            {form.targetType === "specific" && (
              <div className="space-y-2">
                {customersError ? (
                  <div className="flex items-start gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3">
                    <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5 text-error-500" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-error-700">Không thể tải danh sách khách hàng</p>
                      <p className="text-[11px] text-error-500 mt-0.5">Kiểm tra kết nối và đảm bảo bạn đã đăng nhập.</p>
                    </div>
                    <button
                      type="button"
                      onClick={loadCustomers}
                      className="inline-flex items-center gap-1 rounded-lg border border-error-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-error-600 hover:bg-error-50 transition-colors"
                    >
                      <ArrowPathIcon className="h-3 w-3" />
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <Select
                    label="Chọn khách hàng"
                    required
                    placeholder={customersLoading ? "Đang tải..." : "Tìm kiếm theo tên hoặc email..."}
                    options={customers}
                    value={form.specificCustomerIds}
                    onChange={(v) => set("specificCustomerIds", v as string[])}
                    multiple
                    searchable
                    clearable
                    boldLabel
                    disabled={customersLoading}
                  />
                )}
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
                  <span className="mb-0.5 text-current opacity-70">{opt.icon}</span>
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
            <div className="grid grid-cols-2 items-start gap-4">
              <Select
                label="Loại thực thể"
                placeholder="— Không liên kết —"
                options={allowedEntityTypeOptions}
                value={effectiveEntityType}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, entityType: v as string, entityId: "" }));
                }}
                clearable
                boldLabel
                showDescriptionInTrigger={false}
              />
              <Select
                label="Thực thể liên kết"
                placeholder={
                  !effectiveEntityType ? "— Chọn loại trước —" :
                  entityOptionsLoading  ? "Đang tải..."          :
                  "Tìm kiếm..."
                }
                options={entityOptions}
                value={effectiveEntityType === form.entityType ? form.entityId : ""}
                onChange={(v) => set("entityId", v as string)}
                searchable
                clearable
                boldLabel
                showDescriptionInTrigger={false}
                disabled={!effectiveEntityType || entityOptionsLoading}
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
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-secondary-700">Xem lại trước khi gửi</h3>

          {/* Audience + Delivery summary */}
          <div className="rounded-xl border border-secondary-200 bg-white divide-y divide-secondary-100">
            <ReviewRow icon={<UsersIcon className="h-4 w-4" />} label="Đối tượng">
              <div className="space-y-1">
                <span>{audienceDescription}</span>
                {form.targetType === "group" && (form.groupStatus || form.groupTier) && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {form.groupStatus && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 border border-primary-100 px-2 py-0.5 text-[11px] text-primary-600">
                        <ShieldCheckIcon className="h-3 w-3" />
                        {STATUS_SELECT_OPTIONS.find((o) => o.value === form.groupStatus)?.label}
                      </span>
                    )}
                    {form.groupTier && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[11px] text-amber-600">
                        <SparklesIcon className="h-3 w-3" />
                        {tierSelectOptions.find((o) => o.value === form.groupTier)?.label}
                      </span>
                    )}
                  </div>
                )}
                {form.targetType === "specific" && form.specificCustomerIds.length > 0 && (
                  <p className="text-xs text-secondary-500 mt-0.5">
                    {form.specificCustomerIds
                      .slice(0, 3)
                      .map((id) => customers.find((c) => c.value === id)?.label ?? `#${id}`)
                      .join(", ")}
                    {form.specificCustomerIds.length > 3 && ` và ${form.specificCustomerIds.length - 3} người khác`}
                  </p>
                )}
              </div>
            </ReviewRow>

            <ReviewRow icon={<TagIcon className="h-4 w-4" />} label="Loại thông báo">
              {loaiInfo ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-secondary-500">{loaiInfo.icon}</span>
                  <span>{loaiInfo.label}</span>
                  <span className="text-secondary-400 text-xs">— {loaiInfo.desc}</span>
                </span>
              ) : "—"}
            </ReviewRow>

            <ReviewRow icon={<BellIcon className="h-4 w-4" />} label="Kênh gửi">
              <div className="flex flex-wrap gap-1.5">
                {form.channels.map((ch) => {
                  const cfg = CHANNEL_CONFIG[ch];
                  return (
                    <span
                      key={ch}
                      className={[
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        cfg.activeCls,
                      ].join(" ")}
                    >
                      {cfg.icon}
                      {ch}
                    </span>
                  );
                })}
              </div>
            </ReviewRow>

            <ReviewRow icon={<ClockIcon className="h-4 w-4" />} label="Thời gian gửi">
              {form.guiNgay ? (
                <span className="inline-flex items-center gap-1.5 text-success-600 font-medium text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
                  Gửi ngay sau khi xác nhận
                </span>
              ) : (
                <span className="text-secondary-700">
                  {form.thoiGianGui
                    ? new Date(form.thoiGianGui).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })
                    : "—"}
                </span>
              )}
            </ReviewRow>

            {effectiveEntityType && (
              <ReviewRow icon={<TagIcon className="h-4 w-4" />} label="Liên kết">
                <span>
                  {entityTypelabel} {entityName ? `— ${entityName}` : form.entityId ? `#${form.entityId}` : "—"}
                </span>
              </ReviewRow>
            )}

            <div className="flex items-start gap-4 px-4 py-3">
              <div className="mt-0.5 shrink-0 text-secondary-400">
                <EnvelopeIcon className="h-4 w-4" />
              </div>
              <span className="w-32 shrink-0 text-xs font-medium text-secondary-400">Nội dung</span>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-secondary-800">{form.tieuDe}</p>
                <p className="text-sm text-secondary-600 whitespace-pre-line leading-relaxed">{form.noiDung}</p>
              </div>
            </div>
          </div>

          {/* Notification preview */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide">Preview thông báo</p>
            <NotificationPreviewCard
              channels={form.channels}
              tieuDe={form.tieuDe}
              noiDung={form.noiDung}
            />
          </div>

          {/* Impact breakdown */}
          <div className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary-700">
              <PaperAirplaneIcon className="h-4 w-4" />
              Tổng kết lần gửi
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white border border-primary-100 px-3 py-2">
                <p className="text-lg font-bold text-secondary-800">{audienceBase.toLocaleString("vi-VN")}</p>
                <p className="text-[11px] text-secondary-400 mt-0.5">Đối tượng nhận</p>
              </div>
              <div className="flex items-center justify-center text-secondary-300">
                <span className="text-lg font-light">×</span>
              </div>
              <div className="rounded-lg bg-white border border-primary-100 px-3 py-2">
                <p className="text-lg font-bold text-secondary-800">{form.channels.length}</p>
                <p className="text-[11px] text-secondary-400 mt-0.5">
                  {form.channels.length === 1 ? "Kênh gửi" : "Kênh gửi"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 border-t border-primary-100 pt-2">
              <InformationCircleIcon className="h-3.5 w-3.5 text-primary-400" />
              <span className="text-xs text-primary-600">
                Ước tính{" "}
                <strong className="text-primary-800">{estimatedCount.toLocaleString("vi-VN")}</strong>{" "}
                thông báo sẽ được đưa vào hàng đợi gửi
                {form.guiNgay ? " ngay lập tức" : ""}.
              </span>
            </div>
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
