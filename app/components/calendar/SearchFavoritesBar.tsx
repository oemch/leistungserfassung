"use client";

import { Search, Pencil } from "lucide-react";
import type { FavoriteItem } from "@/lib/types";

interface SearchFavoritesBarProps {
  favorites: FavoriteItem[];
  onEditClick?: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SearchFavoritesBar({
  favorites,
  onEditClick,
  searchTerm,
  onSearchChange,
}: SearchFavoritesBarProps) {
  const list = favorites;

  const handleDragStart = (e: React.DragEvent, fav: FavoriteItem) => {
    e.dataTransfer.setData("application/x-favorite", JSON.stringify({ label: fav.label, bg: fav.bg, fg: fav.fg }));
    e.dataTransfer.effectAllowed = "copy";
  };
  const handleDragEnd = () => {
    window.dispatchEvent(new CustomEvent("favorite-drag-end"));
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 border w-80 bg-white border-neutral-85 text-sm">
        <Search size={16} aria-hidden className="shrink-0 text-neutral-40" />
        <input
          type="search"
          placeholder="Einträge suchen…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-transparent outline-none min-w-0 text-ink placeholder:text-neutral-40"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {list.length === 0 ? (
          onEditClick ? (
            <button
              type="button"
              className="h-7 text-sm px-3 rounded border border-primary text-primary bg-white hover:opacity-80 transition-opacity inline-flex items-center justify-center"
              onClick={onEditClick}
            >
              Favoriten hinzufügen
            </button>
          ) : null
        ) : (
          <>
            <span className="text-sm font-medium mr-1 shrink-0 text-ink">Favoriten</span>
            {list.slice(0, 7).map((f) => (
              <span
                key={f.id ?? f.label}
                draggable
                onDragStart={(e) => handleDragStart(e, f)}
                onDragEnd={handleDragEnd}
                className="text-xs px-2.5 rounded whitespace-nowrap h-7 inline-flex items-center justify-center cursor-grab active:cursor-grabbing"
                style={{ backgroundColor: f.bg, color: "#00271D", borderRadius: 4 }}
                title={`${f.label} – in Kalender ziehen`}
              >
                {f.label}
              </span>
            ))}
            <button
              type="button"
              className="w-7 h-7 inline-flex items-center justify-center rounded border border-neutral-85 text-ink bg-white hover:opacity-80 transition-opacity"
              aria-label="Favoriten bearbeiten"
              onClick={onEditClick}
            >
              <Pencil size={16} aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
