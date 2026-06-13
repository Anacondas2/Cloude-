"use client";

import Link from "next/link";
import { getResultMessage, calcAccuracy, BestScore } from "@/lib/game-engine";

interface Props {
  score: number;
  total: number;
  bestStreak: number;
  mistakes: number;
  prevBest: BestScore;
  color: "green" | "blue";
  onRestart: () => void;
  onChangeSetup: () => void;
}

export function GameResult({ score, total, bestStreak, mistakes, prevBest, color, onRestart, onChangeSetup }: Props) {
  const acc = calcAccuracy(score, total);
  const msg = getResultMessage(acc);
  const isNewBest = acc > prevBest.accuracy || (acc === prevBest.accuracy && score > prevBest.score);

  const accentBtn = color === "green"
    ? "from-emerald2-400 to-lime2-400 text-forest-950"
    : "from-blue-400 to-violet-500 text-white";

  function handleShare() {
    const text = `${msg.emoji} ${msg.title}\n${score}/${total} · ${acc}% · Серия ${bestStreak}\n🌍 Trewel — угадай столицы и флаги`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp;
    if (typeof window !== "undefined" && tg?.openTelegramLink) {
      tg.openTelegramLink(
        `https://t.me/share/url?url=https://my-trewel-telega.vercel.app&text=${encodeURIComponent(text)}`
      );
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-4 pb-20 pt-6">
      <div className="w-full space-y-6 text-center">
        <div className="text-6xl">{msg.emoji}</div>
        <div>
          <h2 className="font-display text-2xl font-bold text-cream">{msg.title}</h2>
          <p className="mt-1 text-[14px] text-cream/55">{msg.sub}</p>
        </div>

        {isNewBest && (
          <div className="rounded-2xl bg-amber-400/10 px-4 py-2 text-[13px] font-semibold text-amber-400">
            🏆 Новый рекорд!
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Очки", value: score },
            { label: "Точность", value: `${acc}%` },
            { label: "Серия", value: bestStreak },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-white/[0.05] py-4">
              <p className="text-xl font-bold text-cream">{value}</p>
              <p className="text-[11px] text-cream/40">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-[13px] text-cream/50">
          <div className="rounded-xl bg-white/[0.03] py-3">
            <span className="font-semibold text-cream/70">{total - mistakes}</span> верных
          </div>
          <div className="rounded-xl bg-white/[0.03] py-3">
            <span className="font-semibold text-cream/70">{mistakes}</span> ошибок
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className={`w-full rounded-2xl bg-gradient-to-r ${accentBtn} px-8 py-4 text-base font-bold shadow-lg transition active:scale-[0.97]`}
          >
            Играть снова
          </button>
          <button
            onClick={onChangeSetup}
            className="w-full rounded-2xl border border-white/10 px-8 py-3.5 text-[14px] font-semibold text-cream/60 transition hover:text-cream/80 active:scale-[0.97]"
          >
            Сменить режим
          </button>
          <button
            onClick={handleShare}
            className="w-full rounded-2xl border border-white/10 px-8 py-3.5 text-[14px] font-semibold text-cream/60 transition hover:text-cream/80 active:scale-[0.97]"
          >
            📤 Поделиться результатом
          </button>
          <Link
            href="/games"
            className="block text-center text-[13px] text-cream/35 transition hover:text-cream/60"
          >
            ← В меню игр
          </Link>
        </div>
      </div>
    </main>
  );
}
