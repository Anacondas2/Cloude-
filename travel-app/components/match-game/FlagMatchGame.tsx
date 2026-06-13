"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useFlagMatchGame } from "@/hooks/useFlagMatchGame";
import { GameBoard } from "./GameBoard";
import { TimerBar } from "./TimerBar";
import { ProgressGoal } from "./ProgressGoal";
import { GameResultModal } from "./GameResultModal";
import { GameHelpModal } from "./GameHelpModal";
import { loadMatchBest } from "@/lib/match-game/engine";

interface Props {
  onExit: () => void;
}

export function FlagMatchGame({ onExit }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const game = useFlagMatchGame(onExit);
  const best = loadMatchBest();

  const isDone = game.phase === "won" || game.phase === "lost";

  return (
    <div className="relative flex min-h-[100dvh] flex-col px-3 pt-4 pb-6 select-none">
      {/* Header bar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          onClick={game.exitGame}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-cream/50 transition hover:text-cream"
        >
          ←
        </button>

        <div className="flex-1 text-center">
          <h1 className="font-display text-[15px] font-bold text-cream leading-none">4 флага в ряд</h1>
          {best.totalWins > 0 && (
            <p className="text-[10px] text-cream/30">Рекорд: {best.bestScore.toLocaleString()}</p>
          )}
        </div>

        <button
          onClick={() => setShowHelp(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-cream/50 transition hover:text-cream"
        >
          ?
        </button>
      </div>

      {/* Timer */}
      <div className="mb-3">
        <TimerBar timeLeft={game.timeLeft} />
      </div>

      {/* Stats row */}
      <div className="mb-3 flex items-center justify-between">
        <ProgressGoal matchCount={game.matchCount} />
        <div className="text-right">
          <p className="text-[11px] text-cream/40 uppercase tracking-widest">Очки</p>
          <p className="text-sm font-bold text-cream tabular-nums">{game.score.toLocaleString()}</p>
        </div>
      </div>

      {/* Board */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {game.grid.length > 0 && (
          <GameBoard
            grid={game.grid}
            sessionCountries={game.sessionCountries}
            selected={game.selected}
            matched={game.matched}
            newCells={game.newCells}
            swapAnim={game.swapAnim}
            reshuffling={game.reshuffling}
            onCellTap={game.handleCellTap}
          />
        )}

        {/* Reshuffle notice */}
        <AnimatePresence>
          {game.reshuffling && (
            <div className="mt-3 rounded-full bg-amber-400/15 px-4 py-1.5 text-[12px] font-semibold text-amber-400">
              🌀 Перемешиваем…
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom row: session flags + restart */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {game.sessionCountries.map(c => (
            <span key={c.code} className="text-2xl" title={c.nameRu}>{c.flag}</span>
          ))}
        </div>
        <button
          onClick={game.restart}
          className="rounded-xl border border-white/10 px-4 py-2 text-[12px] font-semibold text-cream/50 transition hover:text-cream/80 active:scale-95"
        >
          ↺ Начать заново
        </button>
      </div>

      {/* Result modal */}
      <AnimatePresence>
        {isDone && (
          <GameResultModal
            won={game.phase === "won"}
            score={game.score}
            matchCount={game.matchCount}
            moves={game.moves}
            timeLeft={game.timeLeft}
            sessionCountries={game.sessionCountries}
            onRestart={game.restart}
          />
        )}
      </AnimatePresence>

      {/* Help modal */}
      <AnimatePresence>
        {showHelp && <GameHelpModal onClose={() => setShowHelp(false)} />}
      </AnimatePresence>
    </div>
  );
}
