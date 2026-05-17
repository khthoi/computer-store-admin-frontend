import type { ReactNode } from "react";
import { AdminLayout } from "@/src/components/admin/layout/AdminLayout";
import { RouteGuard } from "@/src/components/admin/auth/RouteGuard";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayout>
      <RouteGuard>{children}</RouteGuard>
    </AdminLayout>
  );
}
