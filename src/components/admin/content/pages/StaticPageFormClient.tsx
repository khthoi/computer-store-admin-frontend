"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { RichTextEditor } from "@/src/components/editor/DynamicRichTextEditor";
import { SeoPanel } from "./SeoPanel";
import { getStaticPageById, createStaticPage, updateStaticPage } from "@/src/services/content.service";
import type { StaticPageFormData, StaticPageStatus, SeoMeta } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaticPageFormClientProps {
  pageId?: string;
}

// ─── Default state ────────────────────────────────────────────────────────────

const DEFAULT: StaticPageFormData = {
  title: "",
  slug: "",
  status: "draft",
  content: "",
  seo: {},
  template: "default",
  showInFooter: false,
  showInHeader: false,
  sortOrder: 10,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Option lists ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "draft",     label: "Nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "archived",  label: "Lưu trữ" },
];

const TEMPLATE_OPTIONS = [
  {
    value: "default",
    label: "Mặc định",
    description: "Có header, footer, sidebar điều hướng",
  },
  {
    value: "fullwidth",
    label: "Full width",
    description: "Nội dung trải rộng toàn trang, không sidebar",
  },
  {
    value: "sidebar",
    label: "Có sidebar",
    description: "Cột nội dung + cột phụ bên phải",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function StaticPageFormClient({ pageId }: StaticPageFormClientProps) {
  const router = useRouter();
  const isEdit = Boolean(pageId);

  const [form, setForm] = useState<StaticPageFormData>(DEFAULT);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof StaticPageFormData, string>>>({});
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (!pageId) return;
    getStaticPageById(pageId).then((p) => {
      if (p) {
        setForm({
          title: p.title, slug: p.slug, status: p.status, content: p.content,
          seo: p.seo, template: p.template, showInFooter: p.showInFooter,
          showInHeader: p.showInHeader, sortOrder: p.sortOrder,
        });
        setSlugManual(true);
      }
      setIsLoading(false);
    });
  }, [pageId]);

  function set<K extends keyof StaticPageFormData>(key: K, value: StaticPageFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugManual) {
        next.slug = toSlug(value as string);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = "Tiêu đề không được để trống";
    if (!form.slug.trim()) errs.slug = "Slug không được để trống";
    if (!form.content.trim()) errs.content = "Nội dung không được để trống";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(status?: StaticPageStatus) {
    if (!validate()) return;
    const data = status ? { ...form, status } : form;
    setForm(data);
    setIsSaving(true);
    try {
      if (isEdit && pageId) { await updateStaticPage(pageId, data); }
      else { await createStaticPage(data); }
      router.push("/content/pages");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" /></div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:col-span-2">
        {/* Title + slug */}
        <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-4">
          <Input
            label="Tiêu đề trang *"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ví dụ: Chính sách bảo hành"
            errorMessage={errors.title}
          />
          <div className="flex flex-col gap-1">
            <Input
              label="Slug (URL)"
              value={form.slug}
              onChange={(e) => { setSlugManual(true); set("slug", e.target.value); }}
              placeholder="chinh-sach-bao-hanh"
              errorMessage={errors.slug}
              prefixIcon={<span className="text-xs text-secondary-400">/</span>}
            />
            {!slugManual && form.title && (
              <p className="text-xs text-secondary-400">Tự động tạo từ tiêu đề</p>
            )}
          </div>
        </section>

        {/* Content editor */}
        <section className="rounded-xl border border-secondary-200 bg-white p-5">
          <RichTextEditor
            label="Nội dung *"
            value={form.content}
            onChange={(html) => set("content", html)}
            placeholder="Nhập nội dung trang..."
            minHeight={400}
            errorMessage={errors.content}
          />
        </section>

        {/* SEO panel */}
        <SeoPanel value={form.seo} onChange={(seo: SeoMeta) => set("seo", seo)} />
      </div>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">

        {/* Xuất bản */}
        <div className="rounded-xl border border-secondary-200 bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold text-secondary-700">Xuất bản</h3>
          <Select
            label="Trạng thái"
            value={form.status}
            onChange={(v) => set("status", v as StaticPageStatus)}
            options={STATUS_OPTIONS}
          />
          <div className="flex flex-col gap-2 pt-1">
            <Button onClick={() => handleSave()} isLoading={isSaving} fullWidth>
              {isEdit ? "Lưu thay đổi" : "Lưu nháp"}
            </Button>
            {form.status !== "published" && (
              <Button variant="outline" onClick={() => handleSave("published")} isLoading={isSaving} fullWidth>
                Xuất bản ngay
              </Button>
            )}
            <Button variant="ghost" onClick={() => router.push("/content/pages")} fullWidth>
              Hủy
            </Button>
          </div>
        </div>

        {/* Giao diện */}
        <div className="rounded-xl border border-secondary-200 bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold text-secondary-700">Giao diện & sắp xếp</h3>
          <Select
            label="Template bố cục"
            value={form.template}
            onChange={(v) => set("template", v as StaticPageFormData["template"])}
            options={TEMPLATE_OPTIONS}
          />
          <Input
            type="number"
            label="Thứ tự hiển thị"
            value={String(form.sortOrder)}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
            min="1"
            helperText="Số nhỏ hơn hiển thị trước trong danh sách"
          />
        </div>

        {/* Hiển thị */}
        <div className="rounded-xl border border-secondary-200 bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold text-secondary-700">Hiển thị trong menu</h3>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <Toggle
                checked={form.showInFooter}
                onChange={(e) => set("showInFooter", e.target.checked)}
              />
              <div>
                <p className="text-sm font-medium text-secondary-700">Hiện trong Footer</p>
                <p className="text-xs text-secondary-400 mt-0.5">Thêm link vào phần cuối trang web</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Toggle
                checked={form.showInHeader}
                onChange={(e) => set("showInHeader", e.target.checked)}
              />
              <div>
                <p className="text-sm font-medium text-secondary-700">Hiện trong Header</p>
                <p className="text-xs text-secondary-400 mt-0.5">Thêm link vào thanh điều hướng trên cùng</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
