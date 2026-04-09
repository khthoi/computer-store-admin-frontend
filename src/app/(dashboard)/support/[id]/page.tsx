export const dynamic = "force-dynamic";

import { TicketDetailClient } from "@/src/components/admin/support/TicketDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Phiếu hỗ trợ #${id}` };
}

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-secondary-50 px-6 py-8">
      <TicketDetailClient ticketId={Number(id)} />
    </div>
  );
}
