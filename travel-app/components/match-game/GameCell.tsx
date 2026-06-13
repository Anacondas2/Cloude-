"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { SwapAnim } from "@/hooks/useFlagMatchGame";
import { BOARD_SIZE } from "@/lib/match-game/engine";

interface Props {
  r: number;
  c: number;
  flag: string;        // emoji flag character
  flagCode: string;    // country code
  selected: boolean;
  matched: boolean;
  isNew: boolean;
  swapAnim: SwapAnim | null;
  cellSize: number;    // px
  onClick: () => void;
}

function getSwapDelta(r: number, c: number, anim: SwapAnim, cellSize: number) {
  const { a, b } = anim;
  if (r === a.r && c === a.c) return { x: (b.c - a.c) * cellSize, y: (b.r - a.r) * cellSize };
  if (r === b.r && c === b.c) return { x: (a.c - b.c) * cellSize, y: (a.r - b.r) * cellSize };
  return { x: 0, y: 0 };
}

export const GameCell = memo(function GameCell({
  r, c, flag, flagCode: _flagCode, selected, matched, isNew, swapAnim, cellSize, onClick,
}: Props) {
  const isSwapping = swapAnim && (
    (r === swapAnim.a.r && c === swapAnim.a.c) ||
    (r === swapAnim.b.r && c === swapAnim.b.c)
  );
  const isInvalidSwap = isSwapping && swapAnim.valid === false;

  let { x, y } = { x: 0, y: 0 };
  if (swapAnim && isSwapping && swapAnim.valid !== false) {
    const delta = getSwapDelta(r, c, swapAnim, cellSize);
    if (swapAnim.valid === null) { x = delta.x; y = delta.y; }
  }

  const invalidAnim = isInvalidSwap
    ? { x: [0, -5, 5, -3, 3, 0], y, transition: { duration: 0.32 } }
    : { x, y };

  return (
    <motion.button
      onClick={onClick}
      animate={isInvalidSwap ? invalidAnim : { x, y, scale: matched ? 0.7 : 1, opacity: matched ? 0 : 1 }}
      initial={isNew ? { y: -cellSize, opacity: 0 } : false}
      transition={isNew
        ? { type: "spring", stiffness: 260, damping: 20 }
        : { duration: 0.18, ease: "easeOut" }
      }
      className={[
        "relative flex items-center justify-center rounded-lg select-none touch-none",
        "transition-all duration-150",
        selected
          ? "ring-2 ring-emerald2-400 bg-emerald2-400/20 shadow-[0_0_12px_rgba(52,224,140,0.5)]"
          : matched
          ? "bg-yellow-400/20 ring-2 ring-yellow-400/60"
          : "bg-white/[0.06] hover:bg-white/[0.10] active:bg-white/[0.14]",
      ].join(" ")}
      style={{ width: cellSize, height: cellSize }}
    >
      <span
        className="leading-none select-none"
        style={{ fontSize: Math.round(cellSize * 0.56) }}
      >
        {flag}
      </span>
      {matched && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0 rounded-lg bg-yellow-300/30"
        />
      )}
    </motion.button>
  );
});
