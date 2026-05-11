"use client";

import { useState } from "react";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Button } from "@/src/components/ui/Button";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  /** ISO date string */
  timestamp: string;
  actorName: string;
  actorCode?: string;
  actorAvatarUrl?: string;
  /** Preferred: array of role display names */
  actorRoles?: string[];
  /** Legacy single-role fallback */
  actorRole?: string;
  /** Human-readable action description, e.g. "Updated status: Pending → Shipped" */
  action: string;
  diff?: {
    before: string;
    after: string;
  };
}

export interface AuditLogViewerProps {
  events: AuditEvent[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ngày trước`;

  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── DiffBlock ────────────────────────────────────────────────────────────────

function DiffBlock({ before, after }: { before: string; after: string }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-secondary-200 bg-secondary-50 p-3 text-xs">
      <div>
        <p className="mb-1 font-semibold text-error-600">Trước</p>
        <pre className="whitespace-pre-wrap break-words text-secondary-700 font-mono">
          {before}
        </pre>
      </div>
      <div>
        <p className="mb-1 font-semibold text-success-600">Sau</p>
        <pre className="whitespace-pre-wrap break-words text-secondary-700 font-mono">
          {after}
        </pre>
      </div>
    </div>
  );
}

// ─── EventRow ─────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: AuditEvent }) {
  const [showDiff, setShowDiff] = useState(false);

  return (
    <div className="relative flex gap-4">
      {/* Vertical line — drawn on the left column */}
      <div className="flex flex-col items-center">
        {/* Timeline dot */}
        <div className="relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-secondary-300 ring-2 ring-white" />
        {/* Line below dot */}
        <div className="mt-1 w-px flex-1 bg-secondary-200" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Avatar
            src={event.actorAvatarUrl}
            name={event.actorName}
            size="xs"
          />
          <span className="text-sm font-medium text-secondary-800">
            [{event.actorName}]
          </span>
          {event.actorCode && (
            <span className="font-mono text-xs text-secondary-500">
              — [{event.actorCode}]
            </span>
          )}
          {(event.actorRoles ?? (event.actorRole ? [event.actorRole] : [])).length > 0 && (
            <span className="text-xs text-secondary-400">
              — {"{"}
              {(event.actorRoles ?? (event.actorRole ? [event.actorRole] : [])).map((r, i) => (
                <span key={r}>
                  {i > 0 && ", "}
                  <Badge variant="default" size="sm">[{r}]</Badge>
                </span>
              ))}
              {"}"}
            </span>
          )}
          <span className="ml-auto text-xs text-secondary-400">
            {formatRelative(event.timestamp)}
          </span>
        </div>

        {/* Action */}
        <p className="mt-1 text-sm text-secondary-600">{event.action}</p>

        {/* Diff toggle */}
        {event.diff && (
          <div className="mt-1.5">
            <button
              type="button"
              onClick={() => setShowDiff((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:underline"
            >
              {showDiff ? (
                <>
                  <ChevronUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Ẩn thay đổi
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Xem thay đổi
                </>
              )}
            </button>
            {showDiff && (
              <DiffBlock before={event.diff.before} after={event.diff.after} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AuditLogViewer — vertical timeline of audit events for an admin resource.
 *
 * Shows: actor avatar + name + role badge + action text + relative timestamp.
 * Optional diff toggle per event.
 * Skeleton rows shown while isLoading.
 */
export function AuditLogViewer({
  events,
  isLoading = false,
  onLoadMore,
  hasMore = false,
}: AuditLogViewerProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-secondary-200" />
              <div className="mt-1 w-px flex-1 bg-secondary-100 min-h-[40px]" />
            </div>
            <div className="flex-1 pb-5">
              <Skeleton variant="avatar" count={1} />
              <Skeleton className="mt-2 h-3 w-3/4 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-secondary-400">
        Chưa có hoạt động nào được ghi lại.
      </p>
    );
  }

  return (
    <div>
      {/* Timeline */}
      <div>
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && onLoadMore && (
        <div className="mt-2 flex justify-center">
          <Button variant="ghost" size="sm" onClick={onLoadMore}>
            Xem thêm
          </Button>
        </div>
      )}
    </div>
  );
}
