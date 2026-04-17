// ─── Notification domain types ─────────────────────────────────────────────────
// Mirrors Physical ERD: bảng thong_bao
// Relationship: khach_hang_id FK → khach_hang (1 row = 1 thông báo cho 1 khách)
// Broadcasting = N INSERT rows (1 per customer per channel)

// ─── Enums ────────────────────────────────────────────────────────────────────

/** kenh_gui VARCHAR(25) */
export type NotificationChannel = "Email" | "SMS" | "Push";

/** trang_thai VARCHAR(20), default 'ChuaGui' */
export type NotificationStatus = "ChuaGui" | "DaGui" | "ThatBai" | "HuyBo";

/** loai_thong_bao VARCHAR(30) */
export type NotificationLoai =
  | "DonHang"    // cập nhật trạng thái đơn hàng
  | "GiaoDich"   // thanh toán thành công / thất bại
  | "HoanHang"   // hoàn trả được duyệt / hoàn tiền
  | "KhuyenMai"  // flash sale, coupon, deal
  | "Loyalty"    // điểm thưởng, thăng hạng thành viên
  | "NhacNho"    // hàng về, giỏ bỏ quên, sắp hết hàng
  | "HeThong";   // broadcast thủ công của admin

// ─── Core entity (maps 1-1 to thong_bao table) ───────────────────────────────

export interface ThongBao {
  /** thong_bao_id PK */
  thongBaoId: number;
  /** khach_hang_id FK → khach_hang, NOT NULL */
  khachHangId: number;
  /** loai_thong_bao VARCHAR(30) */
  loaiThongBao: NotificationLoai;
  /** tieu_de VARCHAR(300) */
  tieuDe: string;
  /** noi_dung TEXT */
  noiDung: string;
  /** kenh_gui: 'Email' | 'SMS' | 'Push' */
  kenhGui: NotificationChannel;
  /** trang_thai, default 'ChuaGui' */
  trangThai: NotificationStatus;
  /** da_doc BOOLEAN default FALSE — meaningful chủ yếu với kênh Push */
  daDoc: boolean;
  /**
   * entity_lien_quan VARCHAR(50) nullable.
   * Polymorphic discriminator: "DonHang" | "GiaoDich" | "HoanHang" | "KhuyenMai"
   */
  entityLienQuan: string | null;
  /** entity_lien_quan_id INT nullable — PK của entity tương ứng */
  entityLienQuanId: number | null;
  /** ngay_tao TIMESTAMP */
  ngayTao: string;
}

// ─── Row type for list page (JOIN khach_hang) ─────────────────────────────────

export interface ThongBaoRow extends ThongBao {
  tenKhachHang: string;
  emailKhachHang: string;
}

// ─── Stats for KPI cards ──────────────────────────────────────────────────────

export interface NotificationStats {
  tongThongBao: number;
  chuaGui: number;
  daGui: number;
  thatBai: number;
  huyBo: number;
  /** Tỷ lệ đã đọc / đã gửi (%), tính riêng cho kênh Push */
  tyLeDaDoc: number;
}

// ─── Query params ──────────────────────────────────────────────────────────────

export interface GetNotificationsParams {
  page?: number;
  pageSize?: number;
  kenhGui?: NotificationChannel[];
  trangThai?: NotificationStatus[];
  loaiThongBao?: NotificationLoai[];
  tuNgay?: string;
  denNgay?: string;
  q?: string;
}

export interface GetNotificationsResult {
  data: ThongBaoRow[];
  total: number;
}

// ─── Form: Tạo thông báo mới ──────────────────────────────────────────────────

/** Đối tượng nhận thông báo */
export type TargetType = "all" | "group" | "specific";

export interface GroupFilter {
  status?: string;    // trạng thái tài khoản: "active" | "inactive" | ...
  tier?: string;      // hạng loyalty: "Bronze" | "Silver" | "Gold" | "Platinum"
}

export interface CreateNotificationPayload {
  targetType: TargetType;
  /** Dùng khi targetType = 'specific' */
  khachHangIds?: number[];
  /** Dùng khi targetType = 'group' */
  groupFilter?: GroupFilter;
  loaiThongBao: NotificationLoai;
  /**
   * Multi-channel: chọn nhiều kênh → tạo N rows/khách.
   * Ví dụ: ['Email', 'Push'] × 3 khách = 6 rows INSERT.
   */
  kenhGui: NotificationChannel[];
  tieuDe: string;
  noiDung: string;
  entityLienQuan?: string;
  entityLienQuanId?: number;
  /** true = gửi ngay (trang_thai='ChuaGui' + trigger batch job), false = lên lịch */
  guiNgay: boolean;
  /** ISO datetime — chỉ dùng khi guiNgay = false */
  thoiGianGui?: string;
}

// ─── Cài đặt tự động ──────────────────────────────────────────────────────────

export interface AutoNotificationRule {
  id: string;
  /** Event trigger key, ví dụ: 'don_hang.xac_nhan', 'giao_dich.that_bai' */
  trigger: string;
  tenHienThi: string;
  moTa: string;
  /** Kênh gửi mặc định */
  kenhGui: NotificationChannel[];
  /**
   * Template tiêu đề — hỗ trợ variables:
   * {{tenKhachHang}}, {{maDonHang}}, {{soTien}}, {{tenSanPham}}, {{diemThuong}}
   */
  templateTieuDe: string;
  /** Template nội dung */
  templateNoiDung: string;
  /** Delay trước khi gửi (giây). 0 = gửi ngay khi trigger */
  delayGiay: number;
  isActive: boolean;
}

export type AutoRuleGroup =
  | "DonHang"
  | "ThanhToan"
  | "HoanTra"
  | "Marketing"
  | "Loyalty";

export interface AutoNotificationRuleGroup {
  group: AutoRuleGroup;
  tenNhom: string;
  rules: AutoNotificationRule[];
}
