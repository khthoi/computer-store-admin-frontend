"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Button }    from "@/src/components/ui/Button";
import { Skeleton }  from "@/src/components/ui/Skeleton";
import { useToast }  from "@/src/components/ui/Toast";
import { TicketDetailView } from "./TicketDetailView";
import {
  getTicketById,
  getStaffOptions,
  addMessage,
  updateTicketMeta,
} from "@/src/services/ticket.service";
import type {
  Ticket,
  TicketStatus,
  StaffOption,
} from "@/src/types/ticket.types";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TicketDetailClientProps {
  ticketId: number;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function TicketDetailClient({ ticketId }: TicketDetailClientProps) {
  const router        = useRouter();
  const { showToast } = useToast();

  const [ticket,       setTicket]       = useState<Ticket | null>(null);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [notFound,     setNotFound]     = useState(false);
  const [isSending,    setIsSending]    = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Initial load ─────────────────────────────────────────────────────────────
  const loadTicket = useCallback(async () => {
    setIsLoading(true);
    try {
      const [t, staff] = await Promise.all([
        getTicketById(ticketId),
        getStaffOptions(),
      ]);
      if (!t) { setNotFound(true); return; }
      setTicket(t);
      setStaffOptions(staff);
    } catch {
      showToast("Lỗi tải phiếu hỗ trợ", "error");
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  // ── Manual refresh (button) ───────────────────────────────────────────────────
  async function handleManualRefresh() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const [t, staff] = await Promise.all([
        getTicketById(ticketId),
        getStaffOptions(),
      ]);
      if (t) {
        setTicket(t);
        setStaffOptions(staff);
      }
      showToast("Đã tải lại phiếu hỗ trợ", "success");
    } catch {
      showToast("Không thể tải lại", "error");
    } finally {
      setIsRefreshing(false);
    }
  }

  // ── Silent refresh — no loading state ────────────────────────────────────────
  const silentRefresh = useCallback(async () => {
    try {
      const t = await getTicketById(ticketId);
      if (t) setTicket(t);
    } catch {
      // silently ignore
    }
  }, [ticketId]);

  useEffect(() => { loadTicket(); }, [loadTicket]);

  // ── Reply ─────────────────────────────────────────────────────────────────────
  async function handleReply(
    text:        string,
    type:        "Reply" | "InternalNote",
    nextStatus?: TicketStatus,
    files?:      File[]
  ) {
    if (!ticket) return;
    setIsSending(true);
    try {
      await addMessage(ticket.ticketId, {
        ticketId:       ticket.ticketId,
        noiDungTinNhan: text,
        loaiTinNhan:    type,
        trangThaiMoi:   nextStatus,
        files,
      });
      showToast("Đã gửi tin nhắn", "success");
      await silentRefresh();
    } catch {
      showToast("Không thể gửi tin nhắn", "error");
    } finally {
      setIsSending(false);
    }
  }

  // ── Meta update ───────────────────────────────────────────────────────────────
  async function handleMetaChange(field: string, value: string | null) {
    if (!ticket) return;
    try {
      let updated: Ticket;
      if (field === "trangThai") {
        updated = await updateTicketMeta(ticket.ticketId, {
          trangThai: value as TicketStatus,
        });
        const labels: Record<string, string> = {
          DaGiaiQuyet: "Đã đánh dấu giải quyết",
          DaDong:      "Đã đóng phiếu",
          DangXuLy:    "Đã mở lại phiếu",
        };
        showToast(labels[value ?? ""] ?? "Đã cập nhật trạng thái", "success");
      } else if (field === "mucDoUuTien") {
        updated = await updateTicketMeta(ticket.ticketId, {
          mucDoUuTien: value as Ticket["mucDoUuTien"],
        });
        showToast("Đã cập nhật mức ưu tiên", "success");
      } else if (field === "nhanVienPhuTrachId") {
        updated = await updateTicketMeta(ticket.ticketId, {
          nhanVienPhuTrachId: value ? Number(value) : null,
        });
        showToast(value ? "Đã cập nhật phân công" : "Đã huỷ phân công", "success");
      } else {
        return;
      }
      setTicket(updated);
    } catch {
      showToast("Không thể cập nhật phiếu", "error");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (isLoading) return <LoadingSkeleton />;

  if (notFound || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-secondary-500">Không tìm thấy phiếu hỗ trợ.</p>
        <Button variant="secondary" size="sm" onClick={() => router.push("/support")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />}
          onClick={() => router.push("/support")}
        >
          Danh sách phiếu
        </Button>

        <button
          type="button"
          title="Tải lại"
          disabled={isRefreshing}
          onClick={handleManualRefresh}
          className="ml-auto p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon
            className={["w-4 h-4", isRefreshing ? "animate-spin" : ""].join(" ")}
            aria-hidden="true"
          />
        </button>
      </div>

      <TicketDetailView
        ticket={ticket}
        staffOptions={staffOptions}
        onReply={handleReply}
        onMetaChange={handleMetaChange}
        isSending={isSending}
      />
    </div>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 animate-pulse">
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3 rounded-xl" />
        <Skeleton className="h-4 w-1/4 rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}
