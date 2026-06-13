"use client";

import { memo } from "react";
import { motion, TargetAndTransition, Transition } from "framer-motion";
import { SwapPair } from "@/hooks/useFlagMatchGame";

interface Props {
  r: number;
  c: number;
  flag: string;         // emoji
  isSelected: boolean;
  isMatched: boolean;
  isNew: boolean;       // just refilled → entry animation
  swappingCells: SwapPair | null;
  invalidCells: SwapPair | null;
  cellSize: number;
  onClick: () => void;
}

function inPair(r: number, c: number, pair: SwapPair | null): boolean {
  return !!pair && ((pair.a.r === r && pair.a.c === c) || (pair.b.r === r && pair.b.c === c));
}

export const GameCell = memo(function GameCell({
  r, c, flag, isSelected, isMatched, isNew,
  swappingCells, invalidCells, cellSize, onClick,
}: Props) {
  const isSwapping = inPair(r, c, swappingCells);
  const isInvalid  = inPair(r, c, invalidCells);

  const entryY = -Math.round(cellSize * 1.2);

  const animate: TargetAndTransition = {
    scale: isMatched ? 0.6 : isSwapping ? 0.82 : 1,
    opacity: isMatched ? 0 : 1,
    x: isInvalid ? [0, -8, 8, -5, 5, -2, 2, 0] : 0,
  };

  const transition: Transition = {
    scale: { duration: isSwapping ? 0.15 : 0.2 },
    opacity: { duration: isMatched ? 0.35 : 0.1 },
    x: isInvalid ? { duration: 0.38, ease: "easeOut" } : { duration: 0.15 },
  };

  const borderClass = isSelected
    ? "ring-2 ring-emerald2-400 shadow-[0_0_14px_rgba(52,224,140,0.55)]"
    : isMatched
    ? "ring-2 ring-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.6)]"
    : "ring-0";

  const bgClass = isSelected
    ? "bg-emerald2-400/20"
    : isMatched
    ? "bg-yellow-400/15"
    : "bg-white/[0.07] active:bg-white/[0.14]";

  return (
    <motion.button
      onClick={onClick}
      initial={isNew ? { y: entryY, opacity: 0, scale: 0.6 } : false}
      animate={animate}
      transition={transition}
      className={[
        "relative flex items-center justify-center rounded-xl select-none touch-none",
        "transition-colors duration-100",
        borderClass, bgClass,
      ].join(" ")}
      style={{ width: cellSize, height: cellSize }}
    >
      <span
        className="leading-none pointer-events-none select-none"
        style={{ fontSize: Math.round(cellSize * 0.58) }}
      >
        {flag}
      </span>

      {isMatched && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 rounded-xl bg-yellow-300/40 pointer-events-none"
        />
      )}
    </motion.button>
  );
});
