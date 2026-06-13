import { COUNTRIES } from "./countries";
import { CAPITALS } from "./capitals-data";

// ── Core types ──────────────────────────────────────────────────────────────

export interface GameCountry {
  code: string;
  nameRu: string;
  nameEn: string;
  flag: string;
  region: string;
  capitalRu: string;
  capitalEn: string;
}

/** Question for the capitals game — 4 capital-name choices */
export interface CapitalQuestion {
  country: GameCountry;
  choices: string[]; // capitalRu values (shuffled, one is correct)
}

/** Question for the flags game — 4 country choices */
export interface FlagQuestion {
  country: GameCountry;
  choices: GameCountry[]; // shuffled, one is correct
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
export type GameColor = "green" | "blue";

// ── Labels ───────────────────────────────────────────────────────────────────

export const REGION_LABELS: Record<GameRegion, string> = {
  all: "Весь мир",
  europe: "Европа",
  asia: "Азия",
  africa: "Африка",
  north_america: "Сев. Америка",
  south_america: "Юж. Америка",
  oceania: "Океания",
};

export const MODE_CONFIG: Record<GameMode, { label: string; count: number | null }> = {
  quick:     { label: "Быстрая · 10",  count: 10   },
  challenge: { label: "Испытание · 25", count: 25   },
  full:      { label: "Весь мир",       count: null },
};

// ── Dataset ───────────────────────────────────────────────────────────────────

export const ALL_GAME_COUNTRIES: GameCountry[] = COUNTRIES.filter(
  (c) => CAPITALS[c.code]
).map((c) => ({
  code: c.code,
  nameRu: c.nameRu,
  nameEn: c.nameEn,
  flag: c.flag,
  region: c.region,
  capitalRu: CAPITALS[c.code].capitalRu,
  capitalEn: CAPITALS[c.code].capitalEn,
}));

// ── Dataset validation ────────────────────────────────────────────────────────

export interface ValidationResult {
  count: number;
  valid: boolean;
  issues: string[];
}

export function validateDataset(): ValidationResult {
  const seen = new Set<string>();
  const issues: string[] = [];

  for (const c of ALL_GAME_COUNTRIES) {
    if (seen.has(c.code)) issues.push(`Duplicate: ${c.code}`);
    seen.add(c.code);
    if (!c.capitalRu)  issues.push(`No capitalRu: ${c.code}`);
    if (!c.capitalEn)  issues.push(`No capitalEn: ${c.code}`);
    if (!c.flag)       issues.push(`No flag: ${c.code}`);
    if (!c.nameRu)     issues.push(`No nameRu: ${c.code}`);
  }

  return { count: ALL_GAME_COUNTRIES.length, valid: issues.length === 0, issues };
}

// ── Utilities ─────────────────────────────────────────────────────────────────

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

function getQuestionList(mode: GameMode, pool: GameCountry[]): GameCountry[] {
  const shuffled = shuffle(pool);
  if (mode === "quick")     return shuffled.slice(0, Math.min(10, shuffled.length));
  if (mode === "challenge") return shuffled.slice(0, Math.min(25, shuffled.length));
  return shuffled;
}

/**
 * Smart wrong answer selection:
 * Prefer same region, fall back to other regions.
 * Ensures no duplicates and correct answer is excluded.
 */
function getWrongCountries(
  correct: GameCountry,
  pool: GameCountry[],
  excludeCodes: Set<string>,
  n: number
): GameCountry[] {
  const excl = new Set([...excludeCodes, correct.code]);
  const sameRegion = shuffle(pool.filter((c) => !excl.has(c.code) && c.region === correct.region));
  const otherRegion = shuffle(pool.filter((c) => !excl.has(c.code) && c.region !== correct.region));
  return [...sameRegion, ...otherRegion].slice(0, n);
}

// For capitals: also ensure no two choices share the same capital name
function getWrongCapitalCountries(correct: GameCountry, n: number): GameCountry[] {
  const excl = new Set([correct.code]);
  const usedCapitals = new Set([correct.capitalRu]);

  const sameRegion = shuffle(
    ALL_GAME_COUNTRIES.filter(
      (c) => !excl.has(c.code) && c.region === correct.region && !usedCapitals.has(c.capitalRu)
    )
  );
  const otherRegion = shuffle(
    ALL_GAME_COUNTRIES.filter(
      (c) => !excl.has(c.code) && c.region !== correct.region && !usedCapitals.has(c.capitalRu)
    )
  );

  const result: GameCountry[] = [];
  for (const c of [...sameRegion, ...otherRegion]) {
    if (result.length >= n) break;
    if (!usedCapitals.has(c.capitalRu)) {
      result.push(c);
      usedCapitals.add(c.capitalRu);
    }
  }
  return result;
}

// ── Session builders ──────────────────────────────────────────────────────────

export function buildCapitalsSession(mode: GameMode, region: GameRegion): CapitalQuestion[] {
  const pool = getPool(region);
  const questions = getQuestionList(mode, pool);

  return questions.map((country) => {
    const wrongs = getWrongCapitalCountries(country, 3);
    const choices = shuffle([country.capitalRu, ...wrongs.map((c) => c.capitalRu)]);
    return { country, choices };
  });
}

export function buildFlagSession(mode: GameMode, region: GameRegion): FlagQuestion[] {
  const pool = getPool(region);
  const questions = getQuestionList(mode, pool);

  return questions.map((country) => {
    const wrongs = getWrongCountries(country, ALL_GAME_COUNTRIES, new Set(), 3);
    const choices = shuffle([country, ...wrongs]);
    return { country, choices };
  });
}

// ── Result messages ───────────────────────────────────────────────────────────

export interface ResultMessage {
  title: string;
  emoji: string;
  sub: string;
}

export function getResultMessage(acc: number): ResultMessage {
  if (acc >= 90) return { title: "Легенда географии",          emoji: "🌟", sub: "Потрясающий результат!" };
  if (acc >= 70) return { title: "Очень сильный результат",    emoji: "💪", sub: "Ты хорошо знаешь мир!" };
  if (acc >= 50) return { title: "Хорошо, но есть куда расти", emoji: "📚", sub: "Немного практики — и будет отлично!" };
  return            { title: "Нужно потренироваться",          emoji: "🗺️", sub: "Попробуй ещё раз, у тебя получится!" };
}

export function calcAccuracy(score: number, total: number): number {
  return total === 0 ? 0 : Math.round((score / total) * 100);
}

// ── Best score ────────────────────────────────────────────────────────────────

export interface BestScore {
  score: number;
  accuracy: number;
  streak: number;
  total: number;
  mode: string;
}

const LS_PREFIX = "trewel:game:v2:";

const EMPTY_BEST: BestScore = { score: 0, accuracy: 0, streak: 0, total: 0, mode: "" };

export function loadBest(key: string): BestScore {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? (JSON.parse(raw) as BestScore) : { ...EMPTY_BEST };
  } catch {
    return { ...EMPTY_BEST };
  }
}

export function saveBest(key: string, data: BestScore): boolean {
  try {
    const cur = loadBest(key);
    if (data.accuracy >= cur.accuracy) {
      localStorage.setItem(LS_PREFIX + key, JSON.stringify(data));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function makeBestKey(
  type: "capitals" | "flags",
  mode: GameMode,
  region: GameRegion
): string {
  return `${type}:${mode}:${region}`;
}
