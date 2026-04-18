"use client";

import { useState, useCallback } from "react";
import {
  UserIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileInfoCard } from "./ProfileInfoCard";
import { ProfileEditForm } from "./ProfileEditForm";
import { ProfileAvatarUploader } from "./ProfileAvatarUploader";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ProfileRolesPanel } from "./ProfileRolesPanel";
import { ProfileActivityLog } from "./ProfileActivityLog";
import type { NhanVien, AuditLogEntry } from "@/src/types/employee.types";
import type { VaiTro } from "@/src/types/role.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfilePageClientProps {
  initialEmployee: NhanVien;
  roles: VaiTro[];
  auditLogs: AuditLogEntry[];
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  {
    value: "info",
    label: "Thông tin cá nhân",
    icon: <UserIcon className="h-4 w-4" />,
  },
  {
    value: "roles",
    label: "Vai trò & Quyền",
    icon: <ShieldCheckIcon className="h-4 w-4" />,
  },
  {
    value: "activity",
    label: "Lịch sử hoạt động",
    icon: <ClipboardDocumentListIcon className="h-4 w-4" />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfilePageClient({
  initialEmployee,
  roles,
  auditLogs,
}: ProfilePageClientProps) {
  const [employee, setEmployee] = useState<NhanVien>(initialEmployee);
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const handleProfileSaved = useCallback((updated: NhanVien) => {
    setEmployee(updated);
  }, []);

  const handleAvatarSaved = useCallback((avatarUrl: string) => {
    setEmployee((prev) => ({ ...prev, avatarUrl }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <ProfileHeader
        employee={employee}
        onEditInfo={() => setEditOpen(true)}
        onChangePassword={() => setPwOpen(true)}
        onChangeAvatar={() => setAvatarOpen(true)}
      />

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left: static info card */}
        <div className="space-y-4">
          <ProfileInfoCard employee={employee} />
        </div>

        {/* Right: tabbed panels */}
        <div className="rounded-xl border border-secondary-200 bg-white shadow-sm min-h-[400px]">
          <Tabs
            tabs={TABS}
            defaultValue="info"
            className="border-b border-secondary-200 px-6"
          >
            <TabPanel value="info" className="p-6">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-secondary-700">
                  Thông tin hồ sơ
                </h2>
                <p className="text-sm text-secondary-400">
                  Nhấn{" "}
                  <span className="font-medium text-primary-600">
                    Chỉnh sửa hồ sơ
                  </span>{" "}
                  để cập nhật thông tin cá nhân.
                </p>
              </div>

              {/* Summary grid */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Mã nhân viên", value: employee.code },
                  { label: "Email",        value: employee.email },
                  { label: "Họ và tên",    value: employee.fullName },
                  {
                    label: "Giới tính",
                    value:
                      employee.gender === "male"
                        ? "Nam"
                        : employee.gender === "female"
                        ? "Nữ"
                        : employee.gender === "other"
                        ? "Khác"
                        : "—",
                  },
                  {
                    label: "Ngày sinh",
                    value: employee.dateOfBirth
                      ? new Date(employee.dateOfBirth).toLocaleDateString("vi-VN")
                      : "—",
                  },
                  {
                    label: "Ngày vào làm",
                    value: new Date(employee.hireDate).toLocaleDateString("vi-VN"),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-secondary-100 bg-secondary-50 px-4 py-3"
                  >
                    <p className="text-xs font-medium text-secondary-400 mb-0.5">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-secondary-800 truncate">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </TabPanel>

            <TabPanel value="roles" className="p-6">
              <ProfileRolesPanel roles={roles} />
            </TabPanel>

            <TabPanel value="activity" className="p-6">
              <ProfileActivityLog entries={auditLogs} />
            </TabPanel>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <ProfileEditForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        employee={employee}
        onSaved={handleProfileSaved}
      />

      <ChangePasswordForm
        isOpen={pwOpen}
        onClose={() => setPwOpen(false)}
      />

      <ProfileAvatarUploader
        isOpen={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        employee={employee}
        onSaved={handleAvatarSaved}
      />
    </div>
  );
}
