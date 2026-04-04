"use client";

import { useState } from "react";
import Link from "next/link";
import { ExclamationTriangleIcon, NoSymbolIcon, BellAlertIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { AdjustStockModal } from "@/src/components/admin/inventory/AdjustStockModal";
import { AlertThresholdModal } from "@/src/components/admin/inventory/AlertThresholdModal";
import { AlertConfigTable } from "@/src/components/admin/inventory/AlertConfigTable";
import { adjustStock, updateAlertThreshold } from "@/src/services/inventory.service";
import { formatVND } from "@/src/lib/format";
import { useToast } from "@/src/components/ui/Toast";
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { InventoryItem } from "@/src/types/inventory.types";

type Tab = "alerts" | "configure";

export function LowStockClient({ allItems }: { allItems: InventoryItem[] }) {
  const { showToast } = useToast();
  const [items, setItems] = useState(allItems);
  const [activeTab, setActiveTab] = useState<Tab>("alerts");

  // Adjust stock state
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Alert threshold state
  const [thresholdItem, setThresholdItem] = useState<InventoryItem | null>(null);
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);

  const alertItems = items.filter(
    (i) => i.alertLevel === "low_stock" || i.alertLevel === "out_of_stock_inv"
  );
  const outOfStock = alertItems.filter((i) => i.alertLevel === "out_of_stock_inv");
  const lowStock = alertItems.filter((i) => i.alertLevel === "low_stock");

  async function handleAdjust(delta: number, note: string) {
    if (!adjustingItem) return;
    setIsAdjusting(true);
    try {
      const updated = await adjustStock(adjustingItem.id, delta, note);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setAdjustingItem(null);
      showToast("Stock adjusted.", "success");
    } catch {
      showToast("Failed to adjust stock.", "error");
    } finally {
      setIsAdjusting(false);
    }
  }

  async function handleSaveThreshold(threshold: number) {
    if (!thresholdItem) return;
    setIsSavingThreshold(true);
    try {
      const updated = await updateAlertThreshold(thresholdItem.id, threshold);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setThresholdItem(null);
      showToast("Alert threshold updated.", "success");
    } catch {
      showToast("Failed to update threshold.", "error");
    } finally {
      setIsSavingThreshold(false);
    }
  }

  function ItemCard({ item }: { item: InventoryItem }) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-secondary-100 bg-white p-4 shadow-sm">
        <div className="min-w-0 flex-1">
          <div>
            <Tooltip content={item.productName} placement="top">
              <Link
                href={`/products/${item.productId}`}
                className="inline-block max-w-[200px] truncate text-sm font-semibold text-primary-600 hover:underline"
              >
                {item.productName}
              </Link>
            </Tooltip>
          </div>
          <div>
            <Tooltip content={item.variantName} placement="top">
              <span className="inline-block max-w-[200px] truncate">
                <Link
                  href={`/products/${item.productId}/variants/${item.variantId}`}
                  className="text-xs text-secondary-500 hover:text-primary-500 hover:underline"
                >
                  {item.variantName}
                </Link>
              </span>
            </Tooltip>
          </div>
          <p className="font-mono text-xs text-secondary-400">{item.sku}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs text-secondary-500">
              On hand: <strong className="text-secondary-900">{item.quantityOnHand}</strong>
            </span>
            <span className="text-xs text-secondary-500">
              Threshold: <strong className="text-secondary-700">{item.lowStockThreshold}</strong>
            </span>
            <span className="text-xs text-secondary-500">
              Cost: <strong className="text-secondary-700">{formatVND(item.costPrice)}</strong>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={item.alertLevel} size="sm" />
          <button
            type="button"
            onClick={() => setAdjustingItem(item)}
            className="rounded-lg border border-secondary-200 px-3 py-1.5 text-xs font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            Adjust
          </button>
          <Link
            href="/inventory/stock-in/new"
            className="rounded-lg border border-primary-200 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50 transition-colors"
          >
            Restock
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-secondary-100 bg-secondary-50 p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("alerts")}
          className={[
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "alerts"
              ? "bg-white text-secondary-900 shadow-sm"
              : "text-secondary-500 hover:text-secondary-700",
          ].join(" ")}
        >
          <ExclamationTriangleIcon className="w-4 h-4" />
          Active Alerts
          {alertItems.length > 0 && (
            <span className={[
              "rounded-full px-1.5 py-0.5 text-xs font-semibold",
              activeTab === "alerts"
                ? "bg-error-100 text-error-700"
                : "bg-secondary-200 text-secondary-600",
            ].join(" ")}>
              {alertItems.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("configure")}
          className={[
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "configure"
              ? "bg-white text-secondary-900 shadow-sm"
              : "text-secondary-500 hover:text-secondary-700",
          ].join(" ")}
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          Configure Thresholds
        </button>
      </div>

      {/* Active Alerts tab */}
      {activeTab === "alerts" && (
        <div className="space-y-8">
          {/* Out of stock */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <NoSymbolIcon className="w-5 h-5 text-error-600" />
              <h2 className="text-base font-semibold text-secondary-900">
                Out of Stock ({outOfStock.length})
              </h2>
            </div>
            {outOfStock.length === 0 ? (
              <p className="text-sm text-secondary-400">No out-of-stock items.</p>
            ) : (
              <div className="space-y-2">
                {outOfStock.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* Low stock */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-warning-600" />
              <h2 className="text-base font-semibold text-secondary-900">
                Low Stock ({lowStock.length})
              </h2>
            </div>
            {lowStock.length === 0 ? (
              <p className="text-sm text-secondary-400">No low-stock items.</p>
            ) : (
              <div className="space-y-2">
                {lowStock.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          {alertItems.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-secondary-100 bg-white py-16 text-center shadow-sm">
              <BellAlertIcon className="w-10 h-10 text-success-400 mb-3" />
              <p className="text-base font-semibold text-secondary-700">All stock levels are healthy</p>
              <p className="mt-1 text-sm text-secondary-400">No items are currently below their alert threshold.</p>
            </div>
          )}
        </div>
      )}

      {/* Configure Thresholds tab */}
      {activeTab === "configure" && (
        <AlertConfigTable items={items} onEdit={setThresholdItem} />
      )}

      {/* Adjust Stock modal */}
      {adjustingItem && (
        <AdjustStockModal
          isOpen
          onClose={() => setAdjustingItem(null)}
          onConfirm={handleAdjust}
          itemName={`${adjustingItem.productName} — ${adjustingItem.variantName}`}
          currentQty={adjustingItem.quantityOnHand}
          isConfirming={isAdjusting}
        />
      )}

      {/* Alert Threshold modal */}
      {thresholdItem && (
        <AlertThresholdModal
          isOpen
          onClose={() => setThresholdItem(null)}
          onConfirm={handleSaveThreshold}
          item={thresholdItem}
          isConfirming={isSavingThreshold}
        />
      )}
    </div>
  );
}
