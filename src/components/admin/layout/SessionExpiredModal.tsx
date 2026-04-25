"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClockIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";

const COUNTDOWN_SECONDS = 5;

export function SessionExpiredModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  // Listen for the session-expired event dispatched by apiFetch
  useEffect(() => {
    function handleExpired() {
      setCountdown(COUNTDOWN_SECONDS);
      setOpen(true);
    }
    window.addEventListener("session-expired", handleExpired);
    return () => window.removeEventListener("session-expired", handleExpired);
  }, []);

  // Countdown + redirect once modal is open
  useEffect(() => {
    if (!open) return;

    if (countdown <= 0) {
      router.push("/login");
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, countdown, router]);

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

        {/* Countdown ring */}
        <div className="flex size-16 items-center justify-center rounded-full border-4 border-warning-400 bg-warning-50">
          <span className="text-2xl font-bold text-warning-600">{countdown}</span>
        </div>

        <p className="text-xs text-secondary-400">
          Phiên làm việc hết hiệu lực vì lý do bảo mật.
          <br />
          Vui lòng đăng nhập lại để tiếp tục.
        </p>
      </div>
    </Modal>
  );
}
