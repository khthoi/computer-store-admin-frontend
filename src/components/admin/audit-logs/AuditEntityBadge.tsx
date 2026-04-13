import Link from "next/link";
import {
  ShoppingBagIcon,
  CubeIcon,
  SwatchIcon,
  UserIcon,
  UsersIcon,
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
  TagIcon,
  TicketIcon,
  BoltIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import type { AuditEntityType } from "@/src/types/audit-log.types";

// ─── Config ───────────────────────────────────────────────────────────────────

interface EntityConfig {
  label: string;
  icon: React.ReactNode;
  /** Base path for entity detail links, e.g. "/orders" */
  basePath?: string;
  colorClass: string;
}

const ENTITY_CONFIG: Record<AuditEntityType, EntityConfig> = {
  DonHang: {
    label: "Đơn hàng",
    icon: <ShoppingBagIcon className="w-3 h-3" />,
    basePath: "/orders",
    colorClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SanPham: {
    label: "Sản phẩm",
    icon: <CubeIcon className="w-3 h-3" />,
    basePath: "/products",
    colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  PhienBan: {
    label: "Phiên bản",
    icon: <SwatchIcon className="w-3 h-3" />,
    colorClass: "bg-violet-50 text-violet-700 border-violet-200",
  },
  KhachHang: {
    label: "Khách hàng",
    icon: <UserIcon className="w-3 h-3" />,
    basePath: "/customers",
    colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  NhanVien: {
    label: "Nhân viên",
    icon: <UsersIcon className="w-3 h-3" />,
    basePath: "/employees",
    colorClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  TonKho: {
    label: "Tồn kho",
    icon: <ArchiveBoxIcon className="w-3 h-3" />,
    basePath: "/inventory",
    colorClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  NhapXuat: {
    label: "Nhập/Xuất kho",
    icon: <ArrowsRightLeftIcon className="w-3 h-3" />,
    colorClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  KhuyenMai: {
    label: "Khuyến mãi",
    icon: <TagIcon className="w-3 h-3" />,
    basePath: "/promotions",
    colorClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  MaGiamGia: {
    label: "Mã giảm giá",
    icon: <TicketIcon className="w-3 h-3" />,
    colorClass: "bg-pink-50 text-pink-700 border-pink-200",
  },
  FlashSale: {
    label: "Flash Sale",
    icon: <BoltIcon className="w-3 h-3" />,
    basePath: "/promotions/flash-sales",
    colorClass: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  DanhGia: {
    label: "Đánh giá",
    icon: <StarIcon className="w-3 h-3" />,
    basePath: "/reviews",
    colorClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  Ticket: {
    label: "Ticket",
    icon: <ChatBubbleLeftRightIcon className="w-3 h-3" />,
    basePath: "/support",
    colorClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  CaiDat: {
    label: "Cài đặt",
    icon: <Cog6ToothIcon className="w-3 h-3" />,
    basePath: "/settings",
    colorClass: "bg-secondary-100 text-secondary-600 border-secondary-200",
  },
  PhanQuyen: {
    label: "Phân quyền",
    icon: <ShieldCheckIcon className="w-3 h-3" />,
    basePath: "/roles",
    colorClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditEntityBadgeProps {
  entityType: AuditEntityType;
  /**
   * When provided together with `linkable`, wraps the badge in a Next.js Link
   * pointing to the entity's detail page.
   */
  entityId?: string;
  /**
   * If true and `entityId` is provided, the badge becomes a clickable link.
   * @default false
   */
  linkable?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AuditEntityBadge — icon + label badge for each AuditEntityType.
 *
 * Link and non-link variants share identical classes applied directly to the
 * rendered element so they always look the same. `w-fit` prevents the badge
 * from stretching inside flex / grid containers regardless of variant.
 *
 * ```tsx
 * <AuditEntityBadge entityType="DonHang" />
 * <AuditEntityBadge entityType="DonHang" entityId="DH-001" linkable />
 * ```
 */
export function AuditEntityBadge({
  entityType,
  entityId,
  linkable = false,
  className = "",
}: AuditEntityBadgeProps) {
  const config = ENTITY_CONFIG[entityType];
  const isLinkable = linkable && Boolean(config.basePath) && Boolean(entityId);

  // Classes are applied directly to the rendered element (Link or span)
  // so both variants are identical in layout — only interactivity differs.
  const badgeClasses = [
    // Layout — w-fit prevents stretching when used inside flex / grid
    "inline-flex items-center gap-1 w-fit",
    // Shape & spacing
    "rounded-full border px-1.5 py-0.5",
    // Typography
    "text-[11px] font-medium leading-none whitespace-nowrap",
    // Semantic color
    config.colorClass,
    // Interactive state — only when linkable
    isLinkable
      ? "hover:brightness-95 transition-colors duration-150 cursor-pointer"
      : "cursor-default",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </>
  );

  if (isLinkable) {
    return (
      <Link
        href={`${config.basePath!}/${entityId}`}
        className={badgeClasses}
        title={`Xem ${config.label} #${entityId}`}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </Link>
    );
  }

  return (
    <span className={badgeClasses}>
      {content}
    </span>
  );
}
