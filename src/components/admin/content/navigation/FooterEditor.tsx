"use client";

import { useState } from "react";
import {
  BuildingStorefrontIcon,
  PhoneIcon,
  ShareIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Dropzone } from "@/src/components/ui/Dropzone";
import { FlatNavEditor } from "./FlatNavEditor";
import { SocialLinksEditor, SOCIAL_PLATFORM_CFG } from "./SocialLinksEditor";
import type {
  FooterConfig,
  FooterLinkColumn,
  Menu,
} from "@/src/types/content.types";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  subtitle,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-secondary-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary-50"
      >
        <span className="shrink-0 text-secondary-500">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-secondary-800">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-secondary-500">{subtitle}</p>}
        </div>
        {open
          ? <ChevronUpIcon className="h-4 w-4 shrink-0 text-secondary-400" />
          : <ChevronDownIcon className="h-4 w-4 shrink-0 text-secondary-400" />
        }
      </button>
      {open && (
        <div className="border-t border-secondary-100 px-5 pb-5 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Footer Preview (dark-mode) ───────────────────────────────────────────────

function FooterPreview({
  config,
  menus,
}: {
  config: FooterConfig;
  menus: Menu[];
}) {
  function getMenu(location: string) {
    return menus.find((m) => m.location === location);
  }

  return (
    <div className="rounded-xl border border-secondary-200 bg-slate-800 p-6 text-white">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Xem trước footer
      </p>

      <div className="grid grid-cols-4 gap-6 border-b border-slate-700 pb-6">
        {/* Brand column */}
        <div className="col-span-1">
          <div className="mb-3 flex h-8 items-center">
            {config.brand.logoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={config.brand.logoUrl} alt={config.brand.logoAlt} className="h-8 object-contain" />
              : <span className="text-base font-bold text-white">{config.brand.storeName || "PC Store"}</span>
            }
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
            {config.brand.description}
          </p>
          {/* Social icons (colored circles with initials) */}
          {config.socialLinks.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {config.socialLinks.map((s) => {
                const cfg = SOCIAL_PLATFORM_CFG.find((p) => p.value === s.platform);
                return (
                  <span
                    key={s.platform}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: cfg?.color ?? "#64748b" }}
                    title={cfg?.label}
                  >
                    {cfg?.label?.[0] ?? "?"}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Link columns */}
        {config.linkColumns.map((col) => {
          const menu = getMenu(col.location);
          const visibleItems = (menu?.items ?? []).filter((i) => i.isVisible).slice(0, 8);
          return (
            <div key={col.location}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-300">
                {col.title}
              </p>
              <ul className="space-y-1.5">
                {visibleItems.map((item) => (
                  <li key={item.id} className="text-xs text-slate-400">
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Contact column */}
        {(config.contact.address || config.contact.phone || config.contact.email) && (
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-300">Liên hệ</p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {config.contact.address && <li>📍 {config.contact.address}</li>}
              {config.contact.phone && <li>📞 {config.contact.phone}</li>}
              {config.contact.email && <li>✉️ {config.contact.email}</li>}
              {config.contact.supportHours && <li>🕐 {config.contact.supportHours}</li>}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-xs text-slate-500">{config.copyright}</p>
        <div className="flex gap-4">
          {config.bottomLinks.map((link) => (
            <span key={link.url} className="text-xs text-slate-500">
              {link.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component (controlled) ─────────────────────────────────────────────

export function FooterEditor({
  config,
  menus,
  onMenuChanged,
  onChange,
  onSave,
  isSaving,
  isDirty,
}: {
  config: FooterConfig;
  menus: Menu[];
  onMenuChanged: (m: Menu) => void;
  onChange: (patch: Partial<FooterConfig>) => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
}) {
  const [showPreview, setShowPreview] = useState(false);

  function updateBrand(patch: Partial<FooterConfig["brand"]>) {
    onChange({ brand: { ...config.brand, ...patch } });
  }

  function updateContact(patch: Partial<FooterConfig["contact"]>) {
    onChange({ contact: { ...config.contact, ...patch } });
  }

  function updateColumnTitle(location: FooterLinkColumn["location"], title: string) {
    onChange({
      linkColumns: config.linkColumns.map((col) =>
        col.location === location ? { ...col, title } : col
      ),
    });
  }

  function addBottomLink() {
    onChange({ bottomLinks: [...config.bottomLinks, { label: "", url: "" }] });
  }

  function setBottomLink(idx: number, field: "label" | "url", val: string) {
    onChange({
      bottomLinks: config.bottomLinks.map((l, i) => (i === idx ? { ...l, [field]: val } : l)),
    });
  }

  function removeBottomLink(idx: number) {
    onChange({ bottomLinks: config.bottomLinks.filter((_, i) => i !== idx) });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Top save bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-secondary-400">
          {isDirty ? "Có thay đổi chưa lưu" : "Cấu hình footer"}
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Ẩn preview" : "Xem trước"}
          </Button>
          {isDirty && (
            <Button size="sm" variant="primary" onClick={onSave} isLoading={isSaving}>
              Lưu cấu hình
            </Button>
          )}
        </div>
      </div>

      {/* ── Section 1: Brand ─────────────────────────────────────────────────── */}
      <Section
        icon={<BuildingStorefrontIcon className="h-5 w-5" />}
        title="Thông tin thương hiệu"
        subtitle="Logo, tên cửa hàng, mô tả hiển thị ở cột đầu footer"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Tên cửa hàng"
            value={config.brand.storeName}
            onChange={(e) => updateBrand({ storeName: e.target.value })}
            placeholder="PC Store"
          />
          <div>
            <p className="mb-2 text-sm font-medium text-secondary-700">Logo cửa hàng</p>
            <Dropzone
              initialUrl={config.brand.logoUrl || undefined}
              onPreviewChange={(url) => updateBrand({ logoUrl: url })}
              aspectRatioHint="3:1 — Kích thước đề nghị 180 × 60 px (PNG/SVG nền trong)"
              maxSizeMB={1}
            />
          </div>
          <Input
            label="Alt text logo"
            value={config.brand.logoAlt}
            onChange={(e) => updateBrand({ logoAlt: e.target.value })}
            placeholder="PC Store"
            helperText="Văn bản thay thế khi ảnh không tải được"
          />
          <Textarea
            label="Mô tả"
            rows={3}
            value={config.brand.description}
            onChange={(e) => updateBrand({ description: e.target.value })}
            placeholder="Chuyên cung cấp Laptop và linh kiện chính hãng…"
          />
        </div>
      </Section>

      {/* ── Section 2: Contact ───────────────────────────────────────────────── */}
      <Section
        icon={<PhoneIcon className="h-5 w-5" />}
        title="Thông tin liên hệ"
        subtitle="Địa chỉ, SĐT, email, giờ hỗ trợ — hiển thị ở cột Liên hệ"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Địa chỉ"
            value={config.contact.address ?? ""}
            onChange={(e) => updateContact({ address: e.target.value || undefined })}
            placeholder="123 Nguyễn Ích Khiêm, Q.1, TP.HCM"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số điện thoại / Hotline"
              value={config.contact.phone ?? ""}
              onChange={(e) => updateContact({ phone: e.target.value || undefined })}
              placeholder="1900 1234"
            />
            <Input
              label="Email hỗ trợ"
              type="email"
              value={config.contact.email ?? ""}
              onChange={(e) => updateContact({ email: e.target.value || undefined })}
              placeholder="support@pcstore.vn"
            />
          </div>
          <Input
            label="Giờ hỗ trợ"
            value={config.contact.supportHours ?? ""}
            onChange={(e) => updateContact({ supportHours: e.target.value || undefined })}
            placeholder="8:00 – 22:00 (Thứ 2 – Chủ nhật)"
          />
        </div>
      </Section>

      {/* ── Section 3: Link columns ──────────────────────────────────────────── */}
      <Section
        icon={<LinkIcon className="h-5 w-5" />}
        title="Cột liên kết"
        subtitle="Tiêu đề và danh sách liên kết của từng cột trong footer"
      >
        <div className="flex flex-col gap-6">
          {config.linkColumns.map((col) => {
            const menu = menus.find((m) => m.location === col.location);
            return (
              <div key={col.location}>
                <div className="mb-3 flex items-end gap-3">
                  <div className="flex-1">
                    <Input
                      label="Tiêu đề cột"
                      value={col.title}
                      onChange={(e) => updateColumnTitle(col.location, e.target.value)}
                      placeholder="Hỗ trợ khách hàng"
                    />
                  </div>
                  <span className="mb-0.5 shrink-0 rounded-lg border border-secondary-200 bg-secondary-50 px-2.5 py-2 font-mono text-xs text-secondary-500">
                    {col.location}
                  </span>
                </div>
                {menu
                  ? <FlatNavEditor menu={menu} onMenuChanged={onMenuChanged} />
                  : <p className="text-sm text-secondary-400">Không tìm thấy menu.</p>
                }
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Section 4: Social links ──────────────────────────────────────────── */}
      <Section
        icon={<ShareIcon className="h-5 w-5" />}
        title="Mạng xã hội"
        subtitle="Hiển thị bên dưới mô tả cửa hàng — dùng chung với header"
      >
        <SocialLinksEditor
          value={config.socialLinks}
          onChange={(links) => onChange({ socialLinks: links })}
        />
      </Section>

      {/* ── Section 5: Bottom bar ────────────────────────────────────────────── */}
      <Section
        icon={<LinkIcon className="h-5 w-5" />}
        title="Thanh đáy (Copyright)"
        subtitle="Văn bản bản quyền và các liên kết nhỏ hiển thị ở đáy trang"
        defaultOpen={false}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Văn bản bản quyền"
            value={config.copyright}
            onChange={(e) => onChange({ copyright: e.target.value })}
            placeholder="© 2024 PC Store. All rights reserved."
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-secondary-700">Liên kết nhanh</p>
              <Button
                size="xs"
                variant="outline"
                leftIcon={<PlusIcon className="h-3 w-3" />}
                onClick={addBottomLink}
                type="button"
              >
                Thêm
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {config.bottomLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className="w-70 shrink-0 rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
                    placeholder="Nhãn"
                    value={link.label}
                    onChange={(e) => setBottomLink(idx, "label", e.target.value)}
                  />
                  <input
                    className="flex-1 rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm font-mono focus:border-primary-400 focus:outline-none"
                    placeholder="/chinh-sach-bao-mat"
                    value={link.url}
                    onChange={(e) => setBottomLink(idx, "url", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeBottomLink(idx)}
                    className="shrink-0 rounded-lg p-2 text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {config.bottomLinks.length === 0 && (
                <p className="text-xs text-secondary-400 italic">Chưa có liên kết nào.</p>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Footer preview ───────────────────────────────────────────────────── */}
      {showPreview && (
        <FooterPreview config={config} menus={menus} />
      )}

      {/* Bottom save button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={onSave}
          isLoading={isSaving}
          disabled={!isDirty}
        >
          Lưu cấu hình footer
        </Button>
      </div>
    </div>
  );
}
