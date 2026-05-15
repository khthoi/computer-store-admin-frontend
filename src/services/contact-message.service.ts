import { apiFetch } from "@/src/services/api";
import type {
  ContactMessageDetail,
  ContactMessageListParams,
  ContactMessageListResult,
  ContactMessageStats,
  UpdateContactMessagePayload,
} from "@/src/types/contact-message.types";

export function getContactMessages(
  params: ContactMessageListParams = {},
): Promise<ContactMessageListResult> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  const query = qs.toString();
  return apiFetch<ContactMessageListResult>(
    `/admin/contact-messages${query ? `?${query}` : ""}`,
  );
}

export function getContactMessageStats(): Promise<ContactMessageStats> {
  return apiFetch<ContactMessageStats>("/admin/contact-messages/stats");
}

export function getContactMessage(id: number): Promise<ContactMessageDetail> {
  return apiFetch<ContactMessageDetail>(`/admin/contact-messages/${id}`);
}

export function updateContactMessage(
  id: number,
  payload: UpdateContactMessagePayload,
): Promise<ContactMessageDetail> {
  return apiFetch<ContactMessageDetail>(`/admin/contact-messages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteContactMessage(id: number): Promise<void> {
  return apiFetch<void>(`/admin/contact-messages/${id}`, { method: "DELETE" });
}
