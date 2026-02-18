"use client";

import { useState, useEffect, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { UserPlus, X, Check, Search } from "lucide-react";
import type { Entry } from "@/lib/types";
import { getSendToMemberOptions } from "@/lib/suggestions";

interface SendToMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: Entry | null;
  dateStr: string | null;
  currentUserSlug: string;
  onSend: (targetUserSlugs: string[]) => void;
}

export function SendToMemberModal({
  isOpen,
  onClose,
  entry,
  dateStr,
  currentUserSlug,
  onSend,
}: SendToMemberModalProps) {
  const options = getSendToMemberOptions(currentUserSlug);

  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedSlugs(new Set());
      setSearch("");
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q)
    );
  }, [options, search]);

  if (!entry || !dateStr) return null;

  const toggleSlug = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleSend = () => {
    if (selectedSlugs.size === 0) return;
    onSend([...selectedSlugs]);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-neutral-32/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <Dialog.Content
            className="pointer-events-auto w-full max-w-md rounded-xl bg-white border border-neutral-85 shadow-lg p-6 text-ink overflow-visible"
            aria-describedby={undefined}
            onEscapeKeyDown={onClose}
          >
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="font-semibold text-ink flex items-center gap-2">
                <UserPlus size={20} aria-hidden />
                An Teammitglied senden
              </Dialog.Title>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-ink hover:bg-neutral-97 transition-colors"
                aria-label="Schliessen"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-ink mb-4">
              &quot;{entry.text}&quot; als Vorschlag an Teammitglieder senden.
            </p>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-50 pointer-events-none"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Teammitglied suchen …"
                  aria-label="Teammitglied suchen"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-85 text-ink text-sm outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
                />
              </div>
              <div
                className="max-h-48 overflow-y-auto rounded-lg border border-neutral-85 py-1"
                role="listbox"
                aria-label="Teammitglieder auswählen"
              >
                {filteredOptions.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-neutral-50">
                    {options.length === 0 ? "Keine Teammitglieder vorhanden." : "Keine Treffer für die Suche."}
                  </p>
                ) : (
                  filteredOptions.map((opt) => (
                    <button
                      key={opt.slug}
                      type="button"
                      role="option"
                      aria-selected={selectedSlugs.has(opt.slug)}
                      onClick={() => toggleSlug(opt.slug)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-97 transition-colors"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          selectedSlugs.has(opt.slug) ? "bg-primary border-primary" : "border-neutral-80"
                        }`}
                      >
                        {selectedSlugs.has(opt.slug) && <Check size={12} className="text-white" strokeWidth={3} />}
                      </span>
                      <span>{opt.name}</span>
                    </button>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={selectedSlugs.size === 0}
                className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                An {selectedSlugs.size} {selectedSlugs.size === 1 ? "Person" : "Personen"} senden
              </button>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
