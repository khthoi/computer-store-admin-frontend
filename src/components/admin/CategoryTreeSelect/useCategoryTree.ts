"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { CategoryNode } from "./types";
import {
  buildBreadcrumb,
  buildNodeMap,
  filterTree,
  collectAllIds,
} from "./categoryTree.utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseCategoryTreeOptions {
  categories: CategoryNode[];
  value?: string;
  onChange: (id: string, node: CategoryNode) => void;
  selectableParents?: boolean;
  placeholder?: string;
}

export interface UseCategoryTreeReturn {
  // Popover
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Tree data
  visibleTree: CategoryNode[];
  // Expand / collapse
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  // Selection
  selectedNode: CategoryNode | null;
  selectedBreadcrumb: CategoryNode[];
  handleSelect: (id: string, node: CategoryNode) => void;
  clearSelection: () => void;
  // Trigger display
  triggerLabel: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCategoryTree({
  categories,
  value,
  onChange,
  selectableParents = true,
  placeholder = "Select a category",
}: UseCategoryTreeOptions): UseCategoryTreeReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQueryRaw] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Snapshot of expandedIds before search mode — restored when search clears
  const preSearchExpanded = useRef<Set<string> | null>(null);

  // ── Derived: node map for O(1) lookup ─────────────────────────────────────
  const nodeMap = useMemo(() => buildNodeMap(categories), [categories]);

  // ── Derived: breadcrumb for current value ─────────────────────────────────
  const selectedBreadcrumb = useMemo(() => {
    if (!value) return [];
    return buildBreadcrumb(value, categories) ?? [];
  }, [value, categories]);

  const selectedNode = useMemo(
    () => (value ? (nodeMap.get(value) ?? null) : null),
    [value, nodeMap]
  );

  // ── Expand path to a node (called on initial value + on open) ─────────────
  const expandToNode = useCallback(
    (id: string) => {
      const path = buildBreadcrumb(id, categories);
      if (!path || path.length < 2) return;
      // Expand all ancestors (all except the leaf itself)
      setExpandedIds((prev) => {
        const next = new Set(prev);
        path.slice(0, -1).forEach((n) => next.add(n.id));
        return next;
      });
    },
    [categories]
  );

  // Auto-expand path when value changes or on mount
  useEffect(() => {
    if (value) expandToNode(value);
  }, [value, expandToNode]);

  // ── Visible tree (filtered when searching) ────────────────────────────────
  const visibleTree = useMemo(
    () => (searchQuery ? filterTree(categories, searchQuery) : categories),
    [categories, searchQuery]
  );

  // ── Search mode: auto-expand all; restore on clear ────────────────────────
  const setSearchQuery = useCallback(
    (q: string) => {
      setSearchQueryRaw(q);

      if (q && !preSearchExpanded.current) {
        // Entering search mode — snapshot current expansion
        preSearchExpanded.current = new Set(expandedIds);
        // Expand everything in the filtered result
        const allIds = collectAllIds(filterTree(categories, q));
        setExpandedIds(new Set(allIds));
      } else if (!q && preSearchExpanded.current) {
        // Leaving search mode — restore previous expansion
        setExpandedIds(preSearchExpanded.current);
        preSearchExpanded.current = null;
      } else if (q) {
        // Query changed while already in search mode — re-expand filtered tree
        const allIds = collectAllIds(filterTree(categories, q));
        setExpandedIds(new Set(allIds));
      }
    },
    [categories, expandedIds]
  );

  // ── Toggle a single node's expansion ──────────────────────────────────────
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Panel open / close ─────────────────────────────────────────────────────
  const openPanel = useCallback(() => {
    setIsOpen(true);
    setSearchQueryRaw("");
    preSearchExpanded.current = null;
    // Re-expand path to selected value each time the panel opens
    if (value) expandToNode(value);
  }, [value, expandToNode]);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    setSearchQueryRaw("");
    preSearchExpanded.current = null;
  }, []);

  // ── Selection ──────────────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (id: string, node: CategoryNode) => {
      onChange(id, node);
      closePanel();
    },
    [onChange, closePanel]
  );

  const clearSelection = useCallback(() => {
    // Pass empty string + a dummy node to satisfy the signature; callers
    // should check for empty string to detect "cleared" state.
    onChange("", { id: "", label: "" });
    setSearchQueryRaw("");
  }, [onChange]);

  // ── Trigger label ──────────────────────────────────────────────────────────
  const triggerLabel = useMemo(() => {
    if (!value || selectedBreadcrumb.length === 0) return "";
    return selectedBreadcrumb.map((n) => n.label).join(" › ");
  }, [value, selectedBreadcrumb]);

  return {
    isOpen,
    openPanel,
    closePanel,
    searchQuery,
    setSearchQuery,
    visibleTree,
    expandedIds,
    toggleExpand,
    selectedNode,
    selectedBreadcrumb,
    handleSelect,
    clearSelection,
    triggerLabel,
  };
}
