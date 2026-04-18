"use client";

import {
  PencilSquareIcon,
  KeyIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import type { NhanVien } from "@/src/types/employee.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileHeaderProps {
  employee: NhanVien;
  onEditInfo: () => void;
  onChangePassword: () => void;
  onChangeAvatar: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileHeader({
  employee,
  onEditInfo,
  onChangePassword,
  onChangeAvatar,
}: ProfileHeaderProps) {
  return (
    <div className="rounded-2xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
      {/* Gradient cover */}
      <div className="h-28 bg-gradient-to-r from-violet-700 to-violet-500" />

      <div className="px-6 pb-6">
        {/* Avatar row */}
        <div className="flex flex-wrap items-end justify-between gap-4 -mt-12">
          <div className="relative">
            <Avatar
              src={employee.avatarUrl}
              name={employee.fullName}
              size="5xl"
              shape="circle"
              className="ring-4 ring-white shadow-md"
            />
            <button
              type="button"
              aria-label="Đổi ảnh đại diện"
              onClick={onChangeAvatar}
              className="absolute bottom-1 right-1 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-secondary-200 shadow text-secondary-600 hover:bg-secondary-50 transition-colors"
            >
              <CameraIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pb-1">
            <Button variant="secondary" size="sm" onClick={onChangePassword}>
              <KeyIcon className="h-4 w-4" />
              Đổi mật khẩu
            </Button>
            <Button variant="primary" size="sm" onClick={onEditInfo}>
              <PencilSquareIcon className="h-4 w-4" />
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </div>

        {/* Identity */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-secondary-900">
              {employee.fullName}
            </h1>
            <StatusBadge status={employee.status} />
          </div>

          <p className="mt-0.5 text-sm text-secondary-500">
            {employee.code} · {employee.email}
          </p>

          {employee.roleNames.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {employee.roleNames.map((name) => (
                <Badge key={name} variant="primary" size="sm">
                  {name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
