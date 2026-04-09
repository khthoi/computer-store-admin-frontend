"use client";

import { useState, useMemo } from "react";
import { TicketTimeline }    from "./TicketTimeline";
import { TicketReplyComposer } from "./TicketReplyComposer";
import { TicketStatusBadge }   from "./TicketStatusBadge";
import { TicketPriorityBadge } from "./TicketPriorityBadge";
import { TicketSLATimer }      from "./TicketSLATimer";
import { TicketMetaPanel, type TicketMeta } from "./TicketMetaPanel";
import {
  MediaLightbox,
  type GalleryMedia,
} from "@/src/components/product/ProductImageGallery";
import type {
  Ticket,
  TicketStatus,
  StaffOption,
} from "@/src/types/ticket.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/i;

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketDetailViewProps {
  ticket:        Ticket;
  staffOptions?: StaffOption[];
  onReply:       (
    text:        string,
    type:        "Reply" | "InternalNote",
    nextStatus?: TicketStatus,
    files?:      File[]
  ) => Promise<void>;
  onMetaChange:  (field: string, value: string | string[] | null) => void;
  isSending?:    boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * TicketDetailView — two-column chat + metadata layout for a support ticket.
 * Orchestrates the conversation-wide image lightbox.
 */
export function TicketDetailView({
  ticket,
  staffOptions = [],
  onReply,
  onMetaChange,
  isSending = false,
}: TicketDetailViewProps) {
  const isClosed = ticket.trangThai === "Dong";

  // ── Conversation image gallery ────────────────────────────────────────────
  const allConversationImages = useMemo((): GalleryMedia[] => {
    return ticket.messages.flatMap((msg) =>
      (msg.attachments ?? [])
        .filter((att) => IMAGE_EXTS.test(att.fileName))
        .map((att) => ({
          key:  String(att.attachmentId),
          src:  att.fileUrl,
          alt:  att.fileName,
        }))
    );
  }, [ticket.messages]);

  const [lightboxKey, setLightboxKey] = useState<string | null>(null);

  const lightboxIndex = useMemo(
    () => allConversationImages.findIndex((img) => img.key === lightboxKey),
    [allConversationImages, lightboxKey]
  );

  // ── TicketMeta ────────────────────────────────────────────────────────────
  const meta: TicketMeta = {
    trangThai:           ticket.trangThai,
    mucDoUuTien:         ticket.mucDoUuTien,
    nhanVienPhuTrachId:  ticket.nhanVienPhuTrachId
      ? String(ticket.nhanVienPhuTrachId)
      : undefined,
    nhanVienPhuTrachTen: ticket.nhanVienPhuTrachTen,
    khachHangTen:        ticket.khachHangTen,
    khachHangEmail:      ticket.khachHangEmail,
    donHangId:           ticket.donHangId ? String(ticket.donHangId) : undefined,
    ngayTao:             ticket.ngayTao,
    ngayCapNhat:         ticket.ngayCapNhat,
    tags:                ticket.tags,
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* ── Left: chat panel ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-secondary-900 truncate">
                {ticket.tieuDe}
              </h1>
              <p className="text-xs text-secondary-400 mt-0.5">
                #{ticket.maTicket}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <TicketPriorityBadge priority={ticket.mucDoUuTien} />
              <TicketStatusBadge   status={ticket.trangThai}     />
            </div>
          </div>

          {/* SLA timer */}
          {ticket.slaDeadline && (
            <div className="flex items-center">
              <TicketSLATimer deadline={ticket.slaDeadline} isClosed={isClosed} />
            </div>
          )}

          {/* Message thread */}
          <div className="flex-1 overflow-y-auto max-h-[55vh] border border-secondary-100 rounded-2xl px-3 py-3 bg-secondary-50/30">
            <TicketTimeline
              messages={ticket.messages}
              onImageClick={(key) => setLightboxKey(key)}
            />
          </div>

          {/* Reply composer */}
          {!isClosed ? (
            <TicketReplyComposer
              ticketStatus={ticket.trangThai}
              onSend={onReply}
              isSending={isSending}
            />
          ) : (
            <div className="rounded-2xl border border-secondary-200 px-4 py-3 text-sm text-secondary-400 text-center bg-secondary-50">
              Phiếu đã đóng — không thể gửi thêm tin nhắn
            </div>
          )}
        </div>

        {/* ── Right: meta panel ────────────────────────────────────────────── */}
        <TicketMetaPanel
          meta={meta}
          onMetaChange={onMetaChange}
          staffOptions={staffOptions}
          isReadonly={isClosed}
        />
      </div>

      {/* ── Conversation lightbox ────────────────────────────────────────────── */}
      {lightboxKey !== null && allConversationImages.length > 0 && (
        <MediaLightbox
          items={allConversationImages}
          activeIndex={lightboxIndex >= 0 ? lightboxIndex : 0}
          onClose={() => setLightboxKey(null)}
          onNavigate={(idx) => setLightboxKey(allConversationImages[idx].key)}
        />
      )}
    </>
  );
}
