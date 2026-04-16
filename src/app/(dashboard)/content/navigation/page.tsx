import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { NavigationClient } from "@/src/components/admin/content/navigation/NavigationClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Điều hướng Menu" };

export default function NavigationPage() {
  return (
    <AdminPageWrapper
      title="Điều hướng Menu"
      description="Quản lý cấu trúc menu header, footer và mobile"
    >
      <NavigationClient />
    </AdminPageWrapper>
  );
}
