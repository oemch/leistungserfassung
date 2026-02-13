"use client";

import { useState, useEffect, useCallback, useRef } from "react";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function useTimer(options?: { onStop?: (startTime: string) => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const onStopRef = useRef(options?.onStop);
  onStopRef.current = options?.onStop;

  const startTimeFormatted = startTime ? formatTime(startTime) : null;

  const start = useCallback(() => {
    if (intervalRef.current) return;
    pausedRef.current = false;
    const start = new Date();
    setStartTime(start);
    setElapsedSeconds(0);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    if (!pausedRef.current || intervalRef.current) return;
    pausedRef.current = false;
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stop = useCallback((skipOnStop?: boolean) => {
    pausedRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const startFormatted = startTime ? formatTime(startTime) : null;
    setIsRunning(false);
    if (!skipOnStop && startFormatted && onStopRef.current) {
      onStopRef.current(startFormatted);
    }
    setStartTime(null);
    setElapsedSeconds(0);
  }, [startTime]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    isRunning,
    elapsed: formatElapsed(elapsedSeconds),
    startTimeFormatted,
    start,
    pause,
    resume,
    stop,
  };
}
