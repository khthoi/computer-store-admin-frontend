import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { StaticPageListClient } from "@/src/components/admin/content/pages/StaticPageListClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Trang tĩnh" };

export default function StaticPagesPage() {
  return (
    <AdminPageWrapper
      title="Trang tĩnh"
      description="Quản lý các trang như chính sách, giới thiệu, hướng dẫn"
    >
      <StaticPageListClient />
    </AdminPageWrapper>
  );
}
