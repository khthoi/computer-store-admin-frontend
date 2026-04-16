import type { DanhMuc, DanhMucNode } from "@/src/types/category.types";

// ─── Category mock data ────────────────────────────────────────────────────────
//
// Tree structure overview
// ───────────────────────────────────────────────────────────────────────────────
// DEPTH 1 ONLY (simple)
//   cat-100  Phụ kiện                    (no children, no spec assignments)
//   cat-101  Phần mềm & Bản quyền        (no children)
//
// 2 LEVELS
//   cat-200  Thiết bị ngoại vi
//     cat-201  Chuột                     (no direct specs → full inheritance)
//     cat-202  Bàn phím
//     cat-203  Tai nghe
//
// 3 LEVELS
//   cat-300  Nội thất văn phòng
//     cat-310  Bàn làm việc              (shares sg-011 with parent → dedup)
//       cat-311  Bàn đứng điều chỉnh độ cao
//       cat-312  Bàn góc / chữ L
//     cat-320  Ghế văn phòng
//       cat-321  Ghế gaming
//       cat-322  Ghế ergonomic
//
// 4 LEVELS (deep tree)
//   cat-400  Điện gia dụng
//     cat-410  Thiết bị làm lạnh
//       cat-411  Điều hòa không khí      (re-assigns grandparent's sg-001 → dedup)
//         cat-4111 Điều hòa inverter     (no direct specs → 4-level inheritance)
//
// MIXED TREE (4-level branch + 2-level branches)
//   cat-500  Máy tính xách tay
//     cat-510  Laptop gaming             (depth 2)
//       cat-511  Gaming cao cấp          (depth 3, excludes inherited sg-001)
//         cat-5111 Gaming 4K / QHD       (depth 4, no direct specs)
//     cat-520  Laptop văn phòng          (depth 2 — branch stops here)
//     cat-530  Laptop đồ họa             (depth 2 — branch stops here)
//
// ORIGINAL TREE (kept intact)
//   cat-001  Linh kiện máy tính
//     cat-011  GPU
//     cat-012  CPU
//     cat-013  SSD
//     cat-014  RAM
//     cat-015  Bo mạch chủ
//     cat-016  PSU (inactive)
//   cat-002  Màn hình                    (root, no children)
//   cat-003  Tản nhiệt                   (root, no children)
//   cat-004  Vỏ máy tính                 (root, no children)
// ───────────────────────────────────────────────────────────────────────────────

// Shorthand for legacy mock objects that predate the new fields.
// The service layer (applyDefaults) fills in nodeType/filterParams/badge at runtime.
type LegacyDanhMuc = Omit<DanhMuc, "nodeType" | "filterParams" | "badgeText" | "badgeBg" | "badgeFg">
  & Partial<Pick<DanhMuc, "nodeType" | "filterParams" | "badgeText" | "badgeBg" | "badgeFg">>;

export const MOCK_CATEGORIES: LegacyDanhMuc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ORIGINAL CATEGORIES
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Root categories ──────────────────────────────────────────────────────
  {
    id: "cat-001",
    name: "Linh kiện máy tính",
    slug: "linh-kien-may-tinh",
    parentId: null,
    description: "Toàn bộ linh kiện cấu thành máy tính",
    displayOrder: 1,
    active: true,
    productCount: 7,
    createdAt: "2025-10-01T07:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "cat-002",
    name: "Màn hình",
    slug: "man-hinh",
    parentId: null,
    description: "Màn hình máy tính các loại",
    displayOrder: 2,
    active: true,
    productCount: 12,
    createdAt: "2025-10-01T07:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "cat-003",
    name: "Tản nhiệt",
    slug: "tan-nhiet",
    parentId: null,
    description: "Tản nhiệt khí và tản nhiệt nước",
    displayOrder: 3,
    active: true,
    productCount: 8,
    createdAt: "2025-10-01T07:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "cat-004",
    name: "Vỏ máy tính",
    slug: "vo-may-tinh",
    parentId: null,
    description: "Case / vỏ thùng máy tính",
    displayOrder: 4,
    active: true,
    productCount: 5,
    createdAt: "2025-10-01T07:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },

  // ── Children of "Linh kiện máy tính" (cat-001) ───────────────────────────
  {
    id: "cat-011",
    name: "Card đồ họa (GPU)",
    slug: "gpu",
    parentId: "cat-001",
    description: "Card màn hình rời, GPU gaming và workstation",
    displayOrder: 1,
    active: true,
    productCount: 14,
    createdAt: "2025-10-01T07:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
    nodeType: "category",
    filterParams: null,
    badgeText: "HOT",
    badgeBg: "#ef4444",
    badgeFg: "#ffffff",
  },
  // ── Filter-shortcut nodes under GPU (megamenu examples) ──────────────────
  {
    id: "cat-011-label-brand",
    name: "GPU theo hãng",
    slug: "gpu-theo-hang",
    parentId: "cat-011",
    description: "",
    displayOrder: 10,
    active: true,
    productCount: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    nodeType: "label",
    filterParams: null,
    badgeText: null, badgeBg: null, badgeFg: null,
  },
  {
    id: "cat-011-brand-asus",
    name: "ASUS",
    slug: "asus",
    parentId: "cat-011-label-brand",
    description: "",
    displayOrder: 1,
    active: true,
    productCount: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    nodeType: "filter",
    filterParams: { brand: "asus" },
    badgeText: null, badgeBg: null, badgeFg: null,
  },
  {
    id: "cat-011-brand-nvidia",
    name: "NVIDIA",
    slug: "nvidia",
    parentId: "cat-011-label-brand",
    description: "",
    displayOrder: 2,
    active: true,
    productCount: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    nodeType: "filter",
    filterParams: { brand: "nvidia" },
    badgeText: null, badgeBg: null, badgeFg: null,
  },
  {
    id: "cat-011-label-price",
    name: "GPU theo khoảng giá",
    slug: "gpu-theo-gia",
    parentId: "cat-011",
    description: "",
    displayOrder: 11,
    active: true,
    productCount: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    nodeType: "label",
    filterParams: null,
    badgeText: null, badgeBg: null, badgeFg: null,
  },
  {
    id: "cat-011-price-10-20",
    name: "10 - 20 triệu",
    slug: "gpu-10-20tr",
    parentId: "cat-011-label-price",
    description: "",
    displayOrder: 1,
    active: true,
    productCount: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    nodeType: "filter",
    filterParams: { price_min: "10000000", price_max: "20000000" },
    badgeText: null, badgeBg: null, badgeFg: null,
  },
  {
    id: "cat-011-price-20-35",
    name: "20 - 35 triệu",
    slug: "gpu-20-35tr",
    parentId: "cat-011-label-price",
    description: "",
    displayOrder: 2,
    active: true,
    productCount: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    nodeType: "filter",
    filterParams: { price_min: "20000000", price_max: "35000000" },
    badgeText: null, badgeBg: null, badgeFg: null,
  },
  {
    id: "cat-012",
    name: "Bộ xử lý (CPU)",
    slug: "cpu",
    parentId: "cat-001",
    description: "CPU Intel và AMD",
    displayOrder: 2,
    active: true,
    productCount: 18,
    createdAt: "2025-10-01T07:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "cat-013",
    name: "Ổ cứng SSD",
    slug: "ssd",
    parentId: "cat-001",
    description: "Ổ SSD NVMe M.2 và SATA",
    displayOrder: 3,
    active: true,
    productCount: 22,
    createdAt: "2025-10-01T07:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "cat-014",
    name: "RAM",
    slug: "ram",
    parentId: "cat-001",
    description: "RAM DDR4 và DDR5",
    displayOrder: 4,
    active: true,
    productCount: 16,
    createdAt: "2025-10-01T07:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "cat-015",
    name: "Bo mạch chủ",
    slug: "motherboard",
    parentId: "cat-001",
    description: "Mainboard Intel và AMD",
    displayOrder: 5,
    active: true,
    productCount: 11,
    createdAt: "2025-10-01T07:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "cat-016",
    name: "Nguồn máy tính (PSU)",
    slug: "psu",
    parentId: "cat-001",
    description: "Bộ nguồn ATX, SFX",
    displayOrder: 6,
    active: false,
    productCount: 0,
    createdAt: "2025-10-01T07:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 1 — SIMPLE (1 LEVEL ONLY)
  // ═══════════════════════════════════════════════════════════════════════════

  // Edge case: root category with NO spec assignments and NO children
  {
    id: "cat-100",
    name: "Phụ kiện",
    slug: "phu-kien",
    parentId: null,
    description: "Phụ kiện và linh kiện rời lẻ chưa phân loại",
    displayOrder: 5,
    active: true,
    productCount: 3,
    createdAt: "2025-11-01T07:00:00Z",
    updatedAt: "2026-02-10T08:00:00Z",
  },
  // Root with a spec assignment but no children
  {
    id: "cat-101",
    name: "Phần mềm & Bản quyền",
    slug: "phan-mem-ban-quyen",
    parentId: null,
    description: "Phần mềm có bản quyền, key kích hoạt Windows, Office, antivirus",
    displayOrder: 6,
    active: true,
    productCount: 9,
    createdAt: "2025-11-01T07:00:00Z",
    updatedAt: "2026-02-10T08:00:00Z",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 2 — TWO LEVELS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cat-200",
    name: "Thiết bị ngoại vi",
    slug: "thiet-bi-ngoai-vi",
    parentId: null,
    description: "Chuột, bàn phím, tai nghe và các thiết bị ngoại vi khác",
    displayOrder: 7,
    active: true,
    productCount: 0,
    createdAt: "2025-11-15T07:00:00Z",
    updatedAt: "2026-02-20T08:00:00Z",
  },
  // child — NO direct spec assignments → inherits everything from cat-200
  {
    id: "cat-201",
    name: "Chuột",
    slug: "chuot",
    parentId: "cat-200",
    description: "Chuột có dây và không dây, gaming và văn phòng",
    displayOrder: 1,
    active: true,
    productCount: 24,
    createdAt: "2025-11-15T07:00:00Z",
    updatedAt: "2026-02-20T08:00:00Z",
  },
  // child — has own spec + inherits from parent
  {
    id: "cat-202",
    name: "Bàn phím",
    slug: "ban-phim",
    parentId: "cat-200",
    description: "Bàn phím cơ, màng, gaming và văn phòng",
    displayOrder: 2,
    active: true,
    productCount: 31,
    createdAt: "2025-11-15T07:00:00Z",
    updatedAt: "2026-02-20T08:00:00Z",
  },
  // child — has own spec + inherits from parent
  {
    id: "cat-203",
    name: "Tai nghe",
    slug: "tai-nghe",
    parentId: "cat-200",
    description: "Tai nghe over-ear, in-ear, gaming, audio",
    displayOrder: 3,
    active: true,
    productCount: 19,
    createdAt: "2025-11-15T07:00:00Z",
    updatedAt: "2026-02-20T08:00:00Z",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 3 — THREE LEVELS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cat-300",
    name: "Nội thất văn phòng",
    slug: "noi-that-van-phong",
    parentId: null,
    description: "Bàn làm việc, ghế, kệ và nội thất văn phòng",
    displayOrder: 8,
    active: true,
    productCount: 0,
    createdAt: "2025-12-01T07:00:00Z",
    updatedAt: "2026-02-25T08:00:00Z",
  },
  // depth 2 — also directly assigns sg-011 (same as parent) → dedup test
  {
    id: "cat-310",
    name: "Bàn làm việc",
    slug: "ban-lam-viec",
    parentId: "cat-300",
    description: "Bàn làm việc gỗ tự nhiên, công nghiệp và điều chỉnh độ cao",
    displayOrder: 1,
    active: true,
    productCount: 0,
    createdAt: "2025-12-01T07:00:00Z",
    updatedAt: "2026-02-25T08:00:00Z",
  },
  // depth 3 — NO direct specs → inherits from 2 ancestors
  {
    id: "cat-311",
    name: "Bàn đứng điều chỉnh độ cao",
    slug: "ban-dung-dieu-chinh-do-cao",
    parentId: "cat-310",
    description: "Bàn sit-stand tự động và thủ công điều chỉnh được độ cao",
    displayOrder: 1,
    active: true,
    productCount: 7,
    createdAt: "2025-12-01T07:00:00Z",
    updatedAt: "2026-03-05T08:00:00Z",
  },
  // depth 3 — NO direct specs → inherits from 2 ancestors
  {
    id: "cat-312",
    name: "Bàn góc / Bàn chữ L",
    slug: "ban-goc-chu-l",
    parentId: "cat-310",
    description: "Bàn làm việc góc chữ L tối ưu không gian",
    displayOrder: 2,
    active: true,
    productCount: 5,
    createdAt: "2025-12-01T07:00:00Z",
    updatedAt: "2026-03-05T08:00:00Z",
  },
  // depth 2 — has own spec + inherits from parent
  {
    id: "cat-320",
    name: "Ghế văn phòng",
    slug: "ghe-van-phong",
    parentId: "cat-300",
    description: "Ghế làm việc, ghế gaming, ghế ergonomic",
    displayOrder: 2,
    active: true,
    productCount: 0,
    createdAt: "2025-12-01T07:00:00Z",
    updatedAt: "2026-02-25T08:00:00Z",
  },
  // depth 3 — NO direct specs → 3-level deep inheritance (cat-300 + cat-320)
  {
    id: "cat-321",
    name: "Ghế gaming",
    slug: "ghe-gaming",
    parentId: "cat-320",
    description: "Ghế gaming thiết kế bucket-seat, tựa đầu và tựa lưng thắt lưng",
    displayOrder: 1,
    active: true,
    productCount: 13,
    createdAt: "2025-12-01T07:00:00Z",
    updatedAt: "2026-03-05T08:00:00Z",
  },
  // depth 3 — NO direct specs → 3-level deep inheritance (cat-300 + cat-320)
  {
    id: "cat-322",
    name: "Ghế ergonomic",
    slug: "ghe-ergonomic",
    parentId: "cat-320",
    description: "Ghế công thái học hỗ trợ cột sống và điều chỉnh đa điểm",
    displayOrder: 2,
    active: true,
    productCount: 8,
    createdAt: "2025-12-01T07:00:00Z",
    updatedAt: "2026-03-05T08:00:00Z",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 4 — FOUR LEVELS (deep tree)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cat-400",
    name: "Điện gia dụng",
    slug: "dien-gia-dung",
    parentId: null,
    description: "Thiết bị điện gia dụng: làm lạnh, điều hòa, quạt, máy lọc không khí",
    displayOrder: 9,
    active: true,
    productCount: 0,
    createdAt: "2026-01-01T07:00:00Z",
    updatedAt: "2026-03-10T08:00:00Z",
  },
  // depth 2
  {
    id: "cat-410",
    name: "Thiết bị làm lạnh",
    slug: "thiet-bi-lam-lanh",
    parentId: "cat-400",
    description: "Điều hòa, tủ lạnh, máy làm lạnh không khí",
    displayOrder: 1,
    active: true,
    productCount: 0,
    createdAt: "2026-01-01T07:00:00Z",
    updatedAt: "2026-03-10T08:00:00Z",
  },
  // depth 3 — directly re-assigns sg-001 (also at grandparent cat-400) → dedup
  {
    id: "cat-411",
    name: "Điều hòa không khí",
    slug: "dieu-hoa-khong-khi",
    parentId: "cat-410",
    description: "Điều hòa treo tường, âm trần và cây đứng",
    displayOrder: 1,
    active: true,
    productCount: 0,
    createdAt: "2026-01-01T07:00:00Z",
    updatedAt: "2026-03-10T08:00:00Z",
  },
  // depth 4 — NO direct specs → full 4-level inheritance from cat-400, cat-410, cat-411
  {
    id: "cat-4111",
    name: "Điều hòa inverter",
    slug: "dieu-hoa-inverter",
    parentId: "cat-411",
    description: "Điều hòa inverter tiết kiệm điện với công nghệ biến tần",
    displayOrder: 1,
    active: true,
    productCount: 17,
    createdAt: "2026-01-01T07:00:00Z",
    updatedAt: "2026-03-10T08:00:00Z",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 5 — MIXED TREE
  //   Branch A: cat-500 → cat-510 → cat-511 → cat-5111  (4 levels)
  //   Branch B: cat-500 → cat-520                        (2 levels)
  //   Branch C: cat-500 → cat-530                        (2 levels)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cat-500",
    name: "Máy tính xách tay",
    slug: "may-tinh-xach-tay",
    parentId: null,
    description: "Laptop gaming, văn phòng, đồ họa và workstation",
    displayOrder: 10,
    active: true,
    productCount: 0,
    createdAt: "2026-01-15T07:00:00Z",
    updatedAt: "2026-03-15T08:00:00Z",
  },
  // Branch A, depth 2
  {
    id: "cat-510",
    name: "Laptop gaming",
    slug: "laptop-gaming",
    parentId: "cat-500",
    description: "Laptop gaming với GPU rời hiệu năng cao",
    displayOrder: 1,
    active: true,
    productCount: 0,
    createdAt: "2026-01-15T07:00:00Z",
    updatedAt: "2026-03-15T08:00:00Z",
  },
  // Branch A, depth 3 — has own spec AND excludes sg-001 from cat-500
  {
    id: "cat-511",
    name: "Gaming cao cấp",
    slug: "laptop-gaming-cao-cap",
    parentId: "cat-510",
    description: "Laptop gaming phân khúc cao cấp, RTX 4070 trở lên",
    displayOrder: 1,
    active: true,
    productCount: 0,
    createdAt: "2026-01-15T07:00:00Z",
    updatedAt: "2026-03-15T08:00:00Z",
  },
  // Branch A, depth 4 — NO direct specs → inherits from cat-500, cat-510, cat-511
  // (sg-001 is excluded at cat-511, so it won't appear here either)
  {
    id: "cat-5111",
    name: "Gaming 4K / QHD",
    slug: "laptop-gaming-4k-qhd",
    parentId: "cat-511",
    description: "Laptop gaming màn hình 4K hoặc QHD 240Hz trở lên",
    displayOrder: 1,
    active: true,
    productCount: 6,
    createdAt: "2026-01-15T07:00:00Z",
    updatedAt: "2026-03-15T08:00:00Z",
  },
  // Branch B, depth 2 — stops here (2-level branch)
  {
    id: "cat-520",
    name: "Laptop văn phòng",
    slug: "laptop-van-phong",
    parentId: "cat-500",
    description: "Laptop mỏng nhẹ cho công việc văn phòng và học tập",
    displayOrder: 2,
    active: true,
    productCount: 28,
    createdAt: "2026-01-15T07:00:00Z",
    updatedAt: "2026-03-15T08:00:00Z",
  },
  // Branch C, depth 2 — stops here (2-level branch); shares sg-013 with cat-510 (many-to-many)
  {
    id: "cat-530",
    name: "Laptop đồ họa / Workstation",
    slug: "laptop-do-hoa-workstation",
    parentId: "cat-500",
    description: "Laptop workstation với Quadro/RTX Ada cho thiết kế và render 3D",
    displayOrder: 3,
    active: true,
    productCount: 11,
    createdAt: "2026-01-15T07:00:00Z",
    updatedAt: "2026-03-15T08:00:00Z",
  },
];

// ─── Build tree ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildCategoryTree(flat: any[] = MOCK_CATEGORIES): DanhMucNode[] {
  const map = new Map<string, DanhMucNode>();
  flat.forEach((c) => map.set(c.id, { ...c }));

  const roots: DanhMucNode[] = [];
  flat
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .forEach((c) => {
      const node = map.get(c.id)!;
      if (c.parentId === null) {
        roots.push(node);
      } else {
        const parent = map.get(c.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        }
      }
    });

  return roots;
}
