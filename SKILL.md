# SKILL.md — Technical Reference
## computer-store-admin (Back-office Dashboard)

> Stack: Next.js 16 App Router · TypeScript · TailwindCSS v4 · Recharts · React Query · NextAuth.js

---

## 1. Core Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16.1.6 App Router | `force-dynamic` on all admin pages |
| Language | TypeScript ^5 strict | Zero `any`, `import type` for type-only |
| Styling | TailwindCSS v4 | CSS-first `@theme` → auto utility classes |
| Data | React Query | `staleTime: 30s`, `refetchOnWindowFocus: true` |
| Auth | NextAuth.js | JWT httpOnly cookie, role claims |
| Forms | react-hook-form + Zod | Uncontrolled inputs, schema validation |
| Charts | Recharts | LineChart, BarChart, PieChart for dashboard/reports |
| Icons | @heroicons/react + react-icons | Heroicons default; react-icons for brand icons |
| Rich text | CKEditor 5 | Product description editor |
| Animation | Framer Motion | Sidebar transitions, modal animations |
| HTTP | Axios | JWT interceptor, BFF proxy to NestJS |

**No `@computer-store/ui` package** — all UI from `src/components/ui/` (local).

---

## 2. Architecture Patterns

### 2.1 Rendering Strategy
All `(dashboard)/*` pages: `export const dynamic = "force-dynamic"` — NO ISR, NO static.
Admin requires real-time accurate data at all times.

### 2.2 Layout Shell
```
AdminLayout (src/app/(dashboard)/layout.tsx)
├── SidebarContext.Provider  (collapse + localStorage)
│   ├── AdminSidebar         (fixed 280px, #1E1B4B violet, usePathname active)
│   └── right column
│       ├── AdminHeader      (sticky 64px, breadcrumb + bell + user menu)
│       └── <main>
│           └── AdminPageWrapper (title + CTA slot)
│               └── page content or AdminDetailLayout
```

### 2.3 Data Fetching
```ts
// Pattern A — Server Component with initialData
const product = await productService.getById(id);  // server-side
// → pass as initialData to React Query client component

// Pattern B — Client Component (interactive tables)
const { data, isLoading } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => productService.list(filters),
  staleTime: 30_000,
});
```

### 2.4 Role-Based Access Control
Four roles: `admin` | `staff` | `warehouse` | `cskh`

Dual-layer enforcement:
1. `middleware.ts` — JWT + role check before page renders (preferred)
2. `useRoleGuard()` hook — component-level fallback
3. NestJS `@Roles()` guard — authoritative server-side check

```ts
// middleware.ts example
if (pathname.startsWith("/employees") && token.role !== "admin") {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
```

---

## 3. Component Architecture

### 3.1 Component Resolution Order
1. `src/components/ui/` — primitive UI (Button, Input, Modal, etc.)
2. `src/components/admin/[root]` — admin primitives (DataTable, StatCard, ConfirmDialog)
3. `src/components/admin/layout/` — shell (AdminPageWrapper, AdminDetailLayout)
4. `src/components/admin/shared/` — cross-domain (TableToolbar, ExportButton)
5. `src/components/admin/{domain}/` — domain-specific (products/, orders/, promotions/)

### 3.2 Common Patterns

**List page:**
```tsx
<AdminPageWrapper title="Quản lý Sản phẩm" action={<Button>+ Thêm</Button>}>
  <TableToolbar search={...} filters={...} selectedCount={n} bulkActions={[...]} />
  <DataTable columns={columns} data={data} isLoading={isLoading} />
</AdminPageWrapper>
```

**Detail page:**
```tsx
<AdminPageWrapper title="Chỉnh sửa">
  <AdminDetailLayout
    main={<ProductFormTabs />}
    aside={<ProductStatusPanel />}
  />
</AdminPageWrapper>
```

**Form:**
```tsx
const form = useForm<T>({ resolver: zodResolver(schema) });
// All forms: react-hook-form + Zod schema in src/lib/validators/
```

---

## 4. Business Logic

### 4.1 Order Status Machine
```
pending → confirmed → packing → shipping → delivered
pending → cancelled (only from pending)
delivered → return_requested → return_approved → refunded
```
Each transition requires ConfirmDialog. Logged in AuditLogViewer.

### 4.2 Inventory Tracking
- Stock auto-deducted on `order.confirmed`
- Stock auto-restored on `return.approved`
- Low stock threshold: configurable per variant (default: 10 units)
- Adjustments require reason code + audit log entry

### 4.3 Promotion Engine
Three promotion types:
- `coupon` — code-based discount, CouponCodeManager
- `flash_sale` — time + stock limited price, FlashSaleScheduler
- `earn_rule` — loyalty points rules
Each type renders different sub-form within PromotionFormTabs.

### 4.4 Review Moderation Pipeline
1. Customer submits (requires `delivered` order with that product)
2. Review lands in `pending` — not visible on storefront
3. Staff approves/rejects → approved recalculates product rating

---

## 5. Coding Standards

### TypeScript
```
strict: true  |  zero any  |  named exports only  |  import type for type-only
All API responses explicitly typed  |  interface ComponentNameProps pattern
```

### File Naming
| Asset | Convention |
|-------|-----------|
| Components | PascalCase: `ProductCard.tsx` |
| Hooks | camelCase + `use`: `useRoleGuard.ts` |
| Services | camelCase + `.service`: `product.service.ts` |
| Types | camelCase + `.types`: `product.types.ts` |
| Stores | camelCase + `.store`: `auth.store.tsx` |
| Validators | camelCase in `validators/`: `product.ts` |
| Pages | lowercase `page.tsx` |

### Component Conventions
```
✅ export function ProductCard(props: ProductCardProps)
✅ "use client" only when state/effects/browser APIs needed
✅ loading.tsx + error.tsx alongside every page.tsx
✅ formatVND() for all monetary values
❌ export default ComponentName
❌ fetch() inside component body
❌ Hardcoded hex colors (use design token classes)
❌ Storing server data in Zustand
❌ ISR on admin pages
```

### Scripts
```bash
npm run dev    # dev server → port 3001
npm run build  # production build
npm run start  # production server → port 3001
npm run lint   # ESLint
```

### Environment Variables
```
NEXT_PUBLIC_API_URL  Axios base URL for client requests
NEXTAUTH_SECRET      JWT signing key
NEXTAUTH_URL         Canonical URL for NextAuth callbacks
```
