"use client";

import { useState, useEffect, useCallback } from "react";
import type { FavoriteItem } from "@/lib/types";

export const MAX_FAVORITES = 7;

export const PRESET_COLORS = [
  "#FFF5D6",
  "#E6DEF3",
  "#D5EEEB",
  "#FDE7E6",
  "#E1F2E2",
  "#E8F4F8",
  "#F5E6D3",
  "#E2F0E2",
  "#EFEEED",
];

export interface UseFavoritenModalProps {
  isOpen: boolean;
  favorites: FavoriteItem[];
  userSlug: string;
}

export function useFavoritenModal({ isOpen, favorites, userSlug }: UseFavoritenModalProps) {
  const [edited, setEdited] = useState<FavoriteItem[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newBg, setNewBg] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editBg, setEditBg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEdited([...favorites]);
      setNewLabel("");
      setNewBg(PRESET_COLORS[0]);
      setEditingId(null);
    }
  }, [isOpen, favorites]);

  const handleAdd = useCallback(async () => {
    const label = newLabel.trim();
    if (!label || edited.length >= MAX_FAVORITES) return;
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          bg: newBg,
          fg: "#00271D",
          sort_order: edited.length,
          user_slug: userSlug,
        }),
      });
      if (res.ok) {
        const row = await res.json();
        setEdited((prev) => [...prev, { id: row.id, label: row.label, bg: row.bg ?? newBg, fg: row.fg ?? "#00271D" }]);
        setNewLabel("");
        setNewBg(PRESET_COLORS[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [newLabel, newBg, edited.length, userSlug]);

  const handleUpdate = useCallback(
    async (id: string) => {
      const label = editLabel.trim();
      if (!label) return;
      try {
        const res = await fetch(`/api/favorites/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label, bg: editBg, user_slug: userSlug }),
        });
        if (res.ok) {
          const row = await res.json();
          setEdited((prev) => prev.map((f) => (f.id === id ? { ...f, label: row.label, bg: row.bg ?? editBg } : f)));
          setEditingId(null);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [editLabel, editBg, userSlug]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/favorites/${id}?user=${encodeURIComponent(userSlug)}`, { method: "DELETE" });
        if (res.ok) {
          setEdited((prev) => prev.filter((f) => f.id !== id));
          setEditingId(null);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [userSlug]
  );

  const startEdit = useCallback((f: FavoriteItem) => {
    setEditingId(f.id ?? null);
    setEditLabel(f.label);
    setEditBg(f.bg);
  }, []);

  const cancelEdit = useCallback(() => setEditingId(null), []);

  return {
    edited,
    newLabel,
    setNewLabel,
    newBg,
    setNewBg,
    editingId,
    editLabel,
    setEditLabel,
    editBg,
    setEditBg,
    handleAdd,
    handleUpdate,
    handleDelete,
    startEdit,
    cancelEdit,
  };
}
