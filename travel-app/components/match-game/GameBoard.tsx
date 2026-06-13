"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GameCell } from "./GameCell";
import { SwapPair } from "@/hooks/useFlagMatchGame";
import { BOARD_SIZE } from "@/lib/match-game/engine";
import { GameCountry } from "@/lib/game-engine";

interface Props {
  grid: string[][];
  cellGeneration: number[][];  // per-cell generation counter; increments → remount → entry anim
  sessionCountries: GameCountry[];
  selected: { r: number; c: number } | null;
  matchedCells: Set<string>;
  swappingCells: SwapPair | null;
  invalidCells: SwapPair | null;
  reshuffling: boolean;
  onCellTap: (r: number, c: number) => void;
}

function buildFlagMap(countries: GameCountry[]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const c of countries) m[c.code] = c.flag;
  return m;
}

export function GameBoard({
  grid, cellGeneration, sessionCountries,
  selected, matchedCells, swappingCells, invalidCells,
  reshuffling, onCellTap,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(42);
  const flagMap = buildFlagMap(sessionCountries);

  useEffect(() => {
    function measure() {
      if (!boardRef.current) return;
      const w = boardRef.current.clientWidth;
      setCellSize(Math.floor((w - (BOARD_SIZE - 1) * 2) / BOARD_SIZE));
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (boardRef.current) ro.observe(boardRef.current);
    return () => ro.disconnect();
  }, []);

  if (!grid.length) return null;

  const boardPx = cellSize * BOARD_SIZE + 2 * (BOARD_SIZE - 1);

  return (
    <motion.div
      ref={boardRef}
      className="w-full"
      animate={reshuffling
        ? { scale: [1, 0.94, 1], opacity: [1, 0.6, 1] }
        : { scale: 1, opacity: 1 }
      }
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div
        className="mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
          gap: 2,
          width: boardPx,
        }}
      >
        {grid.flatMap((row, r) =>
          row.map((code, c) => {
            const gen = cellGeneration[r]?.[c] ?? 0;
            // Changing the key forces React to unmount+remount → triggers isNew animation
            const key = `${r}-${c}-${gen}`;
            const isNew = gen > 0; // gen=0 is the initial board (no entry anim)

            return (
              <GameCell
                key={key}
                r={r}
                c={c}
                flag={flagMap[code] ?? "🏳️"}
                isSelected={!!(selected && selected.r === r && selected.c === c)}
                isMatched={matchedCells.has(`${r},${c}`)}
                isNew={isNew}
                swappingCells={swappingCells}
                invalidCells={invalidCells}
                cellSize={cellSize}
                onClick={() => onCellTap(r, c)}
              />
            );
          })
        )}
      </div>
    </motion.div>
  );
}
