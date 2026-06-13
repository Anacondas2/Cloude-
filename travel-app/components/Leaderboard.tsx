"use client";

import { motion } from "framer-motion";
import type { Submission } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({ data }: { data: Submission[] }) {
  if (data.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 font-display text-lg font-bold text-cream">
        🏆 Кто посетил больше всего стран
      </h3>
      <div className="space-y-2.5">
        {data.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={`flex items-center gap-3 rounded-2xl p-3.5 ${
              i === 0
                ? "glass shadow-[0_0_30px_-8px_rgba(52,224,140,0.4)]"
                : "glass-soft"
            }`}
          >
            <span className="w-7 text-center text-xl">
              {MEDALS[i] || <span className="text-sm text-cream/40">{i + 1}</span>}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-cream">{s.name}</p>
              <div className="mt-0.5 flex gap-0.5 text-sm">
                {s.countries.slice(0, 8).map((c) => (
                  <span key={c.code}>{c.flag}</span>
                ))}
                {s.countries.length > 8 && (
                  <span className="text-xs text-cream/40">
                    +{s.countries.length - 8}
                  </span>
                )}
              </div>
            </div>
            <span className="font-display text-2xl font-extrabold grad-text">
              {s.countries.length}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
