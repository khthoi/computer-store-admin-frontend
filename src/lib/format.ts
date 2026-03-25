/**
 * Formatting utilities for the Online PC Store storefront.
 */

/**
 * Format a number as Vietnamese Dong currency.
 *
 * @example
 * formatVND(1500000)  // "1.500.000 ₫"
 * formatVND(0)        // "0 ₫"
 */
export function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

/**
 * Calculate the discount percentage between original and current price.
 * Returns 0 when originalPrice is 0 or undefined.
 *
 * @example
 * discountPercent(1200000, 1500000)  // 20
 */
export function discountPercent(
  currentPrice: number,
  originalPrice: number
): number {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}
