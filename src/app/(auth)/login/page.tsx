import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginBrand } from "@/src/components/admin/auth/AdminLoginBrand";
import { AdminLoginForm } from "@/src/components/admin/auth/AdminLoginForm";
import { Spinner } from "@/src/components/ui/Spinner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đăng nhập — PC Store Admin",
  description: "Đăng nhập vào hệ thống quản trị PC Store.",
};

export default function LoginPage() {
  return (
    <>
      <AdminLoginBrand />
      {/* Suspense wraps the form because useSearchParams() requires it in Next.js */}
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Spinner color="white" />
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>

      <p className="mt-6 text-center text-xs text-violet-300">
        © 2026 PC Store — Chỉ dành cho nhân viên nội bộ
      </p>
    </>
  );
}
