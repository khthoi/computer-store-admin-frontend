"use client";

import { useEffect, useState } from "react";
import {
  CpuChipIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  DocumentMagnifyingGlassIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { fetchBuildsByCustomerId, fetchBuildDetail } from "@/src/services/buildpc.service";
import type { BuildPCBuild, BuildPCBuildDetail } from "@/src/types/buildpc.types";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { BuildDetailDrawer } from "@/src/components/admin/content/buildpc/builds/BuildDetailDrawer";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  customerId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + " tỷ ₫";
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + " triệu ₫";
  return amount.toLocaleString("vi-VN") + " ₫";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function BuildStatusBadge({ status }: { status: BuildPCBuild["trangThai"] }) {
  return status === "complete" ? (
    <span className="inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700">
      Hoàn chỉnh
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-medium text-secondary-600">
      Nháp
    </span>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function BuildCardSkeleton() {
  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2 pt-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-secondary-100">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-7 w-24 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <CpuChipIcon className="h-12 w-12 text-secondary-300 mb-3" />
      <p className="text-sm font-medium text-secondary-600">Chưa có Build PC nào</p>
      <p className="mt-1 text-xs text-secondary-400">
        Khách hàng này chưa lưu cấu hình Build PC nào.
      </p>
    </div>
  );
}

// ─── Build card ───────────────────────────────────────────────────────────────

interface BuildCardProps {
  build: BuildPCBuild;
  detail: BuildPCBuildDetail | null;
  onOpenDrawer: (build: BuildPCBuild) => void;
}

function BuildCard({ build, detail, onOpenDrawer }: BuildCardProps) {
  const showStats = build.trangThai === "complete" && build.isPublic;

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-4 space-y-3 transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-secondary-900 truncate">
              {build.tenBuild}
            </h3>
            <BuildStatusBadge status={build.trangThai} />
            {build.trangThai === "complete" && (
              build.isPublic ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">
                  <GlobeAltIcon className="h-3 w-3" />
                  Công khai
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-medium text-secondary-500">
                  <LockClosedIcon className="h-3 w-3" />
                  Riêng tư
                </span>
              )
            )}
          </div>
          {build.moTa && (
            <p className="mt-1 text-xs text-secondary-500 line-clamp-1">{build.moTa}</p>
          )}
        </div>

        {/* Stats: lượt xem + lượt clone — chỉ hiện build công khai */}
        {showStats && (
          <div className="shrink-0 flex items-center gap-3 text-xs text-secondary-400">
            <Tooltip content="Lượt xem build" placement="top">
              <span className="flex items-center gap-1 cursor-default">
                <EyeIcon className="h-3.5 w-3.5" />
                {(build.soLuotXem ?? 0).toLocaleString("vi-VN")}
              </span>
            </Tooltip>
            <Tooltip content="Lượt clone build" placement="top">
              <span className="flex items-center gap-1 cursor-default">
                <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                {(build.soLuotClone ?? 0).toLocaleString("vi-VN")}
              </span>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Parts list */}
      {detail && detail.chiTiet.length > 0 ? (
        <div className="rounded-lg border border-secondary-100 bg-secondary-50/60 divide-y divide-secondary-100 overflow-hidden">
          {detail.chiTiet.map((item) => (
            <div key={item.id} className="flex items-center gap-2 px-3 py-2">
              <span className="shrink-0 w-20 text-[11px] font-medium uppercase tracking-wide text-secondary-400 truncate">
                {item.slotTen}
              </span>
              <span className="min-w-0 flex-1 text-xs text-secondary-700 truncate">
                {item.tenPhienBan}
              </span>
              {item.soLuong > 1 && (
                <span className="shrink-0 text-[11px] text-secondary-400">×{item.soLuong}</span>
              )}
              <span className="shrink-0 text-xs font-medium text-secondary-600">
                {formatVND(item.giaBan * item.soLuong)}
              </span>
            </div>
          ))}
        </div>
      ) : detail && detail.chiTiet.length === 0 ? (
        <p className="text-xs text-secondary-400 italic">Chưa chọn linh kiện nào.</p>
      ) : null}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-secondary-100">
        <div className="space-y-0.5">
          <p className="text-xs text-secondary-400">
            Tạo ngày {formatDate(build.ngayTao)}
            {build.ngayCapNhat !== build.ngayTao && (
              <> · Cập nhật {formatDate(build.ngayCapNhat)}</>
            )}
          </p>
          <p className="text-sm font-semibold text-secondary-900">
            {formatVND(build.tongGia)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenDrawer(build)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-1.5 text-xs font-medium text-secondary-600 transition-colors hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-800"
        >
          <DocumentMagnifyingGlassIcon className="h-3.5 w-3.5" />
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CustomerBuildsTab — hiển thị danh sách Build PC mà khách hàng đã lưu.
 * Fetch client-side để không block server render của customer detail page.
 * Mở BuildDetailDrawer khi bấm "Xem chi tiết".
 */
export function CustomerBuildsTab({ customerId }: Props) {
  const [builds, setBuilds] = useState<BuildPCBuild[]>([]);
  const [details, setDetails] = useState<Record<string, BuildPCBuildDetail>>({});
  const [loading, setLoading] = useState(true);
  const [drawerBuild, setDrawerBuild] = useState<BuildPCBuild | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const list = await fetchBuildsByCustomerId(customerId);
        if (cancelled) return;
        setBuilds(list);

        // Fetch chi tiết song song để hiển thị parts list inline trong card
        const detailEntries = await Promise.all(
          list.map((b) =>
            fetchBuildDetail(b.id)
              .then((d) => [b.id, d] as const)
              .catch(() => [b.id, { ...b, chiTiet: [] }] as const)
          )
        );
        if (cancelled) return;
        setDetails(Object.fromEntries(detailEntries));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [customerId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => <BuildCardSkeleton key={i} />)}
      </div>
    );
  }

  if (builds.length === 0) return <EmptyState />;

  const completeCount = builds.filter((b) => b.trangThai === "complete").length;
  const draftCount = builds.length - completeCount;

  return (
    <>
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex items-center gap-4 text-xs text-secondary-500">
          <span>
            <span className="font-semibold text-secondary-700">{builds.length}</span> build
          </span>
          {completeCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success-400 inline-block" />
              {completeCount} hoàn chỉnh
            </span>
          )}
          {draftCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary-300 inline-block" />
              {draftCount} nháp
            </span>
          )}
        </div>

        {/* Build cards */}
        {builds.map((build) => (
          <BuildCard
            key={build.id}
            build={build}
            detail={details[build.id] ?? null}
            onOpenDrawer={setDrawerBuild}
          />
        ))}
      </div>

      {/* Drawer chi tiết build */}
      <BuildDetailDrawer
        build={drawerBuild}
        onClose={() => setDrawerBuild(null)}
      />
    </>
  );
}
