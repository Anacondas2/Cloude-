"use client";

interface Props {
  current: number;
  total: number;
  score: number;
  streak: number;
  color?: "green" | "blue";
}

export function GameProgress({ current, total, score, streak, color = "green" }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const barColor = color === "green"
    ? "bg-gradient-to-r from-emerald2-400 to-lime2-400"
    : "bg-gradient-to-r from-blue-400 to-violet-500";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[13px] text-cream/50">
        <span>{current} / {total}</span>
        <div className="flex items-center gap-4">
          {streak >= 2 && (
            <span className="font-bold text-amber-400">🔥 ×{streak}</span>
          )}
          <span className="font-bold text-cream">{score} очков</span>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
