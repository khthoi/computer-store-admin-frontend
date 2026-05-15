# COMPONENT GUIDELINES — computer-store-admin

## Import paths

```ts
// UI primitives — local only (@computer-store/ui is NOT installed)
import { Button }       from "@/src/components/ui/Button";
import { Input }        from "@/src/components/ui/Input";
import { Modal }        from "@/src/components/ui/Modal";
import { Select }       from "@/src/components/ui/Select";
import { Badge }        from "@/src/components/ui/Badge";

// Admin components
import { DataTable }      from "@/src/components/admin/DataTable";
import { StatCard }       from "@/src/components/admin/StatCard";
import { StatusBadge }    from "@/src/components/admin/StatusBadge";
import { ConfirmDialog }  from "@/src/components/admin/ConfirmDialog";
import { FileUpload }     from "@/src/components/admin/FileUpload";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";

// Shared admin
import { TableToolbar }         from "@/src/components/admin/shared/TableToolbar";
import { AdminSearchBar }       from "@/src/components/admin/shared/AdminSearchBar";
import { AdminEmptyState }      from "@/src/components/admin/shared/AdminEmptyState";
import { ExportButton }         from "@/src/components/admin/shared/ExportButton";
import { InlineEditField }      from "@/src/components/admin/shared/InlineEditField";
import { AuditLogViewer }       from "@/src/components/admin/shared/AuditLogViewer";
import { MediaUploadPanel }     from "@/src/components/admin/shared/MediaUploadPanel";
import { BulkActionBar }        from "@/src/components/admin/shared/BulkActionBar";
import { AdminDateRangePicker } from "@/src/components/admin/shared/AdminDateRangePicker";

// Layout
import { AdminPageWrapper }  from "@/src/components/admin/layout/AdminPageWrapper";
import { AdminDetailLayout } from "@/src/components/admin/layout/AdminDetailLayout";
```

---

## DataTable pattern

```tsx
const columns: ColumnDef<Product>[] = [
  { key: "name", header: "Tên sản phẩm", sortable: true },
  {
    key: "status",
    header: "Trạng thái",
    cell: ({ row }) => <StatusBadge status={row.status} />,
  },
  { key: "actions", cell: ({ row }) => <ActionMenu item={row} /> },
];

<TableToolbar
  search={<AdminSearchBar value={q} onChange={setQ} placeholder="Tìm sản phẩm…" />}
  filters={<FilterDropdown options={statusOptions} value={status} onChange={setStatus} />}
  actions={<Button href="/products/new">+ Thêm</Button>}
  selectedCount={selectedRows.length}
  bulkActions={[{ label: "Xóa đã chọn", icon: <TrashIcon />, onClick: handleBulkDelete, variant: "danger" }]}
  onClearSelection={() => setSelectedRows([])}
/>
<DataTable columns={columns} data={data} isLoading={isLoading} emptyText="Không có sản phẩm" />
```

---

## StatCard

```tsx
<StatCard
  title="Doanh thu hôm nay"
  value={formatVND(stats.todayRevenue)}
  change={+12.5}
  icon={<BanknotesIcon className="w-6 h-6" />}
  trend="up"
/>
```

---

## Chart pattern (Recharts)

```tsx
// Dashboard: src/components/admin/dashboard/{ChartName}.tsx
// Reports:   src/components/admin/reports/{ChartName}.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={false} />
    <XAxis dataKey="date" />
    <YAxis tickFormatter={formatVND} />
    <Tooltip formatter={(v) => formatVND(Number(v))} />
  </LineChart>
</ResponsiveContainer>
```
Admin chart primary series: `accent-500` (`#8b5cf6`). Grid lines: `secondary-200` (`#e2e8f0`).

---

## Admin form pattern

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/src/lib/validators/product";

const form = useForm<ProductForm>({ resolver: zodResolver(productSchema) });

<Input  {...form.register("name")}   label="Tên sản phẩm" error={form.formState.errors.name?.message} />
<Select {...form.register("status")} options={statusOptions} label="Trạng thái" />
<Button type="submit" loading={form.formState.isSubmitting}>Lưu</Button>
```

---

## Page templates

### List page
```tsx
export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <AdminPageWrapper title="Quản lý Sản phẩm" action={<Button href="/products/new">+ Thêm</Button>}>
      <TableToolbar ... />
      <DataTable ... />
    </AdminPageWrapper>
  );
}
```

### Detail / edit page
```tsx
<AdminPageWrapper title="Chỉnh sửa sản phẩm">
  <AdminDetailLayout
    main={<ProductFormTabs productId={id} initialData={product} />}
    aside={<ProductStatusPanel status={product.status} onPublish={handlePublish} />}
  />
</AdminPageWrapper>
```

---

## Shared component quick reference

```tsx
// InlineEditField — quick single-field edit in detail views
<InlineEditField
  value={order.trackingNumber}
  fieldType="input"
  label="Số vận đơn"
  onSave={async (v) => updateTracking(order.id, v)}
/>

// AuditLogViewer — history timeline
<AuditLogViewer events={product.auditLog} isLoading={isLoading} />

// ExportButton
<ExportButton scope="42 đơn hàng" isExporting={isExporting} onExport={(fmt) => triggerExport(fmt)} />

// MediaUploadPanel
<MediaUploadPanel images={product.images} maxImages={8} onAdd={handleAdd} onRemove={handleRemove} onReorder={handleReorder} />

// RolePermissionSelector (employee forms)
<RolePermissionSelector value={{ roles: ["staff"], permissions: overrides }} onChange={setPerms} />
```

---

## Server-side pagination pattern

Use this every time a DataTable needs to refetch on page / filter / sort change.

### Responsibilities
```
Service (src/services/*.service.ts)
  ├─ Build URLSearchParams from the params it receives.
  ├─ Call apiFetch.
  ├─ Map the raw response to a typed result.
  └─ NO default for limit / pageSize — that is a UI decision.

Component (src/components/admin/*/...Table.tsx)
  ├─ Declares PAGE_SIZE (single source of truth).
  ├─ Owns: page, pageSize, search, filters, sort, loading, data.
  ├─ Calls the service with limit: PAGE_SIZE whenever state changes.
  └─ Controls when to setLoading(true) — never flash on page change.
```

### Boilerplate

```tsx
const PAGE_SIZE = 10;

const fetchTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
const isFirstRender     = useRef(true);
const prevSearchRef     = useRef("");
const nonPageChangedRef = useRef(false);

const [data,         setData]         = useState<T[]>(initialData);
const [total,        setTotal]        = useState(initialTotal);
const [loading,      setLoading]      = useState(false);
const [page,         setPage]         = useState(1);
const [pageSize,     setPageSize]     = useState(PAGE_SIZE);
const [search,       setSearch]       = useState("");
const [statusFilter, setStatusFilter] = useState<string[]>([]);
const [sortKey,      setSortKey]      = useState("updatedAt");
const [sortDir,      setSortDir]      = useState<SortDir>("desc");

// Each handler that changes a non-page param flags the ref and resets page in the same batch.
const handleSortChange = useCallback((key: string, dir: SortDir) => {
  nonPageChangedRef.current = true;
  setSortKey(key);
  setSortDir(dir);
  setPage(1);
}, []);
// Repeat the same shape for: handleStatusFilterChange, handleSearchChange, handlePageSizeChange, …

useEffect(() => {
  if (isFirstRender.current) { isFirstRender.current = false; return; }

  const isNonPageChange = nonPageChangedRef.current;
  nonPageChangedRef.current = false;

  const isSearchChange = search !== prevSearchRef.current;
  prevSearchRef.current = search;

  if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
  fetchTimerRef.current = setTimeout(async () => {
    if (isNonPageChange) setLoading(true); // never flash on a page-only change
    try {
      const result = await getResource({
        page,
        limit: pageSize,
        q: search || undefined,
        status: statusFilter[0],
        sortBy: sortKey,
        sortOrder: sortDir,
      });
      setData(result.data);
      setTotal(result.total);
    } catch { /* keep previous data on error */ }
    finally { setLoading(false); }
  }, isSearchChange ? 300 : 0); // 300ms debounce for search, immediate otherwise

  return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
}, [page, pageSize, search, statusFilter, sortKey, sortDir]);

<DataTable
  data={data}
  columns={columns}
  isLoading={loading}
  page={page}
  pageSize={pageSize}
  totalRows={total}
  pageSizeOptions={[10, 25, 50]}
  onPageChange={setPage}
  onPageSizeChange={(n) => { nonPageChangedRef.current = true; setPageSize(n); setPage(1); }}
  sortKey={sortKey}
  sortDir={sortDir}
  onSortChange={handleSortChange}
  searchQuery={search}
  onSearchChange={(s) => { nonPageChangedRef.current = true; setSearch(s); setPage(1); }}
/>
```

### Core rules

| Concern | Correct | Wrong |
|---|---|---|
| `PAGE_SIZE` | Defined in the component | Defaulted inside the service |
| `setLoading(true)` | Only when filter / sort / search / pageSize change | On every fetch (including page change) |
| `sortOrder` | Uppercased before passing to TypeORM | `"asc"` / `"desc"` passed straight to `orderBy()` |
| `limit` in service | `if (limit) qs.set("limit", ...)` | `const { limit = 10 } = params` |

---

## Settings section pattern

1. Create `src/app/(dashboard)/settings/{section}/page.tsx`.
2. Add an entry to `SettingsLayout.tsx`'s nav array: `{ href, label, icon }`.
3. Create `src/components/admin/settings/{Section}Form.tsx`.
4. Active state is automatic via `SettingsNavLink` (`usePathname`-based).
