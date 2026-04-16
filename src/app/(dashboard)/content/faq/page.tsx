import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { FAQClient } from "@/src/components/admin/content/faq/FAQClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Câu hỏi thường gặp (FAQ)" };

export default function FAQPage() {
  return (
    <AdminPageWrapper
      title="Câu hỏi thường gặp (FAQ)"
      description="Quản lý câu hỏi và câu trả lời hiển thị trên trang FAQ"
    >
      <FAQClient />
    </AdminPageWrapper>
  );
}
