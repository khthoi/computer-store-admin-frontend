// ─── Product domain types ─────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  sku: string;
  /** Human-readable variant label, e.g. "256GB / Space Grey" */
  name: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
  /**
   * Variant-level thumbnail. Each variant has its own image.
   * Products themselves do not carry a thumbnail — the image is on the variant.
   */
  thumbnailUrl?: string;
  /** ISO date string for when this variant was last modified */
  updatedAt: string;
  /** True for the single variant shown by default on listing/product cards */
  isDefault?: boolean;
}

export type CreatorRole = "Admin" | "Editor" | "Staff";

export interface ProductCreator {
  name: string;
  role: CreatorRole;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId: string;
  /** One or more brand labels associated with this product */
  brands: string[];
  /**
   * Products do NOT have thumbnails — images belong to individual variants.
   * This field is intentionally absent; see ProductVariant.thumbnailUrl.
   */
  totalStock: number;
  status: "published" | "draft" | "archived";
  variants: ProductVariant[];
  /**
   * When true, the product has active orders and cannot be deleted.
   * Populated from the API; used by the delete guard in ProductsTable.
   */
  hasActiveOrders?: boolean;
  /** ID of the variant shown by default on listing/product cards */
  defaultVariantId?: string;
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
  /** Average customer rating out of 5 */
  averageRating?: number;
  /** Total number of customer reviews */
  reviewCount?: number;
  /** Staff member who created this product entry */
  createdBy?: ProductCreator;
}

export type ProductStatus = Product["status"];
export type VariantStatus = ProductVariant["status"];

// ─── Variant detail types (richer model for the variant detail page) ──────────

export type DetailVariantStatus = "visible" | "hidden" | "out_of_stock";
export type MediaType = "main" | "gallery" | "360";

export interface VariantMedia {
  id: string;
  variantId: string;
  url: string;
  /** FK → media_asset. null = URL fallback (external / paste). */
  assetId?: string | null;
  type: MediaType;
  order: number;
  altText?: string;
  /** Short caption displayed below the image on storefront (optional) */
  caption?: string;
}

export interface SpecificationItem {
  id: string;
  typeId: string;
  typeLabel: string;
  /** Optional description / hint for this spec attribute */
  description?: string;
  /**
   * Machine-readable key for the Build PC compatibility engine.
   * Format: lowercase letters, digits, underscores only (e.g. "cpu_socket").
   */
  maKyThuat?: string;

  // ── Metadata từ loai_thong_so ─────────────────────────────────────────────
  /** Kiểu dữ liệu — ERD: loai_thong_so.kieu_du_lieu */
  kieuDuLieu?: "text" | "number" | "boolean" | "enum";
  /** Đơn vị (chỉ khi kieuDuLieu='number') — ERD: loai_thong_so.don_vi */
  donVi?: string;
  /** Trường này có bắt buộc nhập không — ERD: loai_thong_so.batBuoc */
  batBuoc?: boolean;
  /** Dùng làm facet filter — ERD: loai_thong_so.co_the_loc */
  coTheLoc?: boolean;
  /** Dạng widget bộ lọc — ERD: loai_thong_so.widget_loc */
  widgetLoc?: "checkbox" | "range" | "toggle" | "select" | "combo-select";
  /** Thứ tự trong sidebar bộ lọc — ERD: loai_thong_so.thu_tu_loc */
  thuTuLoc?: number;
  /** Thứ tự hiển thị trong nhóm — ERD: loai_thong_so.thu_tu_hien_thi */
  thuTuHienThi?: number;

  // ── Giá trị thực tế từ gia_tri_thong_so ──────────────────────────────────
  /** Lightweight HTML — plain text, ul/li, bold/italic only */
  value: string;
  /** Text chuẩn hóa dùng cho enum filter — ERD: gia_tri_thong_so.gia_tri_chuan */
  giaTriChuan?: string;
  /** Giá trị số dùng cho range filter — ERD: gia_tri_thong_so.gia_tri_so */
  giaTriSo?: number | null;
}

export interface SpecificationGroup {
  id: string;
  label: string;
  /** true = inherited from parent category; false = directly assigned */
  inherited: boolean;
  /** Thứ tự hiển thị nhóm trong danh mục — ERD: danh_muc_nhom_thong_so.thuTuHienThi */
  displayOrder?: number;
  /** Hiển thị nhóm trong sidebar bộ lọc — ERD: danh_muc_nhom_thong_so.hien_thi_bo_loc */
  hienThiBoLoc?: boolean;
  /** Thứ tự nhóm trong sidebar bộ lọc — ERD: danh_muc_nhom_thong_so.thu_tu_bo_loc */
  thuTuBoLoc?: number;
  items: SpecificationItem[];
}

export interface ProductVariantDetail {
  id: string;
  productId: string;
  /** tenPhienBan */
  name: string;
  sku: string;
  /** True for the single variant shown by default on listing/product cards */
  isDefault?: boolean;
  /** giaGoc */
  originalPrice: number;
  /** giaBan */
  salePrice: number;
  /** trongLuong (kg) */
  weight?: number;
  status: DetailVariantStatus;
  updatedAt: string;
  /** moTaChiTiet — full HTML from Quill */
  description: string;
  specificationGroups: SpecificationGroup[];
  media: VariantMedia[];
}

// ─── Variant stats ────────────────────────────────────────────────────────────

export interface VariantSalesStats {
  tongDonHang:    number;   // tổng đơn hàng chứa phiên bản này
  tongSoLuongBan: number;   // tổng số lượng đã bán
  doanhThu:       number;   // doanh thu từ phiên bản (VND)
  tyLeHoanTra:    number;   // tỉ lệ hoàn trả (0–100, 1 decimal)
}

export interface VariantReviewStats {
  tongDanhGia:  number;
  daDuyet:      number;
  choDuyet:     number;
  tuChoi:       number;
  daAn:         number;
  tbRating:     number;   // 1 decimal, e.g. 4.3
  phanBoRating: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
}
