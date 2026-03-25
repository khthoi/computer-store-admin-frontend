computer-store-admin/
├── .ai/                              # AI instruction files (10 .md files)
│   ├── README.md
│   ├── PROJECT_CONTEXT.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── CODING_RULES.md
│   ├── UI_DESIGN_SYSTEM.md
│   ├── COMPONENT_GUIDELINES.md
│   ├── FEATURE_SPEC.md
│   ├── API_CONTRACT.md
│   ├── FOLDER_STRUCTURE.md
│   └── AI_DEVELOPMENT_GUIDE.md
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Public — not protected
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx            # Minimal layout (no sidebar)
│   │   ├── (dashboard)/              # Protected by middleware
│   │   │   ├── layout.tsx            # AdminShell: sidebar + header
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx          # AD-01 Overview
│   │   │   │   └── loading.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # AD-02 Product list
│   │   │   │   ├── new/page.tsx      # AD-03 Add product
│   │   │   │   └── [id]/edit/page.tsx # AD-03 Edit product
│   │   │   ├── categories/page.tsx   # AD-04
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # AD-05 Order list
│   │   │   │   └── [id]/page.tsx     # AD-06 Order detail
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx          # AD-09 Stock overview
│   │   │   │   └── import/page.tsx   # AD-08 Import stock
│   │   │   ├── promotions/
│   │   │   │   ├── page.tsx          # AD-10 Promotions
│   │   │   │   └── coupons/page.tsx  # AD-11 Coupons
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx          # AD-12 Customer list
│   │   │   │   └── [id]/page.tsx     # Customer detail
│   │   │   ├── returns/
│   │   │   │   ├── page.tsx          # AD-13 Return requests
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── support/
│   │   │   │   ├── page.tsx          # AD-14 Ticket list
│   │   │   │   └── [id]/page.tsx     # Ticket detail + reply
│   │   │   ├── reviews/page.tsx      # AD-15 Review moderation
│   │   │   ├── reports/page.tsx      # AD-16 Business reports
│   │   │   └── staff/page.tsx        # Staff + roles (Admin only)
│   │   ├── api/
│   │   │   └── [...path]/route.ts    # BFF proxy to NestJS
│   │   ├── globals.css
│   │   └── layout.tsx                # Root (fonts, providers)
│   ├── components/
│   │   ├── ui/                       # Local UI primitives (Input, Modal, Select, etc.)
│   │   │   └── [Accordion, Alert, Avatar, Badge, Button, Checkbox, DateInput,
│   │   │      Drawer, Input, Lightbox, Modal, PasswordInput, Popover, Radio,
│   │   │      Select, Skeleton, Slider, Spinner, Tabs, Textarea, Toast, Toggle, Tooltip]
│   │   │
│   │   ├── admin/                    # All admin-specific components
│   │   │   │
│   │   │   ├── [root]                # Pre-existing admin primitives
│   │   │   │   ├── AdminSidebar.tsx  # ★ REDESIGNED — usePathname active, Link items,
│   │   │   │   │                     #   violet-700, localStorage collapse, 10 nav domains
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   ├── FilterDropdown.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── StatusBadge.tsx
│   │   │   │
│   │   │   ├── layout/               # Shell layout components
│   │   │   │   ├── SidebarContext.tsx      # Context + localStorage collapse/mobile state
│   │   │   │   ├── AdminLayout.tsx         # Root shell: sidebar + header + main
│   │   │   │   ├── AdminHeader.tsx         # Top bar: hamburger, breadcrumb, bell, avatar
│   │   │   │   ├── AdminBreadcrumb.tsx     # Dynamic path-derived breadcrumb
│   │   │   │   ├── AdminUserMenu.tsx       # Avatar dropdown: profile, role, sign out
│   │   │   │   ├── NotificationBell.tsx    # Bell icon + unread badge + panel
│   │   │   │   ├── AdminPageWrapper.tsx    # Per-page: title + CTA slot + padding
│   │   │   │   └── AdminDetailLayout.tsx   # Split-pane: 1fr / 320px grid
│   │   │   │
│   │   │   ├── shared/               # Cross-domain reusable components
│   │   │   │   ├── AdminSearchBar.tsx      # Controlled search input with debounce
│   │   │   │   ├── TableToolbar.tsx        # Search + filters + actions/BulkActionBar
│   │   │   │   ├── BulkActionBar.tsx       # Selection count + configurable actions
│   │   │   │   ├── AdminDateRangePicker.tsx # Date range with presets (7d/30d/month)
│   │   │   │   ├── AdminEmptyState.tsx     # no-data / no-results variants
│   │   │   │   ├── ExportButton.tsx        # CSV / Excel / PDF dropdown trigger
│   │   │   │   ├── ImportModal.tsx         # 3-step CSV import wizard
│   │   │   │   ├── InlineEditField.tsx     # Click-to-edit label → input
│   │   │   │   ├── MediaUploadPanel.tsx    # Multi-image grid with reorder + progress
│   │   │   │   ├── AuditLogViewer.tsx      # Timeline of actor-attributed change events
│   │   │   │   ├── RolePermissionSelector.tsx # Role panel + permission matrix toggles
│   │   │   │   └── ColumnConfigurator.tsx  # Show/hide + reorder DataTable columns
│   │   │   │
│   │   │   ├── dashboard/            # Dashboard overview widgets
│   │   │   │   ├── RevenueLineChart.tsx    # Recharts LineChart, 7d/30d/90d toggle
│   │   │   │   ├── TopProductsBarChart.tsx # Horizontal BarChart, units/revenue toggle
│   │   │   │   ├── OrdersByStatusDonut.tsx # PieChart donut, centre total count
│   │   │   │   ├── RecentOrdersTable.tsx   # Compact last-10-orders table (server)
│   │   │   │   └── LowStockAlertList.tsx   # Top-5 low-stock items with restock CTA
│   │   │   │
│   │   │   ├── products/             # Product create/edit form sections
│   │   │   │   ├── ProductFormTabs.tsx     # Tab orchestrator with dirty-state dots
│   │   │   │   ├── ProductGeneralForm.tsx  # Name, SKU, brand, category, tags, RTE
│   │   │   │   ├── ProductVariantsForm.tsx # Attribute axis builder + variant matrix
│   │   │   │   ├── ProductSpecificationsForm.tsx # Spec group rows, drag reorder
│   │   │   │   ├── ProductSEOForm.tsx      # Meta title/desc, slug, SERP preview
│   │   │   │   ├── ProductStatusPanel.tsx  # Publish/draft/schedule sidebar card
│   │   │   │   └── ProductBulkEditModal.tsx # Bulk field update for selected rows
│   │   │   │
│   │   │   ├── catalog/              # Category & brand management
│   │   │   │   ├── CategoryTreeView.tsx    # Recursive accordion tree, drag reorder
│   │   │   │   ├── CategoryFormModal.tsx   # Create/edit category modal
│   │   │   │   └── BrandFormModal.tsx      # Create/edit brand modal
│   │   │   │
│   │   │   ├── orders/               # Order detail + actions
│   │   │   │   ├── OrderDetailPanel.tsx    # Header, customer, line items, totals
│   │   │   │   ├── OrderStatusStepper.tsx  # Horizontal lifecycle stepper + advance btn
│   │   │   │   ├── OrderShippingPanel.tsx  # Carrier, tracking, address, track link
│   │   │   │   ├── OrderRefundModal.tsx    # 3-step: items → method → confirm
│   │   │   │   └── OrderNotesPanel.tsx     # Internal staff notes thread
│   │   │   │
│   │   │   ├── users/                # Customer & staff management
│   │   │   │   ├── UserDetailPanel.tsx     # Profile header + tabbed detail view
│   │   │   │   ├── UserStatusPanel.tsx     # Suspend / reactivate / delete controls
│   │   │   │   ├── StaffFormModal.tsx      # Invite/create staff with role picker
│   │   │   │   └── CustomerOrderHistoryList.tsx # Compact order list in UserDetailPanel
│   │   │   │
│   │   │   ├── inventory/            # Stock management
│   │   │   │   ├── InventoryStockTable.tsx # Inline-editable stock + threshold table
│   │   │   │   ├── StockAdjustmentModal.tsx # Reason-coded stock change with audit
│   │   │   │   ├── WarehouseLocationPicker.tsx # Cascading warehouse/zone/aisle select
│   │   │   │   └── LowStockRulesForm.tsx   # Per-product thresholds + alert config
│   │   │   │
│   │   │   ├── promotions/           # Promotion create/edit
│   │   │   │   ├── PromotionFormTabs.tsx   # Tab orchestrator (General/Rules/…/Stats)
│   │   │   │   ├── DiscountRuleBuilder.tsx # Visual condition + discount value builder
│   │   │   │   ├── CouponCodeManager.tsx   # Single / bulk-generate coupon codes
│   │   │   │   ├── FlashSaleScheduler.tsx  # Time + per-product flash pricing table
│   │   │   │   └── PromotionApplicabilityPicker.tsx # Scope: all/products/categories/users
│   │   │   │
│   │   │   ├── reports/              # Analytics charts & tables
│   │   │   │   ├── ReportsFilterBar.tsx    # Date range + channel + category + compare
│   │   │   │   ├── SalesOverviewPanel.tsx  # 4 KPI StatCards with period delta
│   │   │   │   ├── RevenueByChannelChart.tsx # Stacked BarChart by channel
│   │   │   │   ├── ProductPerformanceTable.tsx # Sortable product metrics table
│   │   │   │   ├── CustomerAcquisitionChart.tsx # AreaChart new vs returning
│   │   │   │   └── OrderFulfillmentMetricsPanel.tsx # Fulfillment KPI cards
│   │   │   │
│   │   │   ├── support/              # Ticket management
│   │   │   │   ├── TicketListToolbar.tsx   # Domain-specific filter bar for ticket queue
│   │   │   │   ├── TicketDetailView.tsx    # Chat thread + reply composer + meta panel
│   │   │   │   ├── TicketMetaPanel.tsx     # Status, priority, assignee, tags sidebar
│   │   │   │   └── TicketAssignModal.tsx   # Bulk assign to staff member
│   │   │   │
│   │   │   └── settings/             # Store configuration forms
│   │   │       ├── SettingsLayout.tsx      # Secondary nav sidebar for settings section
│   │   │       ├── SettingsNavLink.tsx     # Client sub-component: usePathname active
│   │   │       ├── GeneralSettingsForm.tsx # Store name, logo, currency, timezone
│   │   │       ├── PaymentMethodsManager.tsx # Enable/configure payment gateways
│   │   │       ├── ShippingRulesManager.tsx  # Zones, carriers, rate rules
│   │   │       ├── NotificationSettingsForm.tsx # Event × channel matrix
│   │   │       ├── TaxSettingsForm.tsx     # Regional VAT rules table
│   │   │       └── IntegrationsPanel.tsx   # Third-party service connect/disconnect
│   │   │
│   │   └── layout/                   # (legacy storefront references — not used in admin)
│   ├── hooks/
│   │   ├── useAuth.ts                # Admin session + role check
│   │   ├── useTable.ts               # DataTable state management
│   │   ├── useNotifications.ts       # Real-time alerts
│   │   └── useRoleGuard.ts           # Page-level role permission
│   ├── lib/
│   │   ├── api.ts                    # Axios (admin JWT)
│   │   ├── auth.ts                   # NextAuth admin config
│   │   ├── formatters.ts             # VND, dates, percentages
│   │   ├── permissions.ts            # Role → allowed actions map
│   │   └── validators.ts             # Zod schemas for admin forms
│   ├── services/
│   │   ├── product.service.ts        # Admin CRUD
│   │   ├── order.service.ts
│   │   ├── inventory.service.ts
│   │   ├── promotion.service.ts
│   │   ├── customer.service.ts
│   │   ├── ticket.service.ts
│   │   ├── review.service.ts
│   │   ├── report.service.ts
│   │   └── staff.service.ts
│   ├── stores/
│   │   ├── sidebar.store.ts          # Sidebar collapsed state
│   │   └── notification.store.ts     # Alert queue
│   └── types/
│       ├── product.types.ts
│       ├── order.types.ts
│       ├── inventory.types.ts
│       ├── staff.types.ts
│       ├── report.types.ts
│       └── api.types.ts
├── public/
├── middleware.ts                     # JWT guard + role check
├── CLAUDE.md
├── .cursorrules
├── tailwind.config.ts                # Extends shared + admin theme
├── tsconfig.json
├── next.config.ts
├── .env.example
└── package.json

# ADMIN PLACEMENT RULES

? New admin page
  → src/app/(dashboard)/{route}/page.tsx
  → src/app/(dashboard)/{route}/loading.tsx
  → Wrap content in <AdminPageWrapper title="..." action={<Button>}>
  → Add role check in middleware.ts OR useRoleGuard in page

? New DataTable page (most common pattern)
  → page.tsx uses DataTable from "@/src/components/admin/DataTable"
  → Wrap with <TableToolbar> for search + filters + export
  → service function in src/services/{resource}.service.ts
  → types in src/types/{resource}.types.ts
  → column definitions inline in page (unless reused elsewhere)

? New form (ProductForm, ImportForm, etc.)
  → src/components/admin/{domain}/{ResourceName}Form.tsx
  → Zod schema → src/lib/validators.ts
  → Uses react-hook-form + zod resolver
  → Detail pages: wrap in <AdminDetailLayout> for left/right split

? New chart
  → src/components/admin/dashboard/{ChartName}.tsx  (dashboard widgets)
  → src/components/admin/reports/{ChartName}.tsx    (reports section)
  → Use Recharts (never D3 or Chart.js)

? New modal (create/edit/confirm)
  → Use base <Modal> from "@/src/components/ui/Modal"
  → Destructive actions MUST use <ConfirmDialog> with requiredPhrase for extra-destructive
  → Multi-step flows (import, refund): implement step state inside the modal component

? New role-restricted action
  → Check role in middleware.ts (route-level)
  → Or: useRoleGuard hook (component-level)
  → Never rely on UI hiding alone — backend enforces roles too

? New settings page
  → src/app/(dashboard)/settings/{section}/page.tsx
  → Wraps automatically in <SettingsLayout> via settings/layout.tsx
  → Add a nav link entry to SettingsLayout.tsx + SettingsNavLink

? New list page with bulk actions
  → Use <TableToolbar> with BulkActionBar embedded (passes selectedCount)
  → Define actions: {label, icon, onClick, variant}[] per domain
  → Destructive bulk actions (Delete selected) require ConfirmDialog
