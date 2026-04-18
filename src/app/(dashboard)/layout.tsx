import type { ReactNode } from "react";
import { AdminLayout } from "@/src/components/admin/layout/AdminLayout";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
