import { durationHours, getTodayDateStr } from "./timeUtils";
import { USER_OPTIONS, userToSlug } from "./UserContext";
import { fetchSuggestions, postSuggestion, deleteSuggestion } from "./apiClient";

export type SuggestionSource = "calendar" | "team";

export interface Suggestion {
  id: string;
  targetUserSlug: string;
  sourceType: SuggestionSource;
  /** Bei team: Nutzer, der gesendet hat (z.B. "Marco Keller") */
  sourceUserName?: string;
  projectLabel: string;
  description: string;
  durationHours: number;
  startTime?: string;
  endTime?: string;
  accentColor: string;
  dateStr?: string;
  createdAt: string;
}

/** Mock-Kalendervorschläge (z.B. aus Outlook/Google). Pro User 2 Einträge. Datum wird auf heute gesetzt. */
function getMockCalendarSuggestions(): Record<string, Omit<Suggestion, "id" | "createdAt">[]> {
  const today = getTodayDateStr();
  return {
    sara_meier: [
      {
        targetUserSlug: "sara_meier",
        sourceType: "calendar",
        projectLabel: "Meeting intern",
        description: "Wöchentliche Besprechung",
        durationHours: 1,
        startTime: "13:00",
        endTime: "14:00",
        accentColor: "#EFEEED",
        dateStr: today,
      },
      {
        targetUserSlug: "sara_meier",
        sourceType: "calendar",
        projectLabel: "Weekly im Team",
        description: "Review des Features #123567",
        durationHours: 2,
        accentColor: "#EFEEED",
        dateStr: today,
      },
    ],
    marco_keller: [
      {
        targetUserSlug: "marco_keller",
        sourceType: "calendar",
        projectLabel: "Meeting intern",
        description: "Daily Stand-up",
        durationHours: 0.5,
        startTime: "09:00",
        endTime: "09:30",
        accentColor: "#EFEEED",
        dateStr: today,
      },
      {
        targetUserSlug: "marco_keller",
        sourceType: "calendar",
        projectLabel: "INC-4521",
        description: "Nachbearbeitung Migros",
        durationHours: 1.5,
        accentColor: "#D5EEEB",
        dateStr: today,
      },
    ],
  };
}

/** Mock: Ein Vorschlag von Marco an Sara (Beispieldaten). Datum auf heute. */
function getMockTeamSuggestionForSara(): Omit<Suggestion, "id" | "createdAt"> {
  return {
    targetUserSlug: "sara_meier",
    sourceType: "team",
    sourceUserName: "Marco Keller",
    projectLabel: "Clientis | Cyber Security | PROJ-4521",
    description: "Support-Ticket vom Kunden",
    durationHours: 1,
    startTime: "10:00",
    endTime: "11:00",
    accentColor: "#E6DEF3",
    dateStr: getTodayDateStr(),
  };
}

/** Lädt Vorschläge aus DB (team) + Mock-Kalender + Mock-Team, kombiniert. */
export async function fetchSuggestionsForUser(userSlug: string): Promise<Suggestion[]> {
  const [dbSuggestions, mockCalendar, mockTeamForSara] = await Promise.all([
    fetchSuggestions(userSlug),
    Promise.resolve(getMockCalendarSuggestions()[userSlug] ?? []),
    Promise.resolve(userSlug === "sara_meier" ? [getMockTeamSuggestionForSara()] : []),
  ]);

  const calendarSuggestions: Suggestion[] = mockCalendar.map((m, i) => ({
    ...m,
    id: `mock-cal-${userSlug}-${i}`,
    createdAt: new Date().toISOString(),
  }));

  const mockTeam: Suggestion[] = mockTeamForSara.map((m) => ({
    ...m,
    id: "mock-team-marco-to-sara",
    createdAt: new Date().toISOString(),
  }));

  const existingIds = new Set([...calendarSuggestions.map((s) => s.id), ...mockTeam.map((s) => s.id)]);
  const teamFromDb = dbSuggestions.filter((s) => !existingIds.has(s.id)) as Suggestion[];

  return [...calendarSuggestions, ...mockTeam, ...teamFromDb];
}

export async function addSuggestion(suggestion: Omit<Suggestion, "id" | "createdAt">): Promise<Suggestion | null> {
  const created = await postSuggestion({
    targetUserSlug: suggestion.targetUserSlug,
    sourceType: suggestion.sourceType,
    sourceUserName: suggestion.sourceUserName,
    projectLabel: suggestion.projectLabel,
    description: suggestion.description,
    durationHours: suggestion.durationHours,
    startTime: suggestion.startTime,
    endTime: suggestion.endTime,
    accentColor: suggestion.accentColor,
    dateStr: suggestion.dateStr,
  });
  return created as Suggestion | null;
}

/** Löscht einen Vorschlag (nur DB-Einträge; Mock-IDs werden ignoriert). */
export async function removeSuggestion(id: string): Promise<void> {
  if (id.startsWith("mock-")) return;
  await deleteSuggestion(id);
}

export function createSuggestionFromEntry(
  entry: { text: string; bg: string; startTime?: string; endTime?: string; comment?: string },
  dateStr: string,
  targetUserSlug: string,
  sourceUserName: string
): Omit<Suggestion, "id" | "createdAt"> {
  const duration =
    entry.startTime && entry.endTime
      ? durationHours(entry.startTime, entry.endTime)
      : 1;
  return {
    targetUserSlug,
    sourceType: "team",
    sourceUserName,
    projectLabel: entry.text,
    description: entry.comment ?? "",
    durationHours: duration,
    startTime: entry.startTime,
    endTime: entry.endTime,
    accentColor: entry.bg,
    dateStr,
  };
}

export function getOtherUserOptions(currentUserSlug: string): { slug: string; name: string }[] {
  return USER_OPTIONS.filter((opt) => userToSlug(opt) !== currentUserSlug).map((opt) => ({
    slug: userToSlug(opt),
    name: opt,
  }));
}

/** Erweiterte Optionen für «An Teammitglied senden» – inkl. 50+ Mock-Namen zum Testen */
const SEND_TO_MOCK_EXTRA: { slug: string; name: string }[] = [
  { slug: "anna_mueller", name: "Anna Müller" },
  { slug: "lisa_fischer", name: "Lisa Fischer" },
  { slug: "thomas_weber", name: "Thomas Weber" },
  { slug: "julia_hoffmann", name: "Julia Hoffmann" },
  { slug: "michael_schneider", name: "Michael Schneider" },
  { slug: "sandra_berger", name: "Sandra Berger" },
  { slug: "martin_koch", name: "Martin Koch" },
  { slug: "petra_wagner", name: "Petra Wagner" },
  { slug: "stefan_becker", name: "Stefan Becker" },
  { slug: "claudia_schulz", name: "Claudia Schulz" },
  { slug: "andreas_hofmann", name: "Andreas Hofmann" },
  { slug: "sabine_richter", name: "Sabine Richter" },
  { slug: "peter_klein", name: "Peter Klein" },
  { slug: "monika_wolf", name: "Monika Wolf" },
  { slug: "christian_schroeder", name: "Christian Schröder" },
  { slug: "susanne_neumann", name: "Susanne Neumann" },
  { slug: "markus_schwarz", name: "Markus Schwarz" },
  { slug: "birgit_zimmermann", name: "Birgit Zimmermann" },
  { slug: "uwe_braun", name: "Uwe Braun" },
  { slug: "andrea_krueger", name: "Andrea Krüger" },
  { slug: "juergen_frank", name: "Jürgen Frank" },
  { slug: "angelika_kaiser", name: "Angelika Kaiser" },
  { slug: "klaus_lang", name: "Klaus Lang" },
  { slug: "helga_simon", name: "Helga Simon" },
  { slug: "wolfgang_meyer", name: "Wolfgang Meyer" },
  { slug: "renate_baum", name: "Renate Baum" },
  { slug: "dieter_jung", name: "Dieter Jung" },
  { slug: "katharina_hermann", name: "Katharina Hermann" },
  { slug: "herbert_krause", name: "Herbert Krause" },
  { slug: "gabriele_lehr", name: "Gabriele Lehr" },
  { slug: "rolf_stein", name: "Rolf Stein" },
  { slug: "inge_vogt", name: "Inge Vogt" },
  { slug: "friedrich_bauer", name: "Friedrich Bauer" },
  { slug: "elke_reinhardt", name: "Elke Reinhardt" },
  { slug: "guenther_schmitt", name: "Günther Schmitt" },
  { slug: "marion_arnold", name: "Marion Arnold" },
  { slug: "werner_sommer", name: "Werner Sommer" },
  { slug: "dagmar_graf", name: "Dagmar Graf" },
  { slug: "hans_weiss", name: "Hans Weiss" },
  { slug: "christa_otto", name: "Christa Otto" },
  { slug: "karsten_hartmann", name: "Karsten Hartmann" },
  { slug: "silvia_peters", name: "Silvia Peters" },
  { slug: "joerg_berger", name: "Jörg Berger" },
  { slug: "ute_keller", name: "Ute Keller" },
  { slug: "bernd_fischer", name: "Bernd Fischer" },
  { slug: "regina_werner", name: "Regina Werner" },
  { slug: "volker_gruber", name: "Volker Gruber" },
  { slug: "barbara_kuhn", name: "Barbara Kuhn" },
  { slug: "harald_fuchs", name: "Harald Fuchs" },
  { slug: "heike_schmidt", name: "Heike Schmidt" },
  { slug: "rainer_hoffmann", name: "Rainer Hoffmann" },
  { slug: "petra_beck", name: "Petra Beck" },
];

export function getSendToMemberOptions(currentUserSlug: string): { slug: string; name: string }[] {
  const base = getOtherUserOptions(currentUserSlug);
  const baseSlugs = new Set(base.map((o) => o.slug));
  const extra = SEND_TO_MOCK_EXTRA.filter((o) => !baseSlugs.has(o.slug));
  return [...base, ...extra];
}
