import { apiFetch } from "@/src/services/api";
import type { KhachHang, DiaChiGiaoHang, CustomerStatus, GenderType } from "@/src/types/customer.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetCustomersResult {
  data: KhachHang[];
  total: number;
}

export interface GetCustomersParams {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateCustomerPayload {
  fullName: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  avatarUrl?: string;
  gender?: GenderType | null;
  dateOfBirth?: string | null;
}

export interface UpdateCustomerPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: CustomerStatus;
  avatarUrl?: string;
  gender?: GenderType | null;
  dateOfBirth?: string | null;
}

export interface CreateAddressPayload {
  recipientName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
}

export interface UpdateAddressPayload {
  recipientName?: string;
  phone?: string;
  addressLine?: string;
  ward?: string;
  district?: string;
  province?: string;
  isDefault?: boolean;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export async function getCustomers(params: GetCustomersParams = {}): Promise<GetCustomersResult> {
  const { q, status, page = 1, limit } = params;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (limit)  qs.set("limit", String(limit));
  if (q)      qs.set("search", q);
  if (status) qs.set("status", status);
  return apiFetch<GetCustomersResult>(`/admin/customers?${qs}`);
}

export async function getCustomerById(id: string): Promise<KhachHang | null> {
  try {
    return await apiFetch<KhachHang>(`/admin/customers/${id}`);
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? '';
    if (msg.startsWith('HTTP 404') || msg.includes('không tồn tại')) return null;
    throw err;
  }
}

export async function getNextCustomerCode(signal?: AbortSignal): Promise<{ code: string }> {
  return apiFetch<{ code: string }>('/admin/customers/next-code', { signal });
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<KhachHang> {
  return apiFetch<KhachHang>('/admin/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<KhachHang> {
  // Strip email/avatarUrl — backend AdminUpdateCustomerDto only accepts profile fields
  const { email: _email, avatarUrl: _avatar, ...body } = payload;
  void _email; void _avatar;
  return apiFetch<KhachHang>(`/admin/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiFetch<void>(`/admin/customers/${id}`, { method: 'DELETE' });
}

export async function updateCustomerStatus(
  id: string,
  status: CustomerStatus
): Promise<void> {
  await apiFetch<void>(`/admin/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function bulkUpdateCustomerStatus(
  ids: string[],
  status: CustomerStatus
): Promise<void> {
  await Promise.all(ids.map((id) => updateCustomerStatus(id, status)));
}

export async function addAddress(
  customerId: string,
  payload: CreateAddressPayload
): Promise<DiaChiGiaoHang> {
  return apiFetch<DiaChiGiaoHang>(`/admin/customers/${customerId}/addresses`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAddress(
  customerId: string,
  addressId: string,
  payload: UpdateAddressPayload
): Promise<DiaChiGiaoHang> {
  return apiFetch<DiaChiGiaoHang>(`/admin/customers/${customerId}/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteAddress(customerId: string, addressId: string): Promise<void> {
  await apiFetch<void>(`/admin/customers/${customerId}/addresses/${addressId}`, { method: 'DELETE' });
}

export async function setDefaultAddress(customerId: string, addressId: string): Promise<void> {
  await apiFetch<void>(`/admin/customers/${customerId}/addresses/${addressId}/default`, { method: 'PUT' });
}
