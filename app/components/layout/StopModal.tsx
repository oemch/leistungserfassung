"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import { Clock, X, ChevronDown, ChevronUp, Ticket, UserPlus } from "lucide-react";
import type { Entry, EntryPayload } from "@/lib/types";
import { LEISTUNG_OPTIONS, TICKET_OPTIONS } from "@/lib/constants";
import { Combobox } from "@/app/components/ui/Combobox";
import { durationFromTimes, parseDurationHours, endTimeFromStartAndHours } from "@/lib/timeUtils";
import { suggestLeistung } from "@/lib/apiClient";
import { useStopModalForm } from "@/hooks/useStopModalForm";
import { SiJira } from "react-icons/si";
import { extractJiraTicketId, getJiraUrl, isProjectEntry, getMockJiraDetails, isItsmTicketId } from "@/lib/jira";
import { getItsmUrl, getMockItsmDetails } from "@/lib/itsm";
import { useUser } from "@/lib/UserContext";
import { getChipStyleForLabel } from "@/lib/constants";

interface StopModalProps {
  userSlug?: string;
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onDelete?: (entryId: string) => void;
  onDeleteSuggestion?: () => void;
  acceptedSuggestionId?: string | null;
  onConfirm: (
    payload: EntryPayload,
    options?: { savedWhileRunning?: boolean; barPrefillToKeep?: { project: string | null; ticket: string | null; comment: string } }
  ) => void;
  openFromFab?: boolean;
  addEntryPrefill?: { startTime: string; endTime: string; project?: string; ticket?: string } | null;
  initialData?: EntryPayload | null;
  barPrefill?: { project: string | null; ticket: string | null; comment: string } | null;
  fromDetailsWhileRunning?: boolean;
  onBarPrefillChange?: (prefill: { project: string | null; ticket: string | null; comment: string }) => void;
  startTimeFormatted: string | null;
  elapsed: string;
  dateLabel: string;
  dateStr?: string;
  entriesOnDate?: Entry[];
  leistungen?: string[];
  ticketOptions?: string[];
  favorites?: { label: string; bg: string; fg: string }[];
  onOpenSendToMember?: (entry: Entry, dateStr: string) => void;
  /** Mobile: Sheet von unten statt zentriertes Modal */
  variant?: "modal" | "sheet";
}

export function StopModal({
  userSlug: userSlugProp,
  isOpen,
  onClose,
  onCancel,
  onDelete,
  onDeleteSuggestion,
  acceptedSuggestionId,
  onConfirm,
  openFromFab = false,
  addEntryPrefill = null,
  initialData = null,
  barPrefill = null,
  fromDetailsWhileRunning = false,
  onBarPrefillChange,
  startTimeFormatted,
  elapsed,
  dateLabel,
  dateStr: modalDateStr,
  entriesOnDate = [],
  leistungen: leistungenProp = [],
  ticketOptions: ticketOptionsProp,
  favorites: favoritesProp = [],
  onOpenSendToMember,
  variant = "modal",
}: StopModalProps) {
  const leistungen = leistungenProp.length > 0 ? leistungenProp : [...LEISTUNG_OPTIONS];
  const ticketOptionsBase: string[] = (ticketOptionsProp?.length ?? 0) > 0 ? ticketOptionsProp! : [...TICKET_OPTIONS];
  const quickFavorites = favoritesProp.slice(0, 4);
  const { userSlug: userSlugFromContext } = useUser();
  const userSlug = userSlugProp ?? userSlugFromContext;
  const [weitereFelderOpen, setWeitereFelderOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) setWeitereFelderOpen(false);
  }, [isOpen]);

  const form = useStopModalForm({
    isOpen,
    openFromFab,
    addEntryPrefill,
    initialData,
    barPrefill,
    fromDetailsWhileRunning,
    startTimeFormatted,
    elapsed,
    entriesOnDate,
    leistungen,
    ticketOptions: ticketOptionsBase,
    modalDateStr,
    onBarPrefillChange,
  });

  const {
    comment,
    setComment,
    isBillable,
    setIsBillable,
    selectedProject,
    setSelectedProject,
    selectedTicket,
    setSelectedTicket,
    startInput,
    setStartInput,
    endInput,
    setEndInput,
    durationInput,
    setDurationInput,
    durationFocused,
    setDurationFocused,
    durationDisplay,
    canSave,
    suggestedStart,
    endTime,
  } = form;

  const isSheet = variant === "sheet";

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-neutral-32/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <div
          className={`fixed inset-0 z-50 pointer-events-none ${isSheet ? "flex items-end justify-center" : "flex items-center justify-center p-4"}`}
        >
          <Dialog.Content
            className={`pointer-events-auto w-full flex flex-col overflow-hidden bg-white border border-neutral-85 shadow-lg transition-transform duration-300 ease-out ${
              isSheet
                ? "max-h-[90vh] max-w-[100vw] rounded-t-xl border-b-0 pb-[env(safe-area-inset-bottom,0px)] data-[state=closed]:translate-y-full data-[state=open]:translate-y-0"
                : "max-w-[514px] max-h-[90vh] rounded-xl"
            }`}
            aria-describedby={undefined}
            onEscapeKeyDown={onCancel}
            onPointerDownOutside={onCancel}
            onOpenAutoFocus={isSheet ? (e) => e.preventDefault() : undefined}
          >
            <div className="flex shrink-0 items-center px-6 pt-6 pb-4 border-b border-neutral-85">
              <Dialog.Title className="font-bold text-ink text-base">{dateLabel}</Dialog.Title>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-sans">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="time"
                        value={startInput}
                        readOnly={fromDetailsWhileRunning}
                        onChange={(e) => !fromDetailsWhileRunning && setStartInput(e.target.value)}
                        className={`tabular-nums rounded-lg border pl-2 pr-9 py-1.5 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${fromDetailsWhileRunning ? "bg-neutral-97 cursor-default" : "bg-white"}`}
                        style={{
                          borderColor: "var(--color-neutral-85)",
                          color: "var(--color-ink)",
                          fontSize: 18,
                          fontWeight: 400,
                        }}
                        aria-label="Startzeit"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink" aria-hidden>
                        <Clock size={18} />
                      </span>
                    </div>
                    <span className="text-ink text-lg font-normal">–</span>
                    <div className="relative">
                      <input
                        type="time"
                        value={endInput}
                        readOnly={fromDetailsWhileRunning}
                        onChange={(e) => !fromDetailsWhileRunning && setEndInput(e.target.value)}
                        className={`tabular-nums rounded-lg border pl-2 pr-9 py-1.5 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${fromDetailsWhileRunning ? "bg-neutral-97 cursor-default" : "bg-white"}`}
                        style={{
                          borderColor: "var(--color-neutral-85)",
                          color: "var(--color-ink)",
                          fontSize: 18,
                          fontWeight: 400,
                        }}
                        aria-label="Endzeit"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink" aria-hidden>
                        <Clock size={18} />
                      </span>
                    </div>
                    <span className="text-ink text-lg">Uhr</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={durationDisplay}
                      readOnly={fromDetailsWhileRunning}
                      onChange={(e) => {
                        if (fromDetailsWhileRunning) return;
                        const raw = e.target.value;
                        setDurationInput(raw);
                        setDurationFocused(true);
                        const hours = parseDurationHours(raw);
                        if (hours != null && startInput) {
                          setEndInput(endTimeFromStartAndHours(startInput, hours));
                        } else if (hours != null && !startInput) {
                          setStartInput(suggestedStart);
                          setEndInput(endTimeFromStartAndHours(suggestedStart, hours));
                        }
                      }}
                      onFocus={() => {
                        if (fromDetailsWhileRunning) return;
                        setDurationFocused(true);
                        setDurationInput(durationFromTimes(startInput, endInput));
                      }}
                      onBlur={() => {
                        if (fromDetailsWhileRunning) return;
                        setDurationFocused(false);
                        setDurationInput(null);
                        const hours = parseDurationHours(durationInput ?? "");
                        if (hours != null && hours >= 0) {
                          if (startInput) {
                            setEndInput(endTimeFromStartAndHours(startInput, hours));
                          } else {
                            setStartInput(suggestedStart);
                            setEndInput(endTimeFromStartAndHours(suggestedStart, hours));
                          }
                        }
                      }}
                      className={`tabular-nums rounded-lg border px-2 py-1.5 w-20 text-right outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 ${fromDetailsWhileRunning ? "bg-neutral-97 cursor-default" : "bg-white"}`}
                      style={{
                        borderColor: "var(--color-neutral-85)",
                        color: "var(--color-ink)",
                        fontSize: 18,
                        fontWeight: 400,
                      }}
                      aria-label="Dauer in Stunden"
                    />
                    <span className="text-ink text-lg font-normal">h</span>
                  </div>
                </div>

                <Separator />

                <Combobox
                  compact={!isSheet}
                  touchFriendly={isSheet}
                  value={selectedProject}
                  onChange={(value) => {
                    setSelectedProject(value);
                    if (value === "Pikettbereitschaft" || value === "Piketteinsatz") {
                      setStartInput("08:00");
                      setEndInput("16:00");
                    }
                  }}
                  options={[...leistungen]}
                  placeholder="Leistung (Bsp. Projekt, Absenz, Pikett) wählen"
                  disabled={!!selectedTicket}
                  ariaLabel="Leistung wählen"
                  onAiSuggestRequest={async (query) => {
                    if (fromDetailsWhileRunning) return null;
                    return suggestLeistung({ query, options: [...leistungen], dateStr: modalDateStr });
                  }}
                  onAiSuggestionSelect={(result) => {
                    if (result.startTime) setStartInput(result.startTime);
                    if (result.endTime) setEndInput(result.endTime);
                  }}
                />

                <Separator />

                <Combobox
                  compact={!isSheet}
                  touchFriendly={isSheet}
                  value={selectedTicket}
                  onChange={setSelectedTicket}
                  options={
                    selectedTicket && !ticketOptionsBase.includes(selectedTicket)
                      ? [selectedTicket, ...ticketOptionsBase]
                      : ticketOptionsBase
                  }
                  placeholder="Ticket wählen"
                  disabled={!!selectedProject}
                  ariaLabel="Ticket wählen"
                />
                {quickFavorites.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {quickFavorites.map((fav) => (
                      <button
                        key={fav.label}
                        type="button"
                        disabled={!!selectedTicket}
                        onClick={() => {
                          setSelectedProject(fav.label);
                          setSelectedTicket(null);
                        }}
                        className={`flex items-center rounded px-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-50 max-w-[200px] truncate ${isSheet ? "h-11 min-h-[44px] px-3 text-sm" : "h-[28px] text-xs"}`}
                        style={{
                          backgroundColor: fav.bg,
                          color: fav.fg,
                        }}
                      >
                        {fav.label}
                      </button>
                    ))}
                  </div>
                )}

                <Separator />

                <div>
                  <label htmlFor="stop-modal-kommentar" className="block text-left text-ink text-sm font-medium mb-1.5">
                    Kommentar
                  </label>
                  <div className="relative">
                    <textarea
                      id="stop-modal-kommentar"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full resize-y rounded-lg border pr-10 pt-2 pb-2 pl-3 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
                      style={{
                        borderColor: "var(--color-neutral-85)",
                        color: "var(--color-ink)",
                        fontSize: 14,
                        minHeight: "4.5rem",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setComment("")}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded text-neutral-50 hover:bg-neutral-97 hover:text-ink"
                      aria-label="Inhalt löschen"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {(() => {
                    const label = selectedProject ?? selectedTicket ?? "";
                    const ticketId = extractJiraTicketId(label);
                    if (!ticketId || !isProjectEntry(label)) return null;
                    const itsm = isItsmTicketId(ticketId);
                    const url = itsm ? getItsmUrl(ticketId) : getJiraUrl(ticketId);
                    const LinkIcon = itsm ? Ticket : SiJira;
                    const linkClass = itsm ? "text-amber-700 hover:text-amber-800" : "text-blue-600 hover:text-blue-700";
                    return (
                      <div className="mt-3 pt-3 border-t border-neutral-85">
                        <span className="text-ink text-sm font-medium block mb-1.5">
                          {itsm ? "ITSM" : "Jira"}
                        </span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 text-sm ${linkClass} transition-colors`}
                        >
                          <span className={itsm ? "inline-flex shrink-0 -translate-y-px" : "inline-flex shrink-0"}>
                            <LinkIcon size={14} aria-hidden />
                          </span>
                          {ticketId}
                        </a>
                      </div>
                    );
                  })()}
                </div>

                {onOpenSendToMember && canSave && (
                  <>
                    <Separator />
                    <button
                      type="button"
                      onClick={() => {
                        const label = selectedProject ?? selectedTicket ?? "";
                        const endForPayload = fromDetailsWhileRunning ? endTime : endInput;
                        const fromFav = favoritesProp.find((f) => f.label === label);
                        const style = fromFav ? { bg: fromFav.bg, fg: fromFav.fg } : getChipStyleForLabel(label);
                        onOpenSendToMember(
                          {
                            text: label,
                            bg: style.bg,
                            fg: style.fg,
                            startTime: startInput,
                            endTime: endForPayload,
                            comment,
                            isBillable: isBillable,
                          },
                          modalDateStr ?? ""
                        );
                      }}
                      className="flex items-center gap-2 py-2 text-primary text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <UserPlus size={16} aria-hidden />
                      An Teammitglied senden
                    </button>
                  </>
                )}

                <Separator />

                <button
                  type="button"
                  onClick={() => setWeitereFelderOpen((v) => !v)}
                  className="flex items-center justify-between gap-2 py-2 text-left text-neutral-40 text-sm hover:text-ink transition-colors w-full"
                >
                  Weitere Felder einblenden
                  {weitereFelderOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {weitereFelderOpen && (() => {
                  const label = selectedProject ?? selectedTicket ?? "";
                  const ticketId = extractJiraTicketId(label);
                  if (!ticketId || !isProjectEntry(label)) {
                    return (
                      <p className="text-sm text-neutral-50 py-2">
                        Wählen Sie ein Projekt oder Ticket, um Jira- oder ITSM-Details anzuzeigen.
                      </p>
                    );
                  }
                  const itsm = isItsmTicketId(ticketId);
                  if (itsm) {
                    const details = getMockItsmDetails(ticketId, label);
                    const rows: { label: string; value: string }[] = [
                      { label: "Ticket-ID", value: details.ticketId },
                      { label: "Ticket-Name", value: details.ticketName },
                      { label: "Ticket-Art", value: details.ticketArt },
                      { label: "Kunde", value: details.kunde },
                      { label: "Projekt", value: details.projekt },
                      { label: "SLA-Service", value: details.slaService },
                      { label: "CostCenter", value: details.costCenter },
                      { label: "Abrechnungsart", value: details.abrechnungsart },
                    ];
                    return (
                      <div className="grid grid-cols-1 gap-2 py-2">
                        {rows.map(({ label: rowLabel, value }) => (
                          <div key={rowLabel} className="flex flex-col gap-0.5">
                            <span className="text-xs text-neutral-50">{rowLabel}</span>
                            <span className="text-sm text-ink">{value || "—"}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  const details = getMockJiraDetails(ticketId, label);
                  const rows: { label: string; value: string }[] = [
                    { label: "Projekt", value: details.projekt },
                    { label: "Objekt Nr.", value: details.objektNr },
                    { label: "Objekt-Betreff", value: details.objektBetreff },
                    { label: "Objektart/LEA", value: details.objektartLea },
                    { label: "SLA-Service", value: details.slaService },
                    { label: "Ktr/Kst", value: details.ktrKst },
                    { label: "Abrechnungsart", value: details.abrechnungsart },
                    { label: "Status", value: details.status },
                  ];
                  return (
                    <div className="grid grid-cols-1 gap-2 py-2">
                      {rows.map(({ label: rowLabel, value }) => (
                        <div key={rowLabel} className="flex flex-col gap-0.5">
                          <span className="text-xs text-neutral-50">{rowLabel}</span>
                          <span className="text-sm text-ink">{value || "—"}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <Separator />

                <div className="flex items-center justify-end gap-3">
                  <span className="text-ink text-sm">Ist verrechenbar</span>
                  <ToggleSwitch checked={isBillable} onChange={setIsBillable} />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between px-6 py-4 border-t border-neutral-85">
              {fromDetailsWhileRunning ? (
                <div className="flex-1" />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (initialData?.id && onDelete) {
                      onDelete(initialData.id);
                    } else if (acceptedSuggestionId && onDeleteSuggestion) {
                      onDeleteSuggestion();
                    } else {
                      onCancel();
                    }
                  }}
                  className="rounded px-2 py-1.5 font-bold hover:bg-red-100 transition-colors"
                  style={{ color: "#b91c1c", fontSize: 14 }}
                >
                  Löschen
                </button>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-lg px-4 py-2 font-bold hover:opacity-90 text-neutral-40 text-sm"
                >
                  Schliessen
                </button>
                <button
                  type="button"
                  disabled={!canSave}
                  onClick={() => {
                    const label = selectedProject ?? selectedTicket ?? "";
                    const endForPayload = fromDetailsWhileRunning ? endTime : endInput;
                    onConfirm(
                      {
                        id: initialData?.id,
                        label,
                        startTime: startInput,
                        endTime: endForPayload,
                        comment,
                        isBillable: isBillable,
                      },
                      {
                        savedWhileRunning: fromDetailsWhileRunning,
                        barPrefillToKeep: fromDetailsWhileRunning
                          ? { project: selectedProject, ticket: selectedTicket, comment }
                          : undefined,
                      }
                    );
                    onClose();
                  }}
                  className="rounded-lg px-4 py-2 font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:hover:opacity-100"
                  style={{
                    fontSize: 14,
                    backgroundColor: canSave ? "var(--color-primary)" : "var(--color-neutral-70)",
                    color: "#FFFFFF",
                  }}
                >
                  {fromDetailsWhileRunning ? "Übernehmen (Timer läuft weiter)" : "Speichern"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Separator() {
  return <div className="my-3 border-t border-neutral-85" />;
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onChange}
      className="h-6 w-11 rounded-full px-1 transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-80"
    >
      <Switch.Thumb
        className="block h-4 w-4 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5"
      />
    </Switch.Root>
  );
}
