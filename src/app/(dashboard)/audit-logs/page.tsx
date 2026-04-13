import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { AuditLogListClient } from "@/src/components/admin/audit-logs/AuditLogListClient";

// Admin pages must NEVER be ISR/cached — data must always be fresh.
// See .ai/CODING_RULES.md RULE 3.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nhật ký hoạt động",
};

/**
 * AuditLogsPage — Toàn bộ nhật ký thao tác của nhân viên trên hệ thống.
 *
 * Route guard: middleware.ts đảm bảo chỉ role "admin" mới truy cập được
 * (xem src/middleware.ts — /audit-logs → require role admin).
 *
 * Pattern: Server Component bao ngoài Client Component (AuditLogListClient)
 * để giữ page.tsx thuần server, data fetching + interactivity nằm ở client.
 */
export default function AuditLogsPage() {
  return (
    <AdminPageWrapper
      title="Nhật ký hoạt động"
      description="Theo dõi toàn bộ thao tác của nhân viên trên hệ thống"
    >
      <AuditLogListClient />
    </AdminPageWrapper>
  );
}
