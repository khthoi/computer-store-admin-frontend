// ══════════════════════════════════════════════════════════════════════════════
// Build PC domain types
// Corresponds to DB tables:
//   buildpc_slot_dinh_nghia, buildpc_quy_tac_tuong_thich,
//   buildpc_da_luu, buildpc_chi_tiet
// ══════════════════════════════════════════════════════════════════════════════

// ─── Enums ────────────────────────────────────────────────────────────────────

/** Algorithm used when the compatibility engine checks a rule */
export type RuleCheckType =
  | "exact_match"   // slot_dich.spec === slot_nguon.spec
  | "contains"      // slot_dich.spec includes slot_nguon.spec value
  | "min_sum"       // sum of slot_dich.spec × heSo >= slot_nguon.spec
  | "min_value";    // slot_dich.spec >= slot_nguon.spec × heSo

/**
 * Lifecycle state of a saved build.
 *  - draft    → user is still selecting parts; not complete, not visible to others
 *  - complete → all required slots filled; visibility controlled separately by `isPublic`
 *
 * `isPublic` is the single source of truth for who can see the build.
 * A separate "shared" status is intentionally absent — complete + isPublic = true
 * already expresses that concept without ambiguity.
 */
export type BuildStatus = "draft" | "complete";

// ─── Slot definition ──────────────────────────────────────────────────────────

/** buildpc_slot_dinh_nghia */
export interface BuildPCSlot {
  id: string;
  tenKhe: string;           // Human label: "CPU", "GPU", "RAM"
  maKhe: string;            // Machine key: "cpu", "gpu", "ram"
  danhMucId: number;        // FK → DanhMuc (product category)
  danhMucTen: string;       // Joined category name
  soLuong: number;          // How many of this slot (e.g. 2 for dual RAM)
  batBuoc: boolean;         // Required in a valid build
  thuTu: number;            // Display / drag-drop order
  moTa?: string;
  isActive: boolean;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface BuildPCSlotFormData {
  tenKhe: string;
  maKhe: string;
  danhMucId: number | "";
  soLuong: number;
  batBuoc: boolean;
  thuTu: number;
  moTa: string;
  isActive: boolean;
}

// ─── Compatibility rule ───────────────────────────────────────────────────────

/** buildpc_quy_tac_tuong_thich */
export interface BuildPCRule {
  id: string;
  /** Slot that provides the reference specification (nguồn) */
  slotNguonId: string;
  slotNguonTen: string;
  /** Slot that must satisfy the rule (đích) */
  slotDichId: string;
  slotDichTen: string;
  /** loai_thong_so.ma_ky_thuat — machine-readable spec key (e.g. "cpu_socket") */
  maKyThuat: string;
  maKyThuatTen: string;     // Human-readable label for the spec key
  loaiKiemTra: RuleCheckType;
  giaTriMacDinh?: string;   // Optional static reference value (overrides slot's spec)
  /** Coefficient — only relevant for min_sum / min_value */
  heSo?: number;
  moTa?: string;
  batBuoc: boolean;         // Hard failure if false → warning; if true → blocking
  isActive: boolean;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface BuildPCRuleFormData {
  slotNguonId: string;
  slotDichId: string;
  maKyThuat: string;
  loaiKiemTra: RuleCheckType;
  giaTriMacDinh: string;
  heSo: string;             // string because it's a form <input>
  moTa: string;
  batBuoc: boolean;
  isActive: boolean;
}

// ─── Saved build ──────────────────────────────────────────────────────────────

/** One line inside a saved build — buildpc_chi_tiet */
export interface BuildPCBuildItem {
  id: string;
  buildId: string;
  slotId: string;
  slotTen: string;
  /** FK → SanPham — needed to build the variant detail URL */
  sanPhamId: string;
  /** FK → PhienBanSanPham */
  phienBanId: string;
  tenPhienBan: string;
  tenSanPham: string;
  SKU: string;
  giaBan: number;
  hinhAnh?: string;
  soLuong: number;
}

/** buildpc_da_luu — list view */
export interface BuildPCBuild {
  id: string;
  /** FK → NguoiDung */
  userId: string;
  customerId: string;       // e.g. "kh-005" — used to build /customers/:id link
  tenNguoiDung: string;
  email: string;
  tenBuild: string;
  moTa?: string;
  trangThai: BuildStatus;
  tongGia: number;
  /**
   * Whether the build appears in the public community listing.
   * Only meaningful when trangThai = "complete".
   * draft + isPublic = true is logically invalid (ignored by the engine).
   */
  isPublic: boolean;
  /**
   * These counters are not in the current ERD — kept as optional for future
   * support. Mock data provides sample values for UI preview only.
   */
  soLuotXem?: number;
  soLuotClone?: number;
  ngayTao: string;
  ngayCapNhat: string;
}

/** buildpc_da_luu + joined buildpc_chi_tiet — detail view */
export interface BuildPCBuildDetail extends BuildPCBuild {
  chiTiet: BuildPCBuildItem[];
}

// ─── Option helpers (for Select components) ───────────────────────────────────

export interface TechKeyOption {
  value: string;      // ma_ky_thuat, e.g. "cpu_socket"
  label: string;      // Human label, e.g. "CPU Socket"
  description?: string; // usage hint
  unit?: string;        // e.g. "W" for tdp_watt
}

export interface SlotOption {
  value: string;      // slot id
  label: string;      // tenKhe
  description?: string; // maKhe
}

export interface CategoryOption {
  value: number;
  label: string;
  description?: string; // slug
}
