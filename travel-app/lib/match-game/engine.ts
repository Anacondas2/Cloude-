// Pure match-game engine — no React dependencies

export const BOARD_SIZE = 8;
export const MATCH_TARGET = 3;
export const GAME_DURATION = 60;
export const SESSION_FLAG_COUNT = 5;
export const MAX_CASCADE = 8;

export type Grid = string[][];   // flag codes; "" = empty

export interface Pos { r: number; c: number }
export interface Match { cells: Pos[]; flag: string; len: number }

// Each cell on the board has a stable id so Framer Motion can track it
export interface CellData { id: string; flag: string }
export type CellBoard = CellData[][];

// ── Utilities ─────────────────────────────────────────────────────────────────

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

let _id = 0;
function mkCell(flag: string): CellData { return { id: `c${++_id}`, flag }; }

// ── Grid helpers ──────────────────────────────────────────────────────────────

export function toGrid(board: CellBoard): Grid {
  return board.map(row => row.map(c => c.flag));
}

// ── Match detection ───────────────────────────────────────────────────────────

export function findMatches(grid: Grid): Match[] {
  const matches: Match[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    let c = 0;
    while (c < BOARD_SIZE) {
      const flag = grid[r][c];
      if (!flag) { c++; continue; }
      let len = 1;
      while (c + len < BOARD_SIZE && grid[r][c + len] === flag) len++;
      if (len >= 4) matches.push({ flag, len, cells: Array.from({ length: len }, (_, i) => ({ r, c: c + i })) });
      c += len;
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let r = 0;
    while (r < BOARD_SIZE) {
      const flag = grid[r][c];
      if (!flag) { r++; continue; }
      let len = 1;
      while (r + len < BOARD_SIZE && grid[r + len][c] === flag) len++;
      if (len >= 4) matches.push({ flag, len, cells: Array.from({ length: len }, (_, i) => ({ r: r + i, c })) });
      r += len;
    }
  }

  return matches;
}

// ── Move validation ───────────────────────────────────────────────────────────

export function isAdjacent(a: Pos, b: Pos): boolean {
  return (Math.abs(a.r - b.r) === 1 && a.c === b.c) ||
         (a.r === b.r && Math.abs(a.c - b.c) === 1);
}

function swapGrid(grid: Grid, a: Pos, b: Pos): Grid {
  const g = grid.map(r => [...r]);
  [g[a.r][a.c], g[b.r][b.c]] = [g[b.r][b.c], g[a.r][a.c]];
  return g;
}

export function swapCreatesMatch(grid: Grid, a: Pos, b: Pos): boolean {
  return findMatches(swapGrid(grid, a, b)).length > 0;
}

export function hasPossibleMove(grid: Grid): boolean {
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (c + 1 < BOARD_SIZE && swapCreatesMatch(grid, { r, c }, { r, c: c + 1 })) return true;
      if (r + 1 < BOARD_SIZE && swapCreatesMatch(grid, { r, c }, { r: r + 1, c })) return true;
    }
  return false;
}

// ── Board generation ──────────────────────────────────────────────────────────

function breakInitialMatches(grid: Grid, flags: string[]): Grid {
  const g = grid.map(r => [...r]);
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c <= BOARD_SIZE - 4; c++)
        if (g[r][c] && g[r][c] === g[r][c+1] && g[r][c+1] === g[r][c+2] && g[r][c+2] === g[r][c+3]) {
          g[r][c+3] = pickOther(flags, g[r][c]); changed = true;
        }
    for (let r = 0; r <= BOARD_SIZE - 4; r++)
      for (let c = 0; c < BOARD_SIZE; c++)
        if (g[r][c] && g[r][c] === g[r+1][c] && g[r+1][c] === g[r+2][c] && g[r+2][c] === g[r+3][c]) {
          g[r+3][c] = pickOther(flags, g[r][c]); changed = true;
        }
  }
  return g;
}

function makeBaseGrid(flags: string[]): Grid {
  let grid: Grid;
  let attempts = 0;
  do {
    grid = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => pick(flags))
    );
    grid = breakInitialMatches(grid, flags);
    attempts++;
    if (attempts > 300) {
      // Force a guaranteed possible move
      const flag = pick(flags); const other = pickOther(flags, flag);
      grid[0][0] = flag; grid[0][1] = flag; grid[0][2] = flag;
      grid[0][3] = other; grid[1][3] = flag;
      break;
    }
  } while (!hasPossibleMove(grid));
  return grid;
}

export function generateCellBoard(flags: string[]): CellBoard {
  return makeBaseGrid(flags).map(row => row.map(flag => mkCell(flag)));
}

// ── Swap ──────────────────────────────────────────────────────────────────────

export function swapCellBoard(board: CellBoard, a: Pos, b: Pos): CellBoard {
  const g = board.map(r => [...r]);
  [g[a.r][a.c], g[b.r][b.c]] = [g[b.r][b.c], g[a.r][a.c]];
  return g;
}

// ── Clear → Gravity → Refill ──────────────────────────────────────────────────

export function clearGravityRefill(
  board: CellBoard,
  matches: Match[],
  flags: string[]
): { newBoard: CellBoard; newIds: Set<string> } {
  const matchedKeys = new Set(matches.flatMap(m => m.cells.map(p => `${p.r},${p.c}`)));
  const newIds = new Set<string>();

  // Build new board column by column (gravity = non-matched fall to bottom)
  const result: CellData[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

  for (let c = 0; c < BOARD_SIZE; c++) {
    const surviving: CellData[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (!matchedKeys.has(`${r},${c}`)) surviving.push(board[r][c]);
    }
    const emptyTop = BOARD_SIZE - surviving.length;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (r < emptyTop) {
        const cell = mkCell(pick(flags));
        newIds.add(cell.id);
        result[r][c] = cell;
      } else {
        result[r][c] = surviving[r - emptyTop];
      }
    }
  }

  return { newBoard: result, newIds };
}

// ── Reshuffle ─────────────────────────────────────────────────────────────────

export function reshuffleCellBoard(board: CellBoard, flags: string[]): CellBoard {
  const cells = shuffle(board.flat());
  let idx = 0;
  const shuffled = board.map(row => row.map(() => cells[idx++]));
  if (hasPossibleMove(toGrid(shuffled))) return shuffled;
  return generateCellBoard(flags); // regenerate if still unsolvable
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export function scoreForMatches(matches: Match[], cascade: number): number {
  let pts = 0;
  for (const m of matches) {
    if (m.len === 4) pts += 100;
    else if (m.len === 5) pts += 150;
    else pts += 250;
  }
  if (matches.length > 1) pts += 100;
  pts += cascade * 50;
  return pts;
}

export function scoreTimeBonus(timeLeft: number): number { return timeLeft * 10; }

// ── Best score localStorage ───────────────────────────────────────────────────

const LS_KEY = "trewel:flagmatch:v1";

export interface MatchBest {
  bestScore: number; bestTime: number;
  totalWins: number; totalLosses: number; lastFlags: string[];
}

const EMPTY_BEST: MatchBest = { bestScore: 0, bestTime: 0, totalWins: 0, totalLosses: 0, lastFlags: [] };

export function loadMatchBest(): MatchBest {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    return raw ? (JSON.parse(raw) as MatchBest) : { ...EMPTY_BEST };
  } catch { return { ...EMPTY_BEST }; }
}

export function saveMatchResult(r: { score: number; won: boolean; timeLeft: number; flags: string[] }): void {
  try {
    const cur = loadMatchBest();
    localStorage.setItem(LS_KEY, JSON.stringify({
      bestScore: Math.max(cur.bestScore, r.score),
      bestTime: r.won ? Math.max(cur.bestTime, r.timeLeft) : cur.bestTime,
      totalWins: cur.totalWins + (r.won ? 1 : 0),
      totalLosses: cur.totalLosses + (r.won ? 0 : 1),
      lastFlags: r.flags,
    }));
  } catch { /* ignore */ }
}
