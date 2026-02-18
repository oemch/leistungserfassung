"use client";

import { setEntriesCache } from "@/lib/entriesCache";
import { Header } from "./layout/Header";
import { TimerBar } from "./layout/TimerBar";
import { StopModal } from "./layout/StopModal";
import { MonthControls } from "./calendar/MonthControls";
import { SearchFavoritesBar } from "./calendar/SearchFavoritesBar";
import { SuggestionsSection } from "./calendar/SuggestionsSection";
import { FavoritenModal } from "./calendar/FavoritenModal";
import { SendToMemberModal } from "./layout/SendToMemberModal";
import { CalendarGrid } from "./calendar/CalendarGrid";
import { YearView } from "./calendar/YearView";
import { ListView } from "./calendar/ListView";
import { EntryContextMenu } from "./calendar/EntryContextMenu";
import { useLeistungserfassung } from "@/hooks/useLeistungserfassung";

export function HomeClient(props: import("@/hooks/useLeistungserfassung").HomeClientProps) {
  const data = useLeistungserfassung(props);

  const {
    todayDateStr,
    userSlug,
    displayedYear,
    displayedMonth,
    viewMode,
    weekStartMonday,
    displayedDateStr,
    entriesByDate,
    favorites,
    stopModalOpen,
    fromDetailsWhileRunning,
    openFromFab,
    addEntryPrefill,
    modalDateStr,
    editingEntry,
    inlineProject,
    inlineTicket,
    inlineComment,
    favoritenModalOpen,
    searchTerm,
    searchTerms,
    weeks,
    entriesByDay,
    isWeekend,
    getHours,
    periodLabel,
    projectOptions,
    ticketOptions,
    weekTotals,
    periodTotalLabel,
    overtimeGesamt,
    start,
    pause,
    resume,
    stop,
    setStopModalOpen,
    setFromDetailsWhileRunning,
    setOpenFromFab,
    setEditingEntry,
    setAddEntryPrefill,
    setModalDateStr,
    setFavoritenModalOpen,
    setSearchTerm,
    setFavorites,
    setDisplayedYear,
    setDisplayedMonth,
    goToPrev,
    goToNext,
    goToToday,
    handleBarPrefillChange,
    handleViewChange,
    handleGoToDay,
    handleGoToWeek,
    handleStopModalDelete,
    handleStopModalDeleteSuggestion,
    handleStopModalConfirm,
    handleStopModalCancel,
    acceptedSuggestionId,
    handleEntryClick,
    handleEntryDelete,
    handleEntryMove,
    handleEntryCopy,
    handleEntrySendToMember,
    handleOpenSendToMember,
    handleSendToMemberConfirm,
    handleSuggestionAccept,
    handleSuggestionReject,
    sendToMemberOpen,
    closeSendToMemberModal,
    sendToMemberEntry,
    sendToMemberDateStr,
    suggestions,
    handleAddEntry,
    handleAddEntryClick,
    handleOverviewGenerate,
    formatDateShort,
    formatDateLong,
    elapsed,
    isRunning,
    startTimeFormatted,
    setInlineProject,
    setInlineTicket,
    setInlineComment,
    entryContextMenu,
    setEntryContextMenu,
    cancelEntryContextMenuClose,
    scheduleEntryContextMenuClose,
  } = data;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-97 text-ink">
      <Header />
      <TimerBar
        todayLabel={formatDateShort(todayDateStr, true)}
        elapsed={elapsed}
        isRunning={isRunning}
        startTimeFormatted={startTimeFormatted}
        onPlay={() => {
          start();
          setInlineProject(null);
          setInlineTicket(null);
          setInlineComment("");
        }}
        onStop={() => {
          setFromDetailsWhileRunning(false);
          setModalDateStr(todayDateStr);
          setOpenFromFab(false);
          setEditingEntry(null);
          setStopModalOpen(true);
          pause();
        }}
        inlineProject={inlineProject}
        inlineTicket={inlineTicket}
        inlineComment={inlineComment}
        onInlineProjectChange={(v) => setInlineProject(v || null)}
        onInlineTicketChange={(v) => setInlineTicket(v || null)}
        onInlineCommentChange={setInlineComment}
        onDetailsClick={() => {
          setFromDetailsWhileRunning(true);
          setModalDateStr(todayDateStr);
          setOpenFromFab(false);
          setEditingEntry(null);
          setStopModalOpen(true);
        }}
        onAddEntryClick={handleAddEntryClick}
        onOverviewGenerate={handleOverviewGenerate}
        projectOptions={projectOptions}
        ticketOptions={ticketOptions}
      />
      <StopModal
        userSlug={userSlug}
        isOpen={stopModalOpen}
        onClose={() => {
          setStopModalOpen(false);
          setAddEntryPrefill(null);
          if (!fromDetailsWhileRunning) resume();
        }}
        onCancel={handleStopModalCancel}
        onDelete={handleStopModalDelete}
        onDeleteSuggestion={handleStopModalDeleteSuggestion}
        acceptedSuggestionId={acceptedSuggestionId}
        onConfirm={handleStopModalConfirm}
        openFromFab={openFromFab}
        addEntryPrefill={addEntryPrefill}
        initialData={editingEntry}
        barPrefill={!editingEntry && !openFromFab ? { project: inlineProject, ticket: inlineTicket, comment: inlineComment } : null}
        fromDetailsWhileRunning={fromDetailsWhileRunning}
        onBarPrefillChange={fromDetailsWhileRunning ? handleBarPrefillChange : undefined}
        startTimeFormatted={startTimeFormatted}
        elapsed={elapsed}
        dateLabel={formatDateLong(modalDateStr)}
        dateStr={modalDateStr}
        entriesOnDate={entriesByDate[modalDateStr] ?? []}
        leistungen={projectOptions}
        ticketOptions={ticketOptions}
        favorites={favorites.map((f) => ({ label: f.label, bg: f.bg, fg: f.fg }))}
        onOpenSendToMember={handleOpenSendToMember}
      />
      <main className="flex-1 flex flex-col min-h-0 w-full overflow-hidden bg-white px-6 py-6">
        <div className="w-full max-w-[1920px] mx-auto flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="shrink-0">
            <MonthControls
              periodLabel={periodLabel}
              periodTotal={periodTotalLabel}
              viewMode={viewMode}
              onViewChange={handleViewChange}
              onPrev={goToPrev}
              onNext={goToNext}
              onGoToToday={goToToday}
            />
            <SearchFavoritesBar
              favorites={favorites}
              onEditClick={() => setFavoritenModalOpen(true)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <SuggestionsSection
              suggestions={suggestions}
              onAccept={handleSuggestionAccept}
              onReject={handleSuggestionReject}
            />
            <SendToMemberModal
              isOpen={sendToMemberOpen}
              onClose={closeSendToMemberModal}
              entry={sendToMemberEntry}
              dateStr={sendToMemberDateStr}
              currentUserSlug={userSlug}
              onSend={handleSendToMemberConfirm}
            />
            {entryContextMenu?.entry.id && (
              <EntryContextMenu
                entry={entryContextMenu.entry}
                dateStr={entryContextMenu.dateStr}
                isOpen
                onClose={() => setEntryContextMenu(null)}
                onCancelClose={cancelEntryContextMenuClose}
                anchorEl={entryContextMenu.anchorEl}
                onEdit={handleEntryClick ?? (() => {})}
                onCopy={handleEntryCopy ?? (() => {})}
                onSendToMember={handleEntrySendToMember ?? (() => {})}
                onDelete={handleEntryDelete ?? (() => {})}
              />
            )}
            <FavoritenModal
              isOpen={favoritenModalOpen}
              onClose={() => setFavoritenModalOpen(false)}
              favorites={favorites}
              onSave={(list) => {
                setFavorites(list);
                setEntriesCache("favorites:" + userSlug, list);
              }}
              userSlug={userSlug}
              leistungen={projectOptions}
              ticketOptions={ticketOptions}
            />
          </div>
          {viewMode === "Jahr" ? (
            <div key="Jahr" className="flex-1 min-h-0 flex flex-col">
              <YearView
                year={displayedYear}
                todayDateStr={todayDateStr}
                entriesByDay={entriesByDay}
                searchTerms={searchTerms}
                onMonthClick={(y, m) => {
                  setDisplayedYear(y);
                  setDisplayedMonth(m);
                  handleViewChange("Monat");
                }}
                onDayClick={handleGoToDay}
                onWeekClick={handleGoToWeek}
              />
            </div>
          ) : viewMode === "Liste" ? (
            <div key="Liste" className="flex-1 min-h-0 flex flex-col">
              <ListView
                weeks={weeks}
                weekTotals={weekTotals}
                displayedYear={displayedYear}
                displayedMonth={displayedMonth}
                todayDateStr={todayDateStr}
                entriesByDay={entriesByDay}
                getHours={getHours}
                searchTerms={searchTerms}
                onEntryClick={handleEntryClick}
                entryContextMenu={entryContextMenu}
                setEntryContextMenu={setEntryContextMenu}
                cancelEntryContextMenuClose={cancelEntryContextMenuClose}
                scheduleEntryContextMenuClose={scheduleEntryContextMenuClose}
                onEntryDelete={handleEntryDelete}
                onEntryCopy={handleEntryCopy}
                onEntrySendToMember={handleEntrySendToMember}
              />
              {overtimeGesamt && (
                <div className="w-full max-w-[1920px] mx-auto flex justify-end mt-4">
                  <span className="text-sm font-medium text-ink">{overtimeGesamt}</span>
                </div>
              )}
            </div>
          ) : (viewMode === "Woche" || viewMode === "Tag") ? (
            <div key={viewMode} className="flex-1 min-h-0 flex flex-col">
              <CalendarGrid
                weeks={weeks}
                todayDateStr={todayDateStr}
                displayedYear={displayedYear}
                displayedMonth={displayedMonth}
                isWeekView
                searchTerms={searchTerms}
                isWeekend={isWeekend}
                getHours={getHours}
                entriesByDay={entriesByDay}
                weekTotals={weekTotals}
                onEntryClick={handleEntryClick}
                onEntryDelete={handleEntryDelete}
                onEntryMove={handleEntryMove}
                onEntryCopy={handleEntryCopy}
                onEntrySendToMember={handleEntrySendToMember}
                onAddEntry={handleAddEntry}
                entryContextMenu={entryContextMenu}
                setEntryContextMenu={setEntryContextMenu}
                cancelEntryContextMenuClose={cancelEntryContextMenuClose}
                scheduleEntryContextMenuClose={scheduleEntryContextMenuClose}
              />
            </div>
          ) : (
            <div key="Monat" className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
              <CalendarGrid
                weeks={weeks}
                todayDateStr={todayDateStr}
                displayedYear={displayedYear}
                displayedMonth={displayedMonth}
                isWeekView={false}
                searchTerms={searchTerms}
                isWeekend={isWeekend}
                getHours={getHours}
                entriesByDay={entriesByDay}
                weekTotals={weekTotals}
                onEntryClick={handleEntryClick}
                onEntryDelete={handleEntryDelete}
                onEntryMove={handleEntryMove}
                onEntryCopy={handleEntryCopy}
                onEntrySendToMember={handleEntrySendToMember}
                onAddEntry={handleAddEntry}
                entryContextMenu={entryContextMenu}
                setEntryContextMenu={setEntryContextMenu}
                cancelEntryContextMenuClose={cancelEntryContextMenuClose}
                scheduleEntryContextMenuClose={scheduleEntryContextMenuClose}
              />
              {viewMode === "Monat" && overtimeGesamt && (
                <div className="w-full max-w-[1920px] mx-auto flex justify-end mt-4">
                  <span className="text-sm font-medium text-ink">{overtimeGesamt}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
