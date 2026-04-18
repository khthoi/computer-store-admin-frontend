# UI DESIGN SYSTEM — computer-store-admin
# Quick reference for admin-specific tokens. Full reference: DESIGN_SYSTEM.md

## Admin Identity Colors

```
Sidebar bg       : #1E1B4B  (deep violet) → CSS var --sidebar-bg
Sidebar nav text : #C4B5FD  (accent-300)  → default nav link text
Sidebar active   : #7C3AED  (accent-600)  → active nav item background
Sidebar hover    : #2D2A5A               → nav item hover background
Sidebar icons    : #A78BFA  (accent-400)
```

## Header
```
header-bg      : bg-white
header-border  : border-b border-secondary-200
header-height  : h-16 (64px)
```

## Layout Dimensions
```
Sidebar expanded  : w-[280px]
Sidebar collapsed : w-[72px] (icon-only, localStorage persist)
Page padding      : p-6 (24px)
Card padding      : p-6 (24px)
Section gap       : space-y-6
```

## Typography (admin)
```
Font       : DM Sans (NOT Inter — admin is data-dense)
Monospace  : JetBrains Mono (SKUs, IDs, prices in tables)
Body size  : text-sm (14px) — denser than storefront
```

## Content Area (NOT sidebar/header)
```
Primary CTA buttons : primary-600 (#2563eb) — blue
Focus rings         : accent-500 violet
```

## Status Badge Colors

| Status | Background | Text |
|--------|-----------|------|
| pending | bg-warning-50 | text-warning-700 |
| confirmed | bg-info-50 | text-info-700 |
| packing | bg-info-50 | text-info-600 |
| shipping | bg-primary-50 | text-primary-700 |
| delivered | bg-success-50 | text-success-700 |
| cancelled | bg-error-50 | text-error-700 |
| stock OK | bg-success-50 | text-success-700 |
| stock low | bg-warning-50 | text-warning-700 |
| stock out | bg-error-50 | text-error-700 |
| ticket open | bg-warning-50 | text-warning-700 |
| ticket resolved | bg-success-50 | text-success-700 |

## Chart Colors
```
Primary series    : accent-500 (#8b5cf6)
Secondary series  : primary-500 (#3b82f6)
Tertiary series   : success-500 (#22c55e)
Grid lines        : secondary-200 (#e2e8f0)
```

## Quick Token Map
```
bg-secondary-50    → page background
bg-white           → card / panel background
text-secondary-700 → body text
text-secondary-500 → secondary / muted text
border-secondary-200 → borders, dividers, table lines
```
