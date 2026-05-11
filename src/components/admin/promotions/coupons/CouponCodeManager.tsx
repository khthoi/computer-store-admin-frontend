"use client";

import { useState } from "react";
import { TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Toggle } from "@/src/components/ui/Toggle";
import { StatusBadge } from "@/src/components/admin/StatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CouponCode {
  code: string;
  usageCount: number;
  usageLimit?: number;
  expiresAt?: string;
  status: "active" | "expired" | "disabled";
}

export interface CouponCodeManagerProps {
  codes: CouponCode[];
  onCodesChange: (codes: CouponCode[]) => void;
  onExportCsv?: () => void;
}

type GeneratorMode = "single" | "bulk";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomAlphanumeric(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return result;
}

function formatExpiry(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Map coupon status to AdminStatus for StatusBadge.
 * active → active, expired → suspended, disabled → inactive
 */
function toCouponAdminStatus(
  status: CouponCode["status"]
): "active" | "suspended" | "inactive" {
  if (status === "active")   return "active";
  if (status === "expired")  return "suspended";
  return "inactive";
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CouponCodeManager — manage a list of coupon codes with single-add and
 * bulk-generation modes, plus a table with enable/disable toggle and delete.
 */
export function CouponCodeManager({
  codes,
  onCodesChange,
  onExportCsv,
}: CouponCodeManagerProps) {
  const [mode, setMode]               = useState<GeneratorMode>("single");
  const [singleCode, setSingleCode]   = useState("");
  const [prefix, setPrefix]           = useState("");
  const [bulkCount, setBulkCount]     = useState("10");
  const [codeLength, setCodeLength]   = useState("8");
  const [addError, setAddError]       = useState("");

  // ── Single mode ───────────────────────────────────────────────────────────

  function handleAddSingle() {
    const trimmed = singleCode.trim().toUpperCase();
    if (!trimmed) {
      setAddError("Vui lòng nhập mã giảm giá");
      return;
    }
    if (codes.some((c) => c.code === trimmed)) {
      setAddError("Mã này đã tồn tại");
      return;
    }
    onCodesChange([
      ...codes,
      { code: trimmed, usageCount: 0, status: "active" },
    ]);
    setSingleCode("");
    setAddError("");
  }

  // ── Bulk generation ───────────────────────────────────────────────────────

  function handleBulkGenerate() {
    const count  = Math.min(Math.max(parseInt(bulkCount, 10) || 1, 1), 500);
    const length = Math.min(Math.max(parseInt(codeLength, 10) || 8, 6), 20);
    const suffixLen = Math.max(length - prefix.length, 1);

    const existing = new Set(codes.map((c) => c.code));
    const generated: CouponCode[] = [];
    let attempts = 0;

    while (generated.length < count && attempts < count * 10) {
      attempts++;
      const code = (prefix.toUpperCase() + randomAlphanumeric(suffixLen)).slice(0, length);
      if (!existing.has(code)) {
        existing.add(code);
        generated.push({ code, usageCount: 0, status: "active" });
      }
    }

    onCodesChange([...codes, ...generated]);
  }

  // ── Toggle / delete ───────────────────────────────────────────────────────

  function handleToggle(code: string, enabled: boolean) {
    onCodesChange(
      codes.map((c) =>
        c.code === code
          ? { ...c, status: enabled ? "active" : "disabled" }
          : c
      )
    );
  }

  function handleDelete(code: string) {
    onCodesChange(codes.filter((c) => c.code !== code));
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 rounded-xl border border-secondary-200 bg-secondary-50 p-1 w-fit">
        {(["single", "bulk"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={[
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              mode === m
                ? "bg-white text-secondary-900 shadow-sm"
                : "text-secondary-500 hover:text-secondary-700",
            ].join(" ")}
          >
            {m === "single" ? "Mã đơn lẻ" : "Tạo hàng loạt"}
          </button>
        ))}
      </div>

      {/* ── Single mode ─────────────────────────────────────────────────── */}
      {mode === "single" && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Mã giảm giá"
              value={singleCode}
              onChange={(e) => {
                setSingleCode(e.target.value);
                if (addError) setAddError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSingle();
              }}
              placeholder="VD: SUMMER2026"
              errorMessage={addError || undefined}
            />
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleAddSingle}
            className="mb-px"
          >
            Thêm mã
          </Button>
        </div>
      )}

      {/* ── Bulk generation mode ──────────────────────────────────────────── */}
      {mode === "bulk" && (
        <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-4 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Tiền tố"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="VD: SALE-"
            />
            <Input
              label="Số lượng"
              type="number"
              min={1}
              max={500}
              value={bulkCount}
              onChange={(e) => setBulkCount(e.target.value)}
            />
            <Input
              label="Độ dài mã"
              type="number"
              min={6}
              max={20}
              value={codeLength}
              onChange={(e) => setCodeLength(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={handleBulkGenerate}
            >
              Tạo mã
            </Button>
          </div>
        </div>
      )}

      {/* ── Codes table ─────────────────────────────────────────────────── */}
      {codes.length > 0 && (
        <div className="rounded-xl border border-secondary-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 bg-secondary-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Mã
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Lượt dùng
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Giới hạn
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Hết hạn
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Trạng thái
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {codes.map((coupon) => (
                  <tr
                    key={coupon.code}
                    className="hover:bg-secondary-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-secondary-800 select-all">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-secondary-600">
                      {coupon.usageCount}
                    </td>
                    <td className="px-4 py-3 text-right text-secondary-500">
                      {coupon.usageLimit ?? "∞"}
                    </td>
                    <td className="px-4 py-3 text-secondary-500 text-xs">
                      {formatExpiry(coupon.expiresAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={toCouponAdminStatus(coupon.status)}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Toggle
                          size="sm"
                          checked={coupon.status === "active"}
                          disabled={coupon.status === "expired"}
                          onChange={(e) =>
                            handleToggle(coupon.code, e.target.checked)
                          }
                        />
                        <button
                          type="button"
                          aria-label={`Xóa mã ${coupon.code}`}
                          onClick={() => handleDelete(coupon.code)}
                          className="flex items-center justify-center h-7 w-7 rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
                        >
                          <TrashIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export CSV */}
      {onExportCsv && codes.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<ArrowDownTrayIcon />}
            onClick={onExportCsv}
          >
            Xuất CSV
          </Button>
        </div>
      )}
    </div>
  );
}
