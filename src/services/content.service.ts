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

// ─── Homepage Hero Mode (mutually-exclusive hero vs slider) ──────────────────

export type HomepageHeroMode = "banner" | "slider";
const HOMEPAGE_HERO_MODE_KEY = "homepage_hero_mode";

export async function getHomepageHeroMode(): Promise<HomepageHeroMode> {
  const config = await _fetchSiteConfig();
  const raw = config[HOMEPAGE_HERO_MODE_KEY];
  return raw === "slider" ? "slider" : "banner";
}

export async function setHomepageHeroMode(mode: HomepageHeroMode): Promise<HomepageHeroMode> {
  await apiFetch(`/admin/site-config/${HOMEPAGE_HERO_MODE_KEY}`, {
    method: "PUT",
    body: JSON.stringify({ value: mode }),
  });
  _siteConfigCache = null;
  return mode;
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
  return apiFetch<ArticleCategory[]>("/admin/articles/categories");
}

export async function createArticleCategory(data: ArticleCategoryFormData): Promise<ArticleCategory> {
  return apiFetch<ArticleCategory>("/admin/articles/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateArticleCategory(id: string, data: Partial<ArticleCategoryFormData>): Promise<ArticleCategory> {
  return apiFetch<ArticleCategory>(`/admin/articles/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteArticleCategory(id: string): Promise<void> {
  await apiFetch<void>(`/admin/articles/categories/${id}`, { method: "DELETE" });
}

// ─── Articles ─────────────────────────────────────────────────────────────────

export async function getArticles(params: ArticleListParams = {}): Promise<ArticleListResult> {
  const { q, status = [], categoryId = [], isFeatured, page = 1, pageSize } = params;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (pageSize) qs.set("pageSize", String(pageSize));
  if (q) qs.set("q", q);
  status.forEach((s) => qs.append("status", s));
  categoryId.forEach((c) => qs.append("categoryId", c));
  if (isFeatured !== undefined) qs.set("isFeatured", String(isFeatured));
  return apiFetch<ArticleListResult>(`/admin/articles?${qs}`);
}

export async function getArticleById(id: string): Promise<Article | null> {
  try {
    return await apiFetch<Article>(`/admin/articles/${id}`);
  } catch {
    return null;
  }
}

export async function createArticle(data: ArticleFormData): Promise<Article> {
  return apiFetch<Article>("/admin/articles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateArticle(id: string, data: Partial<ArticleFormData>): Promise<Article> {
  return apiFetch<Article>(`/admin/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteArticle(id: string): Promise<void> {
  await apiFetch<void>(`/admin/articles/${id}`, { method: "DELETE" });
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
  try {
    const raw = await apiFetch<BackendMenu>(`/admin/menus/${id}`);
    return mapMenu(raw);
  } catch {
    return null;
  }
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
  const { q, status = [], source = [], isHighlighted, page = 1, pageSize } = params;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (pageSize) qs.set("pageSize", String(pageSize));
  if (q) qs.set("q", q);
  status.forEach((s) => qs.append("status", s));
  source.forEach((s) => qs.append("source", s));
  if (isHighlighted !== undefined) qs.set("isHighlighted", String(isHighlighted));
  return apiFetch<TestimonialListResult>(`/admin/testimonials?${qs}`);
}

export async function createTestimonial(data: TestimonialFormData): Promise<Testimonial> {
  return apiFetch<Testimonial>("/admin/testimonials", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTestimonial(id: string, data: Partial<TestimonialFormData>): Promise<Testimonial> {
  return apiFetch<Testimonial>(`/admin/testimonials/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTestimonial(id: string): Promise<void> {
  await apiFetch<void>(`/admin/testimonials/${id}`, { method: "DELETE" });
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
  const current = await getTrustBadges();
  const saved = await saveTrustBadges([...current, data]);
  return saved[saved.length - 1];
}

export async function updateTrustBadge(id: string, data: Partial<TrustBadgeFormData>): Promise<TrustBadge> {
  const current = await getTrustBadges();
  const idx = current.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error("Trust badge not found");
  const saved = await saveTrustBadges(current.map((b, i) => (i === idx ? { ...b, ...data } : b)));
  return saved[idx];
}

export async function deleteTrustBadge(id: string): Promise<void> {
  const current = await getTrustBadges();
  await saveTrustBadges(current.filter((b) => b.id !== id));
}

// ──────────────────────────────────────────────────────────────────────────────
// CATEGORY SHORTCUTS
// ──────────────────────────────────────────────────────────────────────────────

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
  const current = await getCategoryShortcuts();
  const saved = await saveCategoryShortcuts([...current, data]);
  return saved[saved.length - 1];
}

export async function updateCategoryShortcut(id: string, data: Partial<CategoryShortcutFormData>): Promise<CategoryShortcut> {
  const current = await getCategoryShortcuts();
  const idx = current.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Category shortcut not found");
  const saved = await saveCategoryShortcuts(current.map((c, i) => (i === idx ? { ...c, ...data } : c)));
  return saved[idx];
}

export async function deleteCategoryShortcut(id: string): Promise<void> {
  const current = await getCategoryShortcuts();
  await saveCategoryShortcuts(current.filter((c) => c.id !== id));
}

// ──────────────────────────────────────────────────────────────────────────────
// FOOTER CONFIG
// ──────────────────────────────────────────────────────────────────────────────

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
