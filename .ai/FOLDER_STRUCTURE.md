# FOLDER STRUCTURE — computer-store-admin

## App Router (src/app/)

```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── layout.tsx              # Minimal layout (no sidebar)
├── (dashboard)/                # Protected by middleware.ts
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
│   │   ├── returns/            # AD-13 Return requests
│   │   └── transactions/       # Transaction list
│   ├── inventory/              # AD-08/09 Inventory
│   │   ├── page.tsx
│   │   ├── items/              # Stock items
│   │   ├── stock-in/           # Import stock
│   │   ├── stock-out/          # Export stock
│   │   ├── movements/          # Movement history
│   │   ├── low-stock/          # Low stock alerts
│   │   └── suppliers/          # Supplier management
│   ├── promotions/             # AD-10/11 Promotions
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   ├── [id]/edit/page.tsx
│   │   ├── coupons/page.tsx
│   │   ├── flash-sales/page.tsx
│   │   └── earn-rules/page.tsx
│   ├── customers/              # AD-12 Customer management
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── support/                # AD-14 Support tickets
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── reviews/page.tsx        # AD-15 Review moderation
│   ├── reports/page.tsx        # AD-16 Business reports
│   ├── employees/              # Staff accounts
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── roles/page.tsx          # Role & permission management
│   ├── content/                # CMS content
│   │   ├── banners/
│   │   ├── homepage/
│   │   ├── announcements/
│   │   ├── pages/
│   │   ├── faq/
│   │   ├── navigation/
│   │   ├── media/
│   │   └── buildpc/
│   ├── audit-logs/page.tsx     # System audit trail
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
├── ui/                         # Local UI primitives
│   └── [Accordion, Alert, Avatar, Badge, Button, Checkbox,
│      ColorSelect, DateInput, Drawer, DropdownAction, Dropzone,
│      Image, ImageField, Input, LayoutPicker, Lightbox, Modal,
│      PasswordInput, Popover, ProgressBar, Radio, Select,
│      Skeleton, Slider, Spinner, StarRating, Tabs, Textarea,
│      Toast, Toggle, Tooltip, SectionTypePicker, SideBanner]
│
└── admin/                      # Admin-specific components
    ├── AdminSidebar.tsx         # violet-700, usePathname active, 10 nav domains
    ├── ConfirmDialog.tsx
    ├── DataTable.tsx            # TanStack Table headless
    ├── FileUpload.tsx
    ├── FilterDropdown.tsx
    ├── StatCard.tsx
    ├── StatusBadge.tsx
    ├── CategoryTreeSelect/
    ├── index.ts
    │
    ├── layout/                  # Shell layout
    │   ├── SidebarContext.tsx
    │   ├── AdminLayout.tsx
    │   ├── AdminHeader.tsx
    │   ├── AdminBreadcrumb.tsx
    │   ├── AdminUserMenu.tsx
    │   ├── NotificationBell.tsx (→ notifications/)
    │   ├── AdminPageWrapper.tsx
    │   └── AdminDetailLayout.tsx
    │
    ├── shared/                  # Cross-domain reusables
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
    ├── dashboard/               # KPI widgets
    ├── products/                # Product form sections
    ├── catalog/                 # Category + brand modals
    ├── orders/                  # Order detail components
    ├── users/                   # Customer + employee panels
    ├── employees/               # Employee management
    ├── inventory/               # Stock management
    ├── promotions/              # Promotion forms
    ├── flash-sale/              # Flash sale scheduler
    ├── reports/                 # Analytics charts
    ├── support/                 # Ticket management
    ├── notifications/           # Notification components
    ├── roles/                   # Role/permission management
    ├── audit-logs/              # Audit log viewer
    ├── content/                 # CMS content forms
    ├── variant/                 # Product variant components
    ├── variantEdit/             # Variant edit forms
    └── settings/                # Store config forms
```

---

## Data Layer (src/)

```
src/
├── services/           # API abstraction (one per domain)
│   ├── product.service.ts
│   ├── variant.service.ts
│   ├── category.service.ts
│   ├── category_spec.service.ts
│   ├── brand.service.ts
│   ├── order.service.ts
│   ├── inventory.service.ts
│   ├── promotion.service.ts
│   ├── promotionEngine.ts
│   ├── coupon.service.ts
│   ├── flash-sale.service.ts
│   ├── customer.service.ts
│   ├── employee.service.ts
│   ├── role.service.ts
│   ├── ticket.service.ts
│   ├── review.service.ts
│   ├── report.service.ts
│   ├── image.service.ts
│   ├── content.service.ts
│   ├── homepage.service.ts
│   ├── loyalty.service.ts
│   ├── notification.service.ts
│   ├── transaction.service.ts
│   ├── audit-log.service.ts
│   ├── spec_group.service.ts
│   └── buildpc.service.ts
│
├── types/              # Domain type contracts
│   └── {domain}.types.ts (one per service)
│
├── store/              # Zustand client state
│   ├── auth.store.tsx
│   └── (cart/checkout/compare — shared pattern)
│
└── lib/
    ├── api.ts          # Axios instance with JWT interceptor
    ├── auth.ts         # NextAuth admin config
    ├── format.ts       # formatVND(), formatDate(), formatNumber()
    ├── design-tokens.ts # JS tokens for charts
    ├── validators/     # Zod schemas per domain
    └── auth-validation.ts
```

---

## Placement Rules

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
