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
| DASHBOARD | `/` | KPIs, revenue charts, recent orders, low-stock alerts |
| PRODUCTS | `/products` | Create/edit product + variants + specs + images |
| CATEGORIES | `/categories` | Category tree management (CRUD) |
| BRANDS | `/brands` | Brand management |
| ORDERS | `/orders` | List, update status, detail + timeline |
| RETURNS | `/orders/returns` | Review return requests, approve/reject |
| TRANSACTIONS | `/orders/transactions` | Transaction history |
| INVENTORY | `/inventory` | Stock levels, import, adjustments, history, suppliers |
| PROMOTIONS | `/promotions` | Discount rules, coupons, flash sales, earn rules |
| CUSTOMERS | `/customers` | Customer list, detail, order history |
| SUPPORT | `/support` | Handle tickets, assign, internal notes |
| REVIEWS | `/reviews` | Moderate product reviews |
| REPORTS | `/reports` | Revenue, products, inventory value, export |
| EMPLOYEES | `/employees` | Staff account management |
| ROLES | `/roles` | Role and permission matrix |
| CONTENT | `/content/*` | Banners, homepage, FAQ, navigation, media |
| AUDIT LOGS | `/audit-logs` | System audit trail |
| SETTINGS | `/settings/*` | Store config: general, payments, shipping, tax… |

## Critical Business Rules
1. Every protected page is gated by `proxy.ts` (route guard) plus a component-level check where needed.
2. Admin-only routes: `/employees`, `/roles`, `/reports`, `/settings/*`.
3. Order status flow: `pending → confirmed → packing → shipping → delivered`. `cancelled` allowed from `pending` only.
4. Stock auto-deducts on order confirmed, auto-restores on return approved.
5. Low-stock threshold is configurable per variant (default: 10 units).
6. Ticket SLA: open > 24h shows a warning indicator in the ticket list.
7. Reviews default to `pending`; staff must approve before they appear on the storefront.
8. All monetary values are VND. Always render with `formatVND()` from `src/lib/format.ts`.
9. Admin data must always be fresh. Pages declare `export const dynamic = "force-dynamic"`.
10. Promotions support `flash_sale`, `coupon`, and `earn_rule` types, each with its own form controls.
