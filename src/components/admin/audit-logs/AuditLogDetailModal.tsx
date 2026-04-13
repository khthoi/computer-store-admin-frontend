"use client";

import { useState } from "react";
import {
  ClockIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { AuditActionBadge } from "@/src/components/admin/audit-logs/AuditActionBadge";
import { AuditEntityBadge } from "@/src/components/admin/audit-logs/AuditEntityBadge";
import type { AuditLogEntry } from "@/src/types/audit-log.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFullDate(isoString: string): string {
  return new Date(isoString).toLocaleString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function tryPrettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

// ─── DiffPanel ────────────────────────────────────────────────────────────────

function DiffPanel({ before, after }: { before: string; after: string }) {
  const prettyBefore = tryPrettyJson(before);
  const prettyAfter = tryPrettyJson(after);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Before */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-error-100 text-error-600">
            <span className="text-[10px] font-bold leading-none">−</span>
          </span>
          <span className="text-xs font-semibold text-error-700">Trước</span>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-error-100 bg-error-50 p-3 text-[11px] leading-relaxed text-secondary-700 font-mono whitespace-pre-wrap break-words">
          {prettyBefore}
        </pre>
      </div>

      {/* After */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-600">
            <span className="text-[10px] font-bold leading-none">+</span>
          </span>
          <span className="text-xs font-semibold text-success-700">Sau</span>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-success-100 bg-success-50 p-3 text-[11px] leading-relaxed text-secondary-700 font-mono whitespace-pre-wrap break-words">
          {prettyAfter}
        </pre>
      </div>
    </div>
  );
}

// ─── OverviewPanel ────────────────────────────────────────────────────────────

function OverviewPanel({ entry }: { entry: AuditLogEntry }) {
  const roleLabel: Record<string, string> = {
    admin:     "Admin",
    staff:     "Nhân viên",
    warehouse: "Kho",
    cskh:      "CSKH",
    system:    "Hệ thống",
  };

  return (
    <dl className="divide-y divide-secondary-100">
      {/* Actor */}
      <div className="flex items-start gap-3 py-3">
        <dt className="w-28 shrink-0 text-xs font-medium text-secondary-500 pt-1">
          Thực hiện bởi
        </dt>
        <dd className="flex flex-1 items-center gap-2 flex-wrap">
          <Avatar
            src={entry.actorAvatarUrl}
            name={entry.actorName}
            size="sm"
          />
          <span className="text-sm font-medium text-secondary-800">
            {entry.actorName}
          </span>
          <Badge variant="default" size="sm">
            {roleLabel[entry.actorRole] ?? entry.actorRole}
          </Badge>
        </dd>
      </div>

      {/* Timestamp */}
      <div className="flex items-start gap-3 py-3">
        <dt className="w-28 shrink-0 text-xs font-medium text-secondary-500 pt-0.5">
          Thời gian
        </dt>
        <dd className="flex flex-1 items-center gap-1.5 text-sm text-secondary-700">
          <ClockIcon className="h-3.5 w-3.5 shrink-0 text-secondary-400" aria-hidden="true" />
          {formatFullDate(entry.createdAt)}
        </dd>
      </div>

      {/* Entity */}
      <div className="flex items-start gap-3 py-3">
        <dt className="w-28 shrink-0 text-xs font-medium text-secondary-500 pt-0.5">
          Đối tượng
        </dt>
        <dd className="flex flex-1 flex-col gap-1">
          <AuditEntityBadge
            entityType={entry.entityType}
            entityId={entry.entityId}
            linkable
          />
          <span className="text-xs text-secondary-500 break-all">
            ID: {entry.entityId}
          </span>
          <span className="text-sm text-secondary-700">{entry.entityLabel}</span>
        </dd>
      </div>

      {/* Action */}
      <div className="flex items-start gap-3 py-3">
        <dt className="w-28 shrink-0 text-xs font-medium text-secondary-500 pt-0.5">
          Hành động
        </dt>
        <dd className="flex flex-1 flex-col gap-1.5">
          <AuditActionBadge actionType={entry.actionType} />
          <p className="text-sm text-secondary-700">{entry.actionDetail}</p>
        </dd>
      </div>

      {/* IP Address */}
      {entry.ipAddress && (
        <div className="flex items-start gap-3 py-3">
          <dt className="w-28 shrink-0 text-xs font-medium text-secondary-500 pt-0.5">
            Địa chỉ IP
          </dt>
          <dd className="flex flex-1 items-center gap-1.5 text-sm text-secondary-700">
            <GlobeAltIcon className="h-3.5 w-3.5 shrink-0 text-secondary-400" aria-hidden="true" />
            <span className="font-mono">{entry.ipAddress}</span>
          </dd>
        </div>
      )}

      {/* User Agent */}
      {entry.userAgent && (
        <div className="flex items-start gap-3 py-3">
          <dt className="w-28 shrink-0 text-xs font-medium text-secondary-500 pt-0.5">
            Thiết bị
          </dt>
          <dd className="flex flex-1 items-start gap-1.5 text-sm text-secondary-700">
            <ComputerDesktopIcon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-secondary-400" aria-hidden="true" />
            <span className="break-all text-xs text-secondary-500 font-mono">
              {entry.userAgent}
            </span>
          </dd>
        </div>
      )}
    </dl>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditLogDetailModalProps {
  entry: AuditLogEntry | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AuditLogDetailModal — shows full detail of a single audit log entry.
 *
 * Two tabs:
 *   - "Tổng quan": actor, timestamp, entity, action, IP, user-agent
 *   - "Thay đổi" (only if diff exists): before/after JSON diff panel
 *
 * Usage:
 * ```tsx
 * const [selected, setSelected] = useState<AuditLogEntry | null>(null);
 * <AuditLogDetailModal entry={selected} onClose={() => setSelected(null)} />
 * ```
 */
export function AuditLogDetailModal({ entry, onClose }: AuditLogDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Reset tab to overview whenever a new entry is opened
  const handleTabChange = (value: string) => setActiveTab(value);

  const hasDiff = Boolean(entry?.diff);

  const tabs = [
    { value: "overview", label: "Tổng quan" },
    ...(hasDiff ? [{ value: "diff", label: "Thay đổi" }] : []),
  ];

  return (
    <Modal
      isOpen={Boolean(entry)}
      onClose={onClose}
      title="Chi tiết nhật ký"
      size="xl"
      animated
      footer={
        <Button variant="ghost" size="sm" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      {entry && (
        <>
          {/* Log ID sub-header */}
          <p className="mb-4 text-xs text-secondary-400 font-mono">
            ID: {entry.id}
          </p>

          <Tabs
            tabs={tabs}
            value={activeTab}
            onChange={handleTabChange}
            variant="line"
          >
            <TabPanel value="overview" className="pt-2">
              <OverviewPanel entry={entry} />
            </TabPanel>

            {hasDiff && entry.diff && (
              <TabPanel value="diff" className="pt-4">
                <DiffPanel before={entry.diff.before} after={entry.diff.after} />
              </TabPanel>
            )}
          </Tabs>
        </>
      )}
    </Modal>
  );
}
