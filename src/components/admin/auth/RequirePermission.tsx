"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/src/store/auth.store";

interface RequirePermissionProps {
  /** Single permission code required. Mutually exclusive with `anyOf` / `allOf`. */
  permission?: string;
  /** User must have at least one of these permissions. */
  anyOf?: string[];
  /** User must have every one of these permissions. */
  allOf?: string[];
  /** Optional fallback to render when the user is not authorized. Default: nothing. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Action-level permission gate for hiding (or replacing) parts of the UI —
 * buttons, table actions, dashboard widgets, etc.
 *
 * Unlike RouteGuard this does NOT redirect; it simply renders `fallback`
 * (default: nothing) when the user lacks the required permission.
 *
 * Examples:
 *   <RequirePermission permission="orders.update">
 *     <Button>Duyệt đơn</Button>
 *   </RequirePermission>
 *
 *   <RequirePermission anyOf={["returns.update", "support.update"]}>
 *     <PendingActionsWidget />
 *   </RequirePermission>
 */
export function RequirePermission({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: RequirePermissionProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let ok = true;
  if (permission) ok = hasPermission(permission);
  else if (anyOf && anyOf.length > 0) ok = hasAnyPermission(...anyOf);
  else if (allOf && allOf.length > 0) ok = hasAllPermissions(...allOf);

  return <>{ok ? children : fallback}</>;
}
