"use client";

import { memo, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  id: string;
  flag: string;
  isSelected: boolean;
  isMatched: boolean;
  isNew: boolean;
  cellSize: number;
  onClick: () => void;
  onSwipe: (dr: number, dc: number) => void;
}

export const GameCell = memo(function GameCell({
  id, flag, isSelected, isMatched, isNew, cellSize, onClick, onSwipe,
}: Props) {
  const fontSize = Math.round(cellSize * 0.58);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(e: React.PointerEvent) {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerUp(e: React.PointerEvent) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    const threshold = Math.max(cellSize * 0.28, 10);

    if (adx < threshold && ady < threshold) {
      onClick();
    } else if (adx >= ady) {
      onSwipe(0, dx > 0 ? 1 : -1);
    } else {
      onSwipe(dy > 0 ? 1 : -1, 0);
    }
  }

  function handlePointerCancel() {
    pointerStart.current = null;
  }

  return (
    <motion.button
      layoutId={id}
      layout="position"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
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
