import type {
  HomepageSection,
  HomepageSectionFormData,
  SectionItem,
  PreviewProduct,
  DanhMucOption,
  ThuongHieuOption,
  KhuyenMaiOption,
  CategorySourceConfig,
  BrandSourceConfig,
  AutoSourceConfig,
  PromotionSourceConfig,
} from "@/src/types/homepage.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

function now() {
  return new Date().toISOString();
}

// ─── Mock reference data ──────────────────────────────────────────────────────

export const MOCK_DANHMUC_OPTIONS: DanhMucOption[] = [
  { value: 1,  label: "Laptop",              description: "laptop" },
  { value: 2,  label: "Laptop Gaming",       description: "laptop-gaming" },
  { value: 3,  label: "Laptop Văn phòng",    description: "laptop-van-phong" },
  { value: 4,  label: "CPU (Bộ xử lý)",      description: "cpu" },
  { value: 5,  label: "GPU (Card đồ họa)",   description: "gpu" },
  { value: 6,  label: "RAM",                 description: "ram" },
  { value: 7,  label: "Ổ cứng SSD",          description: "ssd" },
  { value: 8,  label: "Bo mạch chủ",         description: "mainboard" },
  { value: 9,  label: "Nguồn máy tính",      description: "psu" },
  { value: 10, label: "Tản nhiệt",           description: "cooling" },
  { value: 11, label: "Màn hình",            description: "monitor" },
  { value: 12, label: "Bàn phím",            description: "keyboard" },
  { value: 13, label: "Chuột",               description: "mouse" },
  { value: 14, label: "Tai nghe",            description: "headset" },
  { value: 15, label: "PC Gaming (Bộ máy)",  description: "pc-gaming" },
];

export const MOCK_THUONGHIEU_OPTIONS: ThuongHieuOption[] = [
  { value: 1,  label: "ASUS",    description: "asus.com" },
  { value: 2,  label: "MSI",     description: "msi.com" },
  { value: 3,  label: "Acer",    description: "acer.com" },
  { value: 4,  label: "Lenovo",  description: "lenovo.com" },
  { value: 5,  label: "HP",      description: "hp.com" },
  { value: 6,  label: "Dell",    description: "dell.com" },
  { value: 7,  label: "Intel",   description: "intel.com" },
  { value: 8,  label: "AMD",     description: "amd.com" },
  { value: 9,  label: "NVIDIA",  description: "nvidia.com" },
  { value: 10, label: "Samsung", description: "samsung.com" },
  { value: 11, label: "Corsair", description: "corsair.com" },
  { value: 12, label: "Gigabyte",description: "gigabyte.com" },
];

export const MOCK_KHUYENMAI_OPTIONS: KhuyenMaiOption[] = [
  { value: 1, label: "Flash Sale — Giảm đến 20%",     description: "01/06 – 30/06/2025" },
  { value: 2, label: "Mừng sinh nhật TechStore",      description: "15/07 – 15/08/2025" },
  { value: 3, label: "Back to School 2025",           description: "01/08 – 31/08/2025" },
  { value: 4, label: "Siêu Sale 11.11",               description: "10/11 – 12/11/2025" },
  { value: 5, label: "Black Friday — Giảm đến 30%",  description: "28/11 – 30/11/2025" },
];

// ─── Mock preview products ────────────────────────────────────────────────────

const PREVIEW_PRODUCTS: PreviewProduct[] = [
  { phienBanId: 101, tenSanPham: "Laptop Asus ROG G513", SKU: "ROG-G513-001", giaBan: 42900000, giaGoc: 49900000, thuongHieu: "ASUS", badge: "HOT" },
  { phienBanId: 102, tenSanPham: "MSI Katana 15 B13VGK", SKU: "MSI-KAT-001", giaBan: 27490000, giaGoc: 32000000, thuongHieu: "MSI" },
  { phienBanId: 103, tenSanPham: "Acer Predator Helios 16", SKU: "ACR-PH16-001", giaBan: 56990000, giaGoc: 62000000, thuongHieu: "Acer", badge: "MỚI" },
  { phienBanId: 104, tenSanPham: "Lenovo Legion 5 Pro Gen 8", SKU: "LEN-L5P-001", giaBan: 33000000, giaGoc: 38000000, thuongHieu: "Lenovo" },
  { phienBanId: 105, tenSanPham: "HP OMEN 16 (2024)", SKU: "HP-OMEN16-001", giaBan: 31490000, giaGoc: 35000000, thuongHieu: "HP" },
  { phienBanId: 106, tenSanPham: "Dell Alienware x15 R2", SKU: "DL-AWX15-001", giaBan: 68900000, giaGoc: 75000000, thuongHieu: "Dell", badge: "HOT" },
  { phienBanId: 201, tenSanPham: "Intel Core i7-14700K", SKU: "INT-I7-14700K", giaBan: 10800000, giaGoc: 12500000, thuongHieu: "Intel", badge: "SALE" },
  { phienBanId: 202, tenSanPham: "AMD Ryzen 7 7800X3D", SKU: "AMD-R7-7800X3D", giaBan: 10300000, giaGoc: 12000000, thuongHieu: "AMD", badge: "HOT" },
  { phienBanId: 203, tenSanPham: "Intel Core i9-14900KS", SKU: "INT-I9-14900KS", giaBan: 17900000, giaGoc: 20000000, thuongHieu: "Intel" },
  { phienBanId: 204, tenSanPham: "AMD Ryzen 5 7600X", SKU: "AMD-R5-7600X", giaBan: 5460000, giaGoc: 6500000, thuongHieu: "AMD" },
  { phienBanId: 301, tenSanPham: "NVIDIA GeForce RTX 4070 Ti Super", SKU: "NV-4070TIS-001", giaBan: 18900000, giaGoc: 22000000, thuongHieu: "NVIDIA", badge: "MỚI" },
  { phienBanId: 302, tenSanPham: "AMD Radeon RX 7900 XTX", SKU: "AMD-RX7900XTX-001", giaBan: 22490000, giaGoc: 26000000, thuongHieu: "AMD" },
  { phienBanId: 303, tenSanPham: "NVIDIA GeForce RTX 4060", SKU: "NV-4060-001", giaBan: 9900000, giaGoc: 11500000, thuongHieu: "NVIDIA" },
];

// ─── Mock sections state ──────────────────────────────────────────────────────

let MOCK_SECTIONS: HomepageSection[] = [
  {
    sectionId: 1, sortOrder: 1,
    title: "Laptop Gaming Mới Nhất",
    viewAllUrl: "/products/laptop-gaming",
    type: "category",
    sourceConfig: { danhMucIds: [2], sortBy: "newest" } as CategorySourceConfig,
    sortBy: "newest", maxProducts: 6, layout: "carousel",
    badgeLabel: "MỚI", badgeColor: "#10b981",
    isVisible: true, productCount: 6,
    ngayTao: "2025-01-01T00:00:00Z", ngayCapNhat: "2025-01-01T00:00:00Z",
  },
  {
    sectionId: 2, sortOrder: 2,
    title: "CPU Bán Chạy",
    viewAllUrl: "/products/cpu",
    type: "category",
    sourceConfig: { danhMucIds: [4], sortBy: "best_selling" } as CategorySourceConfig,
    sortBy: "best_selling", maxProducts: 6, layout: "carousel",
    isVisible: true, productCount: 6,
    ngayTao: "2025-01-01T00:00:00Z", ngayCapNhat: "2025-01-01T00:00:00Z",
  },
  {
    sectionId: 3, sortOrder: 3,
    title: "GPU Bán Chạy",
    viewAllUrl: "/products/gpu",
    type: "category",
    sourceConfig: { danhMucIds: [5], sortBy: "best_selling" } as CategorySourceConfig,
    sortBy: "best_selling", maxProducts: 6, layout: "carousel",
    isVisible: true, productCount: 6,
    ngayTao: "2025-01-01T00:00:00Z", ngayCapNhat: "2025-01-01T00:00:00Z",
  },
  {
    sectionId: 4, sortOrder: 4,
    title: "PC Gaming Low-end",
    viewAllUrl: "/products/pc-gaming?tier=low",
    type: "category",
    sourceConfig: { danhMucIds: [15], sortBy: "price_asc" } as CategorySourceConfig,
    sortBy: "price_asc", maxProducts: 8, layout: "grid_4",
    isVisible: true, productCount: 8,
    ngayTao: "2025-01-01T00:00:00Z", ngayCapNhat: "2025-01-01T00:00:00Z",
  },
  {
    sectionId: 5, sortOrder: 5,
    title: "PC Gaming Mid-end",
    viewAllUrl: "/products/pc-gaming?tier=mid",
    type: "category",
    sourceConfig: { danhMucIds: [15], sortBy: "newest" } as CategorySourceConfig,
    sortBy: "newest", maxProducts: 8, layout: "grid_4",
    isVisible: true, productCount: 8,
    ngayTao: "2025-01-01T00:00:00Z", ngayCapNhat: "2025-01-01T00:00:00Z",
  },
  {
    sectionId: 6, sortOrder: 6,
    title: "Flash Sale — Giảm đến 20%",
    viewAllUrl: "/promotions/flash-sale",
    type: "promotion",
    sourceConfig: { khuyenMaiId: 1 } as PromotionSourceConfig,
    sortBy: "best_selling", maxProducts: 6, layout: "carousel",
    badgeLabel: "SALE", badgeColor: "#ef4444",
    isVisible: true, productCount: 6,
    ngayBatDau: "2025-06-01", ngayKetThuc: "2025-06-30",
    ngayTao: "2025-01-01T00:00:00Z", ngayCapNhat: "2025-01-01T00:00:00Z",
  },
];

let nextId = 7;

// ─── Mock manual items ─────────────────────────────────────────────────────────

const MOCK_ITEMS: SectionItem[] = [];

// ─── Service functions ────────────────────────────────────────────────────────

export async function getHomepageSections(): Promise<HomepageSection[]> {
  await delay(300);
  return [...MOCK_SECTIONS].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createHomepageSection(
  data: HomepageSectionFormData
): Promise<HomepageSection> {
  await delay(400);
  const section: HomepageSection = {
    sectionId: nextId++,
    title: data.title,
    subtitle: data.subtitle || undefined,
    viewAllUrl: data.viewAllUrl || undefined,
    type: data.type,
    sourceConfig: data.type === "manual" ? null : data.sourceConfig,
    sortBy: data.sortBy,
    maxProducts: data.maxProducts,
    layout: data.layout,
    badgeLabel: data.badgeLabel || undefined,
    badgeColor: data.badgeColor || undefined,
    isVisible: data.isVisible,
    sortOrder: MOCK_SECTIONS.length + 1,
    ngayBatDau: data.ngayBatDau || undefined,
    ngayKetThuc: data.ngayKetThuc || undefined,
    productCount: data.type === "manual" ? data.manualItems.length : 0,
    items: data.type === "manual" ? [...data.manualItems] : undefined,
    ngayTao: now(),
    ngayCapNhat: now(),
  };
  MOCK_SECTIONS.push(section);
  if (data.type === "manual") {
    data.manualItems.forEach((item, idx) => {
      MOCK_ITEMS.push({ ...item, sectionId: section.sectionId, sortOrder: idx + 1 });
    });
  }
  return section;
}

export async function updateHomepageSection(
  id: number,
  data: HomepageSectionFormData
): Promise<HomepageSection> {
  await delay(350);
  const idx = MOCK_SECTIONS.findIndex((s) => s.sectionId === id);
  if (idx === -1) throw new Error("Section not found");
  const existing = MOCK_SECTIONS[idx];
  const updated: HomepageSection = {
    ...existing,
    title: data.title,
    subtitle: data.subtitle || undefined,
    viewAllUrl: data.viewAllUrl || undefined,
    type: data.type,
    sourceConfig: data.type === "manual" ? null : data.sourceConfig,
    sortBy: data.sortBy,
    maxProducts: data.maxProducts,
    layout: data.layout,
    badgeLabel: data.badgeLabel || undefined,
    badgeColor: data.badgeColor || undefined,
    isVisible: data.isVisible,
    ngayBatDau: data.ngayBatDau || undefined,
    ngayKetThuc: data.ngayKetThuc || undefined,
    productCount: data.type === "manual" ? data.manualItems.length : existing.productCount,
    items: data.type === "manual" ? [...data.manualItems] : undefined,
    ngayCapNhat: now(),
  };
  MOCK_SECTIONS[idx] = updated;
  return updated;
}

export async function deleteHomepageSection(id: number): Promise<void> {
  await delay(300);
  MOCK_SECTIONS = MOCK_SECTIONS.filter((s) => s.sectionId !== id);
}

export async function reorderHomepageSections(ids: number[]): Promise<void> {
  await delay(200);
  ids.forEach((id, idx) => {
    const s = MOCK_SECTIONS.find((s) => s.sectionId === id);
    if (s) s.sortOrder = idx + 1;
  });
}

export async function duplicateHomepageSection(
  id: number
): Promise<HomepageSection> {
  await delay(300);
  const source = MOCK_SECTIONS.find((s) => s.sectionId === id);
  if (!source) throw new Error("Section not found");
  const copy: HomepageSection = {
    ...source,
    sectionId: nextId++,
    title: `${source.title} (Bản sao)`,
    sortOrder: MOCK_SECTIONS.length + 1,
    isVisible: false,
    ngayTao: now(),
    ngayCapNhat: now(),
  };
  MOCK_SECTIONS.push(copy);
  return copy;
}

/** Returns mock preview products based on section config */
export async function getPreviewProducts(
  type: string,
  sourceConfig: unknown,
  maxProducts: number
): Promise<PreviewProduct[]> {
  await delay(400);
  let pool = [...PREVIEW_PRODUCTS];

  if (type === "category") {
    const cfg = sourceConfig as CategorySourceConfig;
    // Simulate filtering: laptop(1,2,3) = phienBanId 101-106, cpu(4) = 201-204, gpu(5) = 301-303
    if (cfg?.danhMucIds?.some((id) => [1, 2, 3].includes(id))) {
      pool = pool.filter((p) => p.phienBanId >= 100 && p.phienBanId < 200);
    } else if (cfg?.danhMucIds?.some((id) => id === 4)) {
      pool = pool.filter((p) => p.phienBanId >= 200 && p.phienBanId < 300);
    } else if (cfg?.danhMucIds?.some((id) => id === 5)) {
      pool = pool.filter((p) => p.phienBanId >= 300 && p.phienBanId < 400);
    }
  } else if (type === "promotion") {
    pool = pool.filter((p) => p.badge === "SALE" || p.phienBanId % 2 === 0);
  } else if (type === "brand") {
    const cfg = sourceConfig as BrandSourceConfig;
    const brandMap: Record<number, string> = { 1: "ASUS", 2: "MSI", 7: "Intel", 8: "AMD", 9: "NVIDIA" };
    const names = (cfg?.thuongHieuIds ?? []).map((id) => brandMap[id]).filter(Boolean);
    if (names.length) pool = pool.filter((p) => names.includes(p.thuongHieu ?? ""));
  } else if (type === "new_arrivals") {
    pool = [...pool].reverse();
  }

  return pool.slice(0, maxProducts);
}

/** Returns lightweight product list for the product picker (type=manual) */
export async function searchProducts(
  q: string,
  danhMucId?: number
): Promise<PreviewProduct[]> {
  await delay(300);
  let results = [...PREVIEW_PRODUCTS];
  if (q.trim()) {
    const lower = q.toLowerCase();
    results = results.filter(
      (p) =>
        p.tenSanPham.toLowerCase().includes(lower) ||
        p.SKU.toLowerCase().includes(lower)
    );
  }
  if (danhMucId) {
    if ([1, 2, 3].includes(danhMucId)) results = results.filter((p) => p.phienBanId < 200);
    else if (danhMucId === 4) results = results.filter((p) => p.phienBanId >= 200 && p.phienBanId < 300);
    else if (danhMucId === 5) results = results.filter((p) => p.phienBanId >= 300);
  }
  return results;
}

// ─── Reference data loaders ───────────────────────────────────────────────────

export async function getDanhMucOptions(): Promise<DanhMucOption[]> {
  await delay(150);
  return MOCK_DANHMUC_OPTIONS;
}

export async function getThuongHieuOptions(): Promise<ThuongHieuOption[]> {
  await delay(150);
  return MOCK_THUONGHIEU_OPTIONS;
}

export async function getKhuyenMaiOptions(): Promise<KhuyenMaiOption[]> {
  await delay(150);
  return MOCK_KHUYENMAI_OPTIONS;
}
