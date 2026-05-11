import { ReviewsListClient } from "@/src/components/admin/reviews/list/ReviewsListClient";

export const dynamic = "force-dynamic";

export default function ReviewsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Quản lý đánh giá</h1>
          <p className="text-sm text-secondary-500 mt-0.5">
            Kiểm duyệt đánh giá sản phẩm từ khách hàng
          </p>
        </div>
      </div>

      <ReviewsListClient />
    </div>
  );
}
