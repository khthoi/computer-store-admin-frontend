import { z } from "zod";

export const membershipTierSchema = z
  .object({
    displayName: z
      .string()
      .min(1, "Tên bậc không được để trống.")
      .max(100, "Tên bậc không được vượt quá 100 ký tự."),
    minPoints: z
      .number({ error: "Điểm tối thiểu phải là số." })
      .int("Điểm tối thiểu phải là số nguyên.")
      .min(0, "Điểm tối thiểu không được âm."),
    unlimited: z.boolean(),
    maxPoints: z
      .number({ error: "Điểm tối đa phải là số." })
      .int("Điểm tối đa phải là số nguyên.")
      .min(0, "Điểm tối đa phải ≥ 0.")
      .optional()
      .nullable(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{3,6}$|^$/, "Màu sắc phải là mã hex hợp lệ (VD: #FFD700).")
      .optional()
      .nullable(),
    description: z.string().max(500).optional().nullable(),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.unlimited) return true;
      if (data.maxPoints == null) return false;
      return data.maxPoints > data.minPoints;
    },
    {
      path: ["maxPoints"],
      message: "Điểm tối đa phải lớn hơn điểm tối thiểu.",
    },
  );

export type MembershipTierFormValues = z.infer<typeof membershipTierSchema>;
