"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  PlusIcon,
  TagIcon,
  TicketIcon,
  Bars4Icon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";
import { PromotionsTable } from "./PromotionsTable";
import { RedemptionCatalogTable } from "./RedemptionCatalogTable";
import { RedemptionCatalogForm } from "./RedemptionCatalogForm";
import { EarnRulesTable } from "./EarnRulesTable";
import type { PromotionSummary } from "@/src/types/promotion.types";
import type { LoyaltyRedemptionCatalog, LoyaltyEarnRule } from "@/src/types/loyalty.types";
import {
  getRedemptionCatalog,
  updateRedemptionCatalogItem,
  deleteRedemptionCatalogItem,
  getEarnRules,
  updateEarnRule,
  deleteEarnRule,
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

  // ── Earn rules state ───────────────────────────────────────────────────────
  const [earnRules, setEarnRules] = useState<LoyaltyEarnRule[]>([]);

  // Load both on mount so badge counts are available immediately
  useEffect(() => {
    setCatalogLoading(true);
    getRedemptionCatalog().then((items) => {
      setCatalogItems(items);
      setCatalogLoading(false);
    });

    getEarnRules().then((rules) => {
      setEarnRules(rules);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Header content ─────────────────────────────────────────────────────────
  const headerTitle = isEarnRulesTab
    ? "Quy tắc tích điểm"
    : isRedemptionsTab
    ? "Các mục có thể đổi điểm thưởng"
    : isCouponsTab
    ? "Mã giảm giá"
    : "Khuyến mãi";

  const headerDesc = isEarnRulesTab
    ? "Cấu hình cách khách hàng tích điểm khi đặt hàng."
    : isRedemptionsTab
    ? "Cấu hình các mã giảm giá mà khách hàng có thể mở khóa bằng cách sử dụng điểm thưởng."
    : isCouponsTab
    ? "Quản lý mã giảm giá cho khách hàng."
    : "Quản lý các chiến dịch giảm giá tự động, gói sản phẩm, và bán hàng flash-sale.";

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
            {isCouponsTab ? "Tạo mã giảm giá" : "Tạo khuyến mãi"}
          </Link>
        )}

        {isRedemptionsTab && (
          <button
            type="button"
            onClick={() => { setEditingCatalog(undefined); setShowCatalogForm(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <PlusIcon className="w-4 h-4" />
            Thêm danh mục
          </button>
        )}

        {isEarnRulesTab && (
          <Link
            href="/promotions/earn-rules/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <PlusIcon className="w-4 h-4" />
            Thêm quy tắc
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
          Khuyến mãi
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
          Mã giảm giá
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
          <CircleStackIcon className="w-4 h-4" />
          Đổi thưởng
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
          <Bars4Icon className="w-4 h-4" />
          Quy tắc thưởng
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "earn-rules" ? "bg-primary-100 text-primary-700" : "bg-secondary-200 text-secondary-500"}`}>
            {earnRules.filter((r) => r.isActive).length}
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

      {/* ── Earn Rules ───────────────────────────────────────────────────────── */}
      {activeTab === "earn-rules" && (
        <EarnRulesTable
          items={earnRules}
          onDelete={async (id) => {
            setEarnRules((prev) => prev.filter((r) => r.id !== id));
            try {
              await deleteEarnRule(id);
              showToast("Earn rule deleted.", "success");
            } catch {
              // refetch on error
              getEarnRules().then(setEarnRules);
              showToast("Failed to delete.", "error");
            }
          }}
          onToggleActive={async (id, isActive) => {
            setEarnRules((prev) =>
              prev.map((r) => (r.id === id ? { ...r, isActive } : r))
            );
            try {
              await updateEarnRule(id, { isActive });
            } catch {
              setEarnRules((prev) =>
                prev.map((r) => (r.id === id ? { ...r, isActive: !isActive } : r))
              );
              showToast("Failed to update.", "error");
            }
          }}
        />
      )}
    </>
  );
}
