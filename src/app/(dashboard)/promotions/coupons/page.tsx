export const dynamic = "force-dynamic";

/**
 * /promotions/coupons — redirects to /promotions which has a built-in Coupons tab.
 * This route is kept for backwards compatibility and direct linking.
 */
import { redirect } from "next/navigation";

export default function CouponsPage() {
  redirect("/promotions");
}
