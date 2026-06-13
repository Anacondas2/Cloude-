"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CountryCard } from "./CountryCard";
import type { Country } from "@/lib/types";

interface Props {
  countries: Country[];
  selected: Set<string>;
  onToggle: (c: Country) => void;
}

export function CountryGrid({ countries, selected, onToggle }: Props) {
  if (countries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center text-cream/50">
        <span className="text-5xl">🧭</span>
        <p className="text-sm">Ничего не найдено. Попробуй другой запрос.</p>
      </div>
    );
  }

  return (
    <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {countries.map((c) => (
          <motion.div
            key={c.code}
            layout
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
          >
            <CountryCard
              country={c}
              selected={selected.has(c.code)}
              onToggle={onToggle}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
