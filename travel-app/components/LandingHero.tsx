"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  onStart: () => void;
  draftCount?: number;
}

const FLOATERS = [
  { e: "🗼", x: "8%", y: "16%", d: 0, s: 1 },
  { e: "🗽", x: "78%", y: "12%", d: 0.4, s: 1.1 },
  { e: "🗻", x: "82%", y: "62%", d: 0.8, s: 0.95 },
  { e: "🏛️", x: "12%", y: "66%", d: 0.6, s: 0.9 },
  { e: "🌋", x: "46%", y: "8%", d: 1.0, s: 0.8 },
  { e: "🏝️", x: "30%", y: "78%", d: 0.2, s: 0.85 },
];

export function LandingHero({ onStart, draftCount = 0 }: Props) {
  const hasDraft = draftCount > 0;
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Floating spatial landmarks */}
      {FLOATERS.map((f, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-4xl opacity-30 blur-[0.4px] sm:text-5xl"
          style={{ left: f.x, top: f.y }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{
            opacity: 0.3,
            scale: f.s,
            y: [0, -14, 0],
          }}
          transition={{
            opacity: { delay: f.d, duration: 0.8 },
            scale: { delay: f.d, duration: 0.8 },
            y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {f.e}
        </motion.span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <span className="glass-soft mb-6 rounded-full px-4 py-1.5 text-[12px] font-medium tracking-wide text-emerald2-300">
          🌍 Публичный travel-челлендж
        </span>

        <h1 className="font-display text-[40px] font-extrabold leading-[1.05] text-cream sm:text-5xl">
          В каких странах
          <br />
          <span className="grad-text text-glow">ты был?</span>
        </h1>

        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-cream/65">
          Выбери страны, которые ты уже посетил. После отправки твой список
          появится в общей публичной ленте.
        </p>

        <div className="mt-9 flex w-full max-w-xs flex-col gap-3">
          <motion.button
            onClick={onStart}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 px-8 py-4 text-base font-bold text-forest-950 shadow-[0_16px_40px_-10px_rgba(52,224,140,0.7)]"
          >
            {hasDraft ? (
              <>
                ↩ Продолжить выбор
                <span className="rounded-full bg-forest-950/20 px-2 py-0.5 text-[12px] font-bold">
                  {draftCount}
                </span>
              </>
            ) : (
              <>
                Начать выбор
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  →
                </motion.span>
              </>
            )}
          </motion.button>

          <Link
            href="/results"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald2-400/20 px-8 py-3.5 text-[14px] font-semibold text-cream/70 transition hover:border-emerald2-400/40 hover:text-cream/90 active:scale-95"
          >
            👥 Смотреть результаты группы
          </Link>

          <Link
            href="/games"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-8 py-3 text-[14px] font-semibold text-cream/55 transition hover:border-white/20 hover:text-cream/80 active:scale-95"
          >
            🎮 Игры · Угадай столицу и флаг
          </Link>
        </div>

        <p className="mt-8 text-xs text-cream/35">
          {hasDraft
            ? "Черновик сохранён · Без регистрации · 195+ стран"
            : "Без регистрации · Видно всей группе · 195+ стран"}
        </p>
      </motion.div>
    </div>
  );
}
