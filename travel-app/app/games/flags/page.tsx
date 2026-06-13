"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  buildFlagSession,
  accuracy,
  saveBest,
  getBest,
  REGION_LABELS,
  MODE_LABELS,
  type FlagQuestion,
  type GameCountry,
  type GameMode,
  type GameRegion,
} from "@/lib/game-engine";

type Phase = "setup" | "playing" | "feedback" | "done";

interface GS {
  questions: FlagQuestion[];
  idx: number;
  score: number;
  streak: number;
  best: number;
  mistakes: number;
  selectedCode: string | null;
}

const MODES: GameMode[] = ["quick", "challenge", "full"];
const REGIONS: GameRegion[] = ["all", "europe", "asia", "africa", "north_america", "south_america", "oceania"];

export default function FlagsGame() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<GameMode>("challenge");
  const [region, setRegion] = useState<GameRegion>("all");
  const [gs, setGs] = useState<GS | null>(null);
  const bestKey = `flags:${mode}:${region}`;

  function start() {
    const questions = buildFlagSession(mode, region);
    setGs({ questions, idx: 0, score: 0, streak: 0, best: 0, mistakes: 0, selectedCode: null });
    setPhase("playing");
  }

  function choose(code: string) {
    if (!gs || phase === "feedback") return;
    const q = gs.questions[gs.idx];
    const correct = code === q.country.code;
    const newStreak = correct ? gs.streak + 1 : 0;

    setGs((prev) =>
      prev
        ? {
            ...prev,
            score: correct ? prev.score + 1 : prev.score,
            streak: newStreak,
            best: Math.max(prev.best, newStreak),
            mistakes: correct ? prev.mistakes : prev.mistakes + 1,
            selectedCode: code,
          }
        : prev
    );
    setPhase("feedback");
    (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.(
      correct ? "success" : "error"
    );
  }

  function next() {
    if (!gs) return;
    const nextIdx = gs.idx + 1;
    if (nextIdx >= gs.questions.length) {
      saveBest(bestKey, gs.score);
      setPhase("done");
    } else {
      setGs((prev) => prev ? { ...prev, idx: nextIdx, selectedCode: null } : prev);
      setPhase("playing");
    }
  }

  function restart() {
    setPhase("setup");
    setGs(null);
  }

  // ── SETUP ──
  if (phase === "setup") {
    return (
      <main className="mx-auto min-h-[100dvh] w-full max-w-lg px-4 pb-20 pt-6">
        <header className="mb-6 flex items-center gap-3">
          <Link href="/games" className="text-2xl text-cream/50">←</Link>
          <div>
            <h1 className="font-display text-xl font-bold text-cream">Угадай флаг</h1>
            <p className="text-[12px] text-cream/40">Выбери страну по флагу</p>
          </div>
        </header>

        <div className="space-y-5">
          <Section label="Режим">
            <div className="flex gap-2">
              {MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-2xl py-3 text-[13px] font-semibold transition ${
                    mode === m
                      ? "bg-gradient-to-r from-blue-400 to-violet-500 text-white"
                      : "glass-soft text-cream/60"
                  }`}
                >
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>
          </Section>

          <Section label="Регион">
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`rounded-2xl py-2.5 text-[13px] font-medium transition ${
                    region === r
                      ? "bg-blue-400/20 text-blue-300 ring-1 ring-blue-400/40"
                      : "glass-soft text-cream/55"
                  }`}
                >
                  {REGION_LABELS[r]}
                </button>
              ))}
            </div>
          </Section>

          <div className="glass rounded-2xl p-4 text-[13px] text-cream/50">
            🎌 4 варианта ответа. Варианты выбираются из того же региона.
          </div>
        </div>

        <motion.button
          onClick={start}
          whileTap={{ scale: 0.97 }}
          className="fixed inset-x-4 bottom-6 z-10 rounded-2xl bg-gradient-to-r from-blue-400 to-violet-500 py-4 text-base font-bold text-white shadow-[0_14px_36px_-10px_rgba(96,165,250,0.7)]"
        >
          Начать игру →
        </motion.button>
      </main>
    );
  }

  if (!gs) return null;
  const fq = gs.questions[gs.idx];
  const total = gs.questions.length;
  const progress = (gs.idx / total) * 100;
  const correct = fq.country.code;

  // ── DONE ──
  if (phase === "done") {
    const acc = accuracy(gs.score, total);
    const best = getBest(bestKey);
    return (
      <FlagResultScreen
        score={gs.score}
        total={total}
        acc={acc}
        bestStreak={gs.best}
        best={best}
        onRestart={restart}
      />
    );
  }

  // ── PLAYING / FEEDBACK ──
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-4 pb-6 pt-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={restart}
          className="rounded-xl px-3 py-2 text-[13px] text-cream/50 transition active:bg-white/5"
        >
          ✕ Выйти
        </button>
        <span className="text-[13px] font-semibold text-cream/70">
          {gs.idx + 1} / {total}
        </span>
        <div className="flex items-center gap-2 text-[13px] font-bold">
          {gs.streak >= 2 && <span className="text-orange-400">🔥 {gs.streak}</span>}
          <span className="text-blue-300">✨ {gs.score}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-forest-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Flag */}
      <AnimatePresence mode="wait">
        <motion.div
          key={gs.idx}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.28 }}
          className="mb-8 flex flex-1 flex-col"
        >
          <div className="glass mb-6 flex flex-col items-center rounded-3xl py-10 text-center">
            <span className="text-[96px] leading-none">{fq.country.flag}</span>
            <p className="mt-4 text-[13px] text-cream/35">
              Какой стране принадлежит этот флаг?
            </p>
          </div>

          {/* Choices */}
          <div className="grid grid-cols-2 gap-3">
            {fq.choices.map((c) => {
              let bg = "glass-soft";
              let text = "text-cream";
              if (phase === "feedback") {
                if (c.code === correct) {
                  bg = "bg-emerald2-400/20 ring-2 ring-emerald2-400/60";
                  text = "text-emerald2-300";
                } else if (c.code === gs.selectedCode && c.code !== correct) {
                  bg = "bg-red-500/20 ring-2 ring-red-500/50";
                  text = "text-red-400";
                } else {
                  bg = "bg-white/[0.03]";
                  text = "text-cream/30";
                }
              }

              return (
                <motion.button
                  key={c.code}
                  onClick={() => choose(c.code)}
                  disabled={phase === "feedback"}
                  whileTap={phase === "playing" ? { scale: 0.97 } : undefined}
                  className={`rounded-2xl px-3 py-4 text-left text-[13px] font-semibold transition ${bg} ${text}`}
                >
                  <span className="mr-1.5 text-xl">{c.flag}</span>
                  {c.nameRu}
                </motion.button>
              );
            })}
          </div>

          {phase === "feedback" && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={next}
              whileTap={{ scale: 0.97 }}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-400 to-violet-500 py-4 text-base font-bold text-white shadow-[0_12px_28px_-8px_rgba(96,165,250,0.5)]"
            >
              {gs.idx + 1 >= total ? "Результаты 🏁" : "Следующий →"}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function FlagResultScreen({
  score,
  total,
  acc,
  bestStreak,
  best,
  onRestart,
}: {
  score: number;
  total: number;
  acc: number;
  bestStreak: number;
  best: number;
  onRestart: () => void;
}) {
  const isNewBest = score >= best && score > 0;

  function share() {
    const text = `Угадай флаг: ${score}/${total} (${acc}%) 🔥${bestStreak}\nhttps://my-trewel-telega.vercel.app/games`;
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(`https://t.me/share/url?url=https://my-trewel-telega.vercel.app/games&text=${encodeURIComponent(text)}`);
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-6 pb-10 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500 text-5xl shadow-[0_0_50px_-8px_rgba(96,165,250,0.7)]"
      >
        🎌
      </motion.div>

      <h2 className="font-display text-3xl font-bold text-cream">Игра окончена!</h2>
      {isNewBest && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2 inline-block rounded-full bg-amber-400/20 px-3 py-1 text-[12px] font-bold text-amber-300 ring-1 ring-amber-400/30"
        >
          🏆 Новый рекорд!
        </motion.span>
      )}

      <div className="mt-8 grid w-full grid-cols-2 gap-3">
        <StatCard label="Очки" value={`${score} / ${total}`} big />
        <StatCard label="Точность" value={`${acc}%`} big />
        <StatCard label="Серия" value={`🔥 ${bestStreak}`} />
        <StatCard label="Рекорд" value={`⭐ ${Math.max(best, score)}`} />
      </div>

      <div className="mt-8 flex w-full flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-400 to-violet-500 py-4 text-base font-bold text-white shadow-[0_12px_28px_-8px_rgba(96,165,250,0.5)]"
        >
          ↩ Сыграть снова
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={share}
          className="w-full rounded-2xl glass py-3.5 text-[14px] font-semibold text-cream/80"
        >
          📤 Поделиться результатом
        </motion.button>
        <Link
          href="/games"
          className="w-full rounded-2xl py-3 text-center text-[14px] text-cream/45 transition hover:text-cream/70"
        >
          ← К играм
        </Link>
      </div>
    </motion.main>
  );
}

function StatCard({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <p className={`font-display font-extrabold ${big ? "text-3xl" : "text-2xl"} text-blue-300`}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-cream/45">{label}</p>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-widest text-cream/40">{label}</p>
      {children}
    </div>
  );
}
