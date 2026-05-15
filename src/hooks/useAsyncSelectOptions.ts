"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SelectOption } from "@/src/components/ui/Select";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AsyncSelectFetcherResult {
  /** Options to render for the current search query. */
  options: SelectOption[];
  /** Optional total count across all pages — used to render "X / Y" footer. */
  totalCount?: number;
}

export type AsyncSelectFetcher = (
  query: string,
  signal: AbortSignal,
) => Promise<AsyncSelectFetcherResult>;

export interface UseAsyncSelectOptionsArgs {
  /** Caller-supplied search function. Must respect the AbortSignal. */
  fetcher: AsyncSelectFetcher;
  /** Optional initial options shown before the first fetch resolves. */
  initialOptions?: SelectOption[];
  /** Optional initial total. */
  initialTotal?: number;
}

export interface UseAsyncSelectOptionsReturn {
  options: SelectOption[];
  totalCount: number | undefined;
  loading: boolean;
  /** Wire this directly to <Select onSearch={...} />. */
  onSearch: (query: string) => void;
  /** Force a refetch of the current query (e.g. after a create). */
  refresh: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useAsyncSelectOptions — wraps a paginated search endpoint for use with
 * `<Select asyncSearch />`. Handles in-flight cancellation (race protection)
 * and exposes a simple `onSearch(query)` callback for the Select.
 *
 * The Select component already debounces keystrokes; the hook only needs to
 * dispatch the fetch and discard stale responses.
 *
 * ```tsx
 * const { options, totalCount, loading, onSearch } = useAsyncSelectOptions({
 *   fetcher: async (q, signal) => {
 *     const res = await getProducts({ q, limit: 25 }, { signal });
 *     return {
 *       options: res.data.map((p) => ({ value: p.id, label: p.name })),
 *       totalCount: res.total,
 *     };
 *   },
 * });
 *
 * <Select
 *   asyncSearch
 *   searchable
 *   options={options}
 *   totalCount={totalCount}
 *   loading={loading}
 *   onSearch={onSearch}
 *   value={productId}
 *   onChange={(v) => setProductId(v as string)}
 *   selectedOption={selectedProductSnapshot}
 * />
 * ```
 */
export function useAsyncSelectOptions({
  fetcher,
  initialOptions,
  initialTotal,
}: UseAsyncSelectOptionsArgs): UseAsyncSelectOptionsReturn {
  const [options, setOptions] = useState<SelectOption[]>(initialOptions ?? []);
  const [totalCount, setTotalCount] = useState<number | undefined>(initialTotal);
  const [loading, setLoading] = useState(false);

  // Track the latest in-flight request so we can ignore stale responses even
  // if a caller's fetcher ignores the AbortSignal.
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>("");

  // Latest fetcher via ref so onSearch keeps a stable identity.
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

  // Cancel any pending request on unmount.
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const dispatch = useCallback(async (query: string) => {
    lastQueryRef.current = query;
    requestIdRef.current += 1;
    const myId = requestIdRef.current;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const result = await fetcherRef.current(query, controller.signal);
      if (myId !== requestIdRef.current) return; // stale
      setOptions(result.options);
      setTotalCount(result.totalCount);
    } catch (err) {
      if (myId !== requestIdRef.current) return;
      if ((err as { name?: string } | null)?.name === "AbortError") return;
      // Keep previous options on error — surfacing as empty is more disruptive.
    } finally {
      if (myId === requestIdRef.current) setLoading(false);
    }
  }, []);

  const onSearch = useCallback((query: string) => {
    void dispatch(query);
  }, [dispatch]);

  const refresh = useCallback(() => {
    void dispatch(lastQueryRef.current);
  }, [dispatch]);

  return useMemo(
    () => ({ options, totalCount, loading, onSearch, refresh }),
    [options, totalCount, loading, onSearch, refresh],
  );
}
