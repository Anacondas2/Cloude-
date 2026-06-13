"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { COUNTRIES } from "@/lib/countries";
import type { Country, RegionKey } from "@/lib/types";
import { createSubmission } from "@/lib/supabase";

import { LandingHero } from "@/components/LandingHero";
import { UserNameStep } from "@/components/UserNameStep";
import { SearchBar } from "@/components/SearchBar";
import { RegionFilter } from "@/components/RegionFilter";
import { CountryGrid } from "@/components/CountryGrid";
import { SelectedCounter } from "@/components/SelectedCounter";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { TelegramShareButton } from "@/components/TelegramShareButton";

type Step = "landing" | "name" | "select" | "done";

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [name, setName] = useState("");
  const [region, setRegion] = useState<RegionKey | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Telegram WebApp init + prefill name
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready?.();
      tg.expand?.();
      const u = tg.initDataUnsafe?.user;
      if (u) {
        const guess = u.username
          ? `@${u.username}`
          : [u.first_name, u.last_name].filter(Boolean).join(" ");
        if (guess) setName(guess);
      }
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COUNTRIES.filter((c) => {
      if (region !== "all" && c.region !== region) return false;
      if (
        q &&
        !c.nameRu.toLowerCase().includes(q) &&
        !c.nameEn.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [region, query]);

  const selectedList: Country[] = useMemo(
    () => COUNTRIES.filter((c) => selected.has(c.code)),
    [selected]
  );

  function toggle(c: Country) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(c.code)) next.delete(c.code);
      else {
        next.add(c.code);
        (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
      }
      return next;
    });
  }

  async function publish() {
    setLoading(true);
    try {
      await createSubmission(
        name.trim() || "Путешественник",
        selectedList.map((c) => ({ code: c.code, nameRu: c.nameRu, flag: c.flag }))
      );
      (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.(
        "success"
      );
      setConfirmOpen(false);
      setStep("done");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative mx-auto min-h-[100dvh] w-full max-w-2xl">
      <AnimatePresence mode="wait">
        {/* ───────── LANDING ───────── */}
        {step === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <LandingHero onStart={() => setStep("name")} />
          </motion.div>
        )}

        {/* ───────── NAME ───────── */}
        {step === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
          >
            <UserNameStep
              initial={name}
              onBack={() => setStep("landing")}
              onNext={(n) => {
                setName(n);
                setStep("select");
              }}
            />
          </motion.div>
        )}

        {/* ───────── SELECTION ───────── */}
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="px-4 pb-40 pt-6"
          >
            <header className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setStep("name")}
                className="text-cream/50"
              >
                ←
              </button>
              <div className="text-center">
                <h1 className="font-display text-xl font-bold text-cream">
                  Выбери страны
                </h1>
                <p className="text-[12px] text-cream/45">
                  Нажми на каждую, где побывал
                </p>
              </div>
              <Link href="/results" className="text-xl" title="Результаты">
                👥
              </Link>
            </header>

            <div className="sticky top-0 z-30 -mx-4 space-y-3 bg-gradient-to-b from-forest-950 via-forest-950/95 to-transparent px-4 pb-3 pt-1">
              <SearchBar value={query} onChange={setQuery} />
              <RegionFilter active={region} onChange={setRegion} />
            </div>

            <div className="mt-3">
              <CountryGrid
                countries={filtered}
                selected={selected}
                onToggle={toggle}
              />
            </div>

            <SelectedCounter
              selected={selectedList}
              onSubmit={() => setConfirmOpen(true)}
            />
          </motion.div>
        )}

        {/* ───────── DONE ───────── */}
        {step === "done" && (
          <SuccessScreen
            key="done"
            name={name}
            selected={selectedList}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        open={confirmOpen}
        selected={selectedList}
        loading={loading}
        onBack={() => setConfirmOpen(false)}
        onConfirm={publish}
      />
    </main>
  );
}

/* ───────── Success screen ───────── */
function SuccessScreen({
  name,
  selected,
}: {
  name: string;
  selected: Country[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald2-400 to-lime2-400 shadow-[0_0_50px_-6px_rgba(52,224,140,0.8)]"
      >
        <motion.svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          initial={{ pathLength: 0 }}
        >
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="#04110b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          />
        </motion.svg>
      </motion.div>

      <h2 className="mt-7 font-display text-3xl font-bold text-cream">
        Список опубликован!
      </h2>
      <p className="mt-2 max-w-xs text-[15px] text-cream/60">
        {name}, ты отметил {selected.length} стран. Теперь их видит вся группа.
      </p>

      <div className="mt-6 flex max-w-sm flex-wrap justify-center gap-1.5">
        {selected.map((c, i) => (
          <motion.span
            key={c.code}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.03 }}
            className="text-2xl"
          >
            {c.flag}
          </motion.span>
        ))}
      </div>

      <div className="mt-9 flex w-full max-w-sm flex-col gap-3">
        <Link
          href="/results"
          className="rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 py-4 text-base font-bold text-forest-950 shadow-[0_14px_36px_-10px_rgba(52,224,140,0.6)] transition active:scale-95"
        >
          Смотреть результаты группы →
        </Link>
        <TelegramShareButton className="w-full" />
      </div>
    </motion.div>
  );
}
