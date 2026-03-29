import type { CategoryNode } from "@/src/components/admin/CategoryTreeSelect/types";

// ─── Mock category hierarchy ──────────────────────────────────────────────────
// 4 levels deep in the deepest paths; multiple branches per level.
// Used by both /products/new and /products/[id]/edit.

export const MOCK_CATEGORIES: CategoryNode[] = [
  {
    id: "electronics",
    label: "Electronics",
    children: [
      {
        id: "computers",
        label: "Computers",
        children: [
          {
            id: "laptops",
            label: "Laptops",
            children: [
              { id: "gaming-laptops",       label: "Gaming Laptops" },
              { id: "ultrabooks",           label: "Ultrabooks" },
              { id: "workstation-laptops",  label: "Workstation Laptops" },
            ],
          },
          {
            id: "desktops",
            label: "Desktops",
            children: [
              { id: "gaming-desktops", label: "Gaming Desktops" },
              { id: "mini-pcs",        label: "Mini PCs" },
              { id: "all-in-ones",     label: "All-in-Ones" },
            ],
          },
          {
            id: "components",
            label: "Components",
            children: [
              { id: "cpu",         label: "Processors (CPU)" },
              { id: "gpu",         label: "Graphics Cards (GPU)" },
              { id: "ram",         label: "Memory (RAM)" },
              { id: "storage-ssd", label: "Storage — SSD" },
              { id: "storage-hdd", label: "Storage — HDD" },
              { id: "motherboard", label: "Motherboards" },
              { id: "psu",         label: "Power Supplies (PSU)" },
              { id: "case",        label: "PC Cases" },
              { id: "cooling",     label: "Cooling" },
            ],
          },
        ],
      },
      {
        id: "peripherals",
        label: "Peripherals",
        children: [
          {
            id: "input-devices",
            label: "Input Devices",
            children: [
              { id: "keyboards", label: "Keyboards" },
              { id: "mice",      label: "Mice" },
              { id: "gamepads",  label: "Gamepads" },
            ],
          },
          {
            id: "displays",
            label: "Displays",
            children: [
              { id: "monitors-gaming", label: "Gaming Monitors" },
              { id: "monitors-office", label: "Office Monitors" },
              { id: "monitors-4k",     label: "4K / UHD Monitors" },
            ],
          },
          {
            id: "audio",
            label: "Audio",
            children: [
              { id: "headsets",    label: "Headsets" },
              { id: "speakers",    label: "Speakers" },
              { id: "microphones", label: "Microphones" },
            ],
          },
        ],
      },
      {
        id: "networking",
        label: "Networking",
        children: [
          { id: "routers",    label: "Routers" },
          { id: "switches",   label: "Switches" },
          { id: "wifi-cards", label: "WiFi Cards" },
        ],
      },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    children: [
      { id: "cables",      label: "Cables" },
      { id: "usb-hubs",    label: "USB Hubs" },
      { id: "laptop-bags", label: "Laptop Bags" },
      { id: "mousepads",   label: "Mouse Pads" },
    ],
  },
  {
    id: "software",
    label: "Software",
    children: [
      { id: "os",        label: "Operating Systems" },
      { id: "antivirus", label: "Antivirus" },
      { id: "office",    label: "Office Suites" },
    ],
  },
];
