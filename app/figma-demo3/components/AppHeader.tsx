export function AppHeader() {
  return (
    <header className="bg-[var(--figma-bw-white)] border-b border-[var(--figma-neutral-85)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded text-white text-xs font-bold shrink-0 bg-[var(--figma-primary)]">
            LE
          </div>
          <button type="button" className="p-2 -ml-1 rounded hover:bg-[var(--figma-neutral-90)]" aria-label="Menü" style={{ color: "var(--figma-neutral-40)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="font-semibold truncate" style={{ color: "var(--figma-bw-black)", fontSize: "var(--figma-16)" }}>Leistungserfassung</h1>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm font-semibold whitespace-nowrap" style={{ color: "var(--figma-bw-black)" }}>Heute, 8.12.2025</span>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-[var(--figma-neutral-97)]">
            <span className="text-sm tabular-nums font-medium" style={{ color: "var(--figma-bw-black)" }}>0:00:00</span>
            <button type="button" className="p-1.5 rounded hover:opacity-80" aria-label="Start" style={{ color: "var(--figma-primary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <button type="button" className="p-1.5 rounded hover:opacity-80" aria-label="Stopp" style={{ color: "var(--figma-neutral-70)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0" style={{ color: "var(--figma-neutral-32)", fontSize: 14 }}>
          <span>Ana Silva ▾</span>
          <span>Deutsch ▾</span>
          <button type="button" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-[var(--figma-neutral-90)] hover:opacity-90" style={{ color: "var(--figma-bw-black)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
            Übersicht generieren ▾
          </button>
        </div>
      </div>
    </header>
  );
}
