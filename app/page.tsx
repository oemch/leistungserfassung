const VIEWS = ["Tag", "Woche", "Monat", "Jahr"] as const;

const WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

const FAVORITEN = [
  { label: "Projekt A", color: "bg-amber-200 text-amber-900" },
  { label: "Projekt B", color: "bg-blue-200 text-blue-900" },
  { label: "Projekt C", color: "bg-emerald-200 text-emerald-900" },
  { label: "T-0000 Beschreibung", color: "bg-rose-200 text-rose-900" },
  { label: "T-99999 Beschreibungstext", color: "bg-emerald-200 text-emerald-900" },
];

// Demo-Einträge Februar 2026 (16.–29.)
const DEMO_ENTRIES: Record<string, { text: string; color: string }[]> = {
  "16": [
    { text: "A Code Review", color: "bg-amber-200 text-amber-900" },
    { text: "B Besprechung mit Andrea...", color: "bg-blue-200 text-blue-900" },
    { text: "C Feature 1234", color: "bg-emerald-200 text-emerald-900" },
    { text: "Admin Aufgaben", color: "bg-zinc-200 text-zinc-700" },
  ],
  "17": [
    { text: "C Ticket 2445", color: "bg-emerald-200 text-emerald-900" },
    { text: "C Ticket 6372", color: "bg-emerald-200 text-emerald-900" },
    { text: "A Feedback umsetzen Tick...", color: "bg-amber-200 text-amber-900" },
    { text: "Lernende betreuen", color: "bg-amber-200 text-amber-900" },
  ],
  "18": [
    { text: "B Feature 8392", color: "bg-violet-200 text-violet-900" },
    { text: "C Code Review", color: "bg-emerald-200 text-emerald-900" },
    { text: "IS Schulung am Arbeitsplatz", color: "bg-zinc-200 text-zinc-700" },
  ],
  "19": [
    { text: "A Weekly im Team", color: "bg-amber-200 text-amber-900" },
    { text: "B Meeting mit Sebastian W...", color: "bg-violet-200 text-violet-900" },
    { text: "Mails lesen", color: "bg-zinc-200 text-zinc-700" },
    { text: "Updates", color: "bg-zinc-200 text-zinc-700" },
  ],
  "20": [
    { text: "A Feedback zu Ticket 2792...", color: "bg-amber-200 text-amber-900" },
    { text: "Code Review", color: "bg-amber-200 text-amber-900" },
    { text: "Support", color: "bg-amber-200 text-amber-900" },
    { text: "Admin Aufgaben", color: "bg-zinc-200 text-zinc-700" },
  ],
  "24": [
    { text: "C Ticket 2445", color: "bg-emerald-200 text-emerald-900" },
    { text: "B Besprechung", color: "bg-blue-200 text-blue-900" },
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
  entries: { text: string; color: string }[];
  hours: string;
}) {
  const isFrei = isWeekend && entries.length === 0;
  return (
    <div
      className={`rounded-lg border p-3 min-h-[120px] flex flex-col min-w-0 ${
        isToday
          ? "border-emerald-500 bg-emerald-50/50"
          : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex justify-between text-sm font-medium text-zinc-600 mb-2">
        <span>{day}.{month}.</span>
        <span>{hours}</span>
      </div>
      <div className="flex flex-col gap-1 overflow-hidden">
        {isFrei ? (
          <span className="text-sm text-zinc-500">Frei</span>
        ) : entries.length === 0 ? (
          isToday ? (
            <span className="text-sm text-zinc-500 italic">Es sind noch keine Einträge vorhanden.</span>
          ) : null
        ) : (
          entries.map((e, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-0.5 rounded truncate block ${e.color}`}
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* 1. Header: Menü, Titel, Ana Silva, Sprachwahl */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" className="p-2 -ml-2 rounded hover:bg-zinc-100" aria-label="Menü">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="font-semibold text-emerald-600 text-lg">Leistungserfassung</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">Ana Silva ▾</span>
          <span className="text-sm text-zinc-600">Deutsch ▾</span>
        </div>
      </header>

      {/* 2. Subheader: Heute 23.02.2026, Aufzeichnung, Übersicht generieren */}
      <div className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between">
        <span className="text-sm text-zinc-600">Heute, 23.02.2026</span>
        <div className="flex items-center gap-2 bg-zinc-100 rounded-lg px-3 py-2">
          <span className="text-sm tabular-nums font-medium">0:00:00</span>
          <button type="button" className="p-1.5 text-emerald-600 rounded hover:bg-emerald-100" aria-label="Aufnahme starten">▶</button>
          <button type="button" className="p-1.5 text-zinc-500 rounded hover:bg-zinc-200" aria-label="Aufnahme stoppen">■</button>
        </div>
        <button type="button" className="text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg px-4 py-2">
          Übersicht generieren ▾
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* 3. Datumsbereich: Februar 2026, Monat Total, Monatsauswahl, Tag/Woche/Monat/Jahr */}
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <h2 className="text-xl font-semibold text-zinc-900">Februar 2026</h2>
          <span className="text-sm text-zinc-600 whitespace-nowrap">Monat Total: 123 Std. 13 Min.</span>
          <div className="flex items-center gap-2">
            <button type="button" className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100" aria-label="Vorheriger Monat">←</button>
            <span className="text-sm font-medium min-w-[140px] text-center">Februar 2026</span>
            <button type="button" className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100" aria-label="Nächster Monat">→</button>
          </div>
          <div className="flex gap-1">
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm ${
                  v === "Monat" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Suche links, Favoriten rechts bündig */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-500 text-sm w-64">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input type="search" placeholder="Suchen" className="flex-1 bg-transparent outline-none placeholder:text-zinc-400" />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-sm font-medium text-zinc-600 mr-1">Favoriten</span>
            {FAVORITEN.map((f) => (
              <span key={f.label} className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${f.color}`}>
                {f.label}
              </span>
            ))}
            <button type="button" className="p-1 text-zinc-400 hover:text-zinc-600" aria-label="Favoriten bearbeiten">✎</button>
          </div>
        </div>

        {/* 5. Kalender: Wochentag 2 Zeilen, breitere Kacheln, einzeilig + Ellipsis, Frei mit Rahmen */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(7, minmax(160px, 1fr)) 72px" }}>
          {WOCHENTAGE.map((d) => (
            <div key={d} className="text-center text-zinc-500 text-sm font-medium py-1 whitespace-nowrap overflow-hidden text-ellipsis">
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
          <div className="flex items-center justify-center text-sm text-zinc-600 font-medium">
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
          <div className="flex items-center justify-center text-sm text-zinc-600 font-medium">
            0 Std. + 0 Std.
          </div>
        </div>
      </main>
    </div>
  );
}
