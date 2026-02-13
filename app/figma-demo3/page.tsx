import "./figma-tokens.css";
import { AppHeader } from "./components/AppHeader";
import { ControlSection } from "./components/ControlSection";
import { FavoritesBar } from "./components/FavoritesBar";
import { CalendarGrid } from "./components/CalendarGrid";
import { getDemoCalendar } from "./data/demoCalendar";

export default function FigmaDemo3Page() {
  const { weeks, weekTotals } = getDemoCalendar();

  return (
    <div className="figma-demo3 min-h-screen" style={{ backgroundColor: "var(--figma-neutral-97)", color: "var(--figma-bw-black)" }}>
      <AppHeader />
      <ControlSection />
      <FavoritesBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <CalendarGrid weeks={weeks} weekTotals={weekTotals} />
      </main>
    </div>
  );
}
