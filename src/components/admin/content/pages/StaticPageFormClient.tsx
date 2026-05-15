"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { useToast } from "@/src/components/ui/Toast";
import { RichTextEditor } from "@/src/components/editor/DynamicRichTextEditor";
import { SeoPanel } from "./SeoPanel";
import { getStaticPages, getStaticPageById, createStaticPage, updateStaticPage } from "@/src/services/content.service";
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
  sortOrder: 1,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function stripStaticPageSlugPrefix(slug: string) {
  return slug.replace(/^info\//i, "").replace(/^\/+/, "");
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
  const { showToast } = useToast();

  const [form, setForm] = useState<StaticPageFormData>(DEFAULT);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof StaticPageFormData, string>>>({});

  // Load page data (edit) or compute next sortOrder (create)
  useEffect(() => {
    if (pageId) {
      getStaticPageById(pageId).then((p) => {
        if (p) {
          setForm({
            title: p.title, slug: stripStaticPageSlugPrefix(p.slug), status: p.status, content: p.content,
            seo: p.seo, template: p.template, showInFooter: p.showInFooter,
            showInHeader: p.showInHeader, sortOrder: p.sortOrder,
          });
        }
        setIsLoading(false);
      });
    } else {
      getStaticPages({ pageSize: 200 }).then((res) => {
        const maxOrder = res.data.reduce((max, p) => Math.max(max, p.sortOrder), 0);
        setForm((prev) => ({ ...prev, sortOrder: maxOrder + 1 }));
      });
    }
  }, [pageId]);

  function set<K extends keyof StaticPageFormData>(key: K, value: StaticPageFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title") {
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
      showToast(isEdit ? "Đã cập nhật trang tĩnh." : "Đã tạo trang tĩnh.", "success");
      router.push("/content/pages");
    } catch (error) {
      const message = error instanceof Error && error.message.trim().length > 0
        ? error.message
        : "Lưu trang thất bại";
      if (message.toLowerCase().includes("slug")) {
        setErrors((prev) => ({
          ...prev,
          slug: "Slug này đã tồn tại. Mỗi trang tĩnh phải dùng một đường dẫn khác nhau.",
        }));
      }
      showToast(message, "error");
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
          {/* Sort order badge */}
          <div className="flex items-center gap-2 text-sm text-secondary-600">
            <span>Thứ tự của trang:</span>
            <Badge variant="primary">{form.sortOrder}</Badge>
          </div>

          <Input
            label="Tiêu đề trang"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ví dụ: Chính sách bảo hành"
            errorMessage={errors.title}
          />
          <div className="flex flex-col gap-1">
            <label className="block select-none text-sm font-medium text-secondary-700">
              Slug (URL)
              <span aria-hidden="true" className="ml-0.5 select-none text-error-600">*</span>
            </label>
            <div className="flex items-start">
              <span
                className={[
                  "inline-flex h-10 shrink-0 items-center rounded-l border border-r-0 px-3 text-sm font-medium",
                  errors.slug
                    ? "border-error-400 bg-error-50 text-error-700"
                    : "border-secondary-300 bg-secondary-100 text-secondary-600",
                ].join(" ")}
              >
                info/
              </span>
              <Input
                value={form.slug}
                readOnly
                placeholder="chinh-sach-bao-hanh"
                errorMessage={errors.slug}
                className="rounded-l-none border-l-0"
              />
            </div>
            <p className="text-xs text-secondary-400">
              Slug được tạo tự động từ tiêu đề và luôn có tiền tố <span className="font-medium text-secondary-500">info/</span>. Mỗi trang tĩnh phải có slug duy nhất.
            </p>
          </div>
        </section>

        {/* Content editor */}
        <section className="rounded-xl border border-secondary-200 bg-white p-5">
          <RichTextEditor
            label="Nội dung"
            required
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
          <h3 className="text-sm font-semibold text-secondary-700">Giao diện</h3>
          <Select
            label="Template bố cục"
            value={form.template}
            onChange={(v) => set("template", v as StaticPageFormData["template"])}
            options={TEMPLATE_OPTIONS}
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
