import type { AdminLoginFormValues } from "@/src/lib/validators/login.schema";
import type { LoginResponse } from "@/src/types/auth.types";
import { apiFetch } from "@/src/services/api";

export const AdminAuthService = {
  async login(values: AdminLoginFormValues): Promise<LoginResponse> {
    return apiFetch<LoginResponse>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email: values.email, password: values.password }),
    });
  },

  async logout(): Promise<void> {
    await apiFetch<void>("/auth/logout", { method: "POST" });
  },
};
