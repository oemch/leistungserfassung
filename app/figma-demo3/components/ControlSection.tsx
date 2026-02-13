const VIEWS = ["Tag", "Woche", "Monat", "Jahr"] as const;

export function ControlSection() {
  return (
    <section className="bg-[var(--figma-bw-white)] border-b border-[var(--figma-neutral-85)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-semibold" style={{ color: "var(--figma-bw-black)", fontSize: 22 }}>Dezember 2025</h2>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 border w-48 max-w-full bg-[var(--figma-bw-white)] border-[var(--figma-neutral-85)]" style={{ color: "var(--figma-neutral-70)", fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="search" placeholder="Suchen" className="flex-1 bg-transparent outline-none placeholder:opacity-70" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold" style={{ color: "var(--figma-neutral-32)" }}>Monat Total: 40 Std. 13 Min.</span>
          <div className="flex items-center gap-2">
            <button type="button" className="p-2 rounded-lg border border-[var(--figma-neutral-80)] hover:bg-[var(--figma-neutral-97)]" aria-label="Vorheriger Monat">←</button>
            <span className="text-sm font-medium min-w-[120px] text-center" style={{ color: "var(--figma-neutral-40)" }}>Dezember 2025</span>
            <button type="button" className="p-2 rounded-lg border border-[var(--figma-neutral-80)] hover:bg-[var(--figma-neutral-97)]" aria-label="Nächster Monat">→</button>
          </div>
          <div className="flex gap-1">
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  v === "Monat" ? "text-white" : "hover:opacity-90"
                }`}
                style={{ backgroundColor: v === "Monat" ? "var(--figma-primary)" : "var(--figma-neutral-90)", color: v === "Monat" ? "var(--figma-bw-white)" : "var(--figma-neutral-32)" }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
