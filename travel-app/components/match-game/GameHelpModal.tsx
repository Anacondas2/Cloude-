"use client";

import { motion } from "framer-motion";
import { MATCH_TARGET, GAME_DURATION } from "@/lib/match-game/engine";

interface Props {
  onClose: () => void;
}

const RULES = [
  { icon: "👆", text: "Нажми на флаг, затем на соседний — они поменяются местами" },
  { icon: "🔀", text: "Можно менять только соседние флаги (вверх, вниз, влево, вправо)" },
  { icon: "4️⃣", text: "Нужно собрать 4 или более одинаковых флага в ряд (горизонталь или вертикаль)" },
  { icon: "🏆", text: `Собери ${MATCH_TARGET} таких комбинации за ${GAME_DURATION} секунд — и победа!` },
  { icon: "💫", text: "Если ход не создаёт комбинацию, флаги вернутся назад" },
  { icon: "🌀", text: "Если ходов нет — доска перемешается автоматически" },
];

export function GameHelpModal({ onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="glass mb-4 w-full max-w-sm rounded-3xl p-6 mx-4"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-cream">Как играть</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 text-cream/60 hover:bg-white/20 hover:text-cream flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {RULES.map(({ icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">{icon}</span>
              <p className="text-[13px] leading-relaxed text-cream/70">{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 py-3 text-sm font-bold text-forest-950"
        >
          Понятно, играть!
        </button>
      </motion.div>
    </motion.div>
  );
}
