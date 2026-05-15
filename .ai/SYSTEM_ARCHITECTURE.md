# SYSTEM ARCHITECTURE — computer-store-admin

## Overview
| | Value |
|---|---|
| Pattern | Admin SPA-like within Next.js App Router |
| Auth | Cookie-based JWT (`auth_token`) + refresh cookie (HttpOnly) |
| Data | `apiFetch` (custom helper); no React Query / no Axios |
| Layout | Fixed sidebar + scrollable main content |
| Cache | NO SSG/ISR — all admin pages `force-dynamic` |
| Port | 3001 (dev + prod) |

## Layers

```
Browser (Client)
  - Local UI state via useState / useReducer
  - Auth state via Context store (src/store/auth.store.tsx)
  - JWT access token in cookie "auth_token"
  - Refresh token in HttpOnly cookie "refresh_token"
        |
        | HTTPS
        v
Next.js Admin App (port 3001)
  - proxy.ts (Next.js 16 route guard, replaces middleware.ts)
      • All (dashboard)/* require a valid JWT.
      • Role-specific gates added inline (e.g. /employees, /roles, /reports → admin).
  - Route groups:
      (auth)/      login page (no guard)
      (dashboard)/ AdminShell layout (sidebar + header)
  - Services in src/services/*.service.ts call apiFetch (src/services/api.ts).
        |
        | REST API (Bearer JWT)
        v
NestJS Backend (port 4000)
  - Global prefix /api
  - /admin/* require staff/admin roles via NestJS guards.
```

## AdminShell Layout

```
+---------------------------------------------+
| AdminSidebar (280px) | AdminHeader (64px)   |
|  - #1E1B4B violet    |  - breadcrumb        |
|  - role-filtered nav |  - notification bell |
|  - collapse toggle   |  - user menu         |
|                      | <page content>       |
+---------------------------------------------+
```

## Auth Token Lifecycle (apiFetch)
1. Request attaches `Authorization: Bearer <auth_token>` (read from cookie).
2. On 401, `apiFetch` calls `POST /auth/refresh` (sends `refresh_token` HttpOnly cookie via `credentials: "include"`).
3. On success, the new access token is written back to the `auth_token` cookie and the request retried once.
4. On failure, a `session-expired` event is dispatched and the cookie cleared. Server-side calls redirect to `/login`.

## Data Fetching Strategy
- Pages default to Server Components and either render statically with `dynamic = "force-dynamic"` or pass `initialData` to a Client child that owns interactive state.
- Lists with filters / pagination are Client Components owning `page`, `pageSize`, `search`, `filters`, `sort`, `loading`, `data` — see COMPONENT_GUIDELINES.md.
- Services are pure transport: they build a query string, call `apiFetch`, map the response, and return typed DTOs. They never define UI defaults (page size, debounce delays).

## Role-Based Access
```
admin     → all modules
staff     → products, orders, promotions, reviews, customers
warehouse → inventory (full), orders (fulfillment only)
cskh      → support tickets, returns, customers
```
Route-level gating happens in `proxy.ts`. Component-level gating uses a `useRoleGuard()` hook where finer control is needed. The backend always enforces authorization on every endpoint — UI hiding is never the sole check.

## Component Architecture
```
src/components/ui/          Local UI primitives (Button, Input, Modal, …)
        ↑ composed by
src/components/admin/       Admin-specific components
    ├── [root]   AdminSidebar, DataTable, StatCard, ConfirmDialog, …
    ├── layout/  AdminLayout, AdminHeader, AdminPageWrapper, AdminDetailLayout, …
    ├── shared/  TableToolbar, AdminSearchBar, BulkBar, ExportButton, …
    └── {domain}/ dashboard, products, orders, inventory, promotions, …
```

## Key Technical Decisions
1. Recharts for all charts (LineChart / BarChart / PieChart).
2. Custom `apiFetch` helper — no Axios, no React Query.
3. Context + useReducer for auth state. Component-local state for everything else.
4. `react-hook-form` + Zod for every admin form.
5. Reports export via backend endpoint returning a file download — never generated in the browser.
6. Admin accent color: `#1E1B4B` sidebar bg, `accent-600` active. Violet is used in the sidebar/header only.
7. Sidebar collapse state persists in `localStorage("admin_sidebar_collapsed")`.
8. Admin components live under `src/components/admin/{domain}/` only.
