"use client";

import { useEffect, useState } from "react";
import {
  ClockIcon,
  TruckIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  StarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ActionItemCard } from "./ActionItemCard";
import { RequirePermission } from "@/src/components/admin/auth/RequirePermission";
import {
  DashboardActionItemsService,
  type DashboardActionItems,
} from "@/src/services/dashboard/action-items.service";

/**
 * Top-of-dashboard "việc cần làm" grid. Fetches `/admin/dashboard/action-items`,
 * which only includes fields the caller's permissions allow. Each card is
 * additionally wrapped in <RequirePermission> as defense-in-depth.
 *
 * Renders nothing (returns null) when no counters are returned — letting the
 * parent dashboard decide what empty state, if any, to show.
 */
export function ActionItemsGrid({
  onEmpty,
}: {
  onEmpty?: () => void;
}) {
  const [data, setData] = useState<DashboardActionItems | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    DashboardActionItemsService.get()
      .then((r) => { if (!cancelled) setData(r); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <p className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-600">
        Không thể tải danh sách việc cần làm: {error}
      </p>
    );
  }

  if (!data) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded-xl border border-slate-200 bg-slate-50"
          />
        ))}
      </div>
    );
  }

  const fieldCount = Object.keys(data).length;
  if (fieldCount === 0) {
    onEmpty?.();
    return null;
  }

  return (
    <section aria-labelledby="action-items-heading" className="mb-6">
      <h2
        id="action-items-heading"
        className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary-500"
      >
        Việc cần làm
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.pendingOrders !== undefined && (
          <RequirePermission permission="orders.read">
            <ActionItemCard
              title="Đơn chờ duyệt"
              count={data.pendingOrders}
              href="/orders?status=ChoTT"
              icon={<ClockIcon className="h-6 w-6" />}
              tone="warning"
            />
          </RequirePermission>
        )}

        {data.processingOrders !== undefined && (
          <RequirePermission permission="orders.read">
            <ActionItemCard
              title="Đơn đang xử lý"
              count={data.processingOrders}
              href="/orders?status=DongGoi"
              icon={<TruckIcon className="h-6 w-6" />}
              tone="info"
            />
          </RequirePermission>
        )}

        {data.pendingReturns !== undefined && (
          <RequirePermission permission="returns.read">
            <ActionItemCard
              title="Đổi/trả chờ duyệt"
              count={data.pendingReturns}
              href="/orders/returns?status=ChoDuyet"
              icon={<ArrowPathIcon className="h-6 w-6" />}
              tone="warning"
            />
          </RequirePermission>
        )}

        {data.openSupportTickets !== undefined && (
          <RequirePermission permission="support.read">
            <ActionItemCard
              title="Ticket hỗ trợ mở"
              count={data.openSupportTickets}
              href="/support"
              icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
              tone="info"
            />
          </RequirePermission>
        )}

        {data.openContactMessages !== undefined && (
          <RequirePermission permission="support.read">
            <ActionItemCard
              title="Liên hệ mới"
              count={data.openContactMessages}
              href="/contact-messages"
              icon={<EnvelopeIcon className="h-6 w-6" />}
              tone="info"
            />
          </RequirePermission>
        )}

        {data.pendingReviews !== undefined && (
          <RequirePermission permission="reviews.update">
            <ActionItemCard
              title="Đánh giá chờ duyệt"
              count={data.pendingReviews}
              href="/reviews?status=Pending"
              icon={<StarIcon className="h-6 w-6" />}
              tone="warning"
            />
          </RequirePermission>
        )}

        {data.lowStockCount !== undefined && (
          <RequirePermission permission="inventory.read">
            <ActionItemCard
              title="Tồn kho thấp"
              count={data.lowStockCount}
              href="/inventory/low-stock"
              icon={<ExclamationTriangleIcon className="h-6 w-6" />}
              tone="danger"
            />
          </RequirePermission>
        )}
      </div>
    </section>
  );
}
