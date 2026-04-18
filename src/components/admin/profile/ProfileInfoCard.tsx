import {
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  CakeIcon,
  CalendarDaysIcon,
  ClockIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import type { NhanVien } from "@/src/types/employee.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileInfoCardProps {
  employee: NhanVien;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

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

// ─── Sub-component ────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 shrink-0 text-secondary-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-secondary-400 mb-0.5">{label}</p>
        <p className="text-secondary-700 break-words">{value}</p>
      </div>
    </li>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileInfoCard({ employee }: ProfileInfoCardProps) {
  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Thông tin cá nhân
      </h2>

      <ul className="space-y-4">
        <InfoRow
          icon={<IdentificationIcon className="h-4 w-4" />}
          label="Mã nhân viên"
          value={employee.code}
        />
        <InfoRow
          icon={<EnvelopeIcon className="h-4 w-4" />}
          label="Email"
          value={employee.email}
        />
        {employee.phone && (
          <InfoRow
            icon={<PhoneIcon className="h-4 w-4" />}
            label="Số điện thoại"
            value={employee.phone}
          />
        )}
        {employee.gender && (
          <InfoRow
            icon={<UserIcon className="h-4 w-4" />}
            label="Giới tính"
            value={GENDER_LABEL[employee.gender] ?? employee.gender}
          />
        )}
        {employee.dateOfBirth && (
          <InfoRow
            icon={<CakeIcon className="h-4 w-4" />}
            label="Ngày sinh"
            value={formatDate(employee.dateOfBirth)}
          />
        )}
        <InfoRow
          icon={<CalendarDaysIcon className="h-4 w-4" />}
          label="Ngày vào làm"
          value={formatDate(employee.hireDate)}
        />
        {employee.lastLoginAt && (
          <InfoRow
            icon={<ClockIcon className="h-4 w-4" />}
            label="Đăng nhập lần cuối"
            value={formatDateTime(employee.lastLoginAt)}
          />
        )}
      </ul>
    </div>
  );
}
