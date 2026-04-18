"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PencilSquareIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import {
  cancelPromotion,
  pausePromotion,
  activatePromotion,
  duplicatePromotion,
  getPromotionUsage,
} from "@/src/services/promotion.service";
import { formatVND, formatDateTime } from "@/src/lib/format";
import type { Promotion, PromotionUsage, PromotionType, StackingPolicy } from "@/src/types/promotion.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<PromotionType, string> = {
  standard: "Giảm giá thông thường",
  bxgy: "Mua X tặng Y",
  bundle: "Combo / Gói sản phẩm",
  bulk: "Số lượng lớn / Phân cấp",
  free_shipping: "Miễn phí vận chuyển",
};

const STACKING_LABELS: Record<StackingPolicy, string> = {
  exclusive: "Độc quyền — không kết hợp",
  stackable: "Có thể kết hợp với tất cả",
  stackable_with_coupons_only: "Chỉ kết hợp với mã giảm giá",
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionDetailClient({
  promotion: initial,
  initialUsage = [],
}: {
  promotion: Promotion;
  initialUsage?: PromotionUsage[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [promotion, setPromotion] = useState(initial);
  const [usage, setUsage] = useState<PromotionUsage[]>(initialUsage);
  const [isBusy, setIsBusy] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const canEdit = promotion.status === "draft" || promotion.status === "scheduled" || promotion.status === "active" || promotion.status === "paused";
  const canCancel = promotion.status === "active" || promotion.status === "scheduled" || promotion.status === "draft";
  const canPause = promotion.status === "active";
  const canResume = promotion.status === "paused";

  async function handleAction(fn: () => Promise<Promotion>, msg: string) {
    setIsBusy(true);
    try {
      const updated = await fn();
      setPromotion(updated);
      showToast(msg, "success");
    } catch {
      showToast("Thao tác thất bại.", "error");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDuplicate() {
    setIsBusy(true);
    try {
      const copy = await duplicatePromotion(promotion.id);
      showToast(`Đã nhân bản thành "${copy.name}".`, "success");
      router.push(`/promotions/${copy.id}/edit`);
    } catch {
      showToast("Nhân bản thất bại.", "error");
    } finally {
      setIsBusy(false);
    }
  }

  const usagePct =
    promotion.totalUsageLimit && promotion.totalUsageLimit > 0
      ? Math.min(100, Math.round((promotion.usageCount / promotion.totalUsageLimit) * 100))
      : null;

  const totalDiscountGiven = usage.reduce((s, u) => s + u.discountAmount, 0);
  const uniqueCustomers = new Set(usage.map((u) => u.customerId)).size;

  // Action summary
  const action = promotion.actions[0];
  const actionSummary = (() => {
    if (promotion.type === "bxgy" && action?.bxgy) {
      const b = action.bxgy;
      return `Mua ${b.buyQuantity}× ${b.buyProductLabel ?? "bất kỳ"} → Tặng ${b.getQuantity}× ${b.getProductLabel ?? "cùng sản phẩm"} ${b.getDiscountPercent === 100 ? "MIỄN PHÍ" : `giảm ${b.getDiscountPercent}%`}`;
    }
    if (promotion.type === "bundle") {
      const parts = (action?.requiredComponents ?? []).map((c) => c.refLabel ?? c.refId).join(" + ");
      return `Combo: ${parts} → ${action?.discountType === "percentage" ? `giảm ${action.discountValue}%` : formatVND(action?.discountValue ?? 0)}`;
    }
    if (promotion.type === "bulk") {
      const tiers = action?.tiers ?? [];
      return `Phân cấp: ${tiers.map((t) => `${t.minQuantity}${t.maxQuantity ? `–${t.maxQuantity}` : "+"}× → ${t.discountType === "percentage" ? `${t.discountValue}%` : formatVND(t.discountValue)}`).join("; ")}`;
    }
    if (promotion.type === "free_shipping") return "Miễn phí vận chuyển";
    if (!action) return "—";
    if (action.discountType === "percentage") return `giảm ${action.discountValue}%${action.maxDiscountAmount ? ` (tối đa ${formatVND(action.maxDiscountAmount)})` : ""}`;
    return `giảm ${formatVND(action.discountValue ?? 0)}`;
  })();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/promotions" className="hover:text-secondary-700 transition-colors">Khuyến mãi</Link>
            <span>›</span>
            <span className="font-mono text-secondary-600">{promotion.id}</span>
          </nav>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900">{promotion.name}</h1>
            <StatusBadge status={promotion.status} />
            {promotion.isCoupon && (
              <span className="rounded-md bg-secondary-100 px-2 py-0.5 font-mono text-xs font-bold tracking-wide text-secondary-700">
                {promotion.code}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="rounded-lg"
            onClick={() => router.back()}
            disabled={isBusy}
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            >
            Quay lại
          </Button>
          <Button variant="secondary" onClick={handleDuplicate} disabled={isBusy} className="rounded-lg">
            <DocumentDuplicateIcon className="w-4 h-4 mr-1.5" />
            Nhân bản
          </Button>
          {canEdit && (
            <Button variant="secondary" onClick={() => router.push(`/promotions/${promotion.id}/edit`)} disabled={isBusy} className="rounded-lg">
              <PencilSquareIcon className="w-4 h-4 mr-1.5" />
              Chỉnh sửa
            </Button>
          )}
          {canPause && (
            <Button variant="secondary" onClick={() => handleAction(() => pausePromotion(promotion.id), "Đã tạm dừng khuyến mãi.")} disabled={isBusy} className="rounded-lg">
              Tạm dừng
            </Button>
          )}
          {canResume && (
            <Button variant="primary" onClick={() => handleAction(() => activatePromotion(promotion.id), "Đã kích hoạt khuyến mãi.")} disabled={isBusy} className="rounded-lg">
              Tiếp tục
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" onClick={() => setShowCancelConfirm(true)} disabled={isBusy} className="rounded-lg">
              Hủy bỏ
            </Button>
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Tổng quan</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetaField label="ID"><span className="font-mono text-sm text-secondary-800">{promotion.id}</span></MetaField>
          <MetaField label="Loại"><span className="text-sm text-secondary-800">{TYPE_LABELS[promotion.type]}</span></MetaField>
          <MetaField label="Chính sách kết hợp"><span className="text-sm text-secondary-800">{STACKING_LABELS[promotion.stackingPolicy]}</span></MetaField>
          <MetaField label="Độ ưu tiên"><span className="font-mono text-sm text-secondary-800">{promotion.priority}</span></MetaField>
          <MetaField label="Giảm giá / Hành động"><span className="text-sm font-medium text-primary-700">{actionSummary}</span></MetaField>
          <MetaField label="Phạm vi">
            <div className="flex flex-wrap gap-1">
              {promotion.scopes.some((s) => s.scopeType === "global") ? (
                <span className="rounded-md bg-secondary-100 px-2 py-0.5 text-xs text-secondary-600">Toàn cầu</span>
              ) : (
                promotion.scopes.map((s) => (
                  <span key={s.id} className="rounded-md bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
                    {s.scopeRefLabel ?? s.scopeRefId}
                  </span>
                ))
              )}
            </div>
          </MetaField>
          <MetaField label="Ngày bắt đầu"><span className="text-sm text-secondary-800">{formatDate(promotion.startDate)}</span></MetaField>
          <MetaField label="Ngày kết thúc"><span className="text-sm text-secondary-800">{formatDate(promotion.endDate)}</span></MetaField>
          <MetaField label="Tạo bởi"><span className="text-sm text-secondary-800">{promotion.createdBy}</span></MetaField>
          {promotion.description && (
            <div className="sm:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Mô tả</p>
              <p className="mt-1 text-sm text-secondary-700">{promotion.description}</p>
            </div>
          )}
          {promotion.conditions.length > 0 && (
            <div className="sm:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400 mb-2">Điều kiện</p>
              <div className="flex flex-wrap gap-1">
                {promotion.conditions.map((c) => (
                  <span key={c.id} className="rounded-md bg-info-50 border border-info-200 px-2 py-0.5 text-xs text-info-700">
                    {c.type} {c.operator} {c.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage stats */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Thống kê sử dụng</h2>
        <div className="grid gap-6 sm:grid-cols-3 mb-5">
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary-900">{promotion.usageCount}</p>
            <p className="text-xs text-secondary-400 mt-1">Tổng lượt dùng{promotion.totalUsageLimit ? ` / ${promotion.totalUsageLimit}` : ""}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-700">{formatVND(totalDiscountGiven)}</p>
            <p className="text-xs text-secondary-400 mt-1">Tổng giảm giá đã áp dụng</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary-900">{uniqueCustomers}</p>
            <p className="text-xs text-secondary-400 mt-1">Khách hàng duy nhất</p>
          </div>
        </div>
        {usagePct !== null && (
          <div>
            <div className="flex items-center justify-between text-xs text-secondary-500 mb-1">
              <span>Tiến độ sử dụng</span>
              <span>{usagePct}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-secondary-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePct >= 90 ? "bg-error-500" : usagePct >= 60 ? "bg-warning-500" : "bg-success-500"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
        )}
        {promotion.totalUsageLimit === undefined && (
          <p className="text-sm text-secondary-400">Không giới hạn lượt sử dụng.</p>
        )}
      </div>

      {/* Usage history table */}
      {usage.length > 0 && (
        <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
          <div className="border-b border-secondary-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-secondary-900">Đơn hàng đã áp dụng</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary-50 text-left text-xs font-semibold uppercase tracking-wide text-secondary-500">
                <tr>
                  <th className="px-4 py-3">Mã đơn hàng</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3 text-right">Số tiền giảm</th>
                  <th className="px-4 py-3">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {usage.map((u) => (
                  <tr key={u.id} className="text-secondary-700 hover:bg-secondary-50">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${u.orderId}`} className="font-mono text-primary-600 hover:underline">
                        {u.orderId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{u.customerName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-success-700">
                      -{formatVND(u.discountAmount)}
                    </td>
                    <td className="px-4 py-3 text-secondary-500 whitespace-nowrap">
                      {formatDateTime(u.appliedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel confirm modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-secondary-900">Hủy bỏ khuyến mãi?</h3>
            <p className="mt-2 text-sm text-secondary-600">
              Khuyến mãi sẽ kết thúc ngay lập tức. Các đơn hàng đã đặt vẫn giữ nguyên giảm giá. Hành động này không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCancelConfirm(false)}>Giữ nguyên</Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowCancelConfirm(false);
                  handleAction(() => cancelPromotion(promotion.id), "Đã hủy bỏ khuyến mãi.");
                }}
                isLoading={isBusy}
              >
                Xác nhận hủy bỏ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
