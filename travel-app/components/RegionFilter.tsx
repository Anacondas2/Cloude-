"use client";

import { motion } from "framer-motion";
import { REGIONS } from "@/lib/regions";
import type { RegionKey } from "@/lib/types";

interface Props {
  active: RegionKey | "all";
  onChange: (r: RegionKey | "all") => void;
}

export function RegionFilter({ active, onChange }: Props) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
      {REGIONS.map((r) => {
        const isActive = r.key === active;
        return (
          <button
            key={r.key}
            onClick={() => onChange(r.key)}
            className="relative shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors"
          >
            {isActive && (
              <motion.span
                layoutId="region-pill"
                className="absolute inset-0 rounded-full bg-emerald2-400 shadow-[0_0_22px_rgba(52,224,140,0.5)]"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span
              className={`relative z-10 whitespace-nowrap ${
                isActive ? "text-forest-950" : "text-cream/70"
              }`}
            >
              {r.emoji} {r.labelRu}
            </span>
          </button>
        );
      })}
    </div>
  );
}
