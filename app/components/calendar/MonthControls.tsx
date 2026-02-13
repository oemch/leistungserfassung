import { VIEWS } from "@/lib/constants";

interface MonthControlsProps {
  monthLabel: string;
  monthTotal: string;
}

export function MonthControls({ monthLabel, monthTotal }: MonthControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
      <h2 className="shrink-0" style={{ color: "var(--figma-bw-black)", fontSize: 22, fontWeight: 400 }}>
        {monthLabel}
      </h2>
      <div className="flex flex-wrap items-center justify-end gap-4">
        <span className="whitespace-nowrap" style={{ color: "var(--figma-bw-black)", fontSize: 22, fontWeight: 400 }}>
          {monthTotal}
        </span>
        <div className="flex items-center gap-1 h-9">
          <button
            type="button"
            className="h-full flex items-center justify-center px-2.5 hover:opacity-80 bg-[#FFF]"
            style={{ borderRadius: 8, border: "1.5px solid #B5B1AD" }}
            aria-label="Vorheriger Monat"
          >
            <span className="material-icons" style={{ fontSize: 20, width: 20, height: 20 }} aria-hidden>chevron_left</span>
          </button>
          <span
            className="h-full min-w-[140px] flex items-center justify-center px-3 text-center text-sm font-medium bg-[var(--figma-bw-white)]"
            style={{ borderRadius: 8, border: "1.5px solid #B5B1AD" }}
          >
            {monthLabel}
          </span>
          <button
            type="button"
            className="h-full flex items-center justify-center px-2.5 hover:opacity-80 bg-[#FFF]"
            style={{ borderRadius: 8, border: "1.5px solid #B5B1AD" }}
            aria-label="Nächster Monat"
          >
            <span className="material-icons" style={{ fontSize: 20, width: 20, height: 20 }} aria-hidden>chevron_right</span>
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
  );
}
