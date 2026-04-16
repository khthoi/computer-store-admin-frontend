import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { BannerListClient } from "@/src/components/admin/content/banners/BannerListClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quản lý Banner" };

export default function BannersPage() {
  return (
    <AdminPageWrapper
      title="Quản lý Banner"
      description="Tạo và quản lý các banner hiển thị trên website"
    >
      <BannerListClient />
    </AdminPageWrapper>
  );
}
