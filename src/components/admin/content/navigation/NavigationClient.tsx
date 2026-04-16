"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Dropzone } from "@/src/components/ui/Dropzone";
import { useToast } from "@/src/components/ui/Toast";
import { FlatNavEditor } from "./FlatNavEditor";
import { TrustBadgeEditor } from "./TrustBadgeEditor";
import { CategoryShortcutEditor } from "./CategoryShortcutEditor";
import { FooterEditor } from "./FooterEditor";
import { SocialLinksEditor } from "./SocialLinksEditor";
import {
  getMenus,
  getTrustBadges,
  getCategoryShortcuts,
  getFooterConfig,
  saveFooterConfig,
} from "@/src/services/content.service";
import type { Menu, TrustBadge, CategoryShortcut, FooterConfig } from "@/src/types/content.types";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary-100" />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NavigationClient() {
  const { showToast } = useToast();
  const [menus, setMenus]               = useState<Menu[]>([]);
  const [trustBadges, setTrustBadges]   = useState<TrustBadge[]>([]);
  const [shortcuts, setShortcuts]       = useState<CategoryShortcut[]>([]);
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [footerDirty, setFooterDirty]   = useState(false);
  const [isSavingFooter, setIsSavingFooter] = useState(false);

  useEffect(() => {
    Promise.all([
      getMenus(),
      getTrustBadges(),
      getCategoryShortcuts(),
      getFooterConfig(),
    ]).then(([menusResult, badges, cats, footer]) => {
      setMenus(menusResult.data);
      setTrustBadges(badges);
      setShortcuts(cats);
      setFooterConfig(footer);
      setIsLoading(false);
    });
  }, []);

  function updateMenu(updated: Menu) {
    setMenus((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  function getMenu(location: string): Menu | undefined {
    return menus.find((m) => m.location === location);
  }

  // ── Footer config state (shared between header brand/social + footer tab) ──

  function updateFooterConfig(patch: Partial<FooterConfig>) {
    setFooterConfig((prev) => (prev ? { ...prev, ...patch } : prev));
    setFooterDirty(true);
  }

  async function handleSaveFooter() {
    if (!footerConfig) return;
    setIsSavingFooter(true);
    try {
      await saveFooterConfig(footerConfig);
      setFooterDirty(false);
      showToast("Đã lưu cấu hình", "success");
    } catch {
      showToast("Lưu thất bại", "error");
    } finally {
      setIsSavingFooter(false);
    }
  }

  if (isLoading) return <Skeleton />;

  const headerMenu = getMenu("header_main");
  const mobileMenu = getMenu("mobile_main");

  return (
    <Tabs
      variant="line"
      defaultValue="header"
      tabs={[
        { value: "header",    label: "Header" },
        { value: "homepage",  label: "Trang chủ" },
        { value: "footer",    label: "Footer" },
        { value: "mobile",    label: "Mobile" },
      ]}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — Header
      ══════════════════════════════════════════════════════════════════════ */}
      <TabPanel value="header" className="mt-5 space-y-5">
        {/* Logo & Social — shared config with footer */}
        {footerConfig && (
          <div className="rounded-xl border border-secondary-200 bg-white p-5 space-y-5">
            {/* Section header with save button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-secondary-800">Logo & Mạng xã hội</h3>
                <p className="mt-0.5 text-xs text-secondary-500">
                  Dùng chung cho header và footer — thay đổi sẽ áp dụng cho cả hai vị trí.
                </p>
              </div>
              {footerDirty && (
                <Button size="sm" variant="primary" onClick={handleSaveFooter} isLoading={isSavingFooter}>
                  Lưu thay đổi
                </Button>
              )}
            </div>

            {/* Logo upload */}
            <div>
              <p className="mb-2 text-sm font-medium text-secondary-700">Logo cửa hàng</p>
              <Dropzone
                initialUrl={footerConfig.brand.logoUrl || undefined}
                onPreviewChange={(url) =>
                  updateFooterConfig({ brand: { ...footerConfig.brand, logoUrl: url } })
                }
                aspectRatioHint="3:1 — Kích thước đề nghị 180 × 60 px (PNG/SVG nền trong)"
                maxSizeMB={1}
              />
              <div className="mt-3">
                <Input
                  label="Alt text logo"
                  value={footerConfig.brand.logoAlt}
                  onChange={(e) =>
                    updateFooterConfig({ brand: { ...footerConfig.brand, logoAlt: e.target.value } })
                  }
                  placeholder="PC Store"
                  helperText="Văn bản thay thế khi ảnh không tải được"
                />
              </div>
            </div>

            {/* Social links */}
            <div>
              <p className="mb-2 text-sm font-medium text-secondary-700">Mạng xã hội</p>
              <SocialLinksEditor
                value={footerConfig.socialLinks}
                onChange={(links) => updateFooterConfig({ socialLinks: links })}
              />
            </div>
          </div>
        )}

        {/* Megamenu info */}
        <div className="flex gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4">
          <Squares2X2Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
          <div>
            <p className="text-sm font-semibold text-primary-800">
              Mega menu "Danh mục ▾" — tự động sinh từ cây danh mục
            </p>
            <p className="mt-1 text-xs text-primary-600">
              Nút <strong>Danh mục</strong> không cần cấu hình thủ công.
              Hệ thống tự đọc cây danh mục và sinh URL theo quy tắc:
            </p>
            <code className="mt-1.5 block rounded-lg bg-primary-100 px-3 py-1.5 font-mono text-xs text-primary-700">
              /products/{"<slug-cha>"}{"/<slug-con>"}{"/<slug-chắt>"}
            </code>
            <p className="mt-1.5 text-xs text-primary-500">
              Ví dụ: Linh kiện → GPU → GPU cao cấp →{" "}
              <span className="font-mono">/products/linh-kien-may-tinh/gpu/gpu-cao-cap</span>
            </p>
            <p className="mt-1.5 text-xs text-primary-500">
              Thêm / sửa danh mục tại{" "}
              <Link href="/categories" className="font-medium underline">
                Quản lý danh mục
              </Link>.
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-xl border border-secondary-200 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-secondary-800">
              Liên kết nhanh trên thanh điều hướng
            </h3>
            <p className="mt-0.5 text-xs text-secondary-500">
              Các nút hiển thị ngay trên nav bar: Laptop, PC, Gaming, CPU, GPU…
            </p>
          </div>
          {headerMenu
            ? <FlatNavEditor menu={headerMenu} onMenuChanged={updateMenu} />
            : <p className="text-sm text-secondary-400">Không tìm thấy menu header.</p>
          }
        </div>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — Trang chủ (Trust Badges + Category Shortcuts)
      ══════════════════════════════════════════════════════════════════════ */}
      <TabPanel value="homepage" className="mt-5 space-y-5">

        {/* Trust Badges */}
        <div className="rounded-xl border border-secondary-200 bg-white p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-secondary-800">
              Trust Badges
            </h3>
            <p className="mt-0.5 text-xs text-secondary-500">
              Dải biểu tượng ưu điểm hiển thị bên dưới hero banner:
              Miễn phí giao hàng, Bảo hành chính hãng, Đổi trả, Hỗ trợ 1/7…
            </p>
          </div>
          <TrustBadgeEditor initialBadges={trustBadges} />
        </div>

        {/* Category Shortcuts */}
        <div className="rounded-xl border border-secondary-200 bg-white p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-secondary-800">
              Danh mục nổi bật
            </h3>
            <p className="mt-0.5 text-xs text-secondary-500">
              Slider icon danh mục bên dưới trust badges: CPU, GPU, Laptop, SSD…
              Mỗi mục có icon ảnh, nhãn và URL đích.
            </p>
          </div>
          <CategoryShortcutEditor initialItems={shortcuts} />
        </div>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3 — Footer
      ══════════════════════════════════════════════════════════════════════ */}
      <TabPanel value="footer" className="mt-5">
        {footerConfig ? (
          <FooterEditor
            config={footerConfig}
            menus={menus}
            onMenuChanged={updateMenu}
            onChange={updateFooterConfig}
            onSave={handleSaveFooter}
            isSaving={isSavingFooter}
            isDirty={footerDirty}
          />
        ) : (
          <Skeleton />
        )}
      </TabPanel>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4 — Mobile
      ══════════════════════════════════════════════════════════════════════ */}
      <TabPanel value="mobile" className="mt-5">
        <div className="rounded-xl border border-secondary-200 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-secondary-800">Mobile menu</h3>
            <p className="mt-0.5 text-xs text-secondary-500">
              Hiển thị trong drawer trượt khi người dùng mở menu trên điện thoại.
            </p>
          </div>
          {mobileMenu
            ? <FlatNavEditor menu={mobileMenu} onMenuChanged={updateMenu} />
            : <p className="text-sm text-secondary-400">Không tìm thấy menu mobile.</p>
          }
        </div>
      </TabPanel>
    </Tabs>
  );
}
