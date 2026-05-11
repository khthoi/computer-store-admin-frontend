import Link from "next/link";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CakeIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { AdminEmptyState } from "@/src/components/admin/shared/AdminEmptyState";
import { EmployeeDetailActions } from "@/src/components/admin/employees/EmployeeDetailActions";
import { EmployeeActivityTable } from "@/src/components/admin/employees/EmployeeActivityTable";
import type { NhanVien } from "@/src/types/employee.types";
import type { VaiTro } from "@/src/types/role.types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

export interface EmployeeDetailContentProps {
  employee: NhanVien;
  allRoles: VaiTro[];
}

export function EmployeeDetailContent({
  employee,
  allRoles,
}: EmployeeDetailContentProps) {
  const assignedRoles = allRoles.filter((r) => employee.roleIds.includes(r.id));

  return (
    <div className="space-y-6 p-6">
      {/* Back link */}
      <Link
        href="/employees"
        className="inline-flex items-center gap-1.5 text-sm text-secondary-500 transition-colors hover:text-secondary-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Danh sách nhân viên
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={employee.avatarUrl}
            name={employee.fullName}
            size="xl"
          />
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {employee.fullName}
            </h1>
            <p className="mt-0.5 text-sm text-secondary-500">{employee.code}</p>
            <div className="mt-2">
              <StatusBadge status={employee.status} />
            </div>
          </div>
        </div>
        <EmployeeDetailActions employee={employee} allRoles={allRoles} />
      </div>

      {/* Two-column layout at xl */}
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
                <span className="truncate">{employee.email}</span>
              </li>
              <li className="flex items-center gap-3 text-secondary-700">
                <PhoneIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                {employee.phone}
              </li>
              {employee.gender && (
                <li className="flex items-center gap-3 text-secondary-700">
                  <UserIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                  <span>
                    <span className="text-secondary-400">Giới tính: </span>
                    {GENDER_LABEL[employee.gender]}
                  </span>
                </li>
              )}
              {employee.dateOfBirth && (
                <li className="flex items-center gap-3 text-secondary-700">
                  <CakeIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                  <span>
                    <span className="text-secondary-400">Ngày sinh: </span>
                    {formatDate(employee.dateOfBirth)}
                  </span>
                </li>
              )}
              <li className="flex items-center gap-3 text-secondary-700">
                <CalendarDaysIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                <span>
                  <span className="text-secondary-400">Ngày vào làm: </span>
                  {employee.hireDate ? formatDate(employee.hireDate) : "—"}
                </span>
              </li>
              {employee.lastLoginAt && (
                <li className="flex items-center gap-3 text-secondary-700">
                  <ClockIcon className="h-4 w-4 shrink-0 text-secondary-400" />
                  <span>
                    <span className="text-secondary-400">Đăng nhập lần cuối: </span>
                    {formatDateTime(employee.lastLoginAt)}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
              Vai trò ({employee.roleIds.length})
            </h2>
            {employee.roleNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {employee.roleNames.map((name) => (
                  <Badge key={name} variant="primary">
                    {name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary-400">Chưa có vai trò</p>
            )}
          </div>
        </div>

        {/* ── Right: Tabs ── */}
        <div className="rounded-xl border border-secondary-200 bg-white shadow-sm">
          <Tabs
            tabs={[
              {
                value: "overview",
                label: "Tổng quan",
                icon: <BriefcaseIcon className="h-4 w-4" />,
              },
              {
                value: "activity",
                label: "Hoạt động",
                icon: <ClipboardDocumentListIcon className="h-4 w-4" />,
              },
            ]}
            defaultValue="overview"
            className="border-b border-secondary-200 px-6"
          >
            <TabPanel value="overview" className="p-6">
              {assignedRoles.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {assignedRoles.map((role) => (
                    <Link
                      key={role.id}
                      href="/roles"
                      className="group rounded-lg border border-secondary-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                          <ShieldCheckIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-secondary-900 group-hover:text-primary-700">
                            {role.name}
                          </p>
                          <p className="mt-0.5 text-xs text-secondary-500 line-clamp-2">
                            {role.description}
                          </p>
                          <p className="mt-1.5 text-xs text-secondary-400">
                            {role.permissions.length} quyền hạn
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <AdminEmptyState
                  icon={<ShieldCheckIcon className="h-8 w-8" />}
                  title="Chưa có vai trò"
                  description="Nhân viên này chưa được phân công vai trò nào."
                />
              )}
            </TabPanel>

            <TabPanel value="activity" className="p-6">
              <EmployeeActivityTable employeeId={employee.id} />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
