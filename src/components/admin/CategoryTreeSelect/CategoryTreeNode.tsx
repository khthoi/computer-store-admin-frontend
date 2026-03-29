"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import type { CategoryNode } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryTreeNodeProps {
  node: CategoryNode;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  isSelectable: boolean;
  hasChildren: boolean;
  onSelect: (id: string, node: CategoryNode) => void;
  onToggleExpand: (id: string) => void;
  expandedIds: Set<string>;
  selectedId: string | undefined;
  selectableParents: boolean;
  searchQuery?: string;
}

// ─── Text highlight helper ────────────────────────────────────────────────────

function HighlightedLabel({
  label,
  query,
}: {
  label: string;
  query: string;
}) {
  if (!query.trim()) return <>{label}</>;

  const lower = label.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lower.indexOf(lowerQuery);
  if (idx === -1) return <>{label}</>;

  return (
    <>
      {label.slice(0, idx)}
      <mark className="rounded bg-primary-100 px-0.5 text-primary-800">
        {label.slice(idx, idx + query.length)}
      </mark>
      {label.slice(idx + query.length)}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryTreeNode({
  node,
  depth,
  isExpanded,
  isSelected,
  isSelectable,
  hasChildren,
  onSelect,
  onToggleExpand,
  expandedIds,
  selectedId,
  selectableParents,
  searchQuery = "",
}: CategoryTreeNodeProps) {
  function handleRowClick() {
    if (hasChildren && !isSelectable) {
      onToggleExpand(node.id);
    } else if (hasChildren && isSelectable) {
      // Clicking on the label selects; clicking the chevron toggles expand
      onSelect(node.id, node);
    } else {
      onSelect(node.id, node);
    }
  }

  function handleChevronClick(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleExpand(node.id);
  }

  const isNonSelectableParent = hasChildren && !isSelectable;

  return (
    <li
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-level={depth + 1}
      className="list-none"
    >
      {/* ── Row ── */}
      {/*
       * Two-layer layout:
       *   1. Outer div  — full-width click target, carries indentation via
       *                   padding-left. Intentionally has NO background so the
       *                   highlight never bleeds into the indent / guide-line area.
       *   2. Inner div  — flex-1 content pill that starts right after the indent.
       *                   This is the ONLY element that receives bg-primary-50 /
       *                   hover:bg-secondary-50, so the highlight is cleanly
       *                   scoped to the chevron + dot + label region.
       */}
      <div
        onClick={handleRowClick}
        className={[
          "flex items-center py-0.5",
          isNonSelectableParent ? "cursor-default" : "cursor-pointer",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {/* ── Content pill (highlight lives here, not on the outer div) ── */}
        <div
          className={[
            "flex flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors",
            isSelected
              ? "bg-primary-50"
              : "hover:bg-secondary-50",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Chevron — always reserves space; invisible on leaves */}
          <span
            onClick={hasChildren ? handleChevronClick : undefined}
            className={[
              "flex h-4 w-4 shrink-0 items-center justify-center rounded transition-transform",
              hasChildren
                ? "text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
                : "invisible",
              isExpanded ? "rotate-90" : "rotate-0",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          >
            {hasChildren && <ChevronRightIcon className="h-3.5 w-3.5" />}
          </span>

          {/* Selected dot */}
          <span
            className={[
              "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
              isSelected ? "bg-primary-600" : "bg-transparent",
            ].join(" ")}
            aria-hidden="true"
          />

          {/* Label */}
          <span
            className={[
              "min-w-0 flex-1 truncate text-sm leading-5",
              isSelected
                ? "font-semibold text-primary-900"
                : isNonSelectableParent
                ? "font-medium text-secondary-400"
                : "text-secondary-700",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <HighlightedLabel label={node.label} query={searchQuery} />
          </span>
        </div>
      </div>

      {/* ── Children ── */}
      {hasChildren && isExpanded && node.children && (
        <ul role="group" className="relative">
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isExpanded={expandedIds.has(child.id)}
              isSelected={selectedId === child.id}
              isSelectable={
                (child.children?.length ?? 0) > 0 ? selectableParents : true
              }
              hasChildren={(child.children?.length ?? 0) > 0}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              expandedIds={expandedIds}
              selectedId={selectedId}
              selectableParents={selectableParents}
              searchQuery={searchQuery}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
