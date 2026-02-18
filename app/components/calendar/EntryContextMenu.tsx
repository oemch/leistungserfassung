"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Pencil, Copy, UserPlus, Trash2 } from "lucide-react";
import type { Entry } from "@/lib/types";

interface EntryContextMenuProps {
  entry: Entry;
  dateStr: string;
  isOpen: boolean;
  onClose: () => void;
  onCancelClose?: () => void;
  anchorEl: HTMLElement | null;
  onEdit: (entry: Entry, dateStr: string) => void;
  onCopy: (entry: Entry, dateStr: string) => void;
  onSendToMember: (entry: Entry, dateStr: string) => void;
  onDelete: (entry: Entry, dateStr: string) => void;
}

export function EntryContextMenu({
  entry,
  dateStr,
  isOpen,
  onClose,
  onCancelClose = () => {},
  anchorEl,
  onEdit,
  onCopy,
  onSendToMember,
  onDelete,
}: EntryContextMenuProps) {
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const rect = anchorEl?.getBoundingClientRect();
  const menuWidth = 240;
  const gap = 4;
  const openToLeft = rect
    ? rect.right + menuWidth + gap > window.innerWidth
    : false;

  const menu = (
    <div
      className="fixed z-50 min-w-[240px] rounded-lg shadow-lg border border-[#E7E6E5] bg-white py-1"
      style={{
        ...(rect
          ? openToLeft
            ? { right: window.innerWidth - rect.left + gap, top: rect.top }
            : { left: rect.right + gap, top: rect.top }
          : { left: 0, top: 0 }),
      }}
      onMouseEnter={onCancelClose}
      onMouseLeave={onClose}
      role="menu"
    >
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
        style={{ color: "#100C08" }}
        onClick={() => {
          onEdit(entry, dateStr);
          onClose();
        }}
        role="menuitem"
      >
        <Pencil size={18} />
        <span>Bearbeiten</span>
        <span className="ml-auto text-xs text-neutral-50">⌘E</span>
      </button>
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
        style={{ color: "#100C08" }}
        onClick={() => {
          onCopy(entry, dateStr);
          onClose();
        }}
        role="menuitem"
      >
        <Copy size={18} />
        <span>Kopieren</span>
        <span className="ml-auto text-xs text-neutral-50">⌘C</span>
      </button>
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
        style={{ color: "#100C08" }}
        onClick={() => {
          onSendToMember(entry, dateStr);
          onClose();
        }}
        role="menuitem"
      >
        <UserPlus size={18} />
        <span>An Teammitglied senden</span>
        <span className="ml-auto text-xs text-neutral-50">⌘M</span>
      </button>
      <div className="my-1 border-t border-[#E7E6E5]" role="separator" />
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-red-50 transition-colors"
        style={{ color: "#b91c1c" }}
        onClick={() => {
          onDelete(entry, dateStr);
          onClose();
        }}
        role="menuitem"
      >
        <Trash2 size={18} />
        <span>Löschen</span>
      </button>
    </div>
  );

  return createPortal(menu, document.body);
}
