// ─── Enums ─────────────────────────────────────────────────────────────────────

export type TicketStatus =
  | "Moi"           // Mới — chưa ai nhận
  | "DangXuLy"      // Đang xử lý
  | "ChoKhach"      // Chờ phản hồi từ khách
  | "DaGiaiQuyet"   // Đã giải quyết
  | "Dong";         // Đóng hoàn toàn

export type TicketPriority = "Thap" | "TrungBinh" | "Cao" | "KhanCap";

export type TicketIssueType =
  | "HoiTin"
  | "KhieuNai"
  | "YeuCauDoiTra"
  | "LoiKyThuat"
  | "Khac";

export type TicketChannel = "Chat" | "Email" | "DienThoai" | "Form";

export type MessageSenderType = "KhachHang" | "NhanVien" | "HeThong";

export type MessageType = "Reply" | "InternalNote" | "SystemLog";

// ─── Core entities ──────────────────────────────────────────────────────────────

export interface TicketAttachment {
  attachmentId: number;
  messageId:    number;
  fileName:     string;
  fileUrl:      string;
  fileType:     string;  // MIME type
  fileSize:     number;  // bytes
  uploadedAt:   string;
}

export interface TicketMessage {
  messageId:      number;
  ticketId:       number;
  senderType:     MessageSenderType;
  senderId:       number | null;
  senderName:     string;
  senderAvatar?:  string;
  noiDungTinNhan: string;
  loaiTinNhan:    MessageType;
  trangThaiMoi?:  TicketStatus;
  attachments:    TicketAttachment[];
  createdAt:      string;
}

export interface Ticket {
  ticketId:                number;
  maTicket:                string;
  khachHangId:             number;
  khachHangTen:            string;
  khachHangEmail:          string;
  khachHangAvatar?:        string;
  donHangId?:              number;
  donHangMa?:              string;
  loaiVanDe:               TicketIssueType;
  mucDoUuTien:             TicketPriority;
  tieuDe:                  string;
  moTa:                    string;
  kenhLienHe:              TicketChannel;
  trangThai:               TicketStatus;
  tags:                    string[];
  nhanVienPhuTrachId?:     number;
  nhanVienPhuTrachMa?:     string;   // e.g. "nv-010"
  nhanVienPhuTrachTen?:    string;
  nhanVienPhuTrachAvatar?: string;
  messages:                TicketMessage[];
  messageCount:            number;
  ngayTao:                 string;
  ngayCapNhat:             string;
  ngayDong?:               string;
  phanHoiDauLuc?:          string;
  daGiaiQuyetLuc?:         string;
  danhGiaHaiLong?:         number;  // 1–5
  slaDeadline?:            string;
  soLanMoLai:              number;
}

export interface TicketSummary {
  ticketId:                number;
  maTicket:                string;
  khachHangTen:            string;
  khachHangEmail:          string;
  loaiVanDe:               TicketIssueType;
  mucDoUuTien:             TicketPriority;
  tieuDe:                  string;
  kenhLienHe:              TicketChannel;
  trangThai:               TicketStatus;
  tags:                    string[];
  nhanVienPhuTrachTen?:    string;
  nhanVienPhuTrachMa?:     string;   // e.g. "nv-010"
  nhanVienPhuTrachAvatar?: string;
  messageCount:            number;
  lastMessageAt:           string;
  ngayTao:                 string;
  slaDeadline?:            string;
  isSlaBreached:           boolean;
}

// ─── Stats ──────────────────────────────────────────────────────────────────────

export interface TicketStats {
  tongSoTicket:       number;
  dangMo:             number;  // Moi + DangXuLy + ChoKhach
  chuaXuLy:           number;  // Moi, không ai nhận
  khanCap:            number;  // KhanCap && chưa Dong
  slaBreached:        number;
  trungBinhGiaiQuyet: number;  // giờ
}

// ─── Payloads ───────────────────────────────────────────────────────────────────

export interface TicketListParams {
  page:        number;
  limit:       number;
  search?:     string;
  status?:     TicketStatus;
  priority?:   TicketPriority;
  loaiVanDe?:  TicketIssueType;
  assignedTo?: number;
  myOnly?:     boolean;
  dateFrom?:   string;
  dateTo?:     string;
}

export interface PaginatedTickets {
  data:       TicketSummary[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface StaffOption {
  value:           string;  // nhan_vien_id as string
  maNhanVien:      string;  // e.g. "nv-010" — used for /employees/{maNhanVien}
  label:           string;
  avatar?:         string;
  openTicketCount: number;
}

export interface AddMessagePayload {
  ticketId:       number;
  noiDungTinNhan: string;
  loaiTinNhan:    "Reply" | "InternalNote";
  trangThaiMoi?:  TicketStatus;
  files?:         File[];
}

export interface CreateTicketPayload {
  khachHangId:  number;
  donHangId?:   number;
  loaiVanDe:    TicketIssueType;
  mucDoUuTien:  TicketPriority;
  tieuDe:       string;
  moTa:         string;
  kenhLienHe:   TicketChannel;
  assignedTo?:  number;
}

export interface TicketMetaUpdatePayload {
  mucDoUuTien?:        TicketPriority;
  trangThai?:          TicketStatus;
  nhanVienPhuTrachId?: number | null;
  tags?:               string[];
}
