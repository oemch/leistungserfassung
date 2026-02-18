"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Entry, EntryPayload } from "@/lib/types";
import { durationFromTimes, parseDurationHours, endTimeFromStartAndHours } from "@/lib/timeUtils";
import { getSuggestedStartFromEntries } from "@/lib/timeUtils";
import { extractJiraTicketId } from "@/lib/jira";

export interface UseStopModalFormProps {
  isOpen: boolean;
  openFromFab: boolean;
  addEntryPrefill: { startTime: string; endTime: string; project?: string; ticket?: string } | null;
  initialData: EntryPayload | null;
  barPrefill: { project: string | null; ticket: string | null; comment: string } | null;
  fromDetailsWhileRunning: boolean;
  startTimeFormatted: string | null;
  elapsed: string;
  entriesOnDate: Entry[];
  leistungen: string[];
  ticketOptions: string[];
  modalDateStr?: string;
onBarPrefillChange?: (prefill: { project: string | null; ticket: string | null; comment: string }) => void;
}

function useDerivedEndTime(startTimeFormatted: string | null, elapsed: string): string {
  if (!startTimeFormatted || !elapsed) return "--:--";
  const [h, m, s] = elapsed.split(":").map(Number);
  const totalMinutes = (h ?? 0) * 60 + (m ?? 0) + (s ?? 0) / 60;
  const [sh, sm] = startTimeFormatted.split(":").map(Number);
  let endM = (sm ?? 0) + totalMinutes;
  let endH = (sh ?? 0) + Math.floor(endM / 60);
  endM = endM % 60;
  return `${String(endH).padStart(2, "0")}:${String(Math.round(endM)).padStart(2, "0")}`;
}

export function useStopModalForm({
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
  ticketOptions,
  modalDateStr,
onBarPrefillChange,
}: UseStopModalFormProps) {
  const endTime = useDerivedEndTime(startTimeFormatted, elapsed);

  const entriesForSuggest = initialData?.id
    ? entriesOnDate.filter((e) => e.id !== initialData.id)
    : entriesOnDate;
  const suggestedStart = useMemo(
    () => getSuggestedStartFromEntries(entriesForSuggest),
    [entriesForSuggest]
  );

  const [comment, setComment] = useState("");
  const [isBillable, setIsBillable] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [durationInput, setDurationInput] = useState<string | null>(null);
  const [durationFocused, setDurationFocused] = useState(false);
  const hasInitializedDetailsRef = useRef(false);

  const durationDisplay =
    durationFocused && durationInput !== null ? durationInput : durationFromTimes(startInput, endInput);
  const canSave = !!(selectedProject || selectedTicket);

  useEffect(() => {
    if (!isOpen) {
      hasInitializedDetailsRef.current = false;
      return;
    }
    if (fromDetailsWhileRunning && hasInitializedDetailsRef.current) {
      return;
    }
    setDurationInput(null);
    setDurationFocused(false);
    if (initialData) {
      setComment(initialData.comment ?? "");
      setStartInput(initialData.startTime ?? "");
      setEndInput(initialData.endTime ?? "");
      setIsBillable(initialData.isBillable !== false);
      const label = initialData.label ?? "";
      const inLeistungen = leistungen.some((o) => o === label);
      const inTicketOptions = ticketOptions.some((o) => o === label);
      const isTicketPattern = extractJiraTicketId(label) !== null;
      setSelectedProject(inLeistungen ? label : null);
      setSelectedTicket(inTicketOptions || (isTicketPattern && !inLeistungen) ? label : null);
    } else if (openFromFab) {
      setComment("");
      setStartInput(addEntryPrefill?.startTime ?? "");
      setEndInput(addEntryPrefill?.endTime ?? "");
      const prefillLabel = addEntryPrefill?.project;
      const prefillTicket = addEntryPrefill?.ticket;
      if (prefillTicket) {
        setSelectedTicket(prefillTicket);
        setSelectedProject(null);
      } else if (prefillLabel) {
        if (ticketOptions.includes(prefillLabel)) {
          setSelectedTicket(prefillLabel);
          setSelectedProject(null);
        } else if (leistungen.includes(prefillLabel)) {
          setSelectedProject(prefillLabel);
          setSelectedTicket(null);
        } else {
          setSelectedProject(prefillLabel);
          setSelectedTicket(null);
        }
      } else {
        setSelectedProject(null);
        setSelectedTicket(null);
      }
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
    if (fromDetailsWhileRunning) {
      hasInitializedDetailsRef.current = true;
    }
  }, [
    isOpen,
    openFromFab,
    addEntryPrefill,
    initialData,
    barPrefill,
    startTimeFormatted,
    fromDetailsWhileRunning,
    endTime,
    leistungen,
    ticketOptions,
  ]);

  useEffect(() => {
    if (fromDetailsWhileRunning && onBarPrefillChange) {
      onBarPrefillChange({
        project: selectedProject,
        ticket: selectedTicket,
        comment,
      });
    }
  }, [fromDetailsWhileRunning, onBarPrefillChange, selectedProject, selectedTicket, comment]);

  useEffect(() => {
    if (isOpen && fromDetailsWhileRunning) {
      setEndInput(endTime);
    }
  }, [isOpen, fromDetailsWhileRunning, endTime]);

  useEffect(() => {
    if (!isOpen) {
      setComment("");
      setIsBillable(true);
      setSelectedProject(null);
      setSelectedTicket(null);
      setStartInput("");
      setEndInput("");
      setDurationInput(null);
      setDurationFocused(false);
    }
  }, [isOpen]);

  return {
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
    modalDateStr,
  };
}
