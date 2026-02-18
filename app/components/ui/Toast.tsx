"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { durationFromTimes } from "@/lib/timeUtils";

export interface DeletedEntryContext {
  label: string;
  startTime: string;
  endTime: string;
}

interface DeletedToast {
  id: string;
  context: DeletedEntryContext;
  onUndo: () => void | Promise<void>;
}

interface SuccessToast {
  id: string;
  message: string;
}

interface ToastContextValue {
  showDeletedToast: (context: DeletedEntryContext, onUndo: () => void | Promise<void>) => void;
  showSuccessToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const DISPLAY_DURATION_MS = 10_000;
const SUCCESS_TOAST_DURATION_MS = 3_000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<DeletedToast | null>(null);
  const [successToast, setSuccessToast] = useState<SuccessToast | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showSuccessToast = useCallback((message: string) => {
    setSuccessToast({ id: crypto.randomUUID(), message });
  }, []);

  const showDeletedToast = useCallback((context: DeletedEntryContext, onUndo: () => void | Promise<void>) => {
    setToast({
      id: crypto.randomUUID(),
      context,
      onUndo,
    });
  }, []);

  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  const handleUndo = useCallback(async () => {
    if (!toast) return;
    try {
      await toast.onUndo();
    } finally {
      setToast(null);
    }
  }, [toast]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), DISPLAY_DURATION_MS);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!successToast) return;
    const t = setTimeout(() => setSuccessToast(null), SUCCESS_TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [successToast]);

  const toastContainer = mounted && typeof document !== "undefined" ? document.getElementById("toast-root") : null;
  const toastEl = mounted && toast && toastContainer && createPortal(
    <div
      className="fixed flex flex-col gap-2 rounded-lg border-2 px-4 py-3 pr-10 shadow-lg min-w-[240px] max-w-sm"
      style={{
        top: 16,
        right: 16,
        left: "auto",
        width: "auto",
        backgroundColor: "#fef2f2",
        borderColor: "#b91c1c",
        zIndex: 2147483647,
      }}
      role="status"
      aria-live="polite"
    >
          <button
            type="button"
            onClick={dismiss}
            className="absolute top-2 right-2 shrink-0 p-1 rounded hover:bg-neutral-97 text-neutral-50 hover:text-ink"
            aria-label="Schliessen"
          >
            <X size={16} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-ink text-sm font-semibold">
              Eintrag gelöscht
            </span>
          </div>
          <div className="flex flex-col gap-0.5" style={{ fontSize: 13 }}>
            <span className="text-ink font-medium">{toast.context.label}</span>
            <span className="text-neutral-40">
              {toast.context.startTime}–{toast.context.endTime} · {durationFromTimes(toast.context.startTime, toast.context.endTime)} h
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleUndo}
              className="shrink-0 text-primary text-sm font-medium underline hover:no-underline"
            >
              Rückgängig
            </button>
          </div>
        </div>,
    toastContainer
  );

  const successToastEl = mounted && successToast && toastContainer && createPortal(
    <div
      className="fixed flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg min-w-[200px] max-w-sm"
      style={{
        top: 16,
        right: 16,
        left: "auto",
        backgroundColor: "#f0fdf4",
        borderColor: "#22c55e",
        color: "#166534",
        zIndex: 2147483647,
      }}
      role="status"
      aria-live="polite"
    >
      <span className="text-sm font-medium">{successToast.message}</span>
    </div>,
    toastContainer
  );

  return (
    <ToastContext.Provider value={{ showDeletedToast, showSuccessToast }}>
      {children}
      {toastEl}
      {successToastEl}
    </ToastContext.Provider>
  );
}
