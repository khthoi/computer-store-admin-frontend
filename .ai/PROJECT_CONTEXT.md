# PROJECT CONTEXT — computer-store-admin

## System Type
Internal back-office dashboard. NOT public-facing.
Manages the full retail operation: products, orders, inventory, customers, support, CMS.

## User Roles (RBAC)
| Role | Access |
|------|--------|
| Staff | Products CRUD, Orders view, Promotions, Reviews moderation |
| Warehouse | Inventory in/out, Order fulfillment (packing + shipping) |
| CSKH | Support tickets, Return/refund processing, Customer contact |
| Admin | Full access + Reports + Employee management + Settings + Roles |

## Core Modules
| Module | Route | Description |
|--------|-------|-------------|
| DASHBOARD | `/dashboard` | KPIs, revenue charts, recent orders, low-stock alerts |
| PRODUCTS | `/products` | Create/edit product + variants + specs + images |
| CATEGORIES | `/categories` | Category tree management (CRUD) |
| BRANDS | `/brands` | Brand management |
| ORDERS | `/orders` | View list, update status, detail + timeline |
| RETURNS | `/orders/returns` | Review return requests, approve/reject |
| TRANSACTIONS | `/orders/transactions` | Transaction history |
| INVENTORY | `/inventory` | Stock levels, import, adjustments, history |
| PROMOTIONS | `/promotions` | Discount rules, coupons, flash sales, earn rules |
| CUSTOMERS | `/customers` | Customer list, detail, order history |
| SUPPORT | `/support` | Handle tickets, assign, internal notes |
| REVIEWS | `/reviews` | Moderate product reviews |
| REPORTS | `/reports` | Revenue, products, inventory value, export |
| EMPLOYEES | `/employees` | Staff accounts management |
| ROLES | `/roles` | Role & permission matrix |
| CONTENT | `/content/*` | Banners, homepage, announcements, FAQ, navigation |
| AUDIT LOGS | `/audit-logs` | System audit trail |
| SETTINGS | `/settings/*` | Store config: general, payments, shipping, tax… |

## Critical Business Rules
1. Role check on every protected page — middleware + component-level guard
2. Admin-only: `/employees`, `/roles`, `/reports`, `/settings/*`
3. Order status flow: `pending → confirmed → packing → shipping → delivered`
4. Stock: auto-deduct on order confirmed, auto-restore on return approved
5. Low stock threshold: configurable per product variant (default: 10 units)
6. Ticket SLA: open > 24h → show warning indicator in ticket list
7. Review default: `pending` → staff approves before visible on storefront
8. All monetary values: VND — use `formatVND()` from `src/lib/format.ts`
9. Admin data: ALWAYS fresh — no ISR, React Query staleTime: 30s
10. Promotions: flash_sale / coupon / earn_rule types — each has different form controls
