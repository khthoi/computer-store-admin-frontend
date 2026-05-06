"use client";

import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type {
  LoyaltyEarnRule,
  LoyaltyEarnRulePayload,
  EarnRuleBonusTrigger,
} from "@/src/types/loyalty.types";
import type { SelectOption } from "@/src/components/ui/Select";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Toggle } from "@/src/components/ui/Toggle";
import { DateInput } from "@/src/components/ui/DateInput";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { createEarnRule, updateEarnRule, deleteEarnRule } from "@/src/services/loyalty.service";
import { ScopeMultipliersSection, type ScopeEntry } from "./ScopeMultipliersSection";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props =
  | { mode: "create"; rule?: never }
  | { mode: "edit";   rule: LoyaltyEarnRule }
  | { mode: "view";   rule: LoyaltyEarnRule };

// ─── Select options ───────────────────────────────────────────────────────────

const BONUS_OPTIONS: SelectOption[] = [
  { value: "", label: "Không có" },
  { value: "first_order", label: "Đơn hàng đầu tiên", description: "Thưởng cho đơn hàng đầu tiên của khách hàng" },
  { value: "birthday",    label: "Sinh nhật",          description: "Thưởng vào tháng sinh nhật của khách hàng" },
  { value: "manual",      label: "Thủ công",           description: "Được kích hoạt thủ công bởi quản trị viên" },
];

const BONUS_LABELS: Record<string, string> = {
  first_order: "Đơn hàng đầu tiên",
  birthday:    "Sinh nhật",
  manual:      "Thủ công",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-secondary-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-secondary-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── MetaField ────────────────────────────────────────────────────────────────

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EarnRuleFormClient({ mode, rule }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const isView = mode === "view";
  const isEdit = mode === "edit";

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName]               = useState(rule?.name ?? "");
  const [description, setDescription] = useState(rule?.description ?? "");
  const [isActive, setIsActive]       = useState(rule?.isActive ?? true);
  const [priority, setPriority]       = useState(rule?.priority != null ? String(rule.priority) : "10");

  const [pointsPerUnit,     setPointsPerUnit]     = useState(rule?.pointsPerUnit     != null ? String(rule.pointsPerUnit)     : "1");
  const [spendPerUnit,      setSpendPerUnit]       = useState(rule?.spendPerUnit      != null ? String(rule.spendPerUnit)      : "10000");
  const [minOrderValue,     setMinOrderValue]      = useState(rule?.minOrderValue     != null ? String(rule.minOrderValue)     : "");
  const [maxPointsPerOrder, setMaxPointsPerOrder]  = useState(rule?.maxPointsPerOrder != null ? String(rule.maxPointsPerOrder) : "");

  const [bonusTrigger, setBonusTrigger] = useState<string>(rule?.bonusTrigger ?? "");
  const [bonusPoints,  setBonusPoints]  = useState(rule?.bonusPoints != null ? String(rule.bonusPoints) : "");

  const [scopes, setScopes] = useState<ScopeEntry[]>(
    rule?.scopes.map((s) => ({
      scopeType:     s.scopeType,
      scopeRefId:    s.scopeRefId,
      scopeRefLabel: s.scopeRefLabel,
      multiplier:    String(s.multiplier),
    })) ?? []
  );

  const [validFrom,  setValidFrom]  = useState(rule?.validFrom  ?? "");
  const [validUntil, setValidUntil] = useState(rule?.validUntil ?? "");

  // ── View-mode-only state ───────────────────────────────────────────────────
  const [liveIsActive,       setLiveIsActive]       = useState(rule?.isActive ?? true);
  const [showDeleteConfirm,  setShowDeleteConfirm]  = useState(false);
  const [isBusy,             setIsBusy]             = useState(false);

  async function handleToggleActive(next: boolean) {
    setLiveIsActive(next);
    try {
      await updateEarnRule(rule!.id, { isActive: next });
      showToast(next ? "Đã kích hoạt quy tắc." : "Đã vô hiệu hóa quy tắc.", "success");
    } catch {
      setLiveIsActive(!next);
      showToast("Cập nhật thất bại.", "error");
    }
  }

  async function handleDelete() {
    setIsBusy(true);
    try {
      await deleteEarnRule(rule!.id);
      showToast("Đã xoá quy tắc tích điểm.", "success");
      router.push("/promotions?tab=earn-rules");
    } catch {
      showToast("Xoá thất bại.", "error");
      setIsBusy(false);
      setShowDeleteConfirm(false);
    }
  }

  // ── Validation / save ──────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isValid = useMemo(() => {
    if (!name.trim()) return false;
    const ppu = Number(pointsPerUnit);
    if (!pointsPerUnit || isNaN(ppu) || ppu <= 0) return false;
    const spu = Number(spendPerUnit);
    if (!spendPerUnit || isNaN(spu) || spu <= 0) return false;
    const pri = Number(priority);
    if (priority === "" || isNaN(pri)) return false;
    if (bonusTrigger && (!bonusPoints || isNaN(Number(bonusPoints)) || Number(bonusPoints) <= 0)) return false;
    if (validFrom && validUntil && validUntil <= validFrom) return false;
    for (const s of scopes) {
      if (!s.scopeRefId.trim()) return false;
      const m = Number(s.multiplier);
      if (isNaN(m) || m <= 0) return false;
    }
    return true;
  }, [name, pointsPerUnit, spendPerUnit, priority, bonusTrigger, bonusPoints, validFrom, validUntil, scopes]);

  const previewText = useMemo(() => {
    const ppu = Number(pointsPerUnit);
    const spu = Number(spendPerUnit);
    if (!name.trim() || isNaN(ppu) || ppu <= 0 || isNaN(spu) || spu <= 0) return null;

    const lines: ReactNode[] = [];
    const spuK = spu >= 1000 ? `${(spu / 1000).toFixed(0)}k` : spu.toLocaleString("vi-VN");
    lines.push(`Tích ${ppu} điểm mỗi ${spuK}₫ chi tiêu.`);

    if (minOrderValue && Number(minOrderValue) > 0)
      lines.push(`Đơn tối thiểu: ${Number(minOrderValue).toLocaleString("vi-VN")}₫.`);
    if (maxPointsPerOrder && Number(maxPointsPerOrder) > 0)
      lines.push(`Giới hạn: ${Number(maxPointsPerOrder).toLocaleString("vi-VN")} điểm/đơn.`);

    const validScopes = scopes.filter((s) => s.scopeRefLabel.trim() && Number(s.multiplier) > 0);
    if (validScopes.length > 0) {
      lines.push(
        <span key="scopes">
          Hệ số:{" "}
          {validScopes.map((s, idx) => (
            <span key={idx}>
              {idx > 0 && ", "}
              {s.multiplier}× <strong>{s.scopeRefLabel.trim()}</strong>
            </span>
          ))}.
        </span>
      );
    }

    if (bonusTrigger && bonusPoints && Number(bonusPoints) > 0)
      lines.push(`+${Number(bonusPoints).toLocaleString("vi-VN")} điểm thưởng khi ${BONUS_LABELS[bonusTrigger] ?? bonusTrigger}.`);

    if (validFrom || validUntil) {
      lines.push(`Hiệu lực: ${validFrom || "—"} – ${validUntil || "—"}.`);
    } else {
      lines.push("Luôn hoạt động (không giới hạn thời gian).");
    }

    return lines;
  }, [name, pointsPerUnit, spendPerUnit, minOrderValue, maxPointsPerOrder, scopes, bonusTrigger, bonusPoints, validFrom, validUntil]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Tên là bắt buộc.";

    const ppu = Number(pointsPerUnit);
    if (!pointsPerUnit || isNaN(ppu) || ppu <= 0)
      newErrors.pointsPerUnit = "Phải lớn hơn 0.";

    const spu = Number(spendPerUnit);
    if (!spendPerUnit || isNaN(spu) || spu <= 0)
      newErrors.spendPerUnit = "Phải lớn hơn 0.";

    const pri = Number(priority);
    if (priority === "" || isNaN(pri)) newErrors.priority = "Độ ưu tiên là bắt buộc.";

    if (bonusTrigger && (!bonusPoints || isNaN(Number(bonusPoints)) || Number(bonusPoints) <= 0))
      newErrors.bonusPoints = "Điểm thưởng phải lớn hơn 0 khi có điều kiện kích hoạt.";

    if (validFrom && validUntil && validUntil <= validFrom)
      newErrors.validUntil = "Ngày kết thúc phải sau ngày bắt đầu.";

    scopes.forEach((s, i) => {
      if (!s.scopeRefId.trim())
        newErrors[`scope_ref_${i}`] = "Vui lòng chọn đối tượng áp dụng.";
      const m = Number(s.multiplier);
      if (isNaN(m) || m <= 0)
        newErrors[`scope_multiplier_${i}`] = "Hệ số phải lớn hơn 0.";
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const payload: LoyaltyEarnRulePayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        pointsPerUnit: ppu,
        spendPerUnit: spu,
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxPointsPerOrder: maxPointsPerOrder ? Number(maxPointsPerOrder) : undefined,
        bonusTrigger: bonusTrigger ? (bonusTrigger as EarnRuleBonusTrigger) : undefined,
        bonusPoints: bonusTrigger && bonusPoints ? Number(bonusPoints) : undefined,
        scopes: scopes.map((s) => ({
          scopeType:     s.scopeType,
          scopeRefId:    s.scopeRefId,
          scopeRefLabel: s.scopeRefLabel,
          multiplier:    Number(s.multiplier),
        })),
        isActive,
        priority: pri,
        validFrom:  validFrom  || undefined,
        validUntil: validUntil || undefined,
      };

      if (isEdit) {
        await updateEarnRule(rule.id, payload);
        showToast("Đã cập nhật quy tắc tích điểm.", "success");
        router.push(`/promotions/earn-rules/${rule.id}/edit`);
      } else {
        const created = await createEarnRule(payload);
        showToast("Đã tạo quy tắc tích điểm.", "success");
        router.push(`/promotions/earn-rules/${created.id}/edit`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Lưu thất bại.", "error");
    } finally {
      setSaving(false);
    }
  }

  const backHref = isEdit
    ? `/promotions/earn-rules/${rule!.id}/edit`
    : "/promotions?tab=earn-rules";

  return (
    <div className="space-y-6 p-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      {isView ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
              <Link href="/promotions" className="hover:text-secondary-700 transition-colors">Khuyến mãi & Mã giảm giá</Link>
              <span>›</span>
              <Link href="/promotions?tab=earn-rules" className="hover:text-secondary-700 transition-colors">Quy tắc tích điểm</Link>
              <span>›</span>
              <span className="font-mono text-secondary-600">{rule!.id}</span>
            </nav>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-secondary-900">{name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                liveIsActive
                  ? "bg-success-50 border border-success-200 text-success-700"
                  : "bg-secondary-100 border border-secondary-200 text-secondary-500"
              }`}>
                {liveIsActive ? "Đang hoạt động" : "Không hoạt động"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push("/promotions?tab=earn-rules")}
              disabled={isBusy}
              className="rounded-lg"
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Quay lại
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push(`/promotions/earn-rules/${rule!.id}/edit?mode=edit`)}
              disabled={isBusy}
              className="rounded-lg"
            >
              <PencilSquareIcon className="w-4 h-4 mr-1.5" />
              Chỉnh sửa
            </Button>
            <Button
              variant="danger"
              className="rounded-lg"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isBusy}
            >
              <TrashIcon className="w-4 h-4 mr-1.5" />
              Xoá
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-secondary-400 mb-0.5">
              <Link href="/promotions" className="hover:text-secondary-600 transition-colors">Khuyến mãi & Mã giảm giá</Link>
              <span>›</span>
              <Link href="/promotions?tab=earn-rules" className="hover:text-secondary-600 transition-colors">Quy tắc tích điểm</Link>
              {isEdit && (
                <>
                  <span>›</span>
                  <Link href={`/promotions/earn-rules/${rule!.id}/edit`} className="font-mono hover:text-secondary-600 transition-colors">
                    {rule!.id}
                  </Link>
                </>
              )}
              <span>›</span>
              <span className="text-secondary-600">{isEdit ? "Chỉnh sửa" : "Mới"}</span>
            </nav>
            <h1 className="text-xl font-bold text-secondary-900">
              {isEdit ? `Chỉnh sửa: ${rule!.name}` : "Quy tắc tích điểm mới"}
            </h1>
          </div>
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Left column */}
        <div className="space-y-4">

          {/* 1. Basic Info */}
          <Section title="Thông tin cơ bản" description="Tên, mô tả và trạng thái kích hoạt cho quy tắc này.">
            <Input
              label="Tên"
              required={!isView}
              placeholder="VD: Tỷ lệ cơ bản"
              value={name}
              onChange={(e) => setName(e.target.value)}
              errorMessage={errors.name}
              fullWidth
              disabled={isView}
            />
            <Textarea
              label="Mô tả"
              placeholder="Tùy chọn — mô tả khi nào quy tắc này áp dụng."
              rows={2}
              maxCharCount={300}
              showCharCount={!isView}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isView}
            />
            <div className="flex items-center gap-8">
              <Toggle
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                label="Đang hoạt động"
                disabled={isView}
              />
              <Input
                label="Độ ưu tiên"
                type="number"
                min={0}
                required={!isView}
                placeholder="VD: 10"
                helperText="Số cao hơn = được ưu tiên xét trước khi nhiều quy tắc cùng áp dụng."
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                errorMessage={errors.priority}
                disabled={isView}
              />
            </div>
          </Section>

          {/* 2. Points Rate */}
          <Section
            title="Tỷ lệ tích điểm"
            description="Số điểm khách hàng nhận được trên mỗi số tiền chi tiêu."
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Điểm thưởng"
                type="number"
                min={1}
                required={!isView}
                placeholder="VD: 1"
                value={pointsPerUnit}
                onChange={(e) => setPointsPerUnit(e.target.value)}
                errorMessage={errors.pointsPerUnit}
                fullWidth
                disabled={isView}
              />
              <Input
                label="Mỗi (VND)"
                type="number"
                min={1}
                required={!isView}
                placeholder="VD: 10000"
                helperText="VD: 10000 → 1 điểm mỗi 10.000₫ chi tiêu"
                value={spendPerUnit}
                onChange={(e) => setSpendPerUnit(e.target.value)}
                errorMessage={errors.spendPerUnit}
                fullWidth
                disabled={isView}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Giá trị đơn tối thiểu (VND)"
                type="number"
                min={0}
                placeholder="Bỏ trống = không giới hạn"
                helperText="Đơn hàng phải đạt giá trị này mới được tích điểm."
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                fullWidth
                disabled={isView}
              />
              <Input
                label="Điểm tối đa mỗi đơn"
                type="number"
                min={1}
                placeholder="Bỏ trống = không giới hạn"
                helperText="Giới hạn điểm tích được từ một đơn hàng."
                value={maxPointsPerOrder}
                onChange={(e) => setMaxPointsPerOrder(e.target.value)}
                fullWidth
                disabled={isView}
              />
            </div>

            {!isView && pointsPerUnit && spendPerUnit && Number(pointsPerUnit) > 0 && Number(spendPerUnit) > 0 && (
              <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm text-primary-800">
                <span className="font-semibold">Xem trước: </span>
                Khách hàng chi tiêu{" "}
                <span className="font-semibold">
                  {(Number(spendPerUnit) * 10).toLocaleString("vi-VN")}₫
                </span>{" "}
                nhận được{" "}
                <span className="font-semibold">
                  {(Number(pointsPerUnit) * 10).toLocaleString("vi-VN")} điểm
                </span>
                {maxPointsPerOrder && Number(maxPointsPerOrder) > 0 && (
                  <span className="text-primary-600">
                    {" "}(tối đa {Number(maxPointsPerOrder).toLocaleString("vi-VN")} điểm/đơn)
                  </span>
                )}
                .
              </div>
            )}
          </Section>

          {/* 3. Fixed Bonus */}
          <Section
            title="Thưởng cố định"
            description="Trao một khoản thưởng một lần khi xảy ra sự kiện cụ thể."
          >
            <Select
              label="Điều kiện kích hoạt thưởng"
              options={BONUS_OPTIONS}
              value={bonusTrigger}
              onChange={(v) => {
                setBonusTrigger(v as string);
                if (!v) setBonusPoints("");
              }}
              placeholder="Không có"
              helperText="Bỏ trống nếu quy tắc này không có thưởng cố định."
              disabled={isView}
            />
            {bonusTrigger && (
              <Input
                label="Điểm thưởng"
                type="number"
                min={1}
                required={!isView}
                placeholder="VD: 200"
                helperText="Số điểm thưởng được trao khi điều kiện kích hoạt."
                value={bonusPoints}
                onChange={(e) => setBonusPoints(e.target.value)}
                errorMessage={errors.bonusPoints}
                fullWidth
                disabled={isView}
              />
            )}
          </Section>

          {/* 4. Scope Multipliers */}
          <Section
            title="Hệ số phạm vi"
            description="Ghi đè tỷ lệ tích điểm cho danh mục, thương hiệu hoặc sản phẩm cụ thể."
          >
            {isView ? (
              scopes.length === 0 ? (
                <p className="text-sm text-secondary-400">
                  Quy tắc toàn cục — áp dụng cho tất cả sản phẩm theo tỷ lệ cơ bản.
                </p>
              ) : (
                <div className="divide-y divide-secondary-100">
                  {scopes.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-secondary-800">{s.scopeRefLabel || s.scopeRefId}</p>
                        <p className="text-xs text-secondary-400">
                          {s.scopeType === "product" ? "Biến thể sản phẩm" : s.scopeType === "category" ? "Danh mục" : "Thương hiệu"}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-sm font-bold text-primary-700">
                        {s.multiplier}×
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <ScopeMultipliersSection scopes={scopes} onChange={setScopes} errors={errors} />
            )}
          </Section>

          {/* 5. Validity Period */}
          <Section
            title="Thời gian hiệu lực"
            description="Bỏ trống cả hai ô để áp dụng quy tắc mọi thời điểm."
          >
            <div className="grid grid-cols-2 gap-4">
              <DateInput label="Hiệu lực từ"  value={validFrom}  onChange={setValidFrom}  disabled={isView} />
              <DateInput
                label="Hiệu lực đến"
                value={validUntil}
                onChange={setValidUntil}
                errorMessage={errors.validUntil}
                disabled={isView}
              />
            </div>
          </Section>

          {/* Footer actions — edit/create only */}
          {!isView && (
            <div className="flex items-center justify-between pt-2">
              <Button variant="secondary" onClick={() => router.back()} disabled={saving} className="rounded-lg">
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                disabled={saving || !isValid}
                className="rounded-lg"
              >
                {isEdit ? "Lưu thay đổi" : "Tạo quy tắc tích điểm"}
              </Button>
            </div>
          )}

          {/* Thông tin tổng quan — view only */}
          {isView && (
            <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-secondary-900">Thông tin tổng quan</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetaField label="Mã quy tắc">
                  <span className="font-mono text-sm text-secondary-800">{rule!.id}</span>
                </MetaField>
                <MetaField label="Độ ưu tiên">
                  <span className="text-sm font-semibold text-secondary-800">{rule!.priority}</span>
                </MetaField>
                <MetaField label="Ngày tạo">
                  <span className="text-sm text-secondary-500">{formatDate(rule!.createdAt)}</span>
                </MetaField>
              </div>
              <div className="pt-3 border-t border-secondary-100">
                <Toggle
                  checked={liveIsActive}
                  onChange={(e) => handleToggleActive(e.target.checked)}
                  label={liveIsActive ? "Đang hoạt động" : "Không hoạt động"}
                  size="sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right column — Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
              Xem trước quy tắc
            </h3>

            {previewText ? (
              <>
                <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3">
                  <p className="text-sm font-semibold text-primary-800">
                    {name.trim() || "Quy tắc chưa đặt tên"}
                  </p>
                  {description.trim() && (
                    <p className="mt-1 text-xs text-primary-600">{description.trim()}</p>
                  )}
                </div>

                <ul className="space-y-2">
                  {previewText.map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-secondary-700">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                      {line}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 pt-1">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isActive ? "bg-success-50 text-success-700" : "bg-secondary-100 text-secondary-500"
                  }`}>
                    {isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </span>
                  <span className="text-xs text-secondary-400">Độ ưu tiên {priority || "—"}</span>
                </div>
              </>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-secondary-200 p-6 text-center">
                <p className="text-sm text-secondary-400">
                  {isView
                    ? "Không có dữ liệu xem trước."
                    : "Điền tên và tỷ lệ để xem trước quy tắc."}
                </p>
              </div>
            )}

            {!isView && !isValid && name.trim() && (
              <p className="text-xs text-warning-600 bg-warning-50 rounded-lg px-3 py-2">
                Điền đầy đủ các trường bắt buộc để có thể lưu.
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Delete confirm dialog — view mode */}
      {isView && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Xoá quy tắc tích điểm?"
          description={`"${name}" sẽ bị xoá vĩnh viễn. Khách hàng sẽ không còn tích điểm theo quy tắc này. Hành động này không thể hoàn tác.`}
          confirmLabel="Xoá"
          cancelLabel="Huỷ"
          variant="danger"
          isConfirming={isBusy}
        />
      )}
    </div>
  );
}
