import type { ProductVariantDetail } from "@/src/types/product.types";

// ─── Mock variant detail data ─────────────────────────────────────────────────
// Tied to prod-001 / var-001-a from _mock.ts so getProductById + getVariantById
// both resolve on the same demo URL:
//   /products/prod-001/variants/var-001-a

export const MOCK_VARIANT: ProductVariantDetail = {
  id: "var-001-a",
  productId: "prod-001",
  name: "24GB GDDR6X — Standard Edition",
  sku: "ROG-RTX4090-OC-24G",
  originalPrice: 49_900_000,
  salePrice: 46_900_000,
  weight: 1.85,
  status: "visible",
  updatedAt: "2026-03-18T09:30:00Z",

  description: `
<h2>ASUS ROG Strix GeForce RTX 4090 — Standard Edition</h2>
<p>
  The <strong>ROG Strix GeForce RTX 4090 OC Edition</strong> is powered by the
  NVIDIA Ada Lovelace architecture and comes with <strong>24 GB of GDDR6X</strong>
  memory, delivering unprecedented performance for 4K gaming and creative workloads.
</p>
<h3>Key Highlights</h3>
<ul>
  <li>Boost clock up to <strong>2610 MHz</strong> in OC mode</li>
  <li>Triple-fan ROG Axial-tech cooling with a 3.5-slot design</li>
  <li>Full-length metal backplate with reinforced PCIe slot</li>
  <li>Dual BIOS switch — Performance mode vs. Quiet mode</li>
</ul>
<h3>In the Box</h3>
<ul>
  <li>ROG Strix GeForce RTX 4090 OC Edition graphics card</li>
  <li>PCIe power adapter (16-pin → 3× 8-pin)</li>
  <li>ROG Velcro cable tie</li>
  <li>Quick-start guide &amp; warranty card</li>
</ul>
<p>
  Compatible with PCIe 4.0 × 16 slots. Requires a minimum
  <strong>850 W</strong> power supply. Dimensions: 357 × 149 × 70 mm.
</p>
  `.trim(),

  specificationGroups: [
    // ── Inherited from category: GPU ──────────────────────────────────────────
    {
      id: "specgroup-gpu-core",
      label: "GPU Core Specifications",
      inherited: true,
      displayOrder: 1,
      hienThiBoLoc: true,
      thuTuBoLoc: 1,
      items: [
        {
          id: "spec-1", typeId: "t-arch", typeLabel: "Architecture",
          description: "e.g. Ada Lovelace, RDNA 3",
          maKyThuat: "gpu_architecture",
          kieuDuLieu: "enum",
          batBuoc: true,
          coTheLoc: true,
          widgetLoc: "select",
          thuTuLoc: 1,
          thuTuHienThi: 1,
          value: "Ada Lovelace",
          giaTriChuan: "ada_lovelace",
        },
        {
          id: "spec-2", typeId: "t-cuda", typeLabel: "CUDA Cores",
          description: "CUDA cores / Stream Processors",
          maKyThuat: "cuda_cores",
          kieuDuLieu: "number",
          batBuoc: false,
          coTheLoc: false,
          thuTuHienThi: 2,
          value: "16,384",
          giaTriSo: 16384,
        },
        {
          id: "spec-3", typeId: "t-boost", typeLabel: "Boost Clock (OC)",
          description: "MHz — OC mode",
          maKyThuat: "gpu_boost_clock_mhz",
          kieuDuLieu: "number",
          donVi: "MHz",
          batBuoc: false,
          coTheLoc: true,
          widgetLoc: "range",
          thuTuLoc: 2,
          thuTuHienThi: 3,
          value: "2610 MHz",
          giaTriSo: 2610,
        },
        {
          id: "spec-4", typeId: "t-base", typeLabel: "Base Clock",
          description: "MHz",
          maKyThuat: "gpu_base_clock_mhz",
          kieuDuLieu: "number",
          donVi: "MHz",
          batBuoc: false,
          coTheLoc: false,
          thuTuHienThi: 4,
          value: "2235 MHz",
          giaTriSo: 2235,
        },
        {
          id: "spec-5", typeId: "t-tdp", typeLabel: "TDP",
          description: "Thermal Design Power in watts",
          maKyThuat: "tdp_watt",
          kieuDuLieu: "number",
          donVi: "W",
          batBuoc: true,
          coTheLoc: true,
          widgetLoc: "range",
          thuTuLoc: 3,
          thuTuHienThi: 5,
          value: "450 W",
          giaTriSo: 450,
        },
      ],
    },
    // ── Inherited from category: GPU ──────────────────────────────────────────
    {
      id: "specgroup-gpu-memory",
      label: "Memory",
      inherited: true,
      displayOrder: 2,
      hienThiBoLoc: true,
      thuTuBoLoc: 2,
      items: [
        {
          id: "spec-6", typeId: "t-memsize", typeLabel: "Memory Size",
          description: "e.g. 8 GB, 16 GB, 24 GB",
          maKyThuat: "vram_size_gb",
          kieuDuLieu: "number",
          donVi: "GB",
          batBuoc: true,
          coTheLoc: true,
          widgetLoc: "checkbox",
          thuTuLoc: 1,
          thuTuHienThi: 1,
          value: "24 GB",
          giaTriSo: 24,
        },
        {
          id: "spec-7", typeId: "t-memtype", typeLabel: "Memory Type",
          description: "e.g. GDDR6, GDDR6X, HBM3",
          maKyThuat: "vram_type",
          kieuDuLieu: "enum",
          batBuoc: true,
          coTheLoc: true,
          widgetLoc: "checkbox",
          thuTuLoc: 2,
          thuTuHienThi: 2,
          value: "GDDR6X",
          giaTriChuan: "gddr6x",
        },
        {
          id: "spec-8", typeId: "t-membus", typeLabel: "Memory Bus",
          description: "e.g. 128-bit, 256-bit, 384-bit",
          maKyThuat: "vram_bus_width",
          kieuDuLieu: "number",
          donVi: "bit",
          batBuoc: false,
          coTheLoc: false,
          thuTuHienThi: 3,
          value: "384-bit",
          giaTriSo: 384,
        },
        {
          id: "spec-9", typeId: "t-membw", typeLabel: "Bandwidth",
          description: "GB/s",
          maKyThuat: "vram_bandwidth_gbps",
          kieuDuLieu: "number",
          donVi: "GB/s",
          batBuoc: false,
          coTheLoc: true,
          widgetLoc: "range",
          thuTuLoc: 3,
          thuTuHienThi: 4,
          value: "1008 GB/s",
          giaTriSo: 1008,
        },
      ],
    },
    // ── Directly assigned to this variant ─────────────────────────────────────
    {
      id: "specgroup-variant-physical",
      label: "Physical & Connectivity",
      inherited: false,
      displayOrder: 3,
      hienThiBoLoc: false,
      thuTuBoLoc: 0,
      items: [
        {
          id: "spec-10", typeId: "t-length", typeLabel: "Card Length",
          description: "mm",
          maKyThuat: "card_length_mm",
          kieuDuLieu: "number",
          donVi: "mm",
          batBuoc: false,
          coTheLoc: false,
          thuTuHienThi: 1,
          value: "357 mm",
          giaTriSo: 357,
        },
        {
          id: "spec-11", typeId: "t-slots", typeLabel: "Slot Width",
          description: "e.g. 2.5 slots, 3.5 slots",
          maKyThuat: "card_slot_width",
          kieuDuLieu: "number",
          donVi: "slots",
          batBuoc: false,
          coTheLoc: false,
          thuTuHienThi: 2,
          value: "3.5 slots",
          giaTriSo: 3.5,
        },
        {
          id: "spec-12", typeId: "t-outputs", typeLabel: "Display Outputs",
          description: "HDMI / DisplayPort count and version",
          kieuDuLieu: "text",
          batBuoc: true,
          coTheLoc: false,
          thuTuHienThi: 3,
          value: "<ul><li>3× DisplayPort 1.4a: Trang bị ba cổng DisplayPort chuẩn 1.4a, cho phép truyền tải hình ảnh với băng thông cao, hỗ trợ độ phân giải lên đến 8K hoặc 4K ở tần số quét cao (144Hz hoặc hơn tùy cấu hình). Chuẩn DisplayPort 1.4a còn hỗ trợ công nghệ nén DSC (Display Stream Compression), HDR (High Dynamic Range), và Adaptive Sync, giúp mang lại trải nghiệm hình ảnh mượt mà, sắc nét, đặc biệt phù hợp cho gaming và thiết kế đồ họa chuyên nghiệp.</li><li>1× HDMI 2.1: Tích hợp một cổng HDMI 2.1 hiện đại, hỗ trợ băng thông lên đến 48Gbps, cho phép xuất hình ảnh ở độ phân giải 4K@120Hz hoặc 8K@60Hz. Chuẩn HDMI 2.1 còn hỗ trợ các công nghệ tiên tiến như VRR (Variable Refresh Rate), ALLM (Auto Low Latency Mode) và eARC, đảm bảo khả năng tương thích tốt với các thiết bị giải trí như console (PlayStation, Xbox) và mang lại trải nghiệm chơi game, xem phim mượt mà, độ trễ thấp.</li></ul>",
          giaTriChuan: "3xdp14a_1xhdmi21",
        },
        {
          id: "spec-13", typeId: "t-power", typeLabel: "Power Connector",
          description: "e.g. 1× 16-pin, 3× 8-pin",
          kieuDuLieu: "enum",
          batBuoc: true,
          coTheLoc: true,
          widgetLoc: "combo-select",
          thuTuLoc: 1,
          thuTuHienThi: 4,
          value: "1× 16-pin (PCIe 5.0)",
          giaTriChuan: "pcie5_16pin",
        },
        {
          id: "spec-14", typeId: "t-weight", typeLabel: "Card Weight",
          description: "kg",
          maKyThuat: "card_weight_kg",
          kieuDuLieu: "number",
          donVi: "kg",
          batBuoc: false,
          coTheLoc: false,
          thuTuHienThi: 5,
          value: "1.85 kg",
          giaTriSo: 1.85,
        },
      ],
    },
  ],

  media: [
    {
      id: "media-001",
      variantId: "var-001-a",
      url: "https://product.hstatic.net/200000722513/product/fwebp__6__be7ded7631fb4241b3edaf400ed9c617_master.png",
      type: "main",
      order: 1,
      altText: "ROG Strix RTX 4090 — front view",
    },
    {
      id: "media-002",
      variantId: "var-001-a",
      url: "https://product.hstatic.net/200000722513/product/fwebp__3__84e1ccef9e5646669f2eb47462d1a551_master.png",
      type: "gallery",
      order: 2,
      altText: "Side profile",
    },
    {
      id: "media-003",
      variantId: "var-001-a",
      url: "https://product.hstatic.net/200000722513/product/fwebp__4__d0edd6a5df3f4f00913e787878bf2aef_master.png",
      type: "gallery",
      order: 3,
      altText: "Backplate detail",
    },
    {
      id: "media-004",
      variantId: "var-001-a",
      url: "https://product.hstatic.net/200000722513/product/fwebp__5__51d126a5d69047308fc07dd790928a36_master.png",
      type: "gallery",
      order: 4,
      altText: "RGB lighting active",
    },
    {
      id: "media-005",
      variantId: "var-001-a",
      url: "https://product.hstatic.net/200000722513/product/fwebp__2__8c3b0662ed3941db8a4347629cc80b34_master.png",
      type: "gallery",
      order: 5,
      altText: "Fan close-up",
    },
    {
      id: "media-006",
      variantId: "var-001-a",
      url: "https://product.hstatic.net/200000722513/product/fwebp__5__51d126a5d69047308fc07dd790928a36_master.png",
      type: "360",
      order: 6,
      altText: "360° view",
    },
  ],
};
