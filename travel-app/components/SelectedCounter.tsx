"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Country } from "@/lib/types";

interface Props {
  selected: Country[];
  onSubmit: () => void;
}

export function SelectedCounter({ selected, onSubmit }: Props) {
  const count = selected.length;
  const visible = count > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2"
        >
          <div className="glass mx-auto flex max-w-md items-center gap-3 rounded-3xl p-3">
            <div className="flex -space-x-2.5 pl-1">
              {selected.slice(0, 5).map((c) => (
                <span
                  key={c.code}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-800 text-base shadow-md ring-2 ring-forest-900"
                >
                  {c.flag}
                </span>
              ))}
              {count > 5 && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-[11px] font-bold text-cream ring-2 ring-forest-900">
                  +{count - 5}
                </span>
              )}
            </div>
            <div className="flex-1 leading-tight">
              <p className="text-[11px] uppercase tracking-wide text-emerald2-300/70">
                Выбрано стран
              </p>
              <p className="text-lg font-bold text-cream">{count}</p>
            </div>
            <button
              onClick={onSubmit}
              className="rounded-2xl bg-gradient-to-r from-emerald2-400 to-lime2-400 px-5 py-3 text-sm font-bold text-forest-950 shadow-[0_8px_24px_-6px_rgba(52,224,140,0.6)] transition active:scale-95"
            >
              Опубликовать
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
