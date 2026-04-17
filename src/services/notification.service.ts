import type {
  ThongBao,
  ThongBaoRow,
  NotificationStats,
  GetNotificationsParams,
  GetNotificationsResult,
  AutoNotificationRule,
  AutoNotificationRuleGroup,
} from "@/src/types/notification.types";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: ThongBaoRow[] = [
  {
    thongBaoId: 1, khachHangId: 101,
    tenKhachHang: "Nguyễn Quốc Bảo", emailKhachHang: "bao.nguyen@gmail.com",
    loaiThongBao: "DonHang", tieuDe: "Đơn hàng ORD-2024-0001 đã được xác nhận",
    noiDung: "Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị. Dự kiến giao trong 2-3 ngày làm việc.",
    kenhGui: "Push", trangThai: "DaGui", daDoc: true,
    entityLienQuan: "DonHang", entityLienQuanId: 1,
    ngayTao: "2024-04-17T08:00:00Z",
  },
  {
    thongBaoId: 2, khachHangId: 101,
    tenKhachHang: "Nguyễn Quốc Bảo", emailKhachHang: "bao.nguyen@gmail.com",
    loaiThongBao: "GiaoDich", tieuDe: "Thanh toán thành công — 25.990.000 ₫",
    noiDung: "Giao dịch VNPAY của bạn đã được xác nhận thành công. Mã giao dịch: VNP20240417143201001.",
    kenhGui: "Email", trangThai: "DaGui", daDoc: true,
    entityLienQuan: "GiaoDich", entityLienQuanId: 1001,
    ngayTao: "2024-04-17T14:32:05Z",
  },
  {
    thongBaoId: 3, khachHangId: 102,
    tenKhachHang: "Trần Văn Khoa", emailKhachHang: "khoa.tran@techsv.vn",
    loaiThongBao: "DonHang", tieuDe: "Đơn hàng ORD-2024-0002 đang được giao",
    noiDung: "Đơn hàng của bạn đang trên đường giao. Shipper sẽ liên hệ trước khi đến.",
    kenhGui: "SMS", trangThai: "DaGui", daDoc: false,
    entityLienQuan: "DonHang", entityLienQuanId: 2,
    ngayTao: "2024-04-17T10:00:00Z",
  },
  {
    thongBaoId: 4, khachHangId: 103,
    tenKhachHang: "Lê Thị Phương Anh", emailKhachHang: "anh.le@outlook.com",
    loaiThongBao: "KhuyenMai", tieuDe: "Flash Sale 12H — Giảm đến 40% linh kiện PC",
    noiDung: "Đừng bỏ lỡ! Flash Sale bắt đầu lúc 12:00 hôm nay. Hàng có hạn, nhanh tay kẻo hết nhé!",
    kenhGui: "Push", trangThai: "DaGui", daDoc: true,
    entityLienQuan: "KhuyenMai", entityLienQuanId: 5,
    ngayTao: "2024-04-17T11:30:00Z",
  },
  {
    thongBaoId: 5, khachHangId: 104,
    tenKhachHang: "Phạm Đức Minh", emailKhachHang: "minh.pham@gamer.vn",
    loaiThongBao: "GiaoDich", tieuDe: "Thanh toán thất bại — Vui lòng thử lại",
    noiDung: "Giao dịch VNPAY cho đơn hàng ORD-2024-0004 thất bại. Lỗi: Số dư không đủ (mã lỗi: 24). Vui lòng kiểm tra lại tài khoản.",
    kenhGui: "Push", trangThai: "DaGui", daDoc: false,
    entityLienQuan: "GiaoDich", entityLienQuanId: 1004,
    ngayTao: "2024-04-16T22:01:00Z",
  },
  {
    thongBaoId: 6, khachHangId: 104,
    tenKhachHang: "Phạm Đức Minh", emailKhachHang: "minh.pham@gamer.vn",
    loaiThongBao: "GiaoDich", tieuDe: "Thanh toán thất bại — Vui lòng thử lại",
    noiDung: "Giao dịch VNPAY cho đơn hàng ORD-2024-0004 thất bại. Lỗi: Số dư không đủ (mã lỗi: 24). Vui lòng kiểm tra lại tài khoản.",
    kenhGui: "Email", trangThai: "ThatBai", daDoc: false,
    entityLienQuan: "GiaoDich", entityLienQuanId: 1004,
    ngayTao: "2024-04-16T22:01:05Z",
  },
  {
    thongBaoId: 7, khachHangId: 105,
    tenKhachHang: "Hoàng Thị Bích Ngọc", emailKhachHang: "ngoc.hoang@gmail.com",
    loaiThongBao: "Loyalty", tieuDe: "Chúc mừng! Bạn đã được cộng 850 điểm thưởng",
    noiDung: "Đơn hàng ORD-2024-0005 hoàn thành. Bạn nhận được 850 điểm TechPoints. Tổng điểm hiện tại: 3.200 điểm.",
    kenhGui: "Push", trangThai: "DaGui", daDoc: true,
    entityLienQuan: "DonHang", entityLienQuanId: 5,
    ngayTao: "2024-04-16T16:05:00Z",
  },
  {
    thongBaoId: 8, khachHangId: 106,
    tenKhachHang: "Vũ Văn Thắng", emailKhachHang: "thang.vu@gmail.com",
    loaiThongBao: "HoanHang", tieuDe: "Yêu cầu hoàn trả đã được duyệt",
    noiDung: "Yêu cầu hoàn trả đơn hàng ORD-2024-0006 đã được phê duyệt. Tiền sẽ được hoàn về trong 3-5 ngày làm việc.",
    kenhGui: "Email", trangThai: "DaGui", daDoc: true,
    entityLienQuan: "HoanHang", entityLienQuanId: 6,
    ngayTao: "2024-04-15T14:00:00Z",
  },
  {
    thongBaoId: 9, khachHangId: 107,
    tenKhachHang: "Ngô Thanh Tùng", emailKhachHang: "tung.ngo@gmail.com",
    loaiThongBao: "NhacNho", tieuDe: "Sản phẩm trong wishlist sắp hết hàng",
    noiDung: "ASUS ROG STRIX B760-F Gaming trong danh sách yêu thích của bạn chỉ còn 2 chiếc. Mua ngay trước khi hết hàng!",
    kenhGui: "Push", trangThai: "ChuaGui", daDoc: false,
    entityLienQuan: null, entityLienQuanId: null,
    ngayTao: "2024-04-17T13:00:00Z",
  },
  {
    thongBaoId: 10, khachHangId: 108,
    tenKhachHang: "Đinh Thị Cẩm Tú", emailKhachHang: "tu.dinh@gmail.com",
    loaiThongBao: "KhuyenMai", tieuDe: "Mã giảm giá TECH20 sắp hết hạn",
    noiDung: "Mã giảm giá TECH20 (giảm 20% tối đa 500k) của bạn sẽ hết hạn vào 23:59 hôm nay. Dùng ngay kẻo lỡ!",
    kenhGui: "Push", trangThai: "ChuaGui", daDoc: false,
    entityLienQuan: "KhuyenMai", entityLienQuanId: 8,
    ngayTao: "2024-04-17T09:00:00Z",
  },
  {
    thongBaoId: 11, khachHangId: 108,
    tenKhachHang: "Đinh Thị Cẩm Tú", emailKhachHang: "tu.dinh@gmail.com",
    loaiThongBao: "KhuyenMai", tieuDe: "Mã giảm giá TECH20 sắp hết hạn",
    noiDung: "Mã giảm giá TECH20 (giảm 20% tối đa 500k) của bạn sẽ hết hạn vào 23:59 hôm nay. Dùng ngay kẻo lỡ!",
    kenhGui: "Email", trangThai: "ChuaGui", daDoc: false,
    entityLienQuan: "KhuyenMai", entityLienQuanId: 8,
    ngayTao: "2024-04-17T09:00:30Z",
  },
  {
    thongBaoId: 12, khachHangId: 101,
    tenKhachHang: "Nguyễn Quốc Bảo", emailKhachHang: "bao.nguyen@gmail.com",
    loaiThongBao: "Loyalty", tieuDe: "Sắp lên hạng Gold! Còn 500 điểm nữa",
    noiDung: "Bạn đang có 2.500/3.000 điểm để lên hạng Gold. Mua thêm để nhận ưu đãi hấp dẫn từ hạng Gold!",
    kenhGui: "Push", trangThai: "DaGui", daDoc: false,
    entityLienQuan: null, entityLienQuanId: null,
    ngayTao: "2024-04-16T08:00:00Z",
  },
  {
    thongBaoId: 13, khachHangId: 102,
    tenKhachHang: "Trần Văn Khoa", emailKhachHang: "khoa.tran@techsv.vn",
    loaiThongBao: "HeThong", tieuDe: "Bảo trì hệ thống — 02:00 đến 04:00 ngày 18/04",
    noiDung: "Hệ thống sẽ bảo trì từ 02:00 đến 04:00 ngày 18/04/2024. Trong thời gian này, một số tính năng có thể không khả dụng.",
    kenhGui: "Email", trangThai: "DaGui", daDoc: true,
    entityLienQuan: null, entityLienQuanId: null,
    ngayTao: "2024-04-17T18:00:00Z",
  },
  {
    thongBaoId: 14, khachHangId: 103,
    tenKhachHang: "Lê Thị Phương Anh", emailKhachHang: "anh.le@outlook.com",
    loaiThongBao: "HeThong", tieuDe: "Bảo trì hệ thống — 02:00 đến 04:00 ngày 18/04",
    noiDung: "Hệ thống sẽ bảo trì từ 02:00 đến 04:00 ngày 18/04/2024. Trong thời gian này, một số tính năng có thể không khả dụng.",
    kenhGui: "Email", trangThai: "DaGui", daDoc: false,
    entityLienQuan: null, entityLienQuanId: null,
    ngayTao: "2024-04-17T18:00:05Z",
  },
  {
    thongBaoId: 15, khachHangId: 105,
    tenKhachHang: "Hoàng Thị Bích Ngọc", emailKhachHang: "ngoc.hoang@gmail.com",
    loaiThongBao: "DonHang", tieuDe: "Đơn hàng ORD-2024-0005 giao thành công",
    noiDung: "Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại TechStore!",
    kenhGui: "Push", trangThai: "DaGui", daDoc: true,
    entityLienQuan: "DonHang", entityLienQuanId: 5,
    ngayTao: "2024-04-16T17:30:00Z",
  },
  {
    thongBaoId: 16, khachHangId: 106,
    tenKhachHang: "Vũ Văn Thắng", emailKhachHang: "thang.vu@gmail.com",
    loaiThongBao: "HoanHang", tieuDe: "Hoàn tiền thành công — 5.600.000 ₫",
    noiDung: "Khoản hoàn tiền 5.600.000 ₫ đã được chuyển về phương thức thanh toán gốc (ZaloPay). Vui lòng kiểm tra sau 1-2 ngày làm việc.",
    kenhGui: "Push", trangThai: "ThatBai", daDoc: false,
    entityLienQuan: "GiaoDich", entityLienQuanId: 1006,
    ngayTao: "2024-04-15T16:00:00Z",
  },
  {
    thongBaoId: 17, khachHangId: 107,
    tenKhachHang: "Ngô Thanh Tùng", emailKhachHang: "tung.ngo@gmail.com",
    loaiThongBao: "NhacNho", tieuDe: "Bạn còn hàng trong giỏ — Đừng bỏ quên!",
    noiDung: "Bạn đang có 3 sản phẩm trong giỏ hàng. Hoàn thành đơn ngay hôm nay để nhận ưu đãi giao hàng miễn phí!",
    kenhGui: "Push", trangThai: "HuyBo", daDoc: false,
    entityLienQuan: null, entityLienQuanId: null,
    ngayTao: "2024-04-15T10:00:00Z",
  },
  {
    thongBaoId: 18, khachHangId: 109,
    tenKhachHang: "Bùi Thị Lan", emailKhachHang: "lan.bui@gmail.com",
    loaiThongBao: "KhuyenMai", tieuDe: "Dành riêng cho bạn: Giảm 15% đơn hàng tiếp theo",
    noiDung: "Cảm ơn bạn đã là khách hàng thân thiết! Nhập mã LOYAL15 để được giảm 15% (tối đa 1.000.000 ₫) cho đơn hàng tiếp theo.",
    kenhGui: "Email", trangThai: "DaGui", daDoc: true,
    entityLienQuan: "KhuyenMai", entityLienQuanId: 12,
    ngayTao: "2024-04-14T09:00:00Z",
  },
  {
    thongBaoId: 19, khachHangId: 110,
    tenKhachHang: "Lý Văn Hòa", emailKhachHang: "hoa.ly@gmail.com",
    loaiThongBao: "DonHang", tieuDe: "Đơn hàng ORD-2024-0010 đã được xác nhận",
    noiDung: "Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị. Dự kiến giao trong 2-3 ngày làm việc.",
    kenhGui: "SMS", trangThai: "DaGui", daDoc: false,
    entityLienQuan: "DonHang", entityLienQuanId: 10,
    ngayTao: "2024-04-14T10:05:00Z",
  },
  {
    thongBaoId: 20, khachHangId: 101,
    tenKhachHang: "Nguyễn Quốc Bảo", emailKhachHang: "bao.nguyen@gmail.com",
    loaiThongBao: "NhacNho", tieuDe: "Intel Core i9-14900K đã có hàng trở lại",
    noiDung: "Sản phẩm bạn đã đặt thông báo — Intel Core i9-14900K — hiện đã có hàng tại TechStore. Mua ngay!",
    kenhGui: "Push", trangThai: "ChuaGui", daDoc: false,
    entityLienQuan: null, entityLienQuanId: null,
    ngayTao: "2024-04-17T15:00:00Z",
  },
];

// ─── Auto notification rules mock ─────────────────────────────────────────────

let MOCK_AUTO_RULES: AutoNotificationRule[] = [
  // Nhóm Đơn hàng
  {
    id: "rule-don-xacnhan", trigger: "don_hang.xac_nhan",
    tenHienThi: "Đơn hàng được xác nhận",
    moTa: "Gửi khi admin/hệ thống xác nhận đơn hàng",
    kenhGui: ["Push", "Email"], templateTieuDe: "Đơn hàng {{maDonHang}} đã được xác nhận",
    templateNoiDung: "Xin chào {{tenKhachHang}}, đơn hàng {{maDonHang}} đã được xác nhận và đang chuẩn bị. Dự kiến giao {{ngayGiao}}.",
    delayGiay: 0, isActive: true,
  },
  {
    id: "rule-don-dangiao", trigger: "don_hang.dang_giao",
    tenHienThi: "Đơn hàng đang giao",
    moTa: "Gửi khi đơn hàng được bàn giao cho shipper",
    kenhGui: ["SMS", "Push"], templateTieuDe: "Đơn hàng {{maDonHang}} đang trên đường giao",
    templateNoiDung: "Xin chào {{tenKhachHang}}, đơn hàng {{maDonHang}} đang được vận chuyển. Shipper sẽ liên hệ trước khi đến.",
    delayGiay: 0, isActive: true,
  },
  {
    id: "rule-don-dagiao", trigger: "don_hang.da_giao",
    tenHienThi: "Đơn hàng giao thành công",
    moTa: "Gửi sau khi shipper xác nhận giao thành công",
    kenhGui: ["Push"], templateTieuDe: "Đơn hàng {{maDonHang}} giao thành công",
    templateNoiDung: "Xin chào {{tenKhachHang}}, đơn hàng {{maDonHang}} đã được giao thành công. Cảm ơn bạn đã mua sắm tại TechStore!",
    delayGiay: 0, isActive: true,
  },
  {
    id: "rule-don-huy", trigger: "don_hang.da_huy",
    tenHienThi: "Đơn hàng bị hủy",
    moTa: "Gửi khi đơn hàng bị hủy (bởi KH hoặc admin)",
    kenhGui: ["Push", "Email"], templateTieuDe: "Đơn hàng {{maDonHang}} đã bị hủy",
    templateNoiDung: "Đơn hàng {{maDonHang}} đã bị hủy. Nếu bạn đã thanh toán, tiền sẽ được hoàn trong 3-5 ngày làm việc.",
    delayGiay: 0, isActive: false,
  },
  // Nhóm Thanh toán
  {
    id: "rule-gd-thanhcong", trigger: "giao_dich.thanh_cong",
    tenHienThi: "Thanh toán thành công",
    moTa: "Gửi ngay sau khi cổng thanh toán xác nhận thành công",
    kenhGui: ["Email", "Push"], templateTieuDe: "Thanh toán thành công — {{soTien}}",
    templateNoiDung: "Giao dịch {{maGiaoDich}} của bạn đã được xác nhận thành công. Số tiền: {{soTien}}.",
    delayGiay: 0, isActive: true,
  },
  {
    id: "rule-gd-thatbai", trigger: "giao_dich.that_bai",
    tenHienThi: "Thanh toán thất bại",
    moTa: "Gửi khi cổng thanh toán báo lỗi / timeout",
    kenhGui: ["Push"], templateTieuDe: "Thanh toán thất bại — Vui lòng thử lại",
    templateNoiDung: "Giao dịch cho đơn hàng {{maDonHang}} không thành công. Vui lòng kiểm tra lại thông tin thanh toán và thử lại.",
    delayGiay: 0, isActive: true,
  },
  // Nhóm Hoàn trả
  {
    id: "rule-hoan-duocduyet", trigger: "hoan_hang.duoc_duyet",
    tenHienThi: "Yêu cầu hoàn trả được duyệt",
    moTa: "Gửi khi admin phê duyệt yêu cầu hoàn trả",
    kenhGui: ["Email", "Push"], templateTieuDe: "Yêu cầu hoàn trả đã được duyệt",
    templateNoiDung: "Yêu cầu hoàn trả đơn hàng {{maDonHang}} đã được duyệt. Tiền sẽ hoàn về trong 3-5 ngày làm việc.",
    delayGiay: 0, isActive: true,
  },
  {
    id: "rule-hoan-tien", trigger: "hoan_hang.hoan_tien_thanh_cong",
    tenHienThi: "Hoàn tiền thành công",
    moTa: "Gửi sau khi xác nhận tiền hoàn về tài khoản KH",
    kenhGui: ["Push", "Email"], templateTieuDe: "Hoàn tiền thành công — {{soTien}}",
    templateNoiDung: "Khoản hoàn tiền {{soTien}} cho đơn {{maDonHang}} đã được chuyển thành công. Vui lòng kiểm tra sau 1-2 ngày.",
    delayGiay: 0, isActive: false,
  },
  // Nhóm Marketing
  {
    id: "rule-mk-flashsale", trigger: "khuyen_mai.flash_sale_bat_dau",
    tenHienThi: "Flash Sale bắt đầu",
    moTa: "Gửi trước khi Flash Sale bắt đầu N giây",
    kenhGui: ["Push"], templateTieuDe: "Flash Sale {{tenKhuyenMai}} đã bắt đầu!",
    templateNoiDung: "Flash Sale với ưu đãi lên đến {{mucGiam}}% đã bắt đầu! Nhanh tay kẻo hết hàng.",
    delayGiay: -1800, isActive: true,
  },
  {
    id: "rule-mk-coupon-hethan", trigger: "coupon.sap_het_han",
    tenHienThi: "Coupon sắp hết hạn",
    moTa: "Nhắc trước 24h khi coupon của KH sắp hết hạn",
    kenhGui: ["Push", "Email"], templateTieuDe: "Mã giảm giá {{maCode}} sắp hết hạn",
    templateNoiDung: "Mã giảm giá {{maCode}} của bạn sẽ hết hạn vào {{ngayHetHan}}. Dùng ngay kẻo lỡ!",
    delayGiay: -86400, isActive: true,
  },
  {
    id: "rule-mk-wishlist-cohan", trigger: "san_pham.wishlist_co_hang",
    tenHienThi: "Sản phẩm wishlist có hàng trở lại",
    moTa: "Gửi khi sản phẩm KH theo dõi được nhập hàng trở lại",
    kenhGui: ["Push"], templateTieuDe: "{{tenSanPham}} đã có hàng trở lại",
    templateNoiDung: "Sản phẩm {{tenSanPham}} trong danh sách yêu thích của bạn hiện đã có hàng. Mua ngay trước khi hết!",
    delayGiay: 0, isActive: false,
  },
  {
    id: "rule-mk-giohan", trigger: "gio_hang.bo_quen",
    tenHienThi: "Giỏ hàng bỏ quên",
    moTa: "Nhắc sau 24h nếu KH còn hàng trong giỏ chưa đặt",
    kenhGui: ["Push"], templateTieuDe: "Bạn còn hàng trong giỏ — Đừng bỏ quên!",
    templateNoiDung: "Bạn đang có {{soSanPham}} sản phẩm trong giỏ hàng. Hoàn thành đơn ngay hôm nay!",
    delayGiay: 86400, isActive: true,
  },
  // Nhóm Loyalty
  {
    id: "rule-ly-diem", trigger: "loyalty.cong_diem",
    tenHienThi: "Điểm thưởng được cộng",
    moTa: "Gửi sau khi hệ thống cộng điểm cho đơn hàng hoàn thành",
    kenhGui: ["Push"], templateTieuDe: "Bạn vừa nhận {{diemThuong}} điểm TechPoints",
    templateNoiDung: "Đơn hàng {{maDonHang}} hoàn thành! Bạn nhận được {{diemThuong}} điểm TechPoints. Tổng điểm hiện tại: {{tongDiem}}.",
    delayGiay: 300, isActive: true,
  },
  {
    id: "rule-ly-saplen-hang", trigger: "loyalty.sap_len_hang",
    tenHienThi: "Sắp lên hạng thành viên",
    moTa: "Gửi khi KH còn ≤ 500 điểm để lên hạng tiếp theo",
    kenhGui: ["Push", "Email"], templateTieuDe: "Chỉ còn {{diemConLai}} điểm để lên hạng {{hangTiepTheo}}",
    templateNoiDung: "Bạn đang rất gần hạng {{hangTiepTheo}}! Chỉ còn {{diemConLai}} điểm nữa. Mua thêm để nhận ưu đãi hấp dẫn!",
    delayGiay: 0, isActive: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Service functions ─────────────────────────────────────────────────────────

export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<GetNotificationsResult> {
  const {
    page = 1, pageSize = 20,
    kenhGui = [], trangThai = [], loaiThongBao = [],
    tuNgay, denNgay, q = "",
  } = params;

  let filtered = [...MOCK_NOTIFICATIONS];

  if (kenhGui.length > 0)
    filtered = filtered.filter((n) => kenhGui.includes(n.kenhGui));
  if (trangThai.length > 0)
    filtered = filtered.filter((n) => trangThai.includes(n.trangThai));
  if (loaiThongBao.length > 0)
    filtered = filtered.filter((n) => loaiThongBao.includes(n.loaiThongBao));
  if (tuNgay)
    filtered = filtered.filter((n) => n.ngayTao >= tuNgay);
  if (denNgay) {
    const next = new Date(denNgay);
    next.setDate(next.getDate() + 1);
    filtered = filtered.filter((n) => n.ngayTao < next.toISOString());
  }
  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (n) =>
        n.tenKhachHang.toLowerCase().includes(lower) ||
        n.tieuDe.toLowerCase().includes(lower) ||
        n.emailKhachHang.toLowerCase().includes(lower)
    );
  }

  filtered.sort((a, b) => b.ngayTao.localeCompare(a.ngayTao));

  const total = filtered.length;
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);
  return { data, total };
}

export async function getNotificationStats(): Promise<NotificationStats> {
  const all = MOCK_NOTIFICATIONS;
  const daGui = all.filter((n) => n.trangThai === "DaGui");
  const pushDaGui = daGui.filter((n) => n.kenhGui === "Push");
  const pushDaDoc = pushDaGui.filter((n) => n.daDoc);

  return {
    tongThongBao:  all.length,
    chuaGui:       all.filter((n) => n.trangThai === "ChuaGui").length,
    daGui:         daGui.length,
    thatBai:       all.filter((n) => n.trangThai === "ThatBai").length,
    huyBo:         all.filter((n) => n.trangThai === "HuyBo").length,
    tyLeDaDoc:     pushDaGui.length > 0
      ? Math.round((pushDaDoc.length / pushDaGui.length) * 100)
      : 0,
  };
}

export async function getNotificationById(id: number): Promise<ThongBaoRow | null> {
  await delay(300);
  return MOCK_NOTIFICATIONS.find((n) => n.thongBaoId === id) ?? null;
}

export async function cancelNotification(id: number): Promise<void> {
  await delay(400);
  const n = MOCK_NOTIFICATIONS.find((n) => n.thongBaoId === id);
  if (n && n.trangThai === "ChuaGui") n.trangThai = "HuyBo";
}

export async function retryNotification(id: number): Promise<void> {
  await delay(400);
  const n = MOCK_NOTIFICATIONS.find((n) => n.thongBaoId === id);
  if (n && n.trangThai === "ThatBai") n.trangThai = "ChuaGui";
}

export async function createNotification(
  _payload: import("@/src/types/notification.types").CreateNotificationPayload
): Promise<{ created: number }> {
  await delay(800);
  // Mock: trả về số rows sẽ được tạo
  return { created: 3 };
}

// ─── Auto rules ───────────────────────────────────────────────────────────────

export const AUTO_RULE_GROUPS: AutoNotificationRuleGroup[] = [
  {
    group: "DonHang", tenNhom: "Đơn hàng",
    rules: MOCK_AUTO_RULES.filter((r) => r.trigger.startsWith("don_hang")),
  },
  {
    group: "ThanhToan", tenNhom: "Thanh toán",
    rules: MOCK_AUTO_RULES.filter((r) => r.trigger.startsWith("giao_dich")),
  },
  {
    group: "HoanTra", tenNhom: "Hoàn trả",
    rules: MOCK_AUTO_RULES.filter((r) => r.trigger.startsWith("hoan_hang")),
  },
  {
    group: "Marketing", tenNhom: "Marketing & Khuyến mãi",
    rules: MOCK_AUTO_RULES.filter(
      (r) =>
        r.trigger.startsWith("khuyen_mai") ||
        r.trigger.startsWith("coupon") ||
        r.trigger.startsWith("san_pham") ||
        r.trigger.startsWith("gio_hang")
    ),
  },
  {
    group: "Loyalty", tenNhom: "Loyalty & Điểm thưởng",
    rules: MOCK_AUTO_RULES.filter((r) => r.trigger.startsWith("loyalty")),
  },
];

export async function getAutoRuleGroups(): Promise<AutoNotificationRuleGroup[]> {
  await delay(300);
  // Re-build để luôn dùng state mới nhất sau update
  return [
    { group: "DonHang",   tenNhom: "Đơn hàng",                  rules: MOCK_AUTO_RULES.filter((r) => r.trigger.startsWith("don_hang")) },
    { group: "ThanhToan", tenNhom: "Thanh toán",                 rules: MOCK_AUTO_RULES.filter((r) => r.trigger.startsWith("giao_dich")) },
    { group: "HoanTra",   tenNhom: "Hoàn trả",                   rules: MOCK_AUTO_RULES.filter((r) => r.trigger.startsWith("hoan_hang")) },
    { group: "Marketing", tenNhom: "Marketing & Khuyến mãi",     rules: MOCK_AUTO_RULES.filter((r) => ["khuyen_mai","coupon","san_pham","gio_hang"].some((p) => r.trigger.startsWith(p))) },
    { group: "Loyalty",   tenNhom: "Loyalty & Điểm thưởng",      rules: MOCK_AUTO_RULES.filter((r) => r.trigger.startsWith("loyalty")) },
  ] as AutoNotificationRuleGroup[];
}

export async function updateAutoRule(
  id: string,
  patch: Partial<AutoNotificationRule>
): Promise<AutoNotificationRule> {
  await delay(400);
  const idx = MOCK_AUTO_RULES.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error(`Rule ${id} not found`);
  MOCK_AUTO_RULES[idx] = { ...MOCK_AUTO_RULES[idx], ...patch };
  return MOCK_AUTO_RULES[idx];
}
