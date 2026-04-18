# DESIGN SYSTEM — computer-store-admin
> Stack: Next.js 16 · TypeScript · TailwindCSS v4 · CSS Custom Properties

---

## 1. Token Architecture

```
src/app/globals.css      ← @theme blocks → Tailwind utilities auto-generated
tailwind.config.ts       ← JS reference (activate with @config in CSS)
src/lib/design-tokens.ts ← JS constants for Recharts, PDFs
```

TailwindCSS v4 uses CSS-first config: tokens defined in `@theme` become utility classes automatically.

---

## 2. Color Palette

### Primary — Blue (content area CTAs)
| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#eff6ff` | Hover bg, subtle fills |
| `primary-600` | `#2563eb` | ★ CTA button bg |
| `primary-700` | `#1d4ed8` | CTA hover |
| `primary-900` | `#1e3a8f` | High-contrast text |

### Secondary — Slate (text, borders, surfaces)
| Token | Hex | Usage |
|-------|-----|-------|
| `secondary-50`  | `#f8fafc` | Page bg |
| `secondary-100` | `#f1f5f9` | Card fills |
| `secondary-200` | `#e2e8f0` | Borders, dividers |
| `secondary-500` | `#64748b` | Secondary text, labels |
| `secondary-700` | `#334155` | ★ Body text |
| `secondary-900` | `#0f172a` | Page titles, max emphasis |

### Accent — Violet (admin identity)
| Token | Hex | Usage |
|-------|-----|-------|
| `accent-300` | `#c4b5fd` | Sidebar nav text (default) |
| `accent-400` | `#a78bfa` | Sidebar icons |
| `accent-600` | `#7c3aed` | ★ Admin CTA / nav active bg |
| `accent-700` | `#6d28d9` | Admin hover |

**Sidebar special vars** (use CSS custom properties):
```css
--sidebar-bg:        #1E1B4B  /* deep violet */
--sidebar-bg-hover:  #2D2A5A
--sidebar-active-bg: #7C3AED  /* = accent-600 */
--sidebar-text:      #C4B5FD  /* = accent-300 */
--sidebar-icon:      #A78BFA  /* = accent-400 */
```

### Semantic Colors
| Scale | Hex (600) | Usage |
|-------|-----------|-------|
| `success-600` | `#16a34a` | In stock, delivered, approved |
| `warning-600` | `#d97706` | Low stock, pending, expiring |
| `error-600`   | `#dc2626` | Out of stock, failed, rejected |
| `info-600`    | `#0891b2` | Informational, confirmed orders |

---

## 3. Typography

| Interface | Font | CSS Variable |
|-----------|------|--------------|
| Admin | **DM Sans** | `--font-dm-sans` → `--font-sans` |
| Monospace | JetBrains Mono | `--font-mono` (SKUs, IDs, prices) |

**Type scale (admin-specific patterns):**
```
Table header : text-xs font-semibold text-secondary-500 uppercase tracking-wide
Table cell   : text-sm text-secondary-700
Stat value   : text-3xl font-bold text-secondary-900 (tabular-nums)
Stat label   : text-sm text-secondary-500
Stat delta + : text-sm text-success-600 font-medium
Stat delta − : text-sm text-error-600 font-medium
Page title   : text-2xl font-bold text-secondary-900
```

---

## 4. Layout

### Admin Shell Dimensions
| Element | Size | Class |
|---------|------|-------|
| Sidebar (expanded) | 280px | `w-[280px]` |
| Sidebar (collapsed) | 72px | `w-[72px]` |
| Header height | 64px | `h-16` |
| Page padding | 24px | `p-6` |
| Card padding | 24px | `p-6` |
| Section gap | 24px | `space-y-6` |

### Stats Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
```

### AdminDetailLayout (detail/edit pages)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
  <div>{/* main: form, tabs, tables */}</div>
  <div>{/* aside: status panel, metadata, audit log */}</div>
</div>
```

---

## 5. Status Badge Patterns

```
Order pending    → bg-warning-50  text-warning-700
Order confirmed  → bg-info-50     text-info-700
Order packing    → bg-info-50     text-info-600
Order shipping   → bg-primary-50  text-primary-700
Order delivered  → bg-success-50  text-success-700
Order cancelled  → bg-error-50    text-error-700
Stock OK         → bg-success-50  text-success-700
Stock low        → bg-warning-50  text-warning-700
Stock out        → bg-error-50    text-error-700
Ticket open      → bg-warning-50  text-warning-700
Ticket resolved  → bg-success-50  text-success-700
```

---

## 6. Pre-built CSS Classes (globals.css)

| Class | Description |
|-------|-------------|
| `.admin-shell` | Full-screen flex layout |
| `.admin-sidebar` | Fixed 280px violet sidebar |
| `.admin-header` | Sticky white 64px header |
| `.admin-content` | Padded scrollable content area |
| `.admin-card` | White rounded-xl shadow-sm p-6 panel |
| `.sidebar-item` | Sidebar nav link |
| `.stats-grid` | 1→2→4 col KPI grid |
| `.stat-card` | Stat card container |
| `.stat-value` | Bold 3xl stat number |
| `.stat-label` | Muted sm stat title |
| `.stat-delta-up` | Green positive change (`+N%`) |
| `.stat-delta-down` | Red negative change (`-N%`) |
| `.table-container` | Scrollable table wrapper |
| `.th` | Table header cell |
| `.td` | Table data cell |
| `.tr-hover` | Row hover highlight |
| `.btn-admin` | Violet admin CTA button |
| `.btn-danger` | Red destructive button |
| `.page-title` | Bold 2xl page title |

---

## 7. JS Design Tokens (Recharts / PDFs)

```ts
import { colors, adminColors, rechartsTheme, getOrderBadgeClasses } from "@/lib/design-tokens";

// Recharts
<Bar dataKey="revenue" fill={colors.primary[600]} />
<Line dataKey="orders" stroke={colors.accent[500]} />

// Dynamic badge
<span className={getOrderBadgeClasses(order.status)}>
  {order.status}
</span>
```

Admin chart primary color: `accent-500` (#8b5cf6) for admin charts.
Grid line color: `secondary-200` (#e2e8f0).
