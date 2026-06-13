"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  initial?: string;
  onBack: () => void;
  onNext: (name: string) => void;
}

export function UserNameStep({ initial = "", onBack, onNext }: Props) {
  const [name, setName] = useState(initial);
  const valid = name.trim().length >= 2;

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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onNext(name.trim());
          }}
          className="mt-7"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: @alex"
            maxLength={40}
            className="neu-inset w-full rounded-2xl px-5 py-4 text-lg text-cream placeholder:text-emerald2-300/35 outline-none transition focus:shadow-glow"
          />

          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-white/5 p-3 text-[12.5px] leading-relaxed text-cream/55">
            <span className="text-sm">🔒</span>
            <p>
              Твои имя и выбранные страны будут видны всем по публичной ссылке.
            </p>
          </div>

          <motion.button
            type="submit"
            disabled={!valid}
            whileTap={valid ? { scale: 0.96 } : undefined}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 py-4 text-base font-bold text-forest-950 shadow-[0_14px_36px_-10px_rgba(52,224,140,0.6)] transition disabled:opacity-30"
          >
            Продолжить →
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
