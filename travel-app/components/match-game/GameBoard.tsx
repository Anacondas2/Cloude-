"use client";

import { useRef, useEffect, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { GameCell } from "./GameCell";
import { BOARD_SIZE, CellBoard } from "@/lib/match-game/engine";
import { GameCountry } from "@/lib/game-engine";

interface Props {
  board: CellBoard;
  sessionCountries: GameCountry[];
  selectedPos: { r: number; c: number } | null;
  matchedIds: Set<string>;
  newIds: Set<string>;
  reshuffling: boolean;
  onCellTap: (r: number, c: number) => void;
}

function buildFlagMap(countries: GameCountry[]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const c of countries) m[c.code] = c.flag;
  return m;
}

export function GameBoard({
  board, sessionCountries, selectedPos, matchedIds, newIds, reshuffling, onCellTap,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(42);
  const flagMap = buildFlagMap(sessionCountries);

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      setCellSize(Math.max(36, Math.floor((w - (BOARD_SIZE - 1) * 2) / BOARD_SIZE)));
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!board.length) return null;

  const boardPx = cellSize * BOARD_SIZE + 2 * (BOARD_SIZE - 1);

  return (
    <div ref={containerRef} className="w-full">
      <motion.div
        animate={reshuffling ? { opacity: [1, 0.4, 1], scale: [1, 0.95, 1] } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.55 }}
        className="mx-auto"
        style={{ width: boardPx }}
      >
        {/*
          LayoutGroup scopes layoutId animations to this board.
          When we swap two cells in `board`, React reorders the DOM nodes
          (because each <GameCell> has key={cell.id}). Framer Motion detects
          the position change and animates it with a spring — that IS the
          swap animation. Same mechanism handles gravity (cells fall down).
        */}
        <LayoutGroup>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
              gap: 2,
            }}
          >
            {board.flatMap((row, r) =>
              row.map((cell, c) => (
                <GameCell
                  key={cell.id}
                  id={cell.id}
                  flag={flagMap[cell.flag] ?? "🏳️"}
                  isSelected={!!(selectedPos && selectedPos.r === r && selectedPos.c === c)}
                  isMatched={matchedIds.has(cell.id)}
                  isNew={newIds.has(cell.id)}
                  cellSize={cellSize}
                  onClick={() => onCellTap(r, c)}
                />
              ))
            )}
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}
