"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InternalNote {
  id: string;
  authorName: string;
  authorRole: string;
  authorId?: string;
  authorAvatarUrl?: string;
  text: string;
  createdAt: string;
}

interface OrderNotesPanelProps {
  notes: InternalNote[];
  onAddNote: (text: string) => void | Promise<void>;
  isAdding?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderNotesPanel({
  notes,
  onAddNote,
  isAdding = false,
}: OrderNotesPanelProps) {
  const [noteText, setNoteText] = useState("");

  async function handleAdd() {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    await onAddNote(trimmed);
    setNoteText("");
  }

  // Sort notes reverse chronological
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-secondary-100">
        <h3 className="text-sm font-semibold text-secondary-900">Ghi chú nội bộ</h3>
      </div>

      {/* Notes list */}
      <div className="divide-y divide-secondary-100">
        {sortedNotes.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-secondary-400">
            Chưa có ghi chú nào
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div key={note.id} className="flex gap-3 px-4 py-3">
              {/* Avatar */}
              <Avatar
                src={note.authorAvatarUrl}
                name={note.authorName}
                size="xs"
                className="shrink-0 mt-0.5"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  {note.authorId ? (
                    <Link
                      href={`/employees/${note.authorId}`}
                      className="text-sm font-medium text-secondary-800 hover:text-primary-600 hover:underline"
                    >
                      {note.authorName}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-secondary-800">
                      {note.authorName}
                    </span>
                  )}
                  <Badge variant="default" size="sm" className="text-xs">
                    {note.authorRole}
                  </Badge>
                  <span className="text-xs text-secondary-400">
                    {new Date(note.createdAt).toLocaleString("vi-VN", {
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                      day: "2-digit", month: "2-digit", year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-secondary-700 whitespace-pre-wrap break-words">
                  {note.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply area */}
      <div className="px-4 py-3 border-t border-secondary-100">
        <Textarea
          placeholder="Thêm ghi chú..."
          rows={2}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          disabled={isAdding}
          showCharCount
          maxCharCount={250}
        />
        <div className="mt-2 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAdd}
            disabled={isAdding || !noteText.trim()}
            isLoading={isAdding}
          >
            {isAdding ? "Đang thêm…" : "Thêm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
