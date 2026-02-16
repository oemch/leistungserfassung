"use client";

import { useState, useEffect, useRef } from "react";
import type { EntryPayload } from "@/lib/types";
import { PROJECT_OPTIONS, TICKET_OPTIONS } from "@/lib/constants";
import { durationFromTimes, parseDurationHours, endTimeFromStartAndHours } from "@/lib/timeUtils";

interface StopModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Abbrechen: Dialog schließen, ggf. Timer zurücksetzen. */
  onCancel: () => void;
  /** Löschen: Eintrag endgültig löschen (nur bei Bearbeitung, id wird übergeben). */
  onDelete?: (entryId: string) => void;
  /** Wird mit vollem Payload aufgerufen (neu oder Bearbeitung). */
  onConfirm: (payload: EntryPayload) => void;
  /** Öffnung via FAB: alle Felder leer (kein Timer-Kontext). */
  openFromFab?: boolean;
  /** Beim Bearbeiten: Vorbelegung aus gespeichertem Eintrag. */
  initialData?: EntryPayload | null;
  /** Vorbelegung aus der Timer-Bar (bei Öffnung via Stopp oder Details). */
  barPrefill?: { project: string | null; ticket: string | null; comment: string } | null;
  startTimeFormatted: string | null;
  elapsed: string;
}

/** Berechnet Endzeit (Start + Dauer) und Dauer in Std. für Anzeige. */
function useDerivedTimes(
  startTimeFormatted: string | null,
  elapsed: string
): { endTime: string; durationHours: string } {
  if (!startTimeFormatted || !elapsed) return { endTime: "--:--", durationHours: "0" };
  const [h, m, s] = elapsed.split(":").map(Number);
  const totalMinutes = (h ?? 0) * 60 + (m ?? 0) + (s ?? 0) / 60;
  const [sh, sm] = startTimeFormatted.split(":").map(Number);
  let endM = (sm ?? 0) + totalMinutes;
  let endH = (sh ?? 0) + Math.floor(endM / 60);
  endM = endM % 60;
  const endTime = `${String(endH).padStart(2, "0")}:${String(Math.round(endM)).padStart(2, "0")}`;
  const durationHours = (totalMinutes / 60).toFixed(2).replace(".", ",");
  return { endTime, durationHours };
}

export function StopModal({
  isOpen,
  onClose,
  onCancel,
  onDelete,
  onConfirm,
  openFromFab = false,
  initialData = null,
  barPrefill = null,
  startTimeFormatted,
  elapsed,
}: StopModalProps) {
  const [comment, setComment] = useState("Meeting mit Sebastian Weber");
  const [isBillable, setIsBillable] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [ticketDropdownOpen, setTicketDropdownOpen] = useState(false);
  const ticketDropdownRef = useRef<HTMLDivElement>(null);
  const { endTime } = useDerivedTimes(startTimeFormatted, elapsed);
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

  useEffect(() => {
    if (!projectDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setProjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [projectDropdownOpen]);

  useEffect(() => {
    if (!ticketDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ticketDropdownRef.current && !ticketDropdownRef.current.contains(e.target as Node)) {
        setTicketDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ticketDropdownOpen]);

  const durationDisplay = durationFromTimes(startInput, endInput);
  const canSave = !!(selectedProject || selectedTicket);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setComment(initialData.comment ?? "");
        setStartInput(initialData.startTime ?? "");
        setEndInput(initialData.endTime ?? "");
        setIsBillable(initialData.isBillable !== false);
        const label = initialData.label ?? "";
        setSelectedProject(PROJECT_OPTIONS.some((o) => o === label) ? label : null);
        setSelectedTicket(TICKET_OPTIONS.some((o) => o === label) ? label : null);
      } else if (openFromFab) {
        setComment("");
        setStartInput("");
        setEndInput("");
        setIsBillable(true);
      } else {
        setStartInput(startTimeFormatted ?? "");
        setEndInput(endTime);
        if (barPrefill) {
          setComment(barPrefill.comment ?? "");
          setSelectedProject(barPrefill.project ?? null);
          setSelectedTicket(barPrefill.ticket ?? null);
        }
      }
    }
  }, [isOpen, openFromFab, initialData, barPrefill, startTimeFormatted, endTime]);

  useEffect(() => {
    if (!isOpen) {
      setComment("Meeting mit Sebastian Weber");
      setIsBillable(true);
      setSelectedProject(null);
      setProjectDropdownOpen(false);
      setSelectedTicket(null);
      setTicketDropdownOpen(false);
      setStartInput("");
      setEndInput("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stop-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        style={{ backgroundColor: "var(--figma-neutral-32)", opacity: 0.5 }}
        onClick={onCancel}
        aria-label="Dialog schließen"
      />
      {/* Dialog: Figma Erfassungsdialog 514x786 */}
      <div
        className="relative z-10 flex w-full max-w-[514px] flex-col overflow-hidden rounded-xl bg-[var(--figma-bw-white)] shadow-lg"
        style={{ maxHeight: "90vh", border: "1px solid var(--figma-neutral-85)" }}
      >
        {/* Header: Datum fix 23.02.2026 */}
        <div
          className="flex shrink-0 items-center px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid var(--figma-neutral-85)" }}
        >
          <p
            id="stop-modal-title"
            className="font-bold"
            style={{ color: "var(--figma-bw-black)", fontSize: 16 }}
          >
            Montag, 23.02.2026
          </p>
        </div>

        {/* Content scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            {/* Uhrzeit: Start, Endzeit, Dauer (Std.) – Layout wie Referenz: [Start] – [Ende] Uhr  [Dauer] Std. */}
            <div
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
              style={{ fontFamily: "var(--font-coop), Coop, sans-serif" }}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="time"
                    value={startInput}
                    onChange={(e) => setStartInput(e.target.value)}
                    className="tabular-nums rounded-lg border pl-2 pr-9 py-1.5 outline-none focus:ring-2 focus:ring-[var(--figma-primary)] focus:ring-offset-0 bg-[var(--figma-bw-white)] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    style={{
                      borderColor: "var(--figma-neutral-85)",
                      color: "var(--figma-bw-black)",
                      fontSize: 18,
fontWeight: 400,
                  }}
                    aria-label="Startzeit"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--figma-bw-black)]" aria-hidden>
                    <ClockIcon />
                  </span>
                </div>
                <span style={{ color: "var(--figma-bw-black)", fontSize: 18, fontWeight: 400 }}>–</span>
                <div className="relative">
                  <input
                    type="time"
                    value={endInput}
                    onChange={(e) => setEndInput(e.target.value)}
                    className="tabular-nums rounded-lg border pl-2 pr-9 py-1.5 outline-none focus:ring-2 focus:ring-[var(--figma-primary)] focus:ring-offset-0 bg-[var(--figma-bw-white)] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    style={{
                      borderColor: "var(--figma-neutral-85)",
                      color: "var(--figma-bw-black)",
                      fontSize: 18,
fontWeight: 400,
                  }}
                    aria-label="Endzeit"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--figma-bw-black)]" aria-hidden>
                    <ClockIcon />
                  </span>
                </div>
                <span style={{ color: "var(--figma-bw-black)", fontSize: 18 }}>Uhr</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="text"
                  inputMode="decimal"
                  value={durationDisplay}
                  onChange={(e) => {
                    const hours = parseDurationHours(e.target.value);
                    if (hours != null) setEndInput(endTimeFromStartAndHours(startInput, hours));
                  }}
                  className="tabular-nums rounded-lg border px-2 py-1.5 w-16 text-right outline-none focus:ring-2 focus:ring-[var(--figma-primary)] focus:ring-offset-0 bg-[var(--figma-bw-white)]"
                  style={{
                    borderColor: "var(--figma-neutral-85)",
                    color: "var(--figma-bw-black)",
                    fontSize: 18,
                    fontWeight: 400,
                  }}
                  aria-label="Dauer in Stunden"
                />
                <span style={{ color: "var(--figma-bw-black)", fontSize: 18, fontWeight: 400 }}>Std.</span>
              </div>
            </div>

            <Separator />

            {/* Projekt (Dropdown) – inaktiv wenn Ticket gewählt */}
            <div className="relative" ref={projectDropdownRef}>
              <button
                type="button"
                disabled={!!selectedTicket}
                onClick={() => !selectedTicket && setProjectDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-[var(--figma-neutral-85)] px-3 py-2 text-left outline-none focus:ring-2 focus:ring-[var(--figma-primary)] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: selectedProject ? "var(--figma-bw-black)" : "var(--figma-neutral-70)", fontSize: 18 }}
                aria-expanded={projectDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Projekt wählen"
                aria-disabled={!!selectedTicket}
              >
                <span>{selectedProject ?? "Projekt wählen"}</span>
                <ChevronDownIcon />
              </button>
              {projectDropdownOpen && (
                <div
                  className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-[var(--figma-neutral-85)] bg-[var(--figma-bw-white)] py-1 shadow-lg"
                  role="listbox"
                >
                  <div className="border-b border-[var(--figma-neutral-85)] px-3 py-2">
                    <input
                      type="text"
                      placeholder="Suchen..."
                      readOnly
                      className="w-full bg-transparent outline-none placeholder:italic"
                      style={{ color: "var(--figma-neutral-70)", fontSize: 14 }}
                      aria-label="Suche (angedeutet)"
                    />
                  </div>
                  <ul className="max-h-48 overflow-y-auto py-1">
                    <li>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedProject === null}
                        onClick={() => {
                          setSelectedProject(null);
                          setProjectDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[var(--figma-neutral-97)]"
                        style={{ color: "var(--figma-neutral-40)", fontSize: 18 }}
                      >
                        — Nichts auswählen
                      </button>
                    </li>
                    {PROJECT_OPTIONS.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selectedProject === item}
                          onClick={() => {
                            setSelectedProject(item);
                            setProjectDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-[var(--figma-neutral-97)]"
                          style={{
                            color: "var(--figma-bw-black)",
                            fontSize: 18,
                          }}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Separator />

            {/* Ticket (Dropdown) – inaktiv wenn Projekt gewählt */}
            <div className="relative" ref={ticketDropdownRef}>
              <button
                type="button"
                disabled={!!selectedProject}
                onClick={() => !selectedProject && setTicketDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-[var(--figma-neutral-85)] px-3 py-2 text-left outline-none focus:ring-2 focus:ring-[var(--figma-primary)] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: selectedTicket ? "var(--figma-bw-black)" : "var(--figma-neutral-70)", fontSize: 18 }}
                aria-expanded={ticketDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Ticket wählen"
                aria-disabled={!!selectedProject}
              >
                <span>{selectedTicket ?? "Ticket wählen"}</span>
                <ChevronDownIcon />
              </button>
              {ticketDropdownOpen && (
                <div
                  className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-[var(--figma-neutral-85)] bg-[var(--figma-bw-white)] py-1 shadow-lg"
                  role="listbox"
                >
                  <div className="border-b border-[var(--figma-neutral-85)] px-3 py-2">
                    <input
                      type="text"
                      placeholder="Suchen..."
                      readOnly
                      className="w-full bg-transparent outline-none placeholder:italic"
                      style={{ color: "var(--figma-neutral-70)", fontSize: 14 }}
                      aria-label="Suche (angedeutet)"
                    />
                  </div>
                  <ul className="max-h-48 overflow-y-auto py-1">
                    <li>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedTicket === null}
                        onClick={() => {
                          setSelectedTicket(null);
                          setTicketDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[var(--figma-neutral-97)]"
                        style={{ color: "var(--figma-neutral-40)", fontSize: 18 }}
                      >
                        — Nichts auswählen
                      </button>
                    </li>
                    {TICKET_OPTIONS.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selectedTicket === item}
                          onClick={() => {
                            setSelectedTicket(item);
                            setTicketDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-[var(--figma-neutral-97)]"
                          style={{
                            color: "var(--figma-bw-black)",
                            fontSize: 18,
                          }}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Ticket-Shortcuts (Chips) – gleiches Layout wie TaskChip auf der Page */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                disabled={!!selectedProject}
                onClick={() => setSelectedTicket("Ticket 2445")}
                className="flex h-[28px] items-center rounded px-2 text-xs transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--figma-neutral-90)",
                  color: "var(--figma-neutral-32)",
                }}
              >
                Ticket 2445
              </button>
              <button
                type="button"
                disabled={!!selectedProject}
                onClick={() => setSelectedTicket("Ticket 6372")}
                className="flex h-[28px] items-center rounded px-2 text-xs transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--figma-neutral-90)",
                  color: "var(--figma-neutral-32)",
                }}
              >
                Ticket 6372
              </button>
            </div>

            <Separator />

            {/* Kommentar */}
            <div>
              <label htmlFor="stop-modal-kommentar" className="block text-left" style={{ color: "var(--figma-bw-black)", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
                Kommentar
              </label>
              <div className="relative">
                <textarea
                  id="stop-modal-kommentar"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full resize-y rounded-lg border pr-10 pt-2 pb-2 pl-3 outline-none focus:ring-2 focus:ring-[var(--figma-primary)] focus:ring-offset-0"
                  style={{
                    borderColor: "var(--figma-neutral-85)",
                    color: "var(--figma-bw-black)",
                    fontSize: 18,
                    fontFamily: "var(--font-coop), Coop, sans-serif",
                    minHeight: "4.5rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setComment("")}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded text-[var(--figma-neutral-70)] hover:bg-[var(--figma-neutral-97)] hover:text-[var(--figma-bw-black)]"
                  aria-label="Inhalt löschen"
                >
                  <CloseIcon size={16} />
                </button>
              </div>
            </div>

            <Separator />

            <button
              type="button"
              className="flex items-center gap-2 py-2 text-left"
              style={{ color: "var(--figma-neutral-40)", fontSize: 14 }}
            >
              <ChevronDownIcon />
              Weitere Felder einblenden
            </button>

            <Separator />

            <div className="flex items-center justify-end gap-3">
              <span style={{ color: "var(--figma-bw-black)", fontSize: 14 }}>Ist verrechenbar</span>
              <ToggleSwitch checked={isBillable} onChange={setIsBillable} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex shrink-0 items-center justify-between px-6 py-4"
          style={{ borderTop: "1px solid var(--figma-neutral-85)" }}
        >
          <button
            type="button"
            onClick={() => {
              if (initialData?.id && onDelete) {
                onDelete(initialData.id);
              } else {
                onCancel();
              }
            }}
            className="rounded px-2 py-1.5 font-bold hover:bg-[var(--figma-red-2)]"
            style={{ color: "var(--figma-neutral-40)", fontSize: 14 }}
          >
            Löschen
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 font-bold hover:opacity-90"
              style={{ color: "var(--figma-neutral-40)", fontSize: 14 }}
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => {
                const label = selectedProject ?? selectedTicket ?? "";
                onConfirm({
                  id: initialData?.id,
                  label,
                  startTime: startInput,
                  endTime: endInput,
                  comment,
                  isBillable: isBillable,
                });
                onClose();
              }}
              className="rounded-lg px-4 py-2 font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:hover:opacity-100"
              style={{
                fontSize: 14,
                backgroundColor: canSave ? "var(--figma-primary)" : "#B5B1AD",
                color: "#FFFFFF",
              }}
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="my-3 border-t border-[var(--figma-neutral-85)]" />;
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CloseIcon({ small, size }: { small?: boolean; size?: number }) {
  const s = size ?? (small ? 10 : 16);
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="h-6 w-11 rounded-full px-1 transition-colors"
      style={{ backgroundColor: checked ? "var(--figma-primary)" : "var(--figma-neutral-80)" }}
    >
      <span
        className="block h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}
