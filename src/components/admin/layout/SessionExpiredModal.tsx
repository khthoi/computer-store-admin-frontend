"use client";

import { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";

const COUNTDOWN_MS = 3000;
const TICK_MS = 10;

function formatMs(ms: number): string {
  const clamped = Math.max(0, ms);
  return (clamped / 1000).toFixed(2);
}

export function SessionExpiredModal() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(COUNTDOWN_MS);

  useEffect(() => {
    function handleExpired() {
      setOpen((alreadyOpen) => {
        if (!alreadyOpen) setRemaining(COUNTDOWN_MS);
        return true;
      });
    }
    window.addEventListener("session-expired", handleExpired);
    return () => window.removeEventListener("session-expired", handleExpired);
  }, []);

  useEffect(() => {
    if (!open) return;

    if (remaining <= 0) {
      window.location.replace("/login");
      return;
    }

    const timer = setTimeout(
      () => setRemaining((r) => r - TICK_MS),
      TICK_MS,
    );
    return () => clearTimeout(timer);
  }, [open, remaining]);

  function handleLoginNow() {
    window.location.replace("/login");
  }

  return (
    <Modal
      isOpen={open}
      onClose={() => {}}
      hideCloseButton
      closeOnBackdrop={false}
      closeOnEscape={false}
      size="sm"
      animated
    >
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-warning-50 text-warning-500">
          <ClockIcon className="size-7" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-secondary-900">
            Phiên đăng nhập đã hết hạn
          </h3>
          <p className="mt-1 text-sm text-secondary-500">
            Bạn sẽ được chuyển về trang đăng nhập trong
          </p>
        </div>

        {/* Countdown display */}
        <div className="flex min-w-[5rem] items-center justify-center rounded-full border-4 border-warning-400 bg-warning-50 px-4 py-3">
          <span className="font-mono text-2xl font-bold tabular-nums text-warning-600">
            {formatMs(remaining)}
          </span>
        </div>

        <p className="text-xs text-secondary-400">
          Phiên làm việc hết hiệu lực vì lý do bảo mật.
          <br />
          Vui lòng đăng nhập lại để tiếp tục.
        </p>

        <button
          onClick={handleLoginNow}
          className="mt-1 w-fit rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700 active:bg-accent-800"
        >
          Đăng nhập lại
        </button>
      </div>
    </Modal>
  );
}
