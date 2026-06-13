"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { fetchSubmissions } from "@/lib/supabase";
import type { Submission } from "@/lib/types";
import {
  popularCountries,
  rareCountries,
  topTravellers,
  totalUniqueCountries,
} from "@/lib/stats";

import { SubmissionCard } from "@/components/SubmissionCard";
import { PopularCountries } from "@/components/PopularCountries";
import { Leaderboard } from "@/components/Leaderboard";
import { RareCountries } from "@/components/RareCountries";
import { TelegramShareButton } from "@/components/TelegramShareButton";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export default function ResultsPage() {
  const [subs, setSubs] = useState<Submission[] | null>(null);

  useEffect(() => {
    fetchSubmissions()
      .then(setSubs)
      .catch(() => setSubs([]));
  }, []);

  const stats = useMemo(() => {
    const data = subs || [];
    return {
      popular: popularCountries(data, 8),
      rare: rareCountries(data, 10),
      top: topTravellers(data, 5),
      unique: totalUniqueCountries(data),
    };
  }, [subs]);

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-2xl px-4 pb-28 pt-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-cream/50">
          ←
        </Link>
        <h1 className="font-display text-lg font-bold text-cream">
          Карта путешествий группы
        </h1>
        <div className="w-4" />
      </header>

      {subs === null ? (
        <LoadingState />
      ) : subs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            <Stat label="Участников" value={subs.length} />
            <Stat label="Уникальных стран" value={stats.unique} />
            <Stat
              label="Всего отметок"
              value={subs.reduce((a, s) => a + s.countries.length, 0)}
            />
          </motion.div>

          <Leaderboard data={stats.top} />
          <PopularCountries data={stats.popular} />
          <RareCountries data={stats.rare} />

          {/* All participants */}
          <section>
            <h3 className="mb-3 font-display text-lg font-bold text-cream">
              🌍 Все участники
            </h3>
            <div className="space-y-3">
              {subs.map((s, i) => (
                <SubmissionCard key={s.id} s={s} index={i} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-2">
        <div className="glass mx-auto flex max-w-md gap-2.5 rounded-3xl p-2.5">
          <Link
            href="/"
            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 py-3 text-center text-sm font-bold text-forest-950 transition active:scale-95"
          >
            + Добавить свой список
          </Link>
          <TelegramShareButton label="" className="px-4" />
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <p className="font-display text-2xl font-extrabold grad-text">
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-0.5 text-[11px] leading-tight text-cream/50">{label}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="glass-soft h-24 animate-pulse rounded-3xl"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 py-20 text-center"
    >
      <span className="animate-floaty text-6xl">🗺️</span>
      <h2 className="font-display text-2xl font-bold text-cream">
        Пока пусто
      </h2>
      <p className="max-w-xs text-sm text-cream/55">
        Никто ещё не поделился своим списком. Стань первым путешественником в
        ленте группы!
      </p>
      <Link
        href="/"
        className="mt-2 rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 px-7 py-3.5 text-sm font-bold text-forest-950"
      >
        Выбрать свои страны →
      </Link>
    </motion.div>
  );
}
