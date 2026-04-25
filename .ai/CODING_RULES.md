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
