"use client";

import Link from "next/link";
import { formatVND, formatDateTime } from "@/src/lib/format";
import type { Promotion, PromotionUsage } from "@/src/types/promotion.types";

interface Props {
  promotion: Promotion;
  initialUsage: PromotionUsage[];
}

export function PromotionUsageSection({ promotion, initialUsage }: Props) {
  const usage = initialUsage;

  const totalDiscountGiven = usage.reduce((s, u) => s + u.discountAmount, 0);
  const uniqueCustomers = new Set(usage.map((u) => u.customerId)).size;

  const usagePct =
    promotion.totalUsageLimit && promotion.totalUsageLimit > 0
      ? Math.min(100, Math.round((promotion.usageCount / promotion.totalUsageLimit) * 100))
      : null;

  return (
    <div className="space-y-4 px-6 pb-6">
      {/* Usage stats */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Thống kê sử dụng</h2>
        <div className="grid gap-6 sm:grid-cols-3 mb-5">
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary-900">{promotion.usageCount}</p>
            <p className="text-xs text-secondary-400 mt-1">
              Tổng lượt dùng{promotion.totalUsageLimit ? ` / ${promotion.totalUsageLimit}` : ""}
            </p>
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
    </div>
  );
}
