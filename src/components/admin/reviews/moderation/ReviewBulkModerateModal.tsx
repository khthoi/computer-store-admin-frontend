"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { Modal }       from "@/src/components/ui/Modal";
import { Button }      from "@/src/components/ui/Button";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { StarRating }  from "@/src/components/ui/StarRating";
import type { ReviewSummary } from "@/src/types/review.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase      = "confirm" | "processing" | "result";
type ItemStatus = "pending" | "processing" | "success" | "failed";
type ResultFilter = "all" | "success" | "failed";

interface ReviewItem {
  reviewId:     number;
  tieuDe?:      string;
  khachHangTen: string;
  rating:       ReviewSummary["rating"];
  status:       ItemStatus;
}

export interface ReviewBulkModerateModalProps {
  isOpen:           boolean;
  onClose:          () => void;
  action:           "approve" | "reject";
  reviewIds:        number[];
  reviewSummaries:  Array<Pick<ReviewSummary, "reviewId" | "tieuDe" | "khachHangTen" | "rating">>;
  onModerateOne:    (reviewId: number, lyDo?: string) => Promise<void>;
  onDone:           (result: { successIds: number[]; failedIds: number[]; action: string }) => void;
}

// ─── Phase title ──────────────────────────────────────────────────────────────

const PHASE_TITLE: Record<Phase, (n: number, a: string) => string> = {
  confirm:    (n, a) => `${a === "approve" ? "Duyệt" : "Từ chối"} ${n} đánh giá`,
  processing: (_, a) => `Đang ${a === "approve" ? "duyệt" : "từ chối"}...`,
  result:     ()     => "Kết quả xử lý",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewBulkModerateModal({
  isOpen,
  onClose,
  action,
  reviewIds,
  reviewSummaries,
  onModerateOne,
  onDone,
}: ReviewBulkModerateModalProps) {
  function buildItems(): ReviewItem[] {
    return reviewIds.map((id) => {
      const s = reviewSummaries.find((r) => r.reviewId === id);
      return {
        reviewId:     id,
        tieuDe:       s?.tieuDe,
        khachHangTen: s?.khachHangTen ?? `#${id}`,
        rating:       s?.rating ?? 3,
        status:       "pending",
      };
    });
  }

  const [phase,        setPhase]        = useState<Phase>("confirm");
  const [lyDo,         setLyDo]         = useState("");
  const [lyDoError,    setLyDoError]    = useState("");
  const [items,        setItems]        = useState<ReviewItem[]>(buildItems);
  const [progress,     setProgress]     = useState(0);
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const processingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    setPhase("confirm");
    setLyDo("");
    setLyDoError("");
    setItems(reviewIds.map((id) => {
      const s = reviewSummaries.find((r) => r.reviewId === id);
      return {
        reviewId: id,
        tieuDe: s?.tieuDe,
        khachHangTen: s?.khachHangTen ?? `#${id}`,
        rating: s?.rating ?? 3,
        status: "pending",
      };
    }));
    setProgress(0);
    setResultFilter("all");
    processingRef.current = false;
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const total      = items.length;
  const successCnt = items.filter((i) => i.status === "success").length;
  const failedCnt  = items.filter((i) => i.status === "failed").length;

  const filteredItems = items.filter((i) => {
    if (resultFilter === "success") return i.status === "success";
    if (resultFilter === "failed")  return i.status === "failed";
    return true;
  });

  async function handleStart() {
    if (processingRef.current) return;
    if (action === "reject" && lyDo.trim().length < 10) {
      setLyDoError("Lý do từ chối phải có ít nhất 10 ký tự.");
      return;
    }

    processingRef.current = true;
    const freshItems = buildItems();
    setItems(freshItems);
    setProgress(0);
    setPhase("processing");

    const successIds: number[] = [];
    const failedIds:  number[] = [];

    for (let i = 0; i < freshItems.length; i++) {
      const item = freshItems[i];

      setItems((prev) =>
        prev.map((it, idx) => idx === i ? { ...it, status: "processing" } : it)
      );

      try {
        await onModerateOne(item.reviewId, action === "reject" ? lyDo.trim() : undefined);
        successIds.push(item.reviewId);
        setItems((prev) =>
          prev.map((it, idx) => idx === i ? { ...it, status: "success" } : it)
        );
      } catch {
        failedIds.push(item.reviewId);
        setItems((prev) =>
          prev.map((it, idx) => idx === i ? { ...it, status: "failed" } : it)
        );
      }

      setProgress(i + 1);
    }

    processingRef.current = false;
    setPhase("result");
    onDone({ successIds, failedIds, action });
  }

  function handleClose() {
    if (phase === "processing") return;
    setPhase("confirm");
    setLyDo("");
    setLyDoError("");
    setItems(buildItems());
    setProgress(0);
    setResultFilter("all");
    onClose();
  }

  const progressVariant =
    phase === "result"
      ? failedCnt === 0
        ? "success"
        : failedCnt === total
          ? "error"
          : "warning"
      : "default";

  const actionLabel = action === "approve" ? "Duyệt" : "Từ chối";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={PHASE_TITLE[phase](total, action)}
      size="lg"
      closeOnBackdrop={phase !== "processing"}
      closeOnEscape={phase !== "processing"}
      hideCloseButton={phase === "processing"}
      footer={
        phase === "processing" ? (
          <div className="flex items-center justify-center py-1">
            <span className="text-xs text-secondary-400 italic">
              Đang xử lý, vui lòng không đóng cửa sổ này…
            </span>
          </div>
        ) : phase === "result" ? (
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={handleClose}>Đóng</Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={handleClose}>Huỷ</Button>
            <Button
              variant={action === "approve" ? "primary" : "danger"}
              size="sm"
              onClick={handleStart}
              disabled={action === "reject" && lyDo.trim().length === 0}
            >
              {actionLabel} {total} đánh giá →
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-4 py-1">

        {/* ── PHASE: confirm ─────────────────────────────────────────────── */}
        {phase === "confirm" && (
          <>
            {/* Lý do từ chối */}
            {action === "reject" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-secondary-700">
                  Lý do từ chối <span className="text-red-500">*</span>
                  <span className="text-secondary-400 font-normal ml-1">(áp dụng cho tất cả)</span>
                </label>
                <textarea
                  rows={3}
                  value={lyDo}
                  onChange={(e) => { setLyDo(e.target.value); setLyDoError(""); }}
                  placeholder="Nhập lý do từ chối (tối thiểu 10 ký tự)..."
                  className={[
                    "w-full resize-none rounded-xl px-3 py-2.5 text-sm text-secondary-800",
                    "border focus:outline-none focus:ring-2 focus:ring-primary-500/20",
                    lyDoError
                      ? "border-red-400 focus:border-red-400"
                      : "border-secondary-200 focus:border-primary-400",
                  ].join(" ")}
                />
                {lyDoError && <p className="text-xs text-red-500">{lyDoError}</p>}
              </div>
            )}

            {/* Preview list */}
            <div>
              <p className="text-xs font-medium text-secondary-500 mb-2">
                Danh sách đánh giá ({total})
              </p>
              <div className="max-h-52 overflow-y-auto rounded-xl border border-secondary-100 divide-y divide-secondary-50">
                {items.map((it) => (
                  <ReviewRow key={it.reviewId} item={it} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── PHASE: processing ──────────────────────────────────────────── */}
        {phase === "processing" && (
          <>
            <ProgressBar
              value={progress}
              max={total}
              showValue
              showCount
              label={`Đang ${action === "approve" ? "duyệt" : "từ chối"} đánh giá...`}
              caption={
                progress < total
                  ? `Đang xử lý: ${items[progress]?.khachHangTen ?? ""}…`
                  : "Hoàn tất, đang tổng hợp kết quả..."
              }
              animated
            />
            <div className="max-h-64 overflow-y-auto rounded-xl border border-secondary-100 divide-y divide-secondary-50">
              {items.map((it) => (
                <ReviewRow key={it.reviewId} item={it} />
              ))}
            </div>
          </>
        )}

        {/* ── PHASE: result ──────────────────────────────────────────────── */}
        {phase === "result" && (
          <>
            <ProgressBar
              value={successCnt}
              max={total}
              showValue
              showCount={false}
              variant={progressVariant}
              size="sm"
              animated={false}
            />

            <div className="flex items-center gap-3">
              <SummaryChip
                icon={<CheckCircleSolid className="w-4 h-4 text-green-500" />}
                label="Thành công"
                count={successCnt}
                colorClass="text-green-700 bg-green-50 border-green-100"
              />
              {failedCnt > 0 && (
                <SummaryChip
                  icon={<XCircleIcon className="w-4 h-4 text-red-500" />}
                  label="Thất bại"
                  count={failedCnt}
                  colorClass="text-red-700 bg-red-50 border-red-100"
                />
              )}
            </div>

            {failedCnt > 0 && (
              <div className="flex items-center gap-1 border-b border-secondary-100 pb-0">
                {(["all", "success", "failed"] as ResultFilter[]).map((f) => {
                  const labels: Record<ResultFilter, string> = {
                    all:     `Tất cả (${total})`,
                    success: `Thành công (${successCnt})`,
                    failed:  `Thất bại (${failedCnt})`,
                  };
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setResultFilter(f)}
                      className={[
                        "px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors",
                        resultFilter === f
                          ? f === "failed"
                            ? "border-red-500 text-red-600"
                            : "border-primary-500 text-primary-700"
                          : "border-transparent text-secondary-500 hover:text-secondary-700",
                      ].join(" ")}
                    >
                      {labels[f]}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="max-h-64 overflow-y-auto rounded-xl border border-secondary-100 divide-y divide-secondary-50">
              {filteredItems.map((it) => (
                <ReviewRow key={it.reviewId} item={it} />
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── ReviewRow ────────────────────────────────────────────────────────────────

function ReviewRow({ item }: { item: ReviewItem }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <StatusIcon status={item.status} />
      <StarRating value={item.rating} size="sm" />
      <div className="flex-1 min-w-0">
        {item.tieuDe ? (
          <span className="text-sm text-secondary-700 truncate block">{item.tieuDe}</span>
        ) : (
          <span className="text-xs text-secondary-400">#{item.reviewId}</span>
        )}
        <span className="text-xs text-secondary-400">{item.khachHangTen}</span>
      </div>
      {item.status !== "pending" && item.status !== "processing" && (
        <span
          className={[
            "text-xs shrink-0 font-medium",
            item.status === "success" ? "text-green-600" : "text-red-500",
          ].join(" ")}
        >
          {item.status === "success" ? "Thành công" : "Thất bại"}
        </span>
      )}
    </div>
  );
}

// ─── StatusIcon ───────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: ItemStatus }) {
  switch (status) {
    case "success":
      return <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />;
    case "failed":
      return <XCircleIcon className="w-4 h-4 text-red-500 shrink-0" />;
    case "processing":
      return <ArrowPathIcon className="w-4 h-4 text-primary-500 shrink-0 animate-spin" />;
    default:
      return <ClockIcon className="w-4 h-4 text-secondary-300 shrink-0" />;
  }
}

// ─── SummaryChip ──────────────────────────────────────────────────────────────

function SummaryChip({
  icon,
  label,
  count,
  colorClass,
}: {
  icon:       React.ReactNode;
  label:      string;
  count:      number;
  colorClass: string;
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium",
        colorClass,
      ].join(" ")}
    >
      {icon}
      <span className="font-bold text-sm">{count}</span>
      {label}
    </div>
  );
}
