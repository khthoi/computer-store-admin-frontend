import type {
  Transaction,
  TransactionRow,
  TransactionStats,
  GetTransactionsParams,
  GetTransactionsResult,
} from "@/src/types/transaction.types";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TRANSACTIONS: TransactionRow[] = [
  {
    giaoDichId: 1001, donHangId: 1,
    maDonHang: "ORD-2024-0001", khachHangId: 101,
    tenKhachHang: "Nguyễn Văn An", emailKhachHang: "an.nguyen@gmail.com",
    phuongThucThanhToan: "VNPAY", soTien: 25990000,
    trangThaiGiaoDich: "ThanhCong",
    maGiaoDichNgoai: "VNP20240417143201001", nganHangVi: "Vietcombank",
    thoiDiemThanhToan: "2024-04-17T14:32:01Z", ngayTao: "2024-04-17T14:30:00Z", ghiChuLoi: null,
  },
  {
    giaoDichId: 1002, donHangId: 2,
    maDonHang: "ORD-2024-0002", khachHangId: 102,
    tenKhachHang: "Trần Thị Bình", emailKhachHang: "binh.tran@yahoo.com",
    phuongThucThanhToan: "Momo", soTien: 8500000,
    trangThaiGiaoDich: "ThanhCong",
    maGiaoDichNgoai: "MOMO20240417091500002", nganHangVi: "Ví MoMo",
    thoiDiemThanhToan: "2024-04-17T09:15:00Z", ngayTao: "2024-04-17T09:13:22Z", ghiChuLoi: null,
  },
  {
    giaoDichId: 1003, donHangId: 3,
    maDonHang: "ORD-2024-0003", khachHangId: 103,
    tenKhachHang: "Lê Minh Châu", emailKhachHang: "chau.le@outlook.com",
    phuongThucThanhToan: "COD", soTien: 3200000,
    trangThaiGiaoDich: "Cho",
    maGiaoDichNgoai: null, nganHangVi: null,
    thoiDiemThanhToan: null, ngayTao: "2024-04-17T11:45:00Z", ghiChuLoi: null,
  },
  {
    giaoDichId: 1004, donHangId: 4,
    maDonHang: "ORD-2024-0004", khachHangId: 104,
    tenKhachHang: "Phạm Quốc Dũng", emailKhachHang: "dung.pham@gmail.com",
    phuongThucThanhToan: "VNPAY", soTien: 45000000,
    trangThaiGiaoDich: "ThatBai",
    maGiaoDichNgoai: "VNP20240416220000004", nganHangVi: "Techcombank",
    thoiDiemThanhToan: null, ngayTao: "2024-04-16T22:00:00Z",
    ghiChuLoi: "Giao dịch bị từ chối bởi ngân hàng: Số dư tài khoản không đủ (mã lỗi: 24)",
  },
  {
    giaoDichId: 1005, donHangId: 5,
    maDonHang: "ORD-2024-0005", khachHangId: 105,
    tenKhachHang: "Hoàng Thị Diệu", emailKhachHang: "dieu.hoang@gmail.com",
    phuongThucThanhToan: "ChuyenKhoan", soTien: 12750000,
    trangThaiGiaoDich: "ThanhCong",
    maGiaoDichNgoai: "CK20240416160000005", nganHangVi: "BIDV",
    thoiDiemThanhToan: "2024-04-16T16:00:00Z", ngayTao: "2024-04-16T15:30:00Z", ghiChuLoi: null,
  },
  {
    giaoDichId: 1006, donHangId: 6,
    maDonHang: "ORD-2024-0006", khachHangId: 106,
    tenKhachHang: "Võ Thanh Em", emailKhachHang: "em.vo@gmail.com",
    phuongThucThanhToan: "ZaloPay", soTien: 5600000,
    trangThaiGiaoDich: "DaHoan",
    maGiaoDichNgoai: "ZALO20240415103000006", nganHangVi: "ZaloPay",
    thoiDiemThanhToan: "2024-04-15T10:30:00Z", ngayTao: "2024-04-15T10:28:00Z", ghiChuLoi: null,
  },
  {
    giaoDichId: 1007, donHangId: 7,
    maDonHang: "ORD-2024-0007", khachHangId: 107,
    tenKhachHang: "Đặng Hữu Phước", emailKhachHang: "phuoc.dang@yahoo.com",
    phuongThucThanhToan: "TraGop", soTien: 35000000,
    trangThaiGiaoDich: "Cho",
    maGiaoDichNgoai: null, nganHangVi: "FE Credit",
    thoiDiemThanhToan: null, ngayTao: "2024-04-15T08:00:00Z", ghiChuLoi: null,
  },
  {
    giaoDichId: 1008, donHangId: 8,
    maDonHang: "ORD-2024-0008", khachHangId: 108,
    tenKhachHang: "Bùi Thị Giang", emailKhachHang: "giang.bui@gmail.com",
    phuongThucThanhToan: "VNPAY", soTien: 9800000,
    trangThaiGiaoDich: "ThatBai",
    maGiaoDichNgoai: "VNP20240414195500008", nganHangVi: "ACB",
    thoiDiemThanhToan: null, ngayTao: "2024-04-14T19:55:00Z",
    ghiChuLoi: "Timeout kết nối cổng thanh toán. Giao dịch không được xác nhận (mã lỗi: 99)",
  },
  {
    giaoDichId: 1009, donHangId: 9,
    maDonHang: "ORD-2024-0009", khachHangId: 109,
    tenKhachHang: "Ngô Văn Hải", emailKhachHang: "hai.ngo@outlook.com",
    phuongThucThanhToan: "Momo", soTien: 2100000,
    trangThaiGiaoDich: "ThanhCong",
    maGiaoDichNgoai: "MOMO20240414141200009", nganHangVi: "Ví MoMo",
    thoiDiemThanhToan: "2024-04-14T14:12:00Z", ngayTao: "2024-04-14T14:11:00Z", ghiChuLoi: null,
  },
  {
    giaoDichId: 1010, donHangId: 10,
    maDonHang: "ORD-2024-0010", khachHangId: 110,
    tenKhachHang: "Lý Thị Hoa", emailKhachHang: "hoa.ly@gmail.com",
    phuongThucThanhToan: "COD", soTien: 7300000,
    trangThaiGiaoDich: "Cho",
    maGiaoDichNgoai: null, nganHangVi: null,
    thoiDiemThanhToan: null, ngayTao: "2024-04-14T10:00:00Z", ghiChuLoi: null,
  },
  {
    giaoDichId: 1011, donHangId: 11,
    maDonHang: "ORD-2024-0011", khachHangId: 111,
    tenKhachHang: "Trương Quốc Khải", emailKhachHang: "khai.truong@gmail.com",
    phuongThucThanhToan: "ChuyenKhoan", soTien: 18900000,
    trangThaiGiaoDich: "ThanhCong",
    maGiaoDichNgoai: "CK20240413090000011", nganHangVi: "Agribank",
    thoiDiemThanhToan: "2024-04-13T09:00:00Z", ngayTao: "2024-04-13T08:45:00Z", ghiChuLoi: null,
  },
  {
    giaoDichId: 1012, donHangId: 12,
    maDonHang: "ORD-2024-0012", khachHangId: 112,
    tenKhachHang: "Phan Thị Lan", emailKhachHang: "lan.phan@yahoo.com",
    phuongThucThanhToan: "ZaloPay", soTien: 4200000,
    trangThaiGiaoDich: "DaHoan",
    maGiaoDichNgoai: "ZALO20240412153000012", nganHangVi: "ZaloPay",
    thoiDiemThanhToan: "2024-04-12T15:30:00Z", ngayTao: "2024-04-12T15:28:10Z", ghiChuLoi: null,
  },
];

// ─── Service functions ─────────────────────────────────────────────────────────

/**
 * Lấy danh sách giao dịch với filter theo trạng thái, phương thức, ngày và
 * search. Phản ánh index idx_gd_trangthai_ngay.
 * Mock implementation — thay bằng GET /admin/transactions
 */
export async function getTransactions(
  params: GetTransactionsParams = {}
): Promise<GetTransactionsResult> {
  const {
    page = 1,
    pageSize = 20,
    trangThai = [],
    phuongThuc = [],
    tuNgay,
    denNgay,
    q = "",
  } = params;

  let filtered = [...MOCK_TRANSACTIONS];

  // Filter trạng thái
  if (trangThai.length > 0) {
    filtered = filtered.filter((t) => trangThai.includes(t.trangThaiGiaoDich));
  }

  // Filter phương thức thanh toán
  if (phuongThuc.length > 0) {
    filtered = filtered.filter((t) => phuongThuc.includes(t.phuongThucThanhToan));
  }

  // Filter ngày tạo
  if (tuNgay) {
    filtered = filtered.filter((t) => t.ngayTao >= tuNgay);
  }
  if (denNgay) {
    // denNgay inclusive — add 1 day
    const nextDay = new Date(denNgay);
    nextDay.setDate(nextDay.getDate() + 1);
    filtered = filtered.filter((t) => t.ngayTao < nextDay.toISOString());
  }

  // Search theo mã GD ngoài hoặc mã đơn hàng
  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.maDonHang.toLowerCase().includes(lower) ||
        t.maGiaoDichNgoai?.toLowerCase().includes(lower) ||
        t.tenKhachHang.toLowerCase().includes(lower)
    );
  }

  // Mới nhất trước
  filtered.sort((a, b) => b.ngayTao.localeCompare(a.ngayTao));

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return { data, total };
}

/**
 * Lấy giao dịch của một đơn hàng (quan hệ 1-1).
 * Mock implementation — thay bằng GET /admin/orders/:id/transaction
 */
export async function getTransactionByOrderId(
  donHangId: number
): Promise<Transaction | null> {
  const found = MOCK_TRANSACTIONS.find((t) => t.donHangId === donHangId);
  return found ?? null;
}

/**
 * Lấy thống kê tổng quan cho StatCards.
 * Mock implementation — thay bằng GET /admin/transactions/stats
 */
export async function getTransactionStats(): Promise<TransactionStats> {
  const all = MOCK_TRANSACTIONS;
  const thanhCong = all.filter((t) => t.trangThaiGiaoDich === "ThanhCong");
  const thatBai   = all.filter((t) => t.trangThaiGiaoDich === "ThatBai");
  const dangCho   = all.filter((t) => t.trangThaiGiaoDich === "Cho");
  const daHoan    = all.filter((t) => t.trangThaiGiaoDich === "DaHoan");

  const tongTien = thanhCong.reduce((sum, t) => sum + t.soTien, 0);
  const tyLeThanhCong =
    all.length > 0 ? Math.round((thanhCong.length / all.length) * 100) : 0;

  return {
    tongGiaoDich:  all.length,
    tongTien,
    soThanhCong:   thanhCong.length,
    soThatBai:     thatBai.length,
    soDangCho:     dangCho.length,
    soDaHoan:      daHoan.length,
    tyLeThanhCong,
  };
}
