"use client";

import Link from "next/link";
import { GameMode, GameRegion, MODE_CONFIG, REGION_LABELS, BestScore } from "@/lib/game-engine";

interface Props {
  title: string;
  icon: string;
  color: "green" | "blue";
  mode: GameMode;
  region: GameRegion;
  bestScore: BestScore;
  onModeChange: (m: GameMode) => void;
  onRegionChange: (r: GameRegion) => void;
  onStart: () => void;
}

const MODES: GameMode[] = ["quick", "challenge", "full"];
const REGIONS: GameRegion[] = ["all", "europe", "asia", "africa", "north_america", "south_america", "oceania"];

export function GameSetup({
  title, icon, color, mode, region, bestScore,
  onModeChange, onRegionChange, onStart,
}: Props) {
  const accent = color === "green"
    ? { pill: "bg-emerald2-400/20 text-emerald2-300 border-emerald2-400/40", btn: "from-emerald2-400 to-lime2-400 text-forest-950" }
    : { pill: "bg-blue-400/20 text-blue-300 border-blue-400/40", btn: "from-blue-400 to-violet-500 text-white" };

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-lg px-4 pb-20 pt-6">
      <header className="mb-8 flex items-center gap-4">
        <Link href="/games" className="text-2xl text-cream/50 transition hover:text-cream">←</Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">{icon} {title}</h1>
          {bestScore.total > 0 && (
            <p className="text-[12px] text-cream/45">
              Лучший: {bestScore.score} очков · {bestScore.accuracy}% точность
            </p>
          )}
        </div>
      </header>

      <section className="mb-6">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-cream/35">Режим</p>
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`flex-1 rounded-2xl border px-3 py-3 text-center text-[13px] font-semibold transition ${
                mode === m
                  ? `${accent.pill} border-current`
                  : "border-white/10 text-cream/50 hover:text-cream/80"
              }`}
            >
              {MODE_CONFIG[m].label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-cream/35">Регион</p>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => onRegionChange(r)}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                region === r
                  ? `${accent.pill} border-current`
                  : "border-white/10 text-cream/50 hover:text-cream/80"
              }`}
            >
              {REGION_LABELS[r]}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={onStart}
        className={`w-full rounded-2xl bg-gradient-to-r ${accent.btn} px-8 py-4 text-base font-bold shadow-lg transition active:scale-[0.97]`}
      >
        Начать игру →
      </button>
    </main>
  );
}
