"use client";

import "./figma-demo3/figma-tokens.css";
import { useState, useMemo } from "react";
import { Header } from "./components/layout/Header";
import { TimerBar } from "./components/layout/TimerBar";
import { StopModal } from "./components/layout/StopModal";
import { MonthControls } from "./components/calendar/MonthControls";
import { SearchFavoritesBar } from "./components/calendar/SearchFavoritesBar";
import { CalendarGrid } from "./components/calendar/CalendarGrid";
import { DEMO_ENTRIES } from "@/lib/demoEntries";
import { useTimer } from "@/hooks/useTimer";
import type { Entry } from "@/lib/types";

const TODAY_DAY = 23;

export default function Home() {
  const [additionalEntries, setAdditionalEntries] = useState<Record<string, Entry[]>>({});
  const [stopModalOpen, setStopModalOpen] = useState(false);

  const { isRunning, elapsed, startTimeFormatted, start, pause, resume, stop } = useTimer({
    onStop: (startTime) => {
      setAdditionalEntries((prev) => ({
        ...prev,
        [String(TODAY_DAY)]: [
          ...(prev[String(TODAY_DAY)] ?? []),
          { text: startTime, bg: "var(--figma-primary)", fg: "var(--figma-bw-white)" },
        ],
      }));
    },
  });

  const entriesByDay = useMemo(() => {
    const base = { ...DEMO_ENTRIES };
    const todayKey = String(TODAY_DAY);
    const saved = additionalEntries[todayKey] ?? [];
    const live =
      isRunning && startTimeFormatted
        ? [{ text: startTimeFormatted, bg: "var(--figma-primary)", fg: "var(--figma-bw-white)" }]
        : [];
    base[todayKey] = [...(base[todayKey] ?? []), ...saved, ...live];
    return base;
  }, [DEMO_ENTRIES, additionalEntries, isRunning, startTimeFormatted]);

  const daysWeek1 = [16, 17, 18, 19, 20, 21, 22];
  const daysWeek2 = [23, 24, 25, 26, 27, 28, 29];
  const month = 2;
  const isWeekend = (d: number) => d === 21 || d === 22 || d === 28 || d === 29;
  const getHours = (d: number) => {
    if (isWeekend(d)) return "0 Std.";
    if (d === TODAY_DAY) return "0 Std.";
    return "8 Std.";
  };

  return (
    <div className="figma-demo3 min-h-screen" style={{ backgroundColor: "var(--figma-neutral-97)", color: "var(--figma-bw-black)" }}>
      <Header />
      <TimerBar
        elapsed={elapsed}
        isRunning={isRunning}
        startTimeFormatted={startTimeFormatted}
        onPlay={start}
        onStop={() => {
          setStopModalOpen(true);
          pause();
        }}
      />
      <StopModal
        isOpen={stopModalOpen}
        onClose={() => {
          setStopModalOpen(false);
          resume();
        }}
        onConfirm={(entryLabel) => {
          setAdditionalEntries((prev) => ({
            ...prev,
            [String(TODAY_DAY)]: [
              ...(prev[String(TODAY_DAY)] ?? []),
              { text: entryLabel, bg: "var(--figma-primary)", fg: "var(--figma-bw-white)" },
            ],
          }));
          stop(true);
          setStopModalOpen(false);
        }}
        startTimeFormatted={startTimeFormatted}
        elapsed={elapsed}
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
        />
      </main>
    </div>
  );
}
