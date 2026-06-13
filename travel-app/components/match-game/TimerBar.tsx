"use client";

import { GAME_DURATION } from "@/lib/match-game/engine";

interface Props {
  timeLeft: number;
}

export function TimerBar({ timeLeft }: Props) {
  const pct = Math.max(0, (timeLeft / GAME_DURATION) * 100);
  const urgent = timeLeft <= 15;
  const warning = timeLeft <= 30;

  const barColor = urgent
    ? "from-red-500 to-red-400"
    : warning
    ? "from-amber-500 to-yellow-400"
    : "from-emerald2-400 to-lime2-400";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-cream/40">Время</span>
        <span className={`text-sm font-bold tabular-nums ${urgent ? "text-red-400 animate-pulse" : warning ? "text-amber-400" : "text-cream"}`}>
          {timeLeft}с
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
