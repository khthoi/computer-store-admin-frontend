// ─── Content Management domain types ─────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// 1. MEDIA LIBRARY
// ══════════════════════════════════════════════════════════════════════════════

export type MediaFileType = "image" | "video" | "document" | "audio";

export type MediaStatus = "active" | "unused";

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  fileCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFile {
  id: string;
  folderId: string | null;
  folderName?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileType: MediaFileType;
  url: string;
  thumbnailUrl?: string;
  size: number; // bytes
  width?: number; // for images/videos
  height?: number; // for images/videos
  duration?: number; // seconds, for videos/audio
  altText?: string;
  caption?: string;
  status: MediaStatus;
  usageCount: number;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface MediaUploadParams {
  folderId?: string | null;
  altText?: string;
  caption?: string;
}

export interface MediaListParams {
  q?: string;
  folderId?: string | null;
  fileType?: MediaFileType[];
  page?: number;
  pageSize?: number;
}

export interface MediaListResult {
  data: MediaFile[];
  total: number;
  folders: MediaFolder[];
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. BANNERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Banner positions matching the actual storefront layout:
 *
 * homepage_hero         – 1 hero banner full-width (1920×600). Hiển thị lớn, có CTA.
 * homepage_hero_slider  – Nhiều slides tạo hero carousel. Cùng kích thước hero, có CTA.
 * homepage_small        – 4 banner nhỏ bên dưới hero (sắp theo sortOrder 1-4). Không có CTA.
 * side_banner           – Banner cột bên, xuất hiện ở hầu hết trang storefront.
 * promotions_banner     – Banner trang /promotions. Có badge, CTA, hỗ trợ drag-drop layout.
 */
export type BannerPosition =
  | "homepage_hero"
  | "homepage_hero_slider"
  | "homepage_small"
  | "side_banner"
  | "promotions_banner";

export type BannerStatus = "draft" | "active" | "scheduled" | "ended";

export type BannerLinkTarget = "_self" | "_blank";

export interface Banner {
  id: string;
  title: string;
  position: BannerPosition;
  status: BannerStatus;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkTarget: BannerLinkTarget;
  altText: string;
  /** Overlay headline (hero, slider, promotions) */
  overlayText?: string;
  overlaySubtext?: string;
  /** CTA button label (hero, slider, promotions) – không dùng cho homepage_small */
  ctaLabel?: string;
  ctaUrl?: string;
  /** Badge cho promotions_banner */
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  /**
   * Grid layout cho promotions_banner (managed bởi Puck editor trong PromotionsBannerLayout).
   * gridY = chỉ số hàng (0-based), gridX = vị trí cột trong hàng,
   * gridW = số cột chiếm (1-4), gridH = 1 (Puck không hỗ trợ row-span).
   * Không edit trong banner form — chỉ quản lý qua layout editor.
   */
  gridX?: number;
  gridY?: number;
  gridW?: number;
  gridH?: number;
  sortOrder: number;
  startDate?: string | null;
  endDate?: string | null;
  clickCount: number;
  impressionCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerFormData {
  title: string;
  position: BannerPosition;
  status: BannerStatus;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkTarget: BannerLinkTarget;
  altText: string;
  overlayText?: string;
  overlaySubtext?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  sortOrder: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface BannerListParams {
  q?: string;
  position?: BannerPosition[];
  status?: BannerStatus[];
  page?: number;
  pageSize?: number;
}

export interface BannerListResult {
  data: Banner[];
  total: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. STATIC PAGES
// ══════════════════════════════════════════════════════════════════════════════

export type StaticPageStatus = "draft" | "published" | "archived";

export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  status: StaticPageStatus;
  content: string; // HTML from rich text editor
  seo: SeoMeta;
  template: "default" | "fullwidth" | "sidebar";
  showInFooter: boolean;
  showInHeader: boolean;
  sortOrder: number;
  viewCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface StaticPageFormData {
  title: string;
  slug: string;
  status: StaticPageStatus;
  content: string;
  seo: SeoMeta;
  template: "default" | "fullwidth" | "sidebar";
  showInFooter: boolean;
  showInHeader: boolean;
  sortOrder: number;
}

export interface StaticPageListParams {
  q?: string;
  status?: StaticPageStatus[];
  page?: number;
  pageSize?: number;
}

export interface StaticPageListResult {
  data: StaticPage[];
  total: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. ARTICLES & ARTICLE CATEGORIES
// ══════════════════════════════════════════════════════════════════════════════

export type ArticleStatus = "draft" | "published" | "scheduled" | "archived";

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId: string | null;
  sortOrder: number;
  articleCount: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleCategoryFormData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId: string | null;
  sortOrder: number;
  isVisible: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  categoryId: string;
  categoryName: string;
  excerpt: string;
  content: string; // HTML from rich text editor
  thumbnailUrl?: string;
  bannerUrl?: string;
  tags: string[];
  seo: SeoMeta;
  author: string;
  authorAvatarUrl?: string;
  isFeatured: boolean;
  isPinned: boolean;
  allowComments: boolean;
  viewCount: number;
  readTimeMinutes: number;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleFormData {
  title: string;
  slug: string;
  status: ArticleStatus;
  categoryId: string;
  excerpt: string;
  content: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  tags: string[];
  seo: SeoMeta;
  isFeatured: boolean;
  isPinned: boolean;
  allowComments: boolean;
  publishedAt?: string | null;
  scheduledAt?: string | null;
}

export interface ArticleListParams {
  q?: string;
  status?: ArticleStatus[];
  categoryId?: string[];
  tags?: string[];
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ArticleListResult {
  data: Article[];
  total: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. ANNOUNCEMENTS (Popup + Announcement Bar)
// ══════════════════════════════════════════════════════════════════════════════

export type PopupStatus = "draft" | "active" | "scheduled" | "ended";
export type PopupPosition =
  | "center"
  | "top_left"
  | "top_right"
  | "bottom_left"
  | "bottom_right";
export type PopupTrigger = "on_load" | "on_exit" | "on_scroll" | "on_delay";

export interface Popup {
  id: string;
  name: string;
  status: PopupStatus;
  position: PopupPosition;
  trigger: PopupTrigger;
  delaySeconds?: number;
  scrollPercent?: number;
  title?: string;
  body: string; // HTML
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  showCloseButton: boolean;
  showOnce: boolean; // per session
  targetPages: string[]; // path patterns, empty = all pages
  startDate?: string | null;
  endDate?: string | null;
  viewCount: number;
  clickCount: number;
  closeCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PopupFormData {
  name: string;
  status: PopupStatus;
  position: PopupPosition;
  trigger: PopupTrigger;
  delaySeconds?: number;
  scrollPercent?: number;
  title?: string;
  body: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  showCloseButton: boolean;
  showOnce: boolean;
  targetPages: string[];
  startDate?: string | null;
  endDate?: string | null;
}

export type BarStatus = "draft" | "active" | "scheduled" | "ended";
export type BarPosition = "top" | "bottom";

export interface AnnouncementBar {
  id: string;
  name: string;
  status: BarStatus;
  position: BarPosition;
  content: string; // short text or HTML
  backgroundColor: string; // hex
  textColor: string; // hex
  showCloseButton: boolean;
  isScrolling: boolean; // marquee effect
  linkUrl?: string;
  linkLabel?: string;
  startDate?: string | null;
  endDate?: string | null;
  priority: number;
  viewCount: number;
  clickCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementBarFormData {
  name: string;
  status: BarStatus;
  position: BarPosition;
  content: string;
  backgroundColor: string;
  textColor: string;
  showCloseButton: boolean;
  isScrolling: boolean;
  linkUrl?: string;
  linkLabel?: string;
  startDate?: string | null;
  endDate?: string | null;
  priority: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. NAVIGATION MENUS
// ══════════════════════════════════════════════════════════════════════════════

export type MenuLocation =
  | "header_main"
  | "header_top"
  | "footer_column_1"
  | "footer_column_2"
  | "footer_column_3"
  | "mobile_main"
  | "sidebar";

export type MenuItemType = "link" | "page" | "category" | "product" | "divider";

export interface MenuItem {
  id: string;
  menuId: string;
  parentId: string | null;
  type: MenuItemType;
  label: string;
  url?: string;
  target: "_self" | "_blank";
  icon?: string;
  cssClass?: string;
  sortOrder: number;
  isVisible: boolean;
  children?: MenuItem[];
}

export interface MenuItemFormData {
  parentId: string | null;
  type: MenuItemType;
  label: string;
  url?: string;
  target: "_self" | "_blank";
  icon?: string;
  cssClass?: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface Menu {
  id: string;
  name: string;
  location: MenuLocation;
  description?: string;
  items: MenuItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuListResult {
  data: Menu[];
  total: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// 7. FAQ
// ══════════════════════════════════════════════════════════════════════════════

export interface FAQGroup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isVisible: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FAQGroupFormData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface FAQItem {
  id: string;
  groupId: string;
  groupName: string;
  question: string;
  answer: string; // HTML
  sortOrder: number;
  isVisible: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FAQItemFormData {
  groupId: string;
  question: string;
  answer: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface FAQListParams {
  q?: string;
  groupId?: string[];
  isVisible?: boolean;
  page?: number;
  pageSize?: number;
}

export interface FAQListResult {
  data: FAQItem[];
  total: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// 8. TESTIMONIALS
// ══════════════════════════════════════════════════════════════════════════════

export type TestimonialStatus = "pending" | "approved" | "rejected";
export type TestimonialSource = "manual" | "review" | "social";

export interface Testimonial {
  id: string;
  status: TestimonialStatus;
  source: TestimonialSource;
  customerName: string;
  customerTitle?: string; // "CEO at Company", "Verified Buyer", etc.
  customerAvatarUrl?: string;
  rating: number; // 1-5
  quote: string;
  productName?: string;
  productUrl?: string;
  isHighlighted: boolean;
  sortOrder: number;
  displayPage: "homepage" | "product" | "all";
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialFormData {
  status: TestimonialStatus;
  source: TestimonialSource;
  customerName: string;
  customerTitle?: string;
  customerAvatarUrl?: string;
  rating: number;
  quote: string;
  productName?: string;
  productUrl?: string;
  isHighlighted: boolean;
  sortOrder: number;
  displayPage: "homepage" | "product" | "all";
}

export interface TestimonialListParams {
  q?: string;
  status?: TestimonialStatus[];
  source?: TestimonialSource[];
  isHighlighted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface TestimonialListResult {
  data: Testimonial[];
  total: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// 9. TRUST BADGES
// ══════════════════════════════════════════════════════════════════════════════

export type TrustBadgeIcon =
  | "TruckIcon"
  | "ShieldCheckIcon"
  | "ArrowPathIcon"
  | "PhoneIcon"
  | "CreditCardIcon"
  | "GiftIcon"
  | "StarIcon"
  | "CheckBadgeIcon"
  | "ClockIcon"
  | "MapPinIcon"
  | "TagIcon"
  | "LockClosedIcon";

export interface TrustBadge {
  id: string;
  icon: TrustBadgeIcon;
  title: string;
  subtitle?: string;
  active: boolean;
  sortOrder: number;
}

export interface TrustBadgeFormData {
  icon: TrustBadgeIcon;
  title: string;
  subtitle?: string;
  active: boolean;
  sortOrder: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// 10. CATEGORY SHORTCUTS  (icon slider "Danh mục nổi bật")
// ══════════════════════════════════════════════════════════════════════════════

export interface CategoryShortcut {
  id: string;
  /** Emoji displayed as the icon (e.g. "💻"). One of emoji/iconUrl is required. */
  emoji?: string;
  /** Alternative: URL to a small icon image (PNG/SVG). */
  iconUrl?: string;
  label: string;
  url: string;
  active: boolean;
  sortOrder: number;
}

export interface CategoryShortcutFormData {
  emoji?: string;
  iconUrl?: string;
  label: string;
  url: string;
  active: boolean;
  sortOrder: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// 11. FOOTER CONFIG
// ══════════════════════════════════════════════════════════════════════════════

export type SocialPlatform =
  | "facebook"
  | "youtube"
  | "instagram"
  | "tiktok"
  | "zalo"
  | "twitter"
  | "linkedin";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

/** One column of links in the footer. Title is editable; items come from the
 *  referenced menu (via location). */
export interface FooterLinkColumn {
  /** Display title, e.g. "Hỗ trợ khách hàng" */
  title: string;
  /** Which menu location to pull items from */
  location: "footer_column_1" | "footer_column_2" | "footer_column_3";
}

export interface FooterConfig {
  brand: {
    logoUrl: string;
    logoAlt: string;
    storeName: string;
    description: string;
  };
  contact: {
    address?: string;
    phone?: string;
    email?: string;
    supportHours?: string;
  };
  /** Up to 3 link columns */
  linkColumns: FooterLinkColumn[];
  socialLinks: SocialLink[];
  copyright: string;
  /** Quick links shown in the bottom bar next to copyright */
  bottomLinks: { label: string; url: string }[];
}
