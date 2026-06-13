"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface Props {
  id: string;        // stable cell id — used as layoutId
  flag: string;      // emoji
  isSelected: boolean;
  isMatched: boolean;
  isNew: boolean;
  cellSize: number;
  onClick: () => void;
}

export const GameCell = memo(function GameCell({
  id, flag, isSelected, isMatched, isNew, cellSize, onClick,
}: Props) {
  const fontSize = Math.round(cellSize * 0.58);

  return (
    <motion.button
      // layoutId makes Framer Motion track this element across renders.
      // When the board array is reordered (swap or gravity), Framer Motion
      // automatically animates the element from its old DOM position to its
      // new DOM position using FLIP — this is the swap/fall animation.
      layoutId={id}
      layout="position"
      onClick={onClick}
      initial={isNew ? { scale: 0.3, opacity: 0 } : false}
      animate={{
        scale: isMatched ? 0.4 : 1,
        opacity: isMatched ? 0 : 1,
      }}
      transition={{
        layout:  { type: "spring", stiffness: 340, damping: 28 },
        scale:   { duration: 0.22 },
        opacity: { duration: isMatched ? 0.3 : 0.18 },
      }}
      className={[
        "relative flex items-center justify-center rounded-xl",
        "select-none touch-none cursor-pointer",
        isSelected
          ? "ring-2 ring-emerald2-400 bg-emerald2-400/20 shadow-[0_0_14px_rgba(52,224,140,0.5)]"
          : isMatched
          ? "ring-2 ring-yellow-400/80 bg-yellow-400/15"
          : "bg-white/[0.07] active:bg-white/[0.13]",
      ].join(" ")}
      style={{ width: cellSize, height: cellSize }}
    >
      <span style={{ fontSize, lineHeight: 1 }} className="pointer-events-none select-none">
        {flag}
      </span>

      {isMatched && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0.7 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.38 }}
          className="absolute inset-0 rounded-xl bg-yellow-300/35 pointer-events-none"
        />
      )}
    </motion.button>
  );
});
