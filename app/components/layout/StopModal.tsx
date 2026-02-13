"use client";

import { useState, useEffect, useRef } from "react";

const PROJECT_OPTIONS = [
  "Projekt A",
  "Projekt B",
  "Projekt C",
  "Projekt D",
  "Interne Schulung (IS)",
  "Administration",
] as const;

const TICKET_OPTIONS = [
  "Feature 1234",
  "Feature 8392",
  "Ticket 2445",
  "Ticket 6372",
] as const;

interface StopModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Wird mit dem gewählten Projekt- oder Ticket-Label aufgerufen (Eintrag in Kachel damit anzeigen). */
  onConfirm: (entryLabel: string) => void;
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

/** Berechnet Dauer in Std. aus zwei Zeitstrings "HH:MM". */
function durationFromTimes(start: string, end: string): string {
  if (!start || !end) return "0,00";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startM = (sh ?? 0) * 60 + (sm ?? 0);
  const endM = (eh ?? 0) * 60 + (em ?? 0);
  let diffM = endM - startM;
  if (diffM < 0) diffM = 0;
  const hours = (diffM / 60).toFixed(2).replace(".", ",");
  return hours;
}

export function StopModal({
  isOpen,
  onClose,
  onConfirm,
  startTimeFormatted,
  elapsed,
}: StopModalProps) {
  const [comment, setComment] = useState("Meeting mit Sebastian Weber");
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
      setStartInput(startTimeFormatted ?? "");
      setEndInput(endTime);
    }
  }, [isOpen, startTimeFormatted, endTime]);

  useEffect(() => {
    if (!isOpen) {
      setComment("Meeting mit Sebastian Weber");
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
        onClick={onClose}
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
            {/* Uhrzeit: Start und Ende (Inputs), rechts Dauer (berechnet) */}
            <div
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
              style={{ fontFamily: "var(--font-coop), Coop, sans-serif" }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  className="tabular-nums rounded-lg border px-2 py-1.5 outline-none focus:ring-2 focus:ring-[var(--figma-primary)] focus:ring-offset-0"
                  style={{
                    borderColor: "var(--figma-neutral-85)",
                    color: "var(--figma-bw-black)",
                    fontSize: 18,
                  }}
                  aria-label="Startzeit"
                />
                <span style={{ color: "var(--figma-bw-black)", fontSize: 18 }}>–</span>
                <input
                  type="time"
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  className="tabular-nums rounded-lg border px-2 py-1.5 outline-none focus:ring-2 focus:ring-[var(--figma-primary)] focus:ring-offset-0"
                  style={{
                    borderColor: "var(--figma-neutral-85)",
                    color: "var(--figma-bw-black)",
                    fontSize: 18,
                  }}
                  aria-label="Endzeit"
                />
                <span style={{ color: "var(--figma-bw-black)", fontSize: 18 }}>Uhr</span>
              </div>
              <span className="tabular-nums shrink-0" style={{ color: "var(--figma-bw-black)", fontSize: 18 }}>
                {durationDisplay} Std.
              </span>
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
              <ToggleSwitch />
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
            className="rounded px-2 py-1.5 font-bold hover:bg-[var(--figma-red-2)]"
            style={{ color: "var(--figma-neutral-40)", fontSize: 14 }}
          >
            Löschen
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
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
                onConfirm(label);
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

function ToggleSwitch() {
  return (
    <button
      type="button"
      role="switch"
      aria-checked="true"
      className="h-6 w-11 rounded-full bg-[var(--figma-primary)] px-1 transition-colors"
    >
      <span className="block h-4 w-4 rounded-full bg-white shadow" style={{ transform: "translateX(18px)" }} />
    </button>
  );
}
