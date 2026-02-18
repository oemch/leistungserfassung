"use client";

import { Check, X } from "lucide-react";
import { Combobox } from "@/app/components/ui/Combobox";
import { LEISTUNG_OPTIONS, TICKET_OPTIONS } from "@/lib/constants";
import { suggestLeistung } from "@/lib/apiClient";
import { useFavoritenModal, MAX_FAVORITES, PRESET_COLORS } from "@/hooks/useFavoritenModal";

interface FavoritenModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: import("@/lib/types").FavoriteItem[];
  onSave: (favorites: import("@/lib/types").FavoriteItem[]) => void;
  userSlug: string;
  leistungen?: string[];
  ticketOptions?: string[];
}

export function FavoritenModal({
  isOpen,
  onClose,
  favorites,
  onSave,
  userSlug,
  leistungen: leistungenProp,
  ticketOptions: ticketOptionsProp,
}: FavoritenModalProps) {
  const data = useFavoritenModal({ isOpen, favorites, userSlug });

  const {
    edited,
    newLabel,
    setNewLabel,
    newBg,
    setNewBg,
    editingId,
    editLabel,
    setEditLabel,
    editBg,
    setEditBg,
    handleAdd,
    handleUpdate,
    handleDelete,
    startEdit,
    cancelEdit,
  } = data;

  const leistungen: string[] = (leistungenProp?.length ?? 0) > 0 ? [...(leistungenProp ?? [])] : [...LEISTUNG_OPTIONS];
  const ticketOptions: string[] = (ticketOptionsProp?.length ?? 0) > 0 ? [...(ticketOptionsProp ?? [])] : [...TICKET_OPTIONS];
  const allOptions = [...leistungen, ...ticketOptions];

  const handleClose = () => {
    onSave(edited);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-start px-4 pt-6 pb-4 bg-black/40 overflow-y-auto"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Favoriten bearbeiten"
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-2xl w-full min-w-[480px] min-h-[420px] max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-neutral-90">
          <h2 className="text-lg font-semibold text-ink">Favoriten bearbeiten</h2>
        </div>
        <div className="px-6 py-4 overflow-auto flex-1 min-h-0">
          <div className="space-y-4">
            {edited.map((f) => (
              <div
                key={f.id ?? f.label}
                className="flex items-center gap-3 p-3 rounded-lg border border-neutral-90"
              >
                <div className="w-8 h-8 rounded shrink-0" style={{ backgroundColor: f.bg }} />
                {editingId === f.id ? (
                  <>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="flex-1 px-2 py-1 border border-neutral-85 rounded text-sm"
                      placeholder="Label"
                    />
                    <div className="flex gap-1">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`w-6 h-6 rounded border-2 ${editBg === c ? "border-primary" : "border-transparent"}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setEditBg(c)}
                          aria-label={`Farbe ${c}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="shrink-0 w-9 h-9 flex items-center justify-center rounded bg-primary text-white"
                      onClick={() => f.id && handleUpdate(f.id)}
                      aria-label="Speichern"
                    >
                      <Check size={18} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="shrink-0 w-9 h-9 flex items-center justify-center rounded border border-neutral-85"
                      onClick={cancelEdit}
                      aria-label="Abbrechen"
                    >
                      <X size={18} aria-hidden />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-ink">{f.label}</span>
                    <button
                      type="button"
                      className="text-sm px-2 py-1 rounded hover:bg-neutral-97 text-neutral-50"
                      onClick={() => startEdit(f)}
                    >
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      className="text-sm px-2 py-1 rounded hover:bg-red-50"
                      style={{ color: "#b91c1c" }}
                      onClick={() => f.id && handleDelete(f.id)}
                    >
                      Löschen
                    </button>
                  </>
                )}
              </div>
            ))}

            {edited.length < MAX_FAVORITES ? (
              <div className="pt-4 border-t border-neutral-90">
                <p className="text-sm font-medium mb-2 text-neutral-50">
                  Neuer Favorit ({edited.length} von {MAX_FAVORITES})
                </p>
                <div className="flex flex-col gap-3">
                  <div className="w-full min-w-0">
                    <Combobox
                      value={newLabel || null}
                      onChange={(v) => setNewLabel(v ?? "")}
                      options={allOptions}
                      placeholder="Label (z.B. Migros Bank | Banking Platform | PROJ-2847)"
                      allowEmpty
                      ariaLabel="Neuer Favorit"
                      compact
                      dropdownInPortal
                      onAiSuggestRequest={(query) => suggestLeistung({ query, options: [...allOptions] })}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex gap-1">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`w-6 h-6 rounded border-2 ${newBg === c ? "border-primary" : "border-transparent"}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setNewBg(c)}
                          aria-label={`Farbe ${c}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="shrink-0 px-4 py-2 text-sm rounded bg-primary text-white"
                      onClick={handleAdd}
                    >
                      Hinzufügen
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-neutral-90 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded bg-neutral-90 text-ink"
            onClick={handleClose}
          >
            Schliessen
          </button>
        </div>
      </div>
    </div>
  );
}
