export const dynamic = "force-dynamic";

import { TicketListClient } from "@/src/components/admin/support/TicketListClient";

export const metadata = {
  title: "Hỗ trợ & Khiếu nại",
};

export default function SupportPage() {
  return (
    <div className="px-6 py-8">
      <TicketListClient />
    </div>
  );
}
