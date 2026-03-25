# AI DEVELOPMENT GUIDE — computer-store-admin
# Follow this workflow for every task in this repo.

## MANDATORY PRE-TASK CHECKLIST
□ Read .ai/CODING_RULES.md (admin edition)
□ Read .ai/FEATURE_SPEC.md — find the admin screen (AD-xx)
□ Check src/components/admin/ for existing components before creating new ones
□ Check src/components/ui/ for available UI primitives (NOT @computer-store/ui)
□ Identify required role for this feature
□ Confirm whether the page is a list (→ TableToolbar + DataTable) or
  a detail/edit page (→ AdminDetailLayout) or a settings form (→ SettingsLayout)

## ADMIN TASK RECIPES

# RECIPE: New CRUD list page (most common)
1. Find spec in FEATURE_SPEC.md (e.g., AD-02 Products)
2. Add types to src/types/{resource}.types.ts
3. Add service to src/services/{resource}.service.ts
4. Create page at src/app/(dashboard)/{route}/page.tsx:
   a. Wrap in <AdminPageWrapper title="..." action={<Button>Thêm mới</Button>}>
   b. <TableToolbar search={<AdminSearchBar />} filters={...} actions={...}
                    selectedCount={...} bulkActions={[...]} onClearSelection={...} />
   c. <DataTable columns={columns} data={data} isLoading={isLoading} />
   d. <AdminEmptyState> passed to DataTable for empty/no-results states
5. Create loading.tsx with Skeleton rows
6. AdminSidebar already has the 10 domain nav items — no change needed
7. Add to middleware.ts if route needs role restriction beyond defaults

# RECIPE: New detail / edit page
1. Create page at src/app/(dashboard)/{route}/[id]/page.tsx
2. Fetch record server-side, pass as props
3. Wrap in <AdminPageWrapper title="Chỉnh sửa …">
4. Use <AdminDetailLayout main={...} aside={...} />:
   - main: form component(s), tabs, DataTable sub-sections
   - aside: status panel, metadata cards, AuditLogViewer
5. Add InlineEditField for quick single-field corrections
6. Destructive actions (delete, suspend): always ConfirmDialog

# RECIPE: Product form (create/edit)
1. Create Zod schema in src/lib/validators.ts
2. Page wraps <AdminDetailLayout>:
   Left:  <ProductFormTabs productId={id} initialData={product} />
   Right: <ProductStatusPanel status={product.status} onPublish={...} />
3. ProductFormTabs renders: ProductGeneralForm, ProductVariantsForm,
   MediaUploadPanel (images), ProductSEOForm, ProductSpecificationsForm
4. Page routes: /products/new (create) | /products/:id/edit (edit)

# RECIPE: Dashboard widget
1. Create component in src/components/admin/dashboard/{WidgetName}.tsx
2. Use StatCard from "@/src/components/admin/StatCard" for KPI boxes
3. Use Recharts (LineChart / BarChart / PieChart) for charts
4. Dashboard page (src/app/(dashboard)/page.tsx) composes all widgets
   with export const dynamic = "force-dynamic"

# RECIPE: Reports section addition
1. Create chart/table component in src/components/admin/reports/
2. Connect to ReportsFilterBar state via props (from, to, channel, category)
3. Add to the reports page grid below SalesOverviewPanel
4. All data fetching: React Query with staleTime: 30000

# RECIPE: New settings sub-page
1. Create src/app/(dashboard)/settings/{section}/page.tsx
2. Create src/components/admin/settings/{Section}Form.tsx
3. Add nav entry to SettingsLayout.tsx (href, label, icon)
4. Form uses react-hook-form + Zod + onSave callback

# RECIPE: Role-protected page
// Option A — middleware.ts (preferred for route-level):
import { getToken } from 'next-auth/jwt';
if (pathname.startsWith("/staff") && token.role !== "admin") {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

// Option B — page level with hook:
const { hasRole } = useRoleGuard();
if (!hasRole("admin")) return <Unauthorized />;

## ANTI-PATTERNS (admin-specific)
  ✗ Importing from "@computer-store/ui" — package not installed; use @/src/components/ui/
  ✗ Building custom <table> instead of DataTable from @/src/components/admin/DataTable
  ✗ Using ISR/cache on admin pages (data must be fresh; use force-dynamic)
  ✗ Hiding UI elements as the only auth check (backend must also check)
  ✗ Using violet-700 colors outside AdminSidebar/AdminHeader (content uses primary-600)
  ✗ Creating form without Zod validation
  ✗ Destructive action without ConfirmDialog (use requiredPhrase for irreversible)
  ✗ Generating files client-side (PDFs/Excel must come from backend endpoint)
  ✗ Storing server data in Zustand store
  ✗ Placing new admin components under src/components/layout/ or src/components/{other}
    → Always place under src/components/admin/{domain}/
  ✗ Passing active prop to AdminSidebar nav items — active state is auto-derived from usePathname()
