import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { BannerFormClient } from "@/src/components/admin/content/banners/BannerFormClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chỉnh sửa Banner" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminPageWrapper
      title="Chỉnh sửa Banner"
      
    >
      <BannerFormClient bannerId={id} />
    </AdminPageWrapper>
  );
}
