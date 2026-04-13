// ─── Audit Entity Types ───────────────────────────────────────────────────────
// Mirrors the ERD source tables that generate audit events:
//   DonHang      ← lich_su_trang_thai_don
//   TonKho/NhapXuat ← lich_su_nhap_xuat
//   Ticket       ← ticket_message (loai_tin_nhan: 'SystemLog')
//   DanhGia      ← danh_gia_message (message_type: 'SystemLog')
//   + all other entity types managed by admin staff

export type AuditEntityType =
  | "DonHang"    // Orders
  | "SanPham"    // Products
  | "PhienBan"   // Product variants
  | "KhachHang"  // Customers
  | "NhanVien"   // Employees / Staff
  | "TonKho"     // Inventory stock
  | "NhapXuat"   // Warehouse in/out transactions
  | "KhuyenMai"  // Promotions
  | "MaGiamGia"  // Coupons
  | "FlashSale"  // Flash sales
  | "DanhGia"    // Product reviews (moderation)
  | "Ticket"     // Support tickets
  | "CaiDat"     // System settings
  | "PhanQuyen"; // Roles & permissions

// ─── Audit Action Types ───────────────────────────────────────────────────────

export type AuditActionType =
  | "TaoMoi"       // Create       → success badge
  | "CapNhat"      // Update       → warning badge
  | "Xoa"          // Delete       → error badge
  | "DoiTrangThai" // Status change → info badge
  | "XuatFile"     // Export file  → default badge
  | "NhapFile"     // Import file  → default badge
  | "DangNhap"     // Login        → default badge
  | "DangXuat";    // Logout       → default badge

// ─── Core Entry ───────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  /** Unique log record ID */
  id: string;

  /** Which entity type was affected */
  entityType: AuditEntityType;
  /** Primary key of the affected entity */
  entityId: string;
  /** Human-readable label, e.g. "ĐH-20240413-001", "iPhone 15 Pro" */
  entityLabel: string;

  /** Category of the action */
  actionType: AuditActionType;
  /** Human-readable description, e.g. "Cập nhật trạng thái: Đang xử lý → Đã giao" */
  actionDetail: string;

  /** Staff ID who performed the action; null = system-generated event */
  actorId: number | null;
  /** Display name — "Nguyễn Văn A" or "Hệ thống" */
  actorName: string;
  /** Role slug — "admin" | "staff" | "warehouse" | "cskh" | "system" */
  actorRole: string;
  actorAvatarUrl?: string;

  /** Client IP captured at request time (from Physical ERD requirement) */
  ipAddress?: string;
  /** Browser / client identifier */
  userAgent?: string;

  /** Before / after snapshot for update actions */
  diff?: {
    /** JSON string of previous state */
    before: string;
    /** JSON string of new state */
    after: string;
  };

  /** ISO 8601 timestamp */
  createdAt: string;
}

// ─── Filter & Paginated Result ────────────────────────────────────────────────

export interface AuditLogFilters {
  /** Full-text search across actorName, entityLabel, actionDetail */
  q?: string;
  entityType?: AuditEntityType[];
  actionType?: AuditActionType[];
  /** Filter by specific actor (staff ID as string) */
  actorId?: string;
  /** ISO date string — start of range (inclusive) */
  from?: string;
  /** ISO date string — end of range (inclusive) */
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogResult {
  data: AuditLogEntry[];
  total: number;
}
