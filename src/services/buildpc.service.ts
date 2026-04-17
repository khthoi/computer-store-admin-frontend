import type {
  BuildPCSlot,
  BuildPCSlotFormData,
  BuildPCRule,
  BuildPCRuleFormData,
  BuildPCBuild,
  BuildPCBuildDetail,
  TechKeyOption,
  SlotOption,
  CategoryOption,
} from "@/src/types/buildpc.types";

// ─── Mock: Slots ──────────────────────────────────────────────────────────────

let MOCK_SLOTS: BuildPCSlot[] = [
  {
    id: "slot-cpu",
    tenKhe: "CPU",
    maKhe: "cpu",
    danhMucId: 1,
    danhMucTen: "Vi xử lý",
    soLuong: 1,
    batBuoc: true,
    thuTu: 1,
    moTa: "Bộ vi xử lý trung tâm",
    isActive: true,
    ngayTao: "2024-01-10T08:00:00Z",
    ngayCapNhat: "2024-03-15T10:00:00Z",
  },
  {
    id: "slot-mainboard",
    tenKhe: "Mainboard",
    maKhe: "mainboard",
    danhMucId: 2,
    danhMucTen: "Bo mạch chủ",
    soLuong: 1,
    batBuoc: true,
    thuTu: 2,
    moTa: "Bo mạch chủ — phải khớp socket với CPU",
    isActive: true,
    ngayTao: "2024-01-10T08:00:00Z",
    ngayCapNhat: "2024-03-15T10:00:00Z",
  },
  {
    id: "slot-ram",
    tenKhe: "RAM",
    maKhe: "ram",
    danhMucId: 3,
    danhMucTen: "Bộ nhớ RAM",
    soLuong: 2,
    batBuoc: true,
    thuTu: 3,
    moTa: "Tối đa 2 thanh RAM",
    isActive: true,
    ngayTao: "2024-01-10T08:00:00Z",
    ngayCapNhat: "2024-04-01T09:00:00Z",
  },
  {
    id: "slot-gpu",
    tenKhe: "GPU",
    maKhe: "gpu",
    danhMucId: 4,
    danhMucTen: "Card đồ họa",
    soLuong: 1,
    batBuoc: false,
    thuTu: 4,
    moTa: "Card đồ họa rời (tùy chọn với CPU có iGPU)",
    isActive: true,
    ngayTao: "2024-01-10T08:00:00Z",
    ngayCapNhat: "2024-03-20T11:00:00Z",
  },
  {
    id: "slot-psu",
    tenKhe: "Nguồn (PSU)",
    maKhe: "psu",
    danhMucId: 5,
    danhMucTen: "Nguồn máy tính",
    soLuong: 1,
    batBuoc: true,
    thuTu: 5,
    moTa: "Bộ nguồn — công suất phải đủ cho toàn bộ hệ thống",
    isActive: true,
    ngayTao: "2024-01-10T08:00:00Z",
    ngayCapNhat: "2024-04-05T14:00:00Z",
  },
  {
    id: "slot-storage",
    tenKhe: "Ổ cứng",
    maKhe: "storage",
    danhMucId: 6,
    danhMucTen: "Ổ cứng / SSD",
    soLuong: 2,
    batBuoc: false,
    thuTu: 6,
    moTa: "SSD hoặc HDD (tối đa 2)",
    isActive: true,
    ngayTao: "2024-01-10T08:00:00Z",
    ngayCapNhat: "2024-03-10T09:00:00Z",
  },
];

// ─── Mock: Rules ──────────────────────────────────────────────────────────────

let MOCK_RULES: BuildPCRule[] = [
  {
    id: "rule-1",
    slotNguonId: "slot-cpu",
    slotNguonTen: "CPU",
    slotDichId: "slot-mainboard",
    slotDichTen: "Mainboard",
    maKyThuat: "cpu_socket",
    maKyThuatTen: "CPU Socket",
    loaiKiemTra: "exact_match",
    moTa: "Socket CPU và Mainboard phải khớp nhau (LGA1700, AM5, …)",
    batBuoc: true,
    isActive: true,
    ngayTao: "2024-01-15T08:00:00Z",
    ngayCapNhat: "2024-03-15T10:00:00Z",
  },
  {
    id: "rule-2",
    slotNguonId: "slot-cpu",
    slotNguonTen: "CPU",
    slotDichId: "slot-mainboard",
    slotDichTen: "Mainboard",
    maKyThuat: "ram_type",
    maKyThuatTen: "RAM Type",
    loaiKiemTra: "contains",
    moTa: "Loại RAM do CPU hỗ trợ phải được Mainboard hỗ trợ (DDR4/DDR5)",
    batBuoc: true,
    isActive: true,
    ngayTao: "2024-01-15T08:00:00Z",
    ngayCapNhat: "2024-03-15T10:00:00Z",
  },
  {
    id: "rule-3",
    slotNguonId: "slot-cpu",
    slotNguonTen: "CPU",
    slotDichId: "slot-psu",
    slotDichTen: "Nguồn (PSU)",
    maKyThuat: "tdp_watt",
    maKyThuatTen: "TDP (W)",
    loaiKiemTra: "min_sum",
    heSo: 1.3,
    moTa: "Công suất nguồn >= tổng TDP hệ thống × 1.3 (buffer 30%)",
    batBuoc: true,
    isActive: true,
    ngayTao: "2024-01-20T09:00:00Z",
    ngayCapNhat: "2024-04-05T14:00:00Z",
  },
  {
    id: "rule-4",
    slotNguonId: "slot-mainboard",
    slotNguonTen: "Mainboard",
    slotDichId: "slot-ram",
    slotDichTen: "RAM",
    maKyThuat: "ram_max_speed_mhz",
    maKyThuatTen: "RAM Max Speed (MHz)",
    loaiKiemTra: "min_value",
    heSo: 1,
    moTa: "Tốc độ RAM không được vượt quá giới hạn Mainboard hỗ trợ",
    batBuoc: false,
    isActive: true,
    ngayTao: "2024-02-01T08:00:00Z",
    ngayCapNhat: "2024-04-10T10:00:00Z",
  },
];

// ─── Mock: Builds ─────────────────────────────────────────────────────────────

const MOCK_BUILDS: BuildPCBuild[] = [
  {
    id: "build-1",
    userId: "u-001",
    customerId: "kh-001",
    tenNguoiDung: "Nguyễn Quốc Bảo",
    email: "bao.nguyen@gmail.com",
    tenBuild: "PC Gaming Tầm Trung 2024",
    moTa: "Build cho game AAA 1080p ultra settings, ưu tiên RTX 4060 Ti",
    trangThai: "complete",
    tongGia: 18500000,
    isPublic: true,
    soLuotXem: 312,
    soLuotClone: 27,
    ngayTao: "2024-03-10T14:22:00Z",
    ngayCapNhat: "2024-04-02T09:15:00Z",
  },
  {
    id: "build-2",
    userId: "u-002",
    customerId: "kh-002",
    tenNguoiDung: "Trần Văn Khoa",
    email: "khoa.tran@techsv.vn",
    tenBuild: "Workstation đồ họa render phim 4K chuyên nghiệp",
    moTa: "Dùng cho Premiere Pro, After Effects, Blender render",
    trangThai: "complete",
    tongGia: 42000000,
    isPublic: true,
    soLuotXem: 88,
    soLuotClone: 5,
    ngayTao: "2024-03-22T10:05:00Z",
    ngayCapNhat: "2024-04-12T11:00:00Z",
  },
  {
    id: "build-3",
    userId: "u-001",
    customerId: "kh-001",
    tenNguoiDung: "Nguyễn Quốc Bảo",
    email: "bao.nguyen@gmail.com",
    tenBuild: "PC văn phòng tiết kiệm",
    trangThai: "draft",
    tongGia: 7200000,
    isPublic: false,
    soLuotXem: 0,
    soLuotClone: 0,
    ngayTao: "2024-04-11T08:40:00Z",
    ngayCapNhat: "2024-04-11T08:40:00Z",
  },
  {
    id: "build-4",
    userId: "u-004",
    customerId: "kh-004",
    tenNguoiDung: "Phạm Đức Minh",
    email: "minh.pham@gamer.vn",
    tenBuild: "Build AMD All-In",
    moTa: "Ryzen 7 7700X + RX 7800 XT — toàn bộ platform AMD",
    trangThai: "complete",
    tongGia: 23800000,
    isPublic: true,
    soLuotXem: 145,
    soLuotClone: 11,
    ngayTao: "2024-04-05T16:30:00Z",
    ngayCapNhat: "2024-04-13T08:20:00Z",
  },
  {
    id: "build-5",
    userId: "u-005",
    customerId: "kh-005",
    tenNguoiDung: "Hoàng Thị Bích Ngọc",
    email: "ngoc.hoang@student.edu.vn",
    tenBuild: "PC học tập + game nhẹ",
    trangThai: "complete",
    tongGia: 9500000,
    isPublic: false,
    soLuotXem: 0,
    soLuotClone: 0,
    ngayTao: "2024-04-14T07:15:00Z",
    ngayCapNhat: "2024-04-14T19:00:00Z",
  },
];

const MOCK_BUILD_DETAILS: Record<string, BuildPCBuildDetail> = {
  "build-1": {
    ...MOCK_BUILDS[0],
    chiTiet: [
      { id: "bi-1a", buildId: "build-1", slotId: "slot-cpu",      slotTen: "CPU",         sanPhamId: "sp-001", phienBanId: "var-001-a", tenPhienBan: "Intel Core i5-14600K",          tenSanPham: "Intel Core i5-14600K",   SKU: "I5-14600K",          giaBan: 4200000,  soLuong: 1 },
      { id: "bi-1b", buildId: "build-1", slotId: "slot-mainboard", slotTen: "Mainboard",   sanPhamId: "sp-002", phienBanId: "var-002-a", tenPhienBan: "ASUS ROG STRIX B760-F Gaming D4",tenSanPham: "ASUS ROG STRIX B760-F",  SKU: "B760F-D4",           giaBan: 3800000,  soLuong: 1 },
      { id: "bi-1c", buildId: "build-1", slotId: "slot-ram",       slotTen: "RAM",         sanPhamId: "sp-003", phienBanId: "var-003-a", tenPhienBan: "Kingston Fury Beast 16GB DDR4 3200MHz CL16", tenSanPham: "Kingston Fury Beast DDR4", SKU: "KF432C16BB/16", giaBan: 900000, soLuong: 2 },
      { id: "bi-1d", buildId: "build-1", slotId: "slot-gpu",       slotTen: "GPU",         sanPhamId: "sp-004", phienBanId: "var-004-a", tenPhienBan: "ASUS Dual GeForce RTX 4060 Ti OC 8GB", tenSanPham: "ASUS DUAL RTX 4060 Ti", SKU: "RTX4060TI-D-8G", giaBan: 7200000, soLuong: 1 },
      { id: "bi-1e", buildId: "build-1", slotId: "slot-psu",       slotTen: "Nguồn (PSU)", sanPhamId: "sp-005", phienBanId: "var-005-a", tenPhienBan: "Corsair RM750x 750W 80+ Gold Fully Modular", tenSanPham: "Corsair RM750x", SKU: "RM750X-2023", giaBan: 2400000, soLuong: 1 },
    ],
  },
  "build-2": {
    ...MOCK_BUILDS[1],
    chiTiet: [
      { id: "bi-2a", buildId: "build-2", slotId: "slot-cpu",      slotTen: "CPU",         sanPhamId: "sp-006", phienBanId: "var-006-a", tenPhienBan: "Intel Core i9-14900K 3.2GHz 24-Core", tenSanPham: "Intel Core i9-14900K",   SKU: "I9-14900K",     giaBan: 10500000, soLuong: 1 },
      { id: "bi-2b", buildId: "build-2", slotId: "slot-mainboard", slotTen: "Mainboard",   sanPhamId: "sp-007", phienBanId: "var-007-a", tenPhienBan: "ASUS ProArt Z790-CREATOR WIFI DDR5", tenSanPham: "ASUS ProArt Z790-CREATOR", SKU: "PAZ790-CR", giaBan: 8200000,  soLuong: 1 },
      { id: "bi-2c", buildId: "build-2", slotId: "slot-ram",       slotTen: "RAM",         sanPhamId: "sp-008", phienBanId: "var-008-a", tenPhienBan: "G.Skill Trident Z5 32GB DDR5-6000 CL30", tenSanPham: "G.Skill Trident Z5 DDR5", SKU: "F5-6000J3036F32GX2", giaBan: 4200000, soLuong: 2 },
      { id: "bi-2d", buildId: "build-2", slotId: "slot-gpu",       slotTen: "GPU",         sanPhamId: "sp-009", phienBanId: "var-009-a", tenPhienBan: "ASUS ROG STRIX GeForce RTX 4090 24GB OC", tenSanPham: "ASUS ROG STRIX RTX 4090", SKU: "RTX4090-ROG-24G", giaBan: 38000000, soLuong: 1 },
    ],
  },
};

// ─── Option data ──────────────────────────────────────────────────────────────

export const TECH_KEY_OPTIONS: TechKeyOption[] = [
  { value: "cpu_socket",         label: "CPU Socket",               description: "Khớp socket CPU ↔ Mainboard",           unit: undefined },
  { value: "ram_type",           label: "RAM Type",                 description: "Loại RAM (DDR4/DDR5)",                  unit: undefined },
  { value: "tdp_watt",           label: "TDP (Watt)",               description: "Công suất tiêu thụ",                   unit: "W" },
  { value: "ram_max_speed_mhz",  label: "RAM Max Speed",            description: "Tốc độ RAM tối đa hỗ trợ",             unit: "MHz" },
  { value: "ram_max_capacity_gb",label: "RAM Max Capacity",         description: "Tổng dung lượng RAM tối đa",           unit: "GB" },
  { value: "pcie_version",       label: "PCIe Version",             description: "Phiên bản khe PCIe x16",               unit: undefined },
  { value: "m2_slots",           label: "M.2 Slots",                description: "Số khe M.2 trên Mainboard",            unit: undefined },
  { value: "form_factor",        label: "Form Factor",              description: "Chuẩn kích thước (ATX/mATX/ITX)",      unit: undefined },
];

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 1, label: "Vi xử lý",          description: "cpu" },
  { value: 2, label: "Bo mạch chủ",        description: "mainboard" },
  { value: 3, label: "Bộ nhớ RAM",         description: "ram" },
  { value: 4, label: "Card đồ họa",        description: "gpu" },
  { value: 5, label: "Nguồn máy tính",     description: "psu" },
  { value: 6, label: "Ổ cứng / SSD",       description: "storage" },
  { value: 7, label: "Tản nhiệt",          description: "cooler" },
  { value: 8, label: "Vỏ case",            description: "case" },
];

// ─── Slot CRUD ────────────────────────────────────────────────────────────────

export async function fetchSlots(): Promise<BuildPCSlot[]> {
  await delay(400);
  return [...MOCK_SLOTS].sort((a, b) => a.thuTu - b.thuTu);
}

export async function createSlot(data: BuildPCSlotFormData): Promise<BuildPCSlot> {
  await delay(500);
  const maxThuTu = Math.max(0, ...MOCK_SLOTS.map((s) => s.thuTu));
  const cat = CATEGORY_OPTIONS.find((c) => c.value === data.danhMucId);
  const slot: BuildPCSlot = {
    id: `slot-${Date.now()}`,
    tenKhe: data.tenKhe,
    maKhe: data.maKhe,
    danhMucId: Number(data.danhMucId),
    danhMucTen: cat?.label ?? "",
    soLuong: data.soLuong,
    batBuoc: data.batBuoc,
    thuTu: data.thuTu || maxThuTu + 1,
    moTa: data.moTa || undefined,
    isActive: data.isActive,
    ngayTao: new Date().toISOString(),
    ngayCapNhat: new Date().toISOString(),
  };
  MOCK_SLOTS.push(slot);
  return slot;
}

export async function updateSlot(id: string, data: BuildPCSlotFormData): Promise<BuildPCSlot> {
  await delay(500);
  const cat = CATEGORY_OPTIONS.find((c) => c.value === data.danhMucId);
  MOCK_SLOTS = MOCK_SLOTS.map((s) =>
    s.id === id
      ? {
          ...s,
          tenKhe: data.tenKhe,
          maKhe: data.maKhe,
          danhMucId: Number(data.danhMucId),
          danhMucTen: cat?.label ?? s.danhMucTen,
          soLuong: data.soLuong,
          batBuoc: data.batBuoc,
          thuTu: data.thuTu,
          moTa: data.moTa || undefined,
          isActive: data.isActive,
          ngayCapNhat: new Date().toISOString(),
        }
      : s
  );
  return MOCK_SLOTS.find((s) => s.id === id)!;
}

export async function deleteSlot(id: string): Promise<void> {
  await delay(300);
  MOCK_SLOTS = MOCK_SLOTS.filter((s) => s.id !== id);
}

export async function reorderSlots(orderedIds: string[]): Promise<void> {
  await delay(300);
  orderedIds.forEach((id, idx) => {
    const slot = MOCK_SLOTS.find((s) => s.id === id);
    if (slot) slot.thuTu = idx + 1;
  });
}

// ─── Rule CRUD ────────────────────────────────────────────────────────────────

export async function fetchRules(): Promise<BuildPCRule[]> {
  await delay(400);
  return [...MOCK_RULES];
}

export async function createRule(data: BuildPCRuleFormData): Promise<BuildPCRule> {
  await delay(500);
  const nguon = MOCK_SLOTS.find((s) => s.id === data.slotNguonId);
  const dich  = MOCK_SLOTS.find((s) => s.id === data.slotDichId);
  const tech  = TECH_KEY_OPTIONS.find((t) => t.value === data.maKyThuat);
  const rule: BuildPCRule = {
    id: `rule-${Date.now()}`,
    slotNguonId: data.slotNguonId,
    slotNguonTen: nguon?.tenKhe ?? "",
    slotDichId: data.slotDichId,
    slotDichTen: dich?.tenKhe ?? "",
    maKyThuat: data.maKyThuat,
    maKyThuatTen: tech?.label ?? data.maKyThuat,
    loaiKiemTra: data.loaiKiemTra,
    giaTriMacDinh: data.giaTriMacDinh || undefined,
    heSo: data.heSo !== "" ? parseFloat(data.heSo) : undefined,
    moTa: data.moTa || undefined,
    batBuoc: data.batBuoc,
    isActive: data.isActive,
    ngayTao: new Date().toISOString(),
    ngayCapNhat: new Date().toISOString(),
  };
  MOCK_RULES.push(rule);
  return rule;
}

export async function updateRule(id: string, data: BuildPCRuleFormData): Promise<BuildPCRule> {
  await delay(500);
  const nguon = MOCK_SLOTS.find((s) => s.id === data.slotNguonId);
  const dich  = MOCK_SLOTS.find((s) => s.id === data.slotDichId);
  const tech  = TECH_KEY_OPTIONS.find((t) => t.value === data.maKyThuat);
  MOCK_RULES = MOCK_RULES.map((r) =>
    r.id === id
      ? {
          ...r,
          slotNguonId: data.slotNguonId,
          slotNguonTen: nguon?.tenKhe ?? r.slotNguonTen,
          slotDichId: data.slotDichId,
          slotDichTen: dich?.tenKhe ?? r.slotDichTen,
          maKyThuat: data.maKyThuat,
          maKyThuatTen: tech?.label ?? data.maKyThuat,
          loaiKiemTra: data.loaiKiemTra,
          giaTriMacDinh: data.giaTriMacDinh || undefined,
          heSo: data.heSo !== "" ? parseFloat(data.heSo) : undefined,
          moTa: data.moTa || undefined,
          batBuoc: data.batBuoc,
          isActive: data.isActive,
          ngayCapNhat: new Date().toISOString(),
        }
      : r
  );
  return MOCK_RULES.find((r) => r.id === id)!;
}

export async function deleteRule(id: string): Promise<void> {
  await delay(300);
  MOCK_RULES = MOCK_RULES.filter((r) => r.id !== id);
}

// ─── Build read ───────────────────────────────────────────────────────────────

export async function fetchBuilds(): Promise<BuildPCBuild[]> {
  await delay(500);
  return [...MOCK_BUILDS].sort(
    (a, b) => new Date(b.ngayCapNhat).getTime() - new Date(a.ngayCapNhat).getTime()
  );
}

export async function fetchBuildsByCustomerId(customerId: string): Promise<BuildPCBuild[]> {
  await delay(400);
  return MOCK_BUILDS.filter((b) => b.customerId === customerId).sort(
    (a, b) => new Date(b.ngayCapNhat).getTime() - new Date(a.ngayCapNhat).getTime()
  );
}

export async function fetchBuildDetail(id: string): Promise<BuildPCBuildDetail> {
  await delay(400);
  const detail = MOCK_BUILD_DETAILS[id];
  if (detail) return detail;
  // Fallback: return build without details
  const build = MOCK_BUILDS.find((b) => b.id === id);
  if (!build) throw new Error(`Build ${id} not found`);
  return { ...build, chiTiet: [] };
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Slot option helper (derived from live slot list) ─────────────────────────

export function slotsToOptions(slots: BuildPCSlot[]): SlotOption[] {
  return slots.map((s) => ({
    value: s.id,
    label: s.tenKhe,
    description: s.maKhe,
  }));
}
