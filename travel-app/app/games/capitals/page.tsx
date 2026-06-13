"use client";

import { useState, useCallback } from "react";
import {
  GameMode, GameRegion, CapitalQuestion,
  buildCapitalsSession, loadBest, saveBest, makeBestKey,
  calcAccuracy, BestScore,
} from "@/lib/game-engine";
import { GameSetup } from "@/components/game/GameSetup";
import { GameProgress } from "@/components/game/GameProgress";
import { AnswerOption, AnswerState } from "@/components/game/AnswerOption";
import { GameResult } from "@/components/game/GameResult";

type Phase = "setup" | "quiz" | "done";

const EMPTY_BEST: BestScore = { score: 0, accuracy: 0, streak: 0, total: 0, mode: "" };

export default function CapitalsPage() {
  const [phase, setPhase]         = useState<Phase>("setup");
  const [mode, setMode]           = useState<GameMode>("quick");
  const [region, setRegion]       = useState<GameRegion>("all");
  const [questions, setQuestions] = useState<CapitalQuestion[]>([]);
  const [qIdx, setQIdx]           = useState(0);
  const [selected, setSelected]   = useState<string | null>(null);
  const [score, setScore]         = useState(0);
  const [streak, setStreak]       = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mistakes, setMistakes]   = useState(0);
  const [prevBest, setPrevBest]   = useState<BestScore>(EMPTY_BEST);

  const bestKey = makeBestKey("capitals", mode, region);

  const startGame = useCallback(() => {
    const qs = buildCapitalsSession(mode, region);
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

  const handleAnswer = useCallback((choice: string) => {
    if (selected !== null || !questions[qIdx]) return;
    setSelected(choice);

    const correct = questions[qIdx].country.capitalRu;
    const isCorrect = choice === correct;
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
        title="Угадай столицу"
        icon="🏛️"
        color="green"
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
        color="green"
        onRestart={startGame}
        onChangeSetup={() => setPhase("setup")}
      />
    );
  }

  const q = questions[qIdx];
  const correctCapital = q.country.capitalRu;

  function getState(choice: string): AnswerState {
    if (selected === null) return "idle";
    if (choice === correctCapital) return "correct";
    if (choice === selected) return "wrong";
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
          color="green"
        />
      </div>

      <div className="mb-8 rounded-3xl bg-white/[0.04] p-6 text-center">
        <p className="mb-2 text-[12px] uppercase tracking-widest text-cream/35">Столица</p>
        <div className="text-6xl">{q.country.flag}</div>
        <h2 className="mt-3 font-display text-2xl font-bold text-cream">{q.country.nameRu}</h2>
        <p className="mt-0.5 text-[13px] text-cream/45">{q.country.nameEn}</p>
      </div>

      <div className="space-y-3">
        {q.choices.map((choice) => (
          <AnswerOption
            key={choice}
            label={choice}
            state={getState(choice)}
            onClick={() => handleAnswer(choice)}
          />
        ))}
      </div>
    </main>
  );
}
