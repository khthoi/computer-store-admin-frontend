export const dynamic = "force-dynamic";

import { FlashSalesListClient } from "@/src/components/admin/flash-sale/FlashSalesListClient";

export const metadata = {
  title: "Flash Sales",
};

export default function FlashSalesPage() {
  return <FlashSalesListClient />;
}
