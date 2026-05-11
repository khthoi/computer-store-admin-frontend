/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ONLINE PC STORE — Design Tokens (JavaScript Constants)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Exported JS constants for use anywhere CSS classes aren't available:
 *   - Chart.js / Recharts color config
 *   - Inline styles when Tailwind classes aren't enough
 *   - Canvas/WebGL drawing colors
 *   - Server-side PDF/email generation
 *   - Test assertions on rendered styles
 *   - Storybook argTypes definitions
 *
 * These values are the single source of truth — kept in sync with
 * globals.css @theme tokens.
 *
 * Usage:
 *   import { colors, typography, spacing } from "@/lib/design-tokens";
 *   const barColor = colors.primary[600];   // "#2563eb"
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════════════════════════════════════════════════════════════
   COLOR PALETTE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * PRIMARY — Brand Blue
 * CTAs, links, focus rings, interactive elements
 * Tailwind: bg-primary-600 · text-primary-600 · border-primary-300
 */
export const colorPrimary = {
  50:  "#eff6ff",  // Hover/highlight backgrounds
  100: "#dbeafe",  // Selected state, light focus ring fill
  200: "#bfdbfe",  // Active pill background
  300: "#93c5fd",  // Disabled button text, light border
  400: "#60a5fa",  // Secondary button border, icon
  500: "#3b82f6",  // Icons, accent strokes
  600: "#2563eb",  // ★ Primary CTA button bg
  700: "#1d4ed8",  // CTA hover state
  800: "#1e40af",  // CTA active/pressed, dark links
  900: "#1e3a8f",  // High-contrast text on light bg
  950: "#172554",  // Deepest blue emphasis
} as const;

/**
 * SECONDARY — Slate
 * Text hierarchy, borders, backgrounds, neutral surfaces
 * Tailwind: bg-secondary-50 · text-secondary-700 · border-secondary-200
 */
export const colorSecondary = {
  50:  "#f8fafc",  // Page background
  100: "#f1f5f9",  // Card background, section fills
  200: "#e2e8f0",  // Borders, dividers, table lines
  300: "#cbd5e1",  // Disabled borders, input placeholder
  400: "#94a3b8",  // Placeholder text, muted icons
  500: "#64748b",  // Secondary text, metadata, labels
  600: "#475569",  // Supporting text, breadcrumbs
  700: "#334155",  // ★ Body text (primary reading)
  800: "#1e293b",  // Headings, strong emphasis
  900: "#0f172a",  // Page titles, maximum emphasis
  950: "#020617",  // Near-black, reserved for max contrast
} as const;

/**
 * ACCENT — Blue
 * Storefront: premium badges, featured labels, promo highlights
 * Admin: PRIMARY interface color — sidebar, nav, admin CTAs
 * Tailwind: bg-accent-600 · text-accent-500 · border-accent-200
 */
export const colorAccent = {
  50:  "#eff6ff",  // Soft highlight background
  100: "#dbeafe",  // Badge/hover background
  200: "#bfdbfe",  // Light accent border
  300: "#93c5fd",  // Light accent icon/text
  400: "#60a5fa",  // Accent icon, decorative
  500: "#3b82f6",  // Featured labels, highlights
  600: "#2563eb",  // ★ Premium badges / admin primary
  700: "#1d4ed8",  // Accent hover
  800: "#1e40af",  // Accent active
  900: "#1e3a8f",  // Dark accent emphasis
  950: "#172554",  // Deepest accent
} as const;

/**
 * SUCCESS — Green
 * In stock, order completed, payment success, positive confirmations
 * Tailwind: bg-success-50 · text-success-600 · border-success-200
 */
export const colorSuccess = {
  50:  "#f0fdf4",  // Banner bg
  100: "#dcfce7",  // Badge background
  200: "#bbf7d0",  // Badge border
  300: "#86efac",  // Light icon
  400: "#4ade80",  // Icon fill
  500: "#22c55e",  // Status dot, progress indicator
  600: "#16a34a",  // ★ "In Stock" label text
  700: "#15803d",  // Hover / emphasis
  800: "#166534",  // Strong emphasis on light bg
  900: "#14532d",  // High-contrast success text
  950: "#052e16",  // Deepest green
} as const;

/**
 * WARNING — Amber
 * Low stock, pending status, expiring promotions, caution states
 * Tailwind: bg-warning-50 · text-warning-700 · border-warning-200
 */
export const colorWarning = {
  50:  "#fffbeb",  // Banner bg
  100: "#fef3c7",  // Badge background
  200: "#fde68a",  // Badge border
  300: "#fcd34d",  // Light icon
  400: "#fbbf24",  // Icon fill
  500: "#f59e0b",  // Status dot
  600: "#d97706",  // ★ "Low Stock" label text
  700: "#b45309",  // Hover / strong emphasis
  800: "#92400e",  // Strong warning text
  900: "#78350f",  // High-contrast warning
  950: "#451a03",  // Deepest amber
} as const;

/**
 * ERROR — Red
 * Payment failed, out of stock, form validation errors, destructive actions
 * Tailwind: bg-error-50 · text-error-600 · border-error-200
 */
export const colorError = {
  50:  "#fef2f2",  // Banner bg, field error background
  100: "#fee2e2",  // Badge background
  200: "#fecaca",  // Badge border, error field border
  300: "#fca5a5",  // Light icon
  400: "#f87171",  // Icon fill
  500: "#ef4444",  // Status dot
  600: "#dc2626",  // ★ "Out of Stock" / form error text
  700: "#b91c1c",  // Hover / destructive button
  800: "#991b1b",  // Strong error emphasis
  900: "#7f1d1d",  // High-contrast error text
  950: "#450a0a",  // Deepest red
} as const;

/**
 * INFO — Cyan
 * Informational banners, tooltips, help text, neutral notifications
 * Tailwind: bg-info-50 · text-info-600 · border-info-200
 */
export const colorInfo = {
  50:  "#ecfeff",  // Banner bg
  100: "#cffafe",  // Badge background
  200: "#a5f3fc",  // Badge border
  300: "#67e8f9",  // Light icon
  400: "#22d3ee",  // Icon fill
  500: "#06b6d4",  // Status dot
  600: "#0891b2",  // ★ Informational text
  700: "#0e7490",  // Hover / emphasis
  800: "#155e75",  // Strong info text
  900: "#164e63",  // High-contrast info
  950: "#083344",  // Deepest cyan
} as const;

/** Unified colors object for easy spreads */
export const colors = {
  primary:   colorPrimary,
  secondary: colorSecondary,
  accent:    colorAccent,
  success:   colorSuccess,
  warning:   colorWarning,
  error:     colorError,
  info:      colorInfo,
} as const;

export type ColorScale = typeof colorPrimary;
export type ColorName  = keyof typeof colors;
export type ColorShade = keyof ColorScale;


/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN-SPECIFIC COLORS (sidebar shell uses deep navy/blue)
   ═══════════════════════════════════════════════════════════════════════════ */
export const adminColors = {
  sidebarBg:          "#0F172A",  // Deep navy — sidebar background
  sidebarBgHover:     "#1E293B",  // Hover — slightly lighter than sidebar
  sidebarActiveBg:    "#2563EB",  // accent-600 — active nav item background
  sidebarActiveHover: "#1D4ED8",  // accent-700 — active item hover
  sidebarText:        "#CBD5E1",  // slate-300 — default sidebar nav text
  sidebarTextActive:  "#FFFFFF",  // White — active nav item text
  sidebarTextMuted:   "#64748B",  // Muted section label text
  sidebarIcon:        "#94A3B8",  // slate-400 — default nav icon
  sidebarIconActive:  "#FFFFFF",  // White — active nav icon
  sidebarDivider:     "#1E293B",  // Section separator
} as const;


/* ═══════════════════════════════════════════════════════════════════════════
   TYPOGRAPHY
   ═══════════════════════════════════════════════════════════════════════════ */

/** Font family stacks (CSS var referenced at runtime) */
export const fontFamilies = {
  /** Customer Storefront — Inter */
  storefront: "var(--font-sans, 'Inter', system-ui, sans-serif)",
  /** Admin Dashboard — DM Sans */
  admin:      "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
  /** Specs, SKUs, code — JetBrains Mono */
  mono:       "var(--font-mono, 'JetBrains Mono', Menlo, monospace)",
} as const;

/** Type scale — px values for use in canvas/chart contexts */
export const fontSizePx = {
  xs:   12,   // Badges, captions, timestamps
  sm:   14,   // Secondary text, labels, table cells
  base: 16,   // ★ Body text
  lg:   18,   // Lead paragraphs, card subheadings
  xl:   20,   // ★ Product names, section labels
  "2xl": 24,  // ★ Price display, card headings
  "3xl": 30,  // Page section titles
  "4xl": 36,  // Hero headings
  "5xl": 48,  // Hero display
} as const;

/** Type scale — rem values (for use in CSS-in-JS) */
export const fontSizeRem = {
  xs:    "0.75rem",
  sm:    "0.875rem",
  base:  "1rem",
  lg:    "1.125rem",
  xl:    "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
} as const;

export type FontSize = keyof typeof fontSizePx;

/** Font weights */
export const fontWeights = {
  regular:  400,  // Body text, descriptions
  medium:   500,  // Labels, nav items, table headers
  semibold: 600,  // Product names, CTA labels, card titles
  bold:     700,  // Prices, primary headings, emphasis
} as const;

/** Line heights */
export const lineHeights = {
  none:    1,
  tight:   1.1,    // Display / hero text
  snug:    1.25,   // Subheadings, card titles
  normal:  1.5,    // Body paragraphs
  relaxed: 1.625,  // Long-form content
  loose:   2,
} as const;

/** Letter spacing */
export const letterSpacing = {
  tighter: "-0.03em",  // 5xl display headings
  tight:   "-0.02em",  // 3xl–4xl headings
  normal:  "0em",      // Body text
  wide:    "0.025em",  // ★ Spec labels (UPPERCASE)
  wider:   "0.05em",   // ALL CAPS micro-copy
} as const;

/**
 * Typography composite patterns
 * Use these in Recharts tickStyle, canvas ctx, PDF renderers, etc.
 */
export const typography = {
  fontFamilies,
  fontSizePx,
  fontSizeRem,
  fontWeights,
  lineHeights,
  letterSpacing,

  /** Pre-built text style combinations matching CSS class rules */
  patterns: {
    productName: {
      fontSize:    fontSizePx.xl,
      fontWeight:  fontWeights.semibold,
      lineHeight:  lineHeights.tight,
      color:       colorSecondary[900],
    },
    priceCurrentDisplay: {
      fontSize:    fontSizePx["2xl"],
      fontWeight:  fontWeights.bold,
      lineHeight:  lineHeights.tight,
      color:       colorPrimary[600],
    },
    priceOriginal: {
      fontSize:    fontSizePx.sm,
      fontWeight:  fontWeights.regular,
      color:       colorSecondary[400],
      textDecoration: "line-through",
    },
    specLabel: {
      fontSize:    fontSizePx.sm,
      fontWeight:  fontWeights.medium,
      color:       colorSecondary[500],
      textTransform: "uppercase" as const,
      letterSpacing: letterSpacing.wide,
    },
    tableHeader: {
      fontSize:    fontSizePx.xs,
      fontWeight:  fontWeights.semibold,
      color:       colorSecondary[500],
      textTransform: "uppercase" as const,
      letterSpacing: letterSpacing.wide,
    },
    tableCell: {
      fontSize:    fontSizePx.sm,
      fontWeight:  fontWeights.regular,
      color:       colorSecondary[700],
    },
    statValue: {
      fontSize:    fontSizePx["3xl"],
      fontWeight:  fontWeights.bold,
      color:       colorSecondary[900],
      lineHeight:  lineHeights.tight,
    },
    statLabel: {
      fontSize:    fontSizePx.sm,
      fontWeight:  fontWeights.medium,
      color:       colorSecondary[500],
    },
  },
} as const;


/* ═══════════════════════════════════════════════════════════════════════════
   SPACING
   ═══════════════════════════════════════════════════════════════════════════ */

/** Spacing in px — for canvas, chart margins, PDF layout */
export const spacingPx = {
  1:  4,    // p-1
  2:  8,    // p-2
  3:  12,   // p-3
  4:  16,   // p-4
  5:  20,   // p-5
  6:  24,   // p-6
  8:  32,   // p-8
  10: 40,   // p-10
  12: 48,   // p-12
  16: 64,   // p-16
  20: 80,   // p-20
  24: 96,   // p-24
} as const;

/** Spacing in rem — for CSS-in-JS use */
export const spacingRem = {
  1:  "0.25rem",
  2:  "0.5rem",
  3:  "0.75rem",
  4:  "1rem",
  5:  "1.25rem",
  6:  "1.5rem",
  8:  "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

/** Semantic spacing aliases */
export const semanticSpacing = {
  sectionGap:    80,   // Between major page sections
  cardPadding:   24,   // Card internal padding
  formGap:       16,   // Between form fields
  sidebarWidth:  280,  // Filter/admin sidebar width
  sidebarCollapsedWidth: 72,
  headerHeight:  64,
} as const;


/* ═══════════════════════════════════════════════════════════════════════════
   BORDER RADIUS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Border radius in px */
export const borderRadius = {
  none:    0,     // Tables, full-bleed images
  sm:      4,     // Tooltips, small chips
  DEFAULT: 8,     // ★ Buttons, inputs, dropdowns
  md:      12,    // ★ Cards, panels
  lg:      16,    // Modals, drawers
  xl:      20,    // Feature cards
  "2xl":   24,    // Hero cards, marketing blocks
  full:    9999,  // ★ Badges, pills, avatars
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;

/** Semantic radius aliases */
export const semanticRadius = {
  button:  borderRadius.DEFAULT,  // 8px
  input:   borderRadius.DEFAULT,  // 8px
  card:    borderRadius.md,       // 12px — product & admin cards
  modal:   borderRadius.lg,       // 16px
  badge:   borderRadius.full,     // 9999px
  avatar:  borderRadius.full,     // 9999px
  tooltip: borderRadius.sm,       // 4px
} as const;


/* ═══════════════════════════════════════════════════════════════════════════
   SHADOW SCALE
   ═══════════════════════════════════════════════════════════════════════════ */

/** Shadow definitions (CSS string values) */
export const shadows = {
  xs:         "0 1px 2px rgba(0,0,0,0.04)",
  sm:         "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  md:         "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
  lg:         "0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)",
  xl:         "0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.03)",
  "2xl":      "0 25px 50px rgba(0,0,0,0.12)",
  card:       "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
  cardHover:  "0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.03)",
  modal:      "0 25px 50px rgba(0,0,0,0.20), 0 12px 24px rgba(0,0,0,0.10)",
  sidebar:    "2px 0 8px rgba(0,0,0,0.15)",
  inputFocus: "0 0 0 3px rgba(37,99,235,0.15)",    // blue
  inputFocusAccent: "0 0 0 3px rgba(37,99,235,0.20)", // blue (admin)
  none:       "none",
} as const;

export type ShadowKey = keyof typeof shadows;


/* ═══════════════════════════════════════════════════════════════════════════
   BREAKPOINTS
   ═══════════════════════════════════════════════════════════════════════════ */

export const breakpoints = {
  sm:    640,
  md:    768,
  lg:    1024,
  xl:    1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Media query strings for use in JS (e.g., matchMedia) */
export const mediaQueries = {
  sm:    `(min-width: ${breakpoints.sm}px)`,
  md:    `(min-width: ${breakpoints.md}px)`,
  lg:    `(min-width: ${breakpoints.lg}px)`,
  xl:    `(min-width: ${breakpoints.xl}px)`,
  "2xl": `(min-width: ${breakpoints["2xl"]}px)`,
} as const;


/* ═══════════════════════════════════════════════════════════════════════════
   STATUS MAPS (for data-driven badge/label rendering)
   ═══════════════════════════════════════════════════════════════════════════ */

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "coming_soon";
export type OrderStatus = "pending" | "confirmed" | "packing" | "shipping" | "delivered" | "cancelled";

/**
 * Stock status → color tokens
 * Usage: const { text, bg, border } = stockStatusColors[product.stockStatus];
 */
export const stockStatusColors: Record<StockStatus, { text: string; bg: string; border: string; label: string }> = {
  in_stock:    { text: colorSuccess[700], bg: colorSuccess[100], border: colorSuccess[200], label: "In Stock"     },
  low_stock:   { text: colorWarning[700], bg: colorWarning[100], border: colorWarning[200], label: "Low Stock"    },
  out_of_stock:{ text: colorError[700],   bg: colorError[100],   border: colorError[200],   label: "Out of Stock" },
  coming_soon: { text: colorInfo[700],    bg: colorInfo[100],    border: colorInfo[200],    label: "Coming Soon"  },
};

/**
 * Order status → color tokens
 * Usage: const { text, bg } = orderStatusColors[order.status];
 */
export const orderStatusColors: Record<OrderStatus, { text: string; bg: string; border: string; label: string }> = {
  pending:   { text: colorWarning[700], bg: colorWarning[100], border: colorWarning[200], label: "Pending"   },
  confirmed: { text: colorInfo[700],    bg: colorInfo[100],    border: colorInfo[200],    label: "Confirmed" },
  packing:   { text: colorInfo[700],    bg: colorInfo[100],    border: colorInfo[200],    label: "Packing"   },
  shipping:  { text: colorPrimary[700], bg: colorPrimary[100], border: colorPrimary[200], label: "Shipping"  },
  delivered: { text: colorSuccess[700], bg: colorSuccess[100], border: colorSuccess[200], label: "Delivered" },
  cancelled: { text: colorError[700],   bg: colorError[100],   border: colorError[200],   label: "Cancelled" },
};


/* ═══════════════════════════════════════════════════════════════════════════
   CHART COLORS (Recharts / Chart.js palettes)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Primary chart palette — ordered by visual hierarchy */
export const chartColors = [
  colorPrimary[600],   // Blue — primary metric (revenue, orders)
  colorAccent[500],    // Violet — secondary metric
  colorSuccess[500],   // Green — positive metric
  colorWarning[500],   // Amber — warning metric
  colorInfo[500],      // Cyan — info metric
  colorError[500],     // Red — negative metric
  colorPrimary[300],   // Light blue — comparison
  colorAccent[300],    // Light violet — comparison
] as const;

/** Admin dashboard chart theme for Recharts */
export const rechartsTheme = {
  colors: chartColors,
  gridColor: colorSecondary[200],
  axisColor: colorSecondary[300],
  tickColor: colorSecondary[500],
  tickFontSize: fontSizePx.xs,
  tooltipBg: colorSecondary[900],
  tooltipText: "#ffffff",
  tooltipBorderRadius: borderRadius.sm,
} as const;


/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION TOKENS
   ═══════════════════════════════════════════════════════════════════════════ */
export const transitions = {
  fast:  "150ms ease",
  base:  "200ms ease",
  slow:  "300ms ease-in-out",
} as const;

export const durations = {
  fast:   150,
  base:   200,
  slow:   300,
  slower: 500,
} as const;


/* ═══════════════════════════════════════════════════════════════════════════
   Z-INDEX SCALE
   ═══════════════════════════════════════════════════════════════════════════ */
export const zIndex = {
  base:     0,    // Default flow
  raised:   10,   // Slightly elevated (sticky elements)
  dropdown: 20,   // Dropdown menus
  sticky:   30,   // Sticky headers/footers
  fixed:    40,   // Fixed positioned chrome (admin header)
  sidebar:  50,   // Admin sidebar
  overlay:  60,   // Modal backdrop
  modal:    70,   // Modal dialog
  toast:    80,   // Toast notifications
  tooltip:  90,   // Tooltips
} as const;


/* ═══════════════════════════════════════════════════════════════════════════
   TAILWIND CLASS HELPERS
   Utility functions to build Tailwind class strings from token values.
   Useful when you need conditional color classes based on data.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Returns Tailwind badge classes for stock status.
 * Usage: <span className={getStockBadgeClasses("low_stock")}>Low Stock</span>
 */
export function getStockBadgeClasses(status: StockStatus): string {
  const map: Record<StockStatus, string> = {
    in_stock:     "badge badge-success",
    low_stock:    "badge badge-warning",
    out_of_stock: "badge badge-error",
    coming_soon:  "badge badge-info",
  };
  return map[status];
}

/**
 * Returns Tailwind badge classes for order status.
 * Usage: <span className={getOrderBadgeClasses("pending")}>Pending</span>
 */
export function getOrderBadgeClasses(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending:   "badge badge-pending",
    confirmed: "badge badge-confirmed",
    packing:   "badge badge-confirmed",
    shipping:  "badge badge-shipping",
    delivered: "badge badge-delivered",
    cancelled: "badge badge-cancelled",
  };
  return map[status];
}
