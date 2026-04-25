# SYSTEM ARCHITECTURE — computer-store-admin

## Overview
| | Value |
|---|---|
| Pattern | Admin SPA-like within Next.js App Router |
| Auth | NextAuth.js with JWT + role claims |
| Data | React Query (staleTime: 30s — always fresh) |
| Layout | Fixed sidebar + scrollable main content |
| Cache | NO SSG/ISR — all admin pages `force-dynamic` |
| Port | 3001 (dev + prod) |

## Layer Diagram

```
┌──────────────────────────────────────────────────┐
│               BROWSER (Client)                    │
│  Zustand: sidebar state, auth session             │
│  React Query: all server data (staleTime: 30s)    │
│  NextAuth session: user info + role + accessToken │
└─────────────────┬────────────────────────────────┘
                  │ HTTPS
┌─────────────────▼────────────────────────────────┐
│          NEXT.JS ADMIN APP (Port 3001)            │
│                                                   │
│  proxy.ts — JWT guard + role check (Next.js 16)   │
│  (replaces middleware.ts — do NOT create both)    │
│  ├── (dashboard)/* → require valid JWT            │
│  ├── /employees → role === "admin"                │
│  ├── /roles     → role === "admin"                │
│  ├── /reports   → role === "admin"                │
│  ├── /inventory → role in ["warehouse","admin"]   │
│  ├── /support   → role in ["cskh","admin"]        │
│  └── Unauthorized → redirect /login               │
│                                                   │
│  Route Groups:                                    │
│  (auth)/       → login page (no guard)            │
│  (dashboard)/  → AdminShell layout                │
│                                                   │
│  AdminShell layout.tsx:                           │
│  ┌─────────────────────────────────────────────┐ │
│  │ AdminSidebar (280px) │ AdminHeader (64px)   │ │
│  │  - violet #1E1B4B    │ - breadcrumb         │ │
│  │  - role-filtered nav │ - notification bell  │ │
│  │  - collapse toggle   │ - user menu          │ │
│  │                      │ <page content>       │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────┬────────────────────────────────┘
                  │ REST API (JWT Bearer)
┌─────────────────▼────────────────────────────────┐
│       NESTJS BACKEND (Port 4000)                  │
│  /admin/* endpoints — require staff/admin JWT     │
│  Role enforcement: NestJS Guards (@Roles)         │
└──────────────────────────────────────────────────┘
```

## Component Architecture

```
src/components/ui/          ← Local UI primitives (Button, Input, Modal…)
        │ composed by
src/components/admin/       ← Admin-specific components
    ├── [root]  AdminSidebar, DataTable, StatCard, ConfirmDialog…
    ├── layout/ SidebarContext, AdminLayout, AdminHeader, AdminPageWrapper…
    ├── shared/ TableToolbar, AdminSearchBar, BulkActionBar, ExportButton…
    └── {domain}/ dashboard, products, orders, inventory, promotions…
```

## Data Fetching Strategy

```
NO ISR / NO static generation on admin pages.

Pattern A — Server Component (initial load):
  page.tsx → fetch server-side → pass as initialData to React Query
  → instant render + client-side refresh capability

Pattern B — Client Component (interactive tables):
  useQuery({ queryKey: [resource, filters], staleTime: 30000 })
  → filter change → new query key → auto refetch
```

React Query config:
```ts
staleTime: 30 * 1000        // 30 seconds
refetchOnWindowFocus: true
refetchInterval: false      // only refetch on action
```

## Role-Based Access

```
role === 'admin'     → all modules
role === 'staff'     → products, orders, promotions, reviews, customers
role === 'warehouse' → inventory (full), orders (fulfillment only)
role === 'cskh'      → support tickets, returns, customers
```

Component-level check:
```ts
const { canAccess } = useRoleGuard();
if (!canAccess('products', 'delete')) return null;
```

## Key Technical Decisions

1. Recharts for charts (LineChart / BarChart / PieChart)
2. TanStack Table (headless) for DataTable
3. React Query for all server data — no server data in Zustand
4. Zustand for: sidebar collapse, auth session only
5. react-hook-form + Zod for all forms
6. Real-time notifications: Server-Sent Events (SSE) from backend
7. Report export: backend endpoint → file download response
8. Admin accent color: `#1E1B4B` sidebar bg, `accent-600` active (sidebar + header ONLY)
9. Sidebar collapse: persisted in `localStorage("admin_sidebar_collapsed")`
10. All admin components: `src/components/admin/{domain}/` only
