# FEATURE SPECIFICATIONS — computer-store-admin

## AD-01: Dashboard Overview
Route: `/dashboard` | Roles: All
Components:
- StatCard ×4 (revenue, orders, customers, low-stock count)
- RevenueLineChart — Recharts LineChart, 7d/30d/90d toggle
- TopProductsBarChart — Horizontal BarChart, units/revenue toggle
- OrdersByStatusDonut — PieChart donut with centre total count
- RecentOrdersTable — last 10 orders
- LowStockAlertList — top 5 low-stock items with restock CTA
API: `GET /admin/dashboard/stats` | `GET /admin/dashboard/revenue-chart?period=`
     `GET /admin/orders?limit=10&sort=-createdAt` | `GET /admin/inventory?lowStock=true`

---

## AD-02/03: Product Management
Routes: `/products` | `/products/new` | `/products/:id/edit`
Roles: Staff, Admin
List: TableToolbar + DataTable (Image, Name, Category, Price, Stock, Status, Actions)
      ProductBulkEditModal — bulk field update from BulkActionBar
Form (AdminDetailLayout):
  Left:  ProductFormTabs → General, Variants, Media (MediaUploadPanel), SEO, Specifications
  Right: ProductStatusPanel (publish/draft/schedule)
API: `GET/POST /admin/products` | `PUT/DELETE /admin/products/:id`
     `POST /admin/media/upload` (multipart)
Rules: Delete requires ConfirmDialog. Cannot delete if active orders exist.
       ProductFormTabs shows dirty-state dot on unsaved tabs.

---

## AD-04: Category & Brand Management
Routes: `/categories` | `/brands`
Roles: Staff, Admin
Categories: CategoryTreeView (recursive accordion, drag-reorder) + CategoryFormModal
Brands: DataTable + BrandFormModal
API: `GET /admin/categories` | `POST/PUT/DELETE /admin/categories/:id`
     `GET /admin/brands` | `POST/PUT/DELETE /admin/brands/:id`

---

## AD-05/06: Order Management
Routes: `/orders` | `/orders/:id`
Roles: Staff, Admin | Warehouse (fulfillment only)
List: TableToolbar + status-tab DataTable + AdminDateRangePicker
Detail (AdminDetailLayout):
  Left:  OrderDetailPanel (header, customer, line items, totals)
  Right: OrderStatusStepper + OrderShippingPanel (tracking InlineEditField)
         OrderNotesPanel + OrderRefundModal (3-step) + AuditLogViewer
Sub-routes: `/orders/returns` (return requests) | `/orders/transactions`
API: `GET /admin/orders` | `GET /admin/orders/:id`
     `PUT /admin/orders/:id/status` | `POST /admin/orders/:id/refund`
Status flow: pending → confirmed → packing → shipping → delivered
             (cancelled allowed from pending only)

---

## AD-07: Customer Management
Routes: `/customers` | `/customers/:id`
Roles: Staff, Admin | CSKH (view only)
List: TableToolbar + DataTable
Detail (AdminDetailLayout):
  Left:  UserDetailPanel (avatar, stats, Orders/Addresses/Activity tabs)
         CustomerOrderHistoryList (in Orders tab)
  Right: UserStatusPanel (Active/Suspended + suspend/reactivate/delete)
API: `GET /admin/customers` | `GET /admin/customers/:id`
     `PUT /admin/customers/:id/status {action}`

---

## AD-08/09: Inventory Management
Routes: `/inventory` | `/inventory/stock-in` | `/inventory/stock-out`
        `/inventory/items` | `/inventory/movements` | `/inventory/low-stock` | `/inventory/suppliers`
Roles: Warehouse, Admin
Overview: InventoryStockTable (inline edit) + StockAdjustmentModal + WarehouseLocationPicker
Stock-in: ImportModal (3-step CSV wizard) or form
Config: LowStockRulesForm (per-product thresholds + alert settings)
API: `GET /admin/inventory` | `POST /admin/inventory/adjust`
     `POST /admin/inventory/import` | `GET /admin/inventory/:productId/history`

---

## AD-10/11: Promotions & Discounts
Routes: `/promotions` | `/promotions/new` | `/promotions/:id/edit`
        `/promotions/coupons` | `/promotions/flash-sales` | `/promotions/earn-rules`
Roles: Staff, Admin
List: DataTable (Tabs: Active/Upcoming/Ended) + BulkActionBar
Form (AdminDetailLayout): PromotionFormTabs → General / Rules / Applicability / Schedule / Stats
  Rules tab: DiscountRuleBuilder + CouponCodeManager + FlashSaleScheduler
API: `GET|POST /admin/promotions` | `PUT|DELETE /admin/promotions/:id`
     `GET|POST /admin/coupons` | `POST /admin/coupons/generate`
     `GET|POST /admin/flash-sales`

---

## AD-12: Employees & Roles
Routes: `/employees` | `/employees/:id` | `/roles`
Roles: Admin only
Employees: DataTable + StaffFormModal (invite with RolePermissionSelector)
Roles: DataTable + role permission matrix management
API: `GET /admin/employees` | `POST /admin/employees/invite`
     `GET /admin/roles` | `PUT /admin/roles/:id`

---

## AD-13: Support Tickets
Routes: `/support` | `/support/:id`
Roles: CSKH, Admin
List: TicketListToolbar + DataTable (priority indicator) + TicketAssignModal
Detail (AdminDetailLayout):
  Left:  TicketDetailView (chat thread, reply composer, close button)
  Right: TicketMetaPanel (status, priority, assignee, tags) + AuditLogViewer
API: `GET /admin/tickets` | `GET /admin/tickets/:id`
     `PUT /admin/tickets/:id/assign` | `PUT /admin/tickets/:id/status`
     `POST /admin/tickets/:id/messages {content, isInternal}`
SLA: Tickets open > 24h → show warning indicator in list

---

## AD-14: Review Moderation
Route: `/reviews`
Roles: Staff, Admin
List: DataTable (Product, Reviewer, Rating, Content preview, Status, Actions)
Actions: Approve | Hide | Add staff reply
Filter: Pending / Approved / Hidden | By product | By rating (1–5)
API: `GET /admin/reviews?status=pending`
     `PUT /admin/reviews/:id/approve` | `PUT /admin/reviews/:id/hide`
     `POST /admin/reviews/:id/reply {content}`

---

## AD-15: Business Reports
Route: `/reports` | Roles: Admin only
Layout:
  ReportsFilterBar (date range + channel + category + compare-period)
  SalesOverviewPanel — 4 KPI StatCards with period-over-period deltas
  RevenueLineChart, RevenueByChannelChart, TopProductsBarChart
  ProductPerformanceTable, CustomerAcquisitionChart, OrderFulfillmentMetricsPanel
  ExportButton → GET /admin/reports/export?type=&format=excel|pdf
API: `GET /admin/reports/revenue` | `GET /admin/reports/top-products`
     `GET /admin/reports/inventory-value` | `GET /admin/reports/customers`

---

## AD-16: Content Management
Routes: `/content/banners` | `/content/homepage` | `/content/announcements`
        `/content/pages` | `/content/faq` | `/content/navigation`
        `/content/media` | `/content/buildpc`
Roles: Admin, Staff
Each sub-route: list page + create/edit form

---

## AD-17: Settings
Route: `/settings/*` | Roles: Admin only
Sub-pages: general | payments | shipping | notifications | tax | integrations
Layout: SettingsLayout (secondary left nav) + SettingsNavLink (active detection)
API: `GET|PUT /admin/settings/{section}` per sub-page
