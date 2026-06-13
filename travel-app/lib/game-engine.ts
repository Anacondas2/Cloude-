import { COUNTRIES } from "./countries";
import { CAPITALS } from "./capitals-data";

export interface GameCountry {
  code: string;
  nameRu: string;
  nameEn: string;
  flag: string;
  region: string;
  capitalRu: string;
  capitalEn: string;
  alt: string[];
}

export interface FlagQuestion {
  country: GameCountry;
  choices: GameCountry[]; // 4 options, shuffled, includes correct
}

export type GameMode = "quick" | "challenge" | "full";
export type GameRegion =
  | "all"
  | "europe"
  | "asia"
  | "africa"
  | "north_america"
  | "south_america"
  | "oceania";

export const REGION_LABELS: Record<GameRegion, string> = {
  all: "Весь мир",
  europe: "Европа",
  asia: "Азия",
  africa: "Африка",
  north_america: "Сев. Америка",
  south_america: "Юж. Америка",
  oceania: "Океания",
};

export const MODE_LABELS: Record<GameMode, string> = {
  quick: "Быстрая · 10",
  challenge: "Испытание · 25",
  full: "Весь мир",
};

// Build game-ready country list (country data + capitals joined)
export const ALL_GAME_COUNTRIES: GameCountry[] = COUNTRIES.filter(
  (c) => CAPITALS[c.code]
).map((c) => {
  const cap = CAPITALS[c.code];
  return {
    code: c.code,
    nameRu: c.nameRu,
    nameEn: c.nameEn,
    flag: c.flag,
    region: c.region,
    capitalRu: cap.capitalRu,
    capitalEn: cap.capitalEn,
    alt: cap.alt ?? [],
  };
});

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPool(region: GameRegion): GameCountry[] {
  return region === "all"
    ? ALL_GAME_COUNTRIES
    : ALL_GAME_COUNTRIES.filter((c) => c.region === region);
}

export function buildCapitalsSession(
  mode: GameMode,
  region: GameRegion
): GameCountry[] {
  const shuffled = shuffle(getPool(region));
  if (mode === "quick") return shuffled.slice(0, 10);
  if (mode === "challenge") return shuffled.slice(0, 25);
  return shuffled;
}

export function buildFlagSession(
  mode: GameMode,
  region: GameRegion
): FlagQuestion[] {
  const pool = getPool(region);
  const shuffled = shuffle(pool);
  const questions =
    mode === "quick"
      ? shuffled.slice(0, 10)
      : mode === "challenge"
      ? shuffled.slice(0, 25)
      : shuffled;

  return questions.map((country) => ({
    country,
    choices: makeFlagChoices(country, pool),
  }));
}

function makeFlagChoices(correct: GameCountry, pool: GameCountry[]): GameCountry[] {
  const wrong = shuffle(pool.filter((c) => c.code !== correct.code)).slice(0, 3);
  // If pool too small, fill from all countries
  const extra =
    wrong.length < 3
      ? shuffle(
          ALL_GAME_COUNTRIES.filter(
            (c) => c.code !== correct.code && !wrong.find((w) => w.code === c.code)
          )
        ).slice(0, 3 - wrong.length)
      : [];
  return shuffle([correct, ...wrong, ...extra]);
}

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");
}

export function checkCapital(answer: string, country: GameCountry): boolean {
  if (!answer.trim()) return false;
  const n = norm(answer);
  if (n === norm(country.capitalRu)) return true;
  if (n === norm(country.capitalEn)) return true;
  return country.alt.some((a) => n === norm(a));
}

export function accuracy(score: number, total: number): number {
  return total === 0 ? 0 : Math.round((score / total) * 100);
}

export function pluralStran(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "страна";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "страны";
  return "стран";
}

const LS_PREFIX = "trewel:game:best:";

export function getBest(key: string): number {
  try {
    return parseInt(localStorage.getItem(LS_PREFIX + key) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(key: string, score: number): void {
  try {
    if (score > getBest(key)) {
      localStorage.setItem(LS_PREFIX + key, String(score));
    }
  } catch {}
}
