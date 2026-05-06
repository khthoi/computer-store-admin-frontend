export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default async function EarnRuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/promotions/earn-rules/${id}/edit`);
}
