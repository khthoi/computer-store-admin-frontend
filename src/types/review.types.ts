// ─── Enums / Unions ───────────────────────────────────────────────────────────

export type ReviewStatus  = "Pending" | "Approved" | "Rejected" | "Hidden";
export type ReviewSource  = "Website" | "App" | "Import";
export type MsgSenderType = "KhachHang" | "NhanVien" | "HeThong";
export type MsgType       = "Reply" | "InternalNote" | "SystemLog";

// ─── Review summary (dùng trong DataTable) ───────────────────────────────────

export interface ReviewSummary {
  reviewId:         number;
  phienBanId:       number;
  sanPhamId?:       number;         // ID sản phẩm cha (để build link đúng)
  tenSanPham:       string;         // tên sản phẩm cha
  tenPhienBan:      string;         // tên biến thể (VD: "RAM 16GB / SSD 512GB")
  skuPhienBan?:     string;         // SKU của phiên bản
  anhPhienBan?:     string;         // URL ảnh thumbnail phiên bản
  khachHangId:      number;
  khachHangTen:     string;
  khachHangSdT?:    string;
  khachHangAvatar?: string;
  donHangId:        number;
  maDonHang:        string;         // VD: "DH-2024-001234"
  rating:           1 | 2 | 3 | 4 | 5;
  tieuDe?:          string;
  noiDung?:         string;
  trangThai:        ReviewStatus;
  daPhanHoi:        boolean;
  helpfulCount:     number;
  nguon:            ReviewSource;
  nguoiDuyetId?:    number;
  nguoiDuyetTen?:   string;
  nguoiDuyetMa?:    string;
  lyDoTuChoi?:      string;
  duyetTai?:        string;         // ISO timestamp
  createdAt:        string;
  updatedAt:        string;
}

// ─── Review detail (dùng trong trang chi tiết) ───────────────────────────────

export interface ReviewDetail extends ReviewSummary {
  messages: ReviewMessage[];
}

// ─── Message ─────────────────────────────────────────────────────────────────

export interface ReviewMessage {
  messageId:           number;
  reviewId:            number;
  senderType:          MsgSenderType;
  senderId?:           number;
  senderCode?:         string;
  senderName:          string;
  senderAvatar?:       string;
  noiDungTinNhan:      string;
  messageType:         MsgType;
  isVisibleToCustomer: boolean;
  createdAt:           string;
  updatedAt:           string;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface ReviewStats {
  tong:       number;
  choDuyet:   number;
  daDuyet:    number;
  tuChoi:     number;
  an:         number;
  tbRating:   number;  // 1 decimal, VD: 4.3
  chuaTraLoi: number;  // approved nhưng chưa có staff reply
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface ReviewFilters {
  search:     string;
  trangThai:  ReviewStatus | "";
  rating:     "" | "1" | "2" | "3" | "4" | "5";
  phienBanId: string;
  dateRange:  { from: Date | null; to: Date | null };
  chuaTraLoi: boolean;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface ModerateReviewPayload {
  reviewId:    number;
  action:      "approve" | "reject" | "hide" | "unhide";
  lyDoTuChoi?: string;  // bắt buộc khi action = "reject"
}

export interface AddReviewMessagePayload {
  reviewId:    number;
  noiDung:     string;
  messageType: "Reply" | "InternalNote";
}

export interface BulkModeratePayload {
  reviewIds:   number[];
  action:      "approve" | "reject";
  lyDoTuChoi?: string;
}
