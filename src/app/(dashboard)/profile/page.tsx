import type { Metadata } from "next";
import { getCurrentProfile } from "@/src/services/profile.service";
import { ProfilePageClient } from "@/src/components/admin/profile/ProfilePageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân — Admin",
};

export default async function ProfilePage() {
  const { employee, roles, auditLogs } = await getCurrentProfile();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Quản lý thông tin cá nhân, mật khẩu và xem lịch sử hoạt động của bạn.
        </p>
      </div>

      <ProfilePageClient
        initialEmployee={employee}
        roles={roles}
        auditLogs={auditLogs}
      />
    </div>
  );
}
