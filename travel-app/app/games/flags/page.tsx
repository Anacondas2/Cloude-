"use client";

import { useState, useCallback } from "react";
import {
  GameMode, GameRegion, FlagQuestion,
  buildFlagSession, loadBest, saveBest, makeBestKey,
  calcAccuracy, BestScore,
} from "@/lib/game-engine";
import { GameSetup } from "@/components/game/GameSetup";
import { GameProgress } from "@/components/game/GameProgress";
import { AnswerOption, AnswerState } from "@/components/game/AnswerOption";
import { GameResult } from "@/components/game/GameResult";

type Phase = "setup" | "quiz" | "done";

const EMPTY_BEST: BestScore = { score: 0, accuracy: 0, streak: 0, total: 0, mode: "" };

export default function FlagsPage() {
  const [phase, setPhase]         = useState<Phase>("setup");
  const [mode, setMode]           = useState<GameMode>("quick");
  const [region, setRegion]       = useState<GameRegion>("all");
  const [questions, setQuestions] = useState<FlagQuestion[]>([]);
  const [qIdx, setQIdx]           = useState(0);
  const [selected, setSelected]   = useState<string | null>(null); // country code
  const [score, setScore]         = useState(0);
  const [streak, setStreak]       = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mistakes, setMistakes]   = useState(0);
  const [prevBest, setPrevBest]   = useState<BestScore>(EMPTY_BEST);

  const bestKey = makeBestKey("flags", mode, region);

  const startGame = useCallback(() => {
    const qs = buildFlagSession(mode, region);
    setQuestions(qs);
    setQIdx(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setMistakes(0);
    setPrevBest(loadBest(bestKey));
    setPhase("quiz");
  }, [mode, region, bestKey]);

  const handleAnswer = useCallback((code: string) => {
    if (selected !== null || !questions[qIdx]) return;
    setSelected(code);

    const correctCode = questions[qIdx].country.code;
    const isCorrect = code === correctCode;
    const newStreak = isCorrect ? streak + 1 : 0;
    const newBest   = Math.max(bestStreak, newStreak);
    const newScore  = isCorrect ? score + 1 : score;
    const newMistakes = isCorrect ? mistakes : mistakes + 1;

    setStreak(newStreak);
    setBestStreak(newBest);
    setScore(newScore);
    setMistakes(newMistakes);

    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= questions.length) {
        const acc = calcAccuracy(newScore, questions.length);
        saveBest(bestKey, { score: newScore, accuracy: acc, streak: newBest, total: questions.length, mode });
        setPhase("done");
      } else {
        setQIdx(next);
        setSelected(null);
      }
    }, 900);
  }, [selected, questions, qIdx, streak, bestStreak, score, mistakes, bestKey, mode]);

  if (phase === "setup") {
    return (
      <GameSetup
        title="Угадай флаг"
        icon="🎌"
        color="blue"
        mode={mode}
        region={region}
        bestScore={loadBest(bestKey)}
        onModeChange={setMode}
        onRegionChange={setRegion}
        onStart={startGame}
      />
    );
  }

  if (phase === "done") {
    return (
      <GameResult
        score={score}
        total={questions.length}
        bestStreak={bestStreak}
        mistakes={mistakes}
        prevBest={prevBest}
        color="blue"
        onRestart={startGame}
        onChangeSetup={() => setPhase("setup")}
      />
    );
  }

  const q = questions[qIdx];
  const correctCode = q.country.code;

  function getState(code: string): AnswerState {
    if (selected === null) return "idle";
    if (code === correctCode) return "correct";
    if (code === selected) return "wrong";
    return "disabled";
  }

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-lg px-4 pb-20 pt-6">
      <div className="mb-6">
        <GameProgress
          current={qIdx + 1}
          total={questions.length}
          score={score}
          streak={streak}
          color="blue"
        />
      </div>

      <div className="mb-8 rounded-3xl bg-white/[0.04] py-10 text-center">
        <p className="mb-4 text-[12px] uppercase tracking-widest text-cream/35">Какой стране принадлежит флаг?</p>
        <div className="text-[96px] leading-none">{q.country.flag}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.choices.map((c) => (
          <AnswerOption
            key={c.code}
            label={c.nameRu}
            state={getState(c.code)}
            onClick={() => handleAnswer(c.code)}
          />
        ))}
      </div>
    </main>
  );
}
