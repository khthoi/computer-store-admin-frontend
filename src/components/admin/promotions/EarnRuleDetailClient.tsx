"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Toggle } from "@/src/components/ui/Toggle";
import { useToast } from "@/src/components/ui/Toast";
import { deleteEarnRule, updateEarnRule } from "@/src/services/loyalty.service";
import type { LoyaltyEarnRule } from "@/src/types/loyalty.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "₫";
}

const BONUS_LABELS: Record<string, string> = {
  first_order: "Đơn hàng đầu tiên",
  birthday: "Sinh nhật",
  manual: "Thủ công",
};

const BONUS_DESCRIPTIONS: Record<string, string> = {
  first_order: "Trao thưởng vào đơn hàng đầu tiên của khách hàng.",
  birthday: "Trao thưởng trong tháng sinh nhật của khách hàng.",
  manual: "Trao thưởng khi được kích hoạt thủ công bởi quản trị viên.",
};

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

export function EarnRuleDetailClient({ rule: initial }: { rule: LoyaltyEarnRule }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [rule, setRule] = useState(initial);
  const [isBusy, setIsBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleToggleActive(isActive: boolean) {
    setRule((prev) => ({ ...prev, isActive }));
    try {
      const updated = await updateEarnRule(rule.id, { isActive });
      setRule(updated);
      showToast(isActive ? "Đã kích hoạt quy tắc." : "Đã vô hiệu hóa quy tắc.", "success");
    } catch {
      setRule((prev) => ({ ...prev, isActive: !isActive }));
      showToast("Cập nhật thất bại.", "error");
    }
  }

  async function handleDelete() {
    setIsBusy(true);
    try {
      await deleteEarnRule(rule.id);
      showToast("Đã xóa quy tắc tích điểm.", "success");
      router.push("/promotions?tab=earn-rules");
    } catch {
      showToast("Xóa thất bại.", "error");
      setIsBusy(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* LEFT */}
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/promotions" className="hover:text-secondary-700 transition-colors">Khuyến mãi & Mã giảm giá</Link>
            <span>›</span>
            <Link href="/promotions?tab=earn-rules" className="hover:text-secondary-700 transition-colors">Quy tắc tích điểm</Link>
            <span>›</span>
            <span className="font-mono text-secondary-600">{rule.id}</span>
          </nav>

          <div className="mt-1 space-y-2">
            {/* Name + status */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-secondary-900">{rule.name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${rule.isActive
                ? "bg-success-50 border border-success-200 text-success-700"
                : "bg-secondary-100 border border-secondary-200 text-secondary-500"
                }`}>
                {rule.isActive ? "Đang hoạt động" : "Không hoạt động"}
              </span>
            </div>

            <Toggle
              checked={rule.isActive}
              onChange={(e) => handleToggleActive(e.target.checked)}
              label={rule.isActive ? "Đang hoạt động" : "Không hoạt động"}
              size="sm"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push("/promotions?tab=earn-rules")}
            disabled={isBusy}
            className="rounded-lg"
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
            Quay lại
          </Button>

          <Button
            variant="primary"
            onClick={() => router.push(`/promotions/earn-rules/${rule.id}/edit`)}
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
            Xóa
          </Button>
        </div>
      </div>

      {/* ── Overview ──────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Tổng quan</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetaField label="Mã quy tắc">
            <span className="font-mono text-sm text-secondary-800">{rule.id}</span>
          </MetaField>
          <MetaField label="Độ ưu tiên">
            <span className="text-sm font-semibold text-secondary-800">{rule.priority}</span>
          </MetaField>
          <MetaField label="Trạng thái">
            <span className={`text-sm font-medium ${rule.isActive ? "text-success-700" : "text-secondary-500"}`}>
              {rule.isActive ? "Đang hoạt động" : "Không hoạt động"}
            </span>
          </MetaField>
          <MetaField label="Hiệu lực từ">
            <span className="text-sm text-secondary-700">{formatDate(rule.validFrom)}</span>
          </MetaField>
          <MetaField label="Hiệu lực đến">
            <span className="text-sm text-secondary-700">{formatDate(rule.validUntil)}</span>
          </MetaField>
          <MetaField label="Ngày tạo">
            <span className="text-sm text-secondary-500">{formatDate(rule.createdAt)}</span>
          </MetaField>
        </div>
        {rule.description && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Mô tả</p>
            <p className="mt-1 text-sm text-secondary-700">{rule.description}</p>
          </div>
        )}
      </div>

      {/* ── Points Rate ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Tỷ lệ tích điểm</h2>
        <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4 mb-4">
          <p className="text-2xl font-bold text-primary-700">
            {rule.pointsPerUnit} điểm
            <span className="text-base font-medium text-primary-500 ml-1">
              / {(rule.spendPerUnit / 1000).toFixed(0)}k VND
            </span>
          </p>
          <p className="text-sm text-primary-600 mt-1">
            {rule.pointsPerUnit} điểm mỗi{" "}
            {formatVND(rule.spendPerUnit)} chi tiêu
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetaField label="Giá trị đơn tối thiểu">
            <span className="text-sm text-secondary-700">
              {rule.minOrderValue != null
                ? formatVND(rule.minOrderValue)
                : <span className="text-secondary-400">Không giới hạn</span>
              }
            </span>
          </MetaField>
          <MetaField label="Điểm tối đa / Đơn">
            <span className="text-sm text-secondary-700">
              {rule.maxPointsPerOrder != null
                ? <>{rule.maxPointsPerOrder.toLocaleString("vi-VN")} điểm</>
                : <span className="text-secondary-400">Không giới hạn</span>
              }
            </span>
          </MetaField>
        </div>
      </div>

      {/* ── Fixed Bonus ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Thưởng cố định</h2>
        {rule.bonusTrigger ? (
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-warning-50 border border-warning-200 px-4 py-3 text-sm shrink-0">
              <p className="font-semibold text-warning-700">
                +{rule.bonusPoints?.toLocaleString("vi-VN")} điểm
              </p>
              <p className="text-warning-600 text-xs mt-0.5">
                Kích hoạt: {BONUS_LABELS[rule.bonusTrigger] ?? rule.bonusTrigger}
              </p>
            </div>
            <p className="text-sm text-secondary-500 pt-1">
              {BONUS_DESCRIPTIONS[rule.bonusTrigger] ?? "Thưởng được trao khi điều kiện kích hoạt."}
            </p>
          </div>
        ) : (
          <p className="text-sm text-secondary-400">Chưa cấu hình thưởng cố định.</p>
        )}
      </div>

      {/* ── Scope Multipliers ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Hệ số phạm vi</h2>
        {rule.scopes.length === 0 ? (
          <p className="text-sm text-secondary-400">
            Quy tắc toàn cầu — áp dụng cho tất cả sản phẩm theo tỷ lệ cơ bản.
          </p>
        ) : (
          <div className="divide-y divide-secondary-100">
            {rule.scopes.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-secondary-800">{s.scopeRefLabel}</p>
                  <p className="text-xs text-secondary-400 capitalize">
                    {s.scopeType === "product" ? "Biến thể sản phẩm" : s.scopeType}
                  </p>
                </div>
                <span className="rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-sm font-bold text-primary-700">
                  {s.multiplier}×
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-secondary-900">Xóa quy tắc tích điểm?</h3>
            <p className="mt-2 text-sm text-secondary-600">
              <span className="font-medium">{rule.name}</span> sẽ bị xóa vĩnh viễn.
              Khách hàng sẽ không còn tích điểm theo quy tắc này. Hành động này không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isBusy}
              >
                Xác nhận xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
