"use client";

import { useEffect, useState } from "react";
import { ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface TicketSLATimerProps {
  deadline: string;       // ISO string
  isClosed?: boolean;
}

function calcRemaining(deadline: string): number {
  return Math.floor((new Date(deadline).getTime() - Date.now()) / 1000);
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "Quá hạn";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}g ${m}p`;
  return `${m}p`;
}

/**
 * TicketSLATimer — live countdown for SLA deadline.
 * Shows green → amber (≤2h) → red (breached).
 */
export function TicketSLATimer({ deadline, isClosed = false }: TicketSLATimerProps) {
  const [remaining, setRemaining] = useState(() => calcRemaining(deadline));

  useEffect(() => {
    if (isClosed) return;
    const id = setInterval(() => setRemaining(calcRemaining(deadline)), 30_000);
    return () => clearInterval(id);
  }, [deadline, isClosed]);

  const isBreached  = remaining <= 0;
  const isWarning   = remaining > 0 && remaining <= 7200; // ≤ 2 hours

  if (isClosed) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-secondary-400">
        <ClockIcon className="w-3.5 h-3.5" aria-hidden="true" />
        Đã đóng
      </span>
    );
  }

  const colorClass = isBreached
    ? "text-red-600"
    : isWarning
    ? "text-amber-600"
    : "text-green-600";

  const Icon = isBreached ? ExclamationTriangleIcon : ClockIcon;

  return (
    <span className={["inline-flex items-center gap-1 text-xs font-medium", colorClass].join(" ")}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {isBreached ? "Quá hạn" : formatDuration(remaining)}
    </span>
  );
}
