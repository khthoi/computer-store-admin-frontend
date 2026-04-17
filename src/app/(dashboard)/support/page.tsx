export const dynamic = "force-dynamic";

import { TicketListClient } from "@/src/components/admin/support/TicketListClient";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";

export const metadata = {
  title: "Hỗ trợ & Khiếu nại",
};

export default function SupportPage() {
  return (
    <AdminPageWrapper 
    title="Hỗ trợ & Khiếu nại"
    description="Quản lý các yêu cầu hỗ trợ và khiếu nại từ khách hàng, theo dõi trạng thái và phản hồi kịp thời."
    >
      <TicketListClient />
    </AdminPageWrapper>
  );
}
