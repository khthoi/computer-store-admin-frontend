"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusIcon, TagIcon, TicketIcon } from "@heroicons/react/24/outline";
import { PromotionsTable } from "./PromotionsTable";
import type { PromotionSummary } from "@/src/types/promotion.types";

interface Props {
  initialPromotions: PromotionSummary[];
}

export function PromotionsListClient({ initialPromotions }: Props) {
  const [activeTab, setActiveTab] = useState<"promotions" | "coupons">("promotions");

  const promoCount  = initialPromotions.filter((p) => !p.isCoupon).length;
  const couponCount = initialPromotions.filter((p) =>  p.isCoupon).length;

  const isCouponsTab = activeTab === "coupons";

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            {isCouponsTab ? "Coupons" : "Promotions"}
          </h1>
          <p className="mt-1 text-sm text-secondary-500">
            {isCouponsTab
              ? "Manage discount coupon codes for customers."
              : "Manage automatic discount campaigns, bundles, and flash sales."}
          </p>
        </div>
        <Link
          href={isCouponsTab ? "/promotions/coupons/new" : "/promotions/new"}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <PlusIcon className="w-4 h-4" />
          {isCouponsTab ? "New Coupon" : "New Promotion"}
        </Link>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-secondary-200 bg-secondary-50 p-1 w-fit">
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
      </div>

      {/* Table */}
      <PromotionsTable
        initialPromotions={initialPromotions}
        showCoupons={isCouponsTab}
      />
    </>
  );
}
