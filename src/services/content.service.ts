// ─── Content Management service ───────────────────────────────────────────────

import { apiFetch } from "@/src/services/api";
import { hasRenderableImageExtension } from "@/src/lib/media-file";
import type {
  MediaFile,
  MediaFolder,
  MediaListParams,
  MediaListResult,
  MediaUploadParams,
  Banner,
  BannerPosition,
  BannerFormData,
  BannerListParams,
  BannerListResult,
  StaticPage,
  StaticPageFormData,
  StaticPageListParams,
  StaticPageListResult,
  ArticleCategory,
  ArticleCategoryFormData,
  Article,
  ArticleFormData,
  ArticleListParams,
  ArticleListResult,
  Popup,
  PopupFormData,
  AnnouncementBar,
  AnnouncementBarFormData,
  Menu,
  MenuLocation,
  MenuItem,
  MenuItemType,
  MenuItemFormData,
  MenuListResult,
  FAQGroup,
  FAQGroupFormData,
  FAQItem,
  FAQItemFormData,
  FAQListParams,
  FAQListResult,
  Testimonial,
  TestimonialFormData,
  TestimonialListParams,
  TestimonialListResult,
  TrustBadge,
  TrustBadgeFormData,
  CategoryShortcut,
  CategoryShortcutFormData,
  FooterConfig,
} from "@/src/types/content.types";

// ─── Utilities ────────────────────────────────────────────────────────────────

function delay(ms = 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function paginate<T>(list: T[], page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  return { data: list.slice(start, start + pageSize), total: list.length };
}

function matchQ(text: string, q: string) {
  return text.toLowerCase().includes(q.toLowerCase());
}

// ══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════════════

// ─── Media Folders ────────────────────────────────────────────────────────────

const MEDIA_FOLDERS: MediaFolder[] = [
  { id: "f1", name: "Banners", slug: "banners", parentId: null, fileCount: 12, createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-03-20T10:30:00Z" },
  { id: "f2", name: "Sản phẩm", slug: "san-pham", parentId: null, fileCount: 47, createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-04-01T09:00:00Z" },
  { id: "f3", name: "Blog", slug: "blog", parentId: null, fileCount: 23, createdAt: "2025-02-01T08:00:00Z", updatedAt: "2025-04-10T11:00:00Z" },
  { id: "f4", name: "Avatars", slug: "avatars", parentId: null, fileCount: 8, createdAt: "2025-02-15T08:00:00Z", updatedAt: "2025-03-05T10:00:00Z" },
  { id: "f5", name: "Videos", slug: "videos", parentId: null, fileCount: 5, createdAt: "2025-03-01T08:00:00Z", updatedAt: "2025-04-05T14:00:00Z" },
  { id: "f6", name: "Tài liệu", slug: "tai-lieu", parentId: null, fileCount: 3, createdAt: "2025-03-10T08:00:00Z", updatedAt: "2025-04-02T10:00:00Z" },
  { id: "f7", name: "Hero", slug: "hero", parentId: "f1", fileCount: 6, createdAt: "2025-01-15T08:00:00Z", updatedAt: "2025-04-08T09:00:00Z" },
];

// ─── Media Files ──────────────────────────────────────────────────────────────

const MEDIA_FILES: MediaFile[] = [
  { id: "m1", folderId: "f1", folderName: "Banners", folderSlug: "banners", filename: "hero-summer-sale.jpg", originalName: "hero-summer-sale.jpg", mimeType: "image/jpeg", fileType: "image", url: "https://hacom.vn/_next/image?url=https%3A%2F%2Fcdn-files.hacom.vn%2Fhacom%2Fcdn%2FMedia%2FImage%2FBanner%2F20032026%2Ftrangchuuuu.jpg%3Fv%3D2026-03-20T09%3A07%3A50&w=1080&q=75", thumbnailUrl: "https://hacom.vn/_next/image?url=https%3A%2F%2Fcdn-files.hacom.vn%2Fhacom%2Fcdn%2FMedia%2FImage%2FBanner%2F20032026%2Ftrangchuuuu.jpg%3Fv%3D2026-03-20T09%3A07%3A50&w=1080&q=75", size: 245760, width: 1920, height: 600, altText: "Summer Sale Banner", status: "active", usageCount: 3, uploadedBy: "Admin", uploadedAt: "2025-03-01T08:00:00Z", updatedAt: "2025-03-01T08:00:00Z" },
  { id: "m2", folderId: "f1", folderName: "Banners", folderSlug: "banners", filename: "hero-tech-week.jpg", originalName: "hero-tech-week.jpg", mimeType: "image/jpeg", fileType: "image", url: "https://placehold.co/1920x600/8b5cf6/white?text=Tech+Week", thumbnailUrl: "https://placehold.co/300x100/8b5cf6/white?text=Tech+Week", size: 312400, width: 1920, height: 600, altText: "Tech Week Banner", status: "active", usageCount: 1, uploadedBy: "Admin", uploadedAt: "2025-03-15T09:00:00Z", updatedAt: "2025-03-15T09:00:00Z" },
  { id: "m3", folderId: "f2", folderName: "Sản phẩm", folderSlug: "san-pham", filename: "laptop-asus-01.jpg", originalName: "laptop-asus-01.jpg", mimeType: "image/jpeg", fileType: "image", url: "https://placehold.co/800x600/f3f4f6/374151?text=Laptop+ASUS", thumbnailUrl: "https://placehold.co/200x150/f3f4f6/374151?text=ASUS", size: 98304, width: 800, height: 600, altText: "Laptop ASUS VivoBook", status: "active", usageCount: 12, uploadedBy: "Staff01", uploadedAt: "2025-02-10T10:00:00Z", updatedAt: "2025-02-10T10:00:00Z" },
  { id: "m4", folderId: "f2", folderName: "Sản phẩm", folderSlug: "san-pham", filename: "macbook-pro-m3.jpg", originalName: "macbook-pro-m3.jpg", mimeType: "image/jpeg", fileType: "image", url: "https://placehold.co/800x600/f3f4f6/374151?text=MacBook+Pro", thumbnailUrl: "https://placehold.co/200x150/f3f4f6/374151?text=MacBook", size: 124928, width: 800, height: 600, altText: "MacBook Pro M3", status: "active", usageCount: 8, uploadedBy: "Staff01", uploadedAt: "2025-02-12T11:00:00Z", updatedAt: "2025-02-12T11:00:00Z" },
  { id: "m5", folderId: "f3", folderName: "Blog", folderSlug: "blog", filename: "blog-gaming-setup.jpg", originalName: "blog-gaming-setup.jpg", mimeType: "image/jpeg", fileType: "image", url: "https://placehold.co/1200x628/1e293b/e2e8f0?text=Gaming+Setup", thumbnailUrl: "https://placehold.co/300x157/1e293b/e2e8f0?text=Gaming", size: 187392, width: 1200, height: 628, altText: "Gaming Setup Guide", status: "active", usageCount: 2, uploadedBy: "Writer01", uploadedAt: "2025-03-05T14:00:00Z", updatedAt: "2025-03-05T14:00:00Z" },
  { id: "m6", folderId: "f3", folderName: "Blog", folderSlug: "blog", filename: "blog-laptop-review.jpg", originalName: "blog-laptop-review.jpg", mimeType: "image/jpeg", fileType: "image", url: "https://placehold.co/1200x628/0f172a/f8fafc?text=Laptop+Review", thumbnailUrl: "https://placehold.co/300x157/0f172a/f8fafc?text=Review", size: 156672, width: 1200, height: 628, status: "active", usageCount: 1, uploadedBy: "Writer01", uploadedAt: "2025-03-20T09:00:00Z", updatedAt: "2025-03-20T09:00:00Z" },
  { id: "m7", folderId: "f5", folderName: "Videos", folderSlug: "videos", filename: "product-demo-q1.mp4", originalName: "product-demo-q1.mp4", mimeType: "video/mp4", fileType: "video", url: "https://example.com/videos/product-demo-q1.mp4", thumbnailUrl: "https://placehold.co/300x200/0ea5e9/white?text=Video", size: 52428800, width: 1920, height: 1080, duration: 125, altText: "Product Demo Q1 2025", status: "active", usageCount: 1, uploadedBy: "Admin", uploadedAt: "2025-04-01T10:00:00Z", updatedAt: "2025-04-01T10:00:00Z" },
  { id: "m8", folderId: "f6", folderName: "Tài liệu", folderSlug: "tai-lieu", filename: "warranty-policy.pdf", originalName: "warranty-policy.pdf", mimeType: "application/pdf", fileType: "document", url: "https://example.com/docs/warranty-policy.pdf", size: 204800, status: "active", usageCount: 5, uploadedBy: "Admin", uploadedAt: "2025-01-20T08:00:00Z", updatedAt: "2025-02-05T08:00:00Z" },
  { id: "m9", folderId: null, folderName: undefined, filename: "favicon.png", originalName: "favicon.png", mimeType: "image/png", fileType: "image", url: "https://placehold.co/64x64/3b82f6/white?text=F", thumbnailUrl: "https://placehold.co/64x64/3b82f6/white?text=F", size: 4096, width: 64, height: 64, altText: "Favicon", status: "active", usageCount: 1, uploadedBy: "Admin", uploadedAt: "2025-01-10T08:00:00Z", updatedAt: "2025-01-10T08:00:00Z" },
  { id: "m10", folderId: "f1", folderName: "Banners", folderSlug: "banners", filename: "flash-sale-banner.jpg", originalName: "flash-sale-banner.jpg", mimeType: "image/jpeg", fileType: "image", url: "https://placehold.co/1920x400/ef4444/white?text=Flash+Sale", thumbnailUrl: "https://placehold.co/300x63/ef4444/white?text=Flash+Sale", size: 189440, width: 1920, height: 400, altText: "Flash Sale Banner", status: "active", usageCount: 2, uploadedBy: "Staff02", uploadedAt: "2025-04-05T08:00:00Z", updatedAt: "2025-04-05T08:00:00Z" },
  { id: "m11", folderId: "f2", folderName: "Sản phẩm", folderSlug: "san-pham", filename: "keyboard-keychron.jpg", originalName: "keyboard-keychron.jpg", mimeType: "image/jpeg", fileType: "image", url: "https://placehold.co/800x600/f5f5f4/292524?text=Keyboard", thumbnailUrl: "https://placehold.co/200x150/f5f5f4/292524?text=Keyboard", size: 75776, width: 800, height: 600, altText: "Keychron K2 Keyboard", status: "unused", usageCount: 0, uploadedBy: "Staff01", uploadedAt: "2025-04-08T10:00:00Z", updatedAt: "2025-04-08T10:00:00Z" },
  { id: "m12", folderId: "f4", folderName: "Avatars", folderSlug: "avatars", filename: "avatar-nguyen-van-a.jpg", originalName: "avatar-nguyen-van-a.jpg", mimeType: "image/jpeg", fileType: "image", url: "https://placehold.co/200x200/e0e7ff/4338ca?text=A", thumbnailUrl: "https://placehold.co/200x200/e0e7ff/4338ca?text=A", size: 32768, width: 200, height: 200, altText: "Avatar Nguyễn Văn A", status: "active", usageCount: 4, uploadedBy: "Admin", uploadedAt: "2025-02-20T08:00:00Z", updatedAt: "2025-02-20T08:00:00Z" },
];

// ─── Banners ──────────────────────────────────────────────────────────────────

const BANNERS: Banner[] = [
  // ── Homepage hero ──────────────────────────────────────────────────────────
  { id: "b1", title: "COMBO SIÊU HỜI PC & LAPTOP", position: "homepage_hero", status: "active", imageUrl: "https://placehold.co/1920x600/1e40af/white?text=COMBO+SIEU+HOI+PC+%26+LAPTOP", mobileImageUrl: "https://placehold.co/768x400/1e40af/white?text=COMBO+Mobile", linkUrl: "/promotions/combo-pc-laptop", linkTarget: "_self", altText: "Combo siêu hời PC & Laptop – giảm đến 40%", overlayText: "COMBO SIÊU HỜI PC & LAPTOP", overlaySubtext: "Giảm đến 40% + Trả góp 0%", ctaLabel: "CHỐT ĐƠN NGAY", sortOrder: 1, startDate: "2025-04-01", endDate: "2025-10-31", clickCount: 4210, impressionCount: 28500, createdBy: "Admin", createdAt: "2025-03-20T08:00:00Z", updatedAt: "2025-04-01T08:00:00Z" },
  // ── Homepage hero slider ───────────────────────────────────────────────────
  { id: "b2", title: "Laptop Gaming RTX 4060 – Chiến mượt mọi game", position: "homepage_hero_slider", status: "active", imageUrl: "https://placehold.co/1920x600/2563eb/white?text=Gaming+RTX+4060", linkUrl: "/products?category=gaming-laptop", linkTarget: "_self", altText: "Laptop Gaming RTX 4060", overlayText: "CHIẾN MƯỢT MỌI GAME", overlaySubtext: "RTX 4060 – FPS không giới hạn", ctaLabel: "Xem ngay", sortOrder: 1, clickCount: 1850, impressionCount: 18700, createdBy: "Admin", createdAt: "2025-03-25T08:00:00Z", updatedAt: "2025-03-25T08:00:00Z" },
  { id: "b3", title: "MacBook Pro M4 – Ra mắt chính thức", position: "homepage_hero_slider", status: "active", imageUrl: "https://placehold.co/1920x600/0f172a/e2e8f0?text=MacBook+Pro+M4", linkUrl: "/products/macbook-pro-m4", linkTarget: "_self", altText: "MacBook Pro M4 chính thức ra mắt", overlayText: "MacBook Pro M4", overlaySubtext: "Hiệu năng AI vượt trội – Thời lượng pin 22h", ctaLabel: "Đặt trước ngay", sortOrder: 2, clickCount: 3120, impressionCount: 22400, createdBy: "Admin", createdAt: "2025-04-02T08:00:00Z", updatedAt: "2025-04-02T08:00:00Z" },
  { id: "b4", title: "PC Gaming Build – Tự lắp ráp theo cấu hình", position: "homepage_hero_slider", status: "active", imageUrl: "https://placehold.co/1920x600/dc2626/white?text=PC+Gaming+Build", linkUrl: "/pc-builder", linkTarget: "_self", altText: "PC Gaming Build – Tự lắp ráp", overlayText: "TỰ LẮP RÁP PC GAMING", overlaySubtext: "Chọn từng linh kiện – Bảo hành toàn bộ", ctaLabel: "Build PC ngay", sortOrder: 3, clickCount: 2670, impressionCount: 19800, createdBy: "Staff01", createdAt: "2025-04-05T08:00:00Z", updatedAt: "2025-04-05T08:00:00Z" },
  // ── Homepage small (4 ô nhỏ bên dưới hero, không CTA) ────────────────────
  { id: "b5", title: "Laptop Sale Cực Sốc", position: "homepage_small", status: "active", imageUrl: "https://placehold.co/480x270/0369a1/white?text=Laptop+Sale", linkUrl: "/products?category=laptop&sale=true", linkTarget: "_self", altText: "Laptop Sale cực sốc", sortOrder: 1, clickCount: 980, impressionCount: 8200, createdBy: "Admin", createdAt: "2025-04-01T08:00:00Z", updatedAt: "2025-04-01T08:00:00Z" },
  { id: "b6", title: "Mega Sale PC & Linh Kiện", position: "homepage_small", status: "active", imageUrl: "https://placehold.co/480x270/b45309/white?text=Mega+Sale+PC", linkUrl: "/products?category=components&sale=true", linkTarget: "_self", altText: "Mega Sale PC và linh kiện", sortOrder: 2, clickCount: 754, impressionCount: 7100, createdBy: "Admin", createdAt: "2025-04-01T08:00:00Z", updatedAt: "2025-04-01T08:00:00Z" },
  { id: "b7", title: "CPU AMD Ryzen – Giá Tốt", position: "homepage_small", status: "active", imageUrl: "https://placehold.co/480x270/4d7c0f/white?text=CPU+AMD+Ryzen", linkUrl: "/products?brand=amd&category=cpu", linkTarget: "_self", altText: "CPU AMD Ryzen giá tốt nhất", sortOrder: 3, clickCount: 621, impressionCount: 6400, createdBy: "Staff01", createdAt: "2025-04-02T08:00:00Z", updatedAt: "2025-04-02T08:00:00Z" },
  { id: "b8", title: "Laptop Gaming Sale – Giảm 50%", position: "homepage_small", status: "active", imageUrl: "https://placehold.co/480x270/7e22ce/white?text=Gaming+50%25", linkUrl: "/products?category=gaming-laptop&sale=true", linkTarget: "_self", altText: "Laptop gaming giảm 50%", sortOrder: 4, clickCount: 1130, impressionCount: 9500, createdBy: "Admin", createdAt: "2025-04-02T08:00:00Z", updatedAt: "2025-04-02T08:00:00Z" },
  // ── Side banners ───────────────────────────────────────────────────────────
  { id: "b9", title: "Side – Bảo hành 24 tháng", position: "side_banner", status: "active", imageUrl: "https://placehold.co/200x600/0f766e/white?text=Bao+Hanh+24T", linkUrl: "/policies/warranty", linkTarget: "_self", altText: "Bảo hành chính hãng 24 tháng", sortOrder: 1, clickCount: 312, impressionCount: 14200, createdBy: "Admin", createdAt: "2025-01-15T08:00:00Z", updatedAt: "2025-01-15T08:00:00Z" },
  { id: "b10", title: "Side – Trả góp 0% lãi suất", position: "side_banner", status: "active", imageUrl: "https://placehold.co/200x600/be185d/white?text=Tra+Gop+0%25", linkUrl: "/installment", linkTarget: "_self", altText: "Trả góp 0% lãi suất", sortOrder: 2, clickCount: 445, impressionCount: 16800, createdBy: "Admin", createdAt: "2025-01-15T08:00:00Z", updatedAt: "2025-01-15T08:00:00Z" },
  // ── Promotions page banners (gridX/Y = vị trí, gridW/H = số cột/hàng chiếm) ──
  // Row 0: Laptop (2 cột trái) | Mega Sale (2 cột phải)
  { id: "b11", title: "Laptop Sale Cực Sốc", position: "promotions_banner", status: "active", imageUrl: "https://placehold.co/960x400/0369a1/white?text=Laptop+Sale+Cuc+Soc", linkUrl: "/products?category=laptop&sale=true", linkTarget: "_self", altText: "Laptop Sale Cực Sốc", overlayText: "LAPTOP SALE CỰC SỐC", overlaySubtext: "Học tập · Làm việc · Cứu trợ", ctaLabel: "Xem ưu đãi", ctaUrl: "/products?category=laptop&sale=true", badge: "HOT", badgeColor: "#ef4444", badgeTextColor: "#ffffff", gridX: 0, gridY: 0, gridW: 2, gridH: 1, sortOrder: 1, clickCount: 1650, impressionCount: 11200, createdBy: "Admin", createdAt: "2025-04-01T08:00:00Z", updatedAt: "2025-04-01T08:00:00Z" },
  { id: "b12", title: "Mega Sale PC & Linh Kiện", position: "promotions_banner", status: "active", imageUrl: "https://placehold.co/960x400/b45309/white?text=Mega+Sale+PC+%26+Linh+Kien", linkUrl: "/products?category=components&sale=true", linkTarget: "_self", altText: "Mega Sale PC & Linh Kiện", overlayText: "MEGA SALE PC & LINH KIỆN", overlaySubtext: "Chính hãng 100%", ctaLabel: "Mua ngay", ctaUrl: "/products?category=components&sale=true", badge: "SALE 50%", badgeColor: "#f59e0b", badgeTextColor: "#1c1917", gridX: 2, gridY: 0, gridW: 2, gridH: 1, sortOrder: 2, clickCount: 1280, impressionCount: 9800, createdBy: "Admin", createdAt: "2025-04-01T08:00:00Z", updatedAt: "2025-04-01T08:00:00Z" },
  // Row 1: Gaming Gear (1 cột) | Màn hình 4K (1 cột) | Banner dọc bên phải chiếm 2 cột x 2 hàng
  { id: "b13", title: "Gaming Gear – Bộ phụ kiện", position: "promotions_banner", status: "active", imageUrl: "https://placehold.co/480x300/7e22ce/white?text=Gaming+Gear", linkUrl: "/products?category=gaming-gear", linkTarget: "_self", altText: "Gaming Gear bộ phụ kiện gaming", overlayText: "GAMING GEAR", overlaySubtext: "Chuột · Bàn phím · Tai nghe", ctaLabel: "Khám phá", ctaUrl: "/products?category=gaming-gear", badge: "NEW", badgeColor: "#16a34a", badgeTextColor: "#ffffff", gridX: 0, gridY: 1, gridW: 1, gridH: 1, sortOrder: 3, clickCount: 870, impressionCount: 7400, createdBy: "Staff01", createdAt: "2025-04-03T08:00:00Z", updatedAt: "2025-04-03T08:00:00Z" },
  { id: "b14", title: "Màn hình 4K – Sắc nét đỉnh cao", position: "promotions_banner", status: "active", imageUrl: "https://placehold.co/480x300/0f172a/60a5fa?text=Man+Hinh+4K", linkUrl: "/products?category=monitor", linkTarget: "_self", altText: "Màn hình 4K sắc nét", overlayText: "MÀN HÌNH 4K", overlaySubtext: "144Hz · HDR · IPS", ctaLabel: "Xem sản phẩm", ctaUrl: "/products?category=monitor", gridX: 1, gridY: 1, gridW: 1, gridH: 1, sortOrder: 4, clickCount: 560, impressionCount: 5900, createdBy: "Staff01", createdAt: "2025-04-04T08:00:00Z", updatedAt: "2025-04-04T08:00:00Z" },
  // Banner dọc bên phải: 2 cột rộng, 2 hàng cao (minh họa row-span)
  { id: "b16", title: "PC Workstation – Sức mạnh chuyên nghiệp", position: "promotions_banner", status: "active", imageUrl: "https://placehold.co/480x600/1e3a8a/white?text=PC+Workstation", linkUrl: "/products?category=workstation", linkTarget: "_self", altText: "PC Workstation chuyên nghiệp", overlayText: "PC WORKSTATION", overlaySubtext: "Sức mạnh cho người chuyên nghiệp", ctaLabel: "Khám phá ngay", ctaUrl: "/products?category=workstation", badge: "PRO", badgeColor: "#1e3a8a", badgeTextColor: "#ffffff", gridX: 2, gridY: 1, gridW: 2, gridH: 2, sortOrder: 5, clickCount: 420, impressionCount: 4800, createdBy: "Admin", createdAt: "2025-04-05T08:00:00Z", updatedAt: "2025-04-05T08:00:00Z" },
  // Row 2 trái: Flash Sale full width còn lại (2 cột)
  { id: "b15", title: "Flash Sale Cuối Tuần", position: "promotions_banner", status: "scheduled", imageUrl: "https://placehold.co/960x300/dc2626/white?text=Flash+Sale+Cuoi+Tuan", linkUrl: "/promotions/flash-sales", linkTarget: "_self", altText: "Flash Sale Cuối Tuần", overlayText: "FLASH SALE CUỐI TUẦN", overlaySubtext: "Ưu đãi kết thúc sau 48 giờ", ctaLabel: "Xem Flash Sale", ctaUrl: "/promotions/flash-sales", badge: "⚡ FLASH", badgeColor: "#dc2626", badgeTextColor: "#ffffff", gridX: 0, gridY: 2, gridW: 2, gridH: 1, sortOrder: 6, startDate: "2025-04-19", endDate: "2025-04-20", clickCount: 0, impressionCount: 0, createdBy: "Admin", createdAt: "2025-04-10T08:00:00Z", updatedAt: "2025-04-10T08:00:00Z" },
];

// ─── Static Pages ──────────────────────────────────────────────────────────────

const STATIC_PAGES: StaticPage[] = [
  { id: "sp1", title: "Chính sách bảo hành", slug: "chinh-sach-bao-hanh", status: "published", content: "<h2>Chính sách bảo hành</h2><p>Tất cả sản phẩm tại PC Store đều được bảo hành chính hãng từ 12-24 tháng...</p>", seo: { title: "Chính sách bảo hành - PC Store", description: "Xem chi tiết chính sách bảo hành sản phẩm tại PC Store" }, template: "default", showInFooter: true, showInHeader: false, sortOrder: 1, viewCount: 4320, createdBy: "Admin", createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-03-20T10:00:00Z", publishedAt: "2025-01-15T08:00:00Z" },
  { id: "sp2", title: "Chính sách đổi trả", slug: "chinh-sach-doi-tra", status: "published", content: "<h2>Chính sách đổi trả</h2><p>PC Store hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày mua...</p>", seo: { title: "Chính sách đổi trả - PC Store", description: "PC Store hỗ trợ đổi trả trong vòng 7 ngày" }, template: "default", showInFooter: true, showInHeader: false, sortOrder: 2, viewCount: 3190, createdBy: "Admin", createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-02-15T08:00:00Z", publishedAt: "2025-01-15T08:00:00Z" },
  { id: "sp3", title: "Chính sách bảo mật", slug: "chinh-sach-bao-mat", status: "published", content: "<h2>Chính sách bảo mật</h2><p>PC Store cam kết bảo vệ thông tin cá nhân của khách hàng...</p>", seo: { title: "Chính sách bảo mật - PC Store" }, template: "default", showInFooter: true, showInHeader: false, sortOrder: 3, viewCount: 1280, createdBy: "Admin", createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-01-10T08:00:00Z", publishedAt: "2025-01-15T08:00:00Z" },
  { id: "sp4", title: "Về chúng tôi", slug: "ve-chung-toi", status: "published", content: "<h2>PC Store - Chuyên gia công nghệ</h2><p>Được thành lập năm 2018, PC Store là một trong những nhà bán lẻ công nghệ hàng đầu Việt Nam...</p>", seo: { title: "Về chúng tôi - PC Store", description: "Tìm hiểu về PC Store - nhà bán lẻ công nghệ hàng đầu" }, template: "fullwidth", showInFooter: true, showInHeader: true, sortOrder: 1, viewCount: 5670, createdBy: "Admin", createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-04-01T10:00:00Z", publishedAt: "2025-01-15T08:00:00Z" },
  { id: "sp5", title: "Hướng dẫn mua hàng", slug: "huong-dan-mua-hang", status: "published", content: "<h2>Hướng dẫn mua hàng</h2><p>Quy trình mua hàng tại PC Store rất đơn giản...</p>", seo: { title: "Hướng dẫn mua hàng - PC Store" }, template: "sidebar", showInFooter: true, showInHeader: false, sortOrder: 4, viewCount: 2340, createdBy: "Admin", createdAt: "2025-01-15T08:00:00Z", updatedAt: "2025-02-20T08:00:00Z", publishedAt: "2025-01-20T08:00:00Z" },
  { id: "sp6", title: "Tuyển dụng", slug: "tuyen-dung", status: "draft", content: "<h2>Cơ hội nghề nghiệp tại PC Store</h2><p>Chúng tôi đang tìm kiếm những tài năng...</p>", seo: { title: "Tuyển dụng - PC Store" }, template: "default", showInFooter: false, showInHeader: false, sortOrder: 10, viewCount: 0, createdBy: "Admin", createdAt: "2025-04-10T08:00:00Z", updatedAt: "2025-04-10T08:00:00Z", publishedAt: null },
];

// ─── Article Categories ───────────────────────────────────────────────────────

const ARTICLE_CATEGORIES: ArticleCategory[] = [
  { id: "ac1", name: "Đánh giá sản phẩm", slug: "danh-gia-san-pham", description: "Đánh giá chi tiết các sản phẩm công nghệ", parentId: null, sortOrder: 1, articleCount: 18, isVisible: true, createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-04-01T10:00:00Z" },
  { id: "ac2", name: "Hướng dẫn sử dụng", slug: "huong-dan-su-dung", description: "Hướng dẫn chi tiết cách sử dụng các thiết bị", parentId: null, sortOrder: 2, articleCount: 12, isVisible: true, createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-03-15T10:00:00Z" },
  { id: "ac3", name: "Tin tức công nghệ", slug: "tin-tuc-cong-nghe", description: "Cập nhật tin tức công nghệ mới nhất", parentId: null, sortOrder: 3, articleCount: 25, isVisible: true, createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-04-12T10:00:00Z" },
  { id: "ac4", name: "Mẹo & Thủ thuật", slug: "meo-thu-thuat", description: "Các mẹo hữu ích khi sử dụng thiết bị công nghệ", parentId: null, sortOrder: 4, articleCount: 9, isVisible: true, createdAt: "2025-02-01T08:00:00Z", updatedAt: "2025-03-20T10:00:00Z" },
  { id: "ac5", name: "Laptop", slug: "laptop", description: "Đánh giá và hướng dẫn về laptop", parentId: "ac1", sortOrder: 1, articleCount: 10, isVisible: true, createdAt: "2025-01-15T08:00:00Z", updatedAt: "2025-04-05T10:00:00Z" },
  { id: "ac6", name: "Màn hình", slug: "man-hinh", description: "Đánh giá và hướng dẫn về màn hình", parentId: "ac1", sortOrder: 2, articleCount: 5, isVisible: true, createdAt: "2025-01-15T08:00:00Z", updatedAt: "2025-03-10T10:00:00Z" },
];

// ─── Articles ─────────────────────────────────────────────────────────────────

const ARTICLES: Article[] = [
  { id: "a1", title: "Đánh giá MacBook Pro M3 - Đỉnh cao hiệu năng 2024", slug: "danh-gia-macbook-pro-m3", status: "published", categoryId: "ac5", categoryName: "Laptop", excerpt: "Apple vừa ra mắt MacBook Pro M3 với hiệu năng vượt trội so với thế hệ trước. Hãy cùng chúng tôi khám phá chi tiết...", content: "<h2>Thiết kế</h2><p>MacBook Pro M3 giữ nguyên thiết kế quen thuộc...</p><h2>Hiệu năng</h2><p>Chip M3 mang lại hiệu năng vượt trội...</p>", thumbnailUrl: "https://placehold.co/600x400/1e293b/f8fafc?text=MacBook+Pro+M3", bannerUrl: "https://placehold.co/1200x628/1e293b/f8fafc?text=MacBook+Pro+M3+Review", tags: ["macbook", "apple", "laptop", "m3"], seo: { title: "Đánh giá MacBook Pro M3 2024 - PC Store", description: "Review chi tiết MacBook Pro M3 - thiết kế, hiệu năng, pin và giá bán tại Việt Nam" }, author: "Nguyễn Văn A", authorAvatarUrl: "https://placehold.co/40x40/6366f1/white?text=A", isFeatured: true, isPinned: false, allowComments: true, viewCount: 8920, readTimeMinutes: 8, publishedAt: "2025-03-15T08:00:00Z", createdAt: "2025-03-10T08:00:00Z", updatedAt: "2025-03-15T09:00:00Z" },
  { id: "a2", title: "Top 5 gaming setup dưới 30 triệu đồng", slug: "top-5-gaming-setup-duoi-30-trieu", status: "published", categoryId: "ac4", categoryName: "Mẹo & Thủ thuật", excerpt: "Xây dựng một bộ gaming setup hoàn chỉnh với ngân sách 30 triệu đồng không còn là điều khó khăn...", content: "<h2>1. Laptop Gaming</h2><p>ASUS ROG Zephyrus G14 là lựa chọn hàng đầu...</p>", thumbnailUrl: "https://placehold.co/600x400/0f172a/e2e8f0?text=Gaming+Setup", tags: ["gaming", "setup", "guide"], seo: { title: "Top 5 Gaming Setup dưới 30 triệu - PC Store" }, author: "Trần Thị B", isFeatured: true, isPinned: true, allowComments: true, viewCount: 12400, readTimeMinutes: 6, publishedAt: "2025-03-20T08:00:00Z", createdAt: "2025-03-18T08:00:00Z", updatedAt: "2025-03-20T09:00:00Z" },
  { id: "a3", title: "Hướng dẫn chọn mua màn hình gaming 2025", slug: "huong-dan-chon-mua-man-hinh-gaming-2025", status: "published", categoryId: "ac6", categoryName: "Màn hình", excerpt: "Màn hình gaming cần có những thông số kỹ thuật gì? Hãy cùng tìm hiểu...", content: "<h2>Tần số quét (Refresh Rate)</h2><p>Tần số quét tối thiểu cho gaming là 144Hz...</p>", thumbnailUrl: "https://placehold.co/600x400/0ea5e9/white?text=Gaming+Monitor", tags: ["gaming", "monitor", "guide", "2025"], seo: { title: "Hướng dẫn chọn màn hình gaming 2025 - PC Store" }, author: "Lê Văn C", isFeatured: false, isPinned: false, allowComments: true, viewCount: 5670, readTimeMinutes: 5, publishedAt: "2025-04-01T08:00:00Z", createdAt: "2025-03-28T08:00:00Z", updatedAt: "2025-04-01T09:00:00Z" },
  { id: "a4", title: "So sánh ASUS VivoBook 15 vs Acer Aspire 5 2025", slug: "so-sanh-asus-vivobook-vs-acer-aspire-2025", status: "draft", categoryId: "ac5", categoryName: "Laptop", excerpt: "Hai mẫu laptop tầm trung phổ biến nhất thị trường 2025 đối đầu trực tiếp...", content: "<h2>Thiết kế và xây dựng</h2><p>Cả hai đều có thiết kế nhựa nhưng...</p>", thumbnailUrl: "https://placehold.co/600x400/6366f1/white?text=ASUS+vs+Acer", tags: ["laptop", "comparison", "asus", "acer"], seo: {}, author: "Nguyễn Văn A", isFeatured: false, isPinned: false, allowComments: true, viewCount: 0, readTimeMinutes: 7, publishedAt: null, createdAt: "2025-04-10T08:00:00Z", updatedAt: "2025-04-12T10:00:00Z" },
  { id: "a5", title: "Apple WWDC 2025 - Những điểm nổi bật", slug: "apple-wwdc-2025-diem-noi-bat", status: "scheduled", categoryId: "ac3", categoryName: "Tin tức công nghệ", excerpt: "Apple vừa tổ chức WWDC 2025 với nhiều thông báo đáng chú ý về iOS 19, macOS 16...", content: "<h2>iOS 19</h2><p>Apple Intelligence được tích hợp sâu hơn...</p>", thumbnailUrl: "https://placehold.co/600x400/1d4ed8/white?text=WWDC+2025", tags: ["apple", "wwdc", "ios", "macos"], seo: { title: "WWDC 2025 - PC Store News" }, author: "Phạm Thị D", isFeatured: false, isPinned: false, allowComments: true, viewCount: 0, readTimeMinutes: 4, publishedAt: null, scheduledAt: "2025-06-10T08:00:00Z", createdAt: "2025-04-11T08:00:00Z", updatedAt: "2025-04-11T08:00:00Z" },
];

// ─── Popups ───────────────────────────────────────────────────────────────────

// ─── Announcement Bars ────────────────────────────────────────────────────────

// ─── Navigation Menus ─────────────────────────────────────────────────────────
// Header quick-links are a FLAT list — no nesting.
// The "Danh mục" mega-menu is auto-generated from the category tree on the
// client (no manual config here). URLs follow /products/{slug-cha}/{slug-con}.

const MENUS: Menu[] = [
  {
    id: "mn1", name: "Header chính", location: "header_main",
    description: "Liên kết nhanh hiển thị ngay trên thanh điều hướng",
    isActive: true, createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-04-01T10:00:00Z",
    items: [
      { id: "mi1",  menuId: "mn1", parentId: null, type: "category", label: "Laptop",      url: "/products/laptop",                          target: "_self", sortOrder: 1,  isVisible: true },
      { id: "mi2",  menuId: "mn1", parentId: null, type: "category", label: "PC",           url: "/products/pc",                              target: "_self", sortOrder: 2,  isVisible: true },
      { id: "mi3",  menuId: "mn1", parentId: null, type: "category", label: "Gaming",       url: "/products/gaming",                          target: "_self", sortOrder: 3,  isVisible: true },
      { id: "mi4",  menuId: "mn1", parentId: null, type: "category", label: "CPU",          url: "/products/linh-kien-may-tinh/cpu",           target: "_self", sortOrder: 4,  isVisible: true },
      { id: "mi5",  menuId: "mn1", parentId: null, type: "category", label: "GPU",          url: "/products/linh-kien-may-tinh/gpu",           target: "_self", sortOrder: 5,  isVisible: true },
      { id: "mi6",  menuId: "mn1", parentId: null, type: "category", label: "RAM",          url: "/products/linh-kien-may-tinh/ram",           target: "_self", sortOrder: 6,  isVisible: true },
      { id: "mi7",  menuId: "mn1", parentId: null, type: "category", label: "SSD",          url: "/products/linh-kien-may-tinh/ssd",           target: "_self", sortOrder: 7,  isVisible: true },
      { id: "mi8",  menuId: "mn1", parentId: null, type: "category", label: "Mainboard",    url: "/products/linh-kien-may-tinh/mainboard",     target: "_self", sortOrder: 8,  isVisible: true },
      { id: "mi9",  menuId: "mn1", parentId: null, type: "category", label: "Màn hình",     url: "/products/man-hinh",                        target: "_self", sortOrder: 9,  isVisible: true },
      { id: "mi10", menuId: "mn1", parentId: null, type: "category", label: "Gaming Gear",  url: "/products/gaming-gear",                     target: "_self", sortOrder: 10, isVisible: true },
      { id: "mi11", menuId: "mn1", parentId: null, type: "category", label: "Linh kiện",    url: "/products/linh-kien-may-tinh",               target: "_self", sortOrder: 11, isVisible: true },
      { id: "mi12", menuId: "mn1", parentId: null, type: "category", label: "Phụ kiện",     url: "/products/phu-kien",                        target: "_self", sortOrder: 12, isVisible: true },
      { id: "mi13", menuId: "mn1", parentId: null, type: "link",     label: "Khuyến mãi",   url: "/promotions",                               target: "_self", sortOrder: 13, isVisible: true },
      { id: "mi14", menuId: "mn1", parentId: null, type: "link",     label: "Flash Sale",   url: "/promotions/flash-sales",                   target: "_self", sortOrder: 14, isVisible: true },
    ],
  },
  {
    id: "mn2", name: "Hỗ trợ khách hàng", location: "footer_column_1",
    description: "Liên kết hỗ trợ trong footer cột 1",
    isActive: true, createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-02-15T08:00:00Z",
    items: [
      { id: "mf10", menuId: "mn2", parentId: null, type: "page", label: "Hướng dẫn mua hàng",  url: "/huong-dan-mua-hang",   target: "_self", sortOrder: 1, isVisible: true },
      { id: "mf11", menuId: "mn2", parentId: null, type: "page", label: "Hướng dẫn đặt hàng",  url: "/huong-dan-dat-hang",   target: "_self", sortOrder: 2, isVisible: true },
      { id: "mf12", menuId: "mn2", parentId: null, type: "page", label: "Chính sách bảo hành", url: "/chinh-sach-bao-hanh",  target: "_self", sortOrder: 3, isVisible: true },
      { id: "mf13", menuId: "mn2", parentId: null, type: "page", label: "Chính sách đổi trả",  url: "/chinh-sach-doi-tra",   target: "_self", sortOrder: 4, isVisible: true },
      { id: "mf14", menuId: "mn2", parentId: null, type: "page", label: "Chính sách bảo mật",  url: "/chinh-sach-bao-mat",   target: "_self", sortOrder: 5, isVisible: true },
      { id: "mf15", menuId: "mn2", parentId: null, type: "page", label: "Liên hệ hỗ trợ",      url: "/contact",              target: "_self", sortOrder: 6, isVisible: true },
    ],
  },
  {
    id: "mn3", name: "Danh mục sản phẩm", location: "footer_column_2",
    description: "Danh mục nổi bật trong footer cột 2",
    isActive: true, createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-02-15T08:00:00Z",
    items: [
      { id: "mf20", menuId: "mn3", parentId: null, type: "category", label: "Laptop",     url: "/products/laptop",                      target: "_self", sortOrder: 1, isVisible: true },
      { id: "mf21", menuId: "mn3", parentId: null, type: "category", label: "PC Gaming",  url: "/products/pc-gaming",                   target: "_self", sortOrder: 2, isVisible: true },
      { id: "mf22", menuId: "mn3", parentId: null, type: "category", label: "CPU",        url: "/products/linh-kien-may-tinh/cpu",       target: "_self", sortOrder: 3, isVisible: true },
      { id: "mf23", menuId: "mn3", parentId: null, type: "category", label: "GPU",        url: "/products/linh-kien-may-tinh/gpu",       target: "_self", sortOrder: 4, isVisible: true },
      { id: "mf24", menuId: "mn3", parentId: null, type: "category", label: "RAM",        url: "/products/linh-kien-may-tinh/ram",       target: "_self", sortOrder: 5, isVisible: true },
      { id: "mf25", menuId: "mn3", parentId: null, type: "category", label: "SSD",        url: "/products/linh-kien-may-tinh/ssd",       target: "_self", sortOrder: 6, isVisible: true },
      { id: "mf26", menuId: "mn3", parentId: null, type: "category", label: "Màn hình",   url: "/products/man-hinh",                    target: "_self", sortOrder: 7, isVisible: true },
      { id: "mf27", menuId: "mn3", parentId: null, type: "category", label: "Tai nghe",   url: "/products/thiet-bi-ngoai-vi/tai-nghe",  target: "_self", sortOrder: 8, isVisible: true },
    ],
  },
  {
    id: "mn4", name: "Về PC Store", location: "footer_column_3",
    description: "Thông tin về cửa hàng trong footer cột 3",
    isActive: true, createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-02-15T08:00:00Z",
    items: [
      { id: "mf30", menuId: "mn4", parentId: null, type: "page", label: "Giới thiệu",        url: "/gioi-thieu",     target: "_self", sortOrder: 1, isVisible: true },
      { id: "mf31", menuId: "mn4", parentId: null, type: "page", label: "Hệ thống cửa hàng", url: "/cua-hang",       target: "_self", sortOrder: 2, isVisible: true },
      { id: "mf32", menuId: "mn4", parentId: null, type: "page", label: "Tuyển dụng",        url: "/tuyen-dung",     target: "_self", sortOrder: 3, isVisible: true },
      { id: "mf33", menuId: "mn4", parentId: null, type: "link", label: "Blog",              url: "/blog",           target: "_self", sortOrder: 4, isVisible: true },
    ],
  },
  {
    id: "mn5", name: "Mobile Menu", location: "mobile_main",
    description: "Menu cho thiết bị di động",
    isActive: true, createdAt: "2025-01-10T08:00:00Z", updatedAt: "2025-03-15T10:00:00Z",
    items: [
      { id: "mm1", menuId: "mn5", parentId: null, type: "link",     label: "Trang chủ",  url: "/",           target: "_self", sortOrder: 1, isVisible: true },
      { id: "mm2", menuId: "mn5", parentId: null, type: "category", label: "Laptop",     url: "/products/laptop", target: "_self", sortOrder: 2, isVisible: true },
      { id: "mm3", menuId: "mn5", parentId: null, type: "category", label: "PC",         url: "/products/pc",     target: "_self", sortOrder: 3, isVisible: true },
      { id: "mm4", menuId: "mn5", parentId: null, type: "category", label: "Linh kiện",  url: "/products/linh-kien-may-tinh", target: "_self", sortOrder: 4, isVisible: true },
      { id: "mm5", menuId: "mn5", parentId: null, type: "link",     label: "Khuyến mãi", url: "/promotions", target: "_self", sortOrder: 5, isVisible: true },
      { id: "mm6", menuId: "mn5", parentId: null, type: "page",     label: "Liên hệ",    url: "/contact",    target: "_self", sortOrder: 6, isVisible: true },
    ],
  },
];

// ─── FAQ Groups ───────────────────────────────────────────────────────────────

// ─── Testimonials ──────────────────────────────────────────────────────────────

const TESTIMONIALS: Testimonial[] = [
  { id: "t1", status: "approved", source: "review", customerName: "Nguyễn Minh Tuấn", customerTitle: "Kỹ sư phần mềm", customerAvatarUrl: "https://placehold.co/80x80/6366f1/white?text=T", rating: 5, quote: "Mua MacBook Pro M3 tại PC Store, sản phẩm chính hãng, đóng gói cẩn thận. Giao hàng nhanh, nhân viên tư vấn nhiệt tình. Sẽ tiếp tục ủng hộ!", productName: "MacBook Pro M3 14 inch", isHighlighted: true, sortOrder: 1, displayPage: "homepage", reviewedBy: "Admin", reviewedAt: "2025-03-16T10:00:00Z", createdAt: "2025-03-15T09:00:00Z", updatedAt: "2025-03-16T10:00:00Z" },
  { id: "t2", status: "approved", source: "review", customerName: "Trần Thị Lan Anh", customerTitle: "Sinh viên Đại học Bách Khoa", customerAvatarUrl: "https://placehold.co/80x80/ec4899/white?text=L", rating: 5, quote: "Laptop ASUS VivoBook chất lượng tốt, giá hợp lý. Mình dùng để học và code, rất ổn định. Cảm ơn PC Store đã tư vấn đúng nhu cầu!", productName: "ASUS VivoBook 15", isHighlighted: true, sortOrder: 2, displayPage: "all", reviewedBy: "Admin", reviewedAt: "2025-04-02T10:00:00Z", createdAt: "2025-04-01T14:00:00Z", updatedAt: "2025-04-02T10:00:00Z" },
  { id: "t3", status: "approved", source: "manual", customerName: "Lê Hoàng Phúc", customerTitle: "Content Creator", rating: 4, quote: "Mình mua màn hình Asus ProArt cho công việc chỉnh sửa video. Màu sắc cực kỳ chính xác, rất hài lòng. Chỉ tiếc là giao hàng hơi chậm.", productName: "ASUS ProArt Display 27\"", isHighlighted: false, sortOrder: 3, displayPage: "product", reviewedBy: "Admin", reviewedAt: "2025-04-05T10:00:00Z", createdAt: "2025-04-03T10:00:00Z", updatedAt: "2025-04-05T10:00:00Z" },
  { id: "t4", status: "pending", source: "review", customerName: "Phạm Quốc Bảo", customerTitle: "Gamer", rating: 5, quote: "PC Store bán gaming gear xịn lắm! Mình mua Keychron K2 và tai nghe SteelSeries, đều chính hãng, giá tốt hơn nhiều nơi khác.", isHighlighted: false, sortOrder: 10, displayPage: "all", createdAt: "2025-04-12T08:00:00Z", updatedAt: "2025-04-12T08:00:00Z" },
  { id: "t5", status: "rejected", source: "review", customerName: "Người dùng ẩn danh", rating: 2, quote: "Giao hàng chậm và đóng gói không cẩn thận. Hộp laptop bị móp méo khi nhận.", isHighlighted: false, sortOrder: 99, displayPage: "all", reviewedBy: "Admin", reviewedAt: "2025-04-10T10:00:00Z", createdAt: "2025-04-09T10:00:00Z", updatedAt: "2025-04-10T10:00:00Z" },
];

// ══════════════════════════════════════════════════════════════════════════════
// SERVICE FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

// ─── Media Library ────────────────────────────────────────────────────────────

// ─── Backend API types ────────────────────────────────────────────────────────

interface BackendAsset {
  id: number;
  urlGoc: string;
  tenFileGoc: string;
  loaiFile: string;
  mimeType: string;
  kichThuocByte: number;
  chieuRong: number | null;
  chieuCao: number | null;
  altText: string | null;
  caption: string | null;
  thuMucId: number | null;
  thuMucObj?: { id: number; tenHienThi: string; duongDan: string } | null;
  soLanSuDung: number;
  trangThai: string;
  nguoiUploadId: number;
  nguoiUpload?: { id: number; hoTen: string } | null;
  ngayUpload: string;
  ngayCapNhat: string | null;
}

interface BackendMediaFolder {
  id: number;
  tenHienThi: string;
  duongDan: string;
  moTa: string | null;
  loaiChoPhep: string;
  thuTu: number;
  isActive: boolean;
  phamVi: string;
  ngayTao: string;
  ngayCapNhat: string;
  fileCount?: number;
}

function mapAssetToMediaFile(asset: BackendAsset): MediaFile {
  const loaiFile = asset.loaiFile;
  const mime = asset.mimeType ?? "";
  const isImageLike =
    loaiFile === "image" ||
    mime.toLowerCase().startsWith("image/") ||
    hasRenderableImageExtension(asset.tenFileGoc) ||
    hasRenderableImageExtension(asset.urlGoc);
  const fileType: MediaFile["fileType"] =
    isImageLike ? "image"
    : loaiFile === "video" ? "video"
    : loaiFile === "raw" && mime.startsWith("audio/") ? "audio"
    : "document";
  return {
    id: String(asset.id),
    folderId: asset.thuMucId != null ? String(asset.thuMucId) : null,
    folderName: asset.thuMucObj?.tenHienThi ?? undefined,
    folderSlug: asset.thuMucObj?.duongDan ?? undefined,
    filename: asset.tenFileGoc,
    originalName: asset.tenFileGoc,
    mimeType: asset.mimeType,
    fileType: fileType as MediaFile["fileType"],
    url: asset.urlGoc,
    thumbnailUrl: asset.urlGoc,
    size: asset.kichThuocByte,
    width: asset.chieuRong ?? undefined,
    height: asset.chieuCao ?? undefined,
    altText: asset.altText ?? undefined,
    caption: asset.caption ?? undefined,
    status: asset.trangThai === "active" ? "active" : "unused",
    usageCount: asset.soLanSuDung,
    uploadedBy: asset.nguoiUpload?.hoTen ?? String(asset.nguoiUploadId),
    uploadedById: String(asset.nguoiUpload?.id ?? asset.nguoiUploadId),
    uploadedAt: asset.ngayUpload,
    updatedAt: asset.ngayCapNhat ?? asset.ngayUpload,
  };
}

function mapFolderToMediaFolder(folder: BackendMediaFolder): MediaFolder {
  return {
    id: String(folder.id),
    name: folder.tenHienThi,
    slug: folder.duongDan,
    parentId: null,
    fileCount: folder.fileCount ?? 0,
    visibility: folder.phamVi === "private" ? "private" : "public",
    description: folder.moTa ?? undefined,
    allowedTypes: folder.loaiChoPhep as MediaFolder["allowedTypes"],
    sortOrder: folder.thuTu,
    isActive: folder.isActive,
    createdAt: folder.ngayTao,
    updatedAt: folder.ngayCapNhat,
  };
}

// ─── Media ────────────────────────────────────────────────────────────────────

export async function getMediaFiles(params: MediaListParams = {}): Promise<MediaListResult> {
  const { q, folderId, fileType = [], page = 1, pageSize = 24 } = params;

  const qs = new URLSearchParams();
  if (q) qs.set("search", q);
  if (folderId != null) qs.set("thuMucId", folderId);
  if (fileType.length === 1 && fileType[0] !== "image") {
    const backendType = fileType[0] === "document" ? "raw" : fileType[0];
    qs.set("loaiFile", backendType);
  }
  qs.set("page", String(page));
  qs.set("limit", String(pageSize));

  const [assetsRes, foldersRes] = await Promise.all([
    apiFetch<{ items: BackendAsset[]; total: number }>(`/admin/media?${qs}`),
    apiFetch<BackendMediaFolder[]>("/admin/media/folders"),
  ]);

  const mappedFiles = assetsRes.items.map(mapAssetToMediaFile);
  const data = fileType.length ? mappedFiles.filter((file) => fileType.includes(file.fileType)) : mappedFiles;

  return {
    data,
    total: fileType.length && fileType[0] === "image" ? data.length : assetsRes.total,
    folders: foldersRes.map(mapFolderToMediaFolder),
  };
}

export async function getMediaFolders(): Promise<MediaFolder[]> {
  const folders = await apiFetch<BackendMediaFolder[]>("/admin/media/folders");
  return folders.map(mapFolderToMediaFolder);
}

export async function uploadMediaFile(file: File, params: MediaUploadParams = {}): Promise<MediaFile> {
  const formData = new FormData();
  formData.append("file", file);
  if (params.folderId != null) formData.append("thuMucId", params.folderId);
  if (params.altText) formData.append("altText", params.altText);
  if (params.caption) formData.append("caption", params.caption);

  const asset = await apiFetch<BackendAsset>("/admin/media/upload", {
    method: "POST",
    body: formData,
  });
  return mapAssetToMediaFile(asset);
}

export async function deleteMediaFile(id: string): Promise<void> {
  await apiFetch<void>(`/admin/media/${id}`, { method: "DELETE" });
}

export async function updateMediaFile(
  id: string,
  updates: Partial<Pick<MediaFile, "originalName" | "altText" | "caption">>,
): Promise<MediaFile> {
  const asset = await apiFetch<BackendAsset>(`/admin/media/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return mapAssetToMediaFile(asset);
}

export async function createMediaFolder(data: {
  tenHienThi: string;
  duongDan: string;
  moTa?: string;
  loaiChoPhep?: "all" | "image" | "video" | "raw";
  isActive?: boolean;
  phamVi?: "public" | "private";
}): Promise<MediaFolder> {
  const folder = await apiFetch<BackendMediaFolder>("/admin/media/folders", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapFolderToMediaFolder(folder);
}

export async function updateMediaFolder(
  id: string,
  data: Partial<{
    tenHienThi: string;
    duongDan: string;
    moTa?: string;
    loaiChoPhep?: "all" | "image" | "video" | "raw";
    isActive?: boolean;
    phamVi?: "public" | "private";
  }>,
): Promise<MediaFolder> {
  const folder = await apiFetch<BackendMediaFolder>(`/admin/media/folders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return mapFolderToMediaFolder(folder);
}

export async function deleteMediaFolder(id: string): Promise<void> {
  await apiFetch<void>(`/admin/media/folders/${id}`, { method: "DELETE" });
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export async function getBanners(params: BannerListParams = {}): Promise<BannerListResult> {
  const { q, position = [], status = [], page = 1, pageSize } = params;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (pageSize) qs.set("limit", String(pageSize));
  if (q) qs.set("q", q);
  position.forEach((p) => qs.append("position", p));
  status.forEach((s) => qs.append("status", s));
  const res = await apiFetch<{ data: Banner[]; total: number }>(`/admin/banners?${qs}`);
  return { data: res.data, total: res.total };
}

export async function getBannerById(id: string): Promise<Banner | null> {
  return apiFetch<Banner>(`/admin/banners/${id}`);
}

export async function createBanner(data: BannerFormData): Promise<Banner> {
  return apiFetch<Banner>("/admin/banners", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBanner(id: string, data: Partial<BannerFormData>): Promise<Banner> {
  return apiFetch<Banner>(`/admin/banners/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBanner(id: string): Promise<void> {
  await apiFetch<void>(`/admin/banners/${id}`, { method: "DELETE" });
}

export async function reorderBanners(position: BannerPosition, ids: string[]): Promise<void> {
  await apiFetch<void>("/admin/banners/reorder", {
    method: "PATCH",
    body: JSON.stringify({ position, ids }),
  });
}

export interface BannerGridItem {
  id: string;
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
}

/** Lưu lại toàn bộ layout grid của promotions_banner (x, y, w, h) */
export async function saveBannersLayout(items: BannerGridItem[]): Promise<void> {
  await apiFetch<void>("/admin/banners/layout", {
    method: "PATCH",
    body: JSON.stringify({ items }),
  });
}

// ─── Static Pages ──────────────────────────────────────────────────────────────

const STATUS_MAP = { draft: "nhap", published: "da_xuat_ban", archived: "an" } as const;

function mapFormToApi(data: StaticPageFormData) {
  return {
    title: data.title,
    slug: data.slug,
    content: data.content,
    status: STATUS_MAP[data.status],
    template: data.template,
    showInFooter: data.showInFooter,
    showInHeader: data.showInHeader,
    sortOrder: data.sortOrder,
    metaTitle: data.seo.title,
    metaDescription: data.seo.description,
    metaKeywords: data.seo.keywords,
    ogImage: data.seo.ogImage,
    canonicalUrl: data.seo.canonicalUrl,
    noIndex: data.seo.noIndex,
  };
}

export async function getStaticPages(params: StaticPageListParams = {}): Promise<StaticPageListResult> {
  const { q = "", status = [], page = 1, pageSize } = params;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (pageSize) qs.set("pageSize", String(pageSize));
  if (q) qs.set("q", q);
  status.forEach((s) => qs.append("status", s));
  return apiFetch<StaticPageListResult>(`/admin/pages?${qs}`);
}

export async function getStaticPageById(id: string): Promise<StaticPage | null> {
  try {
    return await apiFetch<StaticPage>(`/admin/pages/${id}`);
  } catch {
    return null;
  }
}

export async function createStaticPage(data: StaticPageFormData): Promise<StaticPage> {
  const payload = mapFormToApi(data);
  return apiFetch<StaticPage>("/admin/pages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStaticPage(id: string, data: Partial<StaticPageFormData>): Promise<StaticPage> {
  const payload = mapFormToApi(data as StaticPageFormData);
  return apiFetch<StaticPage>(`/admin/pages/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteStaticPage(id: string): Promise<void> {
  await apiFetch<void>(`/admin/pages/${id}`, { method: "DELETE" });
}

export async function reorderPages(ids: string[]): Promise<void> {
  await apiFetch<void>("/admin/pages/reorder", {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  });
}

// ─── Article Categories ───────────────────────────────────────────────────────

export async function getArticleCategories(): Promise<ArticleCategory[]> {
  await delay(200);
  return ARTICLE_CATEGORIES;
}

export async function createArticleCategory(data: ArticleCategoryFormData): Promise<ArticleCategory> {
  await delay(400);
  const cat: ArticleCategory = { id: `ac${Date.now()}`, ...data, articleCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  ARTICLE_CATEGORIES.push(cat);
  return cat;
}

export async function updateArticleCategory(id: string, data: Partial<ArticleCategoryFormData>): Promise<ArticleCategory> {
  await delay(400);
  const cat = ARTICLE_CATEGORIES.find((c) => c.id === id);
  if (!cat) throw new Error("Category not found");
  Object.assign(cat, data, { updatedAt: new Date().toISOString() });
  return { ...cat };
}

export async function deleteArticleCategory(id: string): Promise<void> {
  await delay(300);
  const idx = ARTICLE_CATEGORIES.findIndex((c) => c.id === id);
  if (idx !== -1) ARTICLE_CATEGORIES.splice(idx, 1);
}

// ─── Articles ─────────────────────────────────────────────────────────────────

export async function getArticles(params: ArticleListParams = {}): Promise<ArticleListResult> {
  await delay();
  const { q = "", status = [], categoryId = [], isFeatured, page = 1, pageSize = 20 } = params;

  let list = [...ARTICLES];
  if (q) list = list.filter((a) => matchQ(a.title, q) || matchQ(a.excerpt, q));
  if (status.length) list = list.filter((a) => status.includes(a.status));
  if (categoryId.length) list = list.filter((a) => categoryId.includes(a.categoryId));
  if (isFeatured !== undefined) list = list.filter((a) => a.isFeatured === isFeatured);

  return paginate(list, page, pageSize);
}

export async function getArticleById(id: string): Promise<Article | null> {
  await delay(200);
  return ARTICLES.find((a) => a.id === id) ?? null;
}

export async function createArticle(data: ArticleFormData): Promise<Article> {
  await delay(600);
  const article: Article = {
    id: `a${Date.now()}`, ...data,
    categoryName: ARTICLE_CATEGORIES.find((c) => c.id === data.categoryId)?.name ?? "",
    author: "Admin", viewCount: 0, readTimeMinutes: Math.ceil(data.content.split(" ").length / 200),
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  ARTICLES.unshift(article);
  return article;
}

export async function updateArticle(id: string, data: Partial<ArticleFormData>): Promise<Article> {
  await delay(500);
  const article = ARTICLES.find((a) => a.id === id);
  if (!article) throw new Error("Article not found");
  Object.assign(article, data, { updatedAt: new Date().toISOString() });
  if (data.status === "published" && !article.publishedAt) article.publishedAt = new Date().toISOString();
  return { ...article };
}

export async function deleteArticle(id: string): Promise<void> {
  await delay(300);
  const idx = ARTICLES.findIndex((a) => a.id === id);
  if (idx !== -1) ARTICLES.splice(idx, 1);
}

// ─── Popups ───────────────────────────────────────────────────────────────────

export async function getPopups(): Promise<Popup[]> {
  return apiFetch<Popup[]>("/admin/popups");
}

export async function createPopup(data: PopupFormData): Promise<Popup> {
  return apiFetch<Popup>("/admin/popups", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePopup(id: string, data: Partial<PopupFormData>): Promise<Popup> {
  return apiFetch<Popup>(`/admin/popups/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePopup(id: string): Promise<void> {
  await apiFetch<void>(`/admin/popups/${id}`, { method: "DELETE" });
}

// ─── Announcement Bars ────────────────────────────────────────────────────────

export async function getAnnouncementBars(): Promise<AnnouncementBar[]> {
  return apiFetch<AnnouncementBar[]>("/admin/announcement-bars");
}

export async function createAnnouncementBar(data: AnnouncementBarFormData): Promise<AnnouncementBar> {
  return apiFetch<AnnouncementBar>("/admin/announcement-bars", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAnnouncementBar(id: string, data: Partial<AnnouncementBarFormData>): Promise<AnnouncementBar> {
  return apiFetch<AnnouncementBar>(`/admin/announcement-bars/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAnnouncementBar(id: string): Promise<void> {
  await apiFetch<void>(`/admin/announcement-bars/${id}`, { method: "DELETE" });
}

// ─── Navigation Menus ─────────────────────────────────────────────────────────

interface BackendMenuItem {
  id: string;
  menuId: string;
  parentId: string | null;
  label: string;
  url: string | null;
  type: string;
  sortOrder: number;
  isVisible: boolean;
  target: "_self" | "_blank";
  icon: string | null;
  cssClass: string | null;
  children: BackendMenuItem[];
}

interface BackendMenu {
  id: string;
  location: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: BackendMenuItem[];
}

function mapMenuItem(i: BackendMenuItem): MenuItem {
  return {
    id: String(i.id),
    menuId: String(i.menuId),
    parentId: i.parentId != null ? String(i.parentId) : null,
    type: i.type as MenuItemType,
    label: i.label,
    url: i.url ?? undefined,
    target: i.target ?? "_self",
    icon: i.icon ?? undefined,
    cssClass: i.cssClass ?? undefined,
    sortOrder: i.sortOrder,
    isVisible: i.isVisible,
    children: (i.children ?? []).map(mapMenuItem),
  };
}

function mapMenu(m: BackendMenu): Menu {
  return {
    id: String(m.id),
    name: m.name,
    location: m.location as MenuLocation,
    description: m.description ?? undefined,
    items: (m.items ?? []).map(mapMenuItem),
    isActive: m.isActive ?? true,
    createdAt: m.createdAt ?? m.updatedAt,
    updatedAt: m.updatedAt,
  };
}

export async function getMenus(): Promise<MenuListResult> {
  const raw = await apiFetch<BackendMenu[]>("/admin/menus");
  const data: Menu[] = raw.map(mapMenu);
  return { data, total: data.length };
}

export async function getMenuById(id: string): Promise<Menu | null> {
  await delay(200);
  return MENUS.find((m) => m.id === id) ?? null;
}

export async function addMenuItem(menuId: string, data: MenuItemFormData): Promise<MenuItem> {
  const body = {
    parentId: data.parentId ? parseInt(data.parentId) : undefined,
    label: data.label,
    url: data.url ?? "",
    type: data.type,
    sortOrder: data.sortOrder,
    isVisible: data.isVisible,
    openInNewTab: data.target === "_blank",
  };
  const raw = await apiFetch<BackendMenuItem>(`/admin/menus/${menuId}/items`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapMenuItem(raw);
}

export async function updateMenuItem(menuId: string, itemId: string, data: Partial<MenuItemFormData>): Promise<MenuItem> {
  const body: Record<string, unknown> = {};
  if (data.label !== undefined) body.label = data.label;
  if (data.url !== undefined) body.url = data.url;
  if (data.type !== undefined) body.type = data.type;
  if (data.sortOrder !== undefined) body.sortOrder = data.sortOrder;
  if (data.isVisible !== undefined) body.isVisible = data.isVisible;
  if (data.target !== undefined) body.openInNewTab = data.target === "_blank";
  if (data.parentId !== undefined) body.parentId = data.parentId ? parseInt(data.parentId) : null;

  const raw = await apiFetch<BackendMenuItem>(`/admin/menus/${menuId}/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return mapMenuItem(raw);
}

export async function deleteMenuItem(menuId: string, itemId: string): Promise<void> {
  await apiFetch<void>(`/admin/menus/${menuId}/items/${itemId}`, { method: "DELETE" });
}

export async function reorderMenuItems(menuId: string, itemIds: string[]): Promise<void> {
  await apiFetch<void>(`/admin/menus/${menuId}/items/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ itemIds: itemIds.map(Number) }),
  });
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export async function getFAQGroups(): Promise<FAQGroup[]> {
  return apiFetch<FAQGroup[]>('/admin/faq/groups');
}

export async function getFAQItems(params: FAQListParams = {}): Promise<FAQListResult> {
  const qs = new URLSearchParams();
  if (params.page)     qs.set('page', String(params.page));
  if (params.pageSize) qs.set('pageSize', String(params.pageSize));
  if (params.q)        qs.set('q', params.q);
  if (params.groupId?.length) qs.set('groupId', params.groupId[0]);
  if (params.isVisible !== undefined) qs.set('isVisible', String(params.isVisible));
  return apiFetch<FAQListResult>(`/admin/faq/items?${qs}`);
}

export async function createFAQGroup(data: FAQGroupFormData): Promise<FAQGroup> {
  return apiFetch<FAQGroup>('/admin/faq/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFAQGroup(id: string, data: Partial<FAQGroupFormData>): Promise<FAQGroup> {
  return apiFetch<FAQGroup>(`/admin/faq/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFAQGroup(id: string): Promise<void> {
  await apiFetch<void>(`/admin/faq/groups/${id}`, { method: 'DELETE' });
}

export async function createFAQItem(data: FAQItemFormData): Promise<FAQItem> {
  return apiFetch<FAQItem>('/admin/faq/items', {
    method: 'POST',
    body: JSON.stringify({ ...data, groupId: Number(data.groupId) }),
  });
}

export async function updateFAQItem(id: string, data: Partial<FAQItemFormData>): Promise<FAQItem> {
  return apiFetch<FAQItem>(`/admin/faq/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFAQItem(id: string): Promise<void> {
  await apiFetch<void>(`/admin/faq/items/${id}`, { method: 'DELETE' });
}

export async function reorderFAQGroups(ids: string[]): Promise<void> {
  await apiFetch<void>('/admin/faq/groups/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ ids: ids.map(Number) }),
  });
}

export async function reorderFAQItems(_groupId: string, ids: string[]): Promise<void> {
  await apiFetch<void>('/admin/faq/items/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ ids: ids.map(Number) }),
  });
}

// ─── Testimonials ──────────────────────────────────────────────────────────────

export async function getTestimonials(params: TestimonialListParams = {}): Promise<TestimonialListResult> {
  await delay();
  const { q = "", status = [], source = [], isHighlighted, page = 1, pageSize = 20 } = params;

  let list = [...TESTIMONIALS];
  if (q) list = list.filter((t) => matchQ(t.customerName, q) || matchQ(t.quote, q));
  if (status.length) list = list.filter((t) => status.includes(t.status));
  if (source.length) list = list.filter((t) => source.includes(t.source));
  if (isHighlighted !== undefined) list = list.filter((t) => t.isHighlighted === isHighlighted);

  return paginate(list, page, pageSize);
}

export async function createTestimonial(data: TestimonialFormData): Promise<Testimonial> {
  await delay(400);
  const testimonial: Testimonial = { id: `t${Date.now()}`, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  TESTIMONIALS.push(testimonial);
  return testimonial;
}

export async function updateTestimonial(id: string, data: Partial<TestimonialFormData>): Promise<Testimonial> {
  await delay(400);
  const t = TESTIMONIALS.find((t) => t.id === id);
  if (!t) throw new Error("Testimonial not found");
  Object.assign(t, data, { updatedAt: new Date().toISOString() });
  if (data.status && data.status !== "pending") { t.reviewedBy = "Admin"; t.reviewedAt = new Date().toISOString(); }
  return { ...t };
}

export async function deleteTestimonial(id: string): Promise<void> {
  await delay(300);
  const idx = TESTIMONIALS.findIndex((t) => t.id === id);
  if (idx !== -1) TESTIMONIALS.splice(idx, 1);
}

// ──────────────────────────────────────────────────────────────────────────────
// TRUST BADGES
// ──────────────────────────────────────────────────────────────────────────────

// Module-level cache to avoid triple-fetching site-config on each navigation load
let _siteConfigCache: Record<string, string> | null = null;
async function _fetchSiteConfig(): Promise<Record<string, string>> {
  if (!_siteConfigCache) {
    _siteConfigCache = await apiFetch<Record<string, string>>("/admin/site-config");
    setTimeout(() => { _siteConfigCache = null; }, 30_000);
  }
  return _siteConfigCache;
}

const TRUST_BADGES: TrustBadge[] = [
  { id: "tb1", icon: "TruckIcon",       title: "Miễn phí giao hàng",   subtitle: "Đơn từ 500.000đ trở lên",     active: true, sortOrder: 1 },
  { id: "tb2", icon: "ShieldCheckIcon", title: "Bảo hành chính hãng",  subtitle: "Sản phẩm chính hãng 100%",    active: true, sortOrder: 2 },
  { id: "tb3", icon: "ArrowPathIcon",   title: "Đổi trả 30 ngày",      subtitle: "Đổi trả nhanh chóng dễ dàng", active: true, sortOrder: 3 },
  { id: "tb4", icon: "PhoneIcon",       title: "Hỗ trợ 1/7",           subtitle: "Luôn sẵn sàng hỗ trợ bạn",   active: true, sortOrder: 4 },
];

export async function getTrustBadges(): Promise<TrustBadge[]> {
  const config = await _fetchSiteConfig();
  const raw = config["trust_badges"];
  if (!raw) return [];
  try { return JSON.parse(raw) as TrustBadge[]; }
  catch { return []; }
}

export async function saveTrustBadges(badges: TrustBadgeFormData[]): Promise<TrustBadge[]> {
  const withIds: TrustBadge[] = badges.map((b, idx) => ({
    id: `tb-${idx + 1}`,
    ...b,
    sortOrder: idx + 1,
  }));
  await apiFetch("/admin/site-config/trust_badges", {
    method: "PUT",
    body: JSON.stringify({ value: JSON.stringify(withIds) }),
  });
  _siteConfigCache = null;
  return withIds;
}

export async function createTrustBadge(data: TrustBadgeFormData): Promise<TrustBadge> {
  await delay(400);
  const badge: TrustBadge = { id: `tb${Date.now()}`, ...data, sortOrder: TRUST_BADGES.length + 1 };
  TRUST_BADGES.push(badge);
  return badge;
}

export async function updateTrustBadge(id: string, data: Partial<TrustBadgeFormData>): Promise<TrustBadge> {
  await delay(300);
  const badge = TRUST_BADGES.find((b) => b.id === id);
  if (!badge) throw new Error("Trust badge not found");
  Object.assign(badge, data);
  return { ...badge };
}

export async function deleteTrustBadge(id: string): Promise<void> {
  await delay(300);
  const idx = TRUST_BADGES.findIndex((b) => b.id === id);
  if (idx !== -1) TRUST_BADGES.splice(idx, 1);
}

// ──────────────────────────────────────────────────────────────────────────────
// CATEGORY SHORTCUTS
// ──────────────────────────────────────────────────────────────────────────────

const CATEGORY_SHORTCUTS: CategoryShortcut[] = [
  { id: "cs1", emoji: "🖥️", label: "CPU",      url: "/products/linh-kien-may-tinh/cpu",          active: true, sortOrder: 1 },
  { id: "cs2", emoji: "🎮", label: "GPU",      url: "/products/linh-kien-may-tinh/gpu",          active: true, sortOrder: 2 },
  { id: "cs3", emoji: "⌨️", label: "Bàn phím", url: "/products/thiet-bi-ngoai-vi/ban-phim",      active: true, sortOrder: 3 },
  { id: "cs4", emoji: "🖱️", label: "Chuột",    url: "/products/thiet-bi-ngoai-vi/chuot",         active: true, sortOrder: 4 },
  { id: "cs5", emoji: "💻", label: "Laptop",   url: "/products/laptop",                          active: true, sortOrder: 5 },
  { id: "cs6", emoji: "💾", label: "SSD",      url: "/products/linh-kien-may-tinh/ssd",          active: true, sortOrder: 6 },
  { id: "cs7", emoji: "🎧", label: "Tai nghe", url: "/products/thiet-bi-ngoai-vi/tai-nghe",      active: true, sortOrder: 7 },
  { id: "cs8", emoji: "🖥",  label: "Màn hình", url: "/products/man-hinh",                        active: true, sortOrder: 8 },
];

export async function getCategoryShortcuts(): Promise<CategoryShortcut[]> {
  const config = await _fetchSiteConfig();
  const raw = config["category_shortcuts"];
  if (!raw) return [];
  try { return JSON.parse(raw) as CategoryShortcut[]; }
  catch { return []; }
}

export async function saveCategoryShortcuts(items: CategoryShortcutFormData[]): Promise<CategoryShortcut[]> {
  const withIds: CategoryShortcut[] = items.map((item, idx) => ({
    id: `cs-${idx + 1}`,
    ...item,
    sortOrder: idx + 1,
  }));
  await apiFetch("/admin/site-config/category_shortcuts", {
    method: "PUT",
    body: JSON.stringify({ value: JSON.stringify(withIds) }),
  });
  _siteConfigCache = null;
  return withIds;
}

export async function createCategoryShortcut(data: CategoryShortcutFormData): Promise<CategoryShortcut> {
  await delay(400);
  const item: CategoryShortcut = { id: `cs${Date.now()}`, ...data, sortOrder: CATEGORY_SHORTCUTS.length + 1 };
  CATEGORY_SHORTCUTS.push(item);
  return item;
}

export async function updateCategoryShortcut(id: string, data: Partial<CategoryShortcutFormData>): Promise<CategoryShortcut> {
  await delay(300);
  const item = CATEGORY_SHORTCUTS.find((c) => c.id === id);
  if (!item) throw new Error("Category shortcut not found");
  Object.assign(item, data);
  return { ...item };
}

export async function deleteCategoryShortcut(id: string): Promise<void> {
  await delay(300);
  const idx = CATEGORY_SHORTCUTS.findIndex((c) => c.id === id);
  if (idx !== -1) CATEGORY_SHORTCUTS.splice(idx, 1);
}

// ──────────────────────────────────────────────────────────────────────────────
// FOOTER CONFIG
// ──────────────────────────────────────────────────────────────────────────────

const FOOTER_CONFIG: FooterConfig = {
  brand: {
    logoUrl: "/logo.png",
    logoAlt: "PC TechStore",
    storeName: "PC TechStore",
    description:
      "Chuyên cung cấp Laptop, PC Gaming và linh kiện máy tính chính hãng. Bảo hành uy tín, giao hàng nhanh, hỗ trợ tận tâm 7 ngày/tuần.",
  },
  contact: {
    address: "123 Nguyễn Ích Khiêm, Quận 1, TP. Hồ Chí Minh",
    phone: "1900 1234",
    email: "support@techstore.vn",
    supportHours: "8:00 – 22:00 (Thứ 2 – Chủ nhật)",
  },
  linkColumns: [
    { title: "Hỗ trợ khách hàng",  location: "footer_column_1" },
    { title: "Danh mục sản phẩm",  location: "footer_column_2" },
    { title: "Về PC Store",         location: "footer_column_3" },
  ],
  socialLinks: [
    { platform: "facebook",  url: "https://facebook.com/pcstore" },
    { platform: "youtube",   url: "https://youtube.com/pcstore" },
    { platform: "tiktok",    url: "https://tiktok.com/@pcstore" },
    { platform: "instagram", url: "https://instagram.com/pcstore" },
  ],
  copyright: "© 2024 PC TechStore. Tất cả các quyền được bảo lưu.",
  bottomLinks: [
    { label: "Chính sách bảo mật", url: "/chinh-sach-bao-mat" },
    { label: "Điều khoản sử dụng", url: "/dieu-khoan-su-dung" },
  ],
};

export async function getFooterConfig(): Promise<FooterConfig> {
  const config = await _fetchSiteConfig();
  const raw = config["footer_config"];
  if (raw) {
    try { return JSON.parse(raw) as FooterConfig; }
    catch { /* fall through to default */ }
  }
  return {
    brand: { logoUrl: "", logoAlt: "PC Store", storeName: "PC Store", description: "" },
    contact: {},
    linkColumns: [
      { title: "Hỗ trợ khách hàng", location: "footer_column_1" },
      { title: "Danh mục sản phẩm", location: "footer_column_2" },
      { title: "Về PC Store",        location: "footer_column_3" },
    ],
    socialLinks: [],
    copyright: `© ${new Date().getFullYear()} PC Store`,
    bottomLinks: [],
  };
}

export async function saveFooterConfig(data: FooterConfig): Promise<FooterConfig> {
  await apiFetch("/admin/site-config/footer_config", {
    method: "PUT",
    body: JSON.stringify({ value: JSON.stringify(data) }),
  });
  _siteConfigCache = null;
  return data;
}
