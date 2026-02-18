"use client";

import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { useCombobox } from "@/hooks/useCombobox";

export interface AiSuggestResult {
  label: string;
  startTime?: string;
  endTime?: string;
}

interface ComboboxProps {
  value: string | null;
  onChange: (value: string | null) => void;
  options: readonly string[];
  placeholder: string;
  disabled?: boolean;
  allowEmpty?: boolean;
  ariaLabel?: string;
  compact?: boolean;
  /** Mobile: Größere Touch-Targets für Optionen */
  touchFriendly?: boolean;
  className?: string;
  onAiSuggestRequest?: (query: string) => Promise<AiSuggestResult | null>;
  onAiSuggestionSelect?: (result: AiSuggestResult) => void;
  dropdownInPortal?: boolean;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  allowEmpty = true,
  ariaLabel,
  compact = false,
  touchFriendly = false,
  className = "",
  onAiSuggestRequest,
  onAiSuggestionSelect,
  dropdownInPortal = false,
}: ComboboxProps) {
  const {
    isOpen,
    inputValue,
    highlightIndex,
    containerRef,
    inputRef,
    optionRefs,
    dropdownRef,
    dropdownRect,
    filtered,
    displayValue,
    showPlaceholder,
    listItems,
    allowEmpty: allowEmptyVal,
    hasAiSuggestions,
    aiSuggestions,
    aiLoading,
    handleFocus,
    handleInputChange,
    handleSelect,
    handleAiSelect,
    handleKeyDown,
  } = useCombobox({
    value,
    onChange,
    options,
    disabled,
    allowEmpty,
    onAiSuggestRequest,
    onAiSuggestionSelect,
    dropdownInPortal,
  });

  const displayOptions = filtered;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={showPlaceholder ? placeholder : undefined}
        className={`w-full rounded-lg border border-neutral-85 pl-3 pr-9 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60 bg-white ${
          compact && !touchFriendly ? "py-1 text-sm" : touchFriendly ? "py-3 min-h-[48px] text-base" : "py-2"
        }`}
        style={{
          color: value ? "var(--color-ink)" : "var(--color-neutral-50)",
          fontSize: touchFriendly ? 16 : compact ? 14 : 18,
        }}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-autocomplete="list"
        role="combobox"
      />
      <span
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-50"
        aria-hidden
      >
        <ChevronDown size={16} strokeWidth={2} />
      </span>
      {isOpen && (() => {
        const dropdownContent = (
          <div
            ref={dropdownRef}
            className="rounded-lg border border-neutral-85 bg-white py-1 shadow-lg overflow-y-auto"
            style={{
              maxHeight: "17.5rem",
              ...(dropdownInPortal && dropdownRect
                ? {
                    position: "fixed" as const,
                    top: dropdownRect.top,
                    left: dropdownRect.left,
                    width: dropdownRect.width,
                    zIndex: 9999,
                  }
                : {}),
            }}
            role="listbox"
          >
            {allowEmptyVal && (
              <button
                ref={(el) => {
                  optionRefs.current[0] = el;
                }}
                type="button"
                role="option"
                aria-selected={value === null}
                onClick={() => handleSelect(null)}
                className={`w-full px-3 text-left hover:bg-neutral-97 ${highlightIndex === 0 ? "bg-neutral-97" : ""} ${touchFriendly ? "py-3 text-base text-neutral-40" : compact ? "py-2 text-neutral-40 text-sm" : "py-2 text-neutral-40 text-lg"}`}
              >
                — Nichts auswählen
              </button>
            )}
            {displayOptions.map((item, idx) => {
              const i = allowEmptyVal ? idx + 1 : idx;
              const aiResult = hasAiSuggestions ? aiSuggestions[idx] : null;
              return (
                <button
                  key={item}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={value === item}
                  onClick={() => (aiResult ? handleAiSelect(aiResult) : handleSelect(item))}
                  className={`w-full px-3 text-left hover:bg-neutral-97 ${highlightIndex === i ? "bg-neutral-97" : ""} ${touchFriendly ? "py-3 text-base" : compact ? "py-2 text-ink text-sm" : "py-2 text-ink text-lg"}`}
                >
                  {item}
                </button>
              );
            })}
            {displayOptions.length === 0 && inputValue.trim() && (
              <div className={`px-3 ${touchFriendly ? "py-3 text-base text-neutral-50" : compact ? "py-2 text-sm text-neutral-50" : "py-2 text-lg text-neutral-50"}`}>
                {aiLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                      aria-hidden
                    />
                    Suche…
                  </span>
                ) : (
                  <span className="italic">Keine Treffer</span>
                )}
              </div>
            )}
          </div>
        );
        return dropdownInPortal && typeof document !== "undefined"
          ? createPortal(dropdownContent, document.body)
          : (
            <div className="absolute left-0 right-0 top-full z-40 mt-1">
              {dropdownContent}
            </div>
          );
      })()}
    </div>
  );
}
