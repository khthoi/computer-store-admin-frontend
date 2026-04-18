# computer-store-admin

Back-office Admin Dashboard for an online computer & hardware retail platform.

## Stack
- **Framework**: Next.js 16.1.6 App Router + TypeScript
- **Styling**: TailwindCSS v4 (CSS-first `@theme` tokens)
- **Charts**: Recharts
- **Icons**: @heroicons/react + react-icons
- **Forms**: react-hook-form + Zod
- **Data**: React Query (staleTime: 30s — always fresh)
- **Auth**: NextAuth.js (JWT + role claims)
- **Rich text**: CKEditor 5
- **Animation**: Framer Motion

> No `@computer-store/ui` package — all UI from `src/components/ui/` (local).

## Quick Start
```bash
cp .env.example .env.local
npm install
npm run dev   # → http://localhost:3001
```

## Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXTAUTH_SECRET=your-admin-secret
NEXTAUTH_URL=http://localhost:3001
```

## Roles & Permissions
| Role | Access |
|------|--------|
| Staff | Products, Orders, Promotions, Reviews, Customers |
| Warehouse | Inventory (full), Order fulfillment |
| CSKH | Support tickets, Returns, Customer contact |
| Admin | Full access + Reports + Employees + Settings |

## Key Modules
```
/dashboard   KPIs, charts, recent orders
/products    Product catalog + variants + specs
/categories  Category tree | /brands  Brand list
/orders      Order list + detail + returns + transactions
/inventory   Stock levels, import, adjustments, suppliers
/promotions  Discount rules, coupons, flash sales, earn rules
/customers   Customer list + detail
/support     Ticket queue + reply + assign
/reviews     Review moderation
/reports     Analytics + export (Admin only)
/employees   Staff accounts | /roles  Permission matrix
/content     Banners, homepage, FAQ, navigation, media
/audit-logs  System audit trail
/settings    Store config (Admin only)
```

## AI Development — READ FIRST
1. `.ai/CODING_RULES.md` — rules specific to admin
2. `.ai/SYSTEM_ARCHITECTURE.md` — auth, data freshness, layout
3. `.ai/AI_DEVELOPMENT_GUIDE.md` — task recipes (CRUD, form, chart)
4. `.ai/FEATURE_SPEC.md` — AD-01…AD-17 screen specs
5. `.ai/COMPONENT_GUIDELINES.md` — DataTable, StatCard, form patterns
6. `.ai/DESIGN_SYSTEM.md` — color tokens, typography, layout
7. `.ai/UI_DESIGN_SYSTEM.md` — admin-specific token quick reference
8. `.ai/ICON_SYSTEM.md` — Heroicons rules
9. `.ai/API_CONTRACT.md` — backend endpoint reference
10. `.ai/FOLDER_STRUCTURE.md` — where to place new files
