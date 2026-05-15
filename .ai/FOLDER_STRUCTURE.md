# FOLDER STRUCTURE — computer-store-admin

## App Router (src/app/)

```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── layout.tsx              # Minimal layout (no sidebar)
├── (dashboard)/                # Protected by proxy.ts (Next.js 16 — do NOT use middleware.ts)
│   ├── layout.tsx              # AdminShell: sidebar + header
│   ├── page.tsx                # AD-01 Dashboard overview
│   ├── loading.tsx
│   ├── products/               # AD-02/03 Product list + form
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── categories/page.tsx     # AD-04 Category tree
│   ├── brands/page.tsx         # AD-04 Brand management
│   ├── orders/                 # AD-05/06 Orders
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   ├── returns/            # Return requests
│   │   └── transactions/       # Transaction list
│   ├── inventory/              # AD-07 Inventory
│   │   ├── page.tsx
│   │   ├── items/
│   │   ├── stock-in/
│   │   ├── stock-out/
│   │   ├── movements/
│   │   ├── low-stock/
│   │   └── suppliers/
│   ├── promotions/             # AD-08 Promotions
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   ├── [id]/edit/page.tsx
│   │   ├── coupons/page.tsx
│   │   ├── flash-sales/page.tsx
│   │   └── earn-rules/page.tsx
│   ├── customers/              # AD-09 Customer management
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── support/                # AD-10 Support tickets
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── reviews/page.tsx        # AD-11 Review moderation
│   ├── reports/page.tsx        # AD-12 Business reports
│   ├── employees/              # AD-13 Staff accounts
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── roles/page.tsx          # AD-13 Role & permission management
│   ├── content/                # AD-14 CMS content
│   │   ├── banners/
│   │   ├── homepage/
│   │   ├── announcements/
│   │   ├── pages/
│   │   ├── faq/
│   │   ├── navigation/
│   │   ├── media/
│   │   └── buildpc/            # AD-15 PC builder configuration
│   ├── audit-logs/page.tsx     # System audit trail
│   ├── profile/                # Authenticated user profile
│   └── settings/               # AD-17 Settings
│       ├── general/
│       ├── payments/
│       ├── shipping/
│       ├── notifications/
│       ├── tax/
│       └── integrations/
├── globals.css
└── layout.tsx                  # Root: fonts + providers
```

---

## Components (src/components/)

```
src/components/
├── ui/                         # Local UI primitives — @computer-store/ui is NOT installed
│   └── [Accordion, Alert, Avatar, Badge, Button, Checkbox,
│       ColorSelect, DateInput, Drawer, DropdownAction, Dropzone,
│       Image, ImageField, Input, LayoutPicker, Lightbox, Modal,
│       PasswordInput, Popover, ProgressBar, Radio, Select,
│       Skeleton, Slider, Spinner, StarRating, Tabs, Textarea,
│       Toast, Toggle, Tooltip, SectionTypePicker, SideBanner]
│
└── admin/                      # Admin-specific components
    ├── AdminSidebar.tsx        # violet bg, active state via usePathname()
    ├── BulkBar.tsx
    ├── ConfirmDialog.tsx
    ├── DataTable.tsx           # Custom headless table
    ├── FileUpload.tsx
    ├── FilterDropdown.tsx
    ├── StatCard.tsx
    ├── StatusBadge.tsx
    ├── CategoryTreeSelect/
    ├── index.ts
    │
    ├── layout/                 # Shell layout
    │   ├── AdminLayout.tsx
    │   ├── AdminHeader.tsx
    │   ├── AdminBreadcrumb.tsx
    │   ├── AdminUserMenu.tsx
    │   ├── AdminPageWrapper.tsx
    │   └── AdminDetailLayout.tsx
    │
    ├── shared/                 # Cross-domain reusables
    │   ├── AdminSearchBar.tsx
    │   ├── TableToolbar.tsx
    │   ├── BulkActionBar.tsx
    │   ├── AdminDateRangePicker.tsx
    │   ├── AdminEmptyState.tsx
    │   ├── ExportButton.tsx
    │   ├── ImportModal.tsx
    │   ├── InlineEditField.tsx
    │   ├── MediaUploadPanel.tsx
    │   ├── AuditLogViewer.tsx
    │   ├── RolePermissionSelector.tsx
    │   └── ColumnConfigurator.tsx
    │
    ├── audit-logs/             # Audit log viewer
    ├── auth/                   # Login UI
    ├── catalog/                # Category + brand modals
    ├── content/                # CMS content forms
    ├── customers/              # Customer detail panels
    ├── dashboard/              # KPI widgets + charts
    ├── employees/              # Employee management
    ├── flash-sale/             # Flash sale scheduler
    ├── inventory/              # Stock management
    ├── notifications/          # Notification components (bell, broadcast)
    ├── orders/                 # Order detail components
    ├── products/               # Product form sections
    ├── profile/                # Profile screens
    ├── promotions/             # Promotion forms
    ├── reports/                # Analytics charts
    ├── reviews/                # Review moderation
    ├── roles/                  # Role / permission management
    ├── settings/               # Store config forms
    ├── support/                # Ticket management
    ├── users/                  # Customer + employee panels
    ├── variant/                # Product variant components
    └── variantEdit/            # Variant edit forms
```

---

## Data layer (src/)

```
src/
├── services/           # API abstraction (one per domain) — pure transport
│   ├── api.ts          # apiFetch helper (cookie auth, auto-refresh, server/client safe)
│   ├── admin-auth.service.ts
│   ├── audit-log.service.ts
│   ├── brand.service.ts
│   ├── buildpc.service.ts
│   ├── category.service.ts
│   ├── category_spec.service.ts
│   ├── content.service.ts
│   ├── coupon.service.ts
│   ├── customer.service.ts
│   ├── dashboard/
│   ├── employee.service.ts
│   ├── flash-sale.service.ts
│   ├── homepage.service.ts
│   ├── image.service.ts
│   ├── inventory.service.ts
│   ├── inventory-exports.service.ts
│   ├── loyalty.service.ts
│   ├── notification.service.ts
│   ├── order.service.ts
│   ├── product.service.ts
│   ├── profile.service.ts
│   ├── promotion.service.ts
│   ├── promotionEngine.ts
│   ├── report.service.ts
│   ├── returns.service.ts
│   ├── review.service.ts
│   ├── role.service.ts
│   ├── spec_group.service.ts
│   ├── ticket.service.ts
│   ├── transaction.service.ts
│   └── variant.service.ts
│
├── types/              # Domain type contracts ({domain}.types.ts)
│
├── store/              # Context + useReducer stores
│   ├── auth.store.tsx
│   ├── cart.store.tsx
│   ├── checkout.store.tsx
│   └── compare.store.tsx
│
├── navigation/
│   └── megamenu.config.ts
│
├── lib/
│   ├── auth-validation.ts
│   ├── design-tokens.ts # JS tokens for Recharts
│   ├── format.ts        # formatVND(), formatDate(), formatNumber()
│   ├── media-file.ts
│   ├── validateAddress.ts
│   └── validators/      # Zod schemas per domain
│
└── proxy.ts            # Next.js 16 route guard (JWT + role check)
```

---

## Placement rules

| What | Where |
|------|-------|
| New admin page | `src/app/(dashboard)/{route}/page.tsx` |
| New list page | `page.tsx` + `loading.tsx` + service + types |
| New detail page | `[id]/page.tsx` wrapped in `AdminDetailLayout` |
| New admin component | `src/components/admin/{domain}/ComponentName.tsx` |
| New service function | `src/services/{resource}.service.ts` |
| New types | `src/types/{resource}.types.ts` |
| New Zod schema | `src/lib/validators/{resource}.ts` |
| New chart (dashboard) | `src/components/admin/dashboard/{ChartName}.tsx` |
| New chart (reports) | `src/components/admin/reports/{ChartName}.tsx` |
| New settings page | `src/app/(dashboard)/settings/{section}/page.tsx` |
