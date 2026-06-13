"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BOARD_SIZE, GAME_DURATION, MATCH_TARGET, MAX_CASCADE, SESSION_FLAG_COUNT,
  Grid, Pos, Match,
  generateGrid, findMatches, isAdjacent, swapGrid, swapCreatesMatch,
  clearMatchedCells, applyGravity, refillGrid, getNewCellKeys,
  hasPossibleMove, reshuffleGrid,
  scoreForMatches, scoreTimeBonus,
  saveMatchResult,
} from "@/lib/match-game/engine";
import { ALL_GAME_COUNTRIES, GameCountry, shuffle } from "@/lib/game-engine";

export type GamePhase =
  | "idle" | "playing" | "swapping" | "resolving" | "reshuffling" | "won" | "lost";

export interface SwapAnim {
  a: Pos; b: Pos;
  valid: boolean | null; // null = in progress, true = accepted, false = invalid
}

export interface FlagMatchState {
  phase: GamePhase;
  grid: Grid;
  sessionCountries: GameCountry[];
  selected: Pos | null;
  matched: Set<string>;      // "r,c" keys of matched cells being cleared
  newCells: Set<string>;     // "r,c" keys of cells just added (fade-in)
  reshuffling: boolean;
  swapAnim: SwapAnim | null;
  score: number;
  matchCount: number;        // toward MATCH_TARGET
  moves: number;
  timeLeft: number;
  // handlers
  handleCellTap: (r: number, c: number) => void;
  restart: () => void;
  exitGame: () => void;
}

export function useFlagMatchGame(onExit: () => void): FlagMatchState {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [grid, setGrid] = useState<Grid>([]);
  const [sessionCountries, setSessionCountries] = useState<GameCountry[]>([]);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [newCells, setNewCells] = useState<Set<string>>(new Set());
  const [reshuffling, setReshuffling] = useState(false);
  const [swapAnim, setSwapAnim] = useState<SwapAnim | null>(null);
  const [score, setScore] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  // Stable refs to avoid stale closures in timeouts
  const phaseRef = useRef<GamePhase>("idle");
  const gridRef = useRef<Grid>([]);
  const matchCountRef = useRef(0);
  const scoreRef = useRef(0);
  const sessionFlagsRef = useRef<string[]>([]);
  const sessionCountriesRef = useRef<GameCountry[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(GAME_DURATION);
  const animLockRef = useRef(false); // prevents overlapping animations

  function syncPhase(p: GamePhase) { phaseRef.current = p; setPhase(p); }
  function syncGrid(g: Grid) { gridRef.current = g; setGrid(g); }
  function syncMatchCount(n: number) { matchCountRef.current = n; setMatchCount(n); }
  function syncScore(n: number) { scoreRef.current = n; setScore(n); }

  // ── Timer ──────────────────────────────────────────────────────────────────

  function startTimer() {
    stopTimer();
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        stopTimer();
        triggerLoss();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function triggerLoss() {
    animLockRef.current = false;
    syncPhase("lost");
    saveMatchResult({
      score: scoreRef.current,
      won: false,
      timeLeft: 0,
      flags: sessionFlagsRef.current,
    });
  }

  function triggerWin() {
    stopTimer();
    animLockRef.current = false;
    const timeBonus = scoreTimeBonus(timeLeftRef.current);
    const finalScore = scoreRef.current + timeBonus;
    syncScore(finalScore);
    syncPhase("won");
    saveMatchResult({
      score: finalScore,
      won: true,
      timeLeft: timeLeftRef.current,
      flags: sessionFlagsRef.current,
    });
  }

  // ── Game start / restart ───────────────────────────────────────────────────

  const startGame = useCallback(() => {
    stopTimer();
    animLockRef.current = false;

    // Pick SESSION_FLAG_COUNT random countries
    const countries = shuffle(ALL_GAME_COUNTRIES).slice(0, SESSION_FLAG_COUNT);
    const flags = countries.map(c => c.code);

    sessionFlagsRef.current = flags;
    sessionCountriesRef.current = countries;

    const g = generateGrid(flags);
    gridRef.current = g;
    matchCountRef.current = 0;
    scoreRef.current = 0;
    timeLeftRef.current = GAME_DURATION;

    setSessionCountries(countries);
    setGrid(g);
    setSelected(null);
    setMatched(new Set());
    setNewCells(new Set());
    setSwapAnim(null);
    setReshuffling(false);
    setScore(0);
    setMatchCount(0);
    setMoves(0);
    setTimeLeft(GAME_DURATION);
    syncPhase("playing");
    startTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { startGame(); return stopTimer; }, [startGame]);

  // ── Match processing pipeline ──────────────────────────────────────────────

  function processMatches(
    currentGrid: Grid,
    matches: Match[],
    cascade: number,
    currentMatchCount: number,
    currentScore: number,
  ) {
    animLockRef.current = true;

    const matchedSet = new Set(matches.flatMap(m => m.cells.map(({ r, c }) => `${r},${c}`)));
    setMatched(matchedSet);

    const pts = scoreForMatches(matches, cascade);
    const newScore = currentScore + pts;
    syncScore(newScore);

    const newMatchCount = currentMatchCount + matches.length;
    syncMatchCount(newMatchCount);

    // Flash matched cells
    setTimeout(() => {
      setMatched(new Set());

      // Check win after adding to match count
      if (newMatchCount >= MATCH_TARGET) {
        setGrid(gridRef.current); // final state
        setTimeout(triggerWin, 300);
        return;
      }

      // Apply gravity + refill
      const cleared = clearMatchedCells(currentGrid, matches);
      const fallen = applyGravity(cleared);
      const filled = refillGrid(fallen, sessionFlagsRef.current);
      const freshCells = getNewCellKeys(fallen, filled);

      setNewCells(freshCells);
      syncGrid(filled);

      // After fall/fill animation
      setTimeout(() => {
        setNewCells(new Set());

        // Cascade check
        const cascadeMatches = findMatches(filled);
        if (cascadeMatches.length > 0 && cascade < MAX_CASCADE) {
          processMatches(filled, cascadeMatches, cascade + 1, newMatchCount, newScore);
        } else {
          // Check solvability
          if (!hasPossibleMove(filled)) {
            doReshuffle(filled);
          } else {
            syncPhase("playing");
            animLockRef.current = false;
          }
        }
      }, 550);
    }, 480);
  }

  function doReshuffle(currentGrid: Grid) {
    syncPhase("reshuffling");
    setReshuffling(true);
    setTimeout(() => {
      const reshuffled = reshuffleGrid(currentGrid, sessionFlagsRef.current);
      syncGrid(reshuffled);
      setReshuffling(false);
      setTimeout(() => {
        syncPhase("playing");
        animLockRef.current = false;
      }, 400);
    }, 600);
  }

  // ── Cell tap handler ───────────────────────────────────────────────────────

  const handleCellTap = useCallback((r: number, c: number) => {
    if (phaseRef.current !== "playing" || animLockRef.current) return;

    setSelected(prev => {
      const grid = gridRef.current;

      if (!prev) {
        return { r, c };
      }

      if (prev.r === r && prev.c === c) {
        return null; // deselect
      }

      if (!isAdjacent(prev, { r, c })) {
        return { r, c }; // move selection
      }

      // Attempt swap
      const a = prev;
      const b = { r, c };

      syncPhase("swapping");
      animLockRef.current = true;

      // Show swap animation (both cells move toward each other)
      setSwapAnim({ a, b, valid: null });

      setTimeout(() => {
        const createsMatch = swapCreatesMatch(grid, a, b);

        if (!createsMatch) {
          // Invalid — animate back
          setSwapAnim({ a, b, valid: false });
          setTimeout(() => {
            setSwapAnim(null);
            syncPhase("playing");
            animLockRef.current = false;
          }, 320);
          return;
        }

        // Valid swap
        const newGrid = swapGrid(grid, a, b);
        setMoves(m => m + 1);
        setSwapAnim({ a, b, valid: true });

        setTimeout(() => {
          setSwapAnim(null);
          syncGrid(newGrid);
          const matches = findMatches(newGrid);
          syncPhase("resolving");
          processMatches(newGrid, matches, 0, matchCountRef.current, scoreRef.current);
        }, 200);
      }, 200);

      return null;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restart = useCallback(() => { startGame(); }, [startGame]);
  const exitGame = useCallback(() => { stopTimer(); onExit(); }, [onExit]);

  return {
    phase, grid, sessionCountries, selected,
    matched, newCells, reshuffling, swapAnim,
    score, matchCount, moves, timeLeft,
    handleCellTap, restart, exitGame,
  };
}
