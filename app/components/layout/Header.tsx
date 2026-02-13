export function Header() {
  return (
    <header className="h-12 bg-[var(--figma-bw-white)] border-b border-[var(--figma-neutral-85)] px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button type="button" className="p-2 -ml-2 rounded hover:bg-[var(--figma-neutral-90)]" aria-label="Menü" style={{ color: "var(--figma-bw-black)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="font-bold truncate" style={{ color: "var(--figma-primary)", fontSize: 16 }}>Leistungserfassung</h1>
      </div>
      <div className="flex items-center justify-end gap-4 shrink-0" style={{ color: "var(--figma-bw-black)" }}>
        <span style={{ fontSize: 14, fontWeight: 400 }}>Ana Silva ▾</span>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Deutsch ▾</span>
      </div>
    </header>
  );
}
