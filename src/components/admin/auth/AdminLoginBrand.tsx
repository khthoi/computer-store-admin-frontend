import { ComputerDesktopIcon } from "@heroicons/react/24/solid";

export function AdminLoginBrand() {
  return (
    <div className="mb-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
        <ComputerDesktopIcon className="w-9 h-9 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">
        PC Store Admin
      </h1>
      <p className="mt-1.5 text-sm text-violet-200">
        Hệ thống quản trị nội bộ
      </p>
    </div>
  );
}
