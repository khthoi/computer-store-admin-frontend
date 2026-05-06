"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  PlusIcon,
  TagIcon,
  TicketIcon,
  Bars4Icon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { PromotionsTable } from "./PromotionsTable";
import { RedemptionCatalogTable } from "./RedemptionCatalogTable";
import { RedemptionCatalogForm } from "./RedemptionCatalogForm";
import { EarnRulesTable } from "./EarnRulesTable";
import type { PromotionSummary } from "@/src/types/promotion.types";
import type { LoyaltyRedemptionCatalog } from "@/src/types/loyalty.types";
import { useToast } from "@/src/components/ui/Toast";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialPromos: PromotionSummary[];
  initialPromoTotal: number;
  initialCoupons: PromotionSummary[];
  initialCouponTotal: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionsListClient({ initialPromos, initialPromoTotal, initialCoupons, initialCouponTotal }: Props) {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"promotions" | "coupons" | "redemptions" | "earn-rules">(
    tabParam === "redemptions" ? "redemptions" :
    tabParam === "earn-rules"  ? "earn-rules"  :
    tabParam === "coupons"     ? "coupons"     : "promotions"
  );

  // ── Badge counts ──────────────────────────────────────────────────────────
  const [promoCount, setPromoCount]         = useState(initialPromoTotal);
  const [couponCount, setCouponCount]       = useState(initialCouponTotal);
  const [catalogTotal, setCatalogTotal]     = useState(0);
  const [earnActiveCount, setEarnActiveCount] = useState(0);

  const isCouponsTab     = activeTab === "coupons";
  const isRedemptionsTab = activeTab === "redemptions";
  const isEarnRulesTab   = activeTab === "earn-rules";

  // ── Redemption catalog modal state ────────────────────────────────────────
  const [editingCatalog, setEditingCatalog] = useState<LoyaltyRedemptionCatalog | undefined>(undefined);
  const [showCatalogForm, setShowCatalogForm] = useState(false);
  const [catalogReloadKey, setCatalogReloadKey] = useState(0);

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
            {catalogTotal}
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
            {earnActiveCount}
          </span>
        </button>
      </div>

      {/* ── Promotions / Coupons ─────────────────────────────────────────────── */}
      {activeTab === "promotions" && (
        <PromotionsTable
          key="promotions"
          initialPromotions={initialPromos}
          initialTotal={initialPromoTotal}
          showCoupons={false}
          onTotalChange={setPromoCount}
        />
      )}
      {activeTab === "coupons" && (
        <PromotionsTable
          key="coupons"
          initialPromotions={initialCoupons}
          initialTotal={initialCouponTotal}
          showCoupons={true}
          onTotalChange={setCouponCount}
        />
      )}

      {/* ── Redemption Catalog ───────────────────────────────────────────────── */}
      {activeTab === "redemptions" && (
        <>
          <RedemptionCatalogTable
            reloadTrigger={catalogReloadKey}
            onEdit={(item) => { setEditingCatalog(item); setShowCatalogForm(true); }}
            onTotalChange={setCatalogTotal}
          />

          {showCatalogForm && (
            <RedemptionCatalogForm
              item={editingCatalog}
              onClose={() => setShowCatalogForm(false)}
              onSaved={() => {
                setShowCatalogForm(false);
                showToast(editingCatalog ? "Updated." : "Created.", "success");
                setCatalogReloadKey((k) => k + 1);
              }}
            />
          )}
        </>
      )}

      {/* ── Earn Rules ───────────────────────────────────────────────────────── */}
      {activeTab === "earn-rules" && (
        <EarnRulesTable onTotalChange={setEarnActiveCount} />
      )}
    </>
  );
}
