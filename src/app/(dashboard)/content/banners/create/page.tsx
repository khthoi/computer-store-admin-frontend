import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { BannerFormClient } from "@/src/components/admin/content/banners/BannerFormClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tạo Banner mới" };

export default function CreateBannerPage() {
  return (
    <AdminPageWrapper
      title="Tạo Banner mới"
      
    >
      <BannerFormClient />
    </AdminPageWrapper>
  );
}
