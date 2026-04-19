import type {
  SpecGroup,
  SpecType,
  CategorySpecGroupAssignment,
} from "@/src/types/spec_group.types";

// ─── Spec Groups ───────────────────────────────────────────────────────────────
//
// ID map
//   sg-001  Thông số chung            — shared by many categories (many-to-many test)
//   sg-002  Hiệu năng GPU
//   sg-003  Hiệu năng CPU
//   sg-004  Bộ nhớ RAM
//   sg-005  Lưu trữ SSD
//   sg-006  Thông số màn hình
//   sg-007  Kết nối & Cổng
//   sg-008  Thiết bị ngoại vi chung
//   sg-009  Âm thanh
//   sg-010  Kích thước & Trọng lượng
//   sg-011  Vật liệu & Chất liệu
//   sg-012  Hiệu năng laptop
//   sg-013  Màn hình laptop           — shared by cat-510 AND cat-530 (many-to-many)
//   sg-014  Làm mát & Nhiệt độ
//   sg-015  Công suất điện
//   sg-016  Chứng nhận & Tiêu chuẩn  — shared by cat-101, cat-320, cat-530
//   sg-017  Kết nối không dây
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_SPEC_GROUPS: SpecGroup[] = [
  // ── Original groups ──────────────────────────────────────────────────────
  { id: "sg-001", name: "Thông số chung",            description: "Thông số áp dụng cho tất cả sản phẩm: bảo hành, xuất xứ, khối lượng",            displayOrder: 1,  createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "sg-002", name: "Hiệu năng GPU",             description: "Thông số kỹ thuật dành riêng cho card đồ họa",                                    displayOrder: 2,  createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "sg-003", name: "Hiệu năng CPU",             description: "Thông số kỹ thuật dành riêng cho bộ xử lý",                                       displayOrder: 3,  createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "sg-004", name: "Bộ nhớ RAM",                description: "Thông số kỹ thuật bộ nhớ RAM",                                                     displayOrder: 4,  createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "sg-005", name: "Lưu trữ SSD",               description: "Thông số kỹ thuật ổ cứng thể rắn SSD",                                            displayOrder: 5,  createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "sg-006", name: "Thông số màn hình",         description: "Thông số kỹ thuật màn hình máy tính độc lập",                                      displayOrder: 6,  createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "sg-007", name: "Kết nối & Cổng",            description: "Chuẩn kết nối và cổng giao tiếp ngoại vi",                                         displayOrder: 7,  createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },

  // ── New groups ───────────────────────────────────────────────────────────
  { id: "sg-008", name: "Thiết bị ngoại vi chung",   description: "Thông số chung cho chuột, bàn phím và ngoại vi: kết nối, tương thích, màu sắc",   displayOrder: 8,  createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "sg-009", name: "Âm thanh",                  description: "Thông số kỹ thuật âm thanh: driver, độ nhạy, trở kháng, dải tần",                 displayOrder: 9,  createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "sg-010", name: "Kích thước & Trọng lượng",  description: "Chiều dài, chiều rộng, chiều cao và trọng lượng sản phẩm",                         displayOrder: 10, createdAt: "2026-01-15T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "sg-011", name: "Vật liệu & Chất liệu",      description: "Chất liệu khung, bề mặt, lớp phủ và màu sắc sản phẩm",                            displayOrder: 11, createdAt: "2026-01-15T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "sg-012", name: "Hiệu năng laptop",          description: "CPU, GPU rời, RAM, ổ cứng, pin và hệ điều hành của laptop",                       displayOrder: 12, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "sg-013", name: "Màn hình laptop",           description: "Kích thước, độ phân giải, tần số quét, tấm nền và tỉ lệ màu của màn hình laptop", displayOrder: 13, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "sg-014", name: "Làm mát & Nhiệt độ",        description: "Công nghệ làm lạnh, dung môi, nhiệt độ hoạt động và chỉ số hiệu suất năng lượng", displayOrder: 14, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "sg-015", name: "Công suất điện",            description: "Công suất tiêu thụ, điện áp, tần số điện và nhãn năng lượng",                     displayOrder: 15, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "sg-016", name: "Chứng nhận & Tiêu chuẩn",  description: "Chứng nhận an toàn, năng lượng và tiêu chuẩn EMC áp dụng cho sản phẩm",           displayOrder: 16, createdAt: "2026-02-10T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "sg-017", name: "Kết nối không dây",         description: "Phiên bản Bluetooth, chuẩn Wi-Fi, tần số và USB receiver",                        displayOrder: 17, createdAt: "2026-02-10T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
];

// ─── Spec Types ────────────────────────────────────────────────────────────────
//
// Filter field conventions:
//   kieuDuLieu — kiểu dữ liệu: text | number | boolean | enum
//   donVi      — đơn vị (chỉ khi kieuDuLieu = 'number'): 'GHz', 'W', 'GB', 'MHz', 'Hz', 'inch', 'ms', 'nit', 'Ohm', 'dB'
//   coTheLoc   — true = hiện facet filter ở trang danh sách sản phẩm
//   widgetLoc  — checkbox | range | toggle (chỉ khi coTheLoc = true)
//   thuTuLoc   — thứ tự trong sidebar bộ lọc (chỉ khi coTheLoc = true, 0 = không ưu tiên)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_SPEC_TYPES: SpecType[] = [
  // ── sg-001: Thông số chung ─────────────────────────────────────────────────
  { id: "st-001-1", groupId: "sg-001", name: "Bảo hành",     description: "Thời gian bảo hành tính bằng tháng",           displayOrder: 1, required: true,  kieuDuLieu: "number", donVi: "tháng", coTheLoc: false, thuTuLoc: 0, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-001-2", groupId: "sg-001", name: "Xuất xứ",      description: "Quốc gia hoặc thương hiệu sản xuất",           displayOrder: 2, required: false, kieuDuLieu: "enum",   coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 9, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-001-3", groupId: "sg-001", name: "Khối lượng",   description: "Khối lượng sản phẩm tính theo gam",            displayOrder: 3, required: false, kieuDuLieu: "number", donVi: "g",     coTheLoc: false, thuTuLoc: 0, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },

  // ── sg-002: Hiệu năng GPU ──────────────────────────────────────────────────
  { id: "st-002-1", groupId: "sg-002", name: "VRAM",          description: "Dung lượng bộ nhớ đồ họa tính theo GB",          displayOrder: 1, required: true,  kieuDuLieu: "enum",   donVi: "GB",  coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-002-2", groupId: "sg-002", name: "Bus bộ nhớ",   description: "Độ rộng bus bộ nhớ GPU tính theo bit",          displayOrder: 2, required: true,  kieuDuLieu: "number", donVi: "bit", coTheLoc: true,  widgetLoc: "range",    thuTuLoc: 4, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-002-3", groupId: "sg-002", name: "Clock cơ bản", description: "Tốc độ xung nhịp cơ bản tính theo MHz",         displayOrder: 3, required: false, kieuDuLieu: "number", donVi: "MHz", coTheLoc: false, thuTuLoc: 0, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-002-4", groupId: "sg-002", name: "Clock boost",  description: "Tốc độ xung nhịp tối đa (boost) tính theo MHz", displayOrder: 4, required: false, kieuDuLieu: "number", donVi: "MHz", coTheLoc: true,  widgetLoc: "range",    thuTuLoc: 5, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-002-5", groupId: "sg-002", name: "TDP",          description: "Mức tiêu thụ điện năng thiết kế tính theo W",   displayOrder: 5, required: true,  kieuDuLieu: "number", donVi: "W",   coTheLoc: true,  widgetLoc: "range",    thuTuLoc: 3, maKyThuat: "tdp_watt", createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-002-6", groupId: "sg-002", name: "Kiến trúc",    description: "Tên kiến trúc vi xử lý đồ họa",                 displayOrder: 6, required: false, kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 2, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },

  // ── sg-003: Hiệu năng CPU ──────────────────────────────────────────────────
  { id: "st-003-1", groupId: "sg-003", name: "Số nhân",      description: "Tổng số nhân vật lý của CPU",                        displayOrder: 1, required: true,  kieuDuLieu: "number",               coTheLoc: true,  widgetLoc: "range",    thuTuLoc: 3, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-003-2", groupId: "sg-003", name: "Số luồng",     description: "Tổng số luồng xử lý song song",                      displayOrder: 2, required: true,  kieuDuLieu: "number",               coTheLoc: false, thuTuLoc: 0, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-003-3", groupId: "sg-003", name: "Clock cơ bản", description: "Tốc độ xung nhịp cơ bản tính theo GHz",              displayOrder: 3, required: true,  kieuDuLieu: "number", donVi: "GHz", coTheLoc: false, thuTuLoc: 0, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-003-4", groupId: "sg-003", name: "Clock tối đa", description: "Tốc độ xung nhịp boost tối đa tính theo GHz",        displayOrder: 4, required: false, kieuDuLieu: "number", donVi: "GHz", coTheLoc: true,  widgetLoc: "range",    thuTuLoc: 4, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-003-5", groupId: "sg-003", name: "Cache L3",     description: "Dung lượng bộ nhớ đệm L3 tính theo MB",              displayOrder: 5, required: false, kieuDuLieu: "number", donVi: "MB",  coTheLoc: false, thuTuLoc: 0, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-003-6", groupId: "sg-003", name: "TDP",          description: "Mức tiêu thụ điện năng thiết kế tính theo W",        displayOrder: 6, required: true,  kieuDuLieu: "number", donVi: "W",   coTheLoc: true,  widgetLoc: "range",    thuTuLoc: 5, maKyThuat: "tdp_watt",    createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-003-7", groupId: "sg-003", name: "Socket",       description: "Loại socket mainboard tương thích (LGA1700, AM5, ...)", displayOrder: 7, required: true,  kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, maKyThuat: "cpu_socket",  createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-003-8", groupId: "sg-003", name: "Dòng CPU",     description: "Dòng / thế hệ CPU (Core i5, Ryzen 7, ...)",           displayOrder: 8, required: false, kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 2, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-04-01T08:00:00Z" },

  // ── sg-004: Bộ nhớ RAM ─────────────────────────────────────────────────────
  { id: "st-004-1", groupId: "sg-004", name: "Dung lượng",  description: "Dung lượng RAM tính theo GB",                   displayOrder: 1, required: true,  kieuDuLieu: "enum",   donVi: "GB",  coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, maKyThuat: "ram_max_capacity_gb", createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-004-2", groupId: "sg-004", name: "Loại RAM",    description: "Thế hệ RAM (DDR4, DDR5, ...)",                  displayOrder: 2, required: true,  kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 2, maKyThuat: "ram_type",            createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-004-3", groupId: "sg-004", name: "Tốc độ",      description: "Tốc độ bus bộ nhớ tính theo MHz",               displayOrder: 3, required: true,  kieuDuLieu: "number", donVi: "MHz", coTheLoc: true,  widgetLoc: "range",    thuTuLoc: 3, maKyThuat: "ram_max_speed_mhz",   createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-004-4", groupId: "sg-004", name: "Hệ số dạng",  description: "Form factor của RAM (DIMM, SO-DIMM, ...)",       displayOrder: 4, required: false, kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 4, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },

  // ── sg-005: Lưu trữ SSD ───────────────────────────────────────────────────
  { id: "st-005-1", groupId: "sg-005", name: "Dung lượng",  description: "Dung lượng lưu trữ tính theo GB",                        displayOrder: 1, required: true,  kieuDuLieu: "enum",   donVi: "GB",   coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-005-2", groupId: "sg-005", name: "Giao tiếp",   description: "Chuẩn giao tiếp (NVMe PCIe, SATA, ...)",                 displayOrder: 2, required: true,  kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 2, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-005-3", groupId: "sg-005", name: "Tốc độ đọc",  description: "Tốc độ đọc tuần tự tối đa tính theo MB/s",               displayOrder: 3, required: false, kieuDuLieu: "number", donVi: "MB/s", coTheLoc: true,  widgetLoc: "range",    thuTuLoc: 3, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-005-4", groupId: "sg-005", name: "Tốc độ ghi",  description: "Tốc độ ghi tuần tự tối đa tính theo MB/s",               displayOrder: 4, required: false, kieuDuLieu: "number", donVi: "MB/s", coTheLoc: false, thuTuLoc: 0, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-005-5", groupId: "sg-005", name: "Loại Flash",   description: "Công nghệ Flash sử dụng (TLC, MLC, QLC, ...)",           displayOrder: 5, required: false, kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 4, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },

  // ── sg-006: Thông số màn hình ─────────────────────────────────────────────
  { id: "st-006-1", groupId: "sg-006", name: "Kích thước",         description: "Kích thước đường chéo màn hình tính theo inch",         displayOrder: 1, required: true,  kieuDuLieu: "number", donVi: "inch", coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-006-2", groupId: "sg-006", name: "Độ phân giải",       description: "Độ phân giải tối đa của màn hình (1920×1080, ...)",     displayOrder: 2, required: true,  kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 2, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-006-3", groupId: "sg-006", name: "Tần số quét",        description: "Tần số làm mới tính theo Hz",                           displayOrder: 3, required: true,  kieuDuLieu: "number", donVi: "Hz",  coTheLoc: true,  widgetLoc: "range",    thuTuLoc: 3, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-006-4", groupId: "sg-006", name: "Loại tấm nền",       description: "Công nghệ tấm nền (IPS, VA, TN, OLED, ...)",           displayOrder: 4, required: false, kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 4, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-006-5", groupId: "sg-006", name: "Thời gian phản hồi", description: "Thời gian chuyển đổi pixel tính theo ms",              displayOrder: 5, required: false, kieuDuLieu: "number", donVi: "ms",  coTheLoc: false, thuTuLoc: 0, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-006-6", groupId: "sg-006", name: "Độ sáng",            description: "Độ sáng tối đa tính theo nit (cd/m²)",                 displayOrder: 6, required: false, kieuDuLieu: "number", donVi: "nit", coTheLoc: false, thuTuLoc: 0, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },

  // ── sg-007: Kết nối & Cổng ────────────────────────────────────────────────
  { id: "st-007-1", groupId: "sg-007", name: "Chuẩn PCIe",   description: "Phiên bản PCIe hỗ trợ (3.0, 4.0, 5.0, ...)",                   displayOrder: 1, required: false, kieuDuLieu: "enum", coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, maKyThuat: "pcie_version", createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-007-2", groupId: "sg-007", name: "Cổng kết nối", description: "Danh sách các cổng ngoại vi hỗ trợ (USB-A, USB-C, HDMI, ...)", displayOrder: 2, required: false, kieuDuLieu: "text", coTheLoc: false, thuTuLoc: 0, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },
  { id: "st-007-3", groupId: "sg-007", name: "Thunderbolt",  description: "Phiên bản Thunderbolt hỗ trợ (3, 4, 5) nếu có",               displayOrder: 3, required: false, kieuDuLieu: "enum", coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 2, createdAt: "2025-10-01T07:00:00Z", updatedAt: "2026-03-01T08:00:00Z" },

  // ── sg-008: Thiết bị ngoại vi chung ──────────────────────────────────────
  { id: "st-008-1", groupId: "sg-008", name: "Kết nối",        description: "Phương thức kết nối (USB có dây, USB receiver, Bluetooth, ...)",  displayOrder: 1, required: true,  kieuDuLieu: "enum", coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-008-2", groupId: "sg-008", name: "Tương thích OS", description: "Hệ điều hành hỗ trợ (Windows, macOS, Linux, ChromeOS)",           displayOrder: 2, required: false, kieuDuLieu: "enum", coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 2, createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-008-3", groupId: "sg-008", name: "Màu sắc",        description: "Màu sắc sản phẩm có sẵn",                                         displayOrder: 3, required: false, kieuDuLieu: "enum", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-008-4", groupId: "sg-008", name: "Bảo hành",       description: "Thời gian bảo hành tính theo tháng",                               displayOrder: 4, required: true,  kieuDuLieu: "number", donVi: "tháng", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-008-5", groupId: "sg-008", name: "Xuất xứ",        description: "Quốc gia hoặc nhà máy sản xuất",                                   displayOrder: 5, required: false, kieuDuLieu: "enum", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },

  // ── sg-009: Âm thanh ──────────────────────────────────────────────────────
  { id: "st-009-1", groupId: "sg-009", name: "Kích thước driver",  description: "Đường kính màng loa tính theo mm",                                  displayOrder: 1, required: true,  kieuDuLieu: "number", donVi: "mm",    coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-009-2", groupId: "sg-009", name: "Độ nhạy",            description: "Độ nhạy âm thanh tính theo dB/mW",                                  displayOrder: 2, required: false, kieuDuLieu: "number", donVi: "dB/mW", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-009-3", groupId: "sg-009", name: "Trở kháng",          description: "Trở kháng tải tính theo Ohm",                                       displayOrder: 3, required: false, kieuDuLieu: "number", donVi: "Ω",     coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-009-4", groupId: "sg-009", name: "Dải tần số",         description: "Dải tần số đáp ứng tính theo Hz (ví dụ: 20Hz – 20kHz)",             displayOrder: 4, required: false, kieuDuLieu: "text",               coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-009-5", groupId: "sg-009", name: "Công nghệ giảm ồn",  description: "Công nghệ chống ồn chủ động hoặc thụ động (ANC, Passive, ...)",     displayOrder: 5, required: false, kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-009-6", groupId: "sg-009", name: "Micro",              description: "Loại mic và khả năng khử tiếng ồn của microphone",                  displayOrder: 6, required: false, kieuDuLieu: "text",               coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-10T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },

  // ── sg-010: Kích thước & Trọng lượng ─────────────────────────────────────
  { id: "st-010-1", groupId: "sg-010", name: "Chiều dài",        description: "Chiều dài sản phẩm tính theo cm",                                   displayOrder: 1, required: true,  kieuDuLieu: "number", donVi: "cm", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-15T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-010-2", groupId: "sg-010", name: "Chiều rộng",       description: "Chiều rộng sản phẩm tính theo cm",                                  displayOrder: 2, required: true,  kieuDuLieu: "number", donVi: "cm", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-15T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-010-3", groupId: "sg-010", name: "Chiều cao",        description: "Chiều cao sản phẩm tính theo cm (có thể là khoảng điều chỉnh)",     displayOrder: 3, required: false, kieuDuLieu: "number", donVi: "cm", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-15T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-010-4", groupId: "sg-010", name: "Trọng lượng",      description: "Trọng lượng sản phẩm tính theo kg",                                 displayOrder: 4, required: true,  kieuDuLieu: "number", donVi: "kg", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-15T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-010-5", groupId: "sg-010", name: "Tải trọng tối đa", description: "Tải trọng tối đa mà sản phẩm chịu được tính theo kg",               displayOrder: 5, required: false, kieuDuLieu: "number", donVi: "kg", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-15T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },

  // ── sg-011: Vật liệu & Chất liệu ─────────────────────────────────────────
  { id: "st-011-1", groupId: "sg-011", name: "Chất liệu khung",     description: "Vật liệu cấu thành khung chính (thép, nhôm, gỗ MDF, ...)",         displayOrder: 1, required: true,  kieuDuLieu: "enum", coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, createdAt: "2026-01-15T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-011-2", groupId: "sg-011", name: "Bề mặt mặt bàn",      description: "Vật liệu lớp bề mặt (melamine, veneer gỗ thật, kính, ...)",        displayOrder: 2, required: false, kieuDuLieu: "enum", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-15T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-011-3", groupId: "sg-011", name: "Màu sắc",             description: "Màu sắc hoặc vân gỗ có sẵn",                                       displayOrder: 3, required: false, kieuDuLieu: "enum", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-15T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },
  { id: "st-011-4", groupId: "sg-011", name: "Chứng nhận vật liệu", description: "Chứng nhận an toàn vật liệu (CARB, FSC, GREENGUARD, ...)",          displayOrder: 4, required: false, kieuDuLieu: "enum", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-15T07:00:00Z", updatedAt: "2026-03-10T08:00:00Z" },

  // ── sg-012: Hiệu năng laptop ──────────────────────────────────────────────
  { id: "st-012-1", groupId: "sg-012", name: "CPU",           description: "Tên đầy đủ bộ xử lý laptop (ví dụ: Intel Core i7-13700H)",          displayOrder: 1, required: true,  kieuDuLieu: "text", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-012-2", groupId: "sg-012", name: "RAM",           description: "Dung lượng RAM mặc định và loại RAM (GB, DDR5, ...)",                displayOrder: 2, required: true,  kieuDuLieu: "enum",   donVi: "GB",  coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 2, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-012-3", groupId: "sg-012", name: "RAM tối đa",    description: "Dung lượng RAM nâng cấp tối đa hỗ trợ tính theo GB",               displayOrder: 3, required: false, kieuDuLieu: "number", donVi: "GB",  coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-012-4", groupId: "sg-012", name: "GPU rời",       description: "Tên card đồ họa rời (nếu có) ví dụ: NVIDIA RTX 4060 Laptop",       displayOrder: 4, required: false, kieuDuLieu: "text", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-012-5", groupId: "sg-012", name: "Ổ cứng",        description: "Dung lượng và loại ổ cứng mặc định (GB/TB, NVMe SSD, ...)",         displayOrder: 5, required: true,  kieuDuLieu: "enum",   donVi: "GB",  coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 3, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-012-6", groupId: "sg-012", name: "Pin",           description: "Dung lượng pin tính theo Wh",                                       displayOrder: 6, required: false, kieuDuLieu: "number", donVi: "Wh",  coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-012-7", groupId: "sg-012", name: "Hệ điều hành",  description: "Hệ điều hành cài sẵn (Windows 11 Home, macOS, FreeDOS, ...)",       displayOrder: 7, required: false, kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 4, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },

  // ── sg-013: Màn hình laptop ───────────────────────────────────────────────
  { id: "st-013-1", groupId: "sg-013", name: "Kích thước",        description: "Kích thước màn hình đường chéo tính theo inch",                     displayOrder: 1, required: true,  kieuDuLieu: "number", donVi: "inch", coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-013-2", groupId: "sg-013", name: "Độ phân giải",      description: "Độ phân giải màn hình (FHD 1920×1080, QHD, 4K UHD, ...)",          displayOrder: 2, required: true,  kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 2, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-013-3", groupId: "sg-013", name: "Tần số quét",       description: "Tần số làm mới tính theo Hz (60, 120, 144, 165, 240, 360)",         displayOrder: 3, required: true,  kieuDuLieu: "number", donVi: "Hz",   coTheLoc: true,  widgetLoc: "range",    thuTuLoc: 3, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-013-4", groupId: "sg-013", name: "Loại tấm nền",      description: "Công nghệ tấm nền (IPS, OLED, Mini-LED, VA, ...)",                  displayOrder: 4, required: false, kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 4, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-013-5", groupId: "sg-013", name: "Tỉ lệ màu sRGB",    description: "Mức độ phủ màu sRGB tính theo % (100% sRGB là chuẩn in ấn)",        displayOrder: 5, required: false, kieuDuLieu: "number", donVi: "%",    coTheLoc: false, thuTuLoc: 0, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-013-6", groupId: "sg-013", name: "Màn hình cảm ứng",  description: "Có hỗ trợ cảm ứng hay không và chuẩn cảm ứng (10 điểm, bút, ...)", displayOrder: 6, required: false, kieuDuLieu: "boolean",            coTheLoc: true,  widgetLoc: "toggle",   thuTuLoc: 5, createdAt: "2026-01-20T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },

  // ── sg-014: Làm mát & Nhiệt độ ───────────────────────────────────────────
  { id: "st-014-1", groupId: "sg-014", name: "Công nghệ làm lạnh", description: "Công nghệ làm lạnh áp dụng (inverter, on-off, multi-split, ...)",     displayOrder: 1, required: true,  kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-014-2", groupId: "sg-014", name: "Dung môi lạnh",      description: "Loại môi chất lạnh sử dụng (R32, R410A, R22, ...)",                   displayOrder: 2, required: true,  kieuDuLieu: "enum",               coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-014-3", groupId: "sg-014", name: "Nhiệt độ min",       description: "Nhiệt độ hoạt động tối thiểu tính theo °C",                           displayOrder: 3, required: false, kieuDuLieu: "number", donVi: "°C",  coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-014-4", groupId: "sg-014", name: "Nhiệt độ max",       description: "Nhiệt độ hoạt động tối đa tính theo °C",                              displayOrder: 4, required: false, kieuDuLieu: "number", donVi: "°C",  coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-014-5", groupId: "sg-014", name: "Chỉ số SEER",        description: "Hệ số hiệu quả năng lượng theo mùa (Seasonal Energy Efficiency Ratio)", displayOrder: 5, required: false, kieuDuLieu: "number",             coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-014-6", groupId: "sg-014", name: "Công suất làm lạnh", description: "Công suất làm lạnh danh định tính theo BTU/h hoặc kW",                 displayOrder: 6, required: true,  kieuDuLieu: "number", donVi: "BTU", coTheLoc: true,  widgetLoc: "range",    thuTuLoc: 2, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },

  // ── sg-015: Công suất điện ────────────────────────────────────────────────
  { id: "st-015-1", groupId: "sg-015", name: "Công suất tiêu thụ", description: "Công suất điện tiêu thụ định mức tính theo W",                     displayOrder: 1, required: true,  kieuDuLieu: "number", donVi: "W",  coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-015-2", groupId: "sg-015", name: "Điện áp đầu vào",   description: "Điện áp nguồn đầu vào tính theo V (110V, 220V, 100–240V, ...)",    displayOrder: 2, required: true,  kieuDuLieu: "text",               coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-015-3", groupId: "sg-015", name: "Tần số điện",       description: "Tần số nguồn điện đầu vào tính theo Hz (50Hz, 60Hz)",               displayOrder: 3, required: false, kieuDuLieu: "number", donVi: "Hz", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-015-4", groupId: "sg-015", name: "Nhãn năng lượng",   description: "Cấp nhãn năng lượng (1 sao – 5 sao hoặc A+++ theo EU)",             displayOrder: 4, required: false, kieuDuLieu: "enum",               coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-015-5", groupId: "sg-015", name: "Điện năng tiêu thụ",description: "Điện năng tiêu thụ ước tính hàng năm tính theo kWh",               displayOrder: 5, required: false, kieuDuLieu: "number", donVi: "kWh",coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-01T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },

  // ── sg-016: Chứng nhận & Tiêu chuẩn ─────────────────────────────────────
  { id: "st-016-1", groupId: "sg-016", name: "Chứng nhận an toàn",   description: "Chứng nhận an toàn điện áp dụng (CE, UL, FCC, TCVN, ...)",         displayOrder: 1, required: true,  kieuDuLieu: "text", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-10T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-016-2", groupId: "sg-016", name: "Chứng nhận năng lượng", description: "Chứng nhận hiệu quả năng lượng (Energy Star, MEPS, ...)",         displayOrder: 2, required: false, kieuDuLieu: "text", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-10T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-016-3", groupId: "sg-016", name: "Tiêu chuẩn EMC",       description: "Tiêu chuẩn tương thích điện từ áp dụng",                            displayOrder: 3, required: false, kieuDuLieu: "text", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-10T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-016-4", groupId: "sg-016", name: "RoHS",                  description: "Tuân thủ chỉ thị hạn chế chất độc hại (RoHS 2)",                    displayOrder: 4, required: false, kieuDuLieu: "boolean", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-10T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },

  // ── sg-017: Kết nối không dây ─────────────────────────────────────────────
  { id: "st-017-1", groupId: "sg-017", name: "Bluetooth",    description: "Phiên bản Bluetooth hỗ trợ (4.2, 5.0, 5.1, 5.3, ...)",              displayOrder: 1, required: false, kieuDuLieu: "enum", coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 2, createdAt: "2026-02-10T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-017-2", groupId: "sg-017", name: "Wi-Fi",        description: "Chuẩn Wi-Fi hỗ trợ (Wi-Fi 5, Wi-Fi 6, Wi-Fi 6E, Wi-Fi 7, ...)",    displayOrder: 2, required: false, kieuDuLieu: "enum", coTheLoc: true,  widgetLoc: "checkbox", thuTuLoc: 1, createdAt: "2026-02-10T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-017-3", groupId: "sg-017", name: "Tần số Wi-Fi", description: "Băng tần Wi-Fi hỗ trợ (2.4GHz, 5GHz, 6GHz)",                        displayOrder: 3, required: false, kieuDuLieu: "enum", coTheLoc: false, thuTuLoc: 0, createdAt: "2026-02-10T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
  { id: "st-017-4", groupId: "sg-017", name: "USB receiver", description: "Có đi kèm USB dongle receiver không và tần số hoạt động",            displayOrder: 4, required: false, kieuDuLieu: "boolean", coTheLoc: true,  widgetLoc: "toggle", thuTuLoc: 3, createdAt: "2026-02-10T07:00:00Z", updatedAt: "2026-03-15T08:00:00Z" },
];

// ─── Category ↔ SpecGroup assignments ──────────────────────────────────────────
//
// INHERITANCE MAP (what each category effectively sees):
//
//  cat-100  Phụ kiện                 → (empty — no assignments)
//  cat-101  Phần mềm                 → direct: [sg-016]
//
//  cat-200  Thiết bị ngoại vi        → direct: [sg-001, sg-008]
//  cat-201  Chuột                    → inherited: [sg-001, sg-008]             ← full inheritance, no direct
//  cat-202  Bàn phím                 → direct: [sg-017]  inherited: [sg-001, sg-008]
//  cat-203  Tai nghe                 → direct: [sg-009]  inherited: [sg-001, sg-008]
//
//  cat-300  Nội thất văn phòng       → direct: [sg-010, sg-011]
//  cat-310  Bàn làm việc             → direct: [sg-011★] inherited: [sg-010]   ★ dedup: child owns sg-011 directly
//  cat-311  Bàn đứng                 → inherited: [sg-010, sg-011]             ← 3-level deep
//  cat-312  Bàn góc                  → inherited: [sg-010, sg-011]             ← 3-level deep
//  cat-320  Ghế văn phòng            → direct: [sg-016]  inherited: [sg-010, sg-011]
//  cat-321  Ghế gaming               → inherited: [sg-010, sg-011, sg-016]     ← 3-level deep
//  cat-322  Ghế ergonomic            → inherited: [sg-010, sg-011, sg-016]     ← 3-level deep
//
//  cat-400  Điện gia dụng            → direct: [sg-001, sg-015]
//  cat-410  Thiết bị làm lạnh        → direct: [sg-014]  inherited: [sg-001, sg-015]
//  cat-411  Điều hòa                 → direct: [sg-001★] inherited: [sg-015, sg-014] ★ dedup: overrides grandparent
//  cat-4111 Điều hòa inverter        → inherited: [sg-001, sg-015, sg-014]     ← 4-level deep
//
//  cat-500  Máy tính xách tay        → direct: [sg-001, sg-012]
//  cat-510  Laptop gaming            → direct: [sg-013]  ghi_de_thu_tu: [sg-012]  inherited: [sg-001]
//  cat-511  Gaming cao cấp           → direct: [sg-007]  inherited: [sg-012, sg-013]  excluded: [sg-001]
//  cat-5111 Gaming 4K                → inherited: [sg-012, sg-013, sg-007]     ← 4-level deep (sg-001 still excluded)
//  cat-520  Laptop văn phòng         → direct: [sg-017]  inherited: [sg-001, sg-012]
//  cat-530  Laptop đồ họa            → direct: [sg-013, sg-016]  inherited: [sg-001, sg-012]
//
// MANY-TO-MANY HIGHLIGHTS:
//   sg-001 assigned directly to: cat-001, cat-002, cat-003, cat-004, cat-200, cat-400, cat-411, cat-500 (8 categories)
//   sg-013 assigned directly to: cat-510, cat-530                (same group, different category siblings)
//   sg-016 assigned directly to: cat-101, cat-320, cat-530       (cross-domain sharing)
//
// ghi_de_thu_tu EXAMPLE:
//   csg-035: cat-510 kế thừa sg-012 từ cat-500, nhưng muốn sg-012 hiện ở vị trí 2
//            (sau sg-013 — direct) thay vì mặc định từ cha. Filter vẫn bật.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_CATEGORY_SPEC_ASSIGNMENTS: CategorySpecGroupAssignment[] = [
  // ── Original assignments ─────────────────────────────────────────────────

  // cat-001: Linh kiện máy tính
  { id: "csg-001", categoryId: "cat-001", specGroupId: "sg-001", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2025-10-01T07:00:00Z" },

  // cat-011: GPU
  { id: "csg-002", categoryId: "cat-011", specGroupId: "sg-002", assignmentType: "include", displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2025-10-01T07:00:00Z" },
  { id: "csg-003", categoryId: "cat-011", specGroupId: "sg-007", assignmentType: "include", displayOrder: 2, hienThiBoLoc: true,  thuTuBoLoc: 2, createdAt: "2025-10-01T07:00:00Z" },

  // cat-012: CPU
  { id: "csg-004", categoryId: "cat-012", specGroupId: "sg-003", assignmentType: "include", displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2025-10-01T07:00:00Z" },

  // cat-013: SSD
  { id: "csg-005", categoryId: "cat-013", specGroupId: "sg-005", assignmentType: "include", displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2025-10-01T07:00:00Z" },
  { id: "csg-006", categoryId: "cat-013", specGroupId: "sg-007", assignmentType: "include", displayOrder: 2, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2025-10-01T07:00:00Z" },

  // cat-014: RAM
  { id: "csg-007", categoryId: "cat-014", specGroupId: "sg-004", assignmentType: "include", displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2025-10-01T07:00:00Z" },

  // cat-015: Motherboard
  { id: "csg-008", categoryId: "cat-015", specGroupId: "sg-007", assignmentType: "include", displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2025-10-01T07:00:00Z" },

  // cat-002: Màn hình
  { id: "csg-009", categoryId: "cat-002", specGroupId: "sg-001", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2025-10-01T07:00:00Z" },
  { id: "csg-010", categoryId: "cat-002", specGroupId: "sg-006", assignmentType: "include", displayOrder: 2, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2025-10-01T07:00:00Z" },
  { id: "csg-011", categoryId: "cat-002", specGroupId: "sg-007", assignmentType: "include", displayOrder: 3, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2025-10-01T07:00:00Z" },

  // cat-003: Tản nhiệt
  { id: "csg-012", categoryId: "cat-003", specGroupId: "sg-001", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2025-10-01T07:00:00Z" },

  // cat-004: Vỏ máy tính
  { id: "csg-013", categoryId: "cat-004", specGroupId: "sg-001", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2025-10-01T07:00:00Z" },

  // ── NEW: Scenario 1 — Simple 1-level ────────────────────────────────────
  // cat-100 (Phụ kiện): intentionally NO assignments → empty state test

  // cat-101: Phần mềm & Bản quyền
  { id: "csg-014", categoryId: "cat-101", specGroupId: "sg-016", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2026-01-10T07:00:00Z" },

  // ── NEW: Scenario 2 — Two levels ────────────────────────────────────────

  // cat-200: Thiết bị ngoại vi (parent with 2 direct groups)
  { id: "csg-015", categoryId: "cat-200", specGroupId: "sg-001", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2026-01-10T07:00:00Z" },
  { id: "csg-016", categoryId: "cat-200", specGroupId: "sg-008", assignmentType: "include", displayOrder: 2, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2026-01-10T07:00:00Z" },

  // cat-201 (Chuột): NO assignments → fully inherits sg-001 + sg-008 from cat-200

  // cat-202: Bàn phím — own group + inherits parent's 2
  { id: "csg-017", categoryId: "cat-202", specGroupId: "sg-017", assignmentType: "include", displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2026-01-10T07:00:00Z" },

  // cat-203: Tai nghe — own group + inherits parent's 2
  { id: "csg-018", categoryId: "cat-203", specGroupId: "sg-009", assignmentType: "include", displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2026-01-10T07:00:00Z" },

  // ── NEW: Scenario 3 — Three levels ──────────────────────────────────────

  // cat-300: Nội thất văn phòng (root with 2 direct groups)
  { id: "csg-019", categoryId: "cat-300", specGroupId: "sg-010", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2026-01-15T07:00:00Z" },
  { id: "csg-020", categoryId: "cat-300", specGroupId: "sg-011", assignmentType: "include", displayOrder: 2, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2026-01-15T07:00:00Z" },

  // cat-310: Bàn làm việc — directly assigns sg-011 (SAME as parent cat-300)
  // → sg-011 becomes directInclude here (dedup: child ownership wins)
  // → sg-010 is inherited from cat-300
  { id: "csg-021", categoryId: "cat-310", specGroupId: "sg-011", assignmentType: "include", displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2026-01-15T07:00:00Z" },

  // cat-311 (Bàn đứng): NO assignments → inherits sg-010 + sg-011 via cat-300 → cat-310
  // cat-312 (Bàn góc):  NO assignments → same 3-level inheritance

  // cat-320: Ghế văn phòng — own group + inherits sg-010 + sg-011 from cat-300
  { id: "csg-022", categoryId: "cat-320", specGroupId: "sg-016", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2026-01-15T07:00:00Z" },

  // cat-321 (Ghế gaming):   NO assignments → inherits sg-010, sg-011, sg-016 (3-level)
  // cat-322 (Ghế ergonomic): NO assignments → same 3-level inheritance

  // ── NEW: Scenario 4 — Four levels ───────────────────────────────────────

  // cat-400: Điện gia dụng (root with 2 direct groups)
  { id: "csg-023", categoryId: "cat-400", specGroupId: "sg-001", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2026-01-20T07:00:00Z" },
  { id: "csg-024", categoryId: "cat-400", specGroupId: "sg-015", assignmentType: "include", displayOrder: 2, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2026-01-20T07:00:00Z" },

  // cat-410: Thiết bị làm lạnh — own group + inherits sg-001, sg-015
  { id: "csg-025", categoryId: "cat-410", specGroupId: "sg-014", assignmentType: "include", displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2026-01-20T07:00:00Z" },

  // cat-411: Điều hòa không khí — directly assigns sg-001 again (SAME as grandparent cat-400)
  // → sg-001 becomes directInclude here (dedup: direct assignment wins over grandparent's)
  // → sg-015 inherited from cat-400, sg-014 inherited from cat-410
  { id: "csg-026", categoryId: "cat-411", specGroupId: "sg-001", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2026-01-20T07:00:00Z" },

  // cat-4111 (Điều hòa inverter): NO assignments → 4-level inheritance: sg-001 (cat-411), sg-015 (cat-400), sg-014 (cat-410)

  // ── NEW: Scenario 5 — Mixed tree ────────────────────────────────────────

  // cat-500: Máy tính xách tay (root)
  { id: "csg-027", categoryId: "cat-500", specGroupId: "sg-001", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2026-01-25T07:00:00Z" },
  { id: "csg-028", categoryId: "cat-500", specGroupId: "sg-012", assignmentType: "include", displayOrder: 2, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2026-01-25T07:00:00Z" },

  // cat-510: Laptop gaming (Branch A, depth 2)
  // → direct: sg-013 (vị trí 1)
  // → ghi_de_thu_tu: sg-012 kế thừa từ cat-500, override vị trí lên 2 (sau sg-013) + giữ filter
  { id: "csg-029", categoryId: "cat-510", specGroupId: "sg-013", assignmentType: "include",        displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2026-01-25T07:00:00Z" },
  { id: "csg-035", categoryId: "cat-510", specGroupId: "sg-012", assignmentType: "ghi_de_thu_tu",  displayOrder: 2, hienThiBoLoc: true,  thuTuBoLoc: 2, createdAt: "2026-01-25T07:00:00Z" },

  // cat-511: Gaming cao cấp (Branch A, depth 3)
  // direct: sg-007; excludes sg-001 (suppresses inheritance from cat-500)
  { id: "csg-030", categoryId: "cat-511", specGroupId: "sg-007", assignmentType: "include", displayOrder: 1, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2026-01-25T07:00:00Z" },
  { id: "csg-031", categoryId: "cat-511", specGroupId: "sg-001", assignmentType: "exclude", displayOrder: 0, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2026-01-25T07:00:00Z" },

  // cat-5111 (Gaming 4K): NO assignments
  // → sg-001 excluded (suppress propagates from cat-511)
  // → inherits sg-012 (cat-500), sg-013 (cat-510), sg-007 (cat-511)

  // cat-520: Laptop văn phòng (Branch B, depth 2 — stops here)
  { id: "csg-032", categoryId: "cat-520", specGroupId: "sg-017", assignmentType: "include", displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 2, createdAt: "2026-01-25T07:00:00Z" },

  // cat-530: Laptop đồ họa (Branch C, depth 2 — stops here)
  // sg-013 also assigned to cat-510 → many-to-many scenario
  // sg-016 also assigned to cat-101, cat-320 → cross-domain many-to-many
  { id: "csg-033", categoryId: "cat-530", specGroupId: "sg-013", assignmentType: "include", displayOrder: 1, hienThiBoLoc: true,  thuTuBoLoc: 1, createdAt: "2026-01-25T07:00:00Z" },
  { id: "csg-034", categoryId: "cat-530", specGroupId: "sg-016", assignmentType: "include", displayOrder: 2, hienThiBoLoc: false, thuTuBoLoc: 0, createdAt: "2026-01-25T07:00:00Z" },
];
