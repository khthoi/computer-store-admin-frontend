import { z } from "zod";

export const UpdateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự.")
    .max(255, "Họ tên không được vượt quá 255 ký tự."),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{8,10}$/, "Số điện thoại không hợp lệ.")
    .or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày không hợp lệ.")
    .nullable()
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileFormValues = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự.")
      .regex(/[A-Z]/, "Phải có ít nhất một chữ hoa.")
      .regex(/[0-9]/, "Phải có ít nhất một chữ số."),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;
