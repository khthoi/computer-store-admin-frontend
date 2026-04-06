export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEarnRules } from "@/src/services/loyalty.service";
import { EarnRuleFormClient } from "@/src/components/admin/promotions/EarnRuleFormClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit Earn Rule ${id} — Admin` };
}

export default async function EditEarnRulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rules = await getEarnRules();
  const rule = rules.find((r) => r.id === id);
  if (!rule) notFound();

  return <EarnRuleFormClient mode="edit" rule={rule} />;
}
