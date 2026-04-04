import {
  MOCK_SUPPLIERS,
  MOCK_WAREHOUSES,
  MOCK_INVENTORY_ITEMS,
  MOCK_STOCK_MOVEMENTS,
  MOCK_STOCK_IN_RECORDS,
  MOCK_STOCK_IN_SUMMARIES,
  MOCK_STOCK_OUT_RECORDS,
  MOCK_STOCK_OUT_SUMMARIES,
  MOCK_RETURN_REQUESTS,
  MOCK_RETURN_SUMMARIES,
} from "@/src/app/(dashboard)/inventory/_mock";
import type {
  Warehouse,
  Supplier,
  InventoryItem,
  StockMovement,
  StockInRecord,
  StockInSummary,
  StockOutRecord,
  StockOutSummary,
  ReturnRequest,
  ReturnRequestSummary,
  InventoryStats,
  StockInStatus,
  StockOutStatus,
  StockOutReason,
  ReturnRequestStatus,
} from "@/src/types/inventory.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Inventory Overview ───────────────────────────────────────────────────────

export async function getInventoryStats(): Promise<InventoryStats> {
  await delay();
  const items = MOCK_INVENTORY_ITEMS;
  return {
    totalSkus: items.length,
    totalUnits: items.reduce((s, i) => s + i.quantityOnHand, 0),
    lowStockCount: items.filter((i) => i.alertLevel === "low_stock").length,
    outOfStockCount: items.filter((i) => i.alertLevel === "out_of_stock_inv").length,
    pendingStockIn: MOCK_STOCK_IN_RECORDS.filter((r) =>
      r.status === "pending" || r.status === "partial"
    ).length,
    pendingReturns: MOCK_RETURN_REQUESTS.filter((r) =>
      r.status === "requested" || r.status === "approved" || r.status === "received"
    ).length,
    totalInventoryValue: items.reduce(
      (s, i) => s + i.costPrice * i.quantityOnHand,
      0
    ),
  };
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  await delay();
  return [...MOCK_INVENTORY_ITEMS];
}

export async function adjustStock(
  itemId: string,
  delta: number,
  note: string
): Promise<InventoryItem> {
  await delay();
  const item = MOCK_INVENTORY_ITEMS.find((i) => i.id === itemId);
  if (!item) throw new Error(`Inventory item ${itemId} not found`);

  const before = item.quantityOnHand;
  item.quantityOnHand = Math.max(0, before + delta);
  item.quantityAvailable = Math.max(0, item.quantityOnHand - item.quantityReserved);
  item.alertLevel =
    item.quantityOnHand === 0
      ? "out_of_stock_inv"
      : item.quantityOnHand <= item.lowStockThreshold
      ? "low_stock"
      : "ok";
  item.updatedAt = new Date().toISOString();

  const movement: StockMovement = {
    id: `MOV-${String(MOCK_STOCK_MOVEMENTS.length + 1).padStart(3, "0")}`,
    type: "adjustment",
    productId: item.productId,
    variantId: item.variantId,
    productName: item.productName,
    variantName: item.variantName,
    sku: item.sku,
    quantityBefore: before,
    quantityChange: delta,
    quantityAfter: item.quantityOnHand,
    referenceType: "manual",
    note,
    performedBy: "Admin",
    performedAt: new Date().toISOString(),
  };
  MOCK_STOCK_MOVEMENTS.unshift(movement);

  return { ...item };
}

// ─── Stock Movements ──────────────────────────────────────────────────────────

export async function getStockMovements(): Promise<StockMovement[]> {
  await delay();
  return [...MOCK_STOCK_MOVEMENTS].sort(
    (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
  );
}

// ─── Warehouses ───────────────────────────────────────────────────────────────

export async function getWarehouses(): Promise<Warehouse[]> {
  await delay();
  return [...MOCK_WAREHOUSES];
}

// ─── Receipt Code ─────────────────────────────────────────────────────────────

export function generateReceiptCode(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const dayRecords = MOCK_STOCK_IN_RECORDS.filter((r) =>
    r.receiptCode.includes(datePart)
  ).length;
  const seq = String(dayRecords + 1).padStart(4, "0");
  return `SI-${datePart}-${seq}`;
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export async function getSuppliers(): Promise<Supplier[]> {
  await delay();
  return [...MOCK_SUPPLIERS];
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  await delay();
  return MOCK_SUPPLIERS.find((s) => s.id === id) ?? null;
}

export async function createSupplier(
  payload: Omit<Supplier, "id" | "productCount" | "totalOrders" | "createdAt" | "updatedAt">
): Promise<Supplier> {
  await delay();
  const next = `SUP-${String(MOCK_SUPPLIERS.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const supplier: Supplier = {
    ...payload,
    id: next,
    productCount: 0,
    totalOrders: 0,
    createdAt: now,
    updatedAt: now,
  };
  MOCK_SUPPLIERS.push(supplier);
  return { ...supplier };
}

export async function updateSupplier(
  id: string,
  payload: Partial<Omit<Supplier, "id" | "createdAt">>
): Promise<Supplier> {
  await delay();
  const idx = MOCK_SUPPLIERS.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error(`Supplier ${id} not found`);
  Object.assign(MOCK_SUPPLIERS[idx], payload, { updatedAt: new Date().toISOString() });
  return { ...MOCK_SUPPLIERS[idx] };
}

// ─── Stock In ─────────────────────────────────────────────────────────────────

export async function getStockInList(): Promise<StockInSummary[]> {
  await delay();
  return [...MOCK_STOCK_IN_SUMMARIES].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getStockInById(id: string): Promise<StockInRecord | null> {
  await delay();
  return MOCK_STOCK_IN_RECORDS.find((r) => r.id === id) ?? null;
}

export async function createStockIn(
  payload: Pick<StockInRecord, "receiptCode" | "supplierId" | "supplierName" | "warehouseId" | "warehouseName" | "expectedDate" | "note" | "lineItems">
): Promise<StockInRecord> {
  await delay();
  const next = `SI-${String(MOCK_STOCK_IN_RECORDS.length + 1).padStart(4, "0")}`;
  const now = new Date().toISOString();
  const totalCost = payload.lineItems.reduce(
    (s, l) => s + l.costPrice * l.quantityOrdered,
    0
  );
  const record: StockInRecord = {
    id: next,
    ...payload,
    status: "pending",
    totalCost,
    createdBy: "Admin",
    createdAt: now,
    updatedAt: now,
  };
  MOCK_STOCK_IN_RECORDS.push(record);
  const summary: StockInSummary = {
    id: record.id,
    receiptCode: record.receiptCode,
    supplierId: record.supplierId,
    supplierName: record.supplierName,
    warehouseId: record.warehouseId,
    warehouseName: record.warehouseName,
    status: record.status,
    itemCount: record.lineItems.length,
    totalCost: record.totalCost,
    expectedDate: record.expectedDate,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
  };
  MOCK_STOCK_IN_SUMMARIES.push(summary);
  return { ...record };
}

export async function updateStockInStatus(
  id: string,
  status: StockInStatus,
  receivedDate?: string
): Promise<StockInRecord> {
  await delay();
  const record = MOCK_STOCK_IN_RECORDS.find((r) => r.id === id);
  if (!record) throw new Error(`Stock-in record ${id} not found`);
  record.status = status;
  if (receivedDate) record.receivedDate = receivedDate;
  record.updatedAt = new Date().toISOString();
  // sync summary
  const s = MOCK_STOCK_IN_SUMMARIES.find((s) => s.id === id);
  if (s) { s.status = status; if (receivedDate) s.receivedDate = receivedDate; }
  return { ...record };
}

export async function receiveStockIn(
  id: string,
  receivedQuantities: Record<string, number>
): Promise<StockInRecord> {
  await delay();
  const record = MOCK_STOCK_IN_RECORDS.find((r) => r.id === id);
  if (!record) throw new Error(`Stock-in record ${id} not found`);

  let allFulfilled = true;
  for (const li of record.lineItems) {
    const qty = receivedQuantities[li.id] ?? 0;
    li.quantityReceived = qty;
    if (qty < li.quantityOrdered) allFulfilled = false;

    // Update inventory
    const invItem = MOCK_INVENTORY_ITEMS.find((i) => i.variantId === li.variantId);
    if (invItem && qty > 0) {
      invItem.quantityOnHand += qty;
      invItem.quantityAvailable = invItem.quantityOnHand - invItem.quantityReserved;
      invItem.alertLevel =
        invItem.quantityOnHand === 0
          ? "out_of_stock_inv"
          : invItem.quantityOnHand <= invItem.lowStockThreshold
          ? "low_stock"
          : "ok";
      invItem.lastRestockedAt = new Date().toISOString();
      invItem.updatedAt = new Date().toISOString();
    }
  }

  record.status = allFulfilled ? "received" : "partial";
  record.receivedDate = new Date().toISOString().split("T")[0];
  record.updatedAt = new Date().toISOString();

  const s = MOCK_STOCK_IN_SUMMARIES.find((s) => s.id === id);
  if (s) { s.status = record.status; s.receivedDate = record.receivedDate; }

  return { ...record };
}

// ─── Stock Out ────────────────────────────────────────────────────────────────

export async function getStockOutList(): Promise<StockOutSummary[]> {
  await delay();
  return [...MOCK_STOCK_OUT_SUMMARIES].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getStockOutById(id: string): Promise<StockOutRecord | null> {
  await delay();
  return MOCK_STOCK_OUT_RECORDS.find((r) => r.id === id) ?? null;
}

export async function createStockOut(
  payload: { reason: StockOutReason; note?: string; scheduledDate?: string; lineItems: StockOutRecord["lineItems"] }
): Promise<StockOutRecord> {
  await delay();
  const next = `SO-${String(MOCK_STOCK_OUT_RECORDS.length + 1).padStart(4, "0")}`;
  const now = new Date().toISOString();
  const record: StockOutRecord = {
    id: next,
    ...payload,
    status: "pending",
    createdBy: "Admin",
    createdAt: now,
    updatedAt: now,
  };
  MOCK_STOCK_OUT_RECORDS.push(record);
  const summary: StockOutSummary = {
    id: record.id,
    reason: record.reason,
    status: record.status,
    itemCount: record.lineItems.length,
    scheduledDate: record.scheduledDate,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
  };
  MOCK_STOCK_OUT_SUMMARIES.push(summary);
  return { ...record };
}

export async function updateStockOutStatus(
  id: string,
  status: StockOutStatus
): Promise<StockOutRecord> {
  await delay();
  const record = MOCK_STOCK_OUT_RECORDS.find((r) => r.id === id);
  if (!record) throw new Error(`Stock-out record ${id} not found`);
  record.status = status;
  if (status === "packed") {
    record.completedDate = new Date().toISOString().split("T")[0];
    // Deduct stock and log a movement for each line item
    for (const li of record.lineItems) {
      const invItem = MOCK_INVENTORY_ITEMS.find((i) => i.variantId === li.variantId);
      if (invItem) {
        const before = invItem.quantityOnHand;
        invItem.quantityOnHand = Math.max(0, before - li.quantity);
        invItem.quantityAvailable = Math.max(0, invItem.quantityOnHand - invItem.quantityReserved);
        invItem.alertLevel =
          invItem.quantityOnHand === 0
            ? "out_of_stock_inv"
            : invItem.quantityOnHand <= invItem.lowStockThreshold
            ? "low_stock"
            : "ok";
        invItem.updatedAt = new Date().toISOString();
        const movement: StockMovement = {
          id: `MOV-${String(MOCK_STOCK_MOVEMENTS.length + 1).padStart(3, "0")}`,
          type: "stock_out",
          productId: invItem.productId,
          variantId: invItem.variantId,
          productName: invItem.productName,
          variantName: invItem.variantName,
          sku: invItem.sku,
          quantityBefore: before,
          quantityChange: -li.quantity,
          quantityAfter: invItem.quantityOnHand,
          referenceId: record.id,
          referenceType: "stock_out",
          note: li.note,
          performedBy: "Admin",
          performedAt: new Date().toISOString(),
        };
        MOCK_STOCK_MOVEMENTS.unshift(movement);
      }
    }
  }
  record.updatedAt = new Date().toISOString();
  const s = MOCK_STOCK_OUT_SUMMARIES.find((s) => s.id === id);
  if (s) { s.status = status; s.completedDate = record.completedDate; }
  return { ...record };
}

// ─── Returns ──────────────────────────────────────────────────────────────────

export async function getReturnRequests(): Promise<ReturnRequestSummary[]> {
  await delay();
  return [...MOCK_RETURN_SUMMARIES].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}

export async function getReturnById(id: string): Promise<ReturnRequest | null> {
  await delay();
  return MOCK_RETURN_REQUESTS.find((r) => r.id === id) ?? null;
}

export async function updateReturnStatus(
  id: string,
  status: ReturnRequestStatus,
  adminNote?: string
): Promise<ReturnRequest> {
  await delay();
  const ret = MOCK_RETURN_REQUESTS.find((r) => r.id === id);
  if (!ret) throw new Error(`Return ${id} not found`);
  const now = new Date().toISOString();
  ret.status = status;
  if (adminNote !== undefined) ret.adminNote = adminNote;
  ret.processedBy = "Admin";
  ret.updatedAt = now;
  if (status === "approved") ret.approvedAt = now;
  if (status === "received") ret.receivedAt = now;
  if (status === "completed") ret.completedAt = now;
  const s = MOCK_RETURN_SUMMARIES.find((s) => s.id === id);
  if (s) { s.status = status; s.processedBy = "Admin"; }
  return { ...ret };
}

export async function getLowStockItems(): Promise<InventoryItem[]> {
  await delay();
  return MOCK_INVENTORY_ITEMS.filter(
    (i) => i.alertLevel === "low_stock" || i.alertLevel === "out_of_stock_inv"
  );
}

export async function updateAlertThreshold(
  itemId: string,
  threshold: number
): Promise<InventoryItem> {
  await delay();
  const item = MOCK_INVENTORY_ITEMS.find((i) => i.id === itemId);
  if (!item) throw new Error(`Inventory item ${itemId} not found`);
  item.lowStockThreshold = threshold;
  item.alertLevel =
    item.quantityOnHand === 0
      ? "out_of_stock_inv"
      : item.quantityOnHand <= threshold
      ? "low_stock"
      : "ok";
  item.updatedAt = new Date().toISOString();
  return { ...item };
}
