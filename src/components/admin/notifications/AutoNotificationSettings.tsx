"use client";

import { useEffect, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  getAutoRuleGroups,
  updateAutoRule,
} from "@/src/services/notification.service";
import { Toggle } from "@/src/components/ui/Toggle";
import { Textarea } from "@/src/components/ui/Textarea";
import { Input } from "@/src/components/ui/Input";
import { useToast } from "@/src/components/ui/Toast";
import { NotificationChannelBadge } from "@/src/components/admin/notifications/NotificationChannelBadge";
import type {
  AutoNotificationRule,
  AutoNotificationRuleGroup,
} from "@/src/types/notification.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDelay(giay: number): string {
  if (giay === 0) return "Gửi ngay khi trigger";
  const abs = Math.abs(giay);
  const prefix = giay < 0 ? "Gửi trước" : "Gửi sau";
  if (abs < 60) return `${prefix} ${abs} giây`;
  if (abs < 3600) return `${prefix} ${Math.round(abs / 60)} phút`;
  return `${prefix} ${Math.round(abs / 3600)} giờ`;
}

// ─── Variable hint chip ───────────────────────────────────────────────────────

const VARIABLE_HINTS = [
  "{{tenKhachHang}}",
  "{{maDonHang}}",
  "{{soTien}}",
  "{{tenSanPham}}",
  "{{diemThuong}}",
  "{{tongDiem}}",
  "{{maCode}}",
  "{{ngayHetHan}}",
  "{{tenKhuyenMai}}",
  "{{mucGiam}}",
  "{{hangTiepTheo}}",
  "{{diemConLai}}",
  "{{ngayGiao}}",
  "{{maGiaoDich}}",
  "{{soSanPham}}",
];

function VariableChip({ variable, onInsert }: { variable: string; onInsert: (v: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onInsert(variable)}
      className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 transition-colors"
    >
      {variable}
    </button>
  );
}

// ─── Template editor (inline expand) ─────────────────────────────────────────

interface TemplateEditorProps {
  rule: AutoNotificationRule;
  onSave: (tieuDe: string, noiDung: string) => Promise<void>;
  onClose: () => void;
}

function TemplateEditor({ rule, onSave, onClose }: TemplateEditorProps) {
  const [tieuDe, setTieuDe] = useState(rule.templateTieuDe);
  const [noiDung, setNoiDung] = useState(rule.templateNoiDung);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(tieuDe, noiDung);
    } finally {
      setSaving(false);
    }
  }

  function appendVariable(field: "title" | "body", variable: string) {
    if (field === "title") setTieuDe((prev) => prev + variable);
    else setNoiDung((prev) => prev + variable);
  }

  return (
    <div className="mt-3 rounded-xl border border-primary-100 bg-primary-50/30 p-4 space-y-4">
      {/* Variable hint bar */}
      <div>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-secondary-400">
          Variables có thể dùng
        </p>
        <div className="flex flex-wrap gap-1.5">
          {VARIABLE_HINTS.map((v) => (
            <VariableChip key={v} variable={v} onInsert={() => {}} />
          ))}
        </div>
        <p className="mt-1 text-[11px] text-secondary-400">
          Click vào variable để chèn vào cuối trường đang soạn.
        </p>
      </div>

      {/* Tiêu đề template */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-secondary-600">
          Template tiêu đề
        </label>
        <div className="flex gap-2 flex-wrap mb-1">
          {VARIABLE_HINTS.filter((v) =>
            rule.templateTieuDe.includes(v) || ["{{tenKhachHang}}", "{{maDonHang}}", "{{soTien}}"].includes(v)
          ).slice(0, 6).map((v) => (
            <VariableChip key={v} variable={v} onInsert={(val) => appendVariable("title", val)} />
          ))}
        </div>
        <Input
          value={tieuDe}
          onChange={(e) => setTieuDe(e.target.value)}
          placeholder="Template tiêu đề..."
          className="font-mono text-sm"
        />
      </div>

      {/* Nội dung template */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-secondary-600">
          Template nội dung
        </label>
        <div className="flex gap-2 flex-wrap mb-1">
          {VARIABLE_HINTS.filter((v) =>
            rule.templateNoiDung.includes(v) || ["{{tenKhachHang}}", "{{maDonHang}}"].includes(v)
          ).slice(0, 8).map((v) => (
            <VariableChip key={v} variable={v} onInsert={(val) => appendVariable("body", val)} />
          ))}
        </div>
        <Textarea
          value={noiDung}
          onChange={(e) => setNoiDung(e.target.value)}
          rows={3}
          placeholder="Template nội dung..."
          className="font-mono text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-secondary-600 hover:bg-secondary-100 transition-colors"
        >
          <XMarkIcon className="h-3.5 w-3.5" aria-hidden />
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
        >
          <CheckIcon className="h-3.5 w-3.5" aria-hidden />
          {saving ? "Đang lưu…" : "Lưu template"}
        </button>
      </div>
    </div>
  );
}

// ─── Rule row ─────────────────────────────────────────────────────────────────

interface RuleRowProps {
  rule: AutoNotificationRule;
  onToggle: (id: string, active: boolean) => Promise<void>;
  onSaveTemplate: (id: string, tieuDe: string, noiDung: string) => Promise<void>;
}

function RuleRow({ rule, onToggle, onSaveTemplate }: RuleRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function handleToggle(checked: boolean) {
    setToggling(true);
    try {
      await onToggle(rule.id, checked);
    } finally {
      setToggling(false);
    }
  }

  async function handleSaveTemplate(tieuDe: string, noiDung: string) {
    await onSaveTemplate(rule.id, tieuDe, noiDung);
    setIsEditing(false);
  }

  return (
    <div
      className={[
        "rounded-xl border px-4 py-3.5 transition-colors",
        rule.isActive
          ? "border-secondary-100 bg-white"
          : "border-secondary-100 bg-secondary-50/50",
      ].join(" ")}
    >
      {/* Rule header row */}
      <div className="flex items-start gap-4">
        {/* Toggle */}
        <div className="mt-0.5 shrink-0">
          <Toggle
            checked={rule.isActive}
            disabled={toggling}
            onChange={(e) => handleToggle(e.target.checked)}
            size="sm"
            aria-label={`Bật/tắt: ${rule.tenHienThi}`}
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "text-sm font-semibold",
                rule.isActive ? "text-secondary-800" : "text-secondary-400",
              ].join(" ")}
            >
              {rule.tenHienThi}
            </span>
            {!rule.isActive && (
              <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-[11px] font-medium text-secondary-400">
                Đã tắt
              </span>
            )}
          </div>
          <p className="text-xs text-secondary-500">{rule.moTa}</p>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {/* Channels */}
            {rule.kenhGui.map((ch) => (
              <NotificationChannelBadge key={ch} channel={ch} />
            ))}

            {/* Delay */}
            <span className="inline-flex items-center rounded-full bg-secondary-100 px-2 py-0.5 text-[11px] font-medium text-secondary-500">
              {formatDelay(rule.delayGiay)}
            </span>

            {/* Trigger key */}
            <span className="font-mono text-[11px] text-secondary-300">
              {rule.trigger}
            </span>
          </div>
        </div>

        {/* Edit button */}
        <button
          type="button"
          aria-label="Sửa template"
          aria-expanded={isEditing}
          onClick={() => setIsEditing((v) => !v)}
          className={[
            "shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
            isEditing
              ? "bg-primary-50 text-primary-700 border border-primary-200"
              : "text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700 border border-transparent",
          ].join(" ")}
        >
          <PencilSquareIcon className="h-3.5 w-3.5" aria-hidden />
          Sửa template
          {isEditing ? (
            <ChevronUpIcon className="h-3 w-3" aria-hidden />
          ) : (
            <ChevronDownIcon className="h-3 w-3" aria-hidden />
          )}
        </button>
      </div>

      {/* Inline template editor */}
      {isEditing && (
        <TemplateEditor
          rule={rule}
          onSave={handleSaveTemplate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

// ─── Group section ─────────────────────────────────────────────────────────────

const GROUP_ICON_COLOR: Record<string, string> = {
  DonHang:   "bg-primary-100 text-primary-600",
  ThanhToan: "bg-success-100 text-success-600",
  HoanTra:   "bg-warning-100 text-warning-600",
  Marketing: "bg-violet-100 text-violet-600",
  Loyalty:   "bg-amber-100 text-amber-600",
};

interface GroupSectionProps {
  group: AutoNotificationRuleGroup;
  onToggle: (id: string, active: boolean) => Promise<void>;
  onSaveTemplate: (id: string, tieuDe: string, noiDung: string) => Promise<void>;
}

function GroupSection({ group, onToggle, onSaveTemplate }: GroupSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const activeCount = group.rules.filter((r) => r.isActive).length;
  const colorClass = GROUP_ICON_COLOR[group.group] ?? "bg-secondary-100 text-secondary-600";

  return (
    <div className="rounded-2xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
      {/* Group header */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-secondary-50/50 transition-colors"
        aria-expanded={!collapsed}
      >
        {/* Color dot */}
        <span className={`h-2 w-2 rounded-full shrink-0 ${colorClass.split(" ")[0]}`} aria-hidden />

        <span className="flex-1 text-sm font-semibold text-secondary-800">
          {group.tenNhom}
        </span>

        {/* Active count badge */}
        <span className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-medium text-secondary-600">
          {activeCount}/{group.rules.length} đang bật
        </span>

        <ChevronDownIcon
          className={[
            "h-4 w-4 text-secondary-400 transition-transform duration-200",
            collapsed ? "" : "rotate-180",
          ].join(" ")}
          aria-hidden
        />
      </button>

      {/* Rules list */}
      {!collapsed && (
        <div className="border-t border-secondary-100 divide-y divide-secondary-50 px-5 py-4 space-y-3">
          {group.rules.map((rule) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              onToggle={onToggle}
              onSaveTemplate={onSaveTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AutoNotificationSettings() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<AutoNotificationRuleGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAutoRuleGroups()
      .then(setGroups)
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(ruleId: string, active: boolean) {
    try {
      await updateAutoRule(ruleId, { isActive: active });
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          rules: g.rules.map((r) =>
            r.id === ruleId ? { ...r, isActive: active } : r
          ),
        }))
      );
      showToast(active ? "Đã bật quy tắc thông báo." : "Đã tắt quy tắc thông báo.", "success");
    } catch {
      showToast("Không thể cập nhật. Vui lòng thử lại.", "error");
    }
  }

  async function handleSaveTemplate(ruleId: string, tieuDe: string, noiDung: string) {
    try {
      await updateAutoRule(ruleId, { templateTieuDe: tieuDe, templateNoiDung: noiDung });
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          rules: g.rules.map((r) =>
            r.id === ruleId
              ? { ...r, templateTieuDe: tieuDe, templateNoiDung: noiDung }
              : r
          ),
        }))
      );
      showToast("Template đã được lưu thành công.", "success");
    } catch {
      showToast("Lưu template thất bại. Vui lòng thử lại.", "error");
    }
  }

  // ─── Loading skeleton ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-secondary-200 bg-white shadow-sm overflow-hidden animate-pulse"
          >
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="h-2 w-2 rounded-full bg-secondary-200" />
              <div className="h-4 w-40 rounded bg-secondary-100" />
              <div className="ml-auto h-5 w-20 rounded-full bg-secondary-100" />
              <div className="h-4 w-4 rounded bg-secondary-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Summary stats ───────────────────────────────────────────────────────────

  const totalRules  = groups.reduce((s, g) => s + g.rules.length, 0);
  const activeRules = groups.reduce((s, g) => s + g.rules.filter((r) => r.isActive).length, 0);

  return (
    <div className="space-y-5">
      {/* Header summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-secondary-800">
            Quy tắc thông báo tự động
          </h2>
          <p className="mt-0.5 text-xs text-secondary-500">
            Hệ thống tự gửi thông báo khi có sự kiện phù hợp. Bật/tắt hoặc chỉnh
            template cho từng quy tắc bên dưới.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2 text-sm">
          <span className="font-semibold text-primary-600">{activeRules}</span>
          <span className="text-secondary-500">/ {totalRules} quy tắc đang bật</span>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {groups.map((group) => (
          <GroupSection
            key={group.group}
            group={group}
            onToggle={handleToggle}
            onSaveTemplate={handleSaveTemplate}
          />
        ))}
      </div>

      {/* Footer note */}
      <p className="text-[11px] text-secondary-400 leading-relaxed">
        * Delay âm (ví dụ: "Gửi trước 30 phút") có nghĩa là thông báo được kích
        hoạt trước thời điểm sự kiện. Delay dương nghĩa là gửi sau khi trigger xảy ra.
      </p>
    </div>
  );
}
