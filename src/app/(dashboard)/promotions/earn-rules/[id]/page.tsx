export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEarnRules } from "@/src/services/loyalty.service";
import { EarnRuleDetailClient } from "@/src/components/admin/promotions/EarnRuleDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Earn Rule ${id} — Admin` };
}

export default async function EarnRuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rules = await getEarnRules();
  const rule = rules.find((r) => r.id === id);
  if (!rule) notFound();

  return <EarnRuleDetailClient rule={rule} />;
}
