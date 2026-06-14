"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BOARD_SIZE, GAME_DURATION, MATCH_TARGET, MAX_CASCADE, SESSION_FLAG_COUNT,
  CellBoard, Pos, Match,
  generateCellBoard, toGrid, findMatches, isAdjacent,
  swapCreatesMatch, swapCellBoard,
  clearGravityRefill, hasPossibleMove, reshuffleCellBoard,
  scoreForMatches, scoreTimeBonus, saveMatchResult,
} from "@/lib/match-game/engine";
import { ALL_GAME_COUNTRIES, GameCountry, shuffle } from "@/lib/game-engine";

export type GamePhase =
  | "idle" | "playing" | "swapping" | "resolving" | "reshuffling" | "won" | "lost";

export interface FlagMatchState {
  phase: GamePhase;
  board: CellBoard;
  sessionCountries: GameCountry[];
  selectedPos: Pos | null;
  matchedIds: Set<string>;
  newIds: Set<string>;
  reshuffling: boolean;
  score: number;
  matchCount: number;
  moves: number;
  timeLeft: number;
  handleCellTap:   (r: number, c: number) => void;
  handleCellSwipe: (r: number, c: number, dr: number, dc: number) => void;
  restart:  () => void;
  exitGame: () => void;
}

export function useFlagMatchGame(onExit: () => void): FlagMatchState {
  const [phase, setPhase]               = useState<GamePhase>("idle");
  const [board, setBoard]               = useState<CellBoard>([]);
  const [sessionCountries, setSessCtrs] = useState<GameCountry[]>([]);
  const [selectedPos, setSelectedPos]   = useState<Pos | null>(null);
  const [matchedIds, setMatchedIds]     = useState<Set<string>>(new Set());
  const [newIds, setNewIds]             = useState<Set<string>>(new Set());
  const [reshuffling, setReshuffling]   = useState(false);
  const [score, setScore]               = useState(0);
  const [matchCount, setMatchCount]     = useState(0);
  const [moves, setMoves]               = useState(0);
  const [timeLeft, setTimeLeft]         = useState(GAME_DURATION);

  const boardRef        = useRef<CellBoard>([]);
  const phaseRef        = useRef<GamePhase>("idle");
  const selectedRef     = useRef<Pos | null>(null);
  const matchCountRef   = useRef(0);
  const scoreRef        = useRef(0);
  const sessionFlagsRef = useRef<string[]>([]);
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

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function later(fn: () => void, ms: number) {
    const t = setTimeout(() => { if (isMounted.current) fn(); }, ms);
    pendingTimers.current.push(t);
  }

  function setPhaseSync(p: GamePhase) { phaseRef.current = p; setPhase(p); }
  function setBoardSync(b: CellBoard) { boardRef.current = b; setBoard(b); }
  function selectPos(pos: Pos | null)  { selectedRef.current = pos; setSelectedPos(pos); }

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function startTimer() {
    stopTimer();
    timerRef.current = setInterval(() => {
      if (!isMounted.current) return;
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) { stopTimer(); endLoss(); }
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

  // ── Start / Restart ───────────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    stopTimer();
    pendingTimers.current.forEach(clearTimeout);
    pendingTimers.current = [];
    isAnimating.current = false;

    const countries = shuffle(ALL_GAME_COUNTRIES).slice(0, SESSION_FLAG_COUNT);
    const flags = countries.map(c => c.code);
    sessionFlagsRef.current = flags;

    const b = generateCellBoard(flags);
    boardRef.current = b;
    matchCountRef.current = 0;
    scoreRef.current = 0;
    timeLeftRef.current = GAME_DURATION;

    setSessCtrs(countries);
    setBoard(b);
    selectPos(null);
    setMatchedIds(new Set());
    setNewIds(new Set());
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

  // ── Match pipeline ────────────────────────────────────────────────────────────

  function runMatchPipeline(
    b: CellBoard, matches: Match[],
    cascade: number, curMatchCount: number, curScore: number,
  ) {
    isAnimating.current = true;

    const ids = new Set(matches.flatMap(m => m.cells.map(({ r, c }) => b[r][c].id)));
    setMatchedIds(ids);

    const pts = scoreForMatches(matches, cascade);
    const newScore = curScore + pts;
    scoreRef.current = newScore;
    setScore(newScore);

    const newMatchCount = curMatchCount + matches.length;
    matchCountRef.current = newMatchCount;
    setMatchCount(newMatchCount);

    later(() => {
      setMatchedIds(new Set());

      if (newMatchCount >= MATCH_TARGET) {
        later(endWin, 200);
        return;
      }

      const { newBoard, newIds: fresh } = clearGravityRefill(b, matches, sessionFlagsRef.current);
      setBoardSync(newBoard);
      setNewIds(fresh);

      later(() => {
        setNewIds(new Set());
        const cascadeMatches = findMatches(toGrid(newBoard));
        if (cascadeMatches.length > 0 && cascade < MAX_CASCADE) {
          runMatchPipeline(newBoard, cascadeMatches, cascade + 1, newMatchCount, newScore);
        } else if (!hasPossibleMove(toGrid(newBoard))) {
          doReshuffle(newBoard);
        } else {
          setPhaseSync("playing");
          isAnimating.current = false;
        }
      }, 550);
    }, 450);
  }

  function doReshuffle(b: CellBoard) {
    setPhaseSync("reshuffling");
    setReshuffling(true);
    later(() => {
      setBoardSync(reshuffleCellBoard(b, sessionFlagsRef.current));
      setReshuffling(false);
      later(() => { setPhaseSync("playing"); isAnimating.current = false; }, 400);
    }, 600);
  }

  // ── Core swap logic (shared by tap and swipe) ─────────────────────────────────

  function doSwap(a: Pos, b: Pos) {
    if (phaseRef.current !== "playing" || isAnimating.current) return;

    selectPos(null);
    isAnimating.current = true;
    setPhaseSync("swapping");

    const currentBoard = boardRef.current;
    const currentGrid  = toGrid(currentBoard);

    // Immediately reorder board → layoutId FLIP animates the swap visually
    const swapped = swapCellBoard(currentBoard, a, b);
    setBoardSync(swapped);

    later(() => {
      const valid = swapCreatesMatch(currentGrid, a, b);

      if (!valid) {
        // Swap back — layoutId FLIP animates the return
        setBoardSync(currentBoard);
        later(() => {
          setPhaseSync("playing");
          isAnimating.current = false;
        }, 260);
        return;
      }

      setMoves(m => m + 1);
      setPhaseSync("resolving");
      const matches = findMatches(toGrid(swapped));
      later(() => {
        runMatchPipeline(swapped, matches, 0, matchCountRef.current, scoreRef.current);
      }, 60);
    }, 260);
  }

  // ── Tap: select → select adjacent → swap ─────────────────────────────────────

  const handleCellTap = useCallback((r: number, c: number) => {
    if (phaseRef.current !== "playing" || isAnimating.current) return;

    const prev = selectedRef.current;

    if (!prev)                              { selectPos({ r, c }); return; }
    if (prev.r === r && prev.c === c)       { selectPos(null);     return; }
    if (!isAdjacent(prev, { r, c }))        { selectPos({ r, c }); return; }

    doSwap(prev, { r, c });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Swipe: drag in direction → immediate swap ─────────────────────────────────

  const handleCellSwipe = useCallback((r: number, c: number, dr: number, dc: number) => {
    const r2 = r + dr;
    const c2 = c + dc;
    // Ignore if target is out of bounds
    if (r2 < 0 || r2 >= BOARD_SIZE || c2 < 0 || c2 >= BOARD_SIZE) return;

    doSwap({ r, c }, { r: r2, c: c2 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restart  = useCallback(() => startGame(), [startGame]);
  const exitGame = useCallback(() => { stopTimer(); onExit(); }, [onExit]);

  return {
    phase, board, sessionCountries, selectedPos,
    matchedIds, newIds, reshuffling,
    score, matchCount, moves, timeLeft,
    handleCellTap, handleCellSwipe, restart, exitGame,
  };
}
