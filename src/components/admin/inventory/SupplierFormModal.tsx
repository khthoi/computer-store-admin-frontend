"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import type { Supplier } from "@/src/types/inventory.types";

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: Omit<Supplier, "id" | "productCount" | "totalOrders" | "createdAt" | "updatedAt">) => Promise<void>;
  initialData?: Supplier;
  isConfirming: boolean;
}

const STATUS_OPTIONS = [
  { value: "active",   label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function SupplierFormModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  isConfirming,
}: SupplierFormModalProps) {
  const [name, setName]               = useState(initialData?.name ?? "");
  const [contactName, setContactName] = useState(initialData?.contactName ?? "");
  const [email, setEmail]             = useState(initialData?.email ?? "");
  const [phone, setPhone]             = useState(initialData?.phone ?? "");
  const [address, setAddress]         = useState(initialData?.address ?? "");
  const [status, setStatus]           = useState<"active" | "inactive">(initialData?.status ?? "active");
  const [notes, setNotes]             = useState(initialData?.notes ?? "");

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? "");
      setContactName(initialData?.contactName ?? "");
      setEmail(initialData?.email ?? "");
      setPhone(initialData?.phone ?? "");
      setAddress(initialData?.address ?? "");
      setStatus(initialData?.status ?? "active");
      setNotes(initialData?.notes ?? "");
    }
  }, [isOpen, initialData]);

  const isValid = name.trim() && contactName.trim() && email.trim() && phone.trim();

  async function handleSubmit() {
    if (!isValid) return;
    await onConfirm({
      name: name.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      status,
      notes: notes.trim() || undefined,
    });
  }

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={initialData ? "Edit Supplier" : "Add Supplier"}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <h2 className="text-base font-semibold text-secondary-900">
            {initialData ? "Edit Supplier" : "Add Supplier"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Company Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Intel Vietnam Distribution"
              />
            </div>
            <Input
              label="Contact Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Nguyen Van A"
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 028 3456 7890"
            />
            <div className="sm:col-span-2">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. supply@supplier.com"
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, District, City"
              />
            </div>
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(v) => setStatus(v as "active" | "inactive")}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700">Notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, delivery notes…"
              className="w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-secondary-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-xl border border-secondary-200 px-5 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || isConfirming}
            isLoading={isConfirming}
          >
            {initialData ? "Save Changes" : "Add Supplier"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
