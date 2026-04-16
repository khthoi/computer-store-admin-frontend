import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { StaticPageFormClient } from "@/src/components/admin/content/pages/StaticPageFormClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chỉnh sửa trang" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditStaticPagePage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminPageWrapper title="Chỉnh sửa trang" >
      <StaticPageFormClient pageId={id} />
    </AdminPageWrapper>
  );
}
