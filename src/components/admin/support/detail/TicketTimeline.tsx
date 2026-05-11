"use client";

import { useEffect, useRef } from "react";
import { TicketMessageBubble } from "./TicketMessageBubble";
import type { TicketMessage } from "@/src/types/ticket.types";

interface TicketTimelineProps {
  messages:              TicketMessage[];
  /** When true, hides InternalNote messages (e.g. for customer-facing views) */
  hideInternalNotes?:    boolean;
  onImageClick?:         (imageKey: string) => void;
}

/**
 * TicketTimeline — scrollable message thread, auto-scrolls to newest message.
 */
export function TicketTimeline({
  messages,
  hideInternalNotes = false,
  onImageClick,
}: TicketTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const visible = hideInternalNotes
    ? messages.filter((m) => m.loaiTinNhan !== "InternalNote")
    : messages;

  if (visible.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-secondary-400">
        Chưa có tin nhắn nào
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto px-2 py-2">
      {visible.map((msg) => (
        <TicketMessageBubble
          key={msg.messageId}
          message={msg}
          onImageClick={onImageClick}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
