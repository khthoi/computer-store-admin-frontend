import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { StaticPageFormClient } from "@/src/components/admin/content/pages/StaticPageFormClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tạo trang mới" };

export default function CreateStaticPagePage() {
  return (
    <AdminPageWrapper title="Tạo trang mới" >
      <StaticPageFormClient />
    </AdminPageWrapper>
  );
}
