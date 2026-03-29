"use client";

import { useState, useEffect, useRef } from "react";
import { XMarkIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

// ─── VideoEmbedModal ──────────────────────────────────────────────────────────
//
// A small modal that prompts the user for a YouTube / Vimeo URL before
// inserting a video embed into the editor.

interface VideoEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
}

export function VideoEmbedModal({ isOpen, onClose, onConfirm }: VideoEmbedModalProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when the modal opens
  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  function validate(value: string): string {
    if (!value.trim()) return "URL is required.";
    const isYt = /youtube\.com|youtu\.be/.test(value);
    const isVimeo = /vimeo\.com/.test(value);
    if (!isYt && !isVimeo) return "Only YouTube and Vimeo URLs are supported.";
    return "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(url);
    if (err) { setError(err); return; }
    onConfirm(url.trim());
    setUrl("");
    setError("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Embed video"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
              <VideoCameraIcon className="h-5 w-5 text-primary-600" />
            </span>
            <h2 className="text-base font-semibold text-secondary-900">Embed Video</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="video-url"
              className="mb-1.5 block text-sm font-medium text-secondary-700"
            >
              YouTube or Vimeo URL
            </label>
            <input
              ref={inputRef}
              id="video-url"
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              placeholder="https://www.youtube.com/watch?v=..."
              className={`w-full rounded-lg border px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                error
                  ? "border-error-400 focus:border-error-500 focus:ring-error-200"
                  : "border-secondary-200 focus:border-primary-500 focus:ring-primary-200"
              }`}
            />
            {error && (
              <p className="mt-1.5 text-xs text-error-600">{error}</p>
            )}
            <p className="mt-1.5 text-xs text-secondary-400">
              Supports YouTube and Vimeo share links.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Embed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
