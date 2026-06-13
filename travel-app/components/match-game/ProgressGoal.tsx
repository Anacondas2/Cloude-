"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MATCH_TARGET } from "@/lib/match-game/engine";

interface Props {
  matchCount: number;
}

export function ProgressGoal({ matchCount }: Props) {
  const dots = Array.from({ length: MATCH_TARGET }, (_, i) => i < matchCount);

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] uppercase tracking-widest text-cream/40">Собрано</span>
      <div className="flex items-center gap-1.5">
        {dots.map((done, i) => (
          <AnimatePresence key={i}>
            <motion.div
              initial={done ? { scale: 0.4 } : { scale: 1 }}
              animate={{ scale: done ? [1.4, 1] : 1 }}
              className={`h-4 w-4 rounded-full border-2 transition-colors duration-300 ${
                done
                  ? "border-emerald2-400 bg-emerald2-400 shadow-[0_0_8px_rgba(52,224,140,0.7)]"
                  : "border-white/20 bg-transparent"
              }`}
            />
          </AnimatePresence>
        ))}
      </div>
      <span className="text-[13px] font-bold text-cream">
        {matchCount} / {MATCH_TARGET}
      </span>
    </div>
  );
}
