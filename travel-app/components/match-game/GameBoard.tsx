"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCell } from "./GameCell";
import { SwapAnim } from "@/hooks/useFlagMatchGame";
import { BOARD_SIZE } from "@/lib/match-game/engine";
import { GameCountry } from "@/lib/game-engine";

interface Props {
  grid: string[][];
  sessionCountries: GameCountry[];
  selected: { r: number; c: number } | null;
  matched: Set<string>;
  newCells: Set<string>;
  swapAnim: SwapAnim | null;
  reshuffling: boolean;
  onCellTap: (r: number, c: number) => void;
}

// Map code → flag emoji
function buildFlagMap(countries: GameCountry[]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const c of countries) m[c.code] = c.flag;
  return m;
}

export function GameBoard({
  grid, sessionCountries, selected, matched, newCells, swapAnim, reshuffling, onCellTap,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(40);
  const flagMap = buildFlagMap(sessionCountries);

  useEffect(() => {
    function measure() {
      if (boardRef.current) {
        const w = boardRef.current.clientWidth;
        setCellSize(Math.floor((w - (BOARD_SIZE - 1) * 2) / BOARD_SIZE));
      }
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (boardRef.current) ro.observe(boardRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      ref={boardRef}
      animate={reshuffling ? {
        scale: [1, 0.95, 1],
        filter: ["brightness(1)", "brightness(1.4)", "brightness(1)"],
      } : { scale: 1, filter: "brightness(1)" }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div
        className="grid mx-auto"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
          gap: 2,
          width: cellSize * BOARD_SIZE + 2 * (BOARD_SIZE - 1),
        }}
      >
        {grid.flatMap((row, r) =>
          row.map((code, c) => (
            <GameCell
              key={`${r}-${c}`}
              r={r}
              c={c}
              flag={flagMap[code] ?? "🏳️"}
              flagCode={code}
              selected={!!(selected && selected.r === r && selected.c === c)}
              matched={matched.has(`${r},${c}`)}
              isNew={newCells.has(`${r},${c}`)}
              swapAnim={swapAnim}
              cellSize={cellSize}
              onClick={() => onCellTap(r, c)}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
