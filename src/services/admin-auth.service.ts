import type { AdminLoginFormValues } from "@/src/lib/validators/login.schema";
import type { AuthUser, LoginResponse } from "@/src/types/auth.types";

// ─── Mock credentials ─────────────────────────────────────────────────────────

const MOCK_ACCOUNTS: Array<{
  email: string;
  password: string;
  user: AuthUser;
  token: string;
}> = [
  {
    email: "admin@techstore.vn",
    password: "Admin123",
    token: "mock-token-admin-001",
    user: {
      id: "nv-001",
      code: "NV-001",
      email: "admin@techstore.vn",
      fullName: "Nguyễn Văn Hùng",
      avatar: null,
      roles: ["Admin"],
    },
  },
  {
    email: "staff@techstore.vn",
    password: "Staff123",
    token: "mock-token-staff-002",
    user: {
      id: "nv-002",
      code: "NV-002",
      email: "staff@techstore.vn",
      fullName: "Trần Thị Mai",
      avatar: null,
      roles: ["Nhân viên bán hàng"],
    },
  },
];

// ─── Service ──────────────────────────────────────────────────────────────────

export const AdminAuthService = {
  async login(values: AdminLoginFormValues): Promise<LoginResponse> {
    await new Promise((r) => setTimeout(r, 800));

    const account = MOCK_ACCOUNTS.find(
      (a) => a.email === values.email && a.password === values.password
    );

    if (!account) {
      throw new Error("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    }

    return { user: account.user, accessToken: account.token };
  },

  async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
  },
};
