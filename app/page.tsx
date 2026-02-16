"use client";

import "./figma-demo3/figma-tokens.css";
import { useState, useMemo, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { TimerBar } from "./components/layout/TimerBar";
import { StopModal } from "./components/layout/StopModal";
import { DetailsModal } from "./components/layout/DetailsModal";
import { Fab } from "./components/layout/Fab";
import { MonthControls } from "./components/calendar/MonthControls";
import { SearchFavoritesBar } from "./components/calendar/SearchFavoritesBar";
import { CalendarGrid } from "./components/calendar/CalendarGrid";
import { DEMO_ENTRIES } from "@/lib/demoEntries";
import { useTimer } from "@/hooks/useTimer";
import { PROJECT_OPTIONS, TICKET_OPTIONS, getChipStyleForLabel } from "@/lib/constants";
import { durationHours } from "@/lib/timeUtils";
import type { Entry, EntryPayload } from "@/lib/types";

const TODAY_DAY = 23;
const TODAY_DATE = "2026-02-23"; // für API (23.2.2026)

const CHIP_STYLE_LIVE = { bg: "var(--figma-primary)", fg: "var(--figma-bw-white)" };

function entryFromRow(row: { id: string; start_time: string; end_time: string; label: string; comment: string; is_billable: boolean }): Entry {
  return {
    id: row.id,
    text: row.label,
    ...getChipStyleForLabel(row.label),
    startTime: row.start_time,
    endTime: row.end_time,
    comment: row.comment,
    isBillable: row.is_billable,
  };
}

export default function Home() {
  const [savedEntriesForToday, setSavedEntriesForToday] = useState<Entry[]>([]);
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [openFromFab, setOpenFromFab] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EntryPayload | null>(null);
  const [inlineProject, setInlineProject] = useState<string | null>(null);
  const [inlineTicket, setInlineTicket] = useState<string | null>(null);
  const [inlineComment, setInlineComment] = useState("");

  const { isRunning, elapsed, startTimeFormatted, start, pause, resume, stop } = useTimer({});

  useEffect(() => {
    fetch(`/api/entries?date=${TODAY_DATE}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setSavedEntriesForToday((rows ?? []).map(entryFromRow)))
      .catch(() => setSavedEntriesForToday([]));
  }, []);

  const entriesByDay = useMemo(() => {
    const base = { ...DEMO_ENTRIES };
    const todayKey = String(TODAY_DAY);
    const live: Entry[] =
      isRunning && startTimeFormatted
        ? [{ text: startTimeFormatted, ...CHIP_STYLE_LIVE }]
        : [];
    base[todayKey] = [...(base[todayKey] ?? []), ...savedEntriesForToday, ...live];
    return base;
  }, [DEMO_ENTRIES, savedEntriesForToday, isRunning, startTimeFormatted]);

  const daysWeek1 = [16, 17, 18, 19, 20, 21, 22];
  const daysWeek2 = [23, 24, 25, 26, 27, 28, 29];
  const month = 2;
  const isWeekend = (d: number) => d === 21 || d === 22 || d === 28 || d === 29;

  const todayTotalHours = useMemo(() => {
    const sum = savedEntriesForToday.reduce((acc, e) => {
      if (!e.startTime || !e.endTime) return acc;
      return acc + durationHours(e.startTime, e.endTime);
    }, 0);
    return Math.round(sum * 10) / 10;
  }, [savedEntriesForToday]);

  const getHours = (d: number) => {
    if (isWeekend(d)) return "0 Std.";
    if (d === TODAY_DAY) return `${todayTotalHours.toFixed(1).replace(".", ",")} Std.`;
    return "8 Std.";
  };

  return (
    <div className="figma-demo3 min-h-screen" style={{ backgroundColor: "var(--figma-neutral-97)", color: "var(--figma-bw-black)" }}>
      <Header />
      <TimerBar
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
          setOpenFromFab(false);
          setEditingEntry(null);
          setDetailsModalOpen(true);
        }}
        projectOptions={[...PROJECT_OPTIONS]}
        ticketOptions={[...TICKET_OPTIONS]}
      />
      <StopModal
        isOpen={stopModalOpen}
        onClose={() => {
          setStopModalOpen(false);
          resume();
        }}
        onCancel={() => {
          if (!openFromFab && !editingEntry) stop(true);
          setStopModalOpen(false);
          setOpenFromFab(false);
          setEditingEntry(null);
        }}
        onDelete={async (entryId) => {
          const res = await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
          if (res.ok) {
            setSavedEntriesForToday((prev) => prev.filter((e) => e.id !== entryId));
          }
          setStopModalOpen(false);
          setOpenFromFab(false);
          setEditingEntry(null);
        }}
        onConfirm={async (payload: EntryPayload) => {
          if (payload.id) {
            const res = await fetch(`/api/entries/${payload.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                start_time: payload.startTime,
                end_time: payload.endTime,
                label: payload.label,
                comment: payload.comment,
                is_billable: payload.isBillable,
              }),
            });
            if (res.ok) {
              const row = await res.json();
              setSavedEntriesForToday((prev) => prev.map((e) => (e.id === payload.id ? entryFromRow(row) : e)));
            }
          } else {
            const res = await fetch("/api/entries", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                date: TODAY_DATE,
                start_time: payload.startTime,
                end_time: payload.endTime,
                label: payload.label,
                comment: payload.comment,
                is_billable: payload.isBillable,
              }),
            });
            if (res.ok) {
              const row = await res.json();
              setSavedEntriesForToday((prev) => [...prev, entryFromRow(row)]);
            }
            if (!openFromFab) stop(true);
          }
          setStopModalOpen(false);
          setOpenFromFab(false);
          setEditingEntry(null);
        }}
        openFromFab={openFromFab}
        initialData={editingEntry}
        barPrefill={!editingEntry && !openFromFab ? { project: inlineProject, ticket: inlineTicket, comment: inlineComment } : null}
        startTimeFormatted={startTimeFormatted}
        elapsed={elapsed}
      />
      <DetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          resume();
        }}
        onCancel={(afterStop) => {
          setDetailsModalOpen(false);
          if (afterStop) stop(true);
        }}
        onConfirm={async (payload: EntryPayload, options?: { savedWhileRunning?: boolean }) => {
          const res = await fetch("/api/entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: TODAY_DATE,
              start_time: payload.startTime,
              end_time: payload.endTime,
              label: payload.label,
              comment: payload.comment,
              is_billable: payload.isBillable,
            }),
          });
          if (res.ok) {
            const row = await res.json();
            setSavedEntriesForToday((prev) => [...prev, entryFromRow(row)]);
          }
          if (!options?.savedWhileRunning) stop(true);
          setDetailsModalOpen(false);
        }}
        elapsed={elapsed}
        startTimeFormatted={startTimeFormatted}
        isRunning={isRunning}
        onStopInModal={pause}
        barPrefill={{ project: inlineProject, ticket: inlineTicket, comment: inlineComment }}
      />
      <main className="w-full px-6 py-6">
        <MonthControls monthLabel="Februar 2026" monthTotal="Monat total: 123 Std. 13 Min." />
        <SearchFavoritesBar />
        <CalendarGrid
          daysWeek1={daysWeek1}
          daysWeek2={daysWeek2}
          month={month}
          isTodayDay={TODAY_DAY}
          isWeekend={isWeekend}
          getHours={getHours}
          entriesByDay={entriesByDay}
          weekTotals={["40 Std. + 0 Std.", "0 Std. + 0 Std."]}
          onEntryClick={(entry) => {
            if (!entry.id) return;
            setEditingEntry({
              id: entry.id,
              label: entry.text,
              startTime: entry.startTime ?? "",
              endTime: entry.endTime ?? "",
              comment: entry.comment ?? "",
              isBillable: entry.isBillable !== false,
            });
            setOpenFromFab(false);
            setStopModalOpen(true);
          }}
        />
      </main>
      <Fab
        onClick={() => {
          setOpenFromFab(true);
          setStopModalOpen(true);
        }}
      />
    </div>
  );
}
