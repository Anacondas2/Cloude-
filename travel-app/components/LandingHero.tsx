"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  onStart: () => void;
  draftCount?: number;
}

// ─── Minimal Verlet particles for bg ─────────────────────────────────────────

function ParticleBg() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let alive = true;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const N = 38;
    const pts = Array.from({ length: N }, () => {
      const x = Math.random() * c.width, y = Math.random() * c.height;
      return { x, y, ox: x + (Math.random()-.5)*2, oy: y + (Math.random()-.5)*2 };
    });

    function frame() {
      if (!alive) return;
      requestAnimationFrame(frame);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, c.width, c.height);

      for (const p of pts) {
        const vx = (p.x - p.ox) * 0.995;
        const vy = (p.y - p.oy) * 0.995;
        p.ox = p.x; p.oy = p.y;
        p.x += vx; p.y += vy + 0.04;
        if (p.x < 0) { p.x = 0; p.ox = p.x + Math.abs(p.ox-p.x)*.8; }
        if (p.x > c.width) { p.x = c.width; p.ox = p.x - Math.abs(p.ox-p.x)*.8; }
        if (p.y < 0) { p.y = 0; p.oy = p.y + Math.abs(p.oy-p.y)*.8; }
        if (p.y > c.height) { p.y = c.height; p.oy = p.y - Math.abs(p.oy-p.y)*.8; }
      }

      for (let i = 0; i < N; i++) {
        for (let j = i+1; j < N; j++) {
          const dx = pts[j].x-pts[i].x, dy = pts[j].y-pts[i].y;
          const d = Math.sqrt(dx*dx+dy*dy);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(230,0,18,${(1-d/140)*.18})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, 1.5, 0, Math.PI*2);
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fill();
      }
    }
    frame();
    return () => { alive = false; window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LandingHero({ onStart, draftCount = 0 }: Props) {
  const hasDraft = draftCount > 0;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-black">
      <ParticleBg />

      {/* Film grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]"
           style={{ mixBlendMode: "overlay" }} xmlns="http://www.w3.org/2000/svg">
        <filter id="lg"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#lg)"/>
      </svg>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-8">
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}
          className="text-[11px] font-light tracking-[.45em] text-white/25 uppercase"
        >
          Trewel
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}
          className="flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#E60012]" />
          <span className="text-[10px] text-white/25 tracking-widest uppercase">Travel Challenge</span>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-10">

        {/* Ghost number */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .15 }}
          className="absolute right-4 top-1/4 text-[clamp(80px,22vw,160px)] font-black leading-none text-[#E60012] select-none pointer-events-none"
          style={{ opacity: 0.055 }}
        >
          195
        </motion.p>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: .4, duration: .7, ease: [.22,1,.36,1] }}
          className="mb-6 h-px w-16 bg-[#E60012] origin-left"
        />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .45, duration: .7, ease: [.22,1,.36,1] }}
          className="text-[clamp(36px,10vw,64px)] font-black leading-[1.02] tracking-tight text-white"
        >
          В каких<br />странах<br />
          <span style={{ color: "#E60012" }}>ты&nbsp;был?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: .65, duration: .6 }}
          className="mt-4 max-w-xs text-[14px] leading-relaxed text-white/40 font-light"
        >
          Отметь страны которые посетил — появится в общей ленте группы
        </motion.p>

        {/* CTA list */}
        <div className="mt-10 flex flex-col gap-0">
          {[
            { label: hasDraft ? `↩ Продолжить · ${draftCount} стран` : "Начать выбор →", action: "start", primary: true },
            { label: "Результаты группы →", action: "results", primary: false },
            { label: "Игры →", action: "games", primary: false },
          ].map((item, i) => (
            <motion.div
              key={item.action}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: .7 + i*.1, duration: .5, ease: [.22,1,.36,1] }}
            >
              {item.action === "start" ? (
                <button
                  onClick={onStart}
                  className={`group w-full text-left py-4 border-b flex items-center justify-between transition-colors duration-200 ${
                    item.primary
                      ? "border-white/20 text-white hover:text-[#E60012]"
                      : "border-white/8 text-white/40 hover:text-white/70"
                  }`}
                >
                  <span className={`${item.primary ? "text-[16px] font-semibold" : "text-[14px]"} tracking-wide`}>
                    {item.label}
                  </span>
                  <span className="text-[#E60012] opacity-0 group-hover:opacity-100 transition-opacity">◆</span>
                </button>
              ) : item.action === "results" ? (
                <Link href="/results"
                  className="group w-full py-4 border-b border-white/8 flex items-center justify-between text-white/40 hover:text-white/70 transition-colors duration-200">
                  <span className="text-[14px] tracking-wide">{item.label}</span>
                  <span className="text-[#E60012] opacity-0 group-hover:opacity-100 transition-opacity">◆</span>
                </Link>
              ) : (
                <Link href="/games"
                  className="group w-full py-4 border-b border-white/8 flex items-center justify-between text-white/40 hover:text-white/70 transition-colors duration-200">
                  <span className="text-[14px] tracking-wide">{item.label}</span>
                  <span className="text-[#E60012] opacity-0 group-hover:opacity-100 transition-opacity">◆</span>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="mt-8 text-[10px] text-white/18 tracking-[.3em] uppercase"
        >
          195 стран · без регистрации
        </motion.p>
      </div>
    </div>
  );
}
