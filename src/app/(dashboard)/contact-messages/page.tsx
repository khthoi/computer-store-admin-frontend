export const dynamic = "force-dynamic";

import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { ContactMessagesClient } from "@/src/components/admin/contact-messages/ContactMessagesClient";

export const metadata = {
  title: "Liên hệ khách hàng",
};

export default function ContactMessagesPage() {
  return (
    <AdminPageWrapper
      title="Liên hệ khách hàng"
      description="Quản lý các tin nhắn gửi từ form liên hệ trên trang khách hàng."
    >
      <ContactMessagesClient />
    </AdminPageWrapper>
  );
}
