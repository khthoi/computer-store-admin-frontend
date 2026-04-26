# API CONTRACT — computer-store-admin

> **Source of truth cho tất cả endpoints đang hoạt động thực tế trong backend.**
> Swagger đầy đủ: http://localhost:4000/api/docs
>
> **URL convention:**
> - Backend global prefix: `/api` (đã được `api.ts` thêm tự động)
> - Trong `apiFetch()`, truyền path **không có** `/api`: `apiFetch("/auth/admin/login")`
> - `NEXT_PUBLIC_API_URL` chỉ chứa origin: `http://localhost:4000`
>
> **Response envelope** (do `ResponseInterceptor` wrap, `apiFetch` tự unwrap `body.data`):
> ```ts
> { statusCode: number; message: "success"; data: T; timestamp: string }
> ```
> Service nhận payload bên trong trực tiếp — không cần unwrap thêm.

---

## Auth — `/auth`

> Tất cả auth endpoints là **Public** (không cần Bearer token).
> Refresh token được gửi/nhận qua HttpOnly cookie `refresh_token`.

```
POST /auth/admin/login          { email, password } → { accessToken, user }
POST /auth/login                { email, password } → customer login (không dùng cho admin)
POST /auth/refresh              (cookie refresh_token) → { accessToken }
POST /auth/logout               → 204 No Content
```

**Login response shape** (`POST /auth/admin/login`):
```ts
{
  accessToken: string;
  user: {
    id: string;
    code: string;
    email: string;
    fullName: string;
    avatar: string | null;
    roles: string[];   // ["admin"] | ["staff"] | ...
  }
}
```

---

## Profile — `/admin/me`

> Thông tin và tác vụ của nhân viên đang đăng nhập.

```
GET    /admin/me                          → NhanVien (profile của chính mình)
PATCH  /admin/me                          { fullName, phone, gender, dateOfBirth }
POST   /admin/me/change-password          { currentPassword, newPassword }
GET    /admin/me/confirm-password-change  (link từ email xác nhận)
POST   /admin/me/avatar                   multipart/form-data → { avatarUrl }
GET    /admin/me/audit-logs               → AuditLogEntry[]
```

---

## Dashboard — `/admin/dashboard`

```
GET  /admin/dashboard/overview   → DashboardOverview
```

**Response shape:**
```ts
{
  kpis: {
    revenue:       { value, changePercent, sparkline[] }
    orders:        { value, changePercent, sparkline[] }
    newCustomers:  { value, changePercent, sparkline[] }
    lowStockCount: { value, changePercent, sparkline[] }
  }
  revenueChart:  { date, revenue }[]
  topProducts:   { productId, name, unitsSold, revenue }[]
  ordersByStatus: { status, count }[]
  recentOrders:  { id, customerName, total, status, date }[]
  lowStock:      { productId, name, sku, currentStock, threshold }[]
}
```

---

## Products — `/admin/products`

```
GET    /admin/products                                      ?q&categoryId&brandId&minPrice&maxPrice&page&limit&sortBy&sortOrder
GET    /admin/products/:id
POST   /admin/products                                      CreateProductDto
PUT    /admin/products/:id                                  UpdateProductDto
DELETE /admin/products/:id
POST   /admin/products/:id/clone                            → Product (bản nhân bản)
POST   /admin/products/:id/variants                         CreateVariantDto
PUT    /admin/products/variants/:variantId                  UpdateVariantDto
DELETE /admin/products/variants/:variantId
POST   /admin/products/:productId/variants/:variantId/clone → ProductVariant
PATCH  /admin/products/:id/variants/:variantId/set-default  → 204
PUT    /admin/products/:id/variants/:variantId/specs        SaveSpecValuesDto
```

**Lưu ý quan trọng — field mapping:**

| Frontend field | Backend DB field | Map ở đâu |
|---|---|---|
| `status: "published"` | `trangThai: "DangBan"` | `product-response.dto.ts` — `mapProductStatus()` |
| `status: "draft"` | `trangThai: "Nhap"` | idem |
| `status: "archived"` | `trangThai: "NgungBan"` | idem |
| `id: string` | `id: number` | Backend DTO — `String(product.id)` |
| `name` | `tenSanPham` | Backend DTO |
| `category` | `danhMuc.tenDanhMuc` | Backend DTO |
| `brands[]` | `thuongHieus[].tenThuongHieu` | Backend DTO |

**Request body** (`POST /admin/products`):
```ts
{
  tenSanPham: string;       // tên sản phẩm
  maSanPham:  string;       // mã / slug
  slug?:      string;
  danhMucId:  number;       // ID danh mục
  trangThai:  "DangBan" | "Nhap" | "NgungBan";
  brandIds:   number[];     // mảng ID thương hiệu
}
```

**Response list shape** (`GET /admin/products`):
```ts
{
  data: ProductListResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```
Trong đó `ProductListResponse` match với `Product` trong `src/types/product.types.ts`.

---

## Categories — `/admin/categories`

```
GET    /admin/categories         ?flat=true (list) | không có flat (tree)
GET    /admin/categories/:id
POST   /admin/categories
PUT    /admin/categories/:id
DELETE /admin/categories/:id
```

> Public endpoint (không cần auth) cho frontend khách hàng: `GET /categories`

---

## Brands — `/admin/brands`

```
GET    /admin/brands             ?q&active&page&limit
GET    /admin/brands/:id
POST   /admin/brands
PUT    /admin/brands/:id
DELETE /admin/brands/:id
```

**Response item shape:**
```ts
{ id: string; tenThuongHieu: string; slug: string; logo?: string; ... }
```
> Map `tenThuongHieu` → `name` trong frontend service.

---

## Specifications — `/admin/specs`

```
GET    /admin/specs/groups
POST   /admin/specs/groups
PUT    /admin/specs/groups/:id
DELETE /admin/specs/groups/:id
GET    /admin/specs/types
POST   /admin/specs/types
PUT    /admin/specs/types/:id
DELETE /admin/specs/types/:id
POST   /admin/specs/category-groups        { categoryId, groupId }
DELETE /admin/specs/category-groups/:id
```

---

## Orders — `/admin/orders`

```
GET    /admin/orders             ?q&status&page&limit
GET    /admin/orders/:id
PUT    /admin/orders/:id/status  { status, note? }
```

> Refund / timeline / notes: chưa có endpoint riêng — xem Swagger để biết trạng thái hiện tại.

---

## Returns — `/admin/returns`

```
GET    /admin/returns            ?status&page
PUT    /admin/returns/:id/status { action: "approve" | "reject", note? }
GET    /admin/returns/:id/assets
```

---

## Inventory — `/admin/inventory`

```
GET    /admin/inventory/warehouses
GET    /admin/inventory                   ?page&limit
GET    /admin/inventory/:variantId/history
POST   /admin/inventory/adjust            { variantId, qty, type, note? }
GET    /admin/inventory/import            ?page
GET    /admin/inventory/import/:id
POST   /admin/inventory/import            multipart/form-data (CSV)
PUT    /admin/inventory/import/:id/approve
PUT    /admin/inventory/import/:id/reject
```

---

## Suppliers — `/admin/suppliers`

```
GET    /admin/suppliers
GET    /admin/suppliers/:id
POST   /admin/suppliers
PUT    /admin/suppliers/:id
DELETE /admin/suppliers/:id
```

---

## Customers — `/admin/customers`

```
GET    /admin/customers          ?q&status&page&limit
GET    /admin/customers/:id
PUT    /admin/customers/:id/status  { action: "suspend" | "reactivate" }
DELETE /admin/customers/:id
```

---

## Employees — `/admin/employees`

```
GET    /admin/employees          ?page&limit
GET    /admin/employees/:id
POST   /admin/employees
PUT    /admin/employees/:id
DELETE /admin/employees/:id
PUT    /admin/employees/:id/roles  { roleIds: string[] }
```

---

## Promotions — `/admin/promotions`

```
GET    /admin/promotions         ?status&type&page
GET    /admin/promotions/:id
POST   /admin/promotions
PUT    /admin/promotions/:id
DELETE /admin/promotions/:id
```

> Coupon: xem Swagger — hiện nằm trong promotions module.

---

## Flash Sales — `/admin/flash-sales`

```
GET    /admin/flash-sales
GET    /admin/flash-sales/:id
POST   /admin/flash-sales
PUT    /admin/flash-sales/:id
DELETE /admin/flash-sales/:id
```

---

## Loyalty — `/admin/loyalty`

```
GET    /admin/loyalty/rules
POST   /admin/loyalty/rules
PUT    /admin/loyalty/rules/:id
GET    /admin/loyalty/catalog
POST   /admin/loyalty/catalog
POST   /admin/loyalty/adjust     { customerId, points, reason }
```

---

## Reviews — `/admin/reviews`

```
GET    /admin/reviews            ?status&productId&variantId&rating&page
PUT    /admin/reviews/:id/approve
PUT    /admin/reviews/:id/reject
PUT    /admin/reviews/:id/hide
POST   /admin/reviews/:id/reply  { content }
GET    /admin/reviews/:id/messages
```

---

## Support Tickets — `/admin/tickets`

```
GET    /admin/tickets            ?status&priority&assigneeId&page
GET    /admin/tickets/:id
PUT    /admin/tickets/:id/assign   { staffId }
POST   /admin/tickets/:id/messages { content, isInternal?: boolean }
GET    /admin/tickets/:id/messages
PUT    /admin/tickets/:id/close
PUT    /admin/tickets/:id/reopen
```

---

## Reports — `/admin/reports`

```
GET    /admin/reports/revenue           ?from&to (ISO date)
GET    /admin/reports/top-products      ?from&to&limit
GET    /admin/reports/customers/summary ?from&to
GET    /admin/reports/customers         ?from&to
GET    /admin/reports/inventory-health
GET    /admin/reports/retention         ?from&to
GET    /admin/reports/job-logs
GET    /admin/reports/export            ?type&format=excel|pdf  → file download
```

---

## CMS — `/admin`

**Banners & Homepage:**
```
GET    /admin/banners
GET    /admin/banners/:id
POST   /admin/banners
PUT    /admin/banners/:id
DELETE /admin/banners/:id
GET    /admin/homepage-sections
GET    /admin/homepage-sections/:id
POST   /admin/homepage-sections
PUT    /admin/homepage-sections/:id
DELETE /admin/homepage-sections/:id
GET    /admin/popups
GET    /admin/popups/:id
POST   /admin/popups
PUT    /admin/popups/:id
DELETE /admin/popups/:id
```

**Pages & FAQ:**
```
GET    /admin/pages
GET    /admin/pages/:id
POST   /admin/pages
PUT    /admin/pages/:id
DELETE /admin/pages/:id
GET    /admin/faq/groups
POST   /admin/faq/groups
PUT    /admin/faq/groups/:id
DELETE /admin/faq/groups/:id
GET    /admin/faq/items
POST   /admin/faq/items
PUT    /admin/faq/items/:id
DELETE /admin/faq/items/:id
GET    /admin/menus
GET    /admin/menus/:id
POST   /admin/menus/:id/items
PUT    /admin/menus/:menuId/items/:itemId
DELETE /admin/menus/:menuId/items/:itemId
GET    /admin/site-config
PUT    /admin/site-config/:key
DELETE /admin/site-config/:key
```

---

## Media — `/admin/media`

```
POST   /admin/media/upload        multipart/form-data → { url, publicId, ... }
GET    /admin/media/folders
POST   /admin/media/folders
GET    /admin/media/folders/:id
PUT    /admin/media/folders/:id
DELETE /admin/media/folders/:id
GET    /admin/media               ?folderId&page
GET    /admin/media/:id
PATCH  /admin/media/:id/archive
DELETE /admin/media/:id
```

---

## Settings — `/admin/settings`

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
```

---

## Notifications — `/admin/notifications`

```
GET    /admin/notifications/configs
GET    /admin/notifications/configs/:id
POST   /admin/notifications/configs
PUT    /admin/notifications/configs/:id
DELETE /admin/notifications/configs/:id
```

---

## Audit Logs

> Lấy qua profile: `GET /admin/me/audit-logs` — không có endpoint global riêng.

---

## Common Response Shapes

```ts
// Paginated list (sau khi apiFetch unwrap body.data)
{ data: T[]; total: number; page: number; limit: number; totalPages: number }

// Single resource
T  (trực tiếp — apiFetch đã unwrap)

// Action thành công (create/update)
T  (entity vừa tạo/cập nhật)

// 204 No Content (delete, set-default, logout)
undefined

// Error (từ GlobalExceptionFilter — không qua ResponseInterceptor)
{ statusCode: number; message: string; error: string }
```

---

## Lưu ý tích hợp

- **Không có endpoint bulk riêng** cho products/variants → gọi sequential với `Promise.all`
- **Auth token** lưu trong cookie `auth_token` (không HttpOnly) → đọc bằng `document.cookie`
- **Refresh token** lưu trong cookie `refresh_token` (HttpOnly) → browser tự gửi khi `credentials: "include"`
- **Status values** của product/variant được map trong `product-response.dto.ts` — xem `mapProductStatus()` và `mapVariantStatus()`
- Mọi endpoint `/admin/*` đều cần `@Roles('admin', 'staff')` — gửi `Authorization: Bearer <token>`
