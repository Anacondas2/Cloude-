"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  buildCapitalsSession,
  checkCapital,
  accuracy,
  saveBest,
  getBest,
  REGION_LABELS,
  MODE_LABELS,
  type GameCountry,
  type GameMode,
  type GameRegion,
} from "@/lib/game-engine";

type Phase = "setup" | "playing" | "feedback" | "done";

interface GS {
  questions: GameCountry[];
  idx: number;
  score: number;
  streak: number;
  best: number;
  mistakes: number;
}

const MODES: GameMode[] = ["quick", "challenge", "full"];
const REGIONS: GameRegion[] = ["all", "europe", "asia", "africa", "north_america", "south_america", "oceania"];

export default function CapitalsGame() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<GameMode>("challenge");
  const [region, setRegion] = useState<GameRegion>("all");
  const [gs, setGs] = useState<GS | null>(null);
  const [answer, setAnswer] = useState("");
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bestKey = `capitals:${mode}:${region}`;

  useEffect(() => {
    if (phase === "playing" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [phase, gs?.idx]);

  function start() {
    const questions = buildCapitalsSession(mode, region);
    setGs({ questions, idx: 0, score: 0, streak: 0, best: 0, mistakes: 0 });
    setAnswer("");
    setWasCorrect(null);
    setPhase("playing");
  }

  function submit() {
    if (!gs || !answer.trim()) return;
    const q = gs.questions[gs.idx];
    const correct = checkCapital(answer, q);
    const newStreak = correct ? gs.streak + 1 : 0;

    setWasCorrect(correct);
    setGs((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        score: correct ? prev.score + 1 : prev.score,
        streak: newStreak,
        best: Math.max(prev.best, newStreak),
        mistakes: correct ? prev.mistakes : prev.mistakes + 1,
      };
    });
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
      setGs((prev) => prev ? { ...prev, idx: nextIdx } : prev);
      setAnswer("");
      setWasCorrect(null);
      setPhase("playing");
    }
  }

  function restart() {
    setPhase("setup");
    setGs(null);
    setAnswer("");
    setWasCorrect(null);
  }

  // ── SETUP ──
  if (phase === "setup") {
    return (
      <main className="mx-auto min-h-[100dvh] w-full max-w-lg px-4 pb-20 pt-6">
        <header className="mb-6 flex items-center gap-3">
          <Link href="/games" className="text-2xl text-cream/50">←</Link>
          <div>
            <h1 className="font-display text-xl font-bold text-cream">Угадай столицу</h1>
            <p className="text-[12px] text-cream/40">Введи название столицы</p>
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
                      ? "bg-gradient-to-r from-emerald2-400 to-lime2-400 text-forest-950"
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
                      ? "bg-emerald2-400/20 text-emerald2-300 ring-1 ring-emerald2-400/40"
                      : "glass-soft text-cream/55"
                  }`}
                >
                  {REGION_LABELS[r]}
                </button>
              ))}
            </div>
          </Section>

          <div className="glass rounded-2xl p-4 text-[13px] text-cream/50">
            🔡 Принимаются ответы на русском и английском, с учётом вариантов написания.
          </div>
        </div>

        <motion.button
          onClick={start}
          whileTap={{ scale: 0.97 }}
          className="fixed inset-x-4 bottom-6 z-10 rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 py-4 text-base font-bold text-forest-950 shadow-[0_14px_36px_-10px_rgba(52,224,140,0.7)]"
        >
          Начать игру →
        </motion.button>
      </main>
    );
  }

  if (!gs) return null;
  const q = gs.questions[gs.idx];
  const total = gs.questions.length;
  const progress = ((gs.idx + (phase === "done" ? 1 : 0)) / total) * 100;

  // ── DONE ──
  if (phase === "done") {
    const acc = accuracy(gs.score, total);
    const best = getBest(bestKey);
    return (
      <ResultScreen
        icon="🏛️"
        score={gs.score}
        total={total}
        acc={acc}
        bestStreak={gs.best}
        best={best}
        onRestart={restart}
        onHub={() => setPhase("setup")}
        gameLabel="Угадай столицу"
      />
    );
  }

  // ── PLAYING / FEEDBACK ──
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-4 pb-6 pt-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={restart} className="rounded-xl px-3 py-2 text-[13px] text-cream/50 transition active:bg-white/5">
          ✕ Выйти
        </button>
        <div className="text-center">
          <span className="text-[13px] font-semibold text-cream/70">
            {gs.idx + 1} / {total}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-bold text-emerald2-300">
          {gs.streak >= 2 && <span className="text-orange-400">🔥 {gs.streak}</span>}
          <span>✨ {gs.score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-forest-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald2-400 to-lime2-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={gs.idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="flex flex-1 flex-col"
        >
          <div className="glass mb-6 flex flex-col items-center rounded-3xl p-8 text-center">
            <span className="text-7xl">{q.flag}</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-cream">{q.nameRu}</h2>
            <p className="mt-1 text-sm text-cream/40">{q.nameEn}</p>
          </div>

          {phase === "playing" ? (
            <div className="space-y-3">
              <p className="text-[13px] text-cream/50">Столица этой страны?</p>
              <form
                onSubmit={(e) => { e.preventDefault(); submit(); }}
                className="space-y-3"
              >
                <input
                  ref={inputRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Введи столицу…"
                  autoComplete="off"
                  className="neu-inset w-full rounded-2xl px-5 py-4 text-lg text-cream placeholder:text-cream/25 outline-none transition focus:shadow-glow"
                />
                <motion.button
                  type="submit"
                  disabled={!answer.trim()}
                  whileTap={answer.trim() ? { scale: 0.97 } : undefined}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 py-4 text-base font-bold text-forest-950 shadow-[0_12px_28px_-8px_rgba(52,224,140,0.6)] transition disabled:opacity-30"
                >
                  Ответить →
                </motion.button>
              </form>
            </div>
          ) : (
            <FeedbackPanel
              correct={wasCorrect!}
              country={q}
              userAnswer={answer}
              onNext={next}
              isLast={gs.idx + 1 >= total}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function FeedbackPanel({
  correct,
  country,
  userAnswer,
  onNext,
  isLast,
}: {
  correct: boolean;
  country: GameCountry;
  userAnswer: string;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div
        className={`rounded-2xl p-4 ${
          correct
            ? "bg-emerald2-400/10 ring-1 ring-emerald2-400/30"
            : "bg-red-500/10 ring-1 ring-red-500/30"
        }`}
      >
        <p className={`text-lg font-bold ${correct ? "text-emerald2-300" : "text-red-400"}`}>
          {correct ? "✅ Верно!" : "❌ Неверно"}
        </p>
        <p className="mt-1 text-[14px] text-cream/70">
          Столица: <span className="font-semibold text-cream">{country.capitalRu}</span>
          {country.capitalRu !== country.capitalEn && (
            <span className="text-cream/40"> · {country.capitalEn}</span>
          )}
        </p>
        {!correct && userAnswer.trim() && (
          <p className="mt-0.5 text-[13px] text-cream/40">
            Твой ответ: <span className="text-red-400">{userAnswer}</span>
          </p>
        )}
      </div>

      <motion.button
        onClick={onNext}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 py-4 text-base font-bold text-forest-950 shadow-[0_12px_28px_-8px_rgba(52,224,140,0.6)]"
      >
        {isLast ? "Результаты 🏁" : "Следующий →"}
      </motion.button>
    </motion.div>
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

function ResultScreen({
  icon,
  score,
  total,
  acc,
  bestStreak,
  best,
  onRestart,
  onHub,
  gameLabel,
}: {
  icon: string;
  score: number;
  total: number;
  acc: number;
  bestStreak: number;
  best: number;
  onRestart: () => void;
  onHub: () => void;
  gameLabel: string;
}) {
  const isNewBest = score >= best && score > 0;

  function share() {
    const text = `${gameLabel}: ${score}/${total} (${acc}%) 🔥${bestStreak}\nhttps://my-trewel-telega.vercel.app/games`;
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
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald2-400 to-lime2-400 text-5xl shadow-[0_0_50px_-8px_rgba(52,224,140,0.8)]"
      >
        {icon}
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
        <Stat label="Очки" value={`${score} / ${total}`} big />
        <Stat label="Точность" value={`${acc}%`} big />
        <Stat label="Серия" value={`🔥 ${bestStreak}`} />
        <Stat label="Рекорд" value={`⭐ ${Math.max(best, score)}`} />
      </div>

      <div className="mt-8 flex w-full flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          className="w-full rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 py-4 text-base font-bold text-forest-950 shadow-[0_12px_28px_-8px_rgba(52,224,140,0.6)]"
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

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <p className={`font-display font-extrabold grad-text ${big ? "text-3xl" : "text-2xl"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-cream/45">{label}</p>
    </div>
  );
}
