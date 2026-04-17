"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Drawer } from "@/src/components/ui/Drawer";
import { Badge } from "@/src/components/ui/Badge";
import { Spinner } from "@/src/components/ui/Spinner";
import { Alert } from "@/src/components/ui/Alert";
import { fetchBuildDetail } from "@/src/services/buildpc.service";
import type { BuildPCBuild, BuildPCBuildDetail, BuildStatus } from "@/src/types/buildpc.types";

// ─── Style maps ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<BuildStatus, { variant: "default" | "success"; label: string }> = {
  draft:    { variant: "default",  label: "Nháp" },
  complete: { variant: "success",  label: "Hoàn chỉnh" },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface BuildDetailDrawerProps {
  build: BuildPCBuild | null;
  onClose: () => void;
}

export function BuildDetailDrawer({ build, onClose }: BuildDetailDrawerProps) {
  const [detail, setDetail]   = useState<BuildPCBuildDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!build) { setDetail(null); return; }
    setLoading(true);
    setError(null);
    fetchBuildDetail(build.id)
      .then(setDetail)
      .catch(() => setError("Không thể tải chi tiết build."))
      .finally(() => setLoading(false));
  }, [build]);

  const statusCfg = build ? STATUS_BADGE[build.trangThai] : null;

  return (
    <Drawer
      isOpen={build !== null}
      onClose={onClose}
      position="right"
      size="xl"
      title={build?.tenBuild ?? "Chi tiết Build PC"}
    >
      {!build ? null : loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : (
        <div className="space-y-6">
          {/* ── Header info ── */}
          <div className="space-y-3 rounded-xl border border-secondary-200 bg-secondary-50 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-secondary-800">{build.tenBuild}</p>
                {build.moTa && (
                  <p className="mt-0.5 text-sm text-secondary-500">{build.moTa}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {build.isPublic && (
                  <Badge variant="primary" size="sm">Công khai</Badge>
                )}
                {statusCfg && (
                  <Badge variant={statusCfg.variant} size="sm">{statusCfg.label}</Badge>
                )}
              </div>
            </div>

            {/* Customer info */}
            <div className="flex items-center gap-1.5 text-sm">
              <Link
                href={`/customers/${build.customerId}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {build.tenNguoiDung}
              </Link>
              <span className="text-secondary-400">·</span>
              <span className="text-secondary-500">{build.email}</span>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-xs text-secondary-500">
              <span>
                Tổng giá:{" "}
                <strong className="text-secondary-800">
                  {build.tongGia.toLocaleString("vi-VN")} ₫
                </strong>
              </span>
              {(build.soLuotXem !== undefined || build.soLuotClone !== undefined) && (
                <span>
                  Xem / Clone:{" "}
                  <strong className="text-secondary-700">
                    {build.soLuotXem ?? 0} / {build.soLuotClone ?? 0}
                  </strong>
                </span>
              )}
            </div>

            <div className="text-xs text-secondary-400">
              Tạo lúc {new Date(build.ngayTao).toLocaleString("vi-VN")} ·{" "}
              Cập nhật {new Date(build.ngayCapNhat).toLocaleString("vi-VN")}
            </div>
          </div>

          {/* ── Line items (phiên bản sản phẩm) ── */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary-500">
              Phiên bản sản phẩm ({detail?.chiTiet.length ?? 0})
            </h4>
            {detail && detail.chiTiet.length === 0 ? (
              <p className="text-sm text-secondary-400">Chưa có linh kiện nào trong build này.</p>
            ) : (
              <div className="space-y-2">
                {detail?.chiTiet.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-secondary-200 bg-white p-3"
                  >
                    {/* Thumbnail */}
                    <div className="h-14 w-14 shrink-0 rounded-lg border border-secondary-200 bg-secondary-50 overflow-hidden flex items-center justify-center">
                      {item.hinhAnh ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.hinhAnh} alt={item.tenPhienBan} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-secondary-300 uppercase">
                          {item.slotTen.slice(0, 3)}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {/* Variant name — clickable link */}
                          <Link
                            href={`/products/${item.sanPhamId}/variants/${item.phienBanId}`}
                            className="group inline-flex items-center gap-1 text-sm font-semibold text-secondary-800 hover:text-primary-600 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="truncate max-w-[220px]">{item.tenPhienBan}</span>
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <p className="text-[11px] text-secondary-400 font-mono">{item.SKU}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-secondary-800 whitespace-nowrap">
                          {(item.giaBan * item.soLuong).toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="default" size="sm">{item.slotTen}</Badge>
                        {item.soLuong > 1 && (
                          <span className="text-[11px] text-secondary-400">
                            {item.giaBan.toLocaleString("vi-VN")} ₫ × {item.soLuong}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Total ── */}
          {detail && detail.chiTiet.length > 0 && (
            <div className="rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-secondary-700">Tổng cộng</span>
                <span className="font-bold text-secondary-900">
                  {detail.tongGia.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
