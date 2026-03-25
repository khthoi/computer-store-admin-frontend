# COMPONENT GUIDELINES — computer-store-admin

## UI Primitive imports (CORRECT path)
# All base UI lives in src/components/ui/ — import locally:
import { Button } from "@/src/components/ui/Button";
import { Input }  from "@/src/components/ui/Input";
import { Modal }  from "@/src/components/ui/Modal";
# Do NOT use "@computer-store/ui" — this package is not installed.

## Admin component imports
import { DataTable }      from "@/src/components/admin/DataTable";
import { StatCard }       from "@/src/components/admin/StatCard";
import { StatusBadge }    from "@/src/components/admin/StatusBadge";
import { ConfirmDialog }  from "@/src/components/admin/ConfirmDialog";
import { FileUpload }     from "@/src/components/admin/FileUpload";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";

## DataTable Pattern (most used in admin)
import { DataTable } from "@/src/components/admin/DataTable";

# Column definition pattern (TanStack Table):
const columns: ColumnDef<Product>[] = [
  { accessorKey: "name", header: "Tên sản phẩm", ... },
  { accessorKey: "status", header: "Trạng thái",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { id: "actions", cell: ({ row }) => <ActionMenu item={row.original} />,
  },
];

# Always wrap DataTable with TableToolbar:
import { TableToolbar }  from "@/src/components/admin/shared/TableToolbar";
import { AdminEmptyState } from "@/src/components/admin/shared/AdminEmptyState";
<TableToolbar
  search={<AdminSearchBar value={q} onChange={setQ} placeholder="Tìm sản phẩm…" />}
  filters={<FilterDropdown ... />}
  actions={<Button>Thêm mới</Button>}
  selectedCount={selectedRows.length}
  bulkActions={[{ label: "Xóa đã chọn", icon: <TrashIcon />, onClick: handleBulkDelete, variant: "danger" }]}
  onClearSelection={() => setSelectedRows([])}
/>
<DataTable columns={columns} data={data} isLoading={isLoading} />

## StatCard Pattern (dashboard)
import { StatCard } from "@/src/components/admin/StatCard";
<StatCard
  title="Doanh thu hôm nay"
  value={formatVND(stats.todayRevenue)}
  change={+12.5}  // percentage
  icon={<DollarIcon />}
  trend="up"
/>

## Chart Pattern (local, using Recharts)
// Dashboard widgets: src/components/admin/dashboard/{ChartName}.tsx
// Reports charts:    src/components/admin/reports/{ChartName}.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// Use violet-700 (#6d28d9) as primary chart series colour in admin
// Use secondary-200 (#e2e8f0) for grid lines
// Use DM Sans font in chart tooltips

## Admin Form Pattern
import { useForm }       from 'react-hook-form';
import { zodResolver }   from '@hookform/resolvers/zod';
import { productSchema } from '@/src/lib/validators';
import { Input }         from "@/src/components/ui/Input";
import { Select }        from "@/src/components/ui/Select";
import { Button }        from "@/src/components/ui/Button";

# Multi-tab forms (products, promotions): use ProductFormTabs / PromotionFormTabs
# pattern — dirty-state dot, keepMounted tabs, onFormChange per section.

## Page Template (Admin List Page)
// Wrap page body in AdminPageWrapper:
<AdminPageWrapper title="Quản lý Sản phẩm" action={<Button href="/products/new">+ Thêm</Button>}>
  <TableToolbar ... />
  <DataTable ... />
</AdminPageWrapper>

## Page Template (Admin Detail / Edit Page)
// Wrap in AdminDetailLayout for split-pane:
<AdminPageWrapper title="Chỉnh sửa sản phẩm">
  <AdminDetailLayout
    main={<ProductFormTabs ... />}
    aside={<ProductStatusPanel ... />}
  />
</AdminPageWrapper>

## AdminSidebar Nav Item (role-filtered)
// AdminSidebar reads userRole and filters items with requiredRoles[].
// Active state is derived automatically via usePathname() — do NOT pass active prop.
// All items must have href (rendered as <Link>) or children (rendered as toggle button).

## Layout Shell Integration
// The (dashboard)/layout.tsx renders AdminLayout which provides:
//   - SidebarContext (collapse state + localStorage)
//   - AdminSidebar (left, violet-700)
//   - AdminHeader (top, sticky)
//   - <main> scrollable area
// Individual pages only need AdminPageWrapper — no need to render header/sidebar.

## Shared Component Patterns

# InlineEditField — quick single-field edits in detail views:
<InlineEditField
  value={order.trackingNumber}
  fieldType="input"
  label="Số vận đơn"
  onSave={async (v) => await updateTracking(order.id, v)}
/>

# AuditLogViewer — history timeline in detail pages:
<AuditLogViewer events={product.auditLog} isLoading={isLoading} />

# ExportButton — consistent export control:
<ExportButton
  scope="42 đơn hàng"
  isExporting={isExporting}
  onExport={(format) => triggerExport(format)}
/>

# MediaUploadPanel — multi-image management:
<MediaUploadPanel
  images={product.images}
  maxImages={8}
  onAdd={handleAdd}
  onRemove={handleRemove}
  onReorder={handleReorder}
/>

# RolePermissionSelector — staff permission matrix:
<RolePermissionSelector
  value={{ roles: ["staff"], permissions: overrides }}
  onChange={({ roles, permissions }) => setPerms({ roles, permissions })}
/>

## Settings Section Pattern
// All settings pages render inside src/app/(dashboard)/settings/layout.tsx
// which wraps with <SettingsLayout>.
// Add new settings page:
//   1. Create src/app/(dashboard)/settings/{section}/page.tsx
//   2. Add entry to SettingsLayout nav array with href + label + icon
//   3. Create form component in src/components/admin/settings/{Section}Form.tsx
