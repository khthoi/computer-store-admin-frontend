# CODING RULES — computer-store-admin

## RULE 1: UI Primitives from local src/components/ui/
`@computer-store/ui` is NOT installed. Import all base UI locally:
```ts
import { Button } from "@/src/components/ui/Button";
import { Modal }  from "@/src/components/ui/Modal";
```
Never recreate components that exist in `src/components/ui/`.

## RULE 2: Role check on every protected page
Option A (preferred): `proxy.ts` route-level guard (Next.js 16 — replaces `middleware.ts`).
`src/proxy.ts` already exists and protects all `(dashboard)/` routes. Add role-specific
checks there. Do NOT create `middleware.ts` — it conflicts with `proxy.ts`.
Option B: `useRoleGuard()` hook in page component.
NEVER skip role check assuming proxy handles it alone — double-check.

## RULE 3: No ISR, no static — admin data must always be fresh
```ts
// DO: React Query with staleTime: 30000
// DO: export const dynamic = "force-dynamic" on admin pages
// DON'T: export const revalidate = 3600
// DON'T: { cache: "force-cache" } in fetch
```

## RULE 4: DataTable from admin package
```ts
import { DataTable } from "@/src/components/admin/DataTable";
// NEVER build a custom table from <table> tags
```

## RULE 5: Form validation is mandatory
Every admin form MUST use `react-hook-form` + Zod schema.
Zod schemas go in: `src/lib/validators/{resource}.ts`

## RULE 6: Destructive actions require ConfirmDialog
```ts
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
// Delete, reject, ban, close: always wrap in ConfirmDialog
// Extra-destructive actions: use requiredPhrase for typed confirmation
```

## RULE 7: Violet accent — sidebar/header ONLY
- `--sidebar-bg` / `accent-600` / `accent-700`: AdminSidebar + AdminHeader only
- Content area buttons use `primary-600` (blue)
- Never use violet in form fields, tables, or content sections

## RULE 8: DataTable loading/error/empty states always present
```tsx
<DataTable isLoading={isLoading} error={error} emptyText="Không có kết quả" />
```

## RULE 9: No client-side role escalation
Role comes from JWT (server-verified). Never compute role client-side.
Use `const { user } = useSession()` — trust `session.user.role` only.

## RULE 10: Export reports via backend endpoint
Never generate PDF/Excel in the browser.
```ts
// Trigger: GET /admin/reports/export?type=revenue&format=excel → file download
```

## RULE 11: Icons
Primary: `@heroicons/react/24/outline` (default) and `/24/solid` (emphasis).
Allowed secondary: `react-icons` for icons not available in Heroicons.
Never paste raw `<svg>` code.

## RULE 12: Vietnamese UI text
All labels, placeholders, tooltips, error messages must be in Vietnamese.
Use `formatVND()` from `@/src/lib/format.ts` for all monetary values.

## RULE 13: Service = transport only — Component owns all UI defaults

Services trong `src/services/*.service.ts` là **pure transport layer** — chúng chỉ được phép build query string, gọi `apiFetch`, và map response về typed interface. Mọi quyết định mang tính UI (page size, debounce delay) phải nằm ở component.

```ts
// ✗ SAI — limit = 10 là quyết định UI, không thuộc service
export async function getList(params: Params = {}) {
  const { page = 1, limit = 10 } = params;
  qs.set("limit", String(limit));
}

// ✓ ĐÚNG — service chỉ forward, không có UI default
export async function getList(params: Params = {}) {
  const { page = 1, limit } = params;
  qs.set("page", String(page));
  if (limit) qs.set("limit", String(limit)); // chỉ gửi khi component cung cấp
}
```

Component định nghĩa `PAGE_SIZE` — **single source of truth**:

```ts
const PAGE_SIZE = 25; // thay đổi ở đây → áp dụng toàn bộ component
// ...
await getList({ page, limit: PAGE_SIZE, status });
```

## RULE 14: No loading flash khi chuyển trang — dùng handler-based pattern

Khi component có server-side pagination, `setLoading(true)` chỉ được gọi khi **filter / search / sort / pageSize** thay đổi — không phải khi chỉ đổi `page`.

**❌ Anti-pattern (BUG): hai effect riêng biệt**

```ts
// KHÔNG dùng — pattern này có race condition!
useEffect(() => { setPage(1); }, [search, statusFilter, sortKey, sortDir, pageSize]);
useEffect(() => {
  const isPageOnly = nonPageKey === prevNonPageKey.current;
  // BUG: khi user ở page > 1 và sort, Effect A fire setPage(1) → Effect B chạy LẦN 2
  // với prevNonPageKey đã cập nhật từ lần 1 → isPageOnly=true sai → không show loading
}, [page, ...]);
```

**✅ Đúng: handler-based pattern + `nonPageChangedRef`**

```ts
// Ref flag — set bởi handlers, clear bởi fetch effect
const nonPageChangedRef = useRef(false);

// Mỗi handler thay đổi sort/filter/search/pageSize:
const handleSortChange = useCallback((key, dir) => {
  nonPageChangedRef.current = true; // đánh dấu trước khi setState
  setSortKey(key);
  setSortDir(dir);
  setPage(1);           // ← cùng batch với setSortKey/setSortDir → 1 render duy nhất
}, []);
// Tương tự cho: handleStatusFilterChange, handleCategoryFilterChange,
//               handleSearchChange, handlePageSizeChange

// Fetch effect — duy nhất, không cần effect reset page riêng:
useEffect(() => {
  const isNonPageChange = nonPageChangedRef.current;
  nonPageChangedRef.current = false; // clear ngay để run tiếp không bị nhiễm

  // ...
  if (isNonPageChange) setLoading(true); // ← chỉ show loading khi filter/sort/search đổi
}, [page, pageSize, search, statusFilter, sortKey, sortDir]);
```

**Tại sao hoạt động:** Tất cả setState trong cùng 1 handler được React 18 batch → 1 render duy nhất → fetch effect chỉ chạy **1 lần** → `nonPageChangedRef` đọc đúng giá trị không bị nhiễm bởi run thứ 2.

Áp dụng rule này cho **mọi DataTable có server-side pagination** trong project.

## RULE 15: Sortable DataTable columns — contract với backend

`DataTable` dùng **column `key`** làm giá trị `sortBy` gửi lên API. Key phải là chuỗi **tiếng Anh** khớp với alias mà backend `allowedSortBy` map sang.

**Frontend — column definition:**
```ts
// key "name" → frontend gửi ?sortBy=name&sortOrder=asc lên API
{ key: "name",       header: "Sản phẩm",  sortable: true }
{ key: "updatedAt",  header: "Updated",   sortable: true }
{ key: "totalStock", header: "Tồn kho",   sortable: true }
```

**Backend — search service phải có alias tương ứng:**
```ts
// src/modules/<feature>/<feature>-search.service.ts
const allowedSortBy: Record<string, string> = {
  // Backend-native keys (giữ để backward compat)
  ngayTao:     'p.ngayTao',
  ngayCapNhat: 'p.ngayCapNhat',
  tenSanPham:  'p.tenSanPham',
  // Frontend-facing aliases — phải khớp với column key ở DataTable
  name:        'p.tenSanPham',
  updatedAt:   'p.ngayCapNhat',
  createdAt:   'p.ngayTao',
};
const orderCol = allowedSortBy[sortBy] ?? 'p.ngayCapNhat'; // default = updatedAt
qb.orderBy(orderCol, sortOrder.toUpperCase() as 'ASC' | 'DESC');
```

**Aggregate sort** (ví dụ `totalStock` = SUM của cột trong bảng join): dùng `addSelect` subquery thay vì column thẳng:
```ts
if (sortBy === 'totalStock') {
  qb.addSelect(
    '(SELECT COALESCE(SUM(_pv.so_luong_ton), 0) FROM phien_ban_san_pham _pv WHERE _pv.san_pham_id = p.id)',
    'total_stock_calc',
  );
  qb.orderBy('total_stock_calc', sortOrder.toUpperCase() as 'ASC' | 'DESC');
}
```

**Khi thêm sortable column mới:** cập nhật `allowedSortBy` ở backend cùng lúc — nếu chỉ thêm `sortable: true` ở frontend mà không thêm alias backend, sort sẽ âm thầm fallback về default mà không báo lỗi.

## Anti-patterns
```
✗ Import from "@computer-store/ui" — not installed
✗ Custom <table> instead of DataTable
✗ ISR/cache on any admin page
✗ Hide UI as sole auth check — backend must also check
✗ Violet outside AdminSidebar/AdminHeader
✗ Form without Zod validation
✗ Destructive action without ConfirmDialog
✗ Client-side PDF/Excel generation
✗ Server data in Zustand store
✗ New admin components under src/components/layout/ or other non-admin dirs
✗ Pass active prop to AdminSidebar — active state is auto from usePathname()
```
