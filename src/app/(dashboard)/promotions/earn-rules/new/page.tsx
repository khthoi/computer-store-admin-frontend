export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { EarnRuleFormClient } from "@/src/components/admin/promotions/EarnRuleFormClient";

export const metadata: Metadata = { title: "New Earn Rule — Admin" };

export default function NewEarnRulePage() {
  return <EarnRuleFormClient mode="create" />;
}
