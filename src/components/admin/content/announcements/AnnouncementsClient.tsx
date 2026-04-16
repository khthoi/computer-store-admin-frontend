"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, MegaphoneIcon, BellAlertIcon, EyeIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { PopupFormModal } from "./PopupFormModal";
import { PopupPreview } from "./PopupPreview";
import { AnnouncementBarFormModal } from "./AnnouncementBarFormModal";
import { AnnouncementBarPreview } from "./AnnouncementBarPreview";
import { getPopups, getAnnouncementBars, deletePopup, deleteAnnouncementBar } from "@/src/services/content.service";
import type { Popup, AnnouncementBar, PopupStatus, BarStatus } from "@/src/types/content.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_POPUP: Record<PopupStatus, { label: string; variant: "success" | "warning" | "error" | "default" | "info" }> = {
  active:    { label: "Hoạt động", variant: "success" },
  scheduled: { label: "Lên lịch",  variant: "info" },
  draft:     { label: "Nháp",      variant: "default" },
  ended:     { label: "Kết thúc",  variant: "error" },
};

const STATUS_BAR: Record<BarStatus, { label: string; variant: "success" | "warning" | "error" | "default" | "info" }> = {
  active:    { label: "Hoạt động", variant: "success" },
  scheduled: { label: "Lên lịch",  variant: "info" },
  draft:     { label: "Nháp",      variant: "default" },
  ended:     { label: "Kết thúc",  variant: "error" },
};

// ─── Popup list tab ───────────────────────────────────────────────────────────

function PopupTab() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formTarget, setFormTarget] = useState<Popup | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Popup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    getPopups().then((data) => { setPopups(data); setIsLoading(false); });
  }, []);

  function handleSaved(popup: Popup) {
    setPopups((prev) => {
      const idx = prev.findIndex((p) => p.id === popup.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = popup; return next; }
      return [popup, ...prev];
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deletePopup(deleteTarget.id);
      setPopups((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally { setIsDeleting(false); }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-secondary-600">Quản lý popup hiển thị cho khách hàng trên website</p>
        <Button size="sm" leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setFormTarget("new")}>
          Tạo popup mới
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary-100" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {popups.map((popup) => {
            const cfg = STATUS_POPUP[popup.status];
            const isOpen = previewId === popup.id;
            return (
              <div key={popup.id} className="overflow-hidden rounded-xl border border-secondary-200 bg-white">
                <div className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                    <MegaphoneIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-secondary-800">{popup.name}</span>
                      <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-secondary-500">
                      {popup.position} · Kích hoạt: {popup.trigger}
                      {popup.startDate ? ` · ${popup.startDate}` : ""}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-secondary-400">
                      <span>{popup.viewCount.toLocaleString("vi-VN")} lượt xem</span>
                      <span>{popup.clickCount.toLocaleString("vi-VN")} lượt click</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip content={isOpen ? "Ẩn demo" : "Xem demo"} placement="top">
                      <Button
                        variant="ghost" size="xs"
                        className={isOpen ? "text-primary-600 bg-primary-50" : ""}
                        onClick={() => setPreviewId(isOpen ? null : popup.id)}
                      >
                        {isOpen
                          ? <ChevronUpIcon className="h-3.5 w-3.5" />
                          : <EyeIcon className="h-3.5 w-3.5" />
                        }
                      </Button>
                    </Tooltip>
                    <Tooltip content="Chỉnh sửa" placement="top">
                      <Button variant="ghost" size="xs" onClick={() => setFormTarget(popup)}>
                        <PencilIcon className="h-3.5 w-3.5" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Xóa" placement="top">
                      <Button variant="ghost" size="xs" className="text-error-500 hover:bg-error-50"
                        onClick={() => setDeleteTarget(popup)}>
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-secondary-100 px-4 pb-4 pt-3">
                    <PopupPreview
                      data={{
                        position: popup.position,
                        title: popup.title,
                        body: popup.body,
                        imageUrl: popup.imageUrl,
                        ctaLabel: popup.ctaLabel,
                        showCloseButton: popup.showCloseButton,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {!popups.length && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <MegaphoneIcon className="h-10 w-10 text-secondary-300" />
              <p className="text-sm text-secondary-500">Chưa có popup nào</p>
            </div>
          )}
        </div>
      )}

      {/* Form modal */}
      {formTarget !== null && (
        <PopupFormModal
          popup={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa popup"
        description={`Xóa popup "${deleteTarget?.name}"?`}
        confirmLabel="Xóa"
        variant="danger"
      />
    </>
  );
}

// ─── Announcement bar tab ─────────────────────────────────────────────────────

function AnnouncementBarTab() {
  const [bars, setBars] = useState<AnnouncementBar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formTarget, setFormTarget] = useState<AnnouncementBar | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementBar | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getAnnouncementBars().then((data) => { setBars(data); setIsLoading(false); });
  }, []);

  function handleSaved(bar: AnnouncementBar) {
    setBars((prev) => {
      const idx = prev.findIndex((b) => b.id === bar.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = bar; return next; }
      return [bar, ...prev];
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAnnouncementBar(deleteTarget.id);
      setBars((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally { setIsDeleting(false); }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-secondary-600">Thanh thông báo nằm đầu hoặc cuối trang website</p>
        <Button size="sm" leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setFormTarget("new")}>
          Thêm thanh thông báo
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary-100" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {bars.map((bar) => {
            const cfg = STATUS_BAR[bar.status];
            return (
              <div key={bar.id} className="rounded-xl border border-secondary-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <BellAlertIcon className="h-4 w-4 text-secondary-400 shrink-0" />
                    <span className="font-medium text-secondary-800 truncate">{bar.name}</span>
                    <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                    <span className="text-xs text-secondary-400">{bar.position === "top" ? "Đầu trang" : "Cuối trang"} · Ưu tiên {bar.priority}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip content="Chỉnh sửa" placement="top">
                      <Button variant="ghost" size="xs" onClick={() => setFormTarget(bar)}>
                        <PencilIcon className="h-3.5 w-3.5" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Xóa" placement="top">
                      <Button variant="ghost" size="xs" className="text-error-500 hover:bg-error-50"
                        onClick={() => setDeleteTarget(bar)}>
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
                <AnnouncementBarPreview data={bar} />
              </div>
            );
          })}

          {!bars.length && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <BellAlertIcon className="h-10 w-10 text-secondary-300" />
              <p className="text-sm text-secondary-500">Chưa có thanh thông báo nào</p>
            </div>
          )}
        </div>
      )}

      {formTarget !== null && (
        <AnnouncementBarFormModal
          bar={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa thanh thông báo"
        description={`Xóa thanh thông báo "${deleteTarget?.name}"?`}
        confirmLabel="Xóa"
        variant="danger"
      />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnnouncementsClient() {
  return (
    <Tabs
      variant="line"
      defaultValue="popups"
      tabs={[
        { value: "popups", label: "Popup" },
        { value: "bars", label: "Thanh thông báo" },
      ]}
    >
      <TabPanel value="popups" className="mt-5"><PopupTab /></TabPanel>
      <TabPanel value="bars" className="mt-5"><AnnouncementBarTab /></TabPanel>
    </Tabs>
  );
}
