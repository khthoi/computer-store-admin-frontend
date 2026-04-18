# API CONTRACT — computer-store-admin

Base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:4000/api`)
All `/admin/*` endpoints require `Authorization: Bearer <JWT>` header.
All requests/responses use `Content-Type: application/json`.

## Authentication
```
POST /auth/login          { email, password } → { accessToken, user }
POST /auth/refresh        { refreshToken }   → { accessToken }
GET  /auth/me             → User + role
```

## Dashboard
```
GET  /admin/dashboard/stats              → { revenue, orders, customers, lowStockCount, deltas }
GET  /admin/dashboard/revenue-chart      ?period=7d|30d|90d → [{ date, revenue }]
```

## Products
```
GET    /admin/products           ?page&limit&search&category&status
POST   /admin/products           { name, sku, brandId, categoryId, price, … }
GET    /admin/products/:id
PUT    /admin/products/:id
DELETE /admin/products/:id
POST   /admin/media/upload        multipart/form-data → { url, publicId }
PATCH  /admin/products/bulk       { ids[], fields }
```

## Categories & Brands
```
GET    /admin/categories          → tree structure
POST   /admin/categories          { name, slug, parentId, thumbnail, order }
PUT    /admin/categories/:id
DELETE /admin/categories/:id
GET    /admin/brands
POST   /admin/brands              { name, slug, logo, country, website }
PUT    /admin/brands/:id
DELETE /admin/brands/:id
```

## Orders
```
GET    /admin/orders              ?status&page&limit&from&to&search
GET    /admin/orders/:id
PUT    /admin/orders/:id/status   { status, note }
POST   /admin/orders/:id/refund   { items[], method, reason }
GET    /admin/orders/:id/timeline
GET    /admin/orders/returns      ?status&page
PUT    /admin/orders/returns/:id  { action: "approve"|"reject", note }
GET    /admin/transactions        ?page&limit&from&to
```

## Inventory
```
GET    /admin/inventory                  ?lowStock&category&page
GET    /admin/inventory/:productId/history
POST   /admin/inventory/adjust           { sku, type: "in"|"out"|"adjust", qty, reason, note }
POST   /admin/inventory/import           multipart (CSV file) → PhieuNhapKho
GET    /admin/inventory/suppliers
POST   /admin/inventory/suppliers        { name, contact, … }
GET    /admin/inventory/movements        ?page&from&to
```

## Promotions & Coupons
```
GET    /admin/promotions          ?status&type&page
POST   /admin/promotions          { name, type, rules, applicability, startAt, endAt }
GET    /admin/promotions/:id
PUT    /admin/promotions/:id
DELETE /admin/promotions/:id
GET    /admin/coupons             ?promotionId&page
POST   /admin/coupons             { code, promotionId, maxUses }
POST   /admin/coupons/generate    { promotionId, count, prefix, suffixLen }
GET    /admin/flash-sales
POST   /admin/flash-sales         { productId, salePrice, startAt, endAt, stockLimit }
PUT    /admin/flash-sales/:id
```

## Customers
```
GET    /admin/customers           ?search&status&page
GET    /admin/customers/:id
PUT    /admin/customers/:id/status { action: "suspend"|"reactivate"|"delete" }
GET    /admin/customers/:id/orders
```

## Employees & Roles
```
GET    /admin/employees           ?page&role
POST   /admin/employees/invite    { email, name, role, permissions[] }
GET    /admin/employees/:id
PUT    /admin/employees/:id       { role, permissions[], status }
DELETE /admin/employees/:id
GET    /admin/roles
PUT    /admin/roles/:id           { permissions[] }
```

## Support Tickets
```
GET    /admin/tickets             ?status&priority&assignee&page
GET    /admin/tickets/:id
PUT    /admin/tickets/:id/assign  { staffId }
PUT    /admin/tickets/:id/status  { status: "open"|"in_progress"|"resolved"|"closed" }
POST   /admin/tickets/:id/messages { content, isInternal: bool }
```

## Reviews
```
GET    /admin/reviews             ?status&productId&rating&page
PUT    /admin/reviews/:id/approve
PUT    /admin/reviews/:id/hide
POST   /admin/reviews/:id/reply   { content }
```

## Reports
```
GET    /admin/reports/revenue         ?from&to&channel
GET    /admin/reports/top-products    ?from&to&limit
GET    /admin/reports/inventory-value
GET    /admin/reports/customers       ?from&to
GET    /admin/reports/fulfillment     ?from&to
GET    /admin/reports/export          ?type&format=excel|pdf → file download
```

## Settings
```
GET    /admin/settings/general
PUT    /admin/settings/general     { storeName, logo, currency, timezone }
GET    /admin/settings/payments
PUT    /admin/settings/payments
GET    /admin/settings/shipping
PUT    /admin/settings/shipping
GET    /admin/settings/notifications
PUT    /admin/settings/notifications
GET    /admin/settings/tax
PUT    /admin/settings/tax
GET    /admin/integrations
POST   /admin/integrations/:id/connect
DELETE /admin/integrations/:id
```

## Audit Logs
```
GET    /admin/audit-logs          ?entityType&entityId&actorId&from&to&page
```

## Common Response Shapes
```ts
// Paginated list
{ data: T[], total: number, page: number, limit: number, totalPages: number }

// Error
{ statusCode: number, message: string, error: string }

// Success mutation
{ success: true, data?: T }
```
