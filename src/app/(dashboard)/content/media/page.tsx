import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { MediaLibraryClient } from "@/src/components/admin/content/media/MediaLibraryClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thư viện Media" };

export default function MediaLibraryPage() {
  return (
    <AdminPageWrapper
      title="Thư viện Media"
      description="Quản lý hình ảnh, video và tài liệu được sử dụng trên website"
    >
      <MediaLibraryClient />
    </AdminPageWrapper>
  );
}
