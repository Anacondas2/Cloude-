"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Country } from "@/lib/types";

interface Props {
  open: boolean;
  selected: Country[];
  loading: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export function ConfirmationModal({
  open,
  selected,
  loading,
  onBack,
  onConfirm,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={loading ? undefined : onBack}
          />
          <motion.div
            initial={{ y: 60, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="glass relative z-10 m-3 w-full max-w-md rounded-[28px] p-6"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald2-400/15 text-3xl shadow-neu-in">
              🌍
            </div>
            <h2 className="text-center font-display text-2xl font-bold text-cream">
              Опубликовать твой список?
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-relaxed text-cream/60">
              После подтверждения твои имя и выбранные страны будут видны всем по
              публичной ссылке.
            </p>

            <div className="no-scrollbar mt-5 flex max-h-28 flex-wrap justify-center gap-2 overflow-y-auto">
              {selected.map((c) => (
                <span
                  key={c.code}
                  className="glass-soft rounded-full px-3 py-1.5 text-[13px] text-cream"
                >
                  {c.flag} {c.nameRu}
                </span>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onBack}
                disabled={loading}
                className="flex-1 rounded-2xl border border-cream/15 bg-white/5 py-3.5 text-sm font-semibold text-cream/80 transition active:scale-95 disabled:opacity-40"
              >
                Назад
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-[1.4] rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 py-3.5 text-sm font-bold text-forest-950 shadow-[0_10px_28px_-8px_rgba(52,224,140,0.7)] transition active:scale-95 disabled:opacity-70"
              >
                {loading ? "Публикуем…" : "Да, опубликовать"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
