// ─── Auth user ────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  code: string;
  email: string;
  /** Employee full name (admin). Alias: name (client compat) */
  fullName: string;
  /** Client frontend alias for fullName */
  name?: string;
  avatar?: string | null;
  roles: string[];
}

// ─── Modal modes ──────────────────────────────────────────────────────────────

export type AuthModalMode =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password";

// ─── Form values ─────────────────────────────────────────────────────────────

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export type OAuthProvider = "google" | "facebook";
