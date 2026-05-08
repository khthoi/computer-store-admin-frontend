"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { Modal }       from "@/src/components/ui/Modal";
import { Button }      from "@/src/components/ui/Button";
import { Select }      from "@/src/components/ui/Select";
import { ProgressBar } from "@/src/components/ui/ProgressBar";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "confirm" | "processing" | "result";

type ItemStatus = "pending" | "processing" | "success" | "failed";

interface TicketItem {
  ticketId: string;
  maTicket: string;
  tieuDe:   string;
  status:   ItemStatus;
}

type ResultFilter = "all" | "success" | "failed";

interface StaffOption {
  value:            string;
  label:            string;
  email?:           string;
  phone?:           string;
  openTicketCount?: number;
}

export interface TicketBrief {
  ticketId: string;
  maTicket: string;
  tieuDe:   string;
}

export interface AssignResult {
  successIds: string[];
  failedIds:  string[];
  staffName:  string;
}

export interface TicketAssignModalProps {
  isOpen:           boolean;
  onClose:          () => void;
  /** Called for each ticket individually — throw to mark that ticket as failed */
  onAssignOne:      (ticketId: string, staffId: string) => Promise<void>;
  /** Called once when all tickets have been processed */
  onDone:           (result: AssignResult) => void;
  ticketIds:        string[];
  /** Optional rich info per ticket; falls back to plain IDs */
  ticketSummaries?: TicketBrief[];
  staffOptions:     StaffOption[];
}

// ─── PHASE TITLE MAP ──────────────────────────────────────────────────────────

const PHASE_TITLE: Record<Phase, (n: number) => string> = {
  confirm:    (n) => `Phân công ${n} phiếu`,
  processing: ()  => "Đang phân công...",
  result:     ()  => "Kết quả phân công",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TicketAssignModal — 3-phase bulk-assign flow:
 *
 * 1. **Confirm** — pick staff, preview ticket list
 * 2. **Processing** — progress bar + per-ticket status stream
 * 3. **Result** — success / failed breakdown, filterable list
 */
export function TicketAssignModal({
  isOpen,
  onClose,
  onAssignOne,
  onDone,
  ticketIds,
  ticketSummaries = [],
  staffOptions,
}: TicketAssignModalProps) {
  // ── Per-ticket items ───────────────────────────────────────────────────────
  function buildItems(): TicketItem[] {
    return ticketIds.map((id) => {
      const summary = ticketSummaries.find((s) => s.ticketId === id);
      return {
        ticketId: id,
        maTicket: summary?.maTicket ?? `#${id}`,
        tieuDe:   summary?.tieuDe   ?? "—",
        status:   "pending",
      };
    });
  }

  // ── State ──────────────────────────────────────────────────────────────────
  const [phase,           setPhase]           = useState<Phase>("confirm");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [items,           setItems]           = useState<TicketItem[]>(buildItems);
  const [progress,        setProgress]        = useState(0);
  const [resultFilter,    setResultFilter]    = useState<ResultFilter>("all");

  // Reset all state every time the modal opens with a fresh selection
  useEffect(() => {
    if (!isOpen) return;
    setPhase("confirm");
    setSelectedStaffId("");
    setItems(ticketIds.map((id) => {
      const s = ticketSummaries.find((s) => s.ticketId === id);
      return { ticketId: id, maTicket: s?.maTicket ?? `#${id}`, tieuDe: s?.tieuDe ?? "—", status: "pending" };
    }));
    setProgress(0);
    setResultFilter("all");
    processingRef.current = false;
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent double-trigger
  const processingRef = useRef(false);

  const selectedStaff   = staffOptions.find((s) => s.value === selectedStaffId);
  const enrichedOptions = staffOptions.map((s) => ({
    value:       s.value,
    label:       s.label,
    subLabel:    s.email,
    description: s.phone,
    badge:       s.openTicketCount !== undefined
      ? { text: `${s.openTicketCount} phiếu đang mở`, variant: s.openTicketCount > 0 ? "warning" as const : "default" as const }
      : undefined,
  }));

  const total      = items.length;
  const successCnt = items.filter((i) => i.status === "success").length;
  const failedCnt  = items.filter((i) => i.status === "failed").length;

  const filteredItems = items.filter((i) => {
    if (resultFilter === "success") return i.status === "success";
    if (resultFilter === "failed")  return i.status === "failed";
    return true;
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleStartAssign() {
    if (!selectedStaffId || !selectedStaff || processingRef.current) return;
    processingRef.current = true;

    const freshItems = buildItems();
    setItems(freshItems);
    setProgress(0);
    setPhase("processing");

    const successIds: string[] = [];
    const failedIds:  string[] = [];

    for (let i = 0; i < freshItems.length; i++) {
      const ticket = freshItems[i];

      // Mark current ticket as processing
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === i ? { ...it, status: "processing" } : it
        )
      );

      try {
        await onAssignOne(ticket.ticketId, selectedStaffId);
        successIds.push(ticket.ticketId);
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, status: "success" } : it
          )
        );
      } catch {
        failedIds.push(ticket.ticketId);
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, status: "failed" } : it
          )
        );
      }

      setProgress(i + 1);
    }

    processingRef.current = false;
    setPhase("result");
    onDone({ successIds, failedIds, staffName: selectedStaff.label });
  }

  function handleClose() {
    if (phase === "processing") return; // block close mid-process
    // Reset all state for next open
    setPhase("confirm");
    setSelectedStaffId("");
    setItems(buildItems());
    setProgress(0);
    setResultFilter("all");
    onClose();
  }

  // ── Derive ProgressBar variant ────────────────────────────────────────────
  const progressVariant =
    phase === "result"
      ? failedCnt === 0
        ? "success"
        : failedCnt === total
          ? "error"
          : "warning"
      : "default";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={PHASE_TITLE[phase](total)}
      size="lg"
      closeOnBackdrop={phase !== "processing"}
      closeOnEscape={phase !== "processing"}
      hideCloseButton={phase === "processing"}
      footer={<ModalFooter phase={phase} canConfirm={!!selectedStaffId} onCancel={handleClose} onConfirm={handleStartAssign} onClose={handleClose} />}
    >
      <div className="space-y-4 py-1">

        {/* ── PHASE: confirm ─────────────────────────────────────────────── */}
        {phase === "confirm" && (
          <>
            <Select
              label="Nhân viên CSKH"
              placeholder="Chọn nhân viên phụ trách"
              options={enrichedOptions}
              value={selectedStaffId}
              onChange={(v) => setSelectedStaffId(v as string)}
              searchable
              clearable
              boldLabel
            />

            {selectedStaff && (
              <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm text-primary-800 flex items-center gap-2">
                <UserIcon className="w-4 h-4 shrink-0 text-primary-500" />
                Sẽ phân công{" "}
                <span className="font-semibold">{total} phiếu</span>{" "}
                cho{" "}
                <span className="font-semibold">{selectedStaff.label}</span>
              </div>
            )}

            {/* Ticket list preview */}
            <div>
              <p className="text-xs font-medium text-secondary-500 mb-2">
                Danh sách phiếu ({total})
              </p>
              <div className="max-h-52 overflow-y-auto rounded-xl border border-secondary-100 divide-y divide-secondary-50">
                {items.map((it) => (
                  <TicketRow key={it.ticketId} item={it} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── PHASE: processing ──────────────────────────────────────────── */}
        {phase === "processing" && (
          <>
            {/* Progress bar */}
            <ProgressBar
              value={progress}
              max={total}
              showValue
              showCount
              label={`Đang phân công cho ${selectedStaff?.label ?? ""}...`}
              caption={
                progress < total
                  ? `Đang xử lý phiếu ${items[progress]?.maTicket ?? ""}…`
                  : "Hoàn tất, đang tổng hợp kết quả..."
              }
              animated
            />

            {/* Live ticket list */}
            <div className="max-h-64 overflow-y-auto rounded-xl border border-secondary-100 divide-y divide-secondary-50">
              {items.map((it) => (
                <TicketRow key={it.ticketId} item={it} />
              ))}
            </div>
          </>
        )}

        {/* ── PHASE: result ──────────────────────────────────────────────── */}
        {phase === "result" && (
          <>
            {/* Summary bar */}
            <ProgressBar
              value={successCnt}
              max={total}
              showValue
              showCount={false}
              variant={progressVariant}
              size="sm"
              animated={false}
            />

            {/* Summary chips */}
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
              <span className="ml-auto text-xs text-secondary-400">
                Đã phân công cho{" "}
                <span className="font-medium text-secondary-600">{selectedStaff?.label}</span>
              </span>
            </div>

            {/* Result filter tabs */}
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

            {/* Result ticket list */}
            <div className="max-h-64 overflow-y-auto rounded-xl border border-secondary-100 divide-y divide-secondary-50">
              {filteredItems.map((it) => (
                <TicketRow key={it.ticketId} item={it} />
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── TicketRow ────────────────────────────────────────────────────────────────

function TicketRow({ item }: { item: TicketItem }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <StatusIcon status={item.status} />
      <span className="font-mono text-xs text-primary-700 shrink-0 w-20">
        {item.maTicket}
      </span>
      <span className="text-sm text-secondary-700 truncate flex-1">{item.tieuDe}</span>
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

// ─── ModalFooter ──────────────────────────────────────────────────────────────

function ModalFooter({
  phase,
  canConfirm,
  onCancel,
  onConfirm,
  onClose,
}: {
  phase:      Phase;
  canConfirm: boolean;
  onCancel:   () => void;
  onConfirm:  () => void;
  onClose:    () => void;
}) {
  if (phase === "processing") {
    return (
      <div className="flex items-center justify-center py-1">
        <span className="text-xs text-secondary-400 italic">
          Đang xử lý, vui lòng không đóng cửa sổ này…
        </span>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={onClose}>
          Đóng
        </Button>
      </div>
    );
  }

  // confirm
  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="secondary" size="sm" onClick={onCancel}>
        Huỷ
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={onConfirm}
        disabled={!canConfirm}
      >
        Phân công →
      </Button>
    </div>
  );
}
