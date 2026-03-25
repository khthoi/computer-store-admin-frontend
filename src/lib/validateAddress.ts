import type { CheckoutFormValues } from "@/src/store/checkout.store";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Address-only fields (subset of CheckoutFormValues, excludes note/saveAddress). */
export type AddressFields = Pick<
  CheckoutFormValues,
  "fullName" | "phone" | "email" | "province" | "district" | "ward" | "addressDetail"
>;

export type AddressErrors = Partial<Record<keyof AddressFields, string>>;

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validates all address fields. Returns an errors map; empty map = all valid.
 * Used by CustomerInfoForm (validate() imperative handle) and EditAddressForm.
 */
export function validateAddress(fields: AddressFields): AddressErrors {
  const errors: AddressErrors = {};

  if (!fields.fullName.trim() || fields.fullName.trim().length < 2) {
    errors.fullName = "Vui lòng nhập họ tên";
  }
  if (!/^(0|84)[0-9]{8,9}$/.test(fields.phone.replace(/\s/g, ""))) {
    errors.phone = "Số điện thoại không hợp lệ";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Email không hợp lệ";
  }
  if (!fields.province.trim()) {
    errors.province = "Vui lòng nhập tỉnh / thành phố";
  }
  if (!fields.district.trim()) {
    errors.district = "Vui lòng nhập quận / huyện";
  }
  if (!fields.ward.trim()) {
    errors.ward = "Vui lòng nhập phường / xã";
  }
  if (!fields.addressDetail.trim()) {
    errors.addressDetail = "Vui lòng nhập địa chỉ cụ thể";
  }

  return errors;
}
