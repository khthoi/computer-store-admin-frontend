"use client";

import { ChevronDownIcon, ChevronUpIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { OrderReturnRequest, ReturnRequestStatus, ReturnRequestType } from "@/src/types/order.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrderReturnRequestsCardProps {
  requests: OrderReturnRequest[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ReturnRequestStatus, { label: string; variant: "default" | "warning" | "success" | "error" | "info" }> = {
  ChoDuyet:   { label: "Chờ duyệt",   variant: "warning" },
  DaDuyet:    { label: "Đã duyệt",    variant: "info"    },
  TuChoi:     { label: "Từ chối",     variant: "error"   },
  DangXuLy:   { label: "Đang xử lý", variant: "warning" },
  HoanThanh:  { label: "Hoàn thành", variant: "success" },
};

const TYPE_LABELS: Record<ReturnRequestType, string> = {
  DoiHang: "Đổi hàng",
  TraHang: "Trả hàng",
  BaoHanh: "Bảo hành",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderReturnRequestsCard({ requests }: OrderReturnRequestsCardProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  if (requests.length === 0) return null;

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100">
        <h3 className="text-sm font-semibold text-secondary-900">Yêu cầu đổi / trả</h3>
        <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-600">
          {requests.length}
        </span>
      </div>

      <div className="divide-y divide-secondary-50">
        {requests.map((req) => {
          const statusCfg  = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.ChoDuyet;
          const isExpanded = expanded.has(req.id);

          return (
            <div key={req.id} className="px-4 py-3 space-y-2">
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-semibold text-secondary-500">#{req.id}</span>
                  <span className="inline-flex items-center rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-medium text-secondary-600">
                    {TYPE_LABELS[req.requestType] ?? req.requestType}
                  </span>
                  <Badge variant={statusCfg.variant} size="sm" dot>{statusCfg.label}</Badge>
                </div>
                <button
                  type="button"
                  onClick={() => toggleExpand(req.id)}
                  className="shrink-0 rounded p-0.5 text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100"
                  aria-label={isExpanded ? "Thu gọn" : "Xem chi tiết"}
                >
                  {isExpanded
                    ? <ChevronUpIcon className="w-4 h-4" />
                    : <ChevronDownIcon className="w-4 h-4" />}
                </button>
              </div>

              {/* Reason + date */}
              <div className="flex items-center justify-between text-xs text-secondary-500">
                <Tooltip content={req.reason} placement="left" multiline maxWidth="400px">
                  <span className="truncate max-w-[180px] cursor-default">{req.reason}</span>
                </Tooltip>
                <span>{formatDate(req.createdAt)}</span>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="space-y-2 pt-1">
                  {req.description && (
                    <p className="text-xs text-secondary-600 bg-secondary-50 rounded-lg px-3 py-2">
                      {req.description}
                    </p>
                  )}

                  {req.items.length > 0 && (
                    <div className="rounded-lg border border-secondary-100 overflow-hidden">
                      <div className="bg-secondary-50 px-3 py-1.5 text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                        Sản phẩm yêu cầu
                      </div>
                      <ul className="divide-y divide-secondary-50">
                        {req.items.map((item) => {
                          const fullyRefunded = item.refundedQty >= item.requestedQty;
                          const partial       = item.refundedQty > 0 && !fullyRefunded;
                          return (
                            <li key={item.variantId} className="flex items-center gap-3 px-3 py-2">
                              {item.thumbnailUrl ? (
                                <img src={item.thumbnailUrl} alt={item.productName}
                                  className="h-8 w-8 rounded border border-secondary-100 object-cover shrink-0" />
                              ) : (
                                <div className="h-8 w-8 rounded border border-secondary-100 bg-secondary-50 shrink-0" aria-hidden="true" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-secondary-800 truncate">{item.productName}</p>
                                <p className="text-xs text-secondary-500">{item.variantName}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-semibold text-secondary-700">x{item.requestedQty}</p>
                                {fullyRefunded && (
                                  <Badge variant="success" size="sm">Đã hoàn đủ</Badge>
                                )}
                                {partial && (
                                  <Badge variant="warning" size="sm">Đã hoàn {item.refundedQty}/{item.requestedQty}</Badge>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {req.processedByName && (
                    <p className="text-xs text-secondary-400">
                      Xử lý bởi{" "}
                      {req.processedById ? (
                        <Link
                          href={`/employees/${req.processedById}`}
                          className="font-medium text-secondary-600 hover:text-primary-600 hover:underline"
                        >
                          {req.processedByName}
                        </Link>
                      ) : (
                        <span className="font-medium text-secondary-600">{req.processedByName}</span>
                      )}
                    </p>
                  )}

                  <Link
                    href={`/orders/returns/${req.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    Xem chi tiết phiếu
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
