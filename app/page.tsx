import "./figma-demo3/figma-tokens.css";

const VIEWS = ["Tag", "Woche", "Monat", "Jahr"] as const;

const WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

/* Vorlage: A pastel purple, B pastel pink, C green, T-* pastel orange; Pills mit dezentem Rahmen */
const FAVORITEN = [
  { label: "Projekt A", bg: "var(--figma-purple-2)", fg: "#5b21b6" },
  { label: "Projekt B", bg: "var(--figma-red-2)", fg: "#b91c1c" },
  { label: "Projekt C", bg: "var(--figma-green-2)", fg: "#166534" },
  { label: "T-0000 Beschreibung", bg: "var(--figma-amber-2)", fg: "#92400e" },
  { label: "T-99999 Beschreibungstext", bg: "var(--figma-amber-2)", fg: "#92400e" },
];

// Demo-Einträge Februar 2026 (16.–29.) – Farben aus figma-demo3
const DEMO_ENTRIES: Record<string, { text: string; bg: string; fg: string }[]> = {
  "16": [
    { text: "A Code Review", bg: "var(--figma-amber-2)", fg: "#92400e" },
    { text: "B Besprechung mit Andrea...", bg: "var(--figma-purple-2)", fg: "#5b21b6" },
    { text: "C Feature 1234", bg: "var(--figma-green-2)", fg: "#166534" },
    { text: "Admin Aufgaben", bg: "var(--figma-neutral-90)", fg: "var(--figma-neutral-32)" },
  ],
  "17": [
    { text: "C Ticket 2445", bg: "var(--figma-green-2)", fg: "#166534" },
    { text: "C Ticket 6372", bg: "var(--figma-green-2)", fg: "#166534" },
    { text: "A Feedback umsetzen Tick...", bg: "var(--figma-amber-2)", fg: "#92400e" },
    { text: "Lernende betreuen", bg: "var(--figma-amber-2)", fg: "#92400e" },
  ],
  "18": [
    { text: "B Feature 8392", bg: "var(--figma-purple-2)", fg: "#5b21b6" },
    { text: "C Code Review", bg: "var(--figma-green-2)", fg: "#166534" },
    { text: "IS Schulung am Arbeitsplatz", bg: "var(--figma-neutral-90)", fg: "var(--figma-neutral-32)" },
  ],
  "19": [
    { text: "A Weekly im Team", bg: "var(--figma-amber-2)", fg: "#92400e" },
    { text: "B Meeting mit Sebastian W...", bg: "var(--figma-purple-2)", fg: "#5b21b6" },
    { text: "Mails lesen", bg: "var(--figma-neutral-90)", fg: "var(--figma-neutral-32)" },
    { text: "Updates", bg: "var(--figma-neutral-90)", fg: "var(--figma-neutral-32)" },
  ],
  "20": [
    { text: "A Feedback zu Ticket 2792...", bg: "var(--figma-amber-2)", fg: "#92400e" },
    { text: "Code Review", bg: "var(--figma-amber-2)", fg: "#92400e" },
    { text: "Support", bg: "var(--figma-amber-2)", fg: "#92400e" },
    { text: "Admin Aufgaben", bg: "var(--figma-neutral-90)", fg: "var(--figma-neutral-32)" },
  ],
  "24": [
    { text: "C Ticket 2445", bg: "var(--figma-green-2)", fg: "#166534" },
    { text: "B Besprechung", bg: "var(--figma-turquoise-2)", fg: "#0f766e" },
  ],
};

function CalendarDay({
  day,
  month,
  isToday,
  isWeekend,
  entries,
  hours,
}: {
  day: number;
  month: number;
  isToday: boolean;
  isWeekend: boolean;
  entries: { text: string; bg: string; fg: string }[];
  hours: string;
}) {
  const isFrei = isWeekend && entries.length === 0;
  return (
    <div
      className={`rounded-lg border p-3 w-full min-w-0 h-[336px] flex flex-col box-border ${
        isToday
          ? "border-[var(--figma-primary)] bg-[color-mix(in_srgb,var(--figma-primary)_8%,white)]"
          : "border-[var(--figma-neutral-85)] bg-[var(--figma-bw-white)]"
      }`}
    >
      <div className="flex justify-between text-sm font-medium mb-2" style={{ color: "var(--figma-neutral-40)" }}>
        <span>{hours}</span>
        <span>{day}.{month}.</span>
      </div>
      <div className="flex flex-col gap-1 overflow-hidden">
        {isFrei ? (
          <span className="text-sm" style={{ color: "var(--figma-neutral-70)" }}>Frei</span>
        ) : entries.length === 0 ? (
          isToday ? (
            <span
              style={{
                color: "var(--BW-Black, #100C08)",
                fontFamily: "var(--font-coop), Coop, sans-serif",
                fontSize: 14,
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "140%",
              }}
            >
              Es sind noch keine Einträge vorhanden.
            </span>
          ) : null
        ) : (
          entries.map((e, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded truncate block"
              style={{ backgroundColor: e.bg, color: e.fg }}
              title={e.text}
            >
              {e.text}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const daysWeek1 = [16, 17, 18, 19, 20, 21, 22];
  const daysWeek2 = [23, 24, 25, 26, 27, 28, 29];
  const month = 2;
  const isWeekend = (d: number) => d === 21 || d === 22 || d === 28 || d === 29;
  const getHours = (d: number) => {
    if (isWeekend(d)) return "0 Std.";
    if (d === 23) return "0 Std.";
    if (d >= 24 && d <= 27) return "8 Std.";
    return "8 Std.";
  };

  return (
    <div className="figma-demo3 min-h-screen" style={{ backgroundColor: "var(--figma-neutral-97)", color: "var(--figma-bw-black)" }}>
      {/* Header: nur Menü + Titel (grün) | Deutsch, Ana Silva (dunkel) */}
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

      {/* 2. Subheader: Heute-Datum (24px) | ~60px Abstand | Zähler + Icons (32px) | rechts: Übersicht generieren ▾ */}
      <div className="h-16 bg-[var(--figma-bw-white)] border-b border-[var(--figma-neutral-85)] px-6 flex items-center">
        <span className="shrink-0" style={{ color: "var(--figma-bw-black)", fontSize: 24, fontWeight: 400 }}>
          Heute, 23.2.2026
        </span>
        <div className="flex items-center gap-2 rounded-lg pl-4 pr-1 py-1 ml-[60px] bg-[var(--figma-neutral-97)]">
          <span
            className="tabular-nums"
            style={{
              color: "#B5B1AD",
              fontFamily: "var(--font-coop), var(--Font, Coop)",
              fontSize: 24,
              fontWeight: 400,
              fontStyle: "normal",
              lineHeight: "normal",
            }}
          >
            0:00:00
          </span>
          <button type="button" className="p-1 rounded hover:opacity-80 flex shrink-0" style={{ color: "var(--figma-primary)" }} aria-label="Aufnahme starten">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
          </button>
          <button type="button" className="p-1 rounded hover:opacity-80 flex shrink-0" style={{ color: "var(--figma-neutral-70)" }} aria-label="Aufnahme stoppen">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
          </button>
        </div>
        <button type="button" className="ml-auto text-sm shrink-0 hover:opacity-80" style={{ color: "var(--figma-bw-black)", fontSize: 14, fontWeight: 400 }}>
          Übersicht generieren ▾
        </button>
      </div>

      <main className="w-full px-6 py-6">
        {/* 3. Datumsbereich: Februar 2026 linksbündig, Abstand wie Header/Heute */}
        {/* 4. Suche linksbündig, gleicher Abstand */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <h2 className="shrink-0" style={{ color: "var(--figma-bw-black)", fontSize: 22, fontWeight: 400 }}>
            Februar 2026
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-4">
            <span className="whitespace-nowrap" style={{ color: "var(--figma-bw-black)", fontSize: 22, fontWeight: 400 }}>
              Monat total: 123 Std. 13 Min.
            </span>
            <div className="flex items-center gap-1 h-9">
              <button
                type="button"
                className="h-full flex items-center justify-center px-2.5 hover:opacity-80 bg-[#FFF]"
                style={{ borderRadius: 8, border: "1.5px solid #B5B1AD" }}
                aria-label="Vorheriger Monat"
              >
                ←
              </button>
              <span
                className="h-full min-w-[140px] flex items-center justify-center px-3 text-center text-sm font-medium bg-[var(--figma-bw-white)]"
                style={{ borderRadius: 8, border: "1.5px solid #B5B1AD" }}
              >
                Februar 2026
              </span>
              <button
                type="button"
                className="h-full flex items-center justify-center px-2.5 hover:opacity-80 bg-[#FFF]"
                style={{ borderRadius: 8, border: "1.5px solid #B5B1AD" }}
                aria-label="Nächster Monat"
              >
                →
              </button>
            </div>
            <div
              className="inline-flex h-9 rounded-lg overflow-hidden border-[1.5px] border-[#B5B1AD]"
              style={{ borderRadius: 8 }}
              role="group"
              aria-label="Ansicht wählen"
            >
              {VIEWS.map((v) => (
                <button
                  key={v}
                  type="button"
                  className="h-full w-[75px] text-sm font-medium hover:opacity-90"
                  style={{
                    backgroundColor: v === "Monat" ? "var(--figma-primary)" : "var(--figma-bw-white)",
                    color: v === "Monat" ? "var(--figma-bw-white)" : "var(--figma-bw-black)",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Suche links, Favoriten rechts bündig – 48px Abstand zur Zeile darüber */}
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
                style={{ backgroundColor: f.bg, color: f.fg, borderRadius: 4 }}
              >
                {f.label}
              </span>
            ))}
            <button type="button" className="p-0 inline-flex items-center justify-center opacity-60 hover:opacity-100 w-6 h-6" style={{ color: "var(--figma-neutral-40)" }} aria-label="Favoriten bearbeiten">
              <span className="material-icons" style={{ fontSize: 24, width: 24, height: 24 }} aria-hidden>edit</span>
            </button>
          </div>
        </div>

        {/* 5. Kalender: bei grossem Viewport zentriert (max 246px/Kachel), sonst links + Scroll */}
        <div className="w-full max-w-[1854px] mx-auto overflow-x-auto min-w-0">
          <div
            className="grid gap-3 min-w-0"
            style={{
              gridTemplateColumns: "repeat(7, minmax(180px, 246px)) 72px",
              width: "100%",
              minWidth: "1404px",
            }}
          >
          {WOCHENTAGE.map((d) => (
            <div
              key={d}
              className="text-center py-1 whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
              style={{
                color: "var(--neutrals-32-grey-1, #55514D)",
                fontFamily: "Inter, sans-serif",
                fontSize: 20,
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "20px",
              }}
            >
              {d}
            </div>
          ))}
          <div />
          {daysWeek1.map((day) => (
            <CalendarDay
              key={day}
              day={day}
              month={month}
              isToday={day === 23}
              isWeekend={isWeekend(day)}
              entries={DEMO_ENTRIES[String(day)] ?? []}
              hours={getHours(day)}
            />
          ))}
          <div className="flex items-center justify-center text-sm font-medium" style={{ color: "var(--figma-neutral-40)" }}>
            40 Std. + 0 Std.
          </div>
          {daysWeek2.map((day) => (
            <CalendarDay
              key={day}
              day={day}
              month={month}
              isToday={day === 23}
              isWeekend={isWeekend(day)}
              entries={DEMO_ENTRIES[String(day)] ?? []}
              hours={getHours(day)}
            />
          ))}
          <div className="flex items-center justify-center text-sm font-medium" style={{ color: "var(--figma-neutral-40)" }}>
            0 Std. + 0 Std.
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
