"use client";

import { useRef, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CategorySearchInput } from "./CategorySearchInput";
import { CategoryTreeNode } from "./CategoryTreeNode";
import { useCategoryTree } from "./useCategoryTree";
import type { CategoryTreeSelectProps } from "./types";

// ─── CategoryTreeSelect ───────────────────────────────────────────────────────

interface DropdownPos {
  top: number;
  left: number;
  width: number;
  flipUp: boolean;
}

export function CategoryTreeSelect({
  categories,
  value,
  onChange,
  placeholder = "Select a category",
  label,
  required,
  errorMessage,
  helperText,
  selectableParents = true,
  disabled = false,
  className = "",
}: CategoryTreeSelectProps) {
  const uid = useId();
  const triggerId = `cts-trigger-${uid}`;
  const labelId   = `cts-label-${uid}`;
  const panelId   = `cts-panel-${uid}`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);

  const {
    isOpen,
    openPanel,
    closePanel,
    searchQuery,
    setSearchQuery,
    visibleTree,
    expandedIds,
    toggleExpand,
    handleSelect,
    clearSelection,
    triggerLabel,
  } = useCategoryTree({
    categories,
    value,
    onChange,
    selectableParents,
    placeholder,
  });

  // ── Portal positioning — mirrors Select component ──────────────────────────
  useEffect(() => {
    if (!isOpen || !triggerRef.current) {
      setDropdownPos(null);
      return;
    }

    function updatePosition() {
      const rect = triggerRef.current!.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const flipUp = spaceBelow < 320 && rect.top > spaceBelow;

      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        flipUp,
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        closePanel();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, closePanel]);

  // ── Close on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closePanel();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closePanel]);

  // ── Trigger styles ─────────────────────────────────────────────────────────
  const triggerBase = [
    "flex w-full items-center gap-2 rounded border px-3 py-2 text-left text-sm transition-colors duration-150",
    "cursor-pointer focus:outline-none focus:ring-2",
    "disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-400",
  ].join(" ");

  const triggerState = disabled
    ? "border-secondary-200 bg-secondary-50 text-secondary-400 opacity-70"
    : errorMessage
    ? "border-error-400 bg-white text-secondary-900 focus:border-error-500 focus:ring-error-500/15"
    : isOpen
    ? "border-primary-500 bg-white text-secondary-900 ring-2 ring-primary-500/15"
    : "border-secondary-300 bg-white text-secondary-900 hover:border-secondary-400 focus:border-primary-500 focus:ring-primary-500/15";

  // ── Panel JSX (rendered into portal) ──────────────────────────────────────
  const panel =
    isOpen && dropdownPos
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="tree"
            aria-label="Category hierarchy"
            className="fixed z-[9999] overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-xl"
            style={
              dropdownPos.flipUp
                ? {
                    bottom: `${window.innerHeight - dropdownPos.top + 8}px`,
                    left:   `${dropdownPos.left}px`,
                    width:  `${dropdownPos.width}px`,
                    minWidth: "280px",
                  }
                : {
                    top:   `${dropdownPos.top}px`,
                    left:  `${dropdownPos.left}px`,
                    width: `${dropdownPos.width}px`,
                    minWidth: "280px",
                  }
            }
          >
            {/* Search */}
            <CategorySearchInput
              value={searchQuery}
              onChange={setSearchQuery}
            />

            {/* Tree list */}
            <ul
              role="group"
              className="max-h-72 overflow-y-auto p-1.5 space-y-0.5"
            >
              {visibleTree.length === 0 ? (
                <li className="py-8 text-center text-sm text-secondary-400">
                  No categories found.
                </li>
              ) : (
                visibleTree.map((node) => (
                  <CategoryTreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    isExpanded={expandedIds.has(node.id)}
                    isSelected={value === node.id}
                    isSelectable={
                      (node.children?.length ?? 0) > 0 ? selectableParents : true
                    }
                    hasChildren={(node.children?.length ?? 0) > 0}
                    onSelect={handleSelect}
                    onToggleExpand={toggleExpand}
                    expandedIds={expandedIds}
                    selectedId={value}
                    selectableParents={selectableParents}
                    searchQuery={searchQuery}
                  />
                ))
              )}
            </ul>
          </div>,
          document.body
        )
      : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label
          id={labelId}
          className="block text-sm font-medium text-secondary-700"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-error-500" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="tree"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-required={required}
        aria-invalid={!!errorMessage}
        disabled={disabled}
        onClick={() => (isOpen ? closePanel() : openPanel())}
        className={`${triggerBase} ${triggerState}`}
      >
        {/* Breadcrumb / placeholder */}
        <span
          className={`min-w-0 flex-1 truncate ${
            triggerLabel ? "text-secondary-900" : "text-secondary-400"
          }`}
          title={triggerLabel || undefined}
        >
          {triggerLabel || placeholder}
        </span>

        {/* Clear button */}
        {value && !disabled && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear selection"
            onClick={(e) => { e.stopPropagation(); clearSelection(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                clearSelection();
              }
            }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </span>
        )}

        {/* Chevron */}
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-secondary-400 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Error / helper */}
      {errorMessage ? (
        <p className="text-xs text-error-600">{errorMessage}</p>
      ) : helperText ? (
        <p className="text-xs text-secondary-400">{helperText}</p>
      ) : null}

      {/* Portal panel */}
      {panel}
    </div>
  );
}
