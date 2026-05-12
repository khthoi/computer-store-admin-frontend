import type { Metadata } from "next";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { BannerFormClient } from "@/src/components/admin/content/banners/BannerFormClient";
import type { BannerPosition } from "@/src/types/content.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tạo Banner mới" };

const BANNER_POSITIONS: BannerPosition[] = [
  "homepage_hero",
  "homepage_hero_slider",
  "homepage_small",
  "side_banner",
  "promotions_banner",
];

function isBannerPosition(value: string | undefined): value is BannerPosition {
  return value ? BANNER_POSITIONS.includes(value as BannerPosition) : false;
}

export default async function CreateBannerPage({
  searchParams,
}: {
  searchParams: Promise<{ position?: string }>;
}) {
  const params = await searchParams;
  const initialPosition = isBannerPosition(params.position) ? params.position : undefined;

  return (
    <AdminPageWrapper title="Tạo Banner mới">
      <BannerFormClient initialPosition={initialPosition} />
    </AdminPageWrapper>
  );
}

