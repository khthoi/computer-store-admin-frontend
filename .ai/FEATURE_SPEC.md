# FEATURE SPECIFICATIONS — computer-store-admin

> For exact request / response shapes, read the matching controller and DTOs under
> `computer-store-backend/src/modules/<module>/` directly. The endpoints below are an index, not a contract.

## AD-01: Dashboard Overview
Route: `/` | Roles: All
Components:
- StatCard ×4 (revenue, orders, customers, low-stock count)
- RevenueLineChart — Recharts LineChart, 7d / 30d / 90d toggle
- TopProductsBarChart — horizontal BarChart, units / revenue toggle
- OrdersByStatusDonut — PieChart donut with total count in the center
- RecentOrdersTable — last 10 orders
- LowStockAlertList — top 5 low-stock items with a restock CTA

API: `GET /admin/dashboard/overview` (single endpoint returning KPIs + charts + recent orders + low-stock)

---

## AD-02 / 03: Product Management
Routes: `/products` | `/products/new` | `/products/:id/edit`
Roles: Staff, Admin
List: `TableToolbar + DataTable` (Image, Name, Category, Price, Stock, Status, Actions).
Form (AdminDetailLayout):
  - Left: ProductFormTabs → General, Variants, Media (MediaUploadPanel), SEO, Specifications
  - Right: ProductStatusPanel (publish / draft / schedule)

API:
- `GET / POST /admin/products`, `GET / PUT / DELETE /admin/products/:id`
- Variants: `POST /admin/products/:id/variants`, `PUT / DELETE /admin/products/variants/:variantId`, `PATCH /admin/products/:id/variants/:variantId/set-default`
- Clone: `POST /admin/products/:id/clone`, `POST /admin/products/:productId/variants/:variantId/clone`

Rules: Delete requires `ConfirmDialog`. Tabs show a dirty-state dot for unsaved sections.

---

## AD-04: Category & Brand Management
Routes: `/categories` | `/brands`
Roles: Staff, Admin
Categories: tree view (recursive accordion, drag-reorder) + CategoryFormModal.
Brands: DataTable + BrandFormModal.

API:
- `GET / POST /admin/categories`, `PUT / DELETE /admin/categories/:id`, `GET /admin/categories/tree`
- `GET / POST /admin/brands`, `PUT / DELETE /admin/brands/:id`

---

## AD-05 / 06: Order Management
Routes: `/orders` | `/orders/:id` | `/orders/returns` | `/orders/transactions`
Roles: Staff, Admin (Warehouse for fulfillment only)
List: TableToolbar + status-tab DataTable + AdminDateRangePicker.
Detail (AdminDetailLayout):
  - Left: OrderDetailPanel (header, customer, line items, totals)
  - Right: OrderStatusStepper, OrderShippingPanel, OrderNotesPanel, OrderRefundModal, AuditLogViewer

API:
- `GET /admin/orders`, `GET /admin/orders/:id`, `PUT /admin/orders/:id/status`
- Transactions: `GET /admin/transactions`, `GET /admin/transactions/stats`, `GET /admin/orders/:orderCode/transaction`

Status flow: `pending → confirmed → packing → shipping → delivered`; `cancelled` allowed only from `pending`.

---

## AD-07: Inventory Management
Routes: `/inventory` | `/inventory/items` | `/inventory/stock-in` | `/inventory/stock-out` | `/inventory/movements` | `/inventory/low-stock` | `/inventory/suppliers`
Roles: Warehouse, Admin
Overview: stock table (inline edit) + StockAdjustmentModal + WarehouseLocationPicker.
Stock-in: 3-step CSV import wizard or form.
Config: LowStockRulesForm (per-variant thresholds + alert settings).

API:
- `GET /admin/inventory`, `GET /admin/inventory/summary`
- `POST /admin/inventory/adjust`, `PATCH /admin/inventory/:variantId/thresholds`
- Imports: `GET / POST /admin/inventory/import`, `PUT /admin/inventory/import/:id/approve`
- History / forecast: `GET /admin/inventory/:variantId/history`, `GET /admin/inventory/forecast/reorder-suggestions`, `PATCH /admin/inventory/forecast/suggestions/:id/dismiss`
- Suppliers: `GET /admin/suppliers`

---

## AD-08: Promotions & Discounts
Routes: `/promotions` | `/promotions/new` | `/promotions/:id/edit` | `/promotions/coupons` | `/promotions/flash-sales` | `/promotions/earn-rules`
Roles: Staff, Admin
List: DataTable with Active / Upcoming / Ended tabs + BulkBar.
Form (AdminDetailLayout): PromotionFormTabs — General / Rules / Applicability / Schedule / Stats.

API:
- `GET / POST /admin/promotions`, `PUT / DELETE /admin/promotions/:id`
- `GET / POST /admin/coupons`, `POST /admin/coupons/generate`
- `GET / POST /admin/flash-sales`
- Loyalty: `GET /admin/loyalty/rules`, `POST /admin/loyalty/adjust`

---

## AD-09: Customer Management
Routes: `/customers` | `/customers/:id`
Roles: Staff, Admin (CSKH view-only)
List: TableToolbar + DataTable.
Detail (AdminDetailLayout):
  - Left: UserDetailPanel (avatar, stats, Orders / Addresses / Activity tabs)
  - Right: UserStatusPanel (Active / Suspended + suspend / reactivate / delete)

API: `GET /admin/customers`, `GET /admin/customers/:id`, `POST /admin/customers`, `PATCH /admin/customers/:id`, `DELETE /admin/customers/:id`. Customer order history via `GET /admin/orders?customerId=:id`.

---

## AD-10: Support Tickets
Routes: `/support` | `/support/:id`
Roles: CSKH, Admin
List: TicketListToolbar + DataTable (priority indicator) + TicketAssignModal.
Detail (AdminDetailLayout):
  - Left: TicketDetailView (chat thread, reply composer, close button)
  - Right: TicketMetaPanel (status, priority, assignee, tags) + AuditLogViewer

API:
- `GET /admin/tickets`, `GET /admin/tickets/:id`, `GET /admin/tickets/stats`
- `POST /admin/tickets`, `POST /admin/tickets/:id/messages`
- `PUT /admin/tickets/:id/assign`, `PUT /admin/tickets/:id/close`, `PUT /admin/tickets/:id/reopen`

SLA: tickets open for more than 24h render a warning indicator in the list.

---

## AD-11: Review Moderation
Route: `/reviews`
Roles: Staff, Admin
List: DataTable (Product, Reviewer, Rating, Content preview, Status, Actions).
Actions: Approve | Hide | Reply.
Filter: Pending / Approved / Hidden | by product | by rating (1–5).

API: `GET /admin/reviews?status=pending`, `PUT /admin/reviews/:id/approve|hide`, `POST /admin/reviews/:id/reply`.

---

## AD-12: Business Reports
Route: `/reports` | Roles: Admin only
Layout: ReportsFilterBar, SalesOverviewPanel (4 KPI StatCards with PoP deltas), RevenueLineChart, RevenueByChannelChart, TopProductsBarChart, ProductPerformanceTable, CustomerAcquisitionChart, OrderFulfillmentMetricsPanel, ExportButton.

API: `GET /admin/reports/revenue`, `GET /admin/reports/top-products`, `GET /admin/reports/inventory-health`, `GET /admin/reports/customers`, `GET /admin/reports/customers/summary`, `GET /admin/reports/export`.

---

## AD-13: Employees & Roles
Routes: `/employees` | `/employees/:id` | `/roles`
Roles: Admin only
Employees: DataTable + StaffFormModal (invite with RolePermissionSelector).
Roles: DataTable + permission matrix.

API: `GET / POST /admin/employees`, `GET / PUT / DELETE /admin/employees/:id`, `PUT /admin/employees/:id/roles`, `GET / PUT /admin/roles/:id`.

---

## AD-14: Content Management
Routes: `/content/banners` | `/content/homepage` | `/content/announcements` | `/content/pages` | `/content/faq` | `/content/navigation` | `/content/media` | `/content/buildpc`
Roles: Admin, Staff
Each sub-route has a list page plus a create / edit form.

API: `GET / POST /admin/banners`, `GET / POST /admin/homepage-sections`, `GET / POST /admin/pages`, `GET / POST /admin/faq/groups`, `GET / POST /admin/menus`, plus key-value `GET / PUT /admin/site-config/:key` (trust badges, category shortcuts, footer config, …).

---

## AD-15: Build PC (admin)
Route: `/content/buildpc`
Roles: Admin
Configures the PC builder slots and compatibility rules.

API: `GET / POST /admin/build-pc/slots`, `PUT / DELETE /admin/build-pc/slots/:id`, `PATCH /admin/build-pc/slots/reorder`, `GET / POST /admin/build-pc/rules`, `PUT / DELETE /admin/build-pc/rules/:id`.

---

## AD-16: Notifications
Route: handled inside content / settings flows.
API: `GET /admin/notifications`, `GET /admin/notifications/stats`, `POST /admin/notifications/broadcast`, `PATCH /admin/notifications/:id/cancel|retry`, `GET /admin/notifications/configs`, `PUT /admin/notifications/configs/:id`, `GET / PUT /admin/settings/notifications`.

---

## AD-17: Settings
Route: `/settings/*` | Roles: Admin only
Sub-pages: `general` · `payments` · `shipping` · `notifications` · `tax` · `integrations`.
Layout: SettingsLayout (secondary left nav) with active state detection via `SettingsNavLink`.

API: `GET / PUT /admin/settings/{section}` per sub-page.
