"use client";

import { PencilIcon, TrashIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Toggle } from "@/src/components/ui/Toggle";
import type { BuildPCRule, RuleCheckType } from "@/src/types/buildpc.types";

// ─── Style maps ───────────────────────────────────────────────────────────────

const CHECK_TYPE_BADGE: Record<RuleCheckType, { variant: "info" | "primary" | "warning" | "error"; label: string }> = {
  exact_match: { variant: "info",    label: "Khớp chính xác" },
  contains:    { variant: "primary", label: "Chứa giá trị"   },
  min_sum:     { variant: "warning", label: "Tổng tối thiểu" },
  min_value:   { variant: "error",   label: "Giá trị tối thiểu" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export interface RuleRowProps {
  rule: BuildPCRule;
  onEdit: (r: BuildPCRule) => void;
  onDelete: (r: BuildPCRule) => void;
  onToggleActive: (r: BuildPCRule, active: boolean) => void;
}

export function RuleRow({ rule, onEdit, onDelete, onToggleActive }: RuleRowProps) {
  const checkTypeCfg = CHECK_TYPE_BADGE[rule.loaiKiemTra];

  return (
    <div
      className={[
        "group flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 transition-colors",
        rule.isActive
          ? "border-secondary-200 hover:border-secondary-300"
          : "border-secondary-100 bg-secondary-50/60 opacity-60",
      ].join(" ")}
    >
      {/* Slot flow */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Source → Destination */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-lg border border-secondary-200 bg-secondary-50 px-2 py-0.5 text-xs font-semibold text-secondary-700">
            {rule.slotNguonTen}
          </span>
          <ArrowRightIcon className="h-3 w-3 shrink-0 text-secondary-400" />
          <span className="rounded-lg border border-secondary-200 bg-secondary-50 px-2 py-0.5 text-xs font-semibold text-secondary-700">
            {rule.slotDichTen}
          </span>
          <code className="rounded bg-secondary-100 px-1.5 py-0.5 text-[10px] font-mono text-secondary-500">
            {rule.maKyThuat}
          </code>
        </div>

        {/* Badges + meta */}
        <div className="flex items-center flex-wrap gap-2">
          <Badge variant={checkTypeCfg.variant} size="sm">
            {checkTypeCfg.label}
          </Badge>
          {rule.batBuoc ? (
            <Badge variant="error" size="sm">Bắt buộc</Badge>
          ) : (
            <Badge variant="default" size="sm">Cảnh báo</Badge>
          )}
          {rule.heSo !== undefined && (
            <span className="text-[11px] text-secondary-400">
              Hệ số: ×{rule.heSo}
            </span>
          )}
          {rule.giaTriMacDinh && (
            <span className="text-[11px] text-secondary-400">
              Giá trị: <code className="text-[10px]">{rule.giaTriMacDinh}</code>
            </span>
          )}
        </div>

        {rule.moTa && (
          <p className="text-[11px] text-secondary-400 leading-relaxed">{rule.moTa}</p>
        )}
      </div>

      {/* Right controls */}
      <div className="flex shrink-0 items-center gap-2">
        <Tooltip content={rule.isActive ? "Đang bật" : "Đang tắt"} placement="top">
          <span>
            <Toggle
              checked={rule.isActive}
              onChange={(e) => onToggleActive(rule, e.target.checked)}
              size="sm"
            />
          </span>
        </Tooltip>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Tooltip content="Chỉnh sửa" placement="top">
            <Button variant="ghost" size="xs" onClick={() => onEdit(rule)}>
              <PencilIcon className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Xóa quy tắc" placement="top">
            <Button variant="ghost" size="xs" onClick={() => onDelete(rule)}>
              <TrashIcon className="h-3.5 w-3.5 text-error-500" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
