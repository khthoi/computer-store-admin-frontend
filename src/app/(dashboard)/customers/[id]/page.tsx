import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ShoppingBagIcon,
  UserIcon,
  CakeIcon,
} from "@heroicons/react/24/outline";
import { getCustomerById } from "@/src/services/customer.service";
import { getOrdersByCustomerId } from "@/src/services/order.service";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { CustomerOrderHistoryList } from "@/src/components/admin/customers/CustomerOrderHistoryList";
import { Avatar } from "@/src/components/ui/Avatar";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { CustomerDetailActions } from "@/src/components/admin/customers/CustomerDetailActions";
import { CustomerAddressesTable } from "@/src/components/admin/customers/CustomerAddressesTable";
import { formatVND } from "@/src/lib/format";
import {
  MapPinIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CustomerLoyaltyTab } from "@/src/components/admin/customers/CustomerLoyaltyTab";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const customer = await getCustomerById(id);
  return {
    title: customer
      ? `${customer.fullName} — Khách hàng — Admin`
      : "Khách hàng không tồn tại — Admin",
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customer, orderHistory] = await Promise.all([
    getCustomerById(id),
    getOrdersByCustomerId(id),
  ]);
  if (!customer) notFound();

  return (
    <div className="space-y-6 p-6">
      {/* Back link */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-secondary-500 transition-colors hover:text-secondary-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Danh sách khách hàng
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar src={customer.avatarUrl} name={customer.fullName} size="xl" />
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {customer.fullName}
            </h1>
            <p className="mt-0.5 text-sm text-secondary-500">{customer.code}</p>
            <div className="mt-2">
              <StatusBadge status={customer.status} />
            </div>
          </div>
        </div>
        <CustomerDetailActions customer={customer} />
      </div>

      {/* Two-column at xl */}
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        {/* ── Left: Profile card ── */}
        <div className="space-y-4">
          <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
              Thông tin liên hệ
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-secondary-700">
                <EnvelopeIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                <span className="truncate">{customer.email}</span>
              </li>
              <li className="flex items-center gap-3 text-secondary-700">
                <PhoneIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                {customer.phone}
              </li>
              {customer.gender && (
                <li className="flex items-center gap-3 text-secondary-700">
                  <UserIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                  <span>
                    <span className="text-secondary-400">Giới tính: </span>
                    {GENDER_LABEL[customer.gender]}
                  </span>
                </li>
              )}
              {customer.dateOfBirth && (
                <li className="flex items-center gap-3 text-secondary-700">
                  <CakeIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                  <span>
                    <span className="text-secondary-400">Ngày sinh: </span>
                    {formatDate(customer.dateOfBirth)}
                  </span>
                </li>
              )}
              <li className="flex items-center gap-3 text-secondary-700">
                <CalendarDaysIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                <span>
                  <span className="text-secondary-400">Đăng ký: </span>
                  {formatDate(customer.registeredAt)}
                </span>
              </li>
              {customer.lastOrderAt && (
                <li className="flex items-center gap-3 text-secondary-700">
                  <ShoppingBagIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                  <span>
                    <span className="text-secondary-400">Đơn hàng cuối: </span>
                    {formatDate(customer.lastOrderAt)}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
              Thống kê
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-500">Tổng đơn hàng</span>
                <span className="font-semibold text-secondary-900">
                  {customer.totalOrders.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-500">Tổng chi tiêu</span>
                <span className="font-semibold text-secondary-900">
                  {formatVND(customer.totalSpent)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-500">Địa chỉ giao hàng</span>
                <span className="font-semibold text-secondary-900">
                  {customer.shippingAddresses.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Tabs ── */}
        <div className="rounded-xl border border-secondary-200 bg-white shadow-sm">
          <Tabs
            tabs={[
              {
                value: "addresses",
                label: "Địa chỉ giao hàng",
                icon: <MapPinIcon className="h-4 w-4" />,
              },
              {
                value: "orders",
                label: "Lịch sử đơn hàng",
                icon: <ClipboardDocumentListIcon className="h-4 w-4" />,
              },
              {
                value: "loyalty",
                label: "Loyalty & Points",
                icon: <SparklesIcon className="h-4 w-4" />,
              },
            ]}
            defaultValue="addresses"
            className="border-b border-secondary-200 px-6"
          >
            <TabPanel value="addresses" className="p-6">
              <CustomerAddressesTable
                customerId={customer.id}
                initialAddresses={customer.shippingAddresses}
              />
            </TabPanel>

            <TabPanel value="orders" className="p-6">
              <CustomerOrderHistoryList orders={orderHistory} />
            </TabPanel>

            <TabPanel value="loyalty" className="p-6">
              <CustomerLoyaltyTab customerId={customer.id} />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
