import { z } from "zod";

export const AdminLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Địa chỉ email không hợp lệ"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu ít nhất 8 ký tự"),
  rememberMe: z.boolean(),
});

export type AdminLoginFormValues = z.infer<typeof AdminLoginSchema>;
