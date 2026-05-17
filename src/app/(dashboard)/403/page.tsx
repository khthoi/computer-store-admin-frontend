"use client";

import { LockClosedIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/store/auth.store";

export const dynamic = "force-dynamic";

export default function ForbiddenPage() {
  const { state } = useAuth();
  const roles = state.user?.roles ?? [];

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <LockClosedIcon className="h-8 w-8 text-red-600" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">
          Không đủ quyền truy cập
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Tài khoản của bạn không có quyền hạn cần thiết để xem trang này.
          Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
        </p>

        {roles.length > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            Vai trò hiện tại:{" "}
            <span className="font-medium text-slate-700">
              {roles.join(", ")}
            </span>
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button href="/" variant="primary" size="md">
            Về trang Dashboard
          </Button>
          <Button
            href="mailto:admin@pcstore.vn"
            variant="outline"
            size="md"
          >
            Liên hệ quản trị viên
          </Button>
        </div>
      </div>
    </div>
  );
}
