import type { ReactNode } from "react";
import { AdminLayout } from "@/src/components/admin/layout/AdminLayout";

// Admin pages must never be statically cached — data must always be fresh.
// See .ai/CODING_RULES.md RULE 3.
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
