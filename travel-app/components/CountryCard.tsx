"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Country } from "@/lib/types";
import { hexToRgba } from "@/lib/color";

interface Props {
  country: Country;
  selected: boolean;
  onToggle: (c: Country) => void;
}

function CountryCardBase({ country, selected, onToggle }: Props) {
  const [from, to] = country.accent;

  return (
    <motion.button
      type="button"
      layout
      onClick={() => onToggle(country)}
      whileTap={{ scale: 0.94 }}
      animate={{
        scale: selected ? 1.04 : 1,
        y: selected ? -4 : 0,
      }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className="group relative aspect-[3/4] w-full select-none overflow-hidden rounded-3xl text-left"
      style={{
        boxShadow: selected
          ? `0 18px 38px -14px ${hexToRgba(to, 0.55)}, 0 0 0 2px ${hexToRgba(
              "#34e08c",
              0.85
            )}, inset 0 1px 0 rgba(255,255,255,0.12)`
          : "0 14px 30px -18px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Country visual identity gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 20% 0%, ${hexToRgba(
            from,
            0.85
          )} 0%, ${hexToRgba(to, 0.7)} 55%, rgba(4,17,11,0.95) 100%)`,
        }}
      />
      {/* Glass veil */}
      <div className="absolute inset-0 bg-forest-950/20 backdrop-blur-[1px]" />
      {/* Subtle dotted depth */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          maskImage:
            "radial-gradient(80% 60% at 50% 30%, #000 20%, transparent 80%)",
        }}
      />

      {/* Floating landmark symbol */}
      <motion.div
        animate={selected ? { scale: 1.15, rotate: -4 } : { scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="pointer-events-none absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 text-[40px] drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]"
      >
        {country.symbol}
      </motion.div>

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-0.5 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-7">
        <span className="text-xl leading-none">{country.flag}</span>
        <span className="text-[13px] font-semibold leading-tight text-cream">
          {country.nameRu}
        </span>
      </div>

      {/* Light sweep when selected */}
      <div className={`sweep-layer ${selected ? "sweep-run" : ""}`} />

      {/* Selection checkmark + accent burst */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.span
              key="burst"
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{ scale: 2.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="pointer-events-none absolute right-3 top-3 h-8 w-8 rounded-full"
              style={{ background: hexToRgba("#5cf0a8", 0.5) }}
            />
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
              className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald2-400 text-forest-950 shadow-[0_0_18px_rgba(52,224,140,0.8)]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export const CountryCard = memo(CountryCardBase);
