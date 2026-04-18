"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { PasswordInput } from "@/src/components/ui/PasswordInput";
import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Alert } from "@/src/components/ui/Alert";
import { AdminAuthService } from "@/src/services/admin-auth.service";
import { useAuth } from "@/src/store/auth.store";
import { AdminLoginSchema, type AdminLoginFormValues } from "@/src/lib/validators/login.schema";

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const rememberMe = watch("rememberMe");

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit: SubmitHandler<AdminLoginFormValues> = async (values) => {
    setServerError(null);
    try {
      const { user, accessToken } = await AdminAuthService.login(values);
      login(user, accessToken, values.rememberMe);
      const from = searchParams.get("from") ?? "/";
      router.push(from);
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Đăng nhập thất bại. Vui lòng thử lại."
      );
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-8">
      {/* Card header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-secondary-900">Đăng nhập</h2>
        <p className="mt-1 text-sm text-secondary-500">
          Nhập thông tin tài khoản nhân viên để tiếp tục
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <Alert variant="error" className="mb-5">
          {serverError}
        </Alert>
      )}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="email@techstore.vn"
          autoComplete="email"
          prefixIcon={<EnvelopeIcon />}
          errorMessage={errors.email?.message}
          disabled={isSubmitting}
          fullWidth
          {...register("email")}
        />

        {/* Password */}
        <PasswordInput
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
          errorMessage={errors.password?.message}
          disabled={isSubmitting}
          {...register("password")}
        />

        {/* Remember me */}
        <div className="flex items-center justify-between gap-4">
          <Checkbox
            label="Ghi nhớ đăng nhập"
            checked={rememberMe}
            onChange={(e) => setValue("rememberMe", e.target.checked)}
            disabled={isSubmitting}
          />
          <span className="text-sm text-secondary-400 select-none">
            Liên hệ quản trị viên nếu quên mật khẩu
          </span>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="mt-2 !bg-violet-700 hover:!bg-violet-800"
        >
          Đăng nhập
        </Button>
      </form>

      {/* Demo hint */}
      <div className="mt-6 rounded-lg bg-secondary-50 border border-secondary-200 p-3">
        <p className="text-xs font-medium text-secondary-600 mb-1">Tài khoản demo:</p>
        <p className="text-xs text-secondary-500 font-mono">admin@techstore.vn / Admin123</p>
        <p className="text-xs text-secondary-500 font-mono">staff@techstore.vn / Staff123</p>
      </div>
    </div>
  );
}
