"use client";

import { motion } from "framer-motion";
import type { CountryStat } from "@/lib/stats";

export function RareCountries({ data }: { data: CountryStat[] }) {
  if (data.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 font-display text-lg font-bold text-cream">
        💎 Редкие страны
      </h3>
      <p className="mb-3 -mt-1 text-[12.5px] text-cream/45">
        Их посетил только один участник
      </p>
      <div className="flex flex-wrap gap-2">
        {data.map((c, i) => (
          <motion.span
            key={c.code}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 360 }}
            className="glass-soft rounded-2xl px-3.5 py-2 text-sm text-cream/85"
          >
            {c.flag} {c.nameRu}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
