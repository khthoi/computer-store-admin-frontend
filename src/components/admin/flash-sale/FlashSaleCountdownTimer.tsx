"use client";

import { useEffect, useState, useCallback } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import type { FlashSaleStatus } from "@/src/types/flash-sale.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface TimeLeft {
  days:    number;
  hours:   number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(targetISO: string): TimeLeft | null {
  const diff = new Date(targetISO).getTime() - Date.now();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  return {
    days:    Math.floor(totalSeconds / 86400),
    hours:   Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FlashSaleCountdownTimerProps {
  batDau:    string;
  ketThuc:   string;
  trangThai: FlashSaleStatus;
  /** Called once when the countdown reaches zero (e.g. to refresh parent data). */
  onExpire?: () => void;
}

export function FlashSaleCountdownTimer({
  batDau,
  ketThuc,
  trangThai,
  onExpire,
}: FlashSaleCountdownTimerProps) {
  const isLive     = trangThai === "dang_dien_ra";
  const isUpcoming = trangThai === "sap_dien_ra";

  const targetISO  = isLive ? ketThuc : batDau;
  const label      = isLive ? "Còn lại" : "Bắt đầu sau";

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calcTimeLeft(targetISO)
  );
  const [expired, setExpired] = useState(false);

  const handleExpire = useCallback(() => {
    setTimeLeft(null);
    setExpired(true);
    onExpire?.();
  }, [onExpire]);

  useEffect(() => {
    if (!isLive && !isUpcoming) return;

    const tick = () => {
      const left = calcTimeLeft(targetISO);
      if (left === null) {
        handleExpire();
      } else {
        setTimeLeft(left);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO, isLive, isUpcoming, handleExpire]);

  if (!isLive && !isUpcoming) return null;

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary-100 px-3 py-1.5 text-sm text-secondary-500">
        <ClockIcon className="w-4 h-4" aria-hidden="true" />
        Đang cập nhật…
      </span>
    );
  }

  if (!timeLeft) return null;

  const accentClass = isLive
    ? "bg-success-50 border border-success-200 text-success-800"
    : "bg-warning-50 border border-warning-200 text-warning-800";

  const digitClass = isLive
    ? "bg-success-100 text-success-800"
    : "bg-warning-100 text-warning-800";

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 ${accentClass}`}>
      <ClockIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="text-xs font-medium">{label}:</span>
      <div className="flex items-center gap-0.5 font-mono text-sm font-bold">
        {timeLeft.days > 0 && (
          <>
            <span className={`rounded px-1 py-0.5 ${digitClass}`}>{pad(timeLeft.days)}</span>
            <span className="text-secondary-400 text-xs">d</span>
          </>
        )}
        <span className={`rounded px-1 py-0.5 ${digitClass}`}>{pad(timeLeft.hours)}</span>
        <span className="text-secondary-400">:</span>
        <span className={`rounded px-1 py-0.5 ${digitClass}`}>{pad(timeLeft.minutes)}</span>
        <span className="text-secondary-400">:</span>
        <span className={`rounded px-1 py-0.5 ${digitClass}`}>{pad(timeLeft.seconds)}</span>
      </div>
    </div>
  );
}
