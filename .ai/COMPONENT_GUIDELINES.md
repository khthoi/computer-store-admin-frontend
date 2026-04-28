# COMPONENT GUIDELINES — computer-store-admin

## Import Paths (Critical)

```ts
// UI primitives — local only (@computer-store/ui NOT installed)
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
import { TableToolbar }          from "@/src/components/admin/shared/TableToolbar";
import { AdminSearchBar }        from "@/src/components/admin/shared/AdminSearchBar";
import { AdminEmptyState }       from "@/src/components/admin/shared/AdminEmptyState";
import { ExportButton }          from "@/src/components/admin/shared/ExportButton";
import { InlineEditField }       from "@/src/components/admin/shared/InlineEditField";
import { AuditLogViewer }        from "@/src/components/admin/shared/AuditLogViewer";
import { MediaUploadPanel }      from "@/src/components/admin/shared/MediaUploadPanel";
import { BulkActionBar }         from "@/src/components/admin/shared/BulkActionBar";
import { AdminDateRangePicker }  from "@/src/components/admin/shared/AdminDateRangePicker";

// Layout
import { AdminPageWrapper }   from "@/src/components/admin/layout/AdminPageWrapper";
import { AdminDetailLayout }  from "@/src/components/admin/layout/AdminDetailLayout";
```

---

## DataTable Pattern

```tsx
const columns: ColumnDef<Product>[] = [
  { accessorKey: "name", header: "Tên sản phẩm" },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { id: "actions", cell: ({ row }) => <ActionMenu item={row.original} /> },
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

## StatCard Pattern

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

## Chart Pattern (Recharts)

```tsx
// Dashboard: src/components/admin/dashboard/{ChartName}.tsx
// Reports:   src/components/admin/reports/{ChartName}.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Primary chart color in admin: accent-500 (#8b5cf6)
// Grid lines: secondary-200 (#e2e8f0)
// Font: DM Sans
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={false} />
    <XAxis dataKey="date" />
    <YAxis tickFormatter={formatVND} />
    <Tooltip formatter={(v) => formatVND(Number(v))} />
  </LineChart>
</ResponsiveContainer>
```

---

## Admin Form Pattern

```tsx
import { useForm }     from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@/src/lib/validators/product';

const form = useForm<ProductForm>({ resolver: zodResolver(productSchema) });

<Input {...form.register("name")} label="Tên sản phẩm" error={form.formState.errors.name?.message} />
<Select {...form.register("status")} options={statusOptions} label="Trạng thái" />
<Button type="submit" loading={form.formState.isSubmitting}>Lưu</Button>
```

---

## Page Templates

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

## Shared Component Quick Reference

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

## Server-side Pagination Pattern

Dùng khi DataTable cần fetch dữ liệu mới từ API mỗi khi đổi trang, filter, hoặc sort. Đây là pattern chuẩn cho mọi list page trong admin.

### Phân tách trách nhiệm

```
Service (src/services/*.service.ts)
  ├── Build URLSearchParams từ params được truyền vào
  ├── Gọi apiFetch
  ├── Map raw response → typed result
  └── KHÔNG có default cho limit/pageSize — component quyết định

Component (src/components/admin/*/...Table.tsx)
  ├── Khai báo PAGE_SIZE (single source of truth)
  ├── Sở hữu state: page, pageSize, search, filters, sort, loading, data
  ├── Gọi service với limit: PAGE_SIZE mỗi khi state thay đổi
  └── Kiểm soát khi nào setLoading(true) — không flash khi chỉ đổi trang
```

### Boilerplate đầy đủ

```tsx
// ── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10; // chỉ định nghĩa ở đây — không để trong service

// ── Refs ─────────────────────────────────────────────────────────────────────
const fetchTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
const isFirstRender  = useRef(true);
const prevSearchRef  = useRef("");
// Serialise tất cả params ngoài "page" — dùng để phát hiện page-only change
const prevNonPageKey = useRef(
  JSON.stringify({ search: "", statusFilter: [], sortKey: "updatedAt", sortDir: "desc", pageSize: PAGE_SIZE })
);

// ── State ─────────────────────────────────────────────────────────────────────
const [data,       setData]       = useState<T[]>(initialData);
const [total,      setTotal]      = useState(initialTotal);
const [loading,    setLoading]    = useState(false);
const [page,       setPage]       = useState(1);
const [pageSize,   setPageSize]   = useState(PAGE_SIZE);
const [search,     setSearch]     = useState("");
const [statusFilter, setStatusFilter] = useState<string[]>([]);
const [sortKey,    setSortKey]    = useState("updatedAt");
const [sortDir,    setSortDir]    = useState<SortDir>("desc");

// ── Reset page khi filter/sort/pageSize thay đổi ──────────────────────────────
useEffect(() => {
  setPage(1);
}, [search, statusFilter, sortKey, sortDir, pageSize]);

// ── Fetch effect ──────────────────────────────────────────────────────────────
useEffect(() => {
  if (isFirstRender.current) { isFirstRender.current = false; return; }

  const nonPageKey     = JSON.stringify({ search, statusFilter, sortKey, sortDir, pageSize });
  const isPageOnly     = nonPageKey === prevNonPageKey.current;
  prevNonPageKey.current = nonPageKey;

  const isSearchChange = search !== prevSearchRef.current;
  prevSearchRef.current = search;

  if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
  fetchTimerRef.current = setTimeout(async () => {
    if (!isPageOnly) setLoading(true);   // không flash khi chỉ đổi trang
    try {
      const result = await getResource({
        page,
        limit: pageSize,                 // component truyền xuống, service không tự đặt default
        q: search || undefined,
        status: statusFilter[0],
        sortBy: sortKey,
        sortOrder: sortDir,
      });
      setData(result.data);
      setTotal(result.total);
    } catch { /* giữ nguyên data cũ khi lỗi */ }
    finally { setLoading(false); }
  }, isSearchChange ? 300 : 0);         // debounce 300ms cho search, 0ms cho phần còn lại

  return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
}, [page, pageSize, search, statusFilter, sortKey, sortDir]);

// ── DataTable ─────────────────────────────────────────────────────────────────
<DataTable
  data={data}
  columns={columns}
  isLoading={loading}
  page={page}
  pageSize={pageSize}
  totalRows={total}
  pageSizeOptions={[10, 25, 50]}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  sortKey={sortKey}
  sortDir={sortDir}
  onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
  searchQuery={search}
  onSearchChange={setSearch}
/>
```

### Quy tắc cốt lõi

| | Đúng | Sai |
|---|---|---|
| `PAGE_SIZE` | Định nghĩa trong component | Để default trong service |
| `setLoading(true)` | Chỉ khi filter/sort/search thay đổi | Mọi lần fetch kể cả chuyển trang |
| `sortOrder` | Luôn uppercase trước khi truyền vào TypeORM | Truyền `"asc"`/`"desc"` thẳng vào `orderBy()` |
| `limit` trong service | `if (limit) qs.set("limit", ...)` | `const { limit = 10 } = params` |

---

## Settings Section Pattern

1. Create `src/app/(dashboard)/settings/{section}/page.tsx`
2. Add entry to `SettingsLayout.tsx` nav array with `{ href, label, icon }`
3. Create `src/components/admin/settings/{Section}Form.tsx`
4. Active state: automatic via `SettingsNavLink` (usePathname-based)
