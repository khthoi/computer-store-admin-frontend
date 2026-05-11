import { z } from "zod";

export const ResetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
      .regex(/[A-Z]/, "Phải có ít nhất một chữ hoa.")
      .regex(/[0-9]/, "Phải có ít nhất một chữ số."),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;
