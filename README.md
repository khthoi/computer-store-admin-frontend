# Computer Store — Admin Dashboard

Back-office dashboard for staff of the **Online PC Store System**. Provides full control over the catalog, inventory, orders, promotions, customers, support, content, and operational reports. Built with Next.js 16 App Router, TypeScript, and TailwindCSS v4.

## Who Uses It

| Role | Access |
|---|---|
| **Staff** | Products, Orders, Promotions, Reviews, Customers |
| **Warehouse** | Full inventory + order fulfillment |
| **CSKH (Support)** | Support tickets, returns, customer contact |
| **Admin** | Everything above + Reports, Employees, Roles, Settings |

Every page enforces role-based access at both the middleware and component level. Users see only the modules they're entitled to.

## What's Inside

### Dashboard
- Real-time KPIs: revenue, orders, conversion, new customers
- Sales charts (daily / weekly / monthly) and top-selling products
- Recent orders feed and low-stock alerts

### Catalog Management
- **Products** — create/edit with multi-image gallery, variants, dynamic specs per category, SEO metadata, and rich-text descriptions (CKEditor 5)
- **Categories** — drag-and-drop tree editor
- **Brands** — list, logo, status
- **Specifications** — define spec templates per category (CPU, GPU, RAM, etc.)
- **Media library** — Cloudinary-backed image manager

### Orders
- Order list with rich filters (status, date range, payment method, customer)
- Order detail with full timeline, item snapshot, shipping, transactions
- Status transitions: confirm → pack → ship → deliver, with cancel and refund flows
- Returns queue and processing

### Inventory
- Stock levels by variant with low-stock highlighting
- Stock-in receipts and manual adjustments with audit trail
- Supplier directory linked to purchase history

### Promotions
- Discount rules (percentage / fixed / free shipping) with stacking policy
- Coupon code management
- **Flash sales** — schedule time-windowed sales with per-variant stock caps
- Loyalty earn rules

### Customers
- Customer directory with detail view: orders, addresses, loyalty balance, reviews, support tickets
- Soft-block accounts; never hard-delete a customer with order history

### Support & Reviews
- Support ticket queue with assign, reply, and close flows (real-time via SSE)
- Review moderation: approve, hide, reject

### Reports (Admin only)
- Revenue, profit, inventory turnover, customer cohort
- Scheduled snapshots
- CSV / Excel export

### Staff & Permissions
- Employee accounts with role assignment
- Roles matrix — granular permission editing

### Content (CMS)
- Home banners, page modules, FAQ, navigation menus, popups
- Static pages with rich-text content

### System
- Audit log of sensitive admin actions
- Site-wide settings (Admin only): store info, payment toggles, shipping config, integrations

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript strict mode
- **Styling:** TailwindCSS v4 with CSS-first `@theme` tokens
- **Charts:** Recharts
- **Icons:** Heroicons + react-icons
- **Forms:** react-hook-form + Zod validation
- **Server state:** React Query (30s stale time — always fresh)
- **Auth:** NextAuth.js with JWT + role claims
- **Rich text:** CKEditor 5
- **Animation:** Framer Motion
- **UI primitives:** Local `src/components/ui/` (no shared package)

All admin pages run with `dynamic = "force-dynamic"` — no ISR or static cache, so staff always see live data.

## Getting Started

```bash
# Install
npm install

# Environment
cp .env.example .env.local
# Set:
#   NEXT_PUBLIC_API_URL=http://localhost:4000
#   NEXTAUTH_SECRET=<random-admin-secret>
#   NEXTAUTH_URL=http://localhost:3001

# Run
npm run dev
```

The dashboard runs on **http://localhost:3001**. Make sure the backend (`computer-store-backend`) is running on port 4000.

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript compile check |

## Design System

Navy-and-blue admin theme — sidebar `#0F172A`, active items `blue-600` (`#2563EB`). Currency formatted with `formatVND()`. All UI text is in Vietnamese; all code (variables, types, comments) is in English. Destructive actions are always confirmed through `ConfirmDialog`.

## Data Patterns

- **DataTable** (`src/components/admin/DataTable`) is the canonical list view, with server-side pagination, sort, and filter.
- **StatCard** is used across dashboards for KPI tiles.
- Loading overlays appear only on filter/search/sort changes — never on plain pagination — to avoid flashing the table.
- Forms always use react-hook-form + Zod, with schemas under `src/lib/validators/`.

## Security

- All admin routes pass through middleware that validates the JWT and the user's role claims.
- The shared `apiFetch` helper auto-refreshes expired tokens and redirects to `/login` when refresh also fails.
- Audit trail captures sensitive operations (product price changes, role edits, refunds, etc.).

## License

Proprietary — internal project.
