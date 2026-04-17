// ─── Transaction domain types ─────────────────────────────────────────────────
// Mirrors Physical ERD: bảng giao_dich
// Relationship: don_hang_id UNIQUE → 1-1 với don_hang

export type TransactionStatus = "Cho" | "ThanhCong" | "ThatBai" | "DaHoan";

export type TransactionPaymentMethod =
  | "COD"
  | "ChuyenKhoan"
  | "VNPAY"
  | "Momo"
  | "ZaloPay"
  | "TraGop";

// ─── Core entity (maps 1-1 to giao_dich table) ───────────────────────────────

export interface Transaction {
  /** giao_dich_id — PK */
  giaoDichId: number;
  /** don_hang_id — FK unique → don_hang */
  donHangId: number;
  /** phuong_thuc_thanh_toan */
  phuongThucThanhToan: TransactionPaymentMethod;
  /** so_tien — DECIMAL(18,2) */
  soTien: number;
  /** trang_thai_giao_dich */
  trangThaiGiaoDich: TransactionStatus;
  /** ma_giao_dich_ngoai — mã từ cổng thanh toán (VNPay, Momo...) */
  maGiaoDichNgoai: string | null;
  /** ngan_hang_vi — ngân hàng hoặc ví điện tử */
  nganHangVi: string | null;
  /** thoi_diem_thanh_toan — ISO timestamp, null nếu chưa thanh toán */
  thoiDiemThanhToan: string | null;
  /** ngay_tao — ISO timestamp */
  ngayTao: string;
  /** ghi_chu_loi — log lỗi từ cổng thanh toán */
  ghiChuLoi: string | null;
}

// ─── Row type for list page (joined with don_hang + khach_hang) ───────────────

export interface TransactionRow extends Transaction {
  /** ma_don_hang từ don_hang — hiển thị trên UI, link → /orders/[donHangId] */
  maDonHang: string;
  /** khach_hang_id — link → /customers/[khachHangId] */
  khachHangId: number;
  /** ho_ten từ khach_hang */
  tenKhachHang: string;
  /** email từ khach_hang */
  emailKhachHang: string;
}

// ─── Stats for summary cards ──────────────────────────────────────────────────

export interface TransactionStats {
  tongGiaoDich: number;
  tongTien: number;
  soThanhCong: number;
  soThatBai: number;
  soDangCho: number;
  soDaHoan: number;
  /** Tỷ lệ thành công 0-100 */
  tyLeThanhCong: number;
}

// ─── Query params (reflects index: idx_gd_trangthai_ngay) ────────────────────

export interface GetTransactionsParams {
  page?: number;
  pageSize?: number;
  /** Filter theo trang_thai_giao_dich */
  trangThai?: TransactionStatus[];
  /** Filter theo phuong_thuc_thanh_toan */
  phuongThuc?: TransactionPaymentMethod[];
  /** ngay_tao >= tuNgay (ISO date string) */
  tuNgay?: string;
  /** ngay_tao <= denNgay (ISO date string) */
  denNgay?: string;
  /** Search theo ma_giao_dich_ngoai hoặc ma_don_hang */
  q?: string;
}

export interface GetTransactionsResult {
  data: TransactionRow[];
  total: number;
}
