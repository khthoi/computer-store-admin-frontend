import type {
  AuditLogEntry,
  AuditLogFilters,
  AuditLogResult,
  AuditEntityType,
} from "@/src/types/audit-log.types";
import type { AuditEvent } from "@/src/components/admin/shared/AuditLogViewer";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "al-001",
    entityType: "DonHang",
    entityId: "DH-20260413-001",
    entityLabel: "ĐH-20260413-001",
    actionType: "DoiTrangThai",
    actionDetail: "Cập nhật trạng thái: Đang xử lý → Đã giao hàng",
    actorId: 1,
    actorName: "Nguyễn Văn An",
    actorRole: "admin",
    ipAddress: "192.168.1.10",
    diff: {
      before: JSON.stringify({ trang_thai: "DangXuLy" }, null, 2),
      after: JSON.stringify({ trang_thai: "DaGiao" }, null, 2),
    },
    createdAt: "2026-04-13T10:32:00Z",
  },
  {
    id: "al-002",
    entityType: "SanPham",
    entityId: "SP-0042",
    entityLabel: "MacBook Pro M3 14 inch",
    actionType: "CapNhat",
    actionDetail: "Cập nhật giá bán: 45.990.000đ → 43.500.000đ",
    actorId: 2,
    actorName: "Trần Thị Bích",
    actorRole: "staff",
    ipAddress: "192.168.1.22",
    diff: {
      before: JSON.stringify({ gia_ban: 45990000, gia_khuyen_mai: null }, null, 2),
      after: JSON.stringify({ gia_ban: 43500000, gia_khuyen_mai: 43500000 }, null, 2),
    },
    createdAt: "2026-04-13T09:15:00Z",
  },
  {
    id: "al-003",
    entityType: "KhachHang",
    entityId: "KH-0891",
    entityLabel: "Lê Minh Quân (lequan@gmail.com)",
    actionType: "DoiTrangThai",
    actionDetail: "Đổi trạng thái tài khoản: Hoạt động → Tạm khóa",
    actorId: 1,
    actorName: "Nguyễn Văn An",
    actorRole: "admin",
    ipAddress: "192.168.1.10",
    diff: {
      before: JSON.stringify({ trang_thai: "active", ly_do: null }, null, 2),
      after: JSON.stringify({ trang_thai: "banned", ly_do: "Vi phạm chính sách thanh toán" }, null, 2),
    },
    createdAt: "2026-04-13T08:50:00Z",
  },
  {
    id: "al-004",
    entityType: "NhapXuat",
    entityId: "NX-20260413-007",
    entityLabel: "Phiếu nhập kho #NX-20260413-007",
    actionType: "TaoMoi",
    actionDetail: "Nhập kho 50 đơn vị RAM Kingston 16GB DDR5 — NCC: Kingston VN",
    actorId: 3,
    actorName: "Phạm Hoàng Kho",
    actorRole: "warehouse",
    ipAddress: "10.0.0.55",
    createdAt: "2026-04-13T08:00:00Z",
  },
  {
    id: "al-005",
    entityType: "DanhGia",
    entityId: "DG-0234",
    entityLabel: "Đánh giá SP-0042 — 4⭐ bởi Lê Văn C",
    actionType: "DoiTrangThai",
    actionDetail: "Phê duyệt đánh giá: Pending → Approved",
    actorId: 4,
    actorName: "Vũ Thị Duyệt",
    actorRole: "cskh",
    ipAddress: "192.168.1.31",
    diff: {
      before: JSON.stringify({ review_status: "Pending" }, null, 2),
      after: JSON.stringify({ review_status: "Approved", duyet_tai: "2026-04-13T07:45:00Z" }, null, 2),
    },
    createdAt: "2026-04-13T07:45:00Z",
  },
  {
    id: "al-006",
    entityType: "MaGiamGia",
    entityId: "MGG-SUMMER26",
    entityLabel: "SUMMER26 — Giảm 15%",
    actionType: "TaoMoi",
    actionDetail: "Tạo mã giảm giá SUMMER26 — Giảm 15%, tối đa 500.000đ, hạn dùng 30/06/2026",
    actorId: 2,
    actorName: "Trần Thị Bích",
    actorRole: "staff",
    ipAddress: "192.168.1.22",
    createdAt: "2026-04-12T16:30:00Z",
  },
  {
    id: "al-007",
    entityType: "Ticket",
    entityId: "TK-0889",
    entityLabel: "TK-0889 — Khiếu nại giao hàng sai",
    actionType: "DoiTrangThai",
    actionDetail: "Cập nhật trạng thái ticket: InProgress → Resolved",
    actorId: 4,
    actorName: "Vũ Thị Duyệt",
    actorRole: "cskh",
    ipAddress: "192.168.1.31",
    diff: {
      before: JSON.stringify({ trang_thai: "InProgress", xu_ly_boi: "Vũ Thị Duyệt" }, null, 2),
      after: JSON.stringify({ trang_thai: "Resolved", xu_ly_boi: "Vũ Thị Duyệt", ghi_chu: "Đã hoàn tiền và gửi lại hàng đúng" }, null, 2),
    },
    createdAt: "2026-04-12T15:10:00Z",
  },
  {
    id: "al-008",
    entityType: "FlashSale",
    entityId: "FS-20260415",
    entityLabel: "Flash Sale 15/04 — Linh kiện PC",
    actionType: "TaoMoi",
    actionDetail: "Tạo chương trình Flash Sale: 20h–22h ngày 15/04/2026, 12 sản phẩm tham gia",
    actorId: 2,
    actorName: "Trần Thị Bích",
    actorRole: "staff",
    ipAddress: "192.168.1.22",
    createdAt: "2026-04-12T14:00:00Z",
  },
  {
    id: "al-009",
    entityType: "CaiDat",
    entityId: "setting-shipping",
    entityLabel: "Cài đặt vận chuyển",
    actionType: "CapNhat",
    actionDetail: "Cập nhật ngưỡng miễn phí vận chuyển: 500.000đ → 399.000đ",
    actorId: 1,
    actorName: "Nguyễn Văn An",
    actorRole: "admin",
    ipAddress: "192.168.1.10",
    diff: {
      before: JSON.stringify({ mien_phi_van_chuyen_tu: 500000 }, null, 2),
      after: JSON.stringify({ mien_phi_van_chuyen_tu: 399000 }, null, 2),
    },
    createdAt: "2026-04-12T11:20:00Z",
  },
  {
    id: "al-010",
    entityType: "SanPham",
    entityId: "SP-0099",
    entityLabel: "Card màn hình RTX 4060 8GB",
    actionType: "Xoa",
    actionDetail: "Xóa sản phẩm khỏi danh mục — lý do: Ngừng kinh doanh",
    actorId: 1,
    actorName: "Nguyễn Văn An",
    actorRole: "admin",
    ipAddress: "192.168.1.10",
    createdAt: "2026-04-12T10:05:00Z",
  },
  {
    id: "al-011",
    entityType: "NhanVien",
    entityId: "NV-0015",
    entityLabel: "Đặng Quốc Hùng (dhung@techstore.vn)",
    actionType: "TaoMoi",
    actionDetail: "Tạo tài khoản nhân viên mới — vai trò: warehouse",
    actorId: 1,
    actorName: "Nguyễn Văn An",
    actorRole: "admin",
    ipAddress: "192.168.1.10",
    createdAt: "2026-04-11T15:40:00Z",
  },
  {
    id: "al-012",
    entityType: "PhanQuyen",
    entityId: "role-warehouse",
    entityLabel: "Vai trò: warehouse",
    actionType: "CapNhat",
    actionDetail: "Cập nhật quyền: Thêm quyền 'inventory.export' cho vai trò warehouse",
    actorId: 1,
    actorName: "Nguyễn Văn An",
    actorRole: "admin",
    ipAddress: "192.168.1.10",
    diff: {
      before: JSON.stringify({ permissions: ["inventory.read", "inventory.write"] }, null, 2),
      after: JSON.stringify({ permissions: ["inventory.read", "inventory.write", "inventory.export"] }, null, 2),
    },
    createdAt: "2026-04-11T15:00:00Z",
  },
  {
    id: "al-013",
    entityType: "KhuyenMai",
    entityId: "KM-0022",
    entityLabel: "Khuyến mãi tháng 4 — Laptop",
    actionType: "TaoMoi",
    actionDetail: "Tạo chương trình khuyến mãi: Giảm 10% toàn bộ Laptop, áp dụng 01/04–30/04/2026",
    actorId: 2,
    actorName: "Trần Thị Bích",
    actorRole: "staff",
    ipAddress: "192.168.1.22",
    createdAt: "2026-04-10T09:00:00Z",
  },
  {
    id: "al-014",
    entityType: "DonHang",
    entityId: "DH-20260410-045",
    entityLabel: "ĐH-20260410-045",
    actionType: "DoiTrangThai",
    actionDetail: "Xác nhận hoàn tiền 2.500.000đ — yêu cầu đổi trả",
    actorId: 4,
    actorName: "Vũ Thị Duyệt",
    actorRole: "cskh",
    ipAddress: "192.168.1.31",
    diff: {
      before: JSON.stringify({ hoan_tien: null, trang_thai_doi_tra: "Pending" }, null, 2),
      after: JSON.stringify({ hoan_tien: 2500000, trang_thai_doi_tra: "Approved" }, null, 2),
    },
    createdAt: "2026-04-10T16:20:00Z",
  },
  {
    id: "al-015",
    entityType: "TonKho",
    entityId: "TK-SP0042-WH01",
    entityLabel: "Tồn kho MacBook Pro M3 — Kho Hà Nội",
    actionType: "CapNhat",
    actionDetail: "Điều chỉnh số lượng tồn kho: 12 → 8 (xuất theo đơn ĐH-20260410-045)",
    actorId: 3,
    actorName: "Phạm Hoàng Kho",
    actorRole: "warehouse",
    ipAddress: "10.0.0.55",
    diff: {
      before: JSON.stringify({ so_luong: 12 }, null, 2),
      after: JSON.stringify({ so_luong: 8 }, null, 2),
    },
    createdAt: "2026-04-10T15:55:00Z",
  },
  {
    id: "al-016",
    entityType: "DonHang",
    entityId: "DH-20260409-112",
    entityLabel: "ĐH-20260409-112",
    actionType: "XuatFile",
    actionDetail: "Xuất danh sách đơn hàng tháng 4/2026 — định dạng Excel (124 bản ghi)",
    actorId: 1,
    actorName: "Nguyễn Văn An",
    actorRole: "admin",
    ipAddress: "192.168.1.10",
    createdAt: "2026-04-09T17:00:00Z",
  },
  {
    id: "al-017",
    entityType: "SanPham",
    entityId: "SP-0110",
    entityLabel: "SSD Samsung 980 Pro 1TB",
    actionType: "NhapFile",
    actionDetail: "Nhập hàng loạt thông số kỹ thuật từ file Excel — 1 sản phẩm được cập nhật",
    actorId: 2,
    actorName: "Trần Thị Bích",
    actorRole: "staff",
    ipAddress: "192.168.1.22",
    createdAt: "2026-04-09T10:30:00Z",
  },
  {
    id: "al-018",
    entityType: "NhanVien",
    entityId: "NV-0001",
    entityLabel: "Nguyễn Văn An (admin@techstore.vn)",
    actionType: "DangNhap",
    actionDetail: "Đăng nhập thành công — trình duyệt: Chrome 124, Windows 11",
    actorId: 1,
    actorName: "Nguyễn Văn An",
    actorRole: "admin",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
    createdAt: "2026-04-09T08:01:00Z",
  },
  {
    id: "al-019",
    entityType: "DanhGia",
    entityId: "DG-0199",
    entityLabel: "Đánh giá SP-0110 — 2⭐ bởi Trần Văn D",
    actionType: "DoiTrangThai",
    actionDetail: "Ẩn đánh giá vi phạm: Pending → Hidden — lý do: Nội dung không phù hợp",
    actorId: 4,
    actorName: "Vũ Thị Duyệt",
    actorRole: "cskh",
    ipAddress: "192.168.1.31",
    diff: {
      before: JSON.stringify({ review_status: "Pending", ly_do_tu_choi: null }, null, 2),
      after: JSON.stringify({ review_status: "Hidden", ly_do_tu_choi: "Nội dung không phù hợp" }, null, 2),
    },
    createdAt: "2026-04-08T14:22:00Z",
  },
  {
    id: "al-020",
    entityType: "PhienBan",
    entityId: "PB-0042-SLV",
    entityLabel: "MacBook Pro M3 — Màu bạc 16GB/512GB",
    actionType: "CapNhat",
    actionDetail: "Cập nhật SKU và barcode phiên bản sản phẩm",
    actorId: 2,
    actorName: "Trần Thị Bích",
    actorRole: "staff",
    ipAddress: "192.168.1.22",
    diff: {
      before: JSON.stringify({ sku: "MBP-M3-SLV", barcode: null }, null, 2),
      after: JSON.stringify({ sku: "APPLE-MBP-M3-14-SLV-16-512", barcode: "8938560123456" }, null, 2),
    },
    createdAt: "2026-04-08T11:05:00Z",
  },
  {
    id: "al-021",
    entityType: "Ticket",
    entityId: "TK-0901",
    entityLabel: "TK-0901 — Lỗi thanh toán VNPAY",
    actionType: "TaoMoi",
    actionDetail: "Mở ticket mới từ khách hàng Nguyễn Thị E — phân loại: Thanh toán",
    actorId: null,
    actorName: "Hệ thống",
    actorRole: "system",
    createdAt: "2026-04-07T21:15:00Z",
  },
  {
    id: "al-022",
    entityType: "NhapXuat",
    entityId: "NX-20260407-003",
    entityLabel: "Phiếu xuất kho #NX-20260407-003",
    actionType: "TaoMoi",
    actionDetail: "Xuất kho 5 đơn vị iPhone 15 Pro — phục vụ đơn ĐH-20260407-088",
    actorId: 3,
    actorName: "Phạm Hoàng Kho",
    actorRole: "warehouse",
    ipAddress: "10.0.0.55",
    createdAt: "2026-04-07T14:30:00Z",
  },
  {
    id: "al-023",
    entityType: "MaGiamGia",
    entityId: "MGG-WELCOME10",
    entityLabel: "WELCOME10 — Giảm 10% đơn đầu",
    actionType: "CapNhat",
    actionDetail: "Cập nhật giới hạn sử dụng: 1000 → 2000 lượt",
    actorId: 2,
    actorName: "Trần Thị Bích",
    actorRole: "staff",
    ipAddress: "192.168.1.22",
    diff: {
      before: JSON.stringify({ gioi_han_su_dung: 1000 }, null, 2),
      after: JSON.stringify({ gioi_han_su_dung: 2000 }, null, 2),
    },
    createdAt: "2026-04-07T10:00:00Z",
  },
  {
    id: "al-024",
    entityType: "NhanVien",
    entityId: "NV-0004",
    entityLabel: "Vũ Thị Duyệt (vduyet@techstore.vn)",
    actionType: "DangXuat",
    actionDetail: "Đăng xuất — phiên làm việc kết thúc sau 7 giờ 23 phút",
    actorId: 4,
    actorName: "Vũ Thị Duyệt",
    actorRole: "cskh",
    ipAddress: "192.168.1.31",
    createdAt: "2026-04-06T17:58:00Z",
  },
  {
    id: "al-025",
    entityType: "CaiDat",
    entityId: "setting-payment",
    entityLabel: "Cài đặt thanh toán",
    actionType: "CapNhat",
    actionDetail: "Kích hoạt cổng thanh toán MoMo Wallet",
    actorId: 1,
    actorName: "Nguyễn Văn An",
    actorRole: "admin",
    ipAddress: "192.168.1.10",
    diff: {
      before: JSON.stringify({ momo_enabled: false }, null, 2),
      after: JSON.stringify({ momo_enabled: true, momo_partner_code: "MOMO_TS_2026" }, null, 2),
    },
    createdAt: "2026-04-06T11:00:00Z",
  },
];

// Sort newest-first (mock data is already in order, but sort to be safe)
const SORTED_MOCK = [...MOCK_AUDIT_LOGS].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Fetch all audit log entries with optional filtering and pagination.
 * Mock implementation — replace with GET /admin/audit-logs
 */
export async function getAuditLogs(
  params: AuditLogFilters = {}
): Promise<AuditLogResult> {
  const {
    q = "",
    entityType = [],
    actionType = [],
    from,
    to,
    page = 1,
    pageSize = 20,
  } = params;

  let filtered = [...SORTED_MOCK];

  // Full-text search
  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.actorName.toLowerCase().includes(lower) ||
        e.entityLabel.toLowerCase().includes(lower) ||
        e.actionDetail.toLowerCase().includes(lower) ||
        e.entityId.toLowerCase().includes(lower)
    );
  }

  // Entity type filter
  if (entityType.length > 0) {
    filtered = filtered.filter((e) => entityType.includes(e.entityType));
  }

  // Action type filter
  if (actionType.length > 0) {
    filtered = filtered.filter((e) => actionType.includes(e.actionType));
  }

  // Date range filter
  if (from) {
    const fromMs = new Date(from).getTime();
    filtered = filtered.filter((e) => new Date(e.createdAt).getTime() >= fromMs);
  }
  if (to) {
    // include the full "to" day by setting time to end of day
    const toMs = new Date(to).getTime() + 86400000 - 1;
    filtered = filtered.filter((e) => new Date(e.createdAt).getTime() <= toMs);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  // Simulate async network call
  await Promise.resolve();

  return { data, total };
}

/**
 * Fetch audit log entries for a specific entity.
 * Used by AuditLogViewer in detail page sidebars.
 * Mock implementation — replace with GET /admin/audit-logs?entityType=X&entityId=Y
 */
export async function getEntityAuditLogs(
  entityType: AuditEntityType,
  entityId: string
): Promise<AuditLogEntry[]> {
  await Promise.resolve();
  return SORTED_MOCK.filter(
    (e) => e.entityType === entityType && e.entityId === entityId
  );
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Convert AuditLogEntry → AuditEvent (used by the existing AuditLogViewer component).
 * Ensures backward compatibility without duplicating the viewer component.
 */
export function toAuditEvent(entry: AuditLogEntry): AuditEvent {
  return {
    id: entry.id,
    timestamp: entry.createdAt,
    actorName: entry.actorName,
    actorAvatarUrl: entry.actorAvatarUrl,
    actorRole: entry.actorRole,
    action: entry.actionDetail,
    diff: entry.diff,
  };
}
