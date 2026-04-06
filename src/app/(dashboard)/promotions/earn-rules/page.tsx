export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getEarnRules } from "@/src/services/loyalty.service";
import { EarnRulesListClient } from "@/src/components/admin/promotions/EarnRulesListClient";

export const metadata: Metadata = { title: "Loyalty Earn Rules — Admin" };

export default async function EarnRulesPage() {
  const rules = await getEarnRules();
  return <EarnRulesListClient initialRules={rules} />;
}
