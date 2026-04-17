import type { Metadata } from "next";
import {
  ClockIcon,
  PlusCircleIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  getNotifications,
  getNotificationStats,
} from "@/src/services/notification.service";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { NotificationStatCards } from "@/src/components/admin/notifications/NotificationStatCards";
import { NotificationHistoryTable } from "@/src/components/admin/notifications/NotificationHistoryTable";
import { CreateNotificationForm } from "@/src/components/admin/notifications/CreateNotificationForm";
import { AutoNotificationSettings } from "@/src/components/admin/notifications/AutoNotificationSettings";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";

// ─── Route config ─────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thông báo hệ thống — Admin",
  description: "Quản lý push notifications và thông báo đến khách hàng.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NotificationsPage() {
  const [{ data, total }, stats] = await Promise.all([
    getNotifications({ pageSize: 50 }),
    getNotificationStats(),
  ]);

  return (
    <AdminPageWrapper
      title="Thông báo hệ thống"
      description={`${total} thông báo · Push, Email, SMS đến khách hàng`}
    >
      <div className="space-y-6">
        {/* KPI cards */}
        <NotificationStatCards stats={stats} />

        {/* Tabs */}
        <div className="rounded-2xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
          <Tabs
            tabs={[
              {
                value: "history",
                label: "Lịch sử thông báo",
                icon: <ClockIcon className="h-4 w-4" />,
              },
              {
                value: "create",
                label: "Tạo thông báo mới",
                icon: <PlusCircleIcon className="h-4 w-4" />,
              },
              {
                value: "auto",
                label: "Cài đặt tự động",
                icon: <AdjustmentsHorizontalIcon className="h-4 w-4" />,
              },
            ]}
            defaultValue="history"
            className="border-b border-secondary-200 px-6"
          >
            {/* Tab 1: Lịch sử */}
            <TabPanel value="history">
              <NotificationHistoryTable initialData={data} initialTotal={total} />
            </TabPanel>

            {/* Tab 2: Tạo mới */}
            <TabPanel value="create" className="p-6">
              <CreateNotificationForm />
            </TabPanel>

            {/* Tab 3: Cài đặt tự động */}
            <TabPanel value="auto" className="p-6">
              <AutoNotificationSettings />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </AdminPageWrapper>
  );
}
