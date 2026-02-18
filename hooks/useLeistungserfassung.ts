"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useTimer } from "@/hooks/useTimer";
import { LEISTUNG_OPTIONS, TICKET_OPTIONS, getChipStyleForLabel, getTargetHoursPerWeek, getSollPerDay, sortOptionsByRecent } from "@/lib/constants";
import type { ViewMode } from "@/lib/types";
import type { FavoriteItem } from "@/lib/types";
import {
  effectiveHoursForDisplay,
  formatHoursDecimal,
  isWeekend,
  getMonthLabel,
  getYearLabel,
  getCalendarDaysForMonth,
  getCalendarDaysForWeek,
  getCalendarDayForDate,
  getDateStrsForYear,
  getDayLabel,
  getMondayOfWeek,
  getWeekLabel,
  getISOWeekNumber,
  formatDateLong,
  formatDateShort,
  dateToStr,
  timeFromMinutes,
  minutesFromMidnight,
} from "@/lib/timeUtils";
import type { Entry, EntryPayload } from "@/lib/types";
import type { DbRow } from "@/lib/entryUtils";
import { entryFromRow } from "@/lib/entryUtils";
import { getEntriesCache, setEntriesCache, clearEntriesCache } from "@/lib/entriesCache";
import { extractJiraTicketId } from "@/lib/jira";
import { suggestLeistung, fetchJson, deleteEntry, patchEntry, postEntry } from "@/lib/apiClient";
import { useUser, USER_OPTIONS, userToSlug } from "@/lib/UserContext";
import { generateMonatsjournalPdf } from "@/lib/monatsjournal";
import { useToast } from "@/app/components/ui/Toast";
import { loadViewState, STORAGE_VIEW, STORAGE_WEEK_START, STORAGE_MONTH, STORAGE_DAY } from "@/lib/viewState";
import type { Suggestion } from "@/lib/suggestions";
import {
  fetchSuggestionsForUser,
  getSendToMemberOptions,
  addSuggestion,
  removeSuggestion,
  createSuggestionFromEntry,
} from "@/lib/suggestions";

const CHIP_STYLE_LIVE = { bg: "#03634E", fg: "#FFFFFF" };

export interface HomeClientProps {
  todayDateStr: string;
  initialFavorites: FavoriteItem[];
  initialEntriesByDate: Record<string, Entry[]>;
  initialLeistungen: string[];
  initialRecentLabels?: string[];
  /** Für Mobile: Tag-Ansicht mit Tagesnavigation */
  initialViewMode?: ViewMode;
}

export function useLeistungserfassung({
  todayDateStr,
  initialFavorites,
  initialEntriesByDate,
  initialLeistungen,
  initialRecentLabels = [],
  initialViewMode,
}: HomeClientProps) {
  const { userSlug, currentUser } = useUser();
  const { showDeletedToast, showSuccessToast } = useToast();
  const [displayedYear, setDisplayedYear] = useState(() => {
    const [y] = todayDateStr.split("-").map(Number);
    return y ?? new Date().getFullYear();
  });
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const [, m] = todayDateStr.split("-").map(Number);
    return m ?? new Date().getMonth() + 1;
  });
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode ?? "Monat");
  const [weekStartMonday, setWeekStartMonday] = useState(() => getMondayOfWeek(todayDateStr));
  const [displayedDateStr, setDisplayedDateStr] = useState(todayDateStr);
  const [entriesByDate, setEntriesByDate] = useState<Record<string, Entry[]>>(initialEntriesByDate);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(initialFavorites);
  const [leistungen, setLeistungen] = useState<string[]>(initialLeistungen);
  const [recentLabels, setRecentLabels] = useState<string[]>(initialRecentLabels);
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [fromDetailsWhileRunning, setFromDetailsWhileRunning] = useState(false);
  const [openFromFab, setOpenFromFab] = useState(false);
  const [addEntryPrefill, setAddEntryPrefill] = useState<{
    startTime: string;
    endTime: string;
    project?: string;
    ticket?: string;
  } | null>(null);
  const [modalDateStr, setModalDateStr] = useState(todayDateStr);
  const [editingEntry, setEditingEntry] = useState<EntryPayload | null>(null);
  const [inlineProject, setInlineProject] = useState<string | null>(null);
  const [inlineTicket, setInlineTicket] = useState<string | null>(null);
  const [inlineComment, setInlineComment] = useState("");
  const [favoritenModalOpen, setFavoritenModalOpen] = useState(false);
  const [acceptedSuggestionId, setAcceptedSuggestionId] = useState<string | null>(null);
  const [sendToMemberOpen, setSendToMemberOpen] = useState(false);
  const [sendToMemberEntry, setSendToMemberEntry] = useState<Entry | null>(null);
  const [sendToMemberDateStr, setSendToMemberDateStr] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => []);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [targetHoursPerWeek, setTargetHoursPerWeek] = useState(() => getTargetHoursPerWeek(userSlug));
  const [entryContextMenu, setEntryContextMenu] = useState<{
    entry: import("@/lib/types").Entry;
    dateStr: string;
    anchorEl: HTMLElement;
  } | null>(null);
  const entryContextMenuCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelEntryContextMenuClose = useCallback(() => {
    if (entryContextMenuCloseTimeoutRef.current) {
      clearTimeout(entryContextMenuCloseTimeoutRef.current);
      entryContextMenuCloseTimeoutRef.current = null;
    }
  }, []);

  const scheduleEntryContextMenuClose = useCallback(() => {
    entryContextMenuCloseTimeoutRef.current = setTimeout(() => setEntryContextMenu(null), 150);
  }, []);

  const { isRunning, elapsed, startTimeFormatted, start, pause, resume, stop } = useTimer({});

  useEffect(() => {
    fetchSuggestionsForUser(userSlug).then(setSuggestions);
  }, [userSlug]);

  useEffect(() => {
    setTargetHoursPerWeek(getTargetHoursPerWeek(userSlug));
    fetchJson<{ target_hours_per_week?: number } | null>(`/api/persons?user=${encodeURIComponent(userSlug)}`, null).then(
      (person) => {
        if (person?.target_hours_per_week != null) {
          setTargetHoursPerWeek(Number(person.target_hours_per_week));
        }
      }
    );
  }, [userSlug]);

  const weeks = useMemo(() => {
    if (viewMode === "Tag") return [[getCalendarDayForDate(displayedDateStr)]];
    if (viewMode === "Woche") return getCalendarDaysForWeek(weekStartMonday).weeks;
    if (viewMode === "Jahr") return [];
    return getCalendarDaysForMonth(displayedYear, displayedMonth).weeks;
  }, [viewMode, displayedDateStr, weekStartMonday, displayedYear, displayedMonth]);

  const labelToStyle = useMemo(() => new Map(favorites.map((f) => [f.label, { bg: f.bg, fg: f.fg }])), [favorites]);

  const goToPrevMonth = useCallback(() => {
    if (displayedMonth === 1) {
      setDisplayedYear((y) => y - 1);
      setDisplayedMonth(12);
    } else {
      setDisplayedMonth((m) => m - 1);
    }
  }, [displayedMonth]);

  const goToNextMonth = useCallback(() => {
    if (displayedMonth === 12) {
      setDisplayedYear((y) => y + 1);
      setDisplayedMonth(1);
    } else {
      setDisplayedMonth((m) => m + 1);
    }
  }, [displayedMonth]);

  const goToPrevYear = useCallback(() => setDisplayedYear((y) => y - 1), []);
  const goToNextYear = useCallback(() => setDisplayedYear((y) => y + 1), []);

  const goToPrevWeek = useCallback(() => {
    const [y, m, d] = weekStartMonday.split("-").map(Number);
    const monday = new Date(y!, m! - 1, d!);
    monday.setDate(monday.getDate() - 7);
    setWeekStartMonday(dateToStr(monday));
  }, [weekStartMonday]);

  const goToNextWeek = useCallback(() => {
    const [y, m, d] = weekStartMonday.split("-").map(Number);
    const monday = new Date(y!, m! - 1, d!);
    monday.setDate(monday.getDate() + 7);
    setWeekStartMonday(dateToStr(monday));
  }, [weekStartMonday]);

  const goToPrevDay = useCallback(() => {
    const [y, m, d] = displayedDateStr.split("-").map(Number);
    const date = new Date(y!, m! - 1, d!);
    date.setDate(date.getDate() - 1);
    setDisplayedDateStr(dateToStr(date));
  }, [displayedDateStr]);

  const goToNextDay = useCallback(() => {
    const [y, m, d] = displayedDateStr.split("-").map(Number);
    const date = new Date(y!, m! - 1, d!);
    date.setDate(date.getDate() + 1);
    setDisplayedDateStr(dateToStr(date));
  }, [displayedDateStr]);

  const goToPrev = useCallback(() => {
    if (viewMode === "Tag") goToPrevDay();
    else if (viewMode === "Woche") goToPrevWeek();
    else if (viewMode === "Jahr") goToPrevYear();
    else goToPrevMonth();
  }, [viewMode, goToPrevDay, goToPrevWeek, goToPrevYear, goToPrevMonth]);

  const goToNext = useCallback(() => {
    if (viewMode === "Tag") goToNextDay();
    else if (viewMode === "Woche") goToNextWeek();
    else if (viewMode === "Jahr") goToNextYear();
    else goToNextMonth();
  }, [viewMode, goToNextDay, goToNextWeek, goToNextYear, goToNextMonth]);

  const goToToday = useCallback(() => {
    if (viewMode === "Tag") setDisplayedDateStr(todayDateStr);
    else if (viewMode === "Woche") setWeekStartMonday(getMondayOfWeek(todayDateStr));
    else if (viewMode === "Monat" || viewMode === "Jahr" || viewMode === "Liste") {
      const [y, m] = todayDateStr.split("-").map(Number);
      setDisplayedYear(y!);
      setDisplayedMonth(m!);
    }
  }, [viewMode, todayDateStr]);

  const handleBarPrefillChange = useCallback((prefill: { project: string | null; ticket: string | null; comment: string }) => {
    setInlineProject(prefill.project);
    setInlineTicket(prefill.ticket);
    setInlineComment(prefill.comment);
  }, []);

  const handleViewChange = useCallback(
    (view: ViewMode) => {
      setEntryContextMenu(null);
      setViewMode(view);
      if (view === "Tag") setDisplayedDateStr(todayDateStr);
      else if (view === "Woche") setWeekStartMonday(getMondayOfWeek(todayDateStr));
      else if (view === "Monat" || view === "Jahr" || view === "Liste") {
        const [y, m] = todayDateStr.split("-").map(Number);
        setDisplayedYear(y!);
        setDisplayedMonth(m!);
      }
    },
    [todayDateStr]
  );

  const handleGoToDay = useCallback((dateStr: string) => {
    setEntryContextMenu(null);
    setViewMode("Tag");
    setDisplayedDateStr(dateStr);
  }, []);

  const handleGoToWeek = useCallback((mondayStr: string) => {
    setEntryContextMenu(null);
    setViewMode("Woche");
    setWeekStartMonday(mondayStr);
  }, []);

  useEffect(() => {
    if (initialViewMode) return; // Mobile: View-State nicht aus localStorage überschreiben
    const saved = loadViewState(todayDateStr);
    if (saved) {
      setViewMode(saved.view);
      setWeekStartMonday(saved.weekStart);
      setDisplayedYear(saved.year);
      setDisplayedMonth(saved.monthNum);
      if (saved.day) setDisplayedDateStr(saved.day);
    }
  }, [todayDateStr, initialViewMode]);

  useEffect(() => {
    if (typeof window === "undefined" || initialViewMode) return; // Mobile: View-State nicht persistieren
    window.localStorage.setItem(STORAGE_VIEW, viewMode);
    window.localStorage.setItem(STORAGE_WEEK_START, weekStartMonday);
    window.localStorage.setItem(STORAGE_MONTH, `${displayedYear}-${displayedMonth}`);
    if (viewMode === "Tag") window.localStorage.setItem(STORAGE_DAY, displayedDateStr);
  }, [viewMode, weekStartMonday, displayedYear, displayedMonth, displayedDateStr, initialViewMode]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key !== "t" && e.key !== "T") || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (viewMode === "Tag" || viewMode === "Woche" || viewMode === "Monat" || viewMode === "Jahr" || viewMode === "Liste") {
        e.preventDefault();
        goToToday();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [viewMode, goToToday]);

  useEffect(() => {
    const dateStrs =
      viewMode === "Jahr" ? getDateStrsForYear(displayedYear) : weeks.flatMap((w) => w.map((c) => c.dateStr));
    const cacheKey =
      viewMode === "Jahr" ? `entries:${userSlug}:${displayedYear}` : `entries:${userSlug}:${dateStrs.join(",")}`;
    const datesParam =
      viewMode === "Jahr" ? `from=${displayedYear}-01-01&to=${displayedYear}-12-31` : dateStrs.join(",");
    const favsKey = `favorites:${userSlug}`;
    const leistKey = "leistungen";

    const applyData = (favList: FavoriteItem[], byDate: Record<string, DbRow[]>, merge = false) => {
      const ltos = new Map(favList.map((f) => [f.label, { bg: f.bg, fg: f.fg }]));
      const next: Record<string, Entry[]> = {};
      dateStrs.forEach((dateStr) => {
        const rows = byDate[dateStr] ?? [];
        next[dateStr] = rows.map((row) => entryFromRow(row, ltos));
      });
      setFavorites(favList);
      setEntriesByDate((prev) => (merge ? { ...prev, ...next } : next));
    };

    const cached = getEntriesCache(cacheKey) as Record<string, DbRow[]> | null;
    const cachedFavs = getEntriesCache(favsKey) as FavoriteItem[] | null;
    const cachedLeistungen = getEntriesCache(leistKey) as string[] | null;
    const isTagMode = viewMode === "Tag";
    if (cached && cachedFavs && cachedLeistungen) {
      applyData(cachedFavs, cached, isTagMode);
      setLeistungen(cachedLeistungen);
      return;
    }

    Promise.all([
      fetchJson<FavoriteItem[]>(`/api/favorites?user=${encodeURIComponent(userSlug)}`, []),
      viewMode === "Jahr"
        ? fetchJson<Record<string, DbRow[]>>(`/api/entries?${datesParam}&user=${encodeURIComponent(userSlug)}`, {})
        : fetchJson<Record<string, DbRow[]>>(
            `/api/entries?dates=${encodeURIComponent(datesParam)}&user=${encodeURIComponent(userSlug)}`,
            {}
          ),
      fetchJson<string[]>("/api/leistungen", []),
      fetchJson<string[]>(`/api/recent-labels?user=${encodeURIComponent(userSlug)}`, []),
    ]).then(([favs, byDateRaw, leistungenRaw, recentRaw]) => {
      const favList = (favs ?? []) as FavoriteItem[];
      const byDate = (byDateRaw ?? {}) as Record<string, DbRow[]>;
      const leistList = Array.isArray(leistungenRaw) ? leistungenRaw : [];
      const recentList = Array.isArray(recentRaw) ? recentRaw : [];
      setEntriesCache(favsKey, favList);
      setEntriesCache(cacheKey, byDate);
      setEntriesCache(leistKey, leistList);
      applyData(favList, byDate, isTagMode);
      setLeistungen(leistList);
      setRecentLabels(recentList);
    });
  }, [todayDateStr, weeks, userSlug, viewMode, displayedYear]);

  const savedEntriesForToday = entriesByDate[todayDateStr] ?? [];
  const entriesByDay = useMemo(() => {
    const base: Record<string, Entry[]> = {};
    if (viewMode === "Jahr") {
      getDateStrsForYear(displayedYear).forEach((dateStr) => {
        base[dateStr] = entriesByDate[dateStr] ?? [];
      });
    } else {
      weeks.flat().forEach((cell) => {
        base[cell.dateStr] = entriesByDate[cell.dateStr] ?? [];
      });
    }
    const live: Entry[] = isRunning && startTimeFormatted ? [{ text: startTimeFormatted, ...CHIP_STYLE_LIVE }] : [];
    base[todayDateStr] = [...(base[todayDateStr] ?? []), ...live];
    return base;
  }, [weeks, todayDateStr, entriesByDate, isRunning, startTimeFormatted, viewMode, displayedYear]);

  const todayTotalHours = useMemo(() => {
    const sum = savedEntriesForToday.reduce((acc, e) => {
      if (!e.startTime || !e.endTime) return acc;
      return acc + effectiveHoursForDisplay(e.startTime, e.endTime, e.text);
    }, 0);
    return Math.round(sum * 10) / 10;
  }, [savedEntriesForToday]);

  const sollPerDay = getSollPerDay(targetHoursPerWeek);

  const getHours = useCallback(
    (dateStr: string) => {
      const ist = dateStr === todayDateStr ? todayTotalHours : (() => {
        const entries = entriesByDay[dateStr] ?? [];
        return entries.reduce((acc, e) => {
          if (!e.startTime || !e.endTime) return acc;
          return acc + effectiveHoursForDisplay(e.startTime, e.endTime, e.text);
        }, 0);
      })();
      const istRounded = Math.round(ist * 10) / 10;
      const isWorkday = !isWeekend(dateStr);
      if (!isWorkday) {
        if (istRounded === 0) return "0 h";
        return `${formatHoursDecimal(istRounded)} h`;
      }
      return `Ist ${formatHoursDecimal(istRounded)} / Soll ${formatHoursDecimal(sollPerDay, 1)} h`;
    },
    [todayDateStr, todayTotalHours, entriesByDay, isWeekend, targetHoursPerWeek, sollPerDay]
  );

  const periodLabel = useMemo(() => {
    if (viewMode === "Tag") return getDayLabel(displayedDateStr, todayDateStr);
    if (viewMode === "Woche") return `KW ${getISOWeekNumber(weekStartMonday)} | ${getWeekLabel(weekStartMonday)}`;
    if (viewMode === "Jahr") return getYearLabel(displayedYear);
    if (viewMode === "Liste") return `Liste ${getMonthLabel(displayedYear, displayedMonth)}`;
    return getMonthLabel(displayedYear, displayedMonth);
  }, [viewMode, displayedDateStr, todayDateStr, weekStartMonday, displayedYear, displayedMonth]);

  const projectOptions = useMemo(
    () => sortOptionsByRecent(leistungen.length > 0 ? leistungen : [...LEISTUNG_OPTIONS], recentLabels),
    [leistungen, recentLabels]
  );
  const ticketOptions = useMemo(() => {
    const fromDb = recentLabels.filter((l) => extractJiraTicketId(l) !== null);
    const base = [...new Set([...fromDb, ...TICKET_OPTIONS])];
    return sortOptionsByRecent(base, recentLabels);
  }, [recentLabels]);

  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) {
      setSearchTerms([]);
      return;
    }
    setSearchTerms([q]);
  }, [searchTerm]);

  const aiQueryRef = useRef<string>("");
  useEffect(() => {
    const q = searchTerm.trim();
    if (!q || projectOptions.length === 0) return;
    aiQueryRef.current = q;
    const tid = setTimeout(async () => {
      const requestedQ = aiQueryRef.current;
      try {
        const result = await suggestLeistung({ query: requestedQ, options: projectOptions });
        if (result) {
          const { label } = result;
          if (label && label.toLowerCase() !== requestedQ.toLowerCase()) {
            setSearchTerms((prev) => {
              if (prev[0] !== requestedQ) return prev;
              const next = new Set(prev);
              next.add(label);
              return [...next];
            });
          }
        }
      } catch {}
    }, 500);
    return () => clearTimeout(tid);
  }, [searchTerm, projectOptions]);

  const { weekTotals, periodTotalLabel, overtimeGesamt } = useMemo(() => {
    const isInDisplayedMonth = (dateStr: string) => {
      const [y, m] = dateStr.split("-").map(Number);
      return y === displayedYear && m === displayedMonth;
    };
    const sumHours = (dateStrs: string[]) =>
      dateStrs.reduce((acc, ds) => {
        const entries = entriesByDay[ds] ?? [];
        return (
          acc +
          entries.reduce((a, e) => {
            if (!e.startTime || !e.endTime) return a;
            return a + effectiveHoursForDisplay(e.startTime, e.endTime, e.text);
          }, 0)
        );
      }, 0);
    const fmt = formatHoursDecimal;
    const dev = (h: number) => {
      const d = h - targetHoursPerWeek;
      if (d === 0) return "+ 0 h";
      return d > 0 ? `+ ${fmt(d)} h` : `- ${fmt(-d)} h`;
    };
    const weekTotals = weeks.map((w) => {
      const h = sumHours(w.map((c) => c.dateStr));
      return {
        total: `Ist ${fmt(h)} / Soll ${fmt(targetHoursPerWeek, 1)} h`,
        deviation: dev(h),
      };
    });
    const periodDateStrs =
      viewMode === "Tag"
        ? [displayedDateStr]
        : viewMode === "Woche"
          ? weeks.flat().map((c) => c.dateStr)
          : viewMode === "Jahr"
            ? getDateStrsForYear(displayedYear)
            : weeks.flat().map((c) => c.dateStr).filter(isInDisplayedMonth);
    const periodHours = sumHours(periodDateStrs);
    const sollPerDayVal = getSollPerDay(targetHoursPerWeek);
    const periodSoll =
      viewMode === "Tag"
        ? isWeekend(displayedDateStr) ? 0 : sollPerDayVal
        : viewMode === "Woche"
          ? targetHoursPerWeek
          : viewMode === "Jahr"
            ? 52 * targetHoursPerWeek
            : (() => {
                const weeksInMonth = weeks.filter((w) => w.some((c) => isInDisplayedMonth(c.dateStr))).length;
                let target = weeksInMonth * targetHoursPerWeek;
                const ferienHours = periodDateStrs.reduce((acc, ds) => {
                  const entries = entriesByDay[ds] ?? [];
                  return (
                    acc +
                    entries.reduce((a, e) => {
                      if ((e.text === "Ferien" || e.text === "Krankheit") && e.startTime && e.endTime) {
                        return a + effectiveHoursForDisplay(e.startTime, e.endTime, e.text);
                      }
                      return a;
                    }, 0)
                  );
                }, 0);
                return target - ferienHours;
              })();
    const periodTotalLabel =
      viewMode === "Tag"
        ? periodSoll > 0
          ? `Tag: Ist ${fmt(periodHours, 2)} / Soll ${fmt(periodSoll, 1)} h`
          : `Tag: Ist ${fmt(periodHours, 2)} h`
        : viewMode === "Woche"
          ? `Woche: Ist ${fmt(periodHours, 2)} / Soll ${fmt(targetHoursPerWeek, 1)} h`
          : viewMode === "Jahr"
            ? `Jahr: Ist ${fmt(periodHours, 2)} / Soll ${fmt(periodSoll, 1)} h`
            : `Monat: Ist ${fmt(periodHours, 2)} / Soll ${fmt(periodSoll, 1)} h`;
    const totalDeviation =
      viewMode === "Woche"
        ? periodHours - targetHoursPerWeek
        : (() => {
            const weeksInMonth = weeks.filter((w) => w.some((c) => isInDisplayedMonth(c.dateStr))).length;
            let target = weeksInMonth * targetHoursPerWeek;
            const ferienHours = periodDateStrs.reduce((acc, ds) => {
              const entries = entriesByDay[ds] ?? [];
              return (
                acc +
                entries.reduce((a, e) => {
                  if ((e.text === "Ferien" || e.text === "Krankheit") && e.startTime && e.endTime) {
                    return a + effectiveHoursForDisplay(e.startTime, e.endTime, e.text);
                  }
                  return a;
                }, 0)
              );
            }, 0);
            target -= ferienHours;
            return periodHours - target;
          })();
    let overtimeGesamt = "";
    if (viewMode === "Monat") {
      if (totalDeviation === 0) overtimeGesamt = "Überzeit gesamt. + 0 h";
      else if (totalDeviation > 0) overtimeGesamt = `Überzeit gesamt. + ${fmt(totalDeviation, 2)} h`;
      else overtimeGesamt = `Unterzeit gesamt. - ${fmt(-totalDeviation, 2)} h`;
    }
    return { weekTotals, periodTotalLabel, overtimeGesamt };
  }, [entriesByDay, weeks, displayedYear, displayedMonth, displayedDateStr, viewMode, targetHoursPerWeek]);

  const closeStopModal = useCallback(() => {
    setStopModalOpen(false);
    setFromDetailsWhileRunning(false);
    setOpenFromFab(false);
    setEditingEntry(null);
    setAddEntryPrefill(null);
    setAcceptedSuggestionId(null);
  }, []);

  const handleStopModalCancel = useCallback(() => {
    if (!fromDetailsWhileRunning && !openFromFab && !editingEntry) stop(true);
    closeStopModal();
  }, [fromDetailsWhileRunning, openFromFab, editingEntry, stop, closeStopModal]);

  const handleStopModalDeleteSuggestion = useCallback(async () => {
    if (acceptedSuggestionId) {
      await removeSuggestion(acceptedSuggestionId);
      setSuggestions((prev) => prev.filter((s) => s.id !== acceptedSuggestionId));
    }
    closeStopModal();
  }, [acceptedSuggestionId, closeStopModal]);

  const handleStopModalDelete = useCallback(
    async (entryId: string) => {
      const payload = editingEntry ? { ...editingEntry, id: entryId } : null;
      const dateStr = modalDateStr;
      if (await deleteEntry(entryId)) {
        clearEntriesCache();
        setEntriesByDate((prev) => ({
          ...prev,
          [dateStr]: (prev[dateStr] ?? []).filter((e) => e.id !== entryId),
        }));
        if (payload?.startTime && payload?.endTime && payload?.label) {
          showDeletedToast(
            { label: payload.label, startTime: payload.startTime, endTime: payload.endTime },
            async () => {
              const row = await postEntry({
                date: dateStr,
                start_time: payload.startTime,
                end_time: payload.endTime,
                label: payload.label,
                comment: payload.comment ?? "",
                is_billable: payload.isBillable !== false,
                user_slug: userSlug,
              });
              if (row) {
                clearEntriesCache();
                const restored = entryFromRow(row, labelToStyle);
                setEntriesByDate((prev) => ({
                  ...prev,
                  [dateStr]: [...(prev[dateStr] ?? []), restored],
                }));
              }
            }
          );
        }
      }
      closeStopModal();
    },
    [editingEntry, modalDateStr, userSlug, labelToStyle, showDeletedToast, closeStopModal]
  );

  const handleStopModalConfirm = useCallback(
    async (
      payload: EntryPayload,
      options?: { savedWhileRunning?: boolean; barPrefillToKeep?: { project: string | null; ticket: string | null; comment: string } }
    ) => {
      if (options?.savedWhileRunning) {
        if (options.barPrefillToKeep) {
          setInlineProject(options.barPrefillToKeep.project);
          setInlineTicket(options.barPrefillToKeep.ticket);
          setInlineComment(options.barPrefillToKeep.comment);
        }
        closeStopModal();
        return;
      }
      if (payload.id) {
        const row = await patchEntry(payload.id, {
          start_time: payload.startTime,
          end_time: payload.endTime,
          label: payload.label,
          comment: payload.comment,
          is_billable: payload.isBillable,
        });
        if (row) {
          clearEntriesCache();
          setEntriesByDate((prev) => ({
            ...prev,
            [modalDateStr]: (prev[modalDateStr] ?? []).map((e) =>
              e.id === payload.id ? entryFromRow(row, labelToStyle) : e
            ),
          }));
          const label = payload.label?.trim();
          if (label) setRecentLabels((prev) => [label, ...prev.filter((l) => l !== label)]);
        }
      } else {
        const row = await postEntry({
          date: modalDateStr,
          start_time: payload.startTime,
          end_time: payload.endTime,
          label: payload.label,
          comment: payload.comment,
          is_billable: payload.isBillable,
          user_slug: userSlug,
        });
        if (row) {
          clearEntriesCache();
          setEntriesByDate((prev) => ({
            ...prev,
            [modalDateStr]: [...(prev[modalDateStr] ?? []), entryFromRow(row, labelToStyle)],
          }));
          const label = payload.label?.trim();
          if (label) setRecentLabels((prev) => [label, ...prev.filter((l) => l !== label)]);
          if (acceptedSuggestionId) {
            await removeSuggestion(acceptedSuggestionId);
            setSuggestions((prev) => prev.filter((s) => s.id !== acceptedSuggestionId));
          }
        }
        if (!openFromFab && !options?.savedWhileRunning) stop(true);
      }
      closeStopModal();
    },
    [modalDateStr, userSlug, labelToStyle, openFromFab, stop, closeStopModal, acceptedSuggestionId]
  );

  const handleEntryClick = useCallback(
    (entry: Entry, dateStr: string) => {
      if (!entry.id) return;
      setFromDetailsWhileRunning(false);
      setModalDateStr(dateStr);
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
    },
    []
  );

  const handleEntryDelete = useCallback(
    async (entry: Entry, dateStr: string) => {
      if (!entry.id) return;
      const toRestore = { ...entry, dateStr };
      if (await deleteEntry(entry.id)) {
        clearEntriesCache();
        setEntriesByDate((prev) => ({
          ...prev,
          [dateStr]: (prev[dateStr] ?? []).filter((e) => e.id !== entry.id),
        }));
        if (toRestore.startTime && toRestore.endTime && toRestore.text) {
          showDeletedToast(
            { label: toRestore.text, startTime: toRestore.startTime, endTime: toRestore.endTime },
            async () => {
              const row = await postEntry({
                date: toRestore.dateStr,
                start_time: toRestore.startTime,
                end_time: toRestore.endTime,
                label: toRestore.text,
                comment: toRestore.comment ?? "",
                is_billable: toRestore.isBillable !== false,
                user_slug: userSlug,
              });
              if (row) {
                clearEntriesCache();
                const restored = entryFromRow(row, labelToStyle);
                setEntriesByDate((prev) => ({
                  ...prev,
                  [toRestore.dateStr]: [...(prev[toRestore.dateStr] ?? []), restored],
                }));
              }
            }
          );
        }
      }
    },
    [userSlug, labelToStyle, showDeletedToast]
  );

  const handleEntryMove = useCallback(
    async (entry: Entry, fromDateStr: string, toDateStr: string, newStartTime: string, newEndTime: string) => {
      if (!entry.id) return;
      const row = await patchEntry(entry.id, {
        date: toDateStr,
        start_time: newStartTime,
        end_time: newEndTime,
      });
      if (row) {
        clearEntriesCache();
        const updated = entryFromRow(row, labelToStyle);
        setEntriesByDate((prev) => {
          const next = { ...prev };
          next[fromDateStr] = (next[fromDateStr] ?? []).filter((e) => e.id !== entry.id);
          next[toDateStr] = [...(next[toDateStr] ?? []), updated];
          return next;
        });
      }
    },
    [labelToStyle]
  );

  const handleEntryCopy = useCallback(
    async (entry: Entry, dateStr: string) => {
      if (!entry.startTime || !entry.endTime) return;
      const row = await postEntry({
        date: dateStr,
        start_time: entry.startTime,
        end_time: entry.endTime,
        label: entry.text,
        comment: entry.comment ?? "",
        is_billable: entry.isBillable !== false,
        user_slug: userSlug,
      });
      if (row) {
        clearEntriesCache();
        setEntriesByDate((prev) => ({
          ...prev,
          [dateStr]: [...(prev[dateStr] ?? []), entryFromRow(row, labelToStyle)],
        }));
      }
    },
    [userSlug, labelToStyle]
  );

  const handleAddEntry = useCallback((dateStr: string, prefill?: { startTime: string; endTime: string; project?: string }) => {
    setModalDateStr(dateStr);
    setAddEntryPrefill(prefill ?? null);
    setOpenFromFab(true);
    setStopModalOpen(true);
  }, []);

  const closeSendToMemberModal = useCallback(() => {
    setSendToMemberOpen(false);
    setSendToMemberEntry(null);
    setSendToMemberDateStr(null);
  }, []);

  const handleEntrySendToMember = useCallback((entry: Entry, dateStr: string) => {
    setSendToMemberEntry(entry);
    setSendToMemberDateStr(dateStr);
    setSendToMemberOpen(true);
  }, []);

  const handleOpenSendToMember = useCallback((entry: Entry, dateStr: string) => {
    setSendToMemberEntry(entry);
    setSendToMemberDateStr(dateStr);
    setSendToMemberOpen(true);
  }, []);

  const handleSendToMemberConfirm = useCallback(
    async (targetUserSlugs: string[]) => {
      if (!sendToMemberEntry || !sendToMemberDateStr || targetUserSlugs.length === 0) return;
      const sourceName = USER_OPTIONS.find((o) => userToSlug(o) === userSlug) ?? "Unbekannt";
      for (const targetUserSlug of targetUserSlugs) {
        const sug = createSuggestionFromEntry(
          sendToMemberEntry,
          sendToMemberDateStr,
          targetUserSlug,
          sourceName
        );
        await addSuggestion(sug);
      }
      if (targetUserSlugs.includes(userSlug)) {
        fetchSuggestionsForUser(userSlug).then(setSuggestions);
      }
      setSendToMemberOpen(false);
      setSendToMemberEntry(null);
      setSendToMemberDateStr(null);
      const n = targetUserSlugs.length;
      const names = getSendToMemberOptions(userSlug)
        .filter((o) => targetUserSlugs.includes(o.slug))
        .map((o) => o.name)
        .join(", ");
      showSuccessToast(n === 1 ? `Vorschlag an ${names} gesendet` : `Vorschlag an ${n} Personen gesendet`);
    },
    [sendToMemberEntry, sendToMemberDateStr, userSlug, showSuccessToast]
  );

  const handleSuggestionAccept = useCallback(
    (id: string) => {
      const sug = suggestions.find((s) => s.id === id);
      if (!sug) return;
      const dateStr = sug.dateStr ?? todayDateStr;
      const startTime = sug.startTime ?? "08:00";
      const endTime =
        sug.endTime ??
        timeFromMinutes(minutesFromMidnight(startTime) + Math.round(sug.durationHours * 60));
      setAcceptedSuggestionId(id);
      setModalDateStr(dateStr);
      const ticketId = extractJiraTicketId(sug.projectLabel);
      const isTicketOnly = ticketId !== null && sug.projectLabel.trim() === ticketId;
      setAddEntryPrefill({
        startTime,
        endTime,
        project: isTicketOnly ? undefined : sug.projectLabel,
        ticket: isTicketOnly ? ticketId : undefined,
      });
      setOpenFromFab(true);
      setEditingEntry(null);
      setStopModalOpen(true);
    },
    [suggestions, todayDateStr]
  );

  const handleSuggestionReject = useCallback(async (id: string) => {
    await removeSuggestion(id);
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleOverviewGenerate = useCallback(() => {
    generateMonatsjournalPdf({
      year: displayedYear,
      month: displayedMonth,
      userSlug,
      userName: currentUser,
      entriesByDate,
      targetHoursPerWeek,
    });
  }, [displayedYear, displayedMonth, userSlug, currentUser, entriesByDate, targetHoursPerWeek]);

  const handleAddEntryClick = useCallback((dateStr?: string) => {
    const targetDate = dateStr ?? todayDateStr;
    setFromDetailsWhileRunning(false);
    setModalDateStr(targetDate);
    setOpenFromFab(true);
    setStopModalOpen(true);
    const dayEntries = entriesByDate[targetDate] ?? [];
    const withEnd = dayEntries.filter((x) => x.endTime);
    let startTime = "08:00";
    let endTime = "09:00";
    if (withEnd.length > 0) {
      const last = withEnd.reduce((a, b) => {
        const [ah, am] = (a.endTime ?? "00:00").split(":").map(Number);
        const [bh, bm] = (b.endTime ?? "00:00").split(":").map(Number);
        return (ah * 60 + am) >= (bh * 60 + bm) ? a : b;
      });
      const [h, m] = (last.endTime ?? "00:00").split(":").map(Number);
      const endM = (h ?? 0) * 60 + (m ?? 0);
      const startM = endM;
      const newEndM = Math.min(24 * 60 - 15, startM + 60);
      startTime = `${String(Math.floor(startM / 60)).padStart(2, "0")}:${String(startM % 60).padStart(2, "0")}`;
      endTime = `${String(Math.floor(newEndM / 60)).padStart(2, "0")}:${String(newEndM % 60).padStart(2, "0")}`;
    }
    setAddEntryPrefill({ startTime, endTime });
  }, [todayDateStr, entriesByDate]);

  return {
    todayDateStr,
    userSlug,
    displayedYear,
    displayedMonth,
    viewMode,
    weekStartMonday,
    displayedDateStr,
    entriesByDate,
    favorites,
    leistungen,
    recentLabels,
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
    targetHoursPerWeek,
    isRunning,
    elapsed,
    startTimeFormatted,
    weeks,
    labelToStyle,
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
    setAddEntryPrefill,
    setModalDateStr,
    setEditingEntry,
    setInlineProject,
    setInlineTicket,
    setInlineComment,
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
    clearEntriesCache,
    entryContextMenu,
    setEntryContextMenu,
    cancelEntryContextMenuClose,
    scheduleEntryContextMenuClose,
  };
}
