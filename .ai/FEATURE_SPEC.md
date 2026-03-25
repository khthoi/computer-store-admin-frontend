# FEATURE SPECIFICATIONS — computer-store-admin

## AD-01: Dashboard Overview
Route: /dashboard  | Roles: All
Components (shared): StatCard x4
Components (local):
  RevenueLineChart      — Recharts LineChart, 7d/30d/90d toggle, violet line
  TopProductsBarChart   — Horizontal BarChart, units/revenue toggle, top 10
  OrdersByStatusDonut   — PieChart donut, centre total count, status legend
  RecentOrdersTable     — Server component, last 10 orders, StatusBadge
  LowStockAlertList     — Server component, top 5 low-stock, restock CTA
API: GET /admin/dashboard/stats
     GET /admin/dashboard/revenue-chart?period=30d
     GET /admin/orders?limit=10&sort=-createdAt
     GET /admin/inventory?lowStock=true&limit=5

## AD-02 + AD-03: Product Management
Routes: /products (list) | /products/new | /products/:id/edit
Roles: Staff, Admin
List:
  TableToolbar (AdminSearchBar + FilterDropdown + ExportButton + BulkActionBar)
  DataTable (columns: Image, Name, Category, Price, Stock, Status, Actions)
  ProductBulkEditModal — bulk field update triggered from BulkActionBar
Form (AdminDetailLayout):
  Left:  ProductFormTabs → ProductGeneralForm, ProductVariantsForm,
         MediaUploadPanel (Images tab), ProductSEOForm, ProductSpecificationsForm
         + inventory InlineEditField (stock/SKU quick-edit)
  Right: ProductStatusPanel (publish / draft / schedule)
API: GET /admin/products | POST /admin/products
     PUT /admin/products/:id | DELETE /admin/products/:id
     POST /admin/media/upload (multipart)
Rules: Delete requires ConfirmDialog. Cannot delete if has active orders.
       ProductFormTabs shows dirty-state dot on tab labels with unsaved changes.

## AD-04: Category & Brand Management
Routes: /categories | /brands
Roles: Staff, Admin
Categories:
  CategoryTreeView     — recursive accordion tree, product counts, drag-reorder siblings
  CategoryFormModal    — create/edit: name, slug, parent, thumbnail, display order
Brands:
  BrandFormModal       — create/edit: name, slug, logo, country, website
API: GET /admin/categories (tree) | POST/PUT/DELETE /admin/categories/:id
     GET /admin/brands | POST/PUT/DELETE /admin/brands/:id

## AD-05 + AD-06: Order Management
Routes: /orders (list) | /orders/:id (detail)
Roles: Staff, Admin | Warehouse (fulfillment actions only)
List:
  TableToolbar (AdminSearchBar + status/date FilterDropdown + AdminDateRangePicker + ExportButton)
  DataTable with status filter tabs
Detail (AdminDetailLayout):
  Left:  OrderDetailPanel (header, customer card, line items, totals)
  Right: OrderStatusStepper (lifecycle stepper + advance with ConfirmDialog)
         OrderShippingPanel (carrier, tracking InlineEditField, address)
         OrderNotesPanel (internal staff notes thread)
         OrderRefundModal (3-step: items → method → confirm) — triggered from action menu
         AuditLogViewer
API: GET /admin/orders?status=&page= | GET /admin/orders/:id
     PUT /admin/orders/:id/status {status, note}
     POST /admin/orders/:id/refund {items, method}
Rules: Status can only move forward (pending→confirmed→packing→shipping→delivered)
       Except: any status → cancelled (if allowed by business rule)
       Refund requires OrderRefundModal — never refund without confirmation summary.

## AD-07: User & Staff Management
Routes: /customers | /customers/:id | /staff
Roles: Admin (staff management), CSKH (customer view)
Customers list:  TableToolbar + DataTable
Customer detail (AdminDetailLayout):
  Left:  UserDetailPanel (avatar header, stats, Orders/Addresses/Activity tabs)
         CustomerOrderHistoryList (in Orders tab)
  Right: UserStatusPanel (Active/Suspended/Pending + suspend/delete controls)
Staff list:      DataTable (Staff tab)
Staff actions:   StaffFormModal (invite with RolePermissionSelector)
API: GET /admin/customers | GET /admin/customers/:id
     GET /admin/staff | POST /admin/staff/invite
     PUT /admin/customers/:id/status {action}

## AD-08 + AD-09: Inventory Management
Routes: /inventory | /inventory/import
Roles: Warehouse, Admin
Overview:
  TableToolbar + InventoryStockTable (inline stock/threshold edit)
  StockAdjustmentModal  — reason-coded adjustment with audit log entry
  WarehouseLocationPicker — cascading warehouse/zone/aisle select
Import: ImportModal (3-step CSV wizard) | legacy ImportForm
Config: LowStockRulesForm — per-product thresholds + alert channel settings
API: GET /admin/inventory?lowStock=&category=
     POST /admin/inventory/adjust {sku, type, qty, reason, note}
     POST /admin/inventory/import (creates PhieuNhapKho)
     GET /admin/inventory/:productId/history

## AD-10 + AD-11: Promotions & Discounts
Routes: /promotions | /promotions/new | /promotions/:id/edit | /promotions/coupons
Roles: Staff, Admin
List:   TableToolbar + DataTable (Tabs: Active/Upcoming/Ended)
        BulkActionBar: Deactivate selected, Delete selected
Form (AdminDetailLayout):
  Left:  PromotionFormTabs →
           General tab: name, type, status
           Rules tab: DiscountRuleBuilder (condition rows + discount section)
                      CouponCodeManager (when type = coupon)
                      FlashSaleScheduler (when type = flash_sale)
           Applicability tab: PromotionApplicabilityPicker (scope + item picker)
           Schedule tab: start/end AdminDateRangePicker + summary card
           Stats tab: read-only redemption count + revenue impact
  Right: promotion status panel (publish/draft/archive)
API: GET|POST /admin/promotions | GET|POST /admin/coupons
     PUT /admin/promotions/:id | DELETE /admin/promotions/:id
     POST /admin/coupons/generate {promotionId, count, prefix, suffixLen}

## AD-14: Support Ticket Handling
Routes: /support | /support/:id
Roles: CSKH, Admin
List:
  TicketListToolbar (search + status/priority/assignee/date + "My tickets" toggle)
  DataTable with priority indicator column
  TicketAssignModal — bulk assign from BulkActionBar
Detail (AdminDetailLayout):
  Left:  TicketDetailView (chat thread, reply composer, close-ticket button)
  Right: TicketMetaPanel (status, priority, assignee, customer info, tags)
         AuditLogViewer
API: GET /admin/tickets | GET /admin/tickets/:id
     PUT /admin/tickets/:id/assign {staffId}
     PUT /admin/tickets/:id/status {status}
     POST /admin/tickets/:id/messages {content, isInternal: bool}

## AD-15: Review Moderation
Route: /reviews
Roles: Staff, Admin
List: DataTable (Product, Reviewer, Rating, Content preview, Status, Actions)
Actions: Approve | Hide | Add staff reply
Filter: Pending / Approved / Hidden | By product | By rating
API: GET /admin/reviews?status=pending
     PUT /admin/reviews/:id/approve | PUT /admin/reviews/:id/hide
     POST /admin/reviews/:id/reply {content}

## AD-16: Business Reports
Route: /reports
Roles: Admin only
Layout:
  ReportsFilterBar (date range + channel + category + compare-period toggle)
  SalesOverviewPanel   — 4 KPI StatCards with period-over-period deltas
  RevenueLineChart     — reused from dashboard, driven by filter state
  RevenueByChannelChart — stacked BarChart: Online vs In-store
  TopProductsBarChart  — reused from dashboard
  ProductPerformanceTable — sortable product metrics DataTable
  CustomerAcquisitionChart — AreaChart new vs returning, daily/weekly toggle
  OrderFulfillmentMetricsPanel — fulfillment KPI cards
  ExportButton         — triggers backend export endpoint
Export: ExportButton → GET /admin/reports/export?type=&format=excel|pdf
API: GET /admin/reports/revenue?from=&to=
     GET /admin/reports/top-products?from=&to=&limit=
     GET /admin/reports/inventory-value
     GET /admin/reports/customers?from=&to=
     GET /admin/reports/fulfillment?from=&to=

## AD-17: Settings
Route: /settings/*
Roles: Admin only
Layout: SettingsLayout (secondary left nav) + SettingsNavLink (active detection)
Sub-pages and their form components:
  /settings/general       → GeneralSettingsForm (store name, logo, currency, timezone)
  /settings/payments      → PaymentMethodsManager (enable/configure gateways)
  /settings/shipping      → ShippingRulesManager (zones, carriers, rate rules)
  /settings/notifications → NotificationSettingsForm (event × channel matrix)
  /settings/tax           → TaxSettingsForm (regional VAT rules table)
  /settings/integrations  → IntegrationsPanel (Google Analytics, Facebook Pixel, etc.)
  /settings/staff         → redirect to /staff (StaffFormModal + RolePermissionSelector)
API: GET|PUT /admin/settings/general
     GET|PUT /admin/settings/payments
     GET|PUT /admin/settings/shipping
     GET|PUT /admin/settings/notifications
     GET|PUT /admin/settings/tax
     GET /admin/integrations | POST /admin/integrations/:id/connect
     DELETE /admin/integrations/:id (requires ConfirmDialog)
