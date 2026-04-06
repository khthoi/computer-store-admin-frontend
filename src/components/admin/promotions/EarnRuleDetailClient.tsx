"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
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
  first_order: "First Order",
  birthday:    "Birthday",
  manual:      "Manual",
};

// ─── Meta field ───────────────────────────────────────────────────────────────

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

// ─── Detail card ──────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-secondary-700 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EarnRuleDetailClient({ rule: initial }: { rule: LoyaltyEarnRule }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [rule, setRule] = useState(initial);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleToggleActive(isActive: boolean) {
    setRule((prev) => ({ ...prev, isActive }));
    try {
      const updated = await updateEarnRule(rule.id, { isActive });
      setRule(updated);
      showToast(isActive ? "Rule activated." : "Rule deactivated.", "success");
    } catch {
      setRule((prev) => ({ ...prev, isActive: !isActive }));
      showToast("Failed to update.", "error");
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    setDeleting(true);
    try {
      await deleteEarnRule(rule.id);
      showToast("Earn rule deleted.", "success");
      router.push("/promotions/earn-rules");
    } catch {
      showToast("Failed to delete.", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/promotions/earn-rules"
            className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <nav className="text-xs text-secondary-400 mb-0.5">
              <Link href="/promotions?tab=earn-rules" className="hover:text-secondary-600">Promos & Coupons</Link>
              {" / "}
              <Link href="/promotions/earn-rules" className="hover:text-secondary-600">Earn Rules</Link>
            </nav>
            <div className="flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-primary-500" />
              <h1 className="text-xl font-bold text-secondary-900">{rule.name}</h1>
              {rule.isActive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-50 border border-success-200 px-2 py-0.5 text-[10px] font-bold text-success-700">
                  <CheckCircleIcon className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 border border-secondary-200 px-2 py-0.5 text-[10px] font-bold text-secondary-500">
                  <XCircleIcon className="w-3 h-3" /> Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Toggle
            checked={rule.isActive}
            onChange={(e) => handleToggleActive(e.target.checked)}
            label={rule.isActive ? "Active" : "Inactive"}
            size="sm"
          />
          <Link href={`/promotions/earn-rules/${rule.id}/edit`}>
            <Button variant="outline" size="sm">
              <PencilSquareIcon className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className={confirmDelete ? "border-error-300 bg-error-50 text-error-700 hover:bg-error-100" : "text-secondary-500 hover:text-error-600 hover:border-error-300"}
          >
            <TrashIcon className="w-4 h-4 mr-1.5" />
            {confirmDelete ? "Confirm Delete?" : "Delete"}
          </Button>
        </div>
      </div>

      {/* ── Overview card ─────────────────────────────────────────────────── */}
      <Card title="Overview">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <MetaField label="Rule ID">
            <span className="font-mono text-sm text-secondary-700">{rule.id}</span>
          </MetaField>
          <MetaField label="Priority">
            <span className="text-sm font-semibold text-secondary-800">{rule.priority}</span>
          </MetaField>
          <MetaField label="Valid From">
            <span className="text-sm text-secondary-700">{formatDate(rule.validFrom)}</span>
          </MetaField>
          <MetaField label="Valid Until">
            <span className="text-sm text-secondary-700">{formatDate(rule.validUntil)}</span>
          </MetaField>
          <MetaField label="Created">
            <span className="text-sm text-secondary-500">{formatDate(rule.createdAt)}</span>
          </MetaField>
          <MetaField label="Last Updated">
            <span className="text-sm text-secondary-500">{formatDate(rule.updatedAt)}</span>
          </MetaField>
        </div>
        {rule.description && (
          <MetaField label="Description">
            <p className="text-sm text-secondary-600">{rule.description}</p>
          </MetaField>
        )}
      </Card>

      {/* ── Points Rate card ───────────────────────────────────────────────── */}
      <Card title="Points Rate">
        <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
          <p className="text-2xl font-bold text-primary-700">
            {rule.pointsPerUnit} pt
            <span className="text-base font-medium text-primary-500 ml-1">
              / {(rule.spendPerUnit / 1000).toFixed(0)}k VND
            </span>
          </p>
          <p className="text-sm text-primary-600 mt-1">
            {rule.pointsPerUnit} point{rule.pointsPerUnit !== 1 ? "s" : ""} earned per{" "}
            {formatVND(rule.spendPerUnit)} spent
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MetaField label="Min Order Value">
            <span className="text-sm text-secondary-700">
              {rule.minOrderValue != null ? formatVND(rule.minOrderValue) : <span className="text-secondary-400">No minimum</span>}
            </span>
          </MetaField>
          <MetaField label="Max Points / Order">
            <span className="text-sm text-secondary-700">
              {rule.maxPointsPerOrder != null ? (
                <>{rule.maxPointsPerOrder.toLocaleString("vi-VN")} pts</>
              ) : (
                <span className="text-secondary-400">Unlimited</span>
              )}
            </span>
          </MetaField>
        </div>
      </Card>

      {/* ── Fixed Bonus card ───────────────────────────────────────────────── */}
      <Card title="Fixed Bonus">
        {rule.bonusTrigger ? (
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-warning-50 border border-warning-200 px-4 py-3 text-sm">
              <p className="font-semibold text-warning-700">
                +{rule.bonusPoints?.toLocaleString("vi-VN")} pts
              </p>
              <p className="text-warning-600 text-xs mt-0.5">
                Trigger: {BONUS_LABELS[rule.bonusTrigger] ?? rule.bonusTrigger}
              </p>
            </div>
            <p className="text-sm text-secondary-500">
              {rule.bonusTrigger === "first_order" && "Awarded on the customer's very first order."}
              {rule.bonusTrigger === "birthday" && "Awarded during the customer's birthday month."}
              {rule.bonusTrigger === "manual" && "Awarded when manually triggered by an admin."}
            </p>
          </div>
        ) : (
          <p className="text-sm text-secondary-400">No fixed bonus configured.</p>
        )}
      </Card>

      {/* ── Scope Multipliers card ─────────────────────────────────────────── */}
      <Card title="Scope Multipliers">
        {rule.scopes.length === 0 ? (
          <p className="text-sm text-secondary-400">
            Global rule — applies to all products at base rate.
          </p>
        ) : (
          <div className="divide-y divide-secondary-100">
            {rule.scopes.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-secondary-800">{s.scopeRefLabel}</p>
                  <p className="text-xs text-secondary-400 capitalize">{s.scopeType}</p>
                </div>
                <span className="rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-sm font-bold text-primary-700">
                  {s.multiplier}×
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
