// ─── Flash Sale domain types ───────────────────────────────────────────────────
// ERD: flash_sale + flash_sale_item (2 new tables)

// ── Enums ──────────────────────────────────────────────────────────────────────

export type FlashSaleStatus =
  | "nhap"
  | "sap_dien_ra"
  | "dang_dien_ra"
  | "da_ket_thuc"
  | "huy";

// ── Core entities ──────────────────────────────────────────────────────────────

/**
 * Một phiên bản sản phẩm (variant) trong sự kiện flash sale.
 * Maps to: flash_sale_item table
 */
export interface FlashSaleItem {
  flashSaleItemId: number;
  flashSaleId: number;
  phienBanId: number;
  /** Tên phiên bản (snapshot tại thời điểm thêm vào) */
  tenPhienBan: string;
  /** SKU (snapshot) */
  skuSnapshot: string;
  /** Tên sản phẩm cha */
  sanPhamTen: string;
  /** URL hình ảnh đại diện */
  hinhAnh?: string;
  /** Giá flash sale */
  giaFlash: number;
  /** Snapshot của gia_ban lúc thêm vào (để tính % giảm) */
  giaGocSnapshot: number;
  /** Số lượng tối đa bán được trong sự kiện */
  soLuongGioiHan: number;
  /** Số lượng đã bán trong sự kiện */
  soLuongDaBan: number;
  /** Thứ tự hiển thị trên banner */
  thuTuHienThi: number;
}

/**
 * Sự kiện Flash Sale.
 * Maps to: flash_sale table
 */
export interface FlashSale {
  flashSaleId: number;
  ten: string;
  moTa?: string;
  trangThai: FlashSaleStatus;
  batDau: string;   // ISO timestamp
  ketThuc: string;  // ISO timestamp
  bannerTitle?: string;
  bannerImageUrl?: string;
  /** Alt text for the banner image (for accessibility / SEO) */
  bannerAlt?: string;
  items: FlashSaleItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Summary dùng trong list view (DataTable).
 */
export interface FlashSaleSummary {
  flashSaleId: number;
  ten: string;
  trangThai: FlashSaleStatus;
  batDau: string;
  ketThuc: string;
  soLuongPhienBan: number;
  tongSanPhamDaBan: number;
  tongGioiHan: number;
  createdAt: string;
}

// ── Form payload types ─────────────────────────────────────────────────────────

export interface FlashSaleItemPayload {
  phienBanId: number;
  giaFlash: number;
  /** Snapshot giá gốc (gia_ban tại thời điểm thêm) */
  giaGocSnapshot: number;
  soLuongGioiHan: number;
  thuTuHienThi: number;
  // Display-only fields kept for UI rendering, stripped before API call
  tenPhienBan?: string;
  skuSnapshot?: string;
  sanPhamTen?: string;
  hinhAnh?: string;
}

export interface FlashSaleFormPayload {
  ten: string;
  moTa?: string;
  trangThai: FlashSaleStatus;
  batDau: string;
  ketThuc: string;
  bannerTitle?: string;
  bannerImageUrl?: string;
  bannerAlt?: string;
  items: FlashSaleItemPayload[];
}

// ── Stats ──────────────────────────────────────────────────────────────────────

export interface FlashSaleStats {
  totalEvents: number;
  activeNow: number;
  upcomingCount: number;
  todayCount: number;
}

// ── Search result for VariantPickerModal ───────────────────────────────────────

export interface VariantSearchResult {
  phienBanId: number;
  tenPhienBan: string;
  sku: string;
  sanPhamTen: string;
  hinhAnh?: string;
  giaBan: number;
  trangThai: string;
  tonKho: number;
}

// ── List params ────────────────────────────────────────────────────────────────

export interface FlashSaleListParams {
  page: number;
  limit: number;
  status?: FlashSaleStatus;
  search?: string;
}

// ── Paginated response helper ──────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
