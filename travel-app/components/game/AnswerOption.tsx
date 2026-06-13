"use client";

export type AnswerState = "idle" | "correct" | "wrong" | "disabled";

interface Props {
  label: string;
  state: AnswerState;
  onClick: () => void;
}

const STATE_CLASSES: Record<AnswerState, string> = {
  idle: "bg-white/[0.06] border border-white/10 text-cream hover:bg-white/[0.10] active:scale-[0.97]",
  correct: "bg-emerald-500/25 border border-emerald-400/60 text-emerald-300",
  wrong: "bg-red-500/20 border border-red-400/50 text-red-300 line-through",
  disabled: "bg-white/[0.03] border border-white/5 text-cream/30 cursor-not-allowed",
};

export function AnswerOption({ label, state, onClick }: Props) {
  return (
    <button
      onClick={state === "idle" ? onClick : undefined}
      disabled={state === "disabled" || state === "correct" || state === "wrong"}
      className={`w-full rounded-2xl px-5 py-4 text-left text-[15px] font-semibold transition-all duration-200 ${STATE_CLASSES[state]}`}
    >
      {state === "correct" && <span className="mr-2 text-emerald-400">✓</span>}
      {state === "wrong" && <span className="mr-2 text-red-400">✗</span>}
      {label}
    </button>
  );
}
