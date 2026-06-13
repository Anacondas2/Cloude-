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

export interface SwapPair { a: Pos; b: Pos }

export interface FlagMatchState {
  phase: GamePhase;
  grid: Grid;
  cellGeneration: number[][];  // increments when a cell is refilled (triggers new-cell animation)
  sessionCountries: GameCountry[];
  selected: Pos | null;
  matchedCells: Set<string>;   // "r,c" of cells being cleared (highlight)
  swappingCells: SwapPair | null; // cells being animated during swap
  invalidCells: SwapPair | null;  // cells doing shake on invalid swap
  reshuffling: boolean;
  score: number;
  matchCount: number;
  moves: number;
  timeLeft: number;
  handleCellTap: (r: number, c: number) => void;
  restart: () => void;
  exitGame: () => void;
}

function newGenGrid(): number[][] {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

export function useFlagMatchGame(onExit: () => void): FlagMatchState {
  // ── Render state ────────────────────────────────────────────────────────────
  const [phase, setPhase]               = useState<GamePhase>("idle");
  const [grid, setGrid]                 = useState<Grid>([]);
  const [cellGeneration, setCellGen]    = useState<number[][]>(newGenGrid());
  const [sessionCountries, setSessCtrs] = useState<GameCountry[]>([]);
  const [selected, setSelected]         = useState<Pos | null>(null);
  const [matchedCells, setMatchedCells] = useState<Set<string>>(new Set());
  const [swappingCells, setSwappingCells] = useState<SwapPair | null>(null);
  const [invalidCells, setInvalidCells]   = useState<SwapPair | null>(null);
  const [reshuffling, setReshuffling]   = useState(false);
  const [score, setScore]               = useState(0);
  const [matchCount, setMatchCount]     = useState(0);
  const [moves, setMoves]               = useState(0);
  const [timeLeft, setTimeLeft]         = useState(GAME_DURATION);

  // ── Mutable refs (safe inside setTimeout/setInterval closures) ─────────────
  const phaseRef        = useRef<GamePhase>("idle");
  const gridRef         = useRef<Grid>([]);
  const cellGenRef      = useRef<number[][]>(newGenGrid());
  const matchCountRef   = useRef(0);
  const scoreRef        = useRef(0);
  const sessionFlagsRef = useRef<string[]>([]);
  const selectedRef     = useRef<Pos | null>(null);  // sync selection (no stale closure)
  const isAnimating     = useRef(false);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef     = useRef(GAME_DURATION);
  const pendingTimers   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isMounted       = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopTimer();
      pendingTimers.current.forEach(clearTimeout);
    };
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function later(fn: () => void, ms: number) {
    const t = setTimeout(() => { if (isMounted.current) fn(); }, ms);
    pendingTimers.current.push(t);
    return t;
  }

  function setPhaseSync(p: GamePhase) { phaseRef.current = p; setPhase(p); }

  function setGridSync(g: Grid) { gridRef.current = g; setGrid(g); }

  function selectCell(pos: Pos | null) { selectedRef.current = pos; setSelected(pos); }

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function startTimer() {
    stopTimer();
    timerRef.current = setInterval(() => {
      if (!isMounted.current) return;
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        stopTimer();
        endLoss();
      }
    }, 1000);
  }

  function endWin() {
    stopTimer();
    isAnimating.current = false;
    const bonus = scoreTimeBonus(timeLeftRef.current);
    const final = scoreRef.current + bonus;
    scoreRef.current = final;
    setScore(final);
    setPhaseSync("won");
    saveMatchResult({ score: final, won: true, timeLeft: timeLeftRef.current, flags: sessionFlagsRef.current });
  }

  function endLoss() {
    isAnimating.current = false;
    setPhaseSync("lost");
    saveMatchResult({ score: scoreRef.current, won: false, timeLeft: 0, flags: sessionFlagsRef.current });
  }

  // ── Board start ─────────────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    stopTimer();
    pendingTimers.current.forEach(clearTimeout);
    pendingTimers.current = [];
    isAnimating.current = false;

    const countries = shuffle(ALL_GAME_COUNTRIES).slice(0, SESSION_FLAG_COUNT);
    const flags = countries.map(c => c.code);
    sessionFlagsRef.current = flags;

    const g = generateGrid(flags);
    gridRef.current = g;
    matchCountRef.current = 0;
    scoreRef.current = 0;
    timeLeftRef.current = GAME_DURATION;

    const gen = newGenGrid();
    cellGenRef.current = gen;

    setSessCtrs(countries);
    setGrid(g);
    setCellGen(gen);
    selectCell(null);
    setMatchedCells(new Set());
    setSwappingCells(null);
    setInvalidCells(null);
    setReshuffling(false);
    setScore(0);
    setMatchCount(0);
    setMoves(0);
    setTimeLeft(GAME_DURATION);
    setPhaseSync("playing");
    startTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { startGame(); }, [startGame]);

  // ── Match pipeline ──────────────────────────────────────────────────────────

  function runMatchPipeline(
    g: Grid,
    matches: Match[],
    cascade: number,
    curMatchCount: number,
    curScore: number,
  ) {
    isAnimating.current = true;

    // 1. Highlight matched cells
    const matchedSet = new Set(matches.flatMap(m => m.cells.map(({ r, c }) => `${r},${c}`)));
    setMatchedCells(matchedSet);

    const pts = scoreForMatches(matches, cascade);
    const newScore = curScore + pts;
    scoreRef.current = newScore;
    setScore(newScore);

    const newMatchCount = curMatchCount + matches.length;
    matchCountRef.current = newMatchCount;
    setMatchCount(newMatchCount);

    // 2. After highlight flash → clear cells, apply gravity, refill
    later(() => {
      setMatchedCells(new Set());

      if (newMatchCount >= MATCH_TARGET) {
        later(endWin, 250);
        return;
      }

      const cleared = clearMatchedCells(g, matches);
      const fallen  = applyGravity(cleared);
      const filled  = refillGrid(fallen, sessionFlagsRef.current);
      const newKeys = getNewCellKeys(fallen, filled);

      // Bump generation for new cells so GameBoard remounts them (triggers entry animation)
      const gen = cellGenRef.current.map(r => [...r]);
      for (const key of newKeys) {
        const [r, c] = key.split(",").map(Number);
        gen[r][c]++;
      }
      cellGenRef.current = gen;

      setGridSync(filled);
      setCellGen([...gen]);

      // 3. After fall+fill animation → check cascade
      later(() => {
        const cascadeMatches = findMatches(filled);
        if (cascadeMatches.length > 0 && cascade < MAX_CASCADE) {
          runMatchPipeline(filled, cascadeMatches, cascade + 1, newMatchCount, newScore);
        } else if (!hasPossibleMove(filled)) {
          doReshuffle(filled);
        } else {
          setPhaseSync("playing");
          isAnimating.current = false;
        }
      }, 520);
    }, 460);
  }

  function doReshuffle(g: Grid) {
    setPhaseSync("reshuffling");
    setReshuffling(true);
    later(() => {
      const reshuffled = reshuffleGrid(g, sessionFlagsRef.current);
      setGridSync(reshuffled);
      setReshuffling(false);
      later(() => {
        setPhaseSync("playing");
        isAnimating.current = false;
      }, 400);
    }, 600);
  }

  // ── Tap handler (NO side-effects inside setState) ──────────────────────────

  const handleCellTap = useCallback((r: number, c: number) => {
    if (phaseRef.current !== "playing" || isAnimating.current) return;

    const prev = selectedRef.current;

    // First tap — select
    if (!prev) { selectCell({ r, c }); return; }

    // Tap same — deselect
    if (prev.r === r && prev.c === c) { selectCell(null); return; }

    // Tap non-adjacent — move selection
    if (!isAdjacent(prev, { r, c })) { selectCell({ r, c }); return; }

    // Adjacent tap — attempt swap
    const a = prev;
    const b = { r, c };
    selectCell(null);
    isAnimating.current = true;
    setPhaseSync("swapping");

    // Show "compression" animation on both cells
    setSwappingCells({ a, b });

    later(() => {
      const g = gridRef.current;
      const valid = swapCreatesMatch(g, a, b);

      setSwappingCells(null);

      if (!valid) {
        // Shake then back to playing
        setInvalidCells({ a, b });
        later(() => {
          setInvalidCells(null);
          setPhaseSync("playing");
          isAnimating.current = false;
        }, 380);
        return;
      }

      // Valid — commit swap
      const newGrid = swapGrid(g, a, b);
      setGridSync(newGrid);
      setMoves(m => m + 1);
      setPhaseSync("resolving");

      // Tiny pause so grid renders before match pipeline starts
      later(() => {
        const matches = findMatches(newGrid);
        runMatchPipeline(newGrid, matches, 0, matchCountRef.current, scoreRef.current);
      }, 60);
    }, 180);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restart  = useCallback(() => startGame(), [startGame]);
  const exitGame = useCallback(() => { stopTimer(); onExit(); }, [onExit]);

  return {
    phase, grid, cellGeneration, sessionCountries,
    selected, matchedCells, swappingCells, invalidCells,
    reshuffling, score, matchCount, moves, timeLeft,
    handleCellTap, restart, exitGame,
  };
}
