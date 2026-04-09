"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  PlayIcon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  MinusIcon,
  PlusIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryMedia {
  /** Unique key */
  key: string;
  /** Image or video source URL */
  src: string;
  alt: string;
  /** Thumbnail URL (falls back to src) */
  thumbnailSrc?: string;
  type?: "image" | "video";
}

export interface ProductImageGalleryProps {
  items: GalleryMedia[];
  /**
   * Initial active index
   * @default 0
   */
  defaultIndex?: number;
  className?: string;
}

export interface MediaLightboxProps {
  items: GalleryMedia[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_ZOOM  = 1;
const MAX_ZOOM  = 4;
const ZOOM_STEP = 0.25;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampPan(x: number, y: number, zoom: number) {
  const maxPan = 300 * (zoom - 1);
  return { x: clamp(x, -maxPan, maxPan), y: clamp(y, -maxPan, maxPan) };
}

function getTouchDist(touches: TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// ─── ToolbarButton ────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  children,
  ariaLabel,
  active,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-white/30 text-white"
          : "text-white/80 hover:bg-white/20 hover:text-white",
        disabled ? "opacity-40 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ─── MediaLightbox (named export — usable standalone) ─────────────────────────

/**
 * MediaLightbox — full-screen lightbox with zoom, pan, flip and keyboard
 * shortcuts. Can be used standalone outside of ProductImageGallery.
 *
 * Keyboard: Esc close · ←/→ navigate · +/- zoom · 0 reset · H flip-H · V flip-V
 */
export function MediaLightbox({
  items,
  activeIndex,
  onClose,
  onNavigate,
}: MediaLightboxProps) {
  const closeRef       = useRef<HTMLButtonElement>(null);
  const isDragging     = useRef(false);
  const dragStart      = useRef({ x: 0, y: 0 });
  const panAtDragStart = useRef({ x: 0, y: 0 });
  const touchStartX    = useRef(0);
  const touchStartDist = useRef(0);
  const touchStartZoom = useRef(1);
  const touchStartPan  = useRef({ x: 0, y: 0 });

  const [zoom,     setZoom]     = useState(1);
  const [pan,      setPan]      = useState({ x: 0, y: 0 });
  const [flipH,    setFlipH]    = useState(false);
  const [flipV,    setFlipV]    = useState(false);
  const [dragging, setDragging] = useState(false);

  const item  = items[activeIndex];
  const total = items.length;

  const prev = useCallback(
    () => onNavigate((activeIndex - 1 + total) % total),
    [activeIndex, total, onNavigate]
  );
  const next = useCallback(
    () => onNavigate((activeIndex + 1) % total),
    [activeIndex, total, onNavigate]
  );

  // Reset transform when navigating to a new image
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFlipH(false);
    setFlipV(false);
  }, [activeIndex]);

  // Lock body scroll
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  // Focus close button on open
  useEffect(() => { closeRef.current?.focus(); }, []);

  // ── Zoom helpers ─────────────────────────────────────────────────────────────
  function changeZoom(delta: number) {
    setZoom((z) => {
      const next = clamp(Math.round((z + delta) * 100) / 100, MIN_ZOOM, MAX_ZOOM);
      if (next <= MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  }

  function resetAll() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFlipH(false);
    setFlipV(false);
  }

  // ── Keyboard ──────────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape")                         { onClose(); return; }
      if (e.key === "ArrowLeft"  && zoom <= 1)        { prev();    return; }
      if (e.key === "ArrowRight" && zoom <= 1)        { next();    return; }
      if (e.key === "+" || e.key === "=")             { changeZoom(ZOOM_STEP);  return; }
      if (e.key === "-")                              { changeZoom(-ZOOM_STEP); return; }
      if (e.key === "0")                              { setZoom(1); setPan({ x: 0, y: 0 }); return; }
      if (e.key === "h" || e.key === "H")             { setFlipH((f) => !f); return; }
      if (e.key === "v" || e.key === "V")             { setFlipV((f) => !f); return; }
    },
    [onClose, prev, next, zoom] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Wheel zoom ────────────────────────────────────────────────────────────────
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    changeZoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
  }

  // ── Mouse drag pan ────────────────────────────────────────────────────────────
  function handleMouseDown(e: React.MouseEvent) {
    if (zoom <= 1) return;
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panAtDragStart.current = pan;
    setDragging(true);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan(clampPan(panAtDragStart.current.x + dx, panAtDragStart.current.y + dy, zoom));
  }

  function handleMouseUp() {
    if (!isDragging.current) return;
    isDragging.current = false;
    setDragging(false);
  }

  // ── Touch (pinch + pan + swipe) ───────────────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      touchStartDist.current = getTouchDist(e.touches as unknown as TouchList);
      touchStartZoom.current = zoom;
      touchStartPan.current  = pan;
    } else {
      touchStartX.current = e.touches[0].clientX;
      if (zoom > 1) {
        dragStart.current      = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        panAtDragStart.current = pan;
      }
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist    = getTouchDist(e.touches as unknown as TouchList);
      const newZoom = clamp(touchStartZoom.current * (dist / touchStartDist.current), MIN_ZOOM, MAX_ZOOM);
      setZoom(newZoom);
      if (newZoom <= MIN_ZOOM) setPan({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && zoom > 1) {
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      setPan(clampPan(panAtDragStart.current.x + dx, panAtDragStart.current.y + dy, zoom));
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (zoom <= 1 && e.changedTouches.length === 1) {
      const delta = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
    }
  }

  // ── Transform ─────────────────────────────────────────────────────────────────
  const imgTransform = [
    `translate(${pan.x}px, ${pan.y}px)`,
    `scale(${zoom})`,
    flipH && "scaleX(-1)",
    flipV && "scaleY(-1)",
  ].filter(Boolean).join(" ");

  const hasMultiple = total > 1;
  const isModified  = zoom !== 1 || flipH || flipV;
  const zoomPct     = Math.round(zoom * 100);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      onClick={onClose}
      tabIndex={-1}
    >
      {/* ── Counter — top-left ── */}
      {hasMultiple && (
        <span className="absolute top-4 left-5 z-20 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white select-none pointer-events-none">
          {activeIndex + 1} / {total}
        </span>
      )}

      {/* ── Close — top-right ── */}
      <button
        ref={closeRef}
        type="button"
        aria-label="Đóng lightbox"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <XMarkIcon className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* ── Prev / Next ── */}
      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Ảnh trước"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeftIcon className="w-7 h-7" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Ảnh tiếp theo"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronRightIcon className="w-7 h-7" aria-hidden="true" />
          </button>
        </>
      )}

      {/* ── Media area ── */}
      <div
        className="relative max-h-[80vh] max-w-[75vw] flex items-center justify-center select-none"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            {item.type === "video" ? (
              <video
                src={item.src}
                controls
                className="max-h-[80vh] max-w-full rounded-xl shadow-2xl"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt}
                draggable={false}
                className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
                style={{
                  transform:  imgTransform,
                  transition: dragging ? "none" : "transform 0.1s ease",
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Controls toolbar ── */}
      <div
        className={[
          "absolute z-20 flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-2 backdrop-blur-sm text-white",
          hasMultiple ? "bottom-20 right-4" : "bottom-4 left-1/2 -translate-x-1/2",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Flip H */}
        <ToolbarButton onClick={() => setFlipH((f) => !f)} ariaLabel="Lật ngang" active={flipH}>
          <ArrowsRightLeftIcon className="w-4 h-4" />
        </ToolbarButton>

        {/* Flip V */}
        <ToolbarButton onClick={() => setFlipV((f) => !f)} ariaLabel="Lật dọc" active={flipV}>
          <ArrowsUpDownIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-4 bg-white/30 mx-0.5" />

        {/* Zoom out */}
        <ToolbarButton onClick={() => changeZoom(-ZOOM_STEP)} ariaLabel="Thu nhỏ" disabled={zoom <= MIN_ZOOM}>
          <MinusIcon className="w-4 h-4" />
        </ToolbarButton>

        {/* Zoom % */}
        <span className="text-xs font-mono w-10 text-center tabular-nums select-none">
          {zoomPct}%
        </span>

        {/* Zoom in */}
        <ToolbarButton onClick={() => changeZoom(ZOOM_STEP)} ariaLabel="Phóng to" disabled={zoom >= MAX_ZOOM}>
          <PlusIcon className="w-4 h-4" />
        </ToolbarButton>

        {/* Reset — only visible when something is modified */}
        {isModified && (
          <>
            <div className="w-px h-4 bg-white/30 mx-0.5" />
            <ToolbarButton onClick={resetAll} ariaLabel="Đặt lại">
              <ArrowUturnLeftIcon className="w-4 h-4" />
            </ToolbarButton>
          </>
        )}
      </div>

      {/* ── Thumbnail strip — bottom-center ── */}
      {hasMultiple && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 rounded bg-black/40 px-3 py-2 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((it, idx) => (
            <button
              key={it.key}
              type="button"
              aria-label={it.alt}
              aria-pressed={idx === activeIndex}
              onClick={() => onNavigate(idx)}
              className={[
                "h-10 w-10 shrink-0 overflow-hidden rounded border-2 transition-all",
                idx === activeIndex
                  ? "border-white opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.thumbnailSrc ?? it.src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

// ─── ProductImageGallery ──────────────────────────────────────────────────────

/**
 * ProductImageGallery — main image + thumbnail strip with zoom on hover
 * and lightbox on click. Supports image and video media.
 *
 * ```tsx
 * <ProductImageGallery
 *   items={[
 *     { key: "front", src: "/images/product-front.jpg", alt: "Front view" },
 *     { key: "back",  src: "/images/product-back.jpg",  alt: "Back view" },
 *     { key: "video", src: "/videos/overview.mp4", alt: "Overview", type: "video" },
 *   ]}
 * />
 * ```
 */
export function ProductImageGallery({
  items,
  defaultIndex = 0,
  className = "",
}: ProductImageGalleryProps) {
  const [activeIndex,   setActiveIndex]   = useState(clamp(defaultIndex, 0, items.length - 1));
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [imgLoaded,     setImgLoaded]     = useState(false);

  const activeItem = items[activeIndex];

  const handleThumbnailKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
      if (e.key === "ArrowRight") setActiveIndex(clamp(idx + 1, 0, items.length - 1));
      if (e.key === "ArrowLeft")  setActiveIndex(clamp(idx - 1, 0, items.length - 1));
    },
    [items.length]
  );

  useEffect(() => { setImgLoaded(false); }, [activeIndex]);

  return (
    <div className={["flex flex-col gap-3", className].filter(Boolean).join(" ")}>
      {/* ── Main image ── */}
      <div
        className="group relative aspect-square overflow-hidden rounded-xl border border-secondary-200 bg-secondary-50 cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
        role="button"
        aria-label={`Open ${activeItem.alt} in lightbox`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setLightboxOpen(true);
          }
        }}
      >
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-secondary-200" aria-hidden="true" />
        )}

        {activeItem.type === "video" ? (
          <div className="flex h-full w-full items-center justify-center">
            <video
              src={activeItem.src}
              className="h-full w-full object-contain"
              muted
              playsInline
              onLoadedData={() => setImgLoaded(true)}
            />
            <PlayIcon className="absolute w-12 h-12 text-white drop-shadow-lg" aria-hidden="true" />
          </div>
        ) : (
          <Image
            src={activeItem.src}
            alt={activeItem.alt}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={[
              "object-contain p-6 transition-transform duration-300 group-hover:scale-110",
              imgLoaded ? "opacity-100" : "opacity-0",
            ].join(" ")}
            onLoad={() => setImgLoaded(true)}
          />
        )}

        <span
          aria-hidden="true"
          className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-secondary-500 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100"
        >
          <MagnifyingGlassPlusIcon className="w-4 h-4" />
        </span>
      </div>

      {/* ── Thumbnail strip ── */}
      {items.length > 1 && (
        <div
          role="tablist"
          aria-label="Product images"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {items.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={item.alt}
                onClick={() => setActiveIndex(idx)}
                onKeyDown={(e) => handleThumbnailKeyDown(e, idx)}
                className={[
                  "relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-secondary-50 transition-all duration-150",
                  isActive
                    ? "border-primary-500 shadow-sm"
                    : "border-secondary-200 hover:border-secondary-400",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                ].join(" ")}
              >
                {item.type === "video" ? (
                  <>
                    <video src={item.src} className="h-full w-full object-cover" muted />
                    <PlayIcon className="absolute w-5 h-5 text-white drop-shadow" aria-hidden="true" />
                  </>
                ) : (
                  <Image
                    src={item.thumbnailSrc ?? item.src}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Lightbox (delegates to MediaLightbox) ── */}
      {lightboxOpen && (
        <MediaLightbox
          items={items}
          activeIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setActiveIndex}
        />
      )}
    </div>
  );
}
