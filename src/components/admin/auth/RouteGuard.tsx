"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/store/auth.store";
import { getRequiredPermission } from "@/src/lib/permissions/route-map";

interface RouteGuardProps {
  children: ReactNode;
}

/**
 * Centralized route-level permission gate. Mount once at the top of the
 * dashboard layout — every page rendered beneath it is checked against the
 * permission required for its pathname (see `lib/permissions/route-map.ts`).
 *
 * Behavior:
 *   - Waits for auth hydration before deciding (prevents false-negative on first render).
 *   - If the route requires no permission, renders children as-is.
 *   - If user lacks the permission, navigates to `/403` and renders nothing.
 *   - `admin` role is short-circuited true by `hasPermission`, so super-admins
 *     always pass.
 *
 * The `/login` flow lives outside the `(dashboard)` group and is unaffected.
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const { state, hasPermission } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const required = getRequiredPermission(pathname);
  const allowed = !required || hasPermission(required);

  useEffect(() => {
    if (!state.hydrated) return;
    if (!state.user) return;
    if (!allowed) {
      router.replace("/403");
    }
  }, [state.hydrated, state.user, allowed, router]);

  if (!state.hydrated) return null;
  if (state.user && !allowed) return null;

  return <>{children}</>;
}
