"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  initial?: string;
  onBack: () => void;
  onNext: (name: string) => void;
}

export function UserNameStep({ initial = "", onBack, onNext }: Props) {
  const [name, setName] = useState(initial);
  const [touched, setTouched] = useState(false);
  const valid = name.trim().length >= 2;
  const showError = touched && !valid;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (valid) onNext(name.trim());
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col justify-center px-6">
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute left-5 top-6 text-cream/50"
      >
        ← Назад
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-md"
      >
        <span className="text-5xl">✈️</span>
        <h2 className="mt-5 font-display text-3xl font-bold text-cream">
          Как тебя зовут?
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-cream/60">
          Введи имя или Telegram-юзернейм — так тебя узнают в общей ленте.
        </p>

        <form onSubmit={handleSubmit} className="mt-7">
          <input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (touched && e.target.value.trim().length >= 2) setTouched(false);
            }}
            placeholder="Например: @alex"
            maxLength={40}
            className={`neu-inset w-full rounded-2xl px-5 py-4 text-lg text-cream placeholder:text-emerald2-300/35 outline-none transition ${
              showError ? "shadow-[inset_0_0_0_1.5px_rgba(239,68,68,0.6)]" : "focus:shadow-glow"
            }`}
          />

          <AnimatePresence>
            {showError && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-2 text-[13px] text-red-400"
              >
                Введи хотя бы 2 символа
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-white/5 p-3 text-[12.5px] leading-relaxed text-cream/55">
            <span className="text-sm">🔒</span>
            <p>
              Твои имя и выбранные страны будут видны всем по публичной ссылке.
            </p>
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 py-4 text-base font-bold text-forest-950 shadow-[0_14px_36px_-10px_rgba(52,224,140,0.6)] transition"
          >
            Продолжить →
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
