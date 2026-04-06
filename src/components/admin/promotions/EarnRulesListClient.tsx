"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusIcon, BoltIcon } from "@heroicons/react/24/outline";
import { EarnRulesTable } from "./EarnRulesTable";
import { useToast } from "@/src/components/ui/Toast";
import { deleteEarnRule, updateEarnRule } from "@/src/services/loyalty.service";
import type { LoyaltyEarnRule } from "@/src/types/loyalty.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialRules: LoyaltyEarnRule[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EarnRulesListClient({ initialRules }: Props) {
  const { showToast } = useToast();
  const [rules, setRules] = useState<LoyaltyEarnRule[]>(initialRules);

  const activeCount = rules.filter((r) => r.isActive).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="text-xs text-secondary-400 mb-1">
            <Link href="/promotions" className="hover:text-secondary-600">Promos & Coupons</Link>
            {" / "}
            <span className="text-secondary-600">Earn Rules</span>
          </nav>
          <div className="flex items-center gap-2">
            <BoltIcon className="w-6 h-6 text-primary-500" />
            <h1 className="text-2xl font-bold text-secondary-900">Loyalty Earn Rules</h1>
          </div>
          <p className="mt-1 text-sm text-secondary-500">
            Configure how customers earn points when they place orders.{" "}
            <span className="font-medium text-secondary-700">
              {activeCount} of {rules.length} rule{rules.length !== 1 ? "s" : ""} active.
            </span>
          </p>
        </div>
        <Link
          href="/promotions/earn-rules/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <PlusIcon className="w-4 h-4" />
          New Earn Rule
        </Link>
      </div>

      {/* Table */}
      <EarnRulesTable
        items={rules}
        onEdit={(item) => {
          // Navigate is handled via Link in the table rows
          void item;
        }}
        onDelete={async (id) => {
          await deleteEarnRule(id);
          setRules((prev) => prev.filter((r) => r.id !== id));
          showToast("Earn rule deleted.", "success");
        }}
        onToggleActive={async (id, isActive) => {
          setRules((prev) =>
            prev.map((r) => (r.id === id ? { ...r, isActive } : r))
          );
          try {
            await updateEarnRule(id, { isActive });
          } catch {
            setRules((prev) =>
              prev.map((r) => (r.id === id ? { ...r, isActive: !isActive } : r))
            );
            showToast("Failed to update.", "error");
          }
        }}
      />
    </div>
  );
}
