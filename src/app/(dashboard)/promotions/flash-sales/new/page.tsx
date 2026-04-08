export const dynamic = "force-dynamic";

import { FlashSaleFormClient } from "@/src/components/admin/flash-sale/FlashSaleFormClient";

export const metadata = {
  title: "Tạo Flash Sale",
};

export default function NewFlashSalePage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <FlashSaleFormClient />
    </div>
  );
}
