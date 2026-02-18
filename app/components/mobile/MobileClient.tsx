"use client";

import { Header } from "../layout/Header";
import { MobileTimerBar } from "./MobileTimerBar";
import { MobileDayNav } from "./MobileDayNav";
import { MobileDayList } from "./MobileDayList";
import { StopModal } from "../layout/StopModal";
import { useLeistungserfassung } from "@/hooks/useLeistungserfassung";
import type { HomeClientProps } from "@/hooks/useLeistungserfassung";
import { getTodayDateStr } from "@/lib/timeUtils";

export function MobileClient(props: HomeClientProps) {
  const data = useLeistungserfassung(props);

  const {
    todayDateStr,
    userSlug,
    displayedDateStr,
    entriesByDate,
    stopModalOpen,
    fromDetailsWhileRunning,
    openFromFab,
    addEntryPrefill,
    modalDateStr,
    editingEntry,
    inlineProject,
    inlineTicket,
    inlineComment,
    projectOptions,
    ticketOptions,
    setStopModalOpen,
    setFromDetailsWhileRunning,
    setOpenFromFab,
    setEditingEntry,
    setAddEntryPrefill,
    setModalDateStr,
    handleStopModalDelete,
    handleStopModalDeleteSuggestion,
    handleStopModalConfirm,
    handleStopModalCancel,
    handleEntryClick,
    handleAddEntryClick,
    goToPrev,
    goToNext,
    acceptedSuggestionId,
    formatDateLong,
    formatDateShort,
    elapsed,
    isRunning,
    startTimeFormatted,
    favorites,
  } = data;

  const entries = entriesByDate[displayedDateStr] ?? [];
  const isActuallyToday = displayedDateStr === getTodayDateStr();

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-neutral-97 text-ink">
      <div className="shrink-0 pt-[env(safe-area-inset-top,0px)]">
        <Header />
      </div>

      <MobileTimerBar
        elapsed={elapsed}
        isRunning={isRunning}
        startTimeFormatted={startTimeFormatted}
        onPlay={() => {
          data.start();
          data.setInlineProject(null);
          data.setInlineTicket(null);
          data.setInlineComment("");
        }}
        onStop={() => {
          setFromDetailsWhileRunning(false);
          setModalDateStr(displayedDateStr);
          setOpenFromFab(false);
          setEditingEntry(null);
          setStopModalOpen(true);
          data.pause();
        }}
      />

      <MobileDayNav
        dateLabel={isActuallyToday ? formatDateShort(displayedDateStr, true) : formatDateLong(displayedDateStr)}
        onPrev={goToPrev}
        onNext={goToNext}
      />

      <MobileDayList
        entries={entries}
        dateLabel={formatDateLong(displayedDateStr)}
        onEntryClick={(entry) => handleEntryClick(entry, displayedDateStr)}
      />

      <div className="shrink-0 p-4 pb-[env(safe-area-inset-bottom,0px)] bg-white border-t border-neutral-85">
        <button
          type="button"
          onClick={() => handleAddEntryClick(displayedDateStr)}
          className="w-full py-3 rounded-lg bg-primary text-white font-medium text-base"
        >
          + Neue Leistung
        </button>
      </div>

      <StopModal
        variant="sheet"
        userSlug={userSlug}
        isOpen={stopModalOpen}
        onClose={() => {
          setStopModalOpen(false);
          setAddEntryPrefill(null);
          if (!fromDetailsWhileRunning) data.resume();
        }}
        onCancel={handleStopModalCancel}
        onDelete={handleStopModalDelete}
        onDeleteSuggestion={handleStopModalDeleteSuggestion}
        acceptedSuggestionId={acceptedSuggestionId}
        onConfirm={handleStopModalConfirm}
        openFromFab={openFromFab}
        addEntryPrefill={addEntryPrefill}
        initialData={editingEntry}
        barPrefill={
          !editingEntry && !openFromFab
            ? { project: inlineProject, ticket: inlineTicket, comment: inlineComment }
            : null
        }
        fromDetailsWhileRunning={fromDetailsWhileRunning}
        startTimeFormatted={startTimeFormatted}
        elapsed={elapsed}
        dateLabel={formatDateLong(modalDateStr)}
        dateStr={modalDateStr}
        entriesOnDate={entriesByDate[modalDateStr] ?? []}
        leistungen={projectOptions}
        ticketOptions={ticketOptions}
        favorites={favorites.map((f) => ({ label: f.label, bg: f.bg, fg: f.fg }))}
      />
    </div>
  );
}
