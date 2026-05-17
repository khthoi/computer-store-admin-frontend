/**
 * URL pathname → required permission code mapping.
 *
 * Single source of truth for route-level gating. Used by RouteGuard
 * (mounted once in (dashboard)/layout.tsx) and any server-side check.
 *
 * Order matters: place more specific routes BEFORE generic prefixes —
 * the first matching entry wins. e.g. `/orders/returns` must come before
 * `/orders` so it's classified as `returns.read`, not `orders.read`.
 *
 * A pathname that matches no entry is treated as publicly accessible
 * within the dashboard shell (e.g. `/` dashboard home, `/profile`, `/403`).
 */

export interface RoutePermissionRule {
  match: RegExp;
  permission: string;
}

export const ROUTE_PERMISSIONS: ReadonlyArray<RoutePermissionRule> = [
  // Orders sub-routes (specific first)
  { match: /^\/orders\/returns(\/|$)/,       permission: "returns.read" },
  { match: /^\/orders\/transactions(\/|$)/,  permission: "payments.read" },
  { match: /^\/orders(\/|$)/,                permission: "orders.read" },

  // Inventory & suppliers
  { match: /^\/inventory\/suppliers(\/|$)/,  permission: "suppliers.read" },
  { match: /^\/inventory(\/|$)/,             permission: "inventory.read" },

  // Catalog
  { match: /^\/products(\/|$)/,              permission: "products.read" },
  { match: /^\/categories(\/|$)/,            permission: "categories.read" },
  { match: /^\/brands(\/|$)/,                permission: "brands.read" },

  // People
  { match: /^\/customers(\/|$)/,             permission: "customers.read" },
  { match: /^\/employees(\/|$)/,             permission: "employees.read" },
  { match: /^\/roles(\/|$)/,                 permission: "roles.read" },

  // Support
  { match: /^\/support(\/|$)/,               permission: "support.read" },
  { match: /^\/contact-messages(\/|$)/,      permission: "support.read" },
  { match: /^\/reviews(\/|$)/,               permission: "reviews.read" },

  // Marketing
  { match: /^\/promotions\/flash-sales(\/|$)/, permission: "flash-sales.read" },
  { match: /^\/promotions(\/|$)/,            permission: "promotions.read" },

  // Reports & audit
  { match: /^\/reports(\/|$)/,               permission: "reports.read" },
  { match: /^\/audit-logs(\/|$)/,            permission: "audit-logs.read" },

  // CMS / content
  { match: /^\/content\/buildpc(\/|$)/,      permission: "build-pc.read" },
  { match: /^\/content\/media(\/|$)/,        permission: "media.read" },
  { match: /^\/content(\/|$)/,               permission: "cms.read" },

  // System settings
  { match: /^\/settings\/notifications(\/|$)/, permission: "notifications.read" },
  { match: /^\/settings(\/|$)/,              permission: "settings.read" },
];

/**
 * Returns the permission code required to access `pathname`,
 * or `null` if the route is open to all authenticated employees.
 */
export function getRequiredPermission(pathname: string): string | null {
  for (const rule of ROUTE_PERMISSIONS) {
    if (rule.match.test(pathname)) return rule.permission;
  }
  return null;
}
