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
  standard:      "Standard Discount",
  bxgy:          "Buy X Get Y",
  bundle:        "Bundle / Combo",
  bulk:          "Bulk / Tiered",
  free_shipping: "Free Shipping",
};

const STACKING_LABELS: Record<StackingPolicy, string> = {
  exclusive:                  "Exclusive — no stacking",
  stackable:                  "Stackable with all",
  stackable_with_coupons_only:"Stackable with coupons only",
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

  const canEdit   = promotion.status === "draft" || promotion.status === "scheduled" || promotion.status === "active" || promotion.status === "paused";
  const canCancel = promotion.status === "active" || promotion.status === "scheduled" || promotion.status === "draft";
  const canPause  = promotion.status === "active";
  const canResume = promotion.status === "paused";

  async function handleAction(fn: () => Promise<Promotion>, msg: string) {
    setIsBusy(true);
    try {
      const updated = await fn();
      setPromotion(updated);
      showToast(msg, "success");
    } catch {
      showToast("Action failed.", "error");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDuplicate() {
    setIsBusy(true);
    try {
      const copy = await duplicatePromotion(promotion.id);
      showToast(`Duplicated as "${copy.name}".`, "success");
      router.push(`/promotions/${copy.id}/edit`);
    } catch {
      showToast("Failed to duplicate.", "error");
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
      return `Buy ${b.buyQuantity}× ${b.buyProductLabel ?? "any"} → Get ${b.getQuantity}× ${b.getProductLabel ?? "same product"} at ${b.getDiscountPercent === 100 ? "FREE" : `${b.getDiscountPercent}% off`}`;
    }
    if (promotion.type === "bundle") {
      const parts = (action?.requiredComponents ?? []).map((c) => c.refLabel ?? c.refId).join(" + ");
      return `Bundle: ${parts} → ${action?.discountType === "percentage" ? `${action.discountValue}% off` : formatVND(action?.discountValue ?? 0)}`;
    }
    if (promotion.type === "bulk") {
      const tiers = action?.tiers ?? [];
      return `Tiered bulk: ${tiers.map((t) => `${t.minQuantity}${t.maxQuantity ? `–${t.maxQuantity}` : "+"}× → ${t.discountType === "percentage" ? `${t.discountValue}%` : formatVND(t.discountValue)}`).join("; ")}`;
    }
    if (promotion.type === "free_shipping") return "Free shipping";
    if (!action) return "—";
    if (action.discountType === "percentage") return `${action.discountValue}% off${action.maxDiscountAmount ? ` (max ${formatVND(action.maxDiscountAmount)})` : ""}`;
    return `${formatVND(action.discountValue ?? 0)} off`;
  })();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/promotions" className="hover:text-secondary-700 transition-colors">Promotions</Link>
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
          <Link
            href="/promotions"
            className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Link>
          <Button variant="secondary" onClick={handleDuplicate} disabled={isBusy}>
            <DocumentDuplicateIcon className="w-4 h-4 mr-1.5" />
            Duplicate
          </Button>
          {canEdit && (
            <Button variant="secondary" onClick={() => router.push(`/promotions/${promotion.id}/edit`)} disabled={isBusy}>
              <PencilSquareIcon className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
          )}
          {canPause && (
            <Button variant="secondary" onClick={() => handleAction(() => pausePromotion(promotion.id), "Promotion paused.")} disabled={isBusy}>
              Pause
            </Button>
          )}
          {canResume && (
            <Button variant="primary" onClick={() => handleAction(() => activatePromotion(promotion.id), "Promotion activated.")} disabled={isBusy}>
              Resume
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" onClick={() => setShowCancelConfirm(true)} disabled={isBusy}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetaField label="ID"><span className="font-mono text-sm text-secondary-800">{promotion.id}</span></MetaField>
          <MetaField label="Type"><span className="text-sm text-secondary-800">{TYPE_LABELS[promotion.type]}</span></MetaField>
          <MetaField label="Stacking Policy"><span className="text-sm text-secondary-800">{STACKING_LABELS[promotion.stackingPolicy]}</span></MetaField>
          <MetaField label="Priority"><span className="font-mono text-sm text-secondary-800">{promotion.priority}</span></MetaField>
          <MetaField label="Discount / Action"><span className="text-sm font-medium text-primary-700">{actionSummary}</span></MetaField>
          <MetaField label="Scope">
            <div className="flex flex-wrap gap-1">
              {promotion.scopes.some((s) => s.scopeType === "global") ? (
                <span className="rounded-md bg-secondary-100 px-2 py-0.5 text-xs text-secondary-600">Global</span>
              ) : (
                promotion.scopes.map((s) => (
                  <span key={s.id} className="rounded-md bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
                    {s.scopeRefLabel ?? s.scopeRefId}
                  </span>
                ))
              )}
            </div>
          </MetaField>
          <MetaField label="Start Date"><span className="text-sm text-secondary-800">{formatDate(promotion.startDate)}</span></MetaField>
          <MetaField label="End Date"><span className="text-sm text-secondary-800">{formatDate(promotion.endDate)}</span></MetaField>
          <MetaField label="Created By"><span className="text-sm text-secondary-800">{promotion.createdBy}</span></MetaField>
          {promotion.description && (
            <div className="sm:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Description</p>
              <p className="mt-1 text-sm text-secondary-700">{promotion.description}</p>
            </div>
          )}
          {promotion.conditions.length > 0 && (
            <div className="sm:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400 mb-2">Conditions</p>
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
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Usage Statistics</h2>
        <div className="grid gap-6 sm:grid-cols-3 mb-5">
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary-900">{promotion.usageCount}</p>
            <p className="text-xs text-secondary-400 mt-1">Total Uses{promotion.totalUsageLimit ? ` / ${promotion.totalUsageLimit}` : ""}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-700">{formatVND(totalDiscountGiven)}</p>
            <p className="text-xs text-secondary-400 mt-1">Total Discount Given</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary-900">{uniqueCustomers}</p>
            <p className="text-xs text-secondary-400 mt-1">Unique Customers</p>
          </div>
        </div>
        {usagePct !== null && (
          <div>
            <div className="flex items-center justify-between text-xs text-secondary-500 mb-1">
              <span>Usage progress</span>
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
          <p className="text-sm text-secondary-400">No usage limit — unlimited uses.</p>
        )}
      </div>

      {/* Usage history table */}
      {usage.length > 0 && (
        <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
          <div className="border-b border-secondary-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-secondary-900">Applied Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary-50 text-left text-xs font-semibold uppercase tracking-wide text-secondary-500">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 text-right">Discount Applied</th>
                  <th className="px-4 py-3">Date</th>
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
            <h3 className="text-base font-semibold text-secondary-900">Cancel Promotion?</h3>
            <p className="mt-2 text-sm text-secondary-600">
              This will immediately end the promotion. Orders already placed keep their discounts. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCancelConfirm(false)}>Keep</Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowCancelConfirm(false);
                  handleAction(() => cancelPromotion(promotion.id), "Promotion cancelled.");
                }}
                isLoading={isBusy}
              >
                Cancel Promotion
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
