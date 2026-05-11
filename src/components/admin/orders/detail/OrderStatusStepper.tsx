"use client";

import { useState } from "react";
import { ArrowPathIcon, CheckIcon } from "@heroicons/react/24/outline";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { Alert } from "@/src/components/ui/Alert";
import type { OrderActivityEntry, OrderActivityStatus, OrderStatus } from "@/src/types/order.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAIN_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

// Maps each main OrderStatus to the OrderActivityStatus values that represent it
// (processing covers multiple granular sub-steps)
const ORDER_STATUS_TO_ACTIVITY: Record<OrderStatus, OrderActivityStatus[]> = {
  pending:    ["ChoXuLy"],
  confirmed:  ["DaXacNhan"],
  processing: ["DangXuLy", "DangChuanBiHang", "ChuanBiBanGiao"],
  shipped:    ["DangGiao"],
  delivered:  ["DaGiao"],
  cancelled:  [],
  returned:   [],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   "Chờ xử lý",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipped:   "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  returned:  "Đã hoàn trả",
};


// ─── Props ────────────────────────────────────────────────────────────────────

interface OrderStatusStepperProps {
  currentStatus: OrderStatus;
  activityLog: OrderActivityEntry[];
  onStatusChange: (newStatus: OrderStatus) => void;
  isSaving?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderStatusStepper({
  currentStatus,
  activityLog,
  onStatusChange,
  isSaving = false,
}: OrderStatusStepperProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isBranched = currentStatus === "cancelled" || currentStatus === "returned";
  const currentMainIdx = MAIN_FLOW.indexOf(currentStatus);
  const nextStatus: OrderStatus | null =
    !isBranched && currentMainIdx >= 0 && currentMainIdx < MAIN_FLOW.length - 1
      ? MAIN_FLOW[currentMainIdx + 1]
      : null;

  function getTimestampForStatus(status: OrderStatus): string | undefined {
    const activityValues = ORDER_STATUS_TO_ACTIVITY[status];
    return activityLog.find((e) => e.orderStatus && activityValues.includes(e.orderStatus))?.timestamp;
  }

  function getStepState(step: OrderStatus): "completed" | "current" | "future" {
    if (isBranched) {
      const activityValues = ORDER_STATUS_TO_ACTIVITY[step];
      return activityLog.some((e) => e.orderStatus && activityValues.includes(e.orderStatus))
        ? "completed"
        : "future";
    }
    const stepIdx = MAIN_FLOW.indexOf(step);
    if (stepIdx < currentMainIdx) return "completed";
    if (stepIdx === currentMainIdx) return "current";
    return "future";
  }

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-secondary-900 mb-4">Trạng thái đơn hàng</h3>

      {/* Branched state alert */}
      {isBranched && (
        <div className="mb-4">
          <Alert
            variant={currentStatus === "cancelled" ? "error" : "warning"}
            title={STATUS_LABELS[currentStatus]}
          >
            {currentStatus === "cancelled"
              ? "Đơn hàng này đã bị hủy và không thể xử lý thêm."
              : "Đơn hàng này đã được yêu cầu hoàn trả."}
          </Alert>
        </div>
      )}

      {/* Horizontal stepper — always visible */}
      <div className="relative flex items-start justify-between">
        {/* Connecting lines */}
        <div
          className="absolute top-4 left-0 right-0 h-0.5 bg-secondary-200"
          aria-hidden="true"
        />

        {MAIN_FLOW.map((step, idx) => {
          const state = getStepState(step);
          const timestamp = getTimestampForStatus(step);

          return (
            <div
              key={step}
              className="relative flex flex-col items-center gap-1.5"
              style={{ flex: 1 }}
            >
              {/* Step circle */}
              <div
                aria-current={state === "current" ? "step" : undefined}
                className={[
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors text-xs font-semibold",
                  state === "completed"
                    ? "bg-success-600 text-white"
                    : state === "current"
                    ? "bg-primary-600 text-white ring-4 ring-primary-200"
                    : "bg-secondary-100 text-secondary-400",
                ].join(" ")}
              >
                {state === "completed" ? (
                  <CheckIcon className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={[
                  "text-center text-xs leading-tight px-0.5",
                  state === "current"
                    ? "font-semibold text-primary-700"
                    : state === "completed"
                    ? "text-success-700"
                    : "text-secondary-400",
                ].join(" ")}
              >
                {STATUS_LABELS[step]}
              </span>

              {/* Timestamp */}
              {timestamp && (
                <span className="text-center text-[10px] text-secondary-400 px-0.5 leading-tight">
                  {new Date(timestamp).toLocaleString("vi-VN", {
                    hour: "2-digit", minute: "2-digit",
                    day: "2-digit", month: "2-digit", year: "numeric",
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Next status button — hidden when branched */}
      {nextStatus && (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
          >
            {isSaving && (
              <ArrowPathIcon className="w-4 h-4 animate-spin" aria-hidden="true" />
            )}
            Chuyển sang: {STATUS_LABELS[nextStatus]}
          </button>
        </div>
      )}

      {/* Confirm dialog */}
      {nextStatus && (
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            onStatusChange(nextStatus);
          }}
          title="Xác nhận chuyển trạng thái"
          description={`Bạn có chắc muốn chuyển đơn hàng sang trạng thái "${STATUS_LABELS[nextStatus]}"?`}
          confirmLabel="Xác nhận"
          cancelLabel="Hủy"
          variant="info"
          isConfirming={isSaving}
        />
      )}
    </div>
  );
}
