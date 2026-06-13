"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GameCountry } from "@/lib/game-engine";
import { MATCH_TARGET, GAME_DURATION } from "@/lib/match-game/engine";

interface Props {
  won: boolean;
  score: number;
  matchCount: number;
  moves: number;
  timeLeft: number;
  sessionCountries: GameCountry[];
  onRestart: () => void;
}

export function GameResultModal({ won, score, matchCount, moves, timeLeft, sessionCountries, onRestart }: Props) {
  function handleShare() {
    const text = won
      ? `Я выиграл в «4 флага в ряд» и собрал 3 комбинации за ${GAME_DURATION - timeLeft} секунд 🌍 Попробуй обогнать меня!`
      : `Не успел: собрал ${matchCount}/3 за 60 секунд в игре «4 флага в ряд» 🎌`;
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(
        `https://t.me/share/url?url=https://my-trewel-telega.vercel.app/games/match&text=${encodeURIComponent(text)}`
      );
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
    >
      <div className="glass w-full max-w-sm rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 text-center">
          <div className="text-5xl mb-2">{won ? "🏆" : "⏱️"}</div>
          <h2 className="font-display text-2xl font-bold text-cream">
            {won ? "Победа!" : "Время вышло"}
          </h2>
          <p className="mt-1 text-[13px] text-cream/55">
            {won
              ? `Ты собрал 4 флага в ряд ${MATCH_TARGET} раза.`
              : `Попробуй собрать ${MATCH_TARGET} комбинации быстрее.`}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          {[
            { label: "Очки", value: score.toLocaleString() },
            { label: "Ходов", value: moves },
            won
              ? { label: "Осталось", value: `${timeLeft}с` }
              : { label: "Собрано", value: `${matchCount}/${MATCH_TARGET}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-white/[0.05] py-3 text-center">
              <p className="text-lg font-bold text-cream">{value}</p>
              <p className="text-[10px] text-cream/40">{label}</p>
            </div>
          ))}
        </div>

        {/* Session flags */}
        <div className="mb-5">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-cream/35">Флаги сессии</p>
          <div className="flex items-center justify-center gap-3">
            {sessionCountries.map(c => (
              <div key={c.code} className="text-center">
                <div className="text-3xl">{c.flag}</div>
                <div className="mt-0.5 text-[10px] text-cream/40 leading-none max-w-[40px] truncate">{c.nameRu}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onRestart}
            className={`w-full rounded-2xl py-3.5 text-[15px] font-bold transition active:scale-[0.97] ${
              won
                ? "bg-gradient-to-r from-emerald2-400 to-lime2-400 text-forest-950 shadow-[0_12px_28px_-8px_rgba(52,224,140,0.6)]"
                : "bg-gradient-to-r from-amber-500 to-yellow-400 text-forest-950 shadow-[0_12px_28px_-8px_rgba(245,158,11,0.5)]"
            }`}
          >
            {won ? "Играть снова" : "Попробовать снова"}
          </motion.button>

          <button
            onClick={handleShare}
            className="w-full rounded-2xl border border-white/10 py-3 text-[14px] font-semibold text-cream/60 transition hover:text-cream/80 active:scale-[0.97]"
          >
            📤 Поделиться в Telegram
          </button>

          <Link
            href="/games"
            className="block rounded-2xl border border-white/10 py-3 text-center text-[14px] font-semibold text-cream/50 transition hover:text-cream/70 active:scale-[0.97]"
          >
            Выбрать другую игру
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
