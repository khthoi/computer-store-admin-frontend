import type {
  Ticket,
  TicketSummary,
  TicketStats,
  StaffOption,
} from "@/src/types/ticket.types";

// ─── Staff ─────────────────────────────────────────────────────────────────────

export const MOCK_STAFF: StaffOption[] = [
  { value: "10", maNhanVien: "nv-010", label: "Nguyễn Thị Lan",  openTicketCount: 4 },
  { value: "11", maNhanVien: "nv-011", label: "Trần Minh Khoa",  openTicketCount: 7 },
  { value: "12", maNhanVien: "nv-012", label: "Phạm Thị Hương",  openTicketCount: 2 },
];

// Lookup map: staffId → maNhanVien
const STAFF_MA: Record<number, string> = Object.fromEntries(
  MOCK_STAFF.map((s) => [Number(s.value), s.maNhanVien])
) as Record<number, string>;

// ─── Mock customers (for quick ref) ───────────────────────────────────────────

const CUSTOMERS = [
  { id: 1, ten: "Lê Văn Hùng",       email: "lehung@gmail.com"    },
  { id: 2, ten: "Nguyễn Thị Mai",    email: "ntmai@outlook.com"   },
  { id: 3, ten: "Phạm Quốc Bảo",    email: "pqbao@yahoo.com"     },
  { id: 4, ten: "Trần Thị Kim Oanh", email: "tkoanh@gmail.com"    },
  { id: 5, ten: "Đỗ Minh Tú",        email: "dominhtu@gmail.com"  },
  { id: 6, ten: "Vũ Thị Thu",        email: "vuthu@company.vn"    },
  { id: 7, ten: "Hoàng Văn Long",    email: "hvlong@hotmail.com"  },
  { id: 8, ten: "Bùi Thị Ngọc",      email: "btngoc@gmail.com"    },
];

// ─── Helper ────────────────────────────────────────────────────────────────────

function iso(daysAgo: number, hoursAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

// SLA deadline: based on priority
function sla(createdIso: string, priority: string): string {
  const h = priority === "KhanCap" ? 2 : priority === "Cao" ? 8 : priority === "TrungBinh" ? 24 : 72;
  const d = new Date(new Date(createdIso).getTime() + h * 3_600_000);
  return d.toISOString();
}

let _msgId = 100;
function msgId() { return _msgId++; }

// ─── Mock Tickets ──────────────────────────────────────────────────────────────

export const MOCK_TICKETS: Ticket[] = [
  // ── 1. Mới, Khẩn cấp — Lỗi kỹ thuật, chưa assign, SLA vi phạm ─────────────
  {
    ticketId: 1,
    maTicket: "TK-000001",
    khachHangId: 1,
    khachHangTen: CUSTOMERS[0].ten,
    khachHangEmail: CUSTOMERS[0].email,
    loaiVanDe: "LoiKyThuat",
    mucDoUuTien: "KhanCap",
    tieuDe: "Màn hình laptop bị sọc dọc sau 3 ngày sử dụng",
    moTa: "Sau 3 ngày mua máy, màn hình xuất hiện các đường sọc dọc màu xanh. Máy vẫn hoạt động nhưng màn hình không dùng được. Cần hỗ trợ gấp vì đang dùng cho công việc.",
    kenhLienHe: "Form",
    trangThai: "Moi",
    tags: ["bảo hành", "màn hình"],
    messageCount: 2,
    ngayTao: iso(3),
    ngayCapNhat: iso(3),
    slaDeadline: iso(2, 22),  // đã quá hạn
    isSlaBreached: true,
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 1, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Form",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(3),
      },
      {
        messageId: msgId(), ticketId: 1, senderType: "KhachHang", senderId: 1,
        senderName: CUSTOMERS[0].ten, noiDungTinNhan: "Sau 3 ngày mua máy, màn hình xuất hiện các đường sọc dọc màu xanh. Máy vẫn hoạt động nhưng màn hình không dùng được. Cần hỗ trợ gấp vì đang dùng cho công việc.",
        loaiTinNhan: "Reply", attachments: [
          { attachmentId: 1, messageId: 102, fileName: "man_hinh_soc.jpg", fileUrl: "https://cdn.hstatic.net/products/200000722513/anv16-41_a58364e4b1284939b73c8cfbd58c1858_master.png", fileType: "image/jpeg", fileSize: 245_000, uploadedAt: iso(3) },
          { attachmentId: 2, messageId: 102, fileName: "ma_nhan_vien.jpg", fileUrl: "https://product.hstatic.net/200000722513/product/ava_ded8eaa81f5f4850a4f6fea27adc83b2_master.png", fileType: "image/jpeg", fileSize: 50_000, uploadedAt: iso(3) },
        ], createdAt: iso(3),
      },
    ],
  },

  // ── 2. Mới, Cao — Khiếu nại, chưa assign ────────────────────────────────────
  {
    ticketId: 2,
    maTicket: "TK-000002",
    khachHangId: 2,
    khachHangTen: CUSTOMERS[1].ten,
    khachHangEmail: CUSTOMERS[1].email,
    loaiVanDe: "KhieuNai",
    mucDoUuTien: "Cao",
    tieuDe: "Giao hàng sai sản phẩm — đặt RAM 16GB nhận được 8GB",
    moTa: "Tôi đặt RAM DDR5 16GB nhưng nhận được hàng là 8GB. Hộp bao bì có ghi 16GB nhưng bên trong là 8GB. Yêu cầu đổi lại đúng sản phẩm.",
    kenhLienHe: "Email",
    trangThai: "Moi",
    tags: ["giao hàng sai"],
    messageCount: 2,
    ngayTao: iso(1),
    ngayCapNhat: iso(1),
    slaDeadline: sla(iso(1), "Cao"),
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 2, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Email",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(1),
      },
      {
        messageId: msgId(), ticketId: 2, senderType: "KhachHang", senderId: 2,
        senderName: CUSTOMERS[1].ten, noiDungTinNhan: "Tôi đặt RAM DDR5 16GB nhưng nhận được hàng là 8GB. Hộp bao bì có ghi 16GB nhưng bên trong là 8GB. Yêu cầu đổi lại đúng sản phẩm.",
        loaiTinNhan: "Reply", attachments: [
          { attachmentId: 2, messageId: 105, fileName: "hop_san_pham.jpg", fileUrl: "https://placehold.co/400x300", fileType: "image/jpeg", fileSize: 180_000, uploadedAt: iso(1) },
          { attachmentId: 3, messageId: 105, fileName: "hoa_don.pdf", fileUrl: "#", fileType: "application/pdf", fileSize: 52_000, uploadedAt: iso(1) },
        ], createdAt: iso(1),
      },
    ],
  },

  // ── 3. Mới, Trung bình — Hỏi tin, có đơn hàng liên quan ────────────────────
  {
    ticketId: 3,
    maTicket: "TK-000003",
    khachHangId: 3,
    khachHangTen: CUSTOMERS[2].ten,
    khachHangEmail: CUSTOMERS[2].email,
    donHangId: 5012,
    donHangMa: "DH-2024-5012",
    loaiVanDe: "HoiTin",
    mucDoUuTien: "TrungBinh",
    tieuDe: "Hỏi về thời gian bảo hành SSD Samsung 1TB",
    moTa: "Tôi muốn hỏi thời gian bảo hành chính xác của SSD Samsung 870 EVO 1TB mà tôi đã mua. Trên trang web ghi 5 năm nhưng hóa đơn không có thông tin bảo hành.",
    kenhLienHe: "Chat",
    trangThai: "Moi",
    tags: ["bảo hành"],
    messageCount: 1,
    ngayTao: iso(0, 2),
    ngayCapNhat: iso(0, 2),
    slaDeadline: sla(iso(0, 2), "TrungBinh"),
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 3, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Chat",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(0, 2),
      },
      {
        messageId: msgId(), ticketId: 3, senderType: "KhachHang", senderId: 3,
        senderName: CUSTOMERS[2].ten, noiDungTinNhan: "Tôi muốn hỏi thời gian bảo hành chính xác của SSD Samsung 870 EVO 1TB mà tôi đã mua. Trên trang web ghi 5 năm nhưng hóa đơn không có thông tin bảo hành.",
        loaiTinNhan: "Reply", attachments: [], createdAt: iso(0, 2),
      },
    ],
  },

  // ── 4. Đang xử lý, Cao — Đổi trả, đã assign ─────────────────────────────────
  {
    ticketId: 4,
    maTicket: "TK-000004",
    khachHangId: 4,
    khachHangTen: CUSTOMERS[3].ten,
    khachHangEmail: CUSTOMERS[3].email,
    donHangId: 4987,
    donHangMa: "DH-2024-4987",
    loaiVanDe: "YeuCauDoiTra",
    mucDoUuTien: "Cao",
    tieuDe: "Yêu cầu đổi card màn hình RTX 4070 — bị lỗi artifact",
    moTa: "Card màn hình RTX 4070 bị lỗi artifact sau 2 tuần sử dụng. Màn hình xuất hiện các khối màu ngẫu nhiên khi chơi game. Đã test với 2 máy tính khác nhau, lỗi vẫn xảy ra.",
    kenhLienHe: "Form",
    trangThai: "DangXuLy",
    tags: ["đổi trả", "GPU"],
    nhanVienPhuTrachId: 10,
    nhanVienPhuTrachTen: "Nguyễn Thị Lan",
    messageCount: 5,
    ngayTao: iso(5),
    ngayCapNhat: iso(1),
    phanHoiDauLuc: iso(4, 3),
    slaDeadline: sla(iso(5), "Cao"),
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 4, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Form",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(5),
      },
      {
        messageId: msgId(), ticketId: 4, senderType: "KhachHang", senderId: 4,
        senderName: CUSTOMERS[3].ten, noiDungTinNhan: "Card màn hình RTX 4070 bị lỗi artifact sau 2 tuần sử dụng. Màn hình xuất hiện các khối màu ngẫu nhiên khi chơi game. Đã test với 2 máy tính khác nhau, lỗi vẫn xảy ra.",
        loaiTinNhan: "Reply", attachments: [
          { attachmentId: 4, messageId: 110, fileName: "artifact_screenshot.png", fileUrl: "https://placehold.co/800x600", fileType: "image/png", fileSize: 620_000, uploadedAt: iso(5) },
        ], createdAt: iso(5),
      },
      {
        messageId: msgId(), ticketId: 4, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Phiếu được phân công cho Nguyễn Thị Lan",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(4, 22),
      },
      {
        messageId: msgId(), ticketId: 4, senderType: "NhanVien", senderId: 10,
        senderName: "Nguyễn Thị Lan", loaiTinNhan: "InternalNote",
        noiDungTinNhan: "Đã kiểm tra đơn hàng — sản phẩm mua ngày 10/04, còn trong hạn bảo hành 2 năm. Cần xác nhận lại với kho trước khi hẹn khách gửi về.",
        attachments: [], createdAt: iso(4, 3),
      },
      {
        messageId: msgId(), ticketId: 4, senderType: "NhanVien", senderId: 10,
        senderName: "Nguyễn Thị Lan", loaiTinNhan: "Reply",
        noiDungTinNhan: "Chào anh/chị, tôi là Lan từ bộ phận CSKH TechStore. Chúng tôi đã nhận được yêu cầu và đang xác nhận với kho về tình trạng sản phẩm thay thế. Chúng tôi sẽ phản hồi trong 24h. Anh/chị vui lòng đóng gói sản phẩm cẩn thận để chuẩn bị gửi về.",
        trangThaiMoi: "DangXuLy", attachments: [], createdAt: iso(4, 3),
      },
    ],
  },

  // ── 5. Đang xử lý, Trung bình — Khiếu nại, đã assign ───────────────────────
  {
    ticketId: 5,
    maTicket: "TK-000005",
    khachHangId: 5,
    khachHangTen: CUSTOMERS[4].ten,
    khachHangEmail: CUSTOMERS[4].email,
    loaiVanDe: "KhieuNai",
    mucDoUuTien: "TrungBinh",
    tieuDe: "Sản phẩm giao bị móp hộp, nghi bị đập thử",
    moTa: "Nhận hàng thấy hộp bị móp một góc, có dấu hiệu bị mở rồi đóng lại. Sản phẩm bên trong nhìn qua có vẻ OK nhưng lo ngại chất lượng.",
    kenhLienHe: "Email",
    trangThai: "DangXuLy",
    tags: ["vận chuyển", "đóng gói"],
    nhanVienPhuTrachId: 11,
    nhanVienPhuTrachTen: "Trần Minh Khoa",
    messageCount: 4,
    ngayTao: iso(4),
    ngayCapNhat: iso(0, 5),
    phanHoiDauLuc: iso(3, 20),
    slaDeadline: sla(iso(4), "TrungBinh"),
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 5, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Email",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(4),
      },
      {
        messageId: msgId(), ticketId: 5, senderType: "KhachHang", senderId: 5,
        senderName: CUSTOMERS[4].ten, noiDungTinNhan: "Nhận hàng thấy hộp bị móp một góc, có dấu hiệu bị mở rồi đóng lại.",
        loaiTinNhan: "Reply", attachments: [
          { attachmentId: 5, messageId: 116, fileName: "hop_mop.jpg", fileUrl: "https://placehold.co/400x300", fileType: "image/jpeg", fileSize: 310_000, uploadedAt: iso(4) },
        ], createdAt: iso(4),
      },
      {
        messageId: msgId(), ticketId: 5, senderType: "NhanVien", senderId: 11,
        senderName: "Trần Minh Khoa", loaiTinNhan: "Reply",
        noiDungTinNhan: "Chào anh, chúng tôi rất tiếc về sự cố này. Anh vui lòng cho chúng tôi xem ảnh toàn bộ sản phẩm bên trong hộp để đánh giá thiệt hại. Chúng tôi sẽ xử lý ngay.",
        attachments: [], createdAt: iso(3, 20),
      },
      {
        messageId: msgId(), ticketId: 5, senderType: "KhachHang", senderId: 5,
        senderName: CUSTOMERS[4].ten, noiDungTinNhan: "Đây là ảnh sản phẩm bên trong. Sản phẩm còn nguyên seal nhưng hộp bị xẹp một bên.",
        loaiTinNhan: "Reply", attachments: [
          { attachmentId: 6, messageId: 119, fileName: "ben_trong.jpg", fileUrl: "https://placehold.co/400x300", fileType: "image/jpeg", fileSize: 290_000, uploadedAt: iso(0, 5) },
        ], createdAt: iso(0, 5),
      },
    ],
  },

  // ── 6. Chờ khách, Thấp — Lỗi kỹ thuật ──────────────────────────────────────
  {
    ticketId: 6,
    maTicket: "TK-000006",
    khachHangId: 6,
    khachHangTen: CUSTOMERS[5].ten,
    khachHangEmail: CUSTOMERS[5].email,
    loaiVanDe: "LoiKyThuat",
    mucDoUuTien: "Thap",
    tieuDe: "Driver bàn phím cơ không nhận trên Windows 11",
    moTa: "Bàn phím cơ mua tháng trước không nhận driver trên Windows 11. Đã thử uninstall/reinstall nhiều lần không được. Cần hướng dẫn cụ thể.",
    kenhLienHe: "Chat",
    trangThai: "ChoKhach",
    tags: ["driver", "bàn phím"],
    nhanVienPhuTrachId: 12,
    nhanVienPhuTrachTen: "Phạm Thị Hương",
    messageCount: 5,
    ngayTao: iso(7),
    ngayCapNhat: iso(2),
    phanHoiDauLuc: iso(6, 18),
    slaDeadline: sla(iso(7), "Thap"),
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 6, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Chat",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(7),
      },
      {
        messageId: msgId(), ticketId: 6, senderType: "KhachHang", senderId: 6,
        senderName: CUSTOMERS[5].ten, noiDungTinNhan: "Bàn phím cơ mua tháng trước không nhận driver trên Windows 11.",
        loaiTinNhan: "Reply", attachments: [], createdAt: iso(7),
      },
      {
        messageId: msgId(), ticketId: 6, senderType: "NhanVien", senderId: 12,
        senderName: "Phạm Thị Hương", loaiTinNhan: "Reply",
        noiDungTinNhan: "Chào chị, chúng tôi đã nhận được phản ánh. Chị vui lòng thử cách sau: 1) Vào Device Manager → Keyboards → Uninstall device (tích vào 'Delete the driver software'). 2) Restart máy. 3) Cắm lại bàn phím và để Windows tự detect. Chị thử và cho chúng tôi biết kết quả nhé.",
        attachments: [], createdAt: iso(6, 18),
      },
      {
        messageId: msgId(), ticketId: 6, senderType: "NhanVien", senderId: 12,
        senderName: "Phạm Thị Hương", loaiTinNhan: "InternalNote",
        noiDungTinNhan: "Lỗi driver này khá phổ biến với Windows 11 build 22H2. Nếu bước trên không được, có thể cần cập nhật Windows hoặc rollback driver.",
        attachments: [], createdAt: iso(6, 17),
      },
      {
        messageId: msgId(), ticketId: 6, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Trạng thái đổi từ Đang xử lý → Chờ khách bởi Phạm Thị Hương",
        trangThaiMoi: "ChoKhach", loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(6, 18),
      },
    ],
  },

  // ── 7. Đã giải quyết, Trung bình — Hỏi tin ──────────────────────────────────
  {
    ticketId: 7,
    maTicket: "TK-000007",
    khachHangId: 7,
    khachHangTen: CUSTOMERS[6].ten,
    khachHangEmail: CUSTOMERS[6].email,
    loaiVanDe: "HoiTin",
    mucDoUuTien: "TrungBinh",
    tieuDe: "Hỏi chính sách trả hàng trong 7 ngày",
    moTa: "Tôi muốn hỏi chi tiết chính sách trả hàng trong 7 ngày của shop. Điều kiện và thủ tục như thế nào?",
    kenhLienHe: "Email",
    trangThai: "DaGiaiQuyet",
    tags: ["chính sách"],
    nhanVienPhuTrachId: 10,
    nhanVienPhuTrachTen: "Nguyễn Thị Lan",
    messageCount: 4,
    ngayTao: iso(10),
    ngayCapNhat: iso(8),
    phanHoiDauLuc: iso(9, 20),
    daGiaiQuyetLuc: iso(8),
    slaDeadline: sla(iso(10), "TrungBinh"),
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 7, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Email",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(10),
      },
      {
        messageId: msgId(), ticketId: 7, senderType: "KhachHang", senderId: 7,
        senderName: CUSTOMERS[6].ten, noiDungTinNhan: "Tôi muốn hỏi chi tiết chính sách trả hàng trong 7 ngày của shop.",
        loaiTinNhan: "Reply", attachments: [], createdAt: iso(10),
      },
      {
        messageId: msgId(), ticketId: 7, senderType: "NhanVien", senderId: 10,
        senderName: "Nguyễn Thị Lan", loaiTinNhan: "Reply",
        noiDungTinNhan: "Chào anh Long, chính sách đổi trả trong 7 ngày của TechStore như sau:\n• Sản phẩm còn nguyên seal, đầy đủ phụ kiện\n• Hóa đơn mua hàng còn hiệu lực\n• Không có dấu hiệu va đập, trầy xước do lỗi người dùng\n• Liên hệ hotline hoặc mang trực tiếp đến cửa hàng\nAnh cần hỗ trợ thêm không?",
        trangThaiMoi: "DaGiaiQuyet", attachments: [], createdAt: iso(9, 20),
      },
      {
        messageId: msgId(), ticketId: 7, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Trạng thái đổi từ Đang xử lý → Đã giải quyết bởi Nguyễn Thị Lan",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(9, 20),
      },
    ],
  },

  // ── 8. Đã giải quyết, Cao — Đổi trả ─────────────────────────────────────────
  {
    ticketId: 8,
    maTicket: "TK-000008",
    khachHangId: 8,
    khachHangTen: CUSTOMERS[7].ten,
    khachHangEmail: CUSTOMERS[7].email,
    donHangId: 4421,
    donHangMa: "DH-2024-4421",
    loaiVanDe: "YeuCauDoiTra",
    mucDoUuTien: "Cao",
    tieuDe: "Đổi CPU Intel Core i7-14700K — chân pin bị cong",
    moTa: "CPU vừa mở hộp thấy một số chân pin bị cong, không thể lắp vào mainboard. Yêu cầu đổi sản phẩm mới.",
    kenhLienHe: "DienThoai",
    trangThai: "DaGiaiQuyet",
    tags: ["đổi trả", "CPU"],
    nhanVienPhuTrachId: 11,
    nhanVienPhuTrachTen: "Trần Minh Khoa",
    messageCount: 5,
    ngayTao: iso(14),
    ngayCapNhat: iso(11),
    phanHoiDauLuc: iso(13, 16),
    daGiaiQuyetLuc: iso(11),
    slaDeadline: sla(iso(14), "Cao"),
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 8, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Điện thoại",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(14),
      },
      {
        messageId: msgId(), ticketId: 8, senderType: "KhachHang", senderId: 8,
        senderName: CUSTOMERS[7].ten, noiDungTinNhan: "CPU vừa mở hộp thấy một số chân pin bị cong, không thể lắp vào mainboard.",
        loaiTinNhan: "Reply", attachments: [
          { attachmentId: 7, messageId: 145, fileName: "chan_pin_cong.jpg", fileUrl: "https://placehold.co/400x300", fileType: "image/jpeg", fileSize: 198_000, uploadedAt: iso(14) },
        ], createdAt: iso(14),
      },
      {
        messageId: msgId(), ticketId: 8, senderType: "NhanVien", senderId: 11,
        senderName: "Trần Minh Khoa", loaiTinNhan: "InternalNote",
        noiDungTinNhan: "Đã xác nhận lỗi từ hình ảnh. Kho còn 3 hàng i7-14700K. Tiến hành tạo phiếu đổi hàng.",
        attachments: [], createdAt: iso(13, 16),
      },
      {
        messageId: msgId(), ticketId: 8, senderType: "NhanVien", senderId: 11,
        senderName: "Trần Minh Khoa", loaiTinNhan: "Reply",
        noiDungTinNhan: "Chào chị Ngọc, chúng tôi đã xác nhận lỗi và tạo phiếu đổi hàng. Shipper sẽ đến lấy hàng lỗi và giao hàng mới vào ngày mai (trước 17h). Chị không cần mang ra cửa hàng.",
        trangThaiMoi: "DaGiaiQuyet", attachments: [], createdAt: iso(11),
      },
      {
        messageId: msgId(), ticketId: 8, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Trạng thái đổi từ Đang xử lý → Đã giải quyết bởi Trần Minh Khoa",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(11),
      },
    ],
  },

  // ── 9. Đóng, đánh giá 4 sao — Lỗi kỹ thuật ─────────────────────────────────
  {
    ticketId: 9,
    maTicket: "TK-000009",
    khachHangId: 1,
    khachHangTen: CUSTOMERS[0].ten,
    khachHangEmail: CUSTOMERS[0].email,
    loaiVanDe: "LoiKyThuat",
    mucDoUuTien: "TrungBinh",
    tieuDe: "Cài đặt Windows 11 trên SSD NVMe mới — không nhận ổ",
    moTa: "Mua SSD NVMe mới, cài Windows 11 nhưng BIOS không nhận ổ trong bước chọn ổ cài.",
    kenhLienHe: "Form",
    trangThai: "Dong",
    tags: ["cài đặt", "Windows"],
    nhanVienPhuTrachId: 12,
    nhanVienPhuTrachTen: "Phạm Thị Hương",
    messageCount: 5,
    ngayTao: iso(20),
    ngayCapNhat: iso(17),
    ngayDong: iso(17),
    phanHoiDauLuc: iso(19, 18),
    daGiaiQuyetLuc: iso(18),
    danhGiaHaiLong: 4,
    slaDeadline: sla(iso(20), "TrungBinh"),
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 9, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Form",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(20),
      },
      {
        messageId: msgId(), ticketId: 9, senderType: "KhachHang", senderId: 1,
        senderName: CUSTOMERS[0].ten, noiDungTinNhan: "Mua SSD NVMe mới, cài Windows 11 nhưng BIOS không nhận ổ trong bước chọn ổ cài.",
        loaiTinNhan: "Reply", attachments: [], createdAt: iso(20),
      },
      {
        messageId: msgId(), ticketId: 9, senderType: "NhanVien", senderId: 12,
        senderName: "Phạm Thị Hương", loaiTinNhan: "Reply",
        noiDungTinNhan: "Anh vui lòng vào BIOS → Storage Configuration → đổi từ 'RAID' sang 'AHCI'. Sau đó thử lại quá trình cài Windows.",
        attachments: [], createdAt: iso(19, 18),
      },
      {
        messageId: msgId(), ticketId: 9, senderType: "KhachHang", senderId: 1,
        senderName: CUSTOMERS[0].ten, noiDungTinNhan: "Đã làm theo và cài được rồi. Cảm ơn bạn rất nhiều!",
        trangThaiMoi: "DaGiaiQuyet", loaiTinNhan: "Reply", attachments: [], createdAt: iso(18),
      },
      {
        messageId: msgId(), ticketId: 9, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket đã đóng",
        trangThaiMoi: "Dong", loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(17),
      },
    ],
  },

  // ── 10. Đóng, đánh giá 2 sao — Khiếu nại ────────────────────────────────────
  {
    ticketId: 10,
    maTicket: "TK-000010",
    khachHangId: 3,
    khachHangTen: CUSTOMERS[2].ten,
    khachHangEmail: CUSTOMERS[2].email,
    loaiVanDe: "KhieuNai",
    mucDoUuTien: "Cao",
    tieuDe: "Giao hàng chậm 7 ngày so với cam kết",
    moTa: "Đặt hàng hôm 1/4, cam kết giao 3-5 ngày nhưng đến ngày 8/4 mới nhận được. Ảnh hưởng đến công việc.",
    kenhLienHe: "Email",
    trangThai: "Dong",
    tags: ["giao hàng", "chậm"],
    nhanVienPhuTrachId: 10,
    nhanVienPhuTrachTen: "Nguyễn Thị Lan",
    messageCount: 4,
    ngayTao: iso(30),
    ngayCapNhat: iso(25),
    ngayDong: iso(25),
    phanHoiDauLuc: iso(28, 10),
    daGiaiQuyetLuc: iso(26),
    danhGiaHaiLong: 2,
    slaDeadline: sla(iso(30), "Cao"),
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 10, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Email",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(30),
      },
      {
        messageId: msgId(), ticketId: 10, senderType: "KhachHang", senderId: 3,
        senderName: CUSTOMERS[2].ten, noiDungTinNhan: "Đặt hàng hôm 1/4, cam kết giao 3-5 ngày nhưng đến ngày 8/4 mới nhận được. Ảnh hưởng đến công việc.",
        loaiTinNhan: "Reply", attachments: [], createdAt: iso(30),
      },
      {
        messageId: msgId(), ticketId: 10, senderType: "NhanVien", senderId: 10,
        senderName: "Nguyễn Thị Lan", loaiTinNhan: "Reply",
        noiDungTinNhan: "Chúng tôi thành thật xin lỗi về sự chậm trễ. Đơn hàng của anh bị ảnh hưởng bởi sự cố tại đơn vị vận chuyển. Chúng tôi sẽ hoàn trả phí ship và gửi voucher 100k bù đắp bất tiện. Mong anh thông cảm.",
        trangThaiMoi: "DaGiaiQuyet", attachments: [], createdAt: iso(28, 10),
      },
      {
        messageId: msgId(), ticketId: 10, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket đã đóng",
        trangThaiMoi: "Dong", loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(25),
      },
    ],
  },

  // ── 11. Mới, Trung bình — Khác, SLA vi phạm ──────────────────────────────────
  {
    ticketId: 11,
    maTicket: "TK-000011",
    khachHangId: 5,
    khachHangTen: CUSTOMERS[4].ten,
    khachHangEmail: CUSTOMERS[4].email,
    loaiVanDe: "Khac",
    mucDoUuTien: "TrungBinh",
    tieuDe: "Hóa đơn VAT không khớp với đơn hàng",
    moTa: "Hóa đơn VAT xuất ra có số tiền khác với đơn hàng đã thanh toán. Cần xuất lại hóa đơn đúng.",
    kenhLienHe: "Email",
    trangThai: "Moi",
    tags: ["hóa đơn", "VAT"],
    messageCount: 1,
    ngayTao: iso(3, 5),
    ngayCapNhat: iso(3, 5),
    slaDeadline: iso(2, 1),  // đã quá hạn
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 11, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Email",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(3, 5),
      },
      {
        messageId: msgId(), ticketId: 11, senderType: "KhachHang", senderId: 5,
        senderName: CUSTOMERS[4].ten, noiDungTinNhan: "Hóa đơn VAT xuất ra có số tiền khác với đơn hàng đã thanh toán. Cần xuất lại hóa đơn đúng.",
        loaiTinNhan: "Reply", attachments: [
          { attachmentId: 8, messageId: 175, fileName: "hoa_don_vat.pdf", fileUrl: "#", fileType: "application/pdf", fileSize: 48_000, uploadedAt: iso(3, 5) },
        ], createdAt: iso(3, 5),
      },
    ],
  },

  // ── 12. Đang xử lý, Thấp — Hỏi tin ──────────────────────────────────────────
  {
    ticketId: 12,
    maTicket: "TK-000012",
    khachHangId: 7,
    khachHangTen: CUSTOMERS[6].ten,
    khachHangEmail: CUSTOMERS[6].email,
    loaiVanDe: "HoiTin",
    mucDoUuTien: "Thap",
    tieuDe: "Xác nhận RAM có tương thích với mainboard ASUS Z790?",
    moTa: "Tôi định mua G.Skill Trident Z5 DDR5 32GB. Muốn xác nhận xem có tương thích với mainboard ASUS ROG STRIX Z790-E không.",
    kenhLienHe: "Chat",
    trangThai: "DangXuLy",
    tags: ["tương thích"],
    nhanVienPhuTrachId: 11,
    nhanVienPhuTrachTen: "Trần Minh Khoa",
    messageCount: 3,
    ngayTao: iso(2),
    ngayCapNhat: iso(1),
    phanHoiDauLuc: iso(1, 22),
    slaDeadline: sla(iso(2), "Thap"),
    soLanMoLai: 0,
    messages: [
      {
        messageId: msgId(), ticketId: 12, senderType: "HeThong", senderId: null,
        senderName: "Hệ thống", noiDungTinNhan: "Ticket được tạo qua Chat",
        loaiTinNhan: "SystemLog", attachments: [], createdAt: iso(2),
      },
      {
        messageId: msgId(), ticketId: 12, senderType: "KhachHang", senderId: 7,
        senderName: CUSTOMERS[6].ten, noiDungTinNhan: "Tôi định mua G.Skill Trident Z5 DDR5 32GB. Muốn xác nhận xem có tương thích với mainboard ASUS ROG STRIX Z790-E không.",
        loaiTinNhan: "Reply", attachments: [], createdAt: iso(2),
      },
      {
        messageId: msgId(), ticketId: 12, senderType: "NhanVien", senderId: 11,
        senderName: "Trần Minh Khoa", loaiTinNhan: "Reply",
        noiDungTinNhan: "Chào anh Long, G.Skill Trident Z5 DDR5 32GB hoàn toàn tương thích với ASUS ROG STRIX Z790-E. Mainboard này có QVL list hỗ trợ kit này. Tốc độ mặc định là 4800MHz, anh có thể bật XMP để đạt tốc độ ghi trên hộp.",
        attachments: [], createdAt: iso(1, 22),
      },
    ],
  },
];

// ─── Summary helper ────────────────────────────────────────────────────────────

export function toTicketSummary(t: Ticket): TicketSummary {
  const lastMsg = t.messages.filter(m => m.loaiTinNhan === "Reply").at(-1);
  const now     = Date.now();
  const isBreached = !!t.slaDeadline
    && new Date(t.slaDeadline).getTime() < now
    && t.trangThai !== "Dong"
    && t.trangThai !== "DaGiaiQuyet";

  return {
    ticketId:               t.ticketId,
    maTicket:               t.maTicket,
    khachHangTen:           t.khachHangTen,
    khachHangEmail:         t.khachHangEmail,
    loaiVanDe:              t.loaiVanDe,
    mucDoUuTien:            t.mucDoUuTien,
    tieuDe:                 t.tieuDe,
    kenhLienHe:             t.kenhLienHe,
    trangThai:              t.trangThai,
    tags:                   t.tags,
    nhanVienPhuTrachTen:    t.nhanVienPhuTrachTen,
    nhanVienPhuTrachMa:     t.nhanVienPhuTrachId != null
      ? STAFF_MA[t.nhanVienPhuTrachId]
      : undefined,
    nhanVienPhuTrachAvatar: t.nhanVienPhuTrachAvatar,
    messageCount:           t.messageCount,
    lastMessageAt:          lastMsg?.createdAt ?? t.ngayTao,
    ngayTao:                t.ngayTao,
    slaDeadline:            t.slaDeadline,
    isSlaBreached:          isBreached,
  };
}

export const MOCK_TICKET_SUMMARIES: TicketSummary[] = MOCK_TICKETS.map(toTicketSummary);

export const MOCK_TICKET_STATS: TicketStats = {
  tongSoTicket:       MOCK_TICKETS.length,
  dangMo:             MOCK_TICKETS.filter(t => ["Moi","DangXuLy","ChoKhach"].includes(t.trangThai)).length,
  chuaXuLy:           MOCK_TICKETS.filter(t => t.trangThai === "Moi").length,
  khanCap:            MOCK_TICKETS.filter(t => t.mucDoUuTien === "KhanCap" && t.trangThai !== "Dong").length,
  slaBreached:        MOCK_TICKET_SUMMARIES.filter(s => s.isSlaBreached).length,
  trungBinhGiaiQuyet: 18,
};

