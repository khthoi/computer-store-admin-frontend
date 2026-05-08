import type {
  ReviewSummary,
  ReviewDetail,
  ReviewMessage,
  ReviewStats,
  ReviewStatus,
  ReviewSource,
  ModerateReviewPayload,
  AddReviewMessagePayload,
  BulkModeratePayload,
} from "@/src/types/review.types";
import { apiFetch } from "@/src/services/api";

export async function getReviews(params: {
  page:         number;
  limit?:       number;
  search?:      string;
  trangThai?:   ReviewStatus;
  rating?:      number;
  phienBanId?:  number;
  dateFrom?:    string;
  dateTo?:      string;
  chuaTraLoi?:  boolean;
  nguon?:       ReviewSource;
}): Promise<{ data: ReviewSummary[]; total: number }> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  if (params.limit)      qs.set("limit", String(params.limit));
  if (params.search)     qs.set("search", params.search);
  if (params.trangThai)  qs.set("status", params.trangThai);
  if (params.rating)     qs.set("rating", String(params.rating));
  if (params.phienBanId) qs.set("variantId", String(params.phienBanId));
  if (params.dateFrom)   qs.set("dateFrom", params.dateFrom);
  if (params.dateTo)     qs.set("dateTo", params.dateTo);
  if (params.chuaTraLoi) qs.set("chuaTraLoi", "true");
  if (params.nguon)      qs.set("nguon", params.nguon);

  const result = await apiFetch<{ data: ReviewSummary[]; total: number; page: number; limit: number; totalPages: number }>(
    `/admin/reviews?${qs}`,
  );
  return { data: result.data, total: result.total };
}

export async function getReviewStats(): Promise<ReviewStats> {
  return apiFetch<ReviewStats>("/admin/reviews/stats");
}

export async function getReviewDetail(reviewId: number): Promise<ReviewDetail> {
  return apiFetch<ReviewDetail>(`/admin/reviews/${reviewId}`);
}

export async function moderateReview(payload: ModerateReviewPayload): Promise<void> {
  const { reviewId, action, lyDoTuChoi } = payload;

  const endpoint = action === "unhide"
    ? `/admin/reviews/${reviewId}/approve`
    : `/admin/reviews/${reviewId}/${action}`;

  const needsBody = (action === "reject" || action === "hide") && lyDoTuChoi;

  await apiFetch<void>(endpoint, {
    method: "PUT",
    ...(needsBody ? { body: JSON.stringify({ reason: lyDoTuChoi }) } : {}),
  });
}

export async function moderateReviewBulk(payload: BulkModeratePayload): Promise<void> {
  await apiFetch<void>("/admin/reviews/bulk-moderate", {
    method: "POST",
    body: JSON.stringify({
      reviewIds: payload.reviewIds,
      action:    payload.action,
      reason:    payload.lyDoTuChoi,
    }),
  });
}

export async function addReviewMessage(payload: AddReviewMessagePayload): Promise<ReviewMessage> {
  return apiFetch<ReviewMessage>(`/admin/reviews/${payload.reviewId}/reply`, {
    method: "POST",
    body: JSON.stringify({
      content:     payload.noiDung,
      messageType: payload.messageType,
    }),
  });
}
