"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { normalizeForSearch } from "@/lib/entryUtils";

export interface AiSuggestResult {
  label: string;
  startTime?: string;
  endTime?: string;
}

export interface UseComboboxProps {
  value: string | null;
  onChange: (value: string | null) => void;
  options: readonly string[];
  disabled?: boolean;
  allowEmpty?: boolean;
  onAiSuggestRequest?: (query: string) => Promise<AiSuggestResult | null>;
  onAiSuggestionSelect?: (result: AiSuggestResult) => void;
  dropdownInPortal?: boolean;
}

export function useCombobox({
  value,
  onChange,
  options,
  disabled = false,
  allowEmpty = true,
  onAiSuggestRequest,
  onAiSuggestionSelect,
  dropdownInPortal = false,
}: UseComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestResult[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const filtered = !inputValue.trim()
    ? options
    : options.filter((o) => normalizeForSearch(o).includes(normalizeForSearch(inputValue)));

  useLayoutEffect(() => {
    if (dropdownInPortal && isOpen && containerRef.current) {
      const update = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setDropdownRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
        }
      };
      update();
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
        setDropdownRect(null);
      };
    }
    if (!isOpen) setDropdownRect(null);
  }, [dropdownInPortal, isOpen]);

  useEffect(() => {
    if (!onAiSuggestRequest || !inputValue.trim()) {
      setAiSuggestions([]);
      return;
    }
    if (filtered.length > 0) {
      setAiSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      setAiLoading(true);
      try {
        const result = await onAiSuggestRequest(inputValue.trim());
        setAiSuggestions(result ? [result] : []);
      } finally {
        setAiLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [inputValue, filtered.length, onAiSuggestRequest]);

  useEffect(() => {
    if (!isOpen) setAiSuggestions([]);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      const inContainer = containerRef.current?.contains(target);
      const inDropdown = dropdownInPortal && dropdownRef.current?.contains(target);
      if (!inContainer && !inDropdown) {
        setIsOpen(false);
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen, dropdownInPortal]);

  const handleFocus = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setInputValue(value ?? "");
    setHighlightIndex(-1);
    inputRef.current?.select();
  }, [disabled, value]);

  const handleSelect = useCallback(
    (opt: string | null) => {
      onChange(opt);
      setIsOpen(false);
      setInputValue("");
      setHighlightIndex(-1);
      setAiSuggestions([]);
    },
    [onChange]
  );

  const handleAiSelect = useCallback(
    (result: AiSuggestResult) => {
      onChange(result.label);
      onAiSuggestionSelect?.(result);
      setIsOpen(false);
      setInputValue("");
      setHighlightIndex(-1);
      setAiSuggestions([]);
    },
    [onChange, onAiSuggestionSelect]
  );

  const displayOptions = filtered.length > 0 ? filtered : aiSuggestions.map((s) => s.label);
  const hasAiSuggestions = aiSuggestions.length > 0;
  const listItems = allowEmpty ? [null as string | null, ...displayOptions] : displayOptions;
  const selectableCount = listItems.length;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        setIsOpen(false);
        setInputValue("");
        setHighlightIndex(-1);
        inputRef.current?.blur();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < selectableCount) {
          const item = listItems[highlightIndex];
          if (item === null) {
            handleSelect(null);
          } else if (hasAiSuggestions) {
            const aiResult = aiSuggestions.find((s) => s.label === item);
            if (aiResult) handleAiSelect(aiResult);
            else handleSelect(item);
          } else {
            handleSelect(item);
          }
        } else if (displayOptions.length > 0) {
          if (hasAiSuggestions && aiSuggestions[0]) {
            handleAiSelect(aiSuggestions[0]);
          } else {
            handleSelect(displayOptions[0]);
          }
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = highlightIndex < selectableCount - 1 ? highlightIndex + 1 : 0;
        setHighlightIndex(next);
        optionRefs.current[next]?.scrollIntoView({ block: "nearest" });
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = highlightIndex <= 0 ? selectableCount - 1 : highlightIndex - 1;
        setHighlightIndex(next);
        optionRefs.current[next]?.scrollIntoView({ block: "nearest" });
        return;
      }
    },
    [
      isOpen,
      highlightIndex,
      selectableCount,
      listItems,
      hasAiSuggestions,
      aiSuggestions,
      displayOptions,
      handleSelect,
      handleAiSelect,
    ]
  );

  const displayValue = isOpen ? inputValue : (value ?? "");
  const showPlaceholder = !isOpen && !value;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setHighlightIndex(-1);
      if (!isOpen) setIsOpen(true);
    },
    [isOpen, setHighlightIndex]
  );

  return {
    isOpen,
    setIsOpen,
    inputValue,
    highlightIndex,
    setInputValue,
    setHighlightIndex,
    containerRef,
    inputRef,
    optionRefs,
    dropdownRef,
    dropdownRect,
    filtered: displayOptions,
    displayValue,
    showPlaceholder,
    listItems,
    allowEmpty,
    hasAiSuggestions,
    aiSuggestions,
    aiLoading,
    handleFocus,
    handleInputChange,
    handleSelect,
    handleAiSelect,
    handleKeyDown,
  };
}
