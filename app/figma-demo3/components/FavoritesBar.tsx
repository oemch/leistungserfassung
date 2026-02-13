const FAVORITES = [
  { label: "Projekt A", bg: "var(--figma-purple-2)", fg: "#5b21b6" },
  { label: "Projekt B", bg: "var(--figma-turquoise-2)", fg: "#0f766e" },
  { label: "Projekt C", bg: "var(--figma-green-2)", fg: "#166534" },
  { label: "T-0000 Beschreibung", bg: "var(--figma-red-2)", fg: "#b91c1c" },
  { label: "T-99999 Beschreibungstext", bg: "var(--figma-green-2)", fg: "#166534" },
];

export function FavoritesBar() {
  return (
    <div className="bg-[var(--figma-bw-white)] border-b border-[var(--figma-neutral-85)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium mr-1" style={{ color: "var(--figma-neutral-32)" }}>Favoriten</span>
        {FAVORITES.map((f) => (
          <span key={f.label} className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: f.bg, color: f.fg }}>{f.label}</span>
        ))}
        <button type="button" className="p-1 rounded opacity-60 hover:opacity-100" aria-label="Favoriten bearbeiten" style={{ color: "var(--figma-neutral-40)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>
    </div>
  );
}
