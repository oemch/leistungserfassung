import { getTodayDateStr, getCalendarDaysForMonth } from "@/lib/timeUtils";
import { fetchInitialData } from "@/lib/data-server";
import { DEFAULT_USER_SLUG } from "@/lib/constants";
import { HomeClient } from "./components/HomeClient";
import { UserProvider } from "@/lib/UserContext";
import { ToastProvider } from "./components/ui/Toast";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todayDateStr = getTodayDateStr();
  const [y, m] = todayDateStr.split("-").map(Number);
  const { weeks } = getCalendarDaysForMonth(y!, m!);
  const dateStrs = weeks.flatMap((w) => w.map((c) => c.dateStr));

  const { favorites, entriesByDate, leistungen, recentLabels } = await fetchInitialData(dateStrs, DEFAULT_USER_SLUG);

  return (
    <UserProvider>
      <ToastProvider>
      <HomeClient
        todayDateStr={todayDateStr}
        initialFavorites={favorites}
        initialEntriesByDate={entriesByDate}
        initialLeistungen={leistungen}
        initialRecentLabels={recentLabels}
      />
      </ToastProvider>
    </UserProvider>
  );
}
