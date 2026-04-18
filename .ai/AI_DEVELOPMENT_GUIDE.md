# AI DEVELOPMENT GUIDE — computer-store-admin

## Pre-Task Checklist
```
□ Read .ai/CODING_RULES.md
□ Read .ai/FEATURE_SPEC.md — find the admin screen (AD-xx)
□ Check src/components/admin/{domain}/ for existing components
□ Check src/components/ui/ for available UI primitives
□ Identify required role(s) for this feature
□ Confirm page type: list (TableToolbar + DataTable) | detail (AdminDetailLayout) | settings
```

---

## RECIPE: New CRUD list page

1. Find spec in FEATURE_SPEC.md
2. Add types → `src/types/{resource}.types.ts`
3. Add service → `src/services/{resource}.service.ts`
4. Create page at `src/app/(dashboard)/{route}/page.tsx`:
```tsx
export const dynamic = "force-dynamic";

<AdminPageWrapper title="..." action={<Button>Thêm mới</Button>}>
  <TableToolbar
    search={<AdminSearchBar />}
    filters={<FilterDropdown />}
    actions={<ExportButton />}
    selectedCount={selectedRows.length}
    bulkActions={[{ label: "Xóa đã chọn", icon: <TrashIcon />, onClick: handleBulkDelete, variant: "danger" }]}
    onClearSelection={() => setSelectedRows([])}
  />
  <DataTable columns={columns} data={data} isLoading={isLoading} />
</AdminPageWrapper>
```
5. Create `loading.tsx` with Skeleton rows
6. Add role guard to `middleware.ts` if route needs restriction

---

## RECIPE: New detail / edit page

1. Create `src/app/(dashboard)/{route}/[id]/page.tsx`
2. Fetch record server-side, pass as `initialData`
3. Wrap in `<AdminDetailLayout main={...} aside={...} />`:
   - `main`: form, tabs, DataTable sub-sections
   - `aside`: status panel, metadata, AuditLogViewer
4. Use `InlineEditField` for quick single-field corrections
5. Destructive actions: always `ConfirmDialog`

---

## RECIPE: Product form (create/edit)

```
Left (ProductFormTabs):
  → ProductGeneralForm (name, SKU, brand, category, tags, RTE description)
  → ProductVariantsForm (attribute builder + variant matrix)
  → MediaUploadPanel (images, max 8, drag-reorder)
  → ProductSpecificationsForm (spec group rows)
  → ProductSEOForm (meta title/desc, slug, SERP preview)
Right:
  → ProductStatusPanel (publish / draft / schedule)
```

Routes: `/products/new` (create) | `/products/:id/edit` (edit)

---

## RECIPE: Dashboard widget

```tsx
// src/components/admin/dashboard/{WidgetName}.tsx
// Use StatCard for KPI boxes
// Use Recharts (LineChart / BarChart / PieChart) for charts
// Dashboard page: src/app/(dashboard)/page.tsx
// export const dynamic = "force-dynamic"
```

---

## RECIPE: Role-protected page

```ts
// Option A — middleware.ts (preferred for route-level):
if (pathname.startsWith("/employees") && token.role !== "admin") {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

// Option B — page level with hook:
const { hasRole } = useRoleGuard();
if (!hasRole("admin")) return <Unauthorized />;
```

---

## RECIPE: New settings sub-page

1. `src/app/(dashboard)/settings/{section}/page.tsx`
2. `src/components/admin/settings/{Section}Form.tsx`
3. Add nav entry to `SettingsLayout.tsx` (href, label, icon)
4. Form: react-hook-form + Zod + `onSave` callback

---

## RECIPE: Promotion form (create/edit)

```
Left (PromotionFormTabs):
  → General: name, type, status
  → Rules: DiscountRuleBuilder (conditions + discount value)
           CouponCodeManager (when type = coupon)
           FlashSaleScheduler (when type = flash_sale)
  → Applicability: PromotionApplicabilityPicker
  → Schedule: start/end AdminDateRangePicker
  → Stats: read-only redemption count + revenue impact
Right:
  → Promotion status panel (publish / draft / archive)
```

---

## Common Anti-patterns

```
✗ import from "@computer-store/ui" — not installed
✗ Custom <table> instead of DataTable
✗ ISR / cache on admin pages → must be force-dynamic
✗ UI hiding as sole auth check — backend must also enforce
✗ violet outside AdminSidebar/AdminHeader
✗ Form without Zod validation
✗ Destructive action without ConfirmDialog
✗ Client-side PDF/Excel generation
✗ Server data in Zustand
✗ Admin components under src/components/layout/ (use src/components/admin/)
✗ Passing active prop to AdminSidebar nav items
```
