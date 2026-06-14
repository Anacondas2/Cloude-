"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFlagMatchGame } from "@/hooks/useFlagMatchGame";
import { GameBoard } from "./GameBoard";
import { TimerBar } from "./TimerBar";
import { ProgressGoal } from "./ProgressGoal";
import { GameResultModal } from "./GameResultModal";
import { GameHelpModal } from "./GameHelpModal";
import { loadMatchBest, MatchBest } from "@/lib/match-game/engine";

interface Props { onExit: () => void }

export function FlagMatchGame({ onExit }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const [best, setBest] = useState<MatchBest | null>(null);
  useEffect(() => { setBest(loadMatchBest()); }, []);

  const game = useFlagMatchGame(onExit);
  const isDone = game.phase === "won" || game.phase === "lost";

  return (
    <div className="relative flex min-h-[100dvh] flex-col px-3 pt-4 pb-6 select-none overflow-hidden">

      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={game.exitGame}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-cream/50 transition hover:text-cream active:scale-90"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-display text-[15px] font-bold text-cream leading-none">4 флага в ряд</h1>
          {best && best.totalWins > 0 && (
            <p className="text-[10px] text-cream/30">Рекорд: {best.bestScore.toLocaleString()} · {best.totalWins} побед</p>
          )}
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-cream/50 font-bold transition hover:text-cream active:scale-90"
        >
          ?
        </button>
      </div>

      {/* Timer */}
      <div className="mb-3">
        <TimerBar timeLeft={game.timeLeft} />
      </div>

      {/* Stats */}
      <div className="mb-3 flex items-center justify-between">
        <ProgressGoal matchCount={game.matchCount} />
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-cream/35">Очки</p>
          <p className="text-sm font-bold text-cream tabular-nums">{game.score.toLocaleString()}</p>
        </div>
      </div>

      {/* Board */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <GameBoard
          board={game.board}
          sessionCountries={game.sessionCountries}
          selectedPos={game.selectedPos}
          matchedIds={game.matchedIds}
          newIds={game.newIds}
          reshuffling={game.reshuffling}
          onCellTap={game.handleCellTap}
          onCellSwipe={game.handleCellSwipe}
        />

        <AnimatePresence>
          {game.reshuffling && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="rounded-full bg-amber-400/15 px-4 py-1.5 text-[12px] font-semibold text-amber-400"
            >
              🌀 Нет ходов — перемешиваем…
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          {game.sessionCountries.map(c => (
            <span key={c.code} className="text-xl" title={c.nameRu}>{c.flag}</span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-cream/30">{game.moves} ходов</span>
          <button
            onClick={game.restart}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-[12px] font-semibold text-cream/50 transition hover:text-cream/80 active:scale-95"
          >
            ↺ Заново
          </button>
        </div>
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

      <AnimatePresence>
        {showHelp && <GameHelpModal onClose={() => setShowHelp(false)} />}
      </AnimatePresence>
    </div>
  );
}
