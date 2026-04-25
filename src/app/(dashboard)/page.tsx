import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <AdminPageWrapper title="Dashboard">
      <DashboardClient />
    </AdminPageWrapper>
  );
}
