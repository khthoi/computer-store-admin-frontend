export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEarnRuleById } from "@/src/services/loyalty.service";
import { EarnRuleFormClient } from "@/src/components/admin/promotions/EarnRuleFormClient";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { mode } = await searchParams;
  const rule = await getEarnRuleById(id).catch(() => null);
  if (!rule) return { title: "Quy tắc tích điểm — Admin" };
  return {
    title: mode === "edit"
      ? `Sửa: ${rule.name} — Admin`
      : `${rule.name} — Admin`,
  };
}

export default async function EarnRuleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;
  const rule = await getEarnRuleById(id).catch(() => null);
  if (!rule) notFound();

  if (mode === "edit") return <EarnRuleFormClient mode="edit" rule={rule} />;
  return <EarnRuleFormClient mode="view" rule={rule} />;
}
