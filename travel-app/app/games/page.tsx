"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ALL_GAME_COUNTRIES } from "@/lib/game-engine";

const GAMES = [
  {
    num: "01",
    href: "/games/capitals",
    title: "УГАДАЙ СТОЛИЦУ",
    titleEn: "Guess the Capital",
    desc: "4 варианта · русские и английские названия",
    color: "#00f5c8",
  },
  {
    num: "02",
    href: "/games/flags",
    title: "УГАДАЙ ФЛАГ",
    titleEn: "Guess the Flag",
    desc: "4 варианта · быстрый клик",
    color: "#8833ff",
  },
  {
    num: "03",
    href: "/games/match",
    title: "4 ФЛАГА В РЯД",
    titleEn: "Flag Match",
    desc: "Пазл · 60 секунд · свайп или тап",
    color: "#E60012",
  },
];

const EXPERIENCES = [
  {
    href: "/ajinomoto",
    label: "AJINOMOTO",
    sub: "WebGL · Wave transitions",
    color: "#E60012",
  },
  {
    href: "/physics",
    label: "ФИЗИКА ЧАСТИЦ",
    sub: "Verlet integration · 110 частиц",
    color: "#00f5ff",
  },
];

export default function GamesPage() {
  const total = ALL_GAME_COUNTRIES.length;

  return (
    <main className="relative min-h-[100dvh] w-full bg-black overflow-hidden">

      {/* Film grain */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.038]"
           style={{ mixBlendMode: "overlay" }} xmlns="http://www.w3.org/2000/svg">
        <filter id="gn"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#gn)"/>
      </svg>

      <div className="relative z-10 px-6 pb-24 pt-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .5 }}
          className="mb-10 flex items-start justify-between"
        >
          <div>
            <Link href="/" className="text-[11px] tracking-[.35em] text-white/25 uppercase hover:text-white/50 transition-colors">
              ← Назад
            </Link>
            <h1 className="mt-3 text-[clamp(32px,9vw,52px)] font-black leading-none tracking-tight text-white">
              ИГРЫ
            </h1>
            <p className="mt-1 text-[11px] text-white/25 tracking-[.3em] uppercase">
              {total} стран · угадывай и учись
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/15 tracking-widest uppercase mt-1">03 / игры</p>
          </div>
        </motion.div>

        {/* Red divider */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: .2, duration: .6, ease: [.22,1,.36,1] }}
          className="mb-10 h-px bg-[#E60012] origin-left"
        />

        {/* Games list */}
        <div className="space-y-0">
          {GAMES.map((g, i) => (
            <motion.div
              key={g.href}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .25 + i*.12, duration: .55, ease: [.22,1,.36,1] }}
            >
              <Link href={g.href}>
                <div className="group py-7 border-b border-white/8 flex items-center justify-between cursor-pointer transition-all duration-200 hover:border-white/20 active:scale-[.99]">
                  <div className="flex items-start gap-5">
                    {/* Ghost number */}
                    <span
                      className="text-[28px] font-black leading-none select-none shrink-0 transition-colors duration-200"
                      style={{ color: g.color, opacity: 0.35 }}
                    >
                      {g.num}
                    </span>
                    <div>
                      <p className="text-[clamp(18px,5vw,26px)] font-black tracking-tight text-white leading-none group-hover:text-white/90">
                        {g.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/30 tracking-wide">
                        {g.titleEn}
                      </p>
                      <p className="mt-2 text-[12px] text-white/40">
                        {g.desc}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 ml-3"
                    style={{ color: g.color }}
                  >
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Experiences section */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: .65, duration: .6 }}
          className="mt-12"
        >
          <div className="mb-6 flex items-center gap-4">
            <span className="text-[10px] tracking-[.45em] text-white/20 uppercase">Опыты</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <div className="space-y-0">
            {EXPERIENCES.map((e, i) => (
              <motion.div
                key={e.href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: .7 + i*.1, duration: .45 }}
              >
                <Link href={e.href}>
                  <div className="group py-5 border-b border-white/6 flex items-center justify-between hover:border-white/15 transition-all duration-200 active:scale-[.99]">
                    <div>
                      <p className="text-[15px] font-bold tracking-widest text-white/60 group-hover:text-white/90 transition-colors uppercase">
                        {e.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/22 tracking-wide">
                        {e.sub}
                      </p>
                    </div>
                    <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: e.color }}>→</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom stat */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-14 text-[10px] text-white/15 tracking-[.35em] uppercase text-center"
        >
          Trewel · {total} стран в базе
        </motion.p>
      </div>
    </main>
  );
}
