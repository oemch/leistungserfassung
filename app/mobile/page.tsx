import { getTodayDateStr, getDateStrsAround } from "@/lib/timeUtils";
import { fetchInitialData } from "@/lib/data-server";
import { DEFAULT_USER_SLUG } from "@/lib/constants";
import { UserProvider } from "@/lib/UserContext";
import { ToastProvider } from "../components/ui/Toast";
import { MobileClient } from "../components/mobile/MobileClient";

export const dynamic = "force-dynamic";

const MOBILE_DAYS_RANGE = 14;

export default async function MobilePage() {
  const todayDateStr = getTodayDateStr();
  const dateStrs = getDateStrsAround(todayDateStr, MOBILE_DAYS_RANGE, MOBILE_DAYS_RANGE);

  const { favorites, entriesByDate, leistungen, recentLabels } = await fetchInitialData(
    dateStrs,
    DEFAULT_USER_SLUG
  );

  return (
    <UserProvider>
      <ToastProvider>
        <MobileClient
          todayDateStr={todayDateStr}
          initialFavorites={favorites}
          initialEntriesByDate={entriesByDate}
          initialLeistungen={leistungen}
          initialRecentLabels={recentLabels}
          initialViewMode="Tag"
        />
      </ToastProvider>
    </UserProvider>
  );
}
