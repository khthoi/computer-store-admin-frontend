"use client";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function StockCell({ stock }: { stock: number }) {
  const cls =
    stock === 0
      ? "font-semibold text-error-600"
      : stock <= 5
        ? "font-semibold text-error-500"
        : stock <= 20
          ? "font-semibold text-warning-600"
          : "text-secondary-700";
  return <span className={cls}>{stock.toLocaleString()}</span>;
}
