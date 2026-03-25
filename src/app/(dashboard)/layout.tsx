import type { ReactNode } from "react";

// Admin pages must never be statically cached — data must always be fresh.
// See .ai/CODING_RULES.md RULE 3.
// AdminLayout is provided by src/app/layout.tsx — no wrapper needed here.
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
