"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ALL_GAME_COUNTRIES } from "@/lib/game-engine";

const GAMES = [
  {
    href: "/games/capitals",
    icon: "🏛️",
    title: "Угадай столицу",
    desc: "Введи столицу страны",
    sub: "Текстовый ввод · принимается RU и EN",
    gradient: "from-emerald2-400 to-lime2-400",
    shadow: "shadow-[0_12px_32px_-8px_rgba(52,224,140,0.5)]",
  },
  {
    href: "/games/flags",
    icon: "🎌",
    title: "Угадай флаг",
    desc: "Выбери страну по флагу",
    sub: "4 варианта ответа · быстрый клик",
    gradient: "from-blue-400 to-violet-500",
    shadow: "shadow-[0_12px_32px_-8px_rgba(96,165,250,0.5)]",
  },
];

export default function GamesPage() {
  const total = ALL_GAME_COUNTRIES.length;

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-2xl px-4 pb-20 pt-6">
      <header className="mb-8 flex items-center gap-4">
        <Link href="/" className="text-2xl text-cream/50 transition hover:text-cream">
          ←
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">Игры</h1>
          <p className="text-[12px] text-cream/45">{total} стран · угадывай и учись</p>
        </div>
      </header>

      <div className="space-y-4">
        {GAMES.map((g, i) => (
          <motion.div
            key={g.href}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={g.href}>
              <div className={`glass rounded-3xl p-6 transition active:scale-[0.98] ${g.shadow}`}>
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${g.gradient} text-3xl shadow-neu-in`}
                  >
                    {g.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-xl font-bold text-cream">{g.title}</h2>
                    <p className="mt-0.5 text-[14px] text-cream/70">{g.desc}</p>
                    <p className="mt-1 text-[12px] text-cream/40">{g.sub}</p>
                  </div>
                  <span className="mt-1 text-cream/30">→</span>
                </div>

                <div className="mt-4 flex gap-2">
                  {["10 вопр.", "25 вопр.", "Все страны"].map((m) => (
                    <span
                      key={m}
                      className="glass-soft rounded-full px-2.5 py-1 text-[11px] text-cream/55"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 rounded-3xl bg-white/[0.03] p-5 text-center"
      >
        <p className="text-[13px] leading-relaxed text-cream/45">
          🌍 В базе {total} стран с правильными столицами и флагами.
          <br />
          Принимаются русские и английские варианты написания.
        </p>
      </motion.div>
    </main>
  );
}
