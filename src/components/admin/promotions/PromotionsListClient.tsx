"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  PlusIcon,
  TagIcon,
  TicketIcon,
  SparklesIcon,
  BoltIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { PromotionsTable } from "./PromotionsTable";
import { RedemptionCatalogTable } from "./RedemptionCatalogTable";
import { RedemptionCatalogForm } from "./RedemptionCatalogForm";
import type { PromotionSummary } from "@/src/types/promotion.types";
import type { LoyaltyRedemptionCatalog } from "@/src/types/loyalty.types";
import {
  getRedemptionCatalog,
  updateRedemptionCatalogItem,
  deleteRedemptionCatalogItem,
  getEarnRules,
} from "@/src/services/loyalty.service";
import { useToast } from "@/src/components/ui/Toast";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialPromotions: PromotionSummary[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionsListClient({ initialPromotions }: Props) {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"promotions" | "coupons" | "redemptions" | "earn-rules">(
    tabParam === "redemptions" ? "redemptions" :
    tabParam === "earn-rules"  ? "earn-rules"  :
    tabParam === "coupons"     ? "coupons"     : "promotions"
  );

  const promoCount  = initialPromotions.filter((p) => !p.isCoupon).length;
  const couponCount = initialPromotions.filter((p) =>  p.isCoupon).length;

  const isCouponsTab     = activeTab === "coupons";
  const isRedemptionsTab = activeTab === "redemptions";
  const isEarnRulesTab   = activeTab === "earn-rules";

  // ── Redemption catalog state ───────────────────────────────────────────────
  const [catalogItems, setCatalogItems] = useState<LoyaltyRedemptionCatalog[]>([]);
  const [editingCatalog, setEditingCatalog] = useState<LoyaltyRedemptionCatalog | undefined>(undefined);
  const [showCatalogForm, setShowCatalogForm] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // ── Earn rules badge count ─────────────────────────────────────────────────
  const [earnRulesActiveCount, setEarnRulesActiveCount] = useState(0);

  // Load both on mount so badge counts are available immediately
  useEffect(() => {
    setCatalogLoading(true);
    getRedemptionCatalog().then((items) => {
      setCatalogItems(items);
      setCatalogLoading(false);
    });

    getEarnRules().then((rules) => {
      setEarnRulesActiveCount(rules.filter((r) => r.isActive).length);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Header content ─────────────────────────────────────────────────────────
  const headerTitle = isEarnRulesTab
    ? "Loyalty Earn Rules"
    : isRedemptionsTab
    ? "Point Redemption Catalog"
    : isCouponsTab
    ? "Coupons"
    : "Promotions";

  const headerDesc = isEarnRulesTab
    ? "Configure how customers earn loyalty points when they place orders."
    : isRedemptionsTab
    ? "Configure which coupons customers can unlock by spending loyalty points."
    : isCouponsTab
    ? "Manage discount coupon codes for customers."
    : "Manage automatic discount campaigns, bundles, and flash sales.";

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{headerTitle}</h1>
          <p className="mt-1 text-sm text-secondary-500">{headerDesc}</p>
        </div>

        {!isRedemptionsTab && !isEarnRulesTab && (
          <Link
            href={isCouponsTab ? "/promotions/coupons/new" : "/promotions/new"}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <PlusIcon className="w-4 h-4" />
            {isCouponsTab ? "New Coupon" : "New Promotion"}
          </Link>
        )}

        {isRedemptionsTab && (
          <button
            type="button"
            onClick={() => { setEditingCatalog(undefined); setShowCatalogForm(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <PlusIcon className="w-4 h-4" />
            New Redemption Item
          </button>
        )}

        {isEarnRulesTab && (
          <Link
            href="/promotions/earn-rules"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            Manage Earn Rules
          </Link>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-secondary-200 bg-secondary-50 p-1 w-fit">
        {/* Promotions */}
        <button
          type="button"
          onClick={() => setActiveTab("promotions")}
          className={[
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "promotions"
              ? "bg-white text-secondary-900 shadow-sm"
              : "text-secondary-500 hover:text-secondary-700",
          ].join(" ")}
        >
          <TagIcon className="w-4 h-4" />
          Promotions
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "promotions" ? "bg-primary-100 text-primary-700" : "bg-secondary-200 text-secondary-500"}`}>
            {promoCount}
          </span>
        </button>

        {/* Coupons */}
        <button
          type="button"
          onClick={() => setActiveTab("coupons")}
          className={[
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "coupons"
              ? "bg-white text-secondary-900 shadow-sm"
              : "text-secondary-500 hover:text-secondary-700",
          ].join(" ")}
        >
          <TicketIcon className="w-4 h-4" />
          Coupons
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "coupons" ? "bg-primary-100 text-primary-700" : "bg-secondary-200 text-secondary-500"}`}>
            {couponCount}
          </span>
        </button>

        {/* Redemptions */}
        <button
          type="button"
          onClick={() => setActiveTab("redemptions")}
          className={[
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "redemptions"
              ? "bg-white text-secondary-900 shadow-sm"
              : "text-secondary-500 hover:text-secondary-700",
          ].join(" ")}
        >
          <SparklesIcon className="w-4 h-4" />
          Redemptions
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "redemptions" ? "bg-primary-100 text-primary-700" : "bg-secondary-200 text-secondary-500"}`}>
            {catalogItems.length}
          </span>
        </button>

        {/* Earn Rules */}
        <button
          type="button"
          onClick={() => setActiveTab("earn-rules")}
          className={[
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "earn-rules"
              ? "bg-white text-secondary-900 shadow-sm"
              : "text-secondary-500 hover:text-secondary-700",
          ].join(" ")}
        >
          <BoltIcon className="w-4 h-4" />
          Earn Rules
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "earn-rules" ? "bg-primary-100 text-primary-700" : "bg-secondary-200 text-secondary-500"}`}>
            {earnRulesActiveCount}
          </span>
        </button>
      </div>

      {/* ── Promotions / Coupons ─────────────────────────────────────────────── */}
      {(activeTab === "promotions" || activeTab === "coupons") && (
        <PromotionsTable
          initialPromotions={initialPromotions}
          showCoupons={isCouponsTab}
        />
      )}

      {/* ── Redemption Catalog ───────────────────────────────────────────────── */}
      {activeTab === "redemptions" && (
        <>
          {catalogLoading ? (
            <div className="animate-pulse space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded bg-secondary-100" />
              ))}
            </div>
          ) : (
            <RedemptionCatalogTable
              initialItems={catalogItems}
              onEdit={(item) => { setEditingCatalog(item); setShowCatalogForm(true); }}
              onDelete={async (id) => {
                await deleteRedemptionCatalogItem(id);
                setCatalogItems((prev) => prev.filter((i) => i.id !== id));
                showToast("Deleted.", "success");
              }}
              onToggleActive={async (id, isActive) => {
                setCatalogItems((prev) =>
                  prev.map((i) => (i.id === id ? { ...i, isActive } : i))
                );
                try {
                  await updateRedemptionCatalogItem(id, { isActive });
                } catch {
                  setCatalogItems((prev) =>
                    prev.map((i) => (i.id === id ? { ...i, isActive: !isActive } : i))
                  );
                  showToast("Failed to update.", "error");
                }
              }}
            />
          )}

          {showCatalogForm && (
            <RedemptionCatalogForm
              item={editingCatalog}
              onClose={() => setShowCatalogForm(false)}
              onSaved={(saved) => {
                setCatalogItems((prev) =>
                  editingCatalog
                    ? prev.map((i) => (i.id === saved.id ? saved : i))
                    : [...prev, saved]
                );
                setShowCatalogForm(false);
                showToast(editingCatalog ? "Updated." : "Created.", "success");
              }}
            />
          )}
        </>
      )}

      {/* ── Earn Rules — link-out card ────────────────────────────────────────── */}
      {activeTab === "earn-rules" && (
        <div className="rounded-2xl border-2 border-dashed border-secondary-200 bg-secondary-50 p-10 flex flex-col items-center text-center gap-4">
          <div className="rounded-2xl bg-primary-50 p-4">
            <BoltIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-secondary-800">
              Earn Rules are managed on a dedicated page
            </h3>
            <p className="mt-1 text-sm text-secondary-500 max-w-sm">
              Configure point earn rates, scope multipliers, and bonuses from the Earn Rules management page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/promotions/earn-rules"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <BoltIcon className="w-4 h-4" />
              Go to Earn Rules
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/promotions/earn-rules/new"
              className="inline-flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-5 py-2.5 text-sm font-semibold text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              <PlusIcon className="w-4 h-4" />
              New Earn Rule
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
