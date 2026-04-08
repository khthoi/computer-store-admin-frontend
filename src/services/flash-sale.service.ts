import {
  MOCK_FLASH_SALES,
  MOCK_FLASH_SALE_SUMMARIES,
  MOCK_FLASH_SALE_STATS,
  MOCK_VARIANTS,
  toFlashSaleSummary,
} from "@/src/app/(dashboard)/promotions/flash-sales/_mock";
import type {
  FlashSale,
  FlashSaleSummary,
  FlashSaleFormPayload,
  FlashSaleStatus,
  FlashSaleStats,
  FlashSaleListParams,
  PaginatedResponse,
  VariantSearchResult,
} from "@/src/types/flash-sale.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let _nextId = MOCK_FLASH_SALES.length + 1;
function nextId(): number {
  return _nextId++;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getFlashSales(
  params: FlashSaleListParams
): Promise<PaginatedResponse<FlashSaleSummary>> {
  await delay();

  let list = [...MOCK_FLASH_SALE_SUMMARIES];

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter((f) => f.ten.toLowerCase().includes(q));
  }

  if (params.status) {
    list = list.filter((f) => f.trangThai === params.status);
  }

  const total = list.length;
  const start = (params.page - 1) * params.limit;
  const data  = list.slice(start, start + params.limit);

  return {
    data,
    total,
    page:       params.page,
    limit:      params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

export async function getFlashSaleById(id: string | number): Promise<FlashSale | null> {
  await delay();
  return MOCK_FLASH_SALES.find((f) => f.flashSaleId === Number(id)) ?? null;
}

export async function createFlashSale(payload: FlashSaleFormPayload): Promise<FlashSale> {
  await delay(600);

  const now = new Date().toISOString();
  const id  = nextId();
  let _itemId = (MOCK_FLASH_SALES.flatMap((f) => f.items).length) + 1;

  const newFlashSale: FlashSale = {
    flashSaleId:    id,
    ten:            payload.ten,
    moTa:           payload.moTa,
    trangThai:      payload.trangThai,
    batDau:         payload.batDau,
    ketThuc:        payload.ketThuc,
    bannerTitle:    payload.bannerTitle,
    bannerImageUrl: payload.bannerImageUrl,
    items:          payload.items.map((item) => ({
      flashSaleItemId: _itemId++,
      flashSaleId:     id,
      phienBanId:      item.phienBanId,
      tenPhienBan:     item.tenPhienBan ?? "",
      skuSnapshot:     item.skuSnapshot ?? "",
      sanPhamTen:      item.sanPhamTen  ?? "",
      hinhAnh:         item.hinhAnh,
      giaFlash:        item.giaFlash,
      giaGocSnapshot:  item.giaGocSnapshot,
      soLuongGioiHan:  item.soLuongGioiHan,
      soLuongDaBan:    0,
      thuTuHienThi:    item.thuTuHienThi,
    })),
    createdBy: "Admin User",
    createdAt: now,
    updatedAt: now,
  };

  MOCK_FLASH_SALES.push(newFlashSale);
  MOCK_FLASH_SALE_SUMMARIES.push(toFlashSaleSummary(newFlashSale));

  return newFlashSale;
}

export async function updateFlashSale(
  id: string | number,
  payload: Partial<FlashSaleFormPayload>
): Promise<FlashSale> {
  await delay(600);

  const idx = MOCK_FLASH_SALES.findIndex((f) => f.flashSaleId === Number(id));
  if (idx === -1) throw new Error(`Flash Sale #${id} không tồn tại.`);

  const existing = MOCK_FLASH_SALES[idx];
  let _itemId = (MOCK_FLASH_SALES.flatMap((f) => f.items).length) + 1;

  const updated: FlashSale = {
    ...existing,
    ...payload,
    flashSaleId: existing.flashSaleId,
    items: payload.items
      ? payload.items.map((item) => ({
          flashSaleItemId: _itemId++,
          flashSaleId:     existing.flashSaleId,
          phienBanId:      item.phienBanId,
          tenPhienBan:     item.tenPhienBan ?? "",
          skuSnapshot:     item.skuSnapshot ?? "",
          sanPhamTen:      item.sanPhamTen  ?? "",
          hinhAnh:         item.hinhAnh,
          giaFlash:        item.giaFlash,
          giaGocSnapshot:  item.giaGocSnapshot,
          soLuongGioiHan:  item.soLuongGioiHan,
          soLuongDaBan:    0,
          thuTuHienThi:    item.thuTuHienThi,
        }))
      : existing.items,
    updatedAt: new Date().toISOString(),
  };

  MOCK_FLASH_SALES[idx] = updated;

  const sumIdx = MOCK_FLASH_SALE_SUMMARIES.findIndex((f) => f.flashSaleId === Number(id));
  if (sumIdx !== -1) MOCK_FLASH_SALE_SUMMARIES[sumIdx] = toFlashSaleSummary(updated);

  return updated;
}

export async function updateFlashSaleStatus(
  id: string | number,
  status: FlashSaleStatus
): Promise<FlashSale> {
  return updateFlashSale(id, { trangThai: status } as Partial<FlashSaleFormPayload>);
}

export async function deleteFlashSale(id: string | number): Promise<void> {
  await delay(400);
  const idx = MOCK_FLASH_SALES.findIndex((f) => f.flashSaleId === Number(id));
  if (idx !== -1) MOCK_FLASH_SALES.splice(idx, 1);
  const sumIdx = MOCK_FLASH_SALE_SUMMARIES.findIndex((f) => f.flashSaleId === Number(id));
  if (sumIdx !== -1) MOCK_FLASH_SALE_SUMMARIES.splice(sumIdx, 1);
}

export async function cancelFlashSale(id: string | number): Promise<FlashSale> {
  return updateFlashSaleStatus(id, "huy");
}

export async function endFlashSaleEarly(id: string | number): Promise<FlashSale> {
  return updateFlashSaleStatus(id, "da_ket_thuc");
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getFlashSaleStats(): Promise<FlashSaleStats> {
  await delay(200);
  // Recompute live stats from current mock data
  const today = new Date().toISOString().slice(0, 10);
  return {
    totalEvents:   MOCK_FLASH_SALES.length,
    activeNow:     MOCK_FLASH_SALES.filter((f) => f.trangThai === "dang_dien_ra").length,
    upcomingCount: MOCK_FLASH_SALES.filter((f) => f.trangThai === "sap_dien_ra").length,
    todayCount:    MOCK_FLASH_SALES.filter((f) =>
      f.trangThai === "dang_dien_ra" || f.batDau.slice(0, 10) === today
    ).length,
  };
}

// ─── Variant search ───────────────────────────────────────────────────────────

export async function searchVariantsForFlashSale(
  query: string
): Promise<VariantSearchResult[]> {
  await delay(300);

  const q = query.trim().toLowerCase();
  if (!q) return [];

  return MOCK_VARIANTS.filter(
    (v) =>
      v.trangThai === "HienThi" &&
      v.tonKho > 0 &&
      (v.tenPhienBan.toLowerCase().includes(q) ||
        v.sanPhamTen.toLowerCase().includes(q) ||
        v.sku.toLowerCase().includes(q))
  );
}

// Re-export stats mock to avoid circular imports
export { MOCK_FLASH_SALE_STATS };
