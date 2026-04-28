"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// ─── Public types ──────────────────────────────────────────────────────────────

export type DateInputSize = "sm" | "md" | "lg";

export interface DateInputProps {
  /**
   * Controlled value.
   * - Without `showTime`: ISO date string `"YYYY-MM-DD"`
   * - With `showTime`:    ISO datetime   `"YYYY-MM-DDTHH:mm"` (or `"YYYY-MM-DDTHH:mm:ss"` with `showSeconds`)
   */
  value?: string;
  /** Called with the value string on selection / time change */
  onChange?: (value: string) => void;
  /** Visible label rendered above the trigger */
  label?: string;
  /** Hint shown below; hidden when errorMessage is set */
  helperText?: string;
  /** Validation error — red border + message */
  errorMessage?: string;
  /** Placeholder shown when no date is selected */
  placeholder?: string;
  /**
   * Show an HH:mm time picker below the calendar.
   * Value format changes to `"YYYY-MM-DDTHH:mm"`.
   * Panel closes only when the user clicks **Xong**.
   */
  showTime?: boolean;
  /**
   * Also show a seconds spinner (only meaningful when `showTime` is true).
   * Value format becomes `"YYYY-MM-DDTHH:mm:ss"`.
   */
  showSeconds?: boolean;
  /** @default "md" */
  size?: DateInputSize;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

// ─── Internal types ────────────────────────────────────────────────────────────

type CalendarView = "day" | "month" | "year";

// ─── Style maps (trigger) ─────────────────────────────────────────────────────

const TRIGGER_SIZE: Record<DateInputSize, string> = {
  sm: "h-8  px-3 text-sm",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
};

const TRIGGER_BASE =
  "w-full flex items-center justify-between gap-2 rounded border bg-white " +
  "text-left cursor-pointer transition-colors duration-150 " +
  "focus:outline-none focus:ring-2 " +
  "disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-400";

const TRIGGER_NORMAL =
  "border-secondary-300 hover:border-secondary-400 " +
  "focus:border-primary-500 focus:ring-primary-500/15";
const TRIGGER_ERROR  = "border-error-400 focus:border-error-500 focus:ring-error-500/15";
const TRIGGER_OPEN   = "border-primary-500 ring-2 ring-primary-500/15";

// ─── Locale constants ─────────────────────────────────────────────────────────

const DAYS_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const MONTHS_FULL_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const MONTHS_SHORT_VI = [
  "Th. 1", "Th. 2", "Th. 3", "Th. 4",
  "Th. 5", "Th. 6", "Th. 7", "Th. 8",
  "Th. 9", "Th. 10", "Th. 11", "Th. 12",
];

const YEARS_PER_PAGE = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Parse "YYYY-MM-DD" → { year, month (0-based), day } | null */
function parseISO(iso: string): { year: number; month: number; day: number } | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m - 1, day: d };
}

/** Produce "YYYY-MM-DD" */
function toISO(year: number, month: number, day: number): string {
  return [String(year), pad2(month + 1), pad2(day)].join("-");
}

/** Extract date + time parts from the value string */
function parseValueParts(val: string, hasTime: boolean): { datePart: string; h: number; m: number; s: number } {
  if (!val) return { datePart: "", h: 0, m: 0, s: 0 };
  if (hasTime && val.includes("T")) {
    const [datePart, timePart = ""] = val.split("T");
    const [hh, mm, ss] = timePart.split(":").map(Number);
    return { datePart, h: hh || 0, m: mm || 0, s: ss || 0 };
  }
  return { datePart: val, h: 0, m: 0, s: 0 };
}

/** Trigger display label */
function formatDisplay(iso: string, showTime?: boolean, showSeconds?: boolean): string {
  if (!iso) return "";
  const { datePart, h, m, s } = parseValueParts(iso, !!showTime);
  const p = parseISO(datePart || iso);
  if (!p) return "";
  const date = `${pad2(p.day)}/${pad2(p.month + 1)}/${p.year}`;
  if (!showTime) return date;
  const time = showSeconds
    ? `${pad2(h)}:${pad2(m)}:${pad2(s)}`
    : `${pad2(h)}:${pad2(m)}`;
  return `${date} ${time}`;
}

/**
 * Returns an array of cells for a Monday-start week grid.
 * `null` entries are leading/trailing padding cells.
 */
function buildDayGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay();
  const offset = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array<null>(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function cellCls(selected: boolean, isToday: boolean, rounded: "full" | "lg"): string {
  const base = `flex items-center justify-center text-sm font-medium transition-colors duration-100
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-${rounded}`;
  if (selected)  return `${base} bg-primary-600 text-white`;
  if (isToday)   return `${base} bg-primary-50 text-primary-700 font-semibold`;
  return         `${base} text-secondary-700 hover:bg-secondary-100`;
}

// ─── Calendar sub-component ───────────────────────────────────────────────────

interface CalendarProps {
  selected: string;                // "YYYY-MM-DD" or ""
  onSelect: (iso: string) => void;
}

function Calendar({ selected, onSelect }: CalendarProps) {
  const today   = new Date();
  const parsed  = parseISO(selected);

  const initYear  = parsed?.year  ?? today.getFullYear();
  const initMonth = parsed?.month ?? today.getMonth();

  const [view,          setView]          = useState<CalendarView>("day");
  const [viewYear,      setViewYear]      = useState(initYear);
  const [viewMonth,     setViewMonth]     = useState(initMonth);
  const [yearPageStart, setYearPageStart] = useState(
    Math.floor(initYear / YEARS_PER_PAGE) * YEARS_PER_PAGE
  );

  const prevDay   = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1); };
  const nextDay   = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1); };
  const prevMonth = () => setViewYear((y) => y - 1);
  const nextMonth = () => setViewYear((y) => y + 1);
  const prevYear  = () => setYearPageStart((s) => s - YEARS_PER_PAGE);
  const nextYear  = () => setYearPageStart((s) => s + YEARS_PER_PAGE);

  const handleHeaderClick = () => {
    if (view === "day")   { setYearPageStart(Math.floor(viewYear / YEARS_PER_PAGE) * YEARS_PER_PAGE); setView("month"); }
    if (view === "month") { setYearPageStart(Math.floor(viewYear / YEARS_PER_PAGE) * YEARS_PER_PAGE); setView("year"); }
  };

  const handleYearSelect  = (year: number)  => { setViewYear(year); setYearPageStart(Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE); setView("month"); };
  const handleMonthSelect = (month: number) => { setViewMonth(month); setView("day"); };
  const handleDaySelect   = (day: number)   => onSelect(toISO(viewYear, viewMonth, day));
  const handleToday       = () => onSelect(toISO(today.getFullYear(), today.getMonth(), today.getDate()));

  const dayCells  = buildDayGrid(viewYear, viewMonth);
  const yearCells = Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearPageStart + i);

  const HEADER: Record<CalendarView, {
    label: string; clickable: boolean;
    prev: () => void; next: () => void;
    prevLabel: string; nextLabel: string;
  }> = {
    day:   { label: `${MONTHS_FULL_VI[viewMonth]} ${viewYear}`, clickable: true,  prev: prevDay,   next: nextDay,   prevLabel: "Tháng trước", nextLabel: "Tháng sau" },
    month: { label: String(viewYear),                           clickable: true,  prev: prevMonth, next: nextMonth, prevLabel: "Năm trước",   nextLabel: "Năm sau"   },
    year:  { label: `${yearPageStart} – ${yearPageStart + YEARS_PER_PAGE - 1}`, clickable: false, prev: prevYear,  next: nextYear,  prevLabel: "Trang trước", nextLabel: "Trang sau" },
  };
  const hdr = HEADER[view];

  return (
    <div className="w-72 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <button type="button" onClick={hdr.prev} aria-label={hdr.prevLabel}
          className="flex h-7 w-7 items-center justify-center rounded-md text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {hdr.clickable ? (
          <button type="button" onClick={handleHeaderClick}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm font-semibold text-secondary-900 hover:bg-secondary-100 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
            title={view === "day" ? "Chọn tháng / năm" : "Chọn năm"}>
            {hdr.label}
            <ChevronDownIcon className="h-3.5 w-3.5 text-secondary-400" aria-hidden />
          </button>
        ) : (
          <span className="px-2 py-1 text-sm font-semibold text-secondary-500">{hdr.label}</span>
        )}

        <button type="button" onClick={hdr.next} aria-label={hdr.nextLabel}
          className="flex h-7 w-7 items-center justify-center rounded-md text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors">
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Day view */}
      {view === "day" && (
        <div className="px-3 pb-1">
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAYS_VI.map((d) => (
              <span key={d} className="pb-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-400">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {dayCells.map((day, idx) => {
              if (day === null) return <span key={`p${idx}`} />;
              const isSel = parsed?.year === viewYear && parsed?.month === viewMonth && parsed?.day === day;
              const isTod = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
              return (
                <button key={day} type="button" onClick={() => handleDaySelect(day)}
                  aria-label={`${day} ${MONTHS_FULL_VI[viewMonth]} ${viewYear}`} aria-pressed={isSel}
                  className={`mx-auto h-8 w-8 ${cellCls(isSel, isTod, "full")}`}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Month view */}
      {view === "month" && (
        <div className="grid grid-cols-3 gap-1.5 px-3 pb-1">
          {MONTHS_SHORT_VI.map((name, idx) => {
            const isSel = parsed?.year === viewYear && parsed?.month === idx;
            const isTod = today.getFullYear() === viewYear && today.getMonth() === idx;
            return (
              <button key={idx} type="button" onClick={() => handleMonthSelect(idx)}
                aria-label={MONTHS_FULL_VI[idx]} aria-pressed={isSel}
                className={`h-10 ${cellCls(isSel, isTod, "lg")}`}>
                {name}
              </button>
            );
          })}
        </div>
      )}

      {/* Year view */}
      {view === "year" && (
        <div className="grid grid-cols-3 gap-1.5 px-3 pb-1">
          {yearCells.map((year) => {
            const isSel = parsed?.year === year;
            const isTod = today.getFullYear() === year;
            return (
              <button key={year} type="button" onClick={() => handleYearSelect(year)}
                aria-pressed={isSel} className={`h-10 tabular-nums ${cellCls(isSel, isTod, "lg")}`}>
                {year}
              </button>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 border-t border-secondary-100 px-3 py-2 text-center">
        <button type="button" onClick={handleToday}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded">
          Hôm nay
        </button>
      </div>
    </div>
  );
}

// ─── TimeUnit spin-button ─────────────────────────────────────────────────────

interface TimeUnitProps {
  value:    number;
  max:      number;
  label:    string;
  disabled?: boolean;
  onChange: (v: number) => void;
}

function TimeUnit({ value, max, label, disabled, onChange }: TimeUnitProps) {
  const inc = () => { if (!disabled) onChange(value >= max ? 0 : value + 1); };
  const dec = () => { if (!disabled) onChange(value <= 0 ? max : value - 1); };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) inc(); else dec();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp")   { e.preventDefault(); inc(); }
    if (e.key === "ArrowDown") { e.preventDefault(); dec(); }
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button type="button" onClick={inc} disabled={disabled} tabIndex={-1}
        className="flex h-6 w-8 items-center justify-center rounded text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 disabled:opacity-30 transition-colors">
        <ChevronUpIcon className="h-3.5 w-3.5" />
      </button>
      <input
        type="number" min={0} max={max}
        value={pad2(value)}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) onChange(Math.max(0, Math.min(max, v)));
        }}
        onKeyDown={handleKey}
        onWheel={handleWheel}
        disabled={disabled}
        className="w-10 rounded-md border border-secondary-200 bg-white py-1 text-center font-mono text-sm font-semibold text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15 disabled:bg-secondary-50 disabled:text-secondary-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" onClick={dec} disabled={disabled} tabIndex={-1}
        className="flex h-6 w-8 items-center justify-center rounded text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 disabled:opacity-30 transition-colors">
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-secondary-400">{label}</span>
    </div>
  );
}

// ─── TimePicker sub-component ─────────────────────────────────────────────────

interface TimePickerProps {
  h:           number;
  m:           number;
  s:           number;
  showSeconds?: boolean;
  disabled?:   boolean;
  onChange:    (h: number, m: number, s: number) => void;
  className?:  string;
}

function TimePicker({ h, m, s, showSeconds, disabled, onChange, className = "" }: TimePickerProps) {
  return (
    <div className={`flex items-center justify-center gap-2 px-3 py-3 ${className}`}>
      <ClockIcon className="h-3.5 w-3.5 shrink-0 text-secondary-400 self-center mb-5" aria-hidden />
      <div className="flex items-end gap-1">
        <TimeUnit value={h} max={23} label="Giờ"  disabled={disabled} onChange={(v) => onChange(v, m, s)} />
        <span className="mb-[1.6rem] font-mono text-lg text-secondary-300 leading-none">:</span>
        <TimeUnit value={m} max={59} label="Phút"  disabled={disabled} onChange={(v) => onChange(h, v, s)} />
        {showSeconds && (
          <>
            <span className="mb-[1.6rem] font-mono text-lg text-secondary-300 leading-none">:</span>
            <TimeUnit value={s} max={59} label="Giây" disabled={disabled} onChange={(v) => onChange(h, m, v)} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── DateInput component ──────────────────────────────────────────────────────

/**
 * DateInput — calendar date picker (optionally with time) using a portal dropdown.
 *
 * ### Date-only mode (default)
 * Value format: `"YYYY-MM-DD"`  |  Display: `"DD/MM/YYYY"`
 *
 * ### Date + time mode (`showTime`)
 * Value format: `"YYYY-MM-DDTHH:mm"` (or `"HH:mm:ss"` with `showSeconds`)
 * Display: `"DD/MM/YYYY HH:mm"`.
 * The panel stays open after day selection so the user can also pick the time.
 * Closes when the user clicks **Xong**.
 *
 * ```tsx
 * // Date only
 * <DateInput label="Ngày sinh" value={dob} onChange={setDob} />
 *
 * // Date + time
 * <DateInput label="Bắt đầu" value={batDau} onChange={setBatDau} showTime />
 *
 * // Date + time + seconds
 * <DateInput label="Bắt đầu" value={batDau} onChange={setBatDau} showTime showSeconds />
 * ```
 */
export function DateInput({
  value = "",
  onChange,
  label,
  helperText,
  errorMessage,
  placeholder,
  showTime     = false,
  showSeconds  = false,
  size         = "md",
  disabled     = false,
  required,
  id: idProp,
  className = "",
}: DateInputProps) {
  const generatedId = useId();
  const id       = idProp ?? generatedId;
  const labelId  = `${id}-label`;
  const errorId  = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(errorMessage);

  const defaultPlaceholder = showTime
    ? (showSeconds ? "DD/MM/YYYY HH:mm:ss" : "DD/MM/YYYY HH:mm")
    : "DD/MM/YYYY";
  const resolvedPlaceholder = placeholder ?? defaultPlaceholder;

  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number; left: number; width: number; flipUp: boolean;
  } | null>(null);

  // ── Time panel state (ephemeral — initialized when panel opens) ────────────
  const [panelH, setPanelH] = useState(0);
  const [panelM, setPanelM] = useState(0);
  const [panelS, setPanelS] = useState(0);

  // Sync panel time state from value when panel opens
  useEffect(() => {
    if (open && showTime) {
      const { h, m, s } = parseValueParts(value, true);
      setPanelH(h); setPanelM(m); setPanelS(s);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // intentionally only on open toggle

  // ── Date part extracted from value ────────────────────────────────────────
  const currentDatePart = useMemo(() => {
    if (!value) return "";
    if (showTime && value.includes("T")) return value.split("T")[0];
    return showTime ? "" : value;
  }, [value, showTime]);

  // ── Build combined datetime string ────────────────────────────────────────
  const buildDateTime = useCallback((datePart: string, h: number, m: number, s: number): string => {
    if (!showTime) return datePart;
    const time = showSeconds
      ? `${pad2(h)}:${pad2(m)}:${pad2(s)}`
      : `${pad2(h)}:${pad2(m)}`;
    return `${datePart}T${time}`;
  }, [showTime, showSeconds]);

  const triggerRef   = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef  = useRef<HTMLDivElement>(null);

  // ── Panel height (for flip-up detection) ─────────────────────────────────
  // When showTime, TimePicker sits beside the calendar (horizontal layout) so height = calendar height.
  const PANEL_H = 335;

  // ── Position: portal alignment ────────────────────────────────────────────
  const updatePosition = useCallback(() => {
    const el = containerRef.current ?? triggerRef.current;
    if (!el) return;
    const rect       = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp     = spaceBelow < PANEL_H && rect.top > spaceBelow;
    setDropdownPos({ top: flipUp ? rect.top : rect.bottom + 4, left: rect.left, width: rect.width, flipUp });
  }, [PANEL_H]);

  useEffect(() => {
    if (!open) { setDropdownPos(null); return; }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  // ── Outside click ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!containerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Keyboard on trigger ───────────────────────────────────────────────────
  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (["Enter", " ", "ArrowDown"].includes(e.key)) { e.preventDefault(); setOpen(true); }
    if (e.key === "Escape") setOpen(false);
  };

  // ── Calendar day selection ────────────────────────────────────────────────
  const handleSelect = (iso: string) => {
    if (showTime) {
      onChange?.(buildDateTime(iso, panelH, panelM, panelS));
      // Keep panel open — user picks time and clicks Xong
    } else {
      onChange?.(iso);
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  // ── Time change (spinners) ────────────────────────────────────────────────
  const handleTimeChange = (h: number, m: number, s: number) => {
    setPanelH(h); setPanelM(m); setPanelS(s);
    if (currentDatePart) {
      onChange?.(buildDateTime(currentDatePart, h, m, s));
    }
  };

  // ── Confirm + close (showTime only) ──────────────────────────────────────
  const handleConfirm = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const describedBy =
    [hasError ? errorId : null, !hasError && helperText ? helperId : null]
      .filter(Boolean).join(" ") || undefined;

  return (
    <div className="w-full">
      {label && (
        <span id={labelId} className="mb-1 block text-sm font-medium text-secondary-700">
          {label}
          {required && <span aria-hidden="true" className="ml-0.5 text-error-600">*</span>}
        </span>
      )}

      {/* Trigger + clear button wrapper */}
      <div ref={containerRef} className="relative w-full">
        <button
          ref={triggerRef}
          type="button"
          id={id}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={hasError || undefined}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={handleTriggerKeyDown}
          className={[
            TRIGGER_BASE,
            TRIGGER_SIZE[size],
            hasError ? TRIGGER_ERROR : open ? TRIGGER_OPEN : TRIGGER_NORMAL,
            className,
          ].filter(Boolean).join(" ")}
        >
          <span className={value ? "text-secondary-900" : "text-secondary-400"}>
            {value ? formatDisplay(value, showTime, showSeconds) : resolvedPlaceholder}
          </span>
          {/* Ẩn icon khi đang hiện clear button để tránh chồng lên nhau */}
          {!(value && !disabled && onChange) && (
            showTime ? (
              <ClockIcon className={["h-4 w-4 shrink-0 transition-colors duration-150", open ? "text-primary-600" : "text-secondary-400"].join(" ")} aria-hidden />
            ) : (
              <CalendarDaysIcon className={["h-4 w-4 shrink-0 transition-colors duration-150", open ? "text-primary-600" : "text-secondary-400"].join(" ")} aria-hidden />
            )
          )}
        </button>

        {/* Clear button — shown when a value is selected and the field is editable */}
        {value && !disabled && onChange && (
          <button
            type="button"
            aria-label="Xóa ngày"
            tabIndex={-1}
            onClick={() => { onChange(""); setOpen(false); }}
            className={[
              "absolute top-1/2 -translate-y-1/2 z-10",
              "flex items-center justify-center rounded",
              "text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100",
              "transition-colors focus-visible:outline-none",
              size === "lg" ? "right-3 w-6 h-6" : "right-2 w-5 h-5",
            ].join(" ")}
          >
            <XMarkIcon className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      {/* Validation messages */}
      {hasError && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-error-600">{errorMessage}</p>
      )}
      {!hasError && helperText && (
        <p id={helperId} className="mt-1 text-xs text-secondary-500">{helperText}</p>
      )}

      {/* Portal dropdown */}
      {open && dropdownPos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            role="dialog"
            aria-modal="false"
            aria-label={showTime ? "Chọn ngày và giờ" : "Chọn ngày"}
            data-dateinput-portal="true"
            className="fixed z-[9999] rounded-xl border border-secondary-200 bg-white shadow-xl"
            style={{
              top:    dropdownPos.flipUp ? undefined : `${dropdownPos.top}px`,
              bottom: dropdownPos.flipUp ? `${window.innerHeight - dropdownPos.top + 4}px` : undefined,
              left:   `${dropdownPos.left}px`,
              minWidth: "288px",
            }}
          >
            {showTime ? (
              /* Date + time: calendar on the left, time picker on the right */
              <div className="flex">
                <Calendar selected={currentDatePart} onSelect={handleSelect} />

                <div className="flex flex-col justify-between border-l border-secondary-100">
                  <TimePicker
                    h={panelH} m={panelM} s={panelS}
                    showSeconds={showSeconds}
                    disabled={disabled}
                    onChange={handleTimeChange}
                    className="flex-1"
                  />
                  <div className="border-t border-secondary-100 px-3 py-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
                    >
                      Xong
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Date only */
              <Calendar selected={currentDatePart} onSelect={handleSelect} />
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
