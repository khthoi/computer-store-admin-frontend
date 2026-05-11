import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { ReviewDetailClient } from "@/src/components/admin/reviews/detail/ReviewDetailClient";

export const dynamic = "force-dynamic";

interface ReviewDetailPageProps {
  params: Promise<{ reviewId: string }>;
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { reviewId: reviewIdStr } = await params;
  const reviewId = Number(reviewIdStr);

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/reviews"
          className="inline-flex items-center gap-1 text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" aria-hidden="true" />
          Quay lại danh sách đánh giá
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <ReviewDetailClient reviewId={reviewId} />
      </div>
    </div>
  );
}
