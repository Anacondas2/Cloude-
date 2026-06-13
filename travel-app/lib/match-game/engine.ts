// Pure match-game engine — no React dependencies

export const BOARD_SIZE = 8;
export const MATCH_TARGET = 3;   // matches needed to win
export const GAME_DURATION = 60; // seconds
export const SESSION_FLAG_COUNT = 5;
export const MAX_CASCADE = 8;

export type Grid = string[][]; // flag codes; "" = empty slot

export interface Pos { r: number; c: number }

export interface Match {
  cells: Pos[];
  flag: string;
  len: number;
}

// ── Utilities ────────────────────────────────────────────────────────────────

function rand(n: number) { return Math.floor(Math.random() * n); }
function pick<T>(arr: T[]): T { return arr[rand(arr.length)]; }

function pickOther(flags: string[], avoid: string): string {
  const alts = flags.filter(f => f !== avoid);
  return alts.length > 0 ? pick(alts) : pick(flags);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Match detection ──────────────────────────────────────────────────────────

export function findMatches(grid: Grid): Match[] {
  const matches: Match[] = [];

  // Horizontal
  for (let r = 0; r < BOARD_SIZE; r++) {
    let c = 0;
    while (c < BOARD_SIZE) {
      const flag = grid[r][c];
      if (!flag) { c++; continue; }
      let len = 1;
      while (c + len < BOARD_SIZE && grid[r][c + len] === flag) len++;
      if (len >= 4) {
        matches.push({ flag, len, cells: Array.from({ length: len }, (_, i) => ({ r, c: c + i })) });
      }
      c += len;
    }
  }

  // Vertical
  for (let c = 0; c < BOARD_SIZE; c++) {
    let r = 0;
    while (r < BOARD_SIZE) {
      const flag = grid[r][c];
      if (!flag) { r++; continue; }
      let len = 1;
      while (r + len < BOARD_SIZE && grid[r + len][c] === flag) len++;
      if (len >= 4) {
        matches.push({ flag, len, cells: Array.from({ length: len }, (_, i) => ({ r: r + i, c })) });
      }
      r += len;
    }
  }

  return matches;
}

// ── Swap helpers ─────────────────────────────────────────────────────────────

export function isAdjacent(a: Pos, b: Pos): boolean {
  return (Math.abs(a.r - b.r) === 1 && a.c === b.c) ||
         (a.r === b.r && Math.abs(a.c - b.c) === 1);
}

export function swapGrid(grid: Grid, a: Pos, b: Pos): Grid {
  const g = grid.map(r => [...r]);
  [g[a.r][a.c], g[b.r][b.c]] = [g[b.r][b.c], g[a.r][a.c]];
  return g;
}

export function swapCreatesMatch(grid: Grid, a: Pos, b: Pos): boolean {
  return findMatches(swapGrid(grid, a, b)).length > 0;
}

// ── Possible move detection ──────────────────────────────────────────────────

export function hasPossibleMove(grid: Grid): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (c + 1 < BOARD_SIZE && swapCreatesMatch(grid, { r, c }, { r, c: c + 1 })) return true;
      if (r + 1 < BOARD_SIZE && swapCreatesMatch(grid, { r, c }, { r: r + 1, c })) return true;
    }
  }
  return false;
}

// ── Board generation ─────────────────────────────────────────────────────────

function breakInitialMatches(grid: Grid, flags: string[]): Grid {
  const g = grid.map(r => [...r]);
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c <= BOARD_SIZE - 4; c++) {
        if (g[r][c] && g[r][c] === g[r][c + 1] && g[r][c + 1] === g[r][c + 2] && g[r][c + 2] === g[r][c + 3]) {
          g[r][c + 3] = pickOther(flags, g[r][c]);
          changed = true;
        }
      }
    }
    for (let r = 0; r <= BOARD_SIZE - 4; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (g[r][c] && g[r][c] === g[r + 1][c] && g[r + 1][c] === g[r + 2][c] && g[r + 2][c] === g[r + 3][c]) {
          g[r + 3][c] = pickOther(flags, g[r][c]);
          changed = true;
        }
      }
    }
  }
  return g;
}

function forcePossibleMove(grid: Grid, flags: string[]): Grid {
  // Inject a guaranteed near-match: place 3 same flags in row 0, then one below 4th col
  const g = grid.map(r => [...r]);
  const flag = pick(flags);
  const other = pickOther(flags, flag);
  // Row 0, cols 0-2 = flag, col 3 = other
  g[0][0] = flag; g[0][1] = flag; g[0][2] = flag; g[0][3] = other;
  // Row 1, col 3 = flag → swapping (0,3)↔(1,3) creates 4 in row 0
  g[1][3] = flag;
  return g;
}

export function generateGrid(flags: string[]): Grid {
  let grid: Grid;
  let attempts = 0;
  do {
    grid = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => pick(flags))
    );
    grid = breakInitialMatches(grid, flags);
    attempts++;
    if (attempts > 300) { grid = forcePossibleMove(grid, flags); break; }
  } while (!hasPossibleMove(grid));
  return grid;
}

// ── Gravity & refill ─────────────────────────────────────────────────────────

export function clearMatchedCells(grid: Grid, matches: Match[]): Grid {
  const g = grid.map(r => [...r]);
  for (const m of matches) for (const { r, c } of m.cells) g[r][c] = "";
  return g;
}

export function applyGravity(grid: Grid): Grid {
  const g = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill("") as string[]);
  for (let c = 0; c < BOARD_SIZE; c++) {
    const nonEmpty: string[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) if (grid[r][c]) nonEmpty.push(grid[r][c]);
    const emptyTop = BOARD_SIZE - nonEmpty.length;
    for (let r = 0; r < BOARD_SIZE; r++) {
      g[r][c] = r < emptyTop ? "" : nonEmpty[r - emptyTop];
    }
  }
  return g;
}

export function refillGrid(grid: Grid, flags: string[]): Grid {
  return grid.map(row => row.map(cell => cell || pick(flags)));
}

// Returns Set of "r,c" positions that were empty before refill (= new cells)
export function getNewCellKeys(afterGravity: Grid, afterRefill: Grid): Set<string> {
  const keys = new Set<string>();
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      if (!afterGravity[r][c] && afterRefill[r][c]) keys.add(`${r},${c}`);
  return keys;
}

// ── Reshuffle ────────────────────────────────────────────────────────────────

export function reshuffleGrid(grid: Grid, flags: string[]): Grid {
  const cells = shuffle(grid.flat().filter(Boolean));
  let idx = 0;
  const g = grid.map(r => r.map(cell => (cell ? cells[idx++] : "")));
  if (hasPossibleMove(g)) return breakInitialMatches(g, flags);
  return generateGrid(flags);
}

// ── Scoring ──────────────────────────────────────────────────────────────────

export function scoreForMatches(matches: Match[], cascadeDepth: number): number {
  let pts = 0;
  for (const m of matches) {
    if (m.len === 4) pts += 100;
    else if (m.len === 5) pts += 150;
    else pts += 250;
  }
  if (matches.length > 1) pts += 100; // simultaneous bonus
  pts += cascadeDepth * 50;           // cascade bonus
  return pts;
}

export function scoreTimeBonus(timeLeft: number): number {
  return timeLeft * 10;
}

// ── Best score localStorage ──────────────────────────────────────────────────

const LS_KEY = "trewel:flagmatch:v1";

export interface MatchBest {
  bestScore: number;
  bestTime: number;
  totalWins: number;
  totalLosses: number;
  lastFlags: string[];
}

const EMPTY_BEST: MatchBest = { bestScore: 0, bestTime: 0, totalWins: 0, totalLosses: 0, lastFlags: [] };

export function loadMatchBest(): MatchBest {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    return raw ? (JSON.parse(raw) as MatchBest) : { ...EMPTY_BEST };
  } catch { return { ...EMPTY_BEST }; }
}

export function saveMatchResult(result: {
  score: number; won: boolean; timeLeft: number; flags: string[];
}): void {
  try {
    const cur = loadMatchBest();
    const next: MatchBest = {
      bestScore: Math.max(cur.bestScore, result.score),
      bestTime: result.won ? Math.max(cur.bestTime, result.timeLeft) : cur.bestTime,
      totalWins: cur.totalWins + (result.won ? 1 : 0),
      totalLosses: cur.totalLosses + (result.won ? 0 : 1),
      lastFlags: result.flags,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}
