import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { HomepageSectionClient } from "@/src/components/admin/content/homepage/HomepageSectionClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cấu hình trang chủ",
  description: "Quản lý các khối sản phẩm hiển thị trên trang chủ",
};

export default function HomepageSectionsPage() {
  return (
    <AdminPageWrapper
      title="Khối sản phẩm trang chủ"
      description="Cấu hình các khu vực sản phẩm hiển thị trên trang chủ: thứ tự, nguồn dữ liệu, layout và thời gian hiển thị."
    >
      <HomepageSectionClient />
    </AdminPageWrapper>
  );
}
