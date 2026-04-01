import type { SpecificationGroup } from "@/src/types/product.types";

// ─── Spec templates for new-variant creation ──────────────────────────────────
//
// Each entry maps a product ID to its specification group template.
// Inherited groups come from the product's category (same across all products
// in that category). Direct groups are assigned at the product level.
// All values start as "" — the user fills them in on the create-variant page.
//
// Real API: GET /admin/products/:productId/variants/template

// ─── GPU — prod-001 ───────────────────────────────────────────────────────────

const GPU_TEMPLATE: SpecificationGroup[] = [
  {
    id: "tpl-gpu-core",
    label: "GPU Core Specifications",
    inherited: true,
    items: [
      { id: "tpl-gpu-core-1", typeId: "t-arch",    typeLabel: "Architecture",     description: "e.g. Ada Lovelace, RDNA 3",           value: "" },
      { id: "tpl-gpu-core-2", typeId: "t-cuda",    typeLabel: "Shader Units",     description: "CUDA cores / Stream Processors",       value: "" },
      { id: "tpl-gpu-core-3", typeId: "t-boost",   typeLabel: "Boost Clock",      description: "MHz — OC mode",                        value: "" },
      { id: "tpl-gpu-core-4", typeId: "t-base",    typeLabel: "Base Clock",       description: "MHz",                                  value: "" },
      { id: "tpl-gpu-core-5", typeId: "t-tdp",     typeLabel: "TDP",              description: "Thermal Design Power in watts",        value: "" },
    ],
  },
  {
    id: "tpl-gpu-memory",
    label: "Memory",
    inherited: true,
    items: [
      { id: "tpl-gpu-mem-1", typeId: "t-memsize",  typeLabel: "Memory Size",      description: "e.g. 8 GB, 16 GB, 24 GB",             value: "" },
      { id: "tpl-gpu-mem-2", typeId: "t-memtype",  typeLabel: "Memory Type",      description: "e.g. GDDR6, GDDR6X, HBM3",            value: "" },
      { id: "tpl-gpu-mem-3", typeId: "t-membus",   typeLabel: "Memory Bus",       description: "e.g. 128-bit, 256-bit, 384-bit",      value: "" },
      { id: "tpl-gpu-mem-4", typeId: "t-membw",    typeLabel: "Bandwidth",        description: "GB/s",                                 value: "" },
    ],
  },
  {
    id: "tpl-gpu-physical",
    label: "Physical & Connectivity",
    inherited: false,
    items: [
      { id: "tpl-gpu-phys-1", typeId: "t-length",  typeLabel: "Card Length",      description: "mm",                                   value: "" },
      { id: "tpl-gpu-phys-2", typeId: "t-slots",   typeLabel: "Slot Width",       description: "e.g. 2.5 slots, 3.5 slots",           value: "" },
      { id: "tpl-gpu-phys-3", typeId: "t-outputs", typeLabel: "Display Outputs",  description: "HDMI / DisplayPort count and version", value: "" },
      { id: "tpl-gpu-phys-4", typeId: "t-power",   typeLabel: "Power Connector",  description: "e.g. 1× 16-pin, 3× 8-pin",           value: "" },
      { id: "tpl-gpu-phys-5", typeId: "t-cardwt",  typeLabel: "Card Weight",      description: "kg",                                   value: "" },
    ],
  },
];

// ─── CPU — prod-002 ───────────────────────────────────────────────────────────

const CPU_TEMPLATE: SpecificationGroup[] = [
  {
    id: "tpl-cpu-proc",
    label: "Processor Specifications",
    inherited: true,
    items: [
      { id: "tpl-cpu-proc-1", typeId: "t-cpu-arch",    typeLabel: "Architecture",        description: "e.g. Raptor Lake, Zen 4",              value: "" },
      { id: "tpl-cpu-proc-2", typeId: "t-cpu-cores",   typeLabel: "Total Cores",         description: "P-cores + E-cores",                    value: "" },
      { id: "tpl-cpu-proc-3", typeId: "t-cpu-threads", typeLabel: "Threads",             description: "",                                      value: "" },
      { id: "tpl-cpu-proc-4", typeId: "t-cpu-base",    typeLabel: "Base Frequency",      description: "GHz (P-core)",                         value: "" },
      { id: "tpl-cpu-proc-5", typeId: "t-cpu-boost",   typeLabel: "Max Turbo Frequency", description: "GHz (P-core)",                         value: "" },
      { id: "tpl-cpu-proc-6", typeId: "t-cpu-cache",   typeLabel: "L3 Cache",            description: "MB",                                   value: "" },
      { id: "tpl-cpu-proc-7", typeId: "t-cpu-tdp",     typeLabel: "Base TDP",            description: "W",                                    value: "" },
    ],
  },
  {
    id: "tpl-cpu-platform",
    label: "Platform",
    inherited: true,
    items: [
      { id: "tpl-cpu-plat-1", typeId: "t-cpu-socket",  typeLabel: "CPU Socket",          description: "e.g. LGA1700, AM5",                   value: "" },
      { id: "tpl-cpu-plat-2", typeId: "t-cpu-memtype", typeLabel: "Memory Type Support", description: "e.g. DDR5, DDR4",                     value: "" },
      { id: "tpl-cpu-plat-3", typeId: "t-cpu-memch",   typeLabel: "Memory Channels",     description: "e.g. Dual-channel",                   value: "" },
      { id: "tpl-cpu-plat-4", typeId: "t-cpu-maxmem",  typeLabel: "Max Memory Speed",    description: "MHz (official spec)",                  value: "" },
    ],
  },
  {
    id: "tpl-cpu-box",
    label: "Package",
    inherited: false,
    items: [
      { id: "tpl-cpu-box-1", typeId: "t-cpu-pkg",      typeLabel: "Package Type",        description: "Box (retail) or Tray (OEM)",          value: "" },
      { id: "tpl-cpu-box-2", typeId: "t-cpu-cooler",   typeLabel: "Bundled Cooler",      description: "Included or not",                      value: "" },
      { id: "tpl-cpu-box-3", typeId: "t-cpu-warranty", typeLabel: "Warranty",            description: "e.g. 3 years",                        value: "" },
    ],
  },
];

// ─── SSD — prod-003 ───────────────────────────────────────────────────────────

const SSD_TEMPLATE: SpecificationGroup[] = [
  {
    id: "tpl-ssd-perf",
    label: "Storage Performance",
    inherited: true,
    items: [
      { id: "tpl-ssd-perf-1", typeId: "t-ssd-iface",   typeLabel: "Interface",           description: "e.g. PCIe 4.0 ×4, PCIe 5.0 ×4, SATA", value: "" },
      { id: "tpl-ssd-perf-2", typeId: "t-ssd-form",    typeLabel: "Form Factor",         description: "e.g. M.2 2280, 2.5\"",                   value: "" },
      { id: "tpl-ssd-perf-3", typeId: "t-ssd-seqr",    typeLabel: "Sequential Read",     description: "MB/s",                                   value: "" },
      { id: "tpl-ssd-perf-4", typeId: "t-ssd-seqw",    typeLabel: "Sequential Write",    description: "MB/s",                                   value: "" },
      { id: "tpl-ssd-perf-5", typeId: "t-ssd-randr",   typeLabel: "Random Read",         description: "IOPS (4K)",                              value: "" },
      { id: "tpl-ssd-perf-6", typeId: "t-ssd-randw",   typeLabel: "Random Write",        description: "IOPS (4K)",                              value: "" },
    ],
  },
  {
    id: "tpl-ssd-storage",
    label: "Storage",
    inherited: true,
    items: [
      { id: "tpl-ssd-stor-1", typeId: "t-ssd-cap",     typeLabel: "Capacity",            description: "e.g. 500 GB, 1 TB, 2 TB",              value: "" },
      { id: "tpl-ssd-stor-2", typeId: "t-ssd-nand",    typeLabel: "NAND Type",           description: "e.g. TLC V-NAND, QLC",                  value: "" },
      { id: "tpl-ssd-stor-3", typeId: "t-ssd-tbw",     typeLabel: "TBW",                 description: "Terabytes Written (endurance rating)",   value: "" },
      { id: "tpl-ssd-stor-4", typeId: "t-ssd-dram",    typeLabel: "DRAM Cache",          description: "Yes / No / HMB",                        value: "" },
    ],
  },
  {
    id: "tpl-ssd-physical",
    label: "Physical",
    inherited: false,
    items: [
      { id: "tpl-ssd-phys-1", typeId: "t-ssd-dims",    typeLabel: "Dimensions",          description: "mm (L × W × H)",                        value: "" },
      { id: "tpl-ssd-phys-2", typeId: "t-ssd-weight",  typeLabel: "Weight",              description: "g",                                      value: "" },
      { id: "tpl-ssd-phys-3", typeId: "t-ssd-temp",    typeLabel: "Operating Temp.",     description: "°C range",                               value: "" },
    ],
  },
];

// ─── RAM — prod-004 ───────────────────────────────────────────────────────────

const RAM_TEMPLATE: SpecificationGroup[] = [
  {
    id: "tpl-ram-spec",
    label: "Memory Specifications",
    inherited: true,
    items: [
      { id: "tpl-ram-spec-1", typeId: "t-ram-type",    typeLabel: "Memory Type",         description: "e.g. DDR5, DDR4",                      value: "" },
      { id: "tpl-ram-spec-2", typeId: "t-ram-speed",   typeLabel: "Speed",               description: "MHz (e.g. 6400, 7200)",                 value: "" },
      { id: "tpl-ram-spec-3", typeId: "t-ram-cap",     typeLabel: "Capacity",            description: "Total GB (e.g. 16 GB, 32 GB)",          value: "" },
      { id: "tpl-ram-spec-4", typeId: "t-ram-cl",      typeLabel: "CAS Latency (CL)",    description: "e.g. CL32, CL36",                      value: "" },
      { id: "tpl-ram-spec-5", typeId: "t-ram-timing",  typeLabel: "Timings",             description: "Full timing string",                    value: "" },
      { id: "tpl-ram-spec-6", typeId: "t-ram-voltage", typeLabel: "Voltage",             description: "V (e.g. 1.35 V, 1.4 V)",               value: "" },
      { id: "tpl-ram-spec-7", typeId: "t-ram-xmp",     typeLabel: "XMP / EXPO Profile",  description: "Supported profile version",             value: "" },
    ],
  },
  {
    id: "tpl-ram-physical",
    label: "Physical",
    inherited: false,
    items: [
      { id: "tpl-ram-phys-1", typeId: "t-ram-form",    typeLabel: "Form Factor",         description: "e.g. DIMM, SO-DIMM",                   value: "" },
      { id: "tpl-ram-phys-2", typeId: "t-ram-sticks",  typeLabel: "Sticks per Kit",      description: "e.g. 2× (dual-channel kit)",           value: "" },
      { id: "tpl-ram-phys-3", typeId: "t-ram-heatspr", typeLabel: "Heat Spreader",       description: "Type / color",                          value: "" },
      { id: "tpl-ram-phys-4", typeId: "t-ram-rgb",     typeLabel: "RGB",                 description: "Yes / No, ecosystem compatibility",     value: "" },
      { id: "tpl-ram-phys-5", typeId: "t-ram-height",  typeLabel: "Module Height",       description: "mm",                                    value: "" },
    ],
  },
];

// ─── Monitor — prod-005 ───────────────────────────────────────────────────────

const MONITOR_TEMPLATE: SpecificationGroup[] = [
  {
    id: "tpl-mon-panel",
    label: "Display Panel",
    inherited: true,
    items: [
      { id: "tpl-mon-panel-1", typeId: "t-mon-type",   typeLabel: "Panel Type",          description: "IPS, VA, TN, OLED, QD-OLED",           value: "" },
      { id: "tpl-mon-panel-2", typeId: "t-mon-size",   typeLabel: "Screen Size",         description: "inches (diagonal)",                     value: "" },
      { id: "tpl-mon-panel-3", typeId: "t-mon-res",    typeLabel: "Resolution",          description: "e.g. 1920×1080, 2560×1440",             value: "" },
      { id: "tpl-mon-panel-4", typeId: "t-mon-rr",     typeLabel: "Refresh Rate",        description: "Hz (max)",                               value: "" },
      { id: "tpl-mon-panel-5", typeId: "t-mon-rt",     typeLabel: "Response Time",       description: "ms (GtG)",                               value: "" },
      { id: "tpl-mon-panel-6", typeId: "t-mon-ratio",  typeLabel: "Aspect Ratio",        description: "e.g. 16:9, 21:9",                      value: "" },
    ],
  },
  {
    id: "tpl-mon-color",
    label: "Color & HDR",
    inherited: true,
    items: [
      { id: "tpl-mon-color-1", typeId: "t-mon-srgb",   typeLabel: "sRGB Coverage",       description: "% (e.g. 99%)",                          value: "" },
      { id: "tpl-mon-color-2", typeId: "t-mon-hdr",    typeLabel: "HDR Standard",        description: "e.g. HDR600, HDR True Black 400",       value: "" },
      { id: "tpl-mon-color-3", typeId: "t-mon-nits",   typeLabel: "Peak Brightness",     description: "nits",                                  value: "" },
    ],
  },
  {
    id: "tpl-mon-connectivity",
    label: "Connectivity",
    inherited: false,
    items: [
      { id: "tpl-mon-conn-1", typeId: "t-mon-hdmi",    typeLabel: "HDMI Ports",          description: "Count and version",                     value: "" },
      { id: "tpl-mon-conn-2", typeId: "t-mon-dp",      typeLabel: "DisplayPort Ports",   description: "Count and version",                     value: "" },
      { id: "tpl-mon-conn-3", typeId: "t-mon-usb",     typeLabel: "USB Hub",             description: "Downstream ports and type",             value: "" },
      { id: "tpl-mon-conn-4", typeId: "t-mon-audio",   typeLabel: "Audio",               description: "3.5mm out, speakers built-in, etc.",    value: "" },
    ],
  },
  {
    id: "tpl-mon-physical",
    label: "Physical",
    inherited: false,
    items: [
      { id: "tpl-mon-phys-1", typeId: "t-mon-dims",    typeLabel: "Dimensions (w/stand)", description: "mm W × H × D",                        value: "" },
      { id: "tpl-mon-phys-2", typeId: "t-mon-weight",  typeLabel: "Weight (w/stand)",    description: "kg",                                    value: "" },
      { id: "tpl-mon-phys-3", typeId: "t-mon-vesa",    typeLabel: "VESA Mount",          description: "e.g. 100×100 mm",                      value: "" },
      { id: "tpl-mon-phys-4", typeId: "t-mon-adj",     typeLabel: "Stand Adjustments",   description: "Height / Tilt / Swivel / Pivot",        value: "" },
      { id: "tpl-mon-phys-5", typeId: "t-mon-color",   typeLabel: "Color",               description: "e.g. Black, White, Eclipse Grey",       value: "" },
    ],
  },
];

// ─── Cooling — prod-006 ───────────────────────────────────────────────────────

const COOLING_TEMPLATE: SpecificationGroup[] = [
  {
    id: "tpl-cool-spec",
    label: "Cooler Specifications",
    inherited: true,
    items: [
      { id: "tpl-cool-spec-1", typeId: "t-cool-type",  typeLabel: "Cooler Type",         description: "Air / AIO Liquid / Custom loop",        value: "" },
      { id: "tpl-cool-spec-2", typeId: "t-cool-tdp",   typeLabel: "TDP Rating",          description: "W (max supported CPU TDP)",             value: "" },
      { id: "tpl-cool-spec-3", typeId: "t-cool-rpm",   typeLabel: "Fan Speed",           description: "RPM (min–max)",                          value: "" },
      { id: "tpl-cool-spec-4", typeId: "t-cool-noise", typeLabel: "Noise Level",         description: "dBA (max load)",                         value: "" },
      { id: "tpl-cool-spec-5", typeId: "t-cool-bear",  typeLabel: "Fan Bearing",         description: "e.g. SSO2, Rifle, Fluid Dynamic",       value: "" },
      { id: "tpl-cool-spec-6", typeId: "t-cool-conn",  typeLabel: "Fan Connector",       description: "e.g. 4-pin PWM",                        value: "" },
    ],
  },
  {
    id: "tpl-cool-compat",
    label: "Compatibility",
    inherited: false,
    items: [
      { id: "tpl-cool-compat-1", typeId: "t-cool-intel", typeLabel: "Intel Sockets",     description: "e.g. LGA1700, LGA1200",                 value: "" },
      { id: "tpl-cool-compat-2", typeId: "t-cool-amd",   typeLabel: "AMD Sockets",       description: "e.g. AM5, AM4",                         value: "" },
      { id: "tpl-cool-compat-3", typeId: "t-cool-h",     typeLabel: "Cooler Height",     description: "mm — check case clearance",             value: "" },
      { id: "tpl-cool-compat-4", typeId: "t-cool-wt",    typeLabel: "Net Weight",        description: "g (without fans)",                       value: "" },
    ],
  },
];

// ─── Motherboard — prod-007 ───────────────────────────────────────────────────

const MOTHERBOARD_TEMPLATE: SpecificationGroup[] = [
  {
    id: "tpl-mb-board",
    label: "Board Specifications",
    inherited: true,
    items: [
      { id: "tpl-mb-board-1", typeId: "t-mb-form",    typeLabel: "Form Factor",         description: "e.g. ATX, mATX, E-ATX, ITX",           value: "" },
      { id: "tpl-mb-board-2", typeId: "t-mb-chip",    typeLabel: "Chipset",             description: "e.g. Z790, X670E, B650",                value: "" },
      { id: "tpl-mb-board-3", typeId: "t-mb-socket",  typeLabel: "CPU Socket",          description: "e.g. LGA1700, AM5",                    value: "" },
      { id: "tpl-mb-board-4", typeId: "t-mb-memtype", typeLabel: "Memory Type",         description: "DDR5 / DDR4",                           value: "" },
      { id: "tpl-mb-board-5", typeId: "t-mb-memslot", typeLabel: "Memory Slots",        description: "Count (e.g. 4× DIMM)",                  value: "" },
      { id: "tpl-mb-board-6", typeId: "t-mb-maxmem",  typeLabel: "Max Memory",          description: "GB",                                    value: "" },
      { id: "tpl-mb-board-7", typeId: "t-mb-pcie",    typeLabel: "PCIe Version",        description: "Primary x16 slot version",              value: "" },
    ],
  },
  {
    id: "tpl-mb-conn",
    label: "Connectivity",
    inherited: true,
    items: [
      { id: "tpl-mb-conn-1", typeId: "t-mb-m2",       typeLabel: "M.2 Slots",           description: "Count and max key/length",              value: "" },
      { id: "tpl-mb-conn-2", typeId: "t-mb-sata",     typeLabel: "SATA Ports",          description: "6 Gb/s port count",                     value: "" },
      { id: "tpl-mb-conn-3", typeId: "t-mb-usbrear",  typeLabel: "Rear USB Ports",      description: "Breakdown by type (USB-A, USB-C, etc.)", value: "" },
      { id: "tpl-mb-conn-4", typeId: "t-mb-lan",      typeLabel: "LAN Speed",           description: "e.g. 2.5 GbE, 10 GbE",                value: "" },
      { id: "tpl-mb-conn-5", typeId: "t-mb-wifi",     typeLabel: "Wi-Fi",               description: "Standard and version (or none)",        value: "" },
    ],
  },
  {
    id: "tpl-mb-oc",
    label: "Power & Overclocking",
    inherited: false,
    items: [
      { id: "tpl-mb-oc-1", typeId: "t-mb-phases",     typeLabel: "Power Phases",        description: "VRM phase count",                       value: "" },
      { id: "tpl-mb-oc-2", typeId: "t-mb-maxtdp",     typeLabel: "Max CPU TDP",         description: "W supported by VRM",                    value: "" },
      { id: "tpl-mb-oc-3", typeId: "t-mb-ocfeature",  typeLabel: "OC Features",         description: "e.g. Overclocking buttons, BIOS Flashback", value: "" },
    ],
  },
];

// ─── Case — prod-008 ─────────────────────────────────────────────────────────

const CASE_TEMPLATE: SpecificationGroup[] = [
  {
    id: "tpl-case-spec",
    label: "Case Specifications",
    inherited: true,
    items: [
      { id: "tpl-case-spec-1", typeId: "t-case-type",  typeLabel: "Case Type",           description: "e.g. Mid-Tower, Full-Tower, SFF",       value: "" },
      { id: "tpl-case-spec-2", typeId: "t-case-mb",    typeLabel: "Supported MBs",       description: "e.g. ATX, E-ATX, mATX, ITX",           value: "" },
      { id: "tpl-case-spec-3", typeId: "t-case-gpu",   typeLabel: "Max GPU Length",      description: "mm",                                    value: "" },
      { id: "tpl-case-spec-4", typeId: "t-case-cpu",   typeLabel: "Max CPU Cooler Height", description: "mm",                                  value: "" },
      { id: "tpl-case-spec-5", typeId: "t-case-35bay", typeLabel: "3.5\" Drive Bays",    description: "Count",                                 value: "" },
      { id: "tpl-case-spec-6", typeId: "t-case-25bay", typeLabel: "2.5\" Drive Bays",    description: "Count",                                 value: "" },
    ],
  },
  {
    id: "tpl-case-airflow",
    label: "Airflow & Cooling",
    inherited: true,
    items: [
      { id: "tpl-case-air-1", typeId: "t-case-fanslots", typeLabel: "Total Fan Slots",   description: "Count",                                 value: "" },
      { id: "tpl-case-air-2", typeId: "t-case-fans",     typeLabel: "Pre-installed Fans", description: "Count and size (mm)",                  value: "" },
      { id: "tpl-case-air-3", typeId: "t-case-rad",      typeLabel: "Radiator Support",  description: "Max radiator size (mm)",                value: "" },
    ],
  },
  {
    id: "tpl-case-build",
    label: "Build",
    inherited: false,
    items: [
      { id: "tpl-case-build-1", typeId: "t-case-window", typeLabel: "Side Window",       description: "Tempered Glass / Mesh / None",          value: "" },
      { id: "tpl-case-build-2", typeId: "t-case-panel",  typeLabel: "Side Panel",        description: "e.g. Steel, Aluminum, Tempered Glass",  value: "" },
      { id: "tpl-case-build-3", typeId: "t-case-dims",   typeLabel: "Dimensions",        description: "mm W × H × D",                          value: "" },
      { id: "tpl-case-build-4", typeId: "t-case-wt",     typeLabel: "Net Weight",        description: "kg",                                    value: "" },
      { id: "tpl-case-build-5", typeId: "t-case-color",  typeLabel: "Color",             description: "e.g. Black, White, Silver",             value: "" },
    ],
  },
];

// ─── Master map: productId → template ────────────────────────────────────────

export const MOCK_SPEC_TEMPLATES: Record<string, SpecificationGroup[]> = {
  "prod-001": GPU_TEMPLATE,
  "prod-002": CPU_TEMPLATE,
  "prod-003": SSD_TEMPLATE,
  "prod-004": RAM_TEMPLATE,
  "prod-005": MONITOR_TEMPLATE,
  "prod-006": COOLING_TEMPLATE,
  "prod-007": MOTHERBOARD_TEMPLATE,
  "prod-008": CASE_TEMPLATE,
};
