"use client";

import { useState } from "react";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";
import { DiscountRuleBuilder, type DiscountRule } from "./DiscountRuleBuilder";
import { CouponCodeManager, type CouponCode } from "./CouponCodeManager";
import { FlashSaleScheduler, type FlashSaleConfig } from "./FlashSaleScheduler";
import {
  PromotionApplicabilityPicker,
  type Applicability,
} from "./PromotionApplicabilityPicker";

// ─── Types ────────────────────────────────────────────────────────────────────

type PromotionType = "coupon" | "flash_sale" | "automatic";

export interface PromotionGeneralData {
  name: string;
  type: PromotionType;
  status: "active" | "inactive" | "scheduled";
  internalNote?: string;
}

export interface PromotionFormTabsProps {
  promotionId?: string;
  initialData?: Partial<PromotionGeneralData>;
}

// ─── Default values ───────────────────────────────────────────────────────────

function defaultDiscountRule(): DiscountRule {
  return {
    conditions:    [],
    logic:         "AND",
    discountType:  "percentage",
    discountValue: "",
  };
}

function defaultFlashSaleConfig(): FlashSaleConfig {
  return {
    startAt:     "",
    endAt:       "",
    bannerTitle: "",
    products:    [],
  };
}

function defaultApplicability(): Applicability {
  return { scope: "all", selectedIds: [] };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROMOTION_TYPE_OPTIONS = [
  { value: "coupon",     label: "Mã giảm giá (Coupon)" },
  { value: "flash_sale", label: "Flash Sale" },
  { value: "automatic",  label: "Tự động áp dụng" },
];

const STATUS_OPTIONS = [
  { value: "active",    label: "Hoạt động" },
  { value: "inactive",  label: "Không hoạt động" },
  { value: "scheduled", label: "Đã lên lịch" },
];

const TAB_ITEMS = [
  { value: "general",     label: "Thông tin chung" },
  { value: "rules",       label: "Quy tắc" },
  { value: "scope",       label: "Phạm vi áp dụng" },
  { value: "schedule",    label: "Lịch trình" },
  { value: "statistics",  label: "Thống kê sử dụng" },
];

// ─── Tab dirty indicator ──────────────────────────────────────────────────────

function DirtyDot() {
  return (
    <span
      aria-label="Có thay đổi chưa lưu"
      className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-warning-500"
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PromotionFormTabs — tabbed form for creating / editing a promotion.
 *
 * Tabs:
 * 1. Thông tin chung — name, type, status, internal note.
 * 2. Quy tắc — DiscountRuleBuilder + CouponCodeManager (coupon) or FlashSaleScheduler (flash_sale).
 * 3. Phạm vi áp dụng — PromotionApplicabilityPicker.
 * 4. Lịch trình — start / end datetime + summary card.
 * 5. Thống kê sử dụng — read-only placeholder stats.
 *
 * Each tab tracks its own "dirty" state (changed since mount).
 */
export function PromotionFormTabs({
  promotionId,
  initialData = {},
}: PromotionFormTabsProps) {
  // ── Tab state ─────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState("general");

  // ── General ───────────────────────────────────────────────────────────────

  const [generalData, setGeneralData] = useState<PromotionGeneralData>({
    name:         initialData.name         ?? "",
    type:         initialData.type         ?? "coupon",
    status:       initialData.status       ?? "inactive",
    internalNote: initialData.internalNote ?? "",
  });
  const [generalDirty, setGeneralDirty] = useState(false);

  function updateGeneral(patch: Partial<PromotionGeneralData>) {
    setGeneralData((prev) => ({ ...prev, ...patch }));
    setGeneralDirty(true);
  }

  // ── Rules ─────────────────────────────────────────────────────────────────

  const [discountRule, setDiscountRule] = useState<DiscountRule>(defaultDiscountRule());
  const [couponCodes,  setCouponCodes]  = useState<CouponCode[]>([]);
  const [flashSale,    setFlashSale]    = useState<FlashSaleConfig>(defaultFlashSaleConfig());
  const [rulesDirty,   setRulesDirty]   = useState(false);

  function handleDiscountRuleChange(v: DiscountRule) {
    setDiscountRule(v);
    setRulesDirty(true);
  }

  function handleCouponCodesChange(v: CouponCode[]) {
    setCouponCodes(v);
    setRulesDirty(true);
  }

  function handleFlashSaleChange(v: FlashSaleConfig) {
    setFlashSale(v);
    setRulesDirty(true);
  }

  // ── Scope ─────────────────────────────────────────────────────────────────

  const [applicability, setApplicability] = useState<Applicability>(defaultApplicability());
  const [scopeDirty, setScopeDirty]       = useState(false);

  function handleApplicabilityChange(v: Applicability) {
    setApplicability(v);
    setScopeDirty(true);
  }

  // ── Schedule ──────────────────────────────────────────────────────────────

  const [schedule, setSchedule]       = useState({ startAt: "", endAt: "" });
  const [scheduleDirty, setScheduleDirty] = useState(false);

  function updateSchedule(patch: { startAt?: string; endAt?: string }) {
    setSchedule((prev) => ({ ...prev, ...patch }));
    setScheduleDirty(true);
  }

  // ── Tabs with dirty indicators ────────────────────────────────────────────

  const tabs = TAB_ITEMS.map((t) => {
    const isDirty =
      (t.value === "general"  && generalDirty)  ||
      (t.value === "rules"    && rulesDirty)     ||
      (t.value === "scope"    && scopeDirty)     ||
      (t.value === "schedule" && scheduleDirty);

    return {
      ...t,
      label: (
        <span className="flex items-center">
          {t.label}
          {isDirty && <DirtyDot />}
        </span>
      ),
    };
  });

  // ── Schedule helpers ──────────────────────────────────────────────────────

  const startDate = schedule.startAt ? new Date(schedule.startAt) : null;
  const endDate   = schedule.endAt   ? new Date(schedule.endAt)   : null;
  const invalidSchedule =
    startDate && endDate && endDate <= startDate;

  function formatDateDisplay(dateStr: string): string {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("vi-VN", {
        day:    "2-digit",
        month:  "2-digit",
        year:   "numeric",
        hour:   "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
      {promotionId && (
        <div className="border-b border-secondary-100 px-6 py-3 bg-secondary-50">
          <p className="text-xs text-secondary-400">
            ID khuyến mãi:{" "}
            <span className="font-mono text-secondary-600">{promotionId}</span>
          </p>
        </div>
      )}

      <div className="px-6 pt-5">
        <Tabs
          tabs={tabs}
          value={activeTab}
          onChange={setActiveTab}
          variant="line"
          keepMounted
        >
          {/* ── Tab 1: Thông tin chung ───────────────────────────────────── */}
          <TabPanel value="general" className="py-5">
            <div className="flex flex-col gap-4 max-w-xl">
              <Input
                label="Tên khuyến mãi"
                value={generalData.name}
                onChange={(e) => updateGeneral({ name: e.target.value })}
                placeholder="VD: Summer Sale 2026"
              />

              <Select
                label="Loại khuyến mãi"
                options={PROMOTION_TYPE_OPTIONS}
                value={generalData.type}
                onChange={(v) => updateGeneral({ type: v as PromotionType })}
              />

              <Select
                label="Trạng thái"
                options={STATUS_OPTIONS}
                value={generalData.status}
                onChange={(v) =>
                  updateGeneral({
                    status: v as PromotionGeneralData["status"],
                  })
                }
              />

              <Textarea
                label="Ghi chú nội bộ"
                rows={3}
                placeholder="(Tùy chọn) Ghi chú cho đội ngũ nội bộ…"
                value={generalData.internalNote ?? ""}
                onChange={(e) => updateGeneral({ internalNote: e.target.value })}
              />
            </div>
          </TabPanel>

          {/* ── Tab 2: Quy tắc ──────────────────────────────────────────── */}
          <TabPanel value="rules" className="py-5">
            {generalData.type === "flash_sale" ? (
              <FlashSaleScheduler
                value={flashSale}
                onChange={handleFlashSaleChange}
              />
            ) : (
              <div className="flex flex-col gap-6">
                <DiscountRuleBuilder
                  value={discountRule}
                  onChange={handleDiscountRuleChange}
                />

                {generalData.type === "coupon" && (
                  <div className="border-t border-secondary-100 pt-5">
                    <p className="text-sm font-semibold text-secondary-800 mb-3">
                      Mã giảm giá
                    </p>
                    <CouponCodeManager
                      codes={couponCodes}
                      onCodesChange={handleCouponCodesChange}
                    />
                  </div>
                )}
              </div>
            )}
          </TabPanel>

          {/* ── Tab 3: Phạm vi áp dụng ───────────────────────────────────── */}
          <TabPanel value="scope" className="py-5">
            <div className="max-w-xl">
              <PromotionApplicabilityPicker
                value={applicability}
                onChange={handleApplicabilityChange}
              />
            </div>
          </TabPanel>

          {/* ── Tab 4: Lịch trình ───────────────────────────────────────── */}
          <TabPanel value="schedule" className="py-5">
            <div className="flex flex-col gap-5 max-w-xl">
              {/* Datetime inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-secondary-700">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    value={schedule.startAt}
                    onChange={(e) => updateSchedule({ startAt: e.target.value })}
                    className="w-full h-10 rounded border border-secondary-300 bg-white px-3 text-sm text-secondary-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-secondary-700">
                    Ngày kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    value={schedule.endAt}
                    min={schedule.startAt || undefined}
                    onChange={(e) => updateSchedule({ endAt: e.target.value })}
                    className={[
                      "w-full h-10 rounded border bg-white px-3 text-sm text-secondary-700 focus:outline-none focus:ring-2",
                      invalidSchedule
                        ? "border-error-400 focus:border-error-500 focus:ring-error-500/15"
                        : "border-secondary-300 focus:border-primary-500 focus:ring-primary-500/15",
                    ].join(" ")}
                  />
                </div>
              </div>

              {invalidSchedule && (
                <p className="text-xs text-error-600">
                  Thời gian kết thúc phải sau thời gian bắt đầu.
                </p>
              )}

              {/* Calendar summary card */}
              <div className="rounded-xl border border-secondary-100 bg-secondary-50 px-5 py-4">
                <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-3">
                  Tóm tắt lịch trình
                </p>
                <dl className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-secondary-500">Bắt đầu</dt>
                    <dd className="font-medium text-secondary-800">
                      {formatDateDisplay(schedule.startAt)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <dt className="text-secondary-500">Kết thúc</dt>
                    <dd className="font-medium text-secondary-800">
                      {formatDateDisplay(schedule.endAt)}
                    </dd>
                  </div>
                  {startDate && endDate && endDate > startDate && (
                    <div className="flex items-center justify-between text-sm border-t border-secondary-200 pt-2 mt-1">
                      <dt className="text-secondary-500">Thời hạn</dt>
                      <dd className="font-medium text-primary-600">
                        {(
                          (endDate.getTime() - startDate.getTime()) /
                          3_600_000
                        ).toFixed(1)}{" "}
                        giờ
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </TabPanel>

          {/* ── Tab 5: Thống kê sử dụng ──────────────────────────────────── */}
          <TabPanel value="statistics" className="py-5">
            <div className="grid grid-cols-3 gap-4 max-w-2xl">
              {[
                { label: "Số lượt sử dụng",    value: "0" },
                { label: "Doanh thu tạo ra",    value: "0₫" },
                { label: "Tỷ lệ chuyển đổi",   value: "0%" },
              ].map(({ label, value: val }) => (
                <div
                  key={label}
                  className="rounded-xl border border-secondary-100 bg-secondary-50 px-5 py-4 text-center"
                >
                  <p className="text-2xl font-bold text-secondary-900">{val}</p>
                  <p className="mt-1 text-xs text-secondary-500">{label}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-secondary-400">
              Thống kê sẽ được cập nhật sau khi khuyến mãi được kích hoạt.
            </p>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
