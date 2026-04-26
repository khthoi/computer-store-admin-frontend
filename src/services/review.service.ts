import type {
  ReviewSummary,
  ReviewDetail,
  ReviewMessage,
  ReviewStats,
  ReviewStatus,
  ReviewSource,
  ModerateReviewPayload,
  AddReviewMessagePayload,
  BulkModeratePayload,
} from "@/src/types/review.types";
import { apiFetch } from "@/src/services/api";

// ─── In-memory store ──────────────────────────────────────────────────────────

let nextMessageId = 100;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Mock review store ────────────────────────────────────────────────────────

let REVIEWS: ReviewSummary[] = [
  {
    reviewId: 1,
    phienBanId: 101,
    tenSanPham: "Laptop Gaming ASUS ROG Strix G15",
    tenPhienBan: "RAM 16GB / RTX 4060 / 512GB SSD",
    anhPhienBan: "https://picsum.photos/seed/asus-g15/80/80",
    khachHangId: 201,
    khachHangTen: "Nguyễn Văn An",
    donHangId: 301,
    maDonHang: "DH-2024-000301",
    rating: 5,
    tieuDe: "Laptop cực kỳ mạnh mẽ, đáng tiền",
    noiDung: "Mình đã dùng được 2 tháng, chơi game mượt mà, không bị nóng nhiều. Màn hình đẹp, bàn phím gõ tốt. Rất hài lòng với sản phẩm này!",
    trangThai: "Approved",
    daPhanHoi: true,
    helpfulCount: 12,
    nguon: "Website",
    nguoiDuyetId: 1,
    nguoiDuyetTen: "Admin Hệ thống",
    duyetTai: "2024-03-10T08:30:00Z",
    createdAt: "2024-03-09T14:20:00Z",
    updatedAt: "2024-03-10T08:30:00Z",
  },
  {
    reviewId: 2,
    phienBanId: 102,
    tenSanPham: "Chuột Gaming Logitech G502",
    tenPhienBan: "Màu Đen / USB",
    anhPhienBan: "https://picsum.photos/seed/g502/80/80",
    khachHangId: 202,
    khachHangTen: "Trần Thị Bích",
    donHangId: 302,
    maDonHang: "DH-2024-000302",
    rating: 4,
    tieuDe: "Chuột tốt nhưng hơi nặng",
    noiDung: "Chuột rất chính xác khi chơi game FPS. Tuy nhiên nặng hơn mình tưởng. Dây cáp mềm dẻo, không vướng. Nhìn chung vẫn hài lòng.",
    trangThai: "Approved",
    daPhanHoi: false,
    helpfulCount: 5,
    nguon: "Website",
    nguoiDuyetId: 1,
    nguoiDuyetTen: "Admin Hệ thống",
    duyetTai: "2024-03-11T09:00:00Z",
    createdAt: "2024-03-10T16:45:00Z",
    updatedAt: "2024-03-11T09:00:00Z",
  },
  {
    reviewId: 3,
    phienBanId: 103,
    tenSanPham: "Bàn phím cơ Keychron K2",
    tenPhienBan: "Brown Switch / Không đèn nền",
    anhPhienBan: "https://picsum.photos/seed/k2/80/80",
    khachHangId: 203,
    khachHangTen: "Lê Minh Hoàng",
    donHangId: 303,
    maDonHang: "DH-2024-000303",
    rating: 5,
    tieuDe: "Bàn phím cơ tuyệt vời cho lập trình viên",
    noiDung: "Gõ rất thỏa mãn, switch brown không quá ồn ào. Layout TKL tiết kiệm bàn. Build quality chắc chắn. Sẽ mua thêm cho đồng nghiệp.",
    trangThai: "Pending",
    daPhanHoi: false,
    helpfulCount: 0,
    nguon: "App",
    createdAt: "2024-04-01T10:00:00Z",
    updatedAt: "2024-04-01T10:00:00Z",
  },
  {
    reviewId: 4,
    phienBanId: 104,
    tenSanPham: "Tai nghe Sony WH-1000XM5",
    tenPhienBan: "Màu Đen / Bluetooth",
    anhPhienBan: "https://picsum.photos/seed/xm5/80/80",
    khachHangId: 204,
    khachHangTen: "Phạm Thị Lan",
    donHangId: 304,
    maDonHang: "DH-2024-000304",
    rating: 2,
    tieuDe: "Chống ồn tốt nhưng pin kém",
    noiDung: "Chống ồn ANC rất ấn tượng. Nhưng pin chỉ được khoảng 18 tiếng thay vì 30 tiếng như quảng cáo. Âm thanh ổn định. Giá hơi cao so với chất lượng thực tế.",
    trangThai: "Pending",
    daPhanHoi: false,
    helpfulCount: 0,
    nguon: "Website",
    createdAt: "2024-04-02T09:30:00Z",
    updatedAt: "2024-04-02T09:30:00Z",
  },
  {
    reviewId: 5,
    phienBanId: 105,
    tenSanPham: "Màn hình Dell UltraSharp U2722D",
    tenPhienBan: "27 inch / 4K / IPS",
    anhPhienBan: "https://picsum.photos/seed/dell-u27/80/80",
    khachHangId: 205,
    khachHangTen: "Hoàng Văn Đức",
    donHangId: 305,
    maDonHang: "DH-2024-000305",
    rating: 5,
    tieuDe: "Màn hình đỉnh cao cho đồ họa",
    noiDung: "Màu sắc cực kỳ chính xác, Delta E < 2. USB-C PD 90W rất tiện lợi. Thiết kế tinh tế, có thể xoay lên xuống trái phải. Hoàn toàn xứng đáng với giá tiền.",
    trangThai: "Approved",
    daPhanHoi: true,
    helpfulCount: 23,
    nguon: "Website",
    nguoiDuyetId: 2,
    nguoiDuyetTen: "Trần Văn Bình",
    duyetTai: "2024-03-20T11:00:00Z",
    createdAt: "2024-03-19T08:00:00Z",
    updatedAt: "2024-03-20T11:00:00Z",
  },
  {
    reviewId: 6,
    phienBanId: 106,
    tenSanPham: "RAM Kingston Fury Beast",
    tenPhienBan: "16GB / DDR5 / 5200MHz",
    anhPhienBan: "https://picsum.photos/seed/fury/80/80",
    khachHangId: 206,
    khachHangTen: "Vũ Thị Hoa",
    donHangId: 306,
    maDonHang: "DH-2024-000306",
    rating: 1,
    tieuDe: "Hàng không đúng mô tả",
    noiDung: "Giao hàng bị thiếu 1 thanh RAM. Liên hệ shop thì được hỗ trợ nhưng phải chờ 5 ngày. Rất thất vọng với dịch vụ giao hàng. Sản phẩm thực tế khi nhận đủ thì OK.",
    trangThai: "Rejected",
    daPhanHoi: true,
    helpfulCount: 3,
    nguon: "App",
    nguoiDuyetId: 1,
    nguoiDuyetTen: "Admin Hệ thống",
    lyDoTuChoi: "Đánh giá có nội dung không đúng sự thật, sản phẩm đã được giao đủ theo xác nhận từ đơn vị vận chuyển.",
    duyetTai: "2024-03-22T14:00:00Z",
    createdAt: "2024-03-21T20:00:00Z",
    updatedAt: "2024-03-22T14:00:00Z",
  },
  {
    reviewId: 7,
    phienBanId: 107,
    tenSanPham: "SSD Samsung 990 Pro",
    tenPhienBan: "1TB / NVMe M.2",
    anhPhienBan: "https://picsum.photos/seed/990pro/80/80",
    khachHangId: 207,
    khachHangTen: "Đặng Quốc Hùng",
    donHangId: 307,
    maDonHang: "DH-2024-000307",
    rating: 4,
    tieuDe: "Tốc độ nhanh, đáng tin cậy",
    noiDung: "Đã dùng 3 tháng, boot Windows 11 chỉ 8 giây. Nhiệt độ ổn định ở 45-50°C khi load nặng. Giá tốt so với thị trường. Giao hàng nhanh.",
    trangThai: "Approved",
    daPhanHoi: false,
    helpfulCount: 8,
    nguon: "Website",
    nguoiDuyetId: 2,
    nguoiDuyetTen: "Trần Văn Bình",
    duyetTai: "2024-03-25T10:00:00Z",
    createdAt: "2024-03-24T15:30:00Z",
    updatedAt: "2024-03-25T10:00:00Z",
  },
  {
    reviewId: 8,
    phienBanId: 108,
    tenSanPham: "Card đồ họa NVIDIA RTX 4080",
    tenPhienBan: "16GB / GDDR6X",
    anhPhienBan: "https://picsum.photos/seed/rtx4080/80/80",
    khachHangId: 208,
    khachHangTen: "Ngô Thành Long",
    donHangId: 308,
    maDonHang: "DH-2024-000308",
    rating: 3,
    tieuDe: "Mạnh nhưng giá quá cao",
    noiDung: "Hiệu năng không thể chê nhưng giá bán tại Việt Nam bị đội lên nhiều so với giá thế giới. 4K gaming hoàn toàn mượt. Nguồn điện cần ít nhất 850W.",
    trangThai: "Hidden",
    daPhanHoi: false,
    helpfulCount: 15,
    nguon: "Website",
    nguoiDuyetId: 1,
    nguoiDuyetTen: "Admin Hệ thống",
    duyetTai: "2024-03-28T09:00:00Z",
    createdAt: "2024-03-27T11:00:00Z",
    updatedAt: "2024-03-28T09:00:00Z",
  },
  {
    reviewId: 9,
    phienBanId: 109,
    tenSanPham: "Nguồn Corsair RM850x",
    tenPhienBan: "850W / 80+ Gold / Modular",
    anhPhienBan: "https://picsum.photos/seed/rm850/80/80",
    khachHangId: 209,
    khachHangTen: "Trịnh Thị Mai",
    donHangId: 309,
    maDonHang: "DH-2024-000309",
    rating: 5,
    tieuDe: "Nguồn tốt nhất trong tầm giá",
    noiDung: "Cáp đẹp, modular rất tiện khi lắp ráp. Im lặng hoàn toàn khi không tải. Đã dùng 6 tháng không vấn đề gì. Bảo hành 10 năm rất an tâm.",
    trangThai: "Pending",
    daPhanHoi: false,
    helpfulCount: 0,
    nguon: "App",
    createdAt: "2024-04-03T08:00:00Z",
    updatedAt: "2024-04-03T08:00:00Z",
  },
  {
    reviewId: 10,
    phienBanId: 110,
    tenSanPham: "Case máy tính Lian Li PC-O11D",
    tenPhienBan: "Màu Trắng / ATX Mid Tower",
    anhPhienBan: "https://picsum.photos/seed/o11d/80/80",
    khachHangId: 210,
    khachHangTen: "Lý Hoàng Nam",
    donHangId: 310,
    maDonHang: "DH-2024-000310",
    rating: 4,
    tieuDe: "Case đẹp, thoáng gió tốt",
    noiDung: "Khoang chứa rộng rãi, lắp 360mm radiator thoải mái. Thiết kế dual chamber quản lý dây cáp dễ dàng. Tấm kính cường lực sang trọng. Chỉ tiếc không có filter bụi ở đáy.",
    trangThai: "Approved",
    daPhanHoi: true,
    helpfulCount: 7,
    nguon: "Website",
    nguoiDuyetId: 2,
    nguoiDuyetTen: "Trần Văn Bình",
    duyetTai: "2024-04-01T14:00:00Z",
    createdAt: "2024-03-31T18:00:00Z",
    updatedAt: "2024-04-01T14:00:00Z",
  },
  {
    reviewId: 11,
    phienBanId: 111,
    tenSanPham: "CPU Intel Core i9-14900K",
    tenPhienBan: "LGA1700 / 24 Cores / 5.8GHz",
    anhPhienBan: "https://picsum.photos/seed/i9-14k/80/80",
    khachHangId: 211,
    khachHangTen: "Bùi Văn Thắng",
    donHangId: 311,
    maDonHang: "DH-2024-000311",
    rating: 5,
    tieuDe: "CPU mạnh nhất thế hệ này",
    noiDung: "Hiệu năng single core vô đối. Đa nhiệm streaming + gaming cùng lúc không vấn đề gì. Cần tản nhiệt tốt (360mm AIO trở lên) và nguồn mạnh 850W+. Giá trị tuyệt vời cho content creator.",
    trangThai: "Pending",
    daPhanHoi: false,
    helpfulCount: 0,
    nguon: "Website",
    createdAt: "2024-04-04T12:00:00Z",
    updatedAt: "2024-04-04T12:00:00Z",
  },
  {
    reviewId: 12,
    phienBanId: 112,
    tenSanPham: "Mainboard ASUS ROG Maximus Z790",
    tenPhienBan: "LGA1700 / DDR5 / ATX",
    anhPhienBan: "https://picsum.photos/seed/z790/80/80",
    khachHangId: 212,
    khachHangTen: "Đinh Thị Thanh",
    donHangId: 312,
    maDonHang: "DH-2024-000312",
    rating: 4,
    tieuDe: "Main cao cấp, nhiều tính năng",
    noiDung: "BIOS dễ sử dụng, OC ổn định. Thunderbolt 4 và USB4 rất tiện. Đèn RGB có thể tắt hoàn toàn. Chỉ đánh 4 sao vì giá quá cao nhưng chất lượng tương xứng.",
    trangThai: "Approved",
    daPhanHoi: false,
    helpfulCount: 4,
    nguon: "App",
    nguoiDuyetId: 1,
    nguoiDuyetTen: "Admin Hệ thống",
    duyetTai: "2024-04-02T10:00:00Z",
    createdAt: "2024-04-01T22:00:00Z",
    updatedAt: "2024-04-02T10:00:00Z",
  },
  {
    reviewId: 13,
    phienBanId: 113,
    tenSanPham: "Webcam Logitech BRIO 4K",
    tenPhienBan: "4K / 30fps / USB-A",
    anhPhienBan: "https://picsum.photos/seed/brio/80/80",
    khachHangId: 213,
    khachHangTen: "Cao Minh Tuấn",
    donHangId: 313,
    maDonHang: "DH-2024-000313",
    rating: 2,
    tieuDe: "Chất lượng video không như quảng cáo",
    noiDung: "4K chỉ 30fps nên không mượt lắm cho streaming. Điều chỉnh màu sắc tự động đôi khi thiếu chính xác. Mic tích hợp chất lượng kém. Giá này nên mua webcam khác.",
    trangThai: "Rejected",
    daPhanHoi: true,
    helpfulCount: 2,
    nguon: "Website",
    nguoiDuyetId: 2,
    nguoiDuyetTen: "Trần Văn Bình",
    lyDoTuChoi: "Thông tin trong đánh giá không chính xác. Sản phẩm hỗ trợ 4K 30fps như mô tả. Streaming cần dùng OBS với encoder phù hợp.",
    duyetTai: "2024-04-04T08:00:00Z",
    createdAt: "2024-04-03T20:00:00Z",
    updatedAt: "2024-04-04T08:00:00Z",
  },
  {
    reviewId: 14,
    phienBanId: 114,
    tenSanPham: "Tản nhiệt nước NZXT Kraken X73",
    tenPhienBan: "360mm / RGB / Intel + AMD",
    anhPhienBan: "https://picsum.photos/seed/kraken/80/80",
    khachHangId: 214,
    khachHangTen: "Nguyễn Thị Yến",
    donHangId: 314,
    maDonHang: "DH-2024-000314",
    rating: 5,
    tieuDe: "Tản nhiệt đỉnh, thiết kế đẹp",
    noiDung: "Giảm nhiệt độ i9-14900K xuống còn 65°C khi load 100%. Đầu bơm có màn hình LCD hiển thị nhiệt độ rất cool. Phần mềm NZXT CAM dễ dùng. Lắp đặt đơn giản.",
    trangThai: "Approved",
    daPhanHoi: false,
    helpfulCount: 11,
    nguon: "App",
    nguoiDuyetId: 1,
    nguoiDuyetTen: "Admin Hệ thống",
    duyetTai: "2024-04-05T09:00:00Z",
    createdAt: "2024-04-04T16:00:00Z",
    updatedAt: "2024-04-05T09:00:00Z",
  },
  {
    reviewId: 15,
    phienBanId: 115,
    tenSanPham: "Loa Harman Kardon Onyx Studio 8",
    tenPhienBan: "Màu Đen / Bluetooth 5.3",
    anhPhienBan: "https://picsum.photos/seed/onyx8/80/80",
    khachHangId: 215,
    khachHangTen: "Phan Văn Khoa",
    donHangId: 315,
    maDonHang: "DH-2024-000315",
    rating: 3,
    tieuDe: "Âm thanh tốt, pin trung bình",
    noiDung: "Bass sâu và rõ ràng. Tuy nhiên pin chỉ được khoảng 5-6 giờ thay vì 8 giờ như quảng cáo. Kết nối Bluetooth ổn định trong tầm 10m. Giá hơi cao nhưng chấp nhận được.",
    trangThai: "Hidden",
    daPhanHoi: false,
    helpfulCount: 6,
    nguon: "Import",
    nguoiDuyetId: 1,
    nguoiDuyetTen: "Admin Hệ thống",
    duyetTai: "2024-04-06T10:00:00Z",
    createdAt: "2024-04-05T14:00:00Z",
    updatedAt: "2024-04-06T10:00:00Z",
  },
  {
    reviewId: 16,
    phienBanId: 116,
    tenSanPham: "Ổ cứng WD Black 2TB",
    tenPhienBan: "2TB / 7200RPM / SATA",
    anhPhienBan: "https://picsum.photos/seed/wdblack/80/80",
    khachHangId: 216,
    khachHangTen: "Hoàng Thị Linh",
    donHangId: 316,
    maDonHang: "DH-2024-000316",
    rating: 4,
    tieuDe: "HDD lưu trữ đáng tin cậy",
    noiDung: "Đã dùng để lưu game, tốc độ đọc ghi ổn định khoảng 170-180MB/s. Không quá ồn. Giá tốt cho dung lượng 2TB. Đây là lần thứ 3 mình mua WD Black và chưa bao giờ thất vọng.",
    trangThai: "Pending",
    daPhanHoi: false,
    helpfulCount: 0,
    nguon: "Website",
    createdAt: "2024-04-07T10:00:00Z",
    updatedAt: "2024-04-07T10:00:00Z",
  },
];

// ─── Mock messages per review ─────────────────────────────────────────────────

const REVIEW_MESSAGES: Record<number, ReviewMessage[]> = {
  1: [
    {
      messageId: 1,
      reviewId: 1,
      senderType: "NhanVien",
      senderId: 1,
      senderName: "Admin Hệ thống",
      noiDungTinNhan: "Cảm ơn bạn đã để lại đánh giá chi tiết! Rất vui khi sản phẩm đáp ứng được kỳ vọng của bạn. Nếu có bất kỳ vấn đề gì, hãy liên hệ chúng tôi nhé!",
      messageType: "Reply",
      isVisibleToCustomer: true,
      createdAt: "2024-03-10T09:00:00Z",
      updatedAt: "2024-03-10T09:00:00Z",
    },
    {
      messageId: 2,
      reviewId: 1,
      senderType: "HeThong",
      senderName: "Hệ thống",
      noiDungTinNhan: "Đánh giá đã được duyệt bởi Admin Hệ thống",
      messageType: "SystemLog",
      isVisibleToCustomer: false,
      createdAt: "2024-03-10T08:30:00Z",
      updatedAt: "2024-03-10T08:30:00Z",
    },
    {
      messageId: 3,
      reviewId: 1,
      senderType: "NhanVien",
      senderId: 2,
      senderName: "Trần Văn Bình",
      noiDungTinNhan: "Note nội bộ: KH này là khách hàng VIP, có thể offer voucher giảm giá lần mua tiếp theo.",
      messageType: "InternalNote",
      isVisibleToCustomer: false,
      createdAt: "2024-03-10T10:00:00Z",
      updatedAt: "2024-03-10T10:00:00Z",
    },
  ],
  5: [
    {
      messageId: 10,
      reviewId: 5,
      senderType: "HeThong",
      senderName: "Hệ thống",
      noiDungTinNhan: "Đánh giá đã được duyệt bởi Trần Văn Bình",
      messageType: "SystemLog",
      isVisibleToCustomer: false,
      createdAt: "2024-03-20T11:00:00Z",
      updatedAt: "2024-03-20T11:00:00Z",
    },
    {
      messageId: 11,
      reviewId: 5,
      senderType: "NhanVien",
      senderId: 2,
      senderName: "Trần Văn Bình",
      noiDungTinNhan: "Cảm ơn bạn đã tin tưởng và ủng hộ cửa hàng! Màn hình Dell UltraSharp luôn là lựa chọn hàng đầu cho thiết kế đồ họa. Chúc bạn làm việc hiệu quả!",
      messageType: "Reply",
      isVisibleToCustomer: true,
      createdAt: "2024-03-20T11:30:00Z",
      updatedAt: "2024-03-20T11:30:00Z",
    },
  ],
  6: [
    {
      messageId: 20,
      reviewId: 6,
      senderType: "HeThong",
      senderName: "Hệ thống",
      noiDungTinNhan: "Đánh giá đã bị từ chối bởi Admin Hệ thống",
      messageType: "SystemLog",
      isVisibleToCustomer: false,
      createdAt: "2024-03-22T14:00:00Z",
      updatedAt: "2024-03-22T14:00:00Z",
    },
    {
      messageId: 21,
      reviewId: 6,
      senderType: "NhanVien",
      senderId: 1,
      senderName: "Admin Hệ thống",
      noiDungTinNhan: "Đã xác minh với đơn vị vận chuyển, hàng giao đủ 2 thanh RAM. Từ chối đánh giá vì nội dung không chính xác.",
      messageType: "InternalNote",
      isVisibleToCustomer: false,
      createdAt: "2024-03-22T14:05:00Z",
      updatedAt: "2024-03-22T14:05:00Z",
    },
    {
      messageId: 22,
      reviewId: 6,
      senderType: "NhanVien",
      senderId: 1,
      senderName: "Admin Hệ thống",
      noiDungTinNhan: "Chào bạn, chúng tôi đã xem xét đánh giá của bạn. Theo thông tin từ đơn vị vận chuyển, đơn hàng đã được giao đầy đủ. Nếu có thắc mắc, vui lòng liên hệ CSKH.",
      messageType: "Reply",
      isVisibleToCustomer: true,
      createdAt: "2024-03-22T14:10:00Z",
      updatedAt: "2024-03-22T14:10:00Z",
    },
  ],
  10: [
    {
      messageId: 30,
      reviewId: 10,
      senderType: "HeThong",
      senderName: "Hệ thống",
      noiDungTinNhan: "Đánh giá đã được duyệt bởi Trần Văn Bình",
      messageType: "SystemLog",
      isVisibleToCustomer: false,
      createdAt: "2024-04-01T14:00:00Z",
      updatedAt: "2024-04-01T14:00:00Z",
    },
    {
      messageId: 31,
      reviewId: 10,
      senderType: "NhanVien",
      senderId: 2,
      senderName: "Trần Văn Bình",
      noiDungTinNhan: "Cảm ơn góp ý về filter bụi! Chúng tôi sẽ ghi nhận để cải thiện thông tin mô tả sản phẩm. Case Lian Li O11D là lựa chọn tuyệt vời cho build PC cao cấp!",
      messageType: "Reply",
      isVisibleToCustomer: true,
      createdAt: "2024-04-01T14:30:00Z",
      updatedAt: "2024-04-01T14:30:00Z",
    },
  ],
  13: [
    {
      messageId: 40,
      reviewId: 13,
      senderType: "HeThong",
      senderName: "Hệ thống",
      noiDungTinNhan: "Đánh giá đã bị từ chối bởi Trần Văn Bình",
      messageType: "SystemLog",
      isVisibleToCustomer: false,
      createdAt: "2024-04-04T08:00:00Z",
      updatedAt: "2024-04-04T08:00:00Z",
    },
    {
      messageId: 41,
      reviewId: 13,
      senderType: "NhanVien",
      senderId: 2,
      senderName: "Trần Văn Bình",
      noiDungTinNhan: "Chào bạn, cảm ơn đã đánh giá sản phẩm. Webcam BRIO 4K hỗ trợ 4K 30fps như mô tả kỹ thuật. Để streaming mượt hơn, bạn có thể dùng độ phân giải 1080p 60fps. Liên hệ CSKH để được hỗ trợ cài đặt!",
      messageType: "Reply",
      isVisibleToCustomer: true,
      createdAt: "2024-04-04T08:15:00Z",
      updatedAt: "2024-04-04T08:15:00Z",
    },
  ],
};

// ─── Service functions ────────────────────────────────────────────────────────

export async function getReviews(params: {
  page:         number;
  limit:        number;
  search?:      string;
  trangThai?:   ReviewStatus;
  rating?:      number;
  phienBanId?:  number;
  dateFrom?:    string;
  dateTo?:      string;
  chuaTraLoi?:  boolean;
  nguon?:       ReviewSource;
}): Promise<{ data: ReviewSummary[]; total: number }> {
  await delay(300);

  let filtered = [...REVIEWS];

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.tieuDe?.toLowerCase().includes(q) ||
        r.noiDung?.toLowerCase().includes(q) ||
        r.khachHangTen.toLowerCase().includes(q) ||
        r.tenSanPham.toLowerCase().includes(q) ||
        r.maDonHang.toLowerCase().includes(q)
    );
  }

  if (params.trangThai) {
    filtered = filtered.filter((r) => r.trangThai === params.trangThai);
  }

  if (params.rating) {
    filtered = filtered.filter((r) => r.rating === params.rating);
  }

  if (params.phienBanId) {
    filtered = filtered.filter((r) => r.phienBanId === params.phienBanId);
  }

  if (params.dateFrom) {
    const from = new Date(params.dateFrom).getTime();
    filtered = filtered.filter((r) => new Date(r.createdAt).getTime() >= from);
  }

  if (params.dateTo) {
    const to = new Date(params.dateTo).getTime();
    filtered = filtered.filter((r) => new Date(r.createdAt).getTime() <= to);
  }

  if (params.chuaTraLoi) {
    filtered = filtered.filter((r) => !r.daPhanHoi);
  }

  if (params.nguon) {
    filtered = filtered.filter((r) => r.nguon === params.nguon);
  }

  const total = filtered.length;
  const start = (params.page - 1) * params.limit;
  const data  = filtered.slice(start, start + params.limit);

  return { data, total };
}

export async function getReviewStats(): Promise<ReviewStats> {
  await delay(200);

  const tong     = REVIEWS.length;
  const choDuyet = REVIEWS.filter((r) => r.trangThai === "Pending").length;
  const daDuyet  = REVIEWS.filter((r) => r.trangThai === "Approved").length;
  const tuChoi   = REVIEWS.filter((r) => r.trangThai === "Rejected").length;
  const an       = REVIEWS.filter((r) => r.trangThai === "Hidden").length;
  const chuaTraLoi = REVIEWS.filter((r) => r.trangThai === "Approved" && !r.daPhanHoi).length;

  const approvedRatings = REVIEWS.filter((r) => r.trangThai === "Approved");
  const tbRating = approvedRatings.length > 0
    ? Math.round((approvedRatings.reduce((s, r) => s + r.rating, 0) / approvedRatings.length) * 10) / 10
    : 0;

  return { tong, choDuyet, daDuyet, tuChoi, an, tbRating, chuaTraLoi };
}

export async function getReviewDetail(reviewId: number): Promise<ReviewDetail> {
  await delay(300);

  const review = REVIEWS.find((r) => r.reviewId === reviewId);
  if (!review) throw new Error(`Review ${reviewId} not found`);

  const messages = REVIEW_MESSAGES[reviewId] ?? [];

  return { ...review, messages };
}

export async function moderateReview(payload: ModerateReviewPayload): Promise<void> {
  const { reviewId, action, lyDoTuChoi } = payload;

  // "unhide" has no dedicated endpoint — semantically identical to re-approving
  const endpoint = action === "unhide"
    ? `/admin/reviews/${reviewId}/approve`
    : `/admin/reviews/${reviewId}/${action}`;

  const needsBody = (action === "reject" || action === "hide") && lyDoTuChoi;

  await apiFetch<void>(endpoint, {
    method: "PUT",
    ...(needsBody ? { body: JSON.stringify({ reason: lyDoTuChoi }) } : {}),
  });
}

export async function moderateReviewBulk(payload: BulkModeratePayload): Promise<void> {
  await delay(300);

  // Simulate ~20% random failure
  const shouldFail = Math.random() < 0.2;
  if (shouldFail) {
    throw new Error("Lỗi máy chủ khi xử lý yêu cầu");
  }

  for (const reviewId of payload.reviewIds) {
    await moderateReview({
      reviewId,
      action:      payload.action,
      lyDoTuChoi:  payload.lyDoTuChoi,
    });
  }
}

export async function addReviewMessage(payload: AddReviewMessagePayload): Promise<ReviewMessage> {
  await delay(350);

  const review = REVIEWS.find((r) => r.reviewId === payload.reviewId);
  if (!review) throw new Error(`Review ${payload.reviewId} not found`);

  const now = new Date().toISOString();
  const newMsg: ReviewMessage = {
    messageId:           nextMessageId++,
    reviewId:            payload.reviewId,
    senderType:          "NhanVien",
    senderId:            1,
    senderName:          "Admin Hệ thống",
    noiDungTinNhan:      payload.noiDung,
    messageType:         payload.messageType,
    isVisibleToCustomer: payload.messageType === "Reply",
    createdAt:           now,
    updatedAt:           now,
  };

  const msgs = REVIEW_MESSAGES[payload.reviewId] ?? [];
  msgs.push(newMsg);
  REVIEW_MESSAGES[payload.reviewId] = msgs;

  // Update daPhanHoi flag
  if (payload.messageType === "Reply") {
    const idx = REVIEWS.findIndex((r) => r.reviewId === payload.reviewId);
    if (idx !== -1) {
      REVIEWS[idx] = { ...REVIEWS[idx], daPhanHoi: true, updatedAt: now };
    }
  }

  return newMsg;
}
