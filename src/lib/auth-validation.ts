import type {
  LoginFormValues,
  RegisterFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from "@/src/types/auth.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_VN_RE = /^(0|84)[0-9]{8,9}$/;
/**
 * Strong password: min 8 chars, at least one uppercase, one digit.
 * Weak: min 8 chars only (we enforce the weak rule and show hints for strong).
 */
const MIN_PASSWORD_LENGTH = 8;

// ─── Login ─────────────────────────────────────────────────────────────────────

export type LoginErrors = Partial<Record<keyof Omit<LoginFormValues, "rememberMe">, string>>;

export function validateLoginForm(values: LoginFormValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.email.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "Địa chỉ email không hợp lệ";
  }

  if (!values.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Mật khẩu ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
  }

  return errors;
}

// ─── Register ─────────────────────────────────────────────────────────────────

export type RegisterErrors = Partial<Record<keyof RegisterFormValues, string>>;

export function validateRegisterForm(values: RegisterFormValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = "Vui lòng nhập họ tên (ít nhất 2 ký tự)";
  }

  if (!values.email.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "Địa chỉ email không hợp lệ";
  }

  if (values.phone.trim() && !PHONE_VN_RE.test(values.phone.replace(/\s/g, ""))) {
    errors.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
  }

  if (!values.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Mật khẩu ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
  } else if (!/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password)) {
    errors.password = "Mật khẩu cần có ít nhất 1 chữ hoa và 1 chữ số";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  return errors;
}

// ─── Forgot password ───────────────────────────────────────────────────────────

export type ForgotPasswordErrors = Partial<Record<keyof ForgotPasswordFormValues, string>>;

export function validateForgotPasswordForm(values: ForgotPasswordFormValues): ForgotPasswordErrors {
  const errors: ForgotPasswordErrors = {};

  if (!values.email.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "Địa chỉ email không hợp lệ";
  }

  return errors;
}

// ─── Reset password ────────────────────────────────────────────────────────────

export type ResetPasswordErrors = Partial<Record<keyof ResetPasswordFormValues, string>>;

export function validateResetPasswordForm(
  values: ResetPasswordFormValues
): ResetPasswordErrors {
  const errors: ResetPasswordErrors = {};

  if (!values.password) {
    errors.password = "Vui lòng nhập mật khẩu mới";
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Mật khẩu ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
  } else if (!/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password)) {
    errors.password = "Mật khẩu cần có ít nhất 1 chữ hoa và 1 chữ số";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  return errors;
}
