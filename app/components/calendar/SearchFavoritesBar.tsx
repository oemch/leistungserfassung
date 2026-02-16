import { FAVORITEN } from "@/lib/constants";

export function SearchFavoritesBar() {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 border w-64 bg-[var(--figma-bw-white)] border-[var(--figma-neutral-85)] text-sm" style={{ color: "var(--figma-neutral-70)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input type="search" placeholder="Suchen" className="flex-1 bg-transparent outline-none placeholder:opacity-70" />
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <span className="text-sm font-medium mr-1" style={{ color: "#696561" }}>Favoriten</span>
        {FAVORITEN.map((f) => (
          <span
            key={f.label}
            className="text-xs px-2.5 rounded whitespace-nowrap h-7 inline-flex items-center justify-center"
            style={{ backgroundColor: f.bg, color: "#00271D", borderRadius: 4 }}
          >
            {f.label}
          </span>
        ))}
        <button type="button" className="p-0 inline-flex items-center justify-center opacity-60 hover:opacity-100 w-6 h-6" style={{ color: "var(--figma-neutral-40)" }} aria-label="Favoriten bearbeiten">
          <span className="material-icons" style={{ fontSize: 24, width: 24, height: 24 }} aria-hidden>edit</span>
        </button>
      </div>
    </div>
  );
}
