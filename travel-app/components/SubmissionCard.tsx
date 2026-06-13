"use client";

import { motion } from "framer-motion";
import type { Submission } from "@/lib/types";

function initials(name: string) {
  const clean = name.replace(/^@/, "");
  return clean.slice(0, 2).toUpperCase();
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} дн назад`;
}

const GRADS = [
  "from-emerald2-400 to-teal-500",
  "from-lime2-400 to-emerald2-400",
  "from-cyan-400 to-emerald2-400",
  "from-green-400 to-lime2-400",
];

export function SubmissionCard({
  s,
  index,
}: {
  s: Submission;
  index: number;
}) {
  const grad = GRADS[index % GRADS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="glass rounded-3xl p-4"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-sm font-extrabold text-forest-950`}
        >
          {initials(s.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-cream">{s.name}</p>
          <p className="text-[12px] text-cream/45">{timeAgo(s.created_at)}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-extrabold grad-text">
            {s.countries.length}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-cream/40">
            стран
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {s.countries.map((c) => (
          <span
            key={c.code}
            className="rounded-full bg-white/5 px-2.5 py-1 text-[12px] text-cream/80 shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
          >
            {c.flag} {c.nameRu}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
