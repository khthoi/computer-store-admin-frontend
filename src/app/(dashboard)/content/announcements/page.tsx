import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { AnnouncementsClient } from "@/src/components/admin/content/announcements/AnnouncementsClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thông báo & Popup" };

export default function AnnouncementsPage() {
  return (
    <AdminPageWrapper
      title="Thông báo & Popup"
      description="Quản lý popup và thanh thông báo hiển thị cho khách hàng"
    >
      <AnnouncementsClient />
    </AdminPageWrapper>
  );
}
