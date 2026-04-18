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

## Settings Section Pattern

1. Create `src/app/(dashboard)/settings/{section}/page.tsx`
2. Add entry to `SettingsLayout.tsx` nav array with `{ href, label, icon }`
3. Create `src/components/admin/settings/{Section}Form.tsx`
4. Active state: automatic via `SettingsNavLink` (usePathname-based)
