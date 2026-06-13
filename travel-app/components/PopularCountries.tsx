"use client";

import { motion } from "framer-motion";
import type { CountryStat } from "@/lib/stats";

export function PopularCountries({ data }: { data: CountryStat[] }) {
  if (data.length === 0) return null;
  const max = data[0]?.count || 1;

  return (
    <section>
      <h3 className="mb-3 font-display text-lg font-bold text-cream">
        🔥 Самые популярные страны
      </h3>
      <div className="glass space-y-2.5 rounded-3xl p-4">
        {data.map((c, i) => (
          <div key={c.code} className="flex items-center gap-3">
            <span className="w-4 text-center text-xs font-bold text-cream/40">
              {i + 1}
            </span>
            <span className="text-lg">{c.flag}</span>
            <span className="w-24 shrink-0 truncate text-sm text-cream/85">
              {c.nameRu}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(c.count / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald2-400 to-lime2-400"
              />
            </div>
            <span className="w-5 text-right text-sm font-bold text-cream">
              {c.count}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
