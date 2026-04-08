import type { FlashSaleItemPayload } from "@/src/types/flash-sale.types";

// ─── Flash Sale Validation Helpers ────────────────────────────────────────────

const ONE_HOUR_MS     = 60 * 60 * 1000;
const MAX_DURATION_MS = 72 * ONE_HOUR_MS;

// ── Item-level errors ──────────────────────────────────────────────────────────

export function validateFlashSaleItem(
  item: FlashSaleItemPayload & { giaGocSnapshot: number },
): string | undefined {
  if (!item.phienBanId || item.phienBanId <= 0) return "Phiên bản sản phẩm không hợp lệ.";
  if (!item.giaFlash || item.giaFlash <= 0)     return "Giá flash phải lớn hơn 0.";
  if (item.giaFlash >= item.giaGocSnapshot && item.giaGocSnapshot > 0)
                                                  return "Giá flash phải nhỏ hơn giá gốc.";
  if (!item.soLuongGioiHan || item.soLuongGioiHan < 1)   return "Số lượng tối thiểu là 1.";
  if (item.soLuongGioiHan > 10_000)                       return "Số lượng tối đa là 10.000.";
  return undefined;
}

// ── Duration helpers ───────────────────────────────────────────────────────────

/**
 * Returns true when the flash-sale window is longer than 72 hours (warning only,
 * not a hard error).
 */
export function isLongDuration(batDau: string, ketThuc: string): boolean {
  if (!batDau || !ketThuc) return false;
  const diff = new Date(ketThuc).getTime() - new Date(batDau).getTime();
  return diff > MAX_DURATION_MS;
}

/**
 * Returns the minimum allowed end-time for a given start-time (start + 1 hour).
 */
export function minEndTime(batDau: string): string {
  if (!batDau) return "";
  const d = new Date(new Date(batDau).getTime() + ONE_HOUR_MS);
  // Format as "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
  return d.toISOString().slice(0, 16);
}
