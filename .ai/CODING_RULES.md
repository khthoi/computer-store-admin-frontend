# CODING RULES — computer-store-admin

## RULE 1: UI primitives come from the local `src/components/ui/`
`@computer-store/ui` is NOT installed. Import every primitive locally:
```ts
import { Button } from "@/src/components/ui/Button";
import { Modal }  from "@/src/components/ui/Modal";
```
Never recreate a component that already exists under `src/components/ui/`.

## RULE 2: Role check on every protected page
- Preferred: `src/proxy.ts` route guard (Next.js 16 — replaces `middleware.ts`). Add role-specific checks there. Do NOT create `middleware.ts` — it conflicts with `proxy.ts`.
- Fallback: `useRoleGuard()` hook for component-level gating.
Always assume the backend enforces authorization too; UI gating is never the sole check.

## RULE 3: No ISR, no static — admin data must always be fresh
```ts
export const dynamic = "force-dynamic"; // every admin page
// Do NOT use export const revalidate = ... or { cache: "force-cache" }.
```

## RULE 4: DataTable from the admin package
```ts
import { DataTable } from "@/src/components/admin/DataTable";
```
Never build a custom `<table>` from scratch.

## RULE 5: Form validation is mandatory
Every admin form uses `react-hook-form` + Zod. Schemas live in `src/lib/validators/{resource}.ts`.

## RULE 6: Destructive actions require ConfirmDialog
```ts
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
```
Delete, reject, ban, and close actions are wrapped in `ConfirmDialog`. Extra-destructive actions can require a typed phrase (`requiredPhrase` prop).

## RULE 7: Violet accent — sidebar / header ONLY
- `--sidebar-bg`, `accent-600`, `accent-700`: AdminSidebar + AdminHeader only.
- Content area CTAs use `primary-600` (blue).
- Never use violet inside form fields, tables, or content sections.

## RULE 8: DataTable always renders loading / error / empty states
```tsx
<DataTable isLoading={isLoading} error={error} emptyText="Không có kết quả" />
```

## RULE 9: No client-side role escalation
Role comes from the JWT (server-verified). Read it from the auth Context store; never compute it client-side.

## RULE 10: Export reports via the backend endpoint
Never generate PDF / Excel in the browser. Trigger a backend download:
```ts
// GET /admin/reports/export?type=revenue&format=excel → file download
```

## RULE 11: Icons
Primary: `@heroicons/react/24/outline` (default) and `/24/solid` (emphasis).
Allowed secondary: `react-icons` for icons not available in Heroicons.
Never paste raw `<svg>` markup.

## RULE 12: Vietnamese UI text
All labels, placeholders, tooltips, and error messages must be in Vietnamese (with diacritics). Use `formatVND()` from `@/src/lib/format.ts` for monetary values.

## RULE 13: Service = transport only — components own all UI defaults
Services in `src/services/*.service.ts` build the query string, call `apiFetch`, and map the response. They never set UI defaults like `limit = 10`.

```ts
// ✗ Wrong — limit default belongs to the component, not the service
export async function getList(params: Params = {}) {
  const { page = 1, limit = 10 } = params;
  qs.set("limit", String(limit));
}

// ✓ Right — forward only what the caller passes
export async function getList(params: Params = {}) {
  const { page = 1, limit } = params;
  qs.set("page", String(page));
  if (limit) qs.set("limit", String(limit));
}
```

Components declare a single source of truth:
```ts
const PAGE_SIZE = 25;
await getList({ page, limit: PAGE_SIZE, status });
```

## RULE 14: No loading flash on page change — use the handler-based pattern
With server-side pagination, only call `setLoading(true)` when **filter / search / sort / pageSize** changes — never when only `page` changes.

❌ Anti-pattern: two effects (race condition on `prevNonPageKey`).

✅ Correct: a `nonPageChangedRef` flag set inside each handler:
```ts
const nonPageChangedRef = useRef(false);

const handleSortChange = useCallback((key, dir) => {
  nonPageChangedRef.current = true;
  setSortKey(key);
  setSortDir(dir);
  setPage(1);
}, []);
// Same shape for status / category / search / pageSize handlers.

useEffect(() => {
  const isNonPageChange = nonPageChangedRef.current;
  nonPageChangedRef.current = false;
  if (isNonPageChange) setLoading(true);
  // ... fetch
}, [page, pageSize, search, statusFilter, sortKey, sortDir]);
```
React 18 batches the `setState` calls inside one handler into a single render, so the fetch effect runs once with the correct flag. Apply this pattern to every DataTable that uses server-side pagination.

## RULE 15: Sortable DataTable columns — contract with the backend
DataTable uses the column `key` as the `sortBy` value sent to the API. Keys must be English strings that match an alias in the backend's `allowedSortBy` map.

Frontend column definitions:
```ts
{ key: "name",       header: "Sản phẩm", sortable: true }
{ key: "updatedAt",  header: "Updated",  sortable: true }
{ key: "totalStock", header: "Tồn kho",  sortable: true }
```

Backend search service (e.g. `<feature>-search.service.ts`):
```ts
const allowedSortBy: Record<string, string> = {
  ngayTao:     "p.ngayTao",
  ngayCapNhat: "p.ngayCapNhat",
  tenSanPham:  "p.tenSanPham",
  // Frontend-facing aliases — must match the DataTable column keys
  name:        "p.tenSanPham",
  updatedAt:   "p.ngayCapNhat",
  createdAt:   "p.ngayTao",
};
const orderCol = allowedSortBy[sortBy] ?? "p.ngayCapNhat"; // default = updatedAt
qb.orderBy(orderCol, sortOrder.toUpperCase() as "ASC" | "DESC");
```

For aggregate sorts (e.g. `totalStock` = SUM across joined rows), add a select expression and order by its alias instead of a raw column.

When adding a new sortable column, update `allowedSortBy` in the backend at the same time. Without a matching alias, the backend silently falls back to the default sort.

## Anti-patterns
```
✗ Import from "@computer-store/ui" — not installed
✗ Custom <table> instead of DataTable
✗ ISR / cache on any admin page
✗ UI hiding as the sole auth check — backend must also enforce
✗ Violet outside AdminSidebar / AdminHeader
✗ Form without Zod validation
✗ Destructive action without ConfirmDialog
✗ Client-side PDF / Excel generation
✗ Storing server data in a global store (use component state + service calls)
✗ New admin components under src/components/layout/ or other non-admin dirs
✗ Passing an `active` prop to AdminSidebar — active state is derived from usePathname()
```
