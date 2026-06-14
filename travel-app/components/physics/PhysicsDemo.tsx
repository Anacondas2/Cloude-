"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const CFG = {
  count:       110,
  gravity:     0.28,
  dampen:      0.82,       // wall restitution (from the provided script)
  friction:    0.991,      // air friction
  minR:        5,
  maxR:        16,
  mouseRadius: 130,
  mouseForce:  11,
  connectDist: 95,
  trailAlpha:  0.13,
};

const PALETTE = [
  "#00f5ff", "#ff00cc", "#00ff88",
  "#ff6600", "#aaff00", "#ff0055",
  "#8833ff", "#ffcc00",
];

// ─── Verlet Particle ──────────────────────────────────────────────────────────

class Particle {
  pos:    { x: number; y: number };
  oldPos: { x: number; y: number };
  radius: number;
  color:  string;
  hue:    number;

  constructor(x: number, y: number, r: number, color: string, hue: number) {
    const vx = (Math.random() - .5) * 6;
    const vy = (Math.random() - .5) * 6;
    this.pos    = { x, y };
    this.oldPos = { x: x - vx, y: y - vy };
    this.radius = r;
    this.color  = color;
    this.hue    = hue;
  }

  get vx() { return this.pos.x - this.oldPos.x; }
  get vy() { return this.pos.y - this.oldPos.y; }
  get speed() { return Math.sqrt(this.vx * this.vx + this.vy * this.vy); }

  update(W: number, H: number, gravity: number) {
    const vx = (this.pos.x - this.oldPos.x) * CFG.friction;
    const vy = (this.pos.y - this.oldPos.y) * CFG.friction;

    this.oldPos.x = this.pos.x;
    this.oldPos.y = this.pos.y;
    this.pos.x   += vx;
    this.pos.y   += vy + gravity;

    // ── Boundary constraint (provided script) ─────────────────────────────
    const radius = this.radius;

    if (this.pos.x < radius) {
      this.pos.x    = radius;
      this.oldPos.x = this.pos.x + Math.abs(this.oldPos.x - this.pos.x) * CFG.dampen;
    } else if (this.pos.x > W - radius) {
      this.pos.x    = W - radius;
      this.oldPos.x = this.pos.x - Math.abs(this.oldPos.x - this.pos.x) * CFG.dampen;
    }

    if (this.pos.y < radius) {
      this.pos.y    = radius;
      this.oldPos.y = this.pos.y + Math.abs(this.oldPos.y - this.pos.y) * CFG.dampen;
    } else if (this.pos.y > H - radius) {
      this.pos.y    = H - radius;
      this.oldPos.y = this.pos.y - Math.abs(this.oldPos.y - this.pos.y) * CFG.dampen;
    }
  }
}

// ─── Spatial grid for O(n) collision ─────────────────────────────────────────

function resolveCollisions(particles: Particle[], W: number, H: number) {
  const cell = CFG.maxR * 2.2;
  const cols  = Math.ceil(W / cell);
  const grid: Map<number, Particle[]> = new Map();

  const key = (cx: number, cy: number) => cy * cols + cx;

  for (const p of particles) {
    const cx = Math.floor(p.pos.x / cell);
    const cy = Math.floor(p.pos.y / cell);
    const k  = key(cx, cy);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k)!.push(p);
  }

  for (const p of particles) {
    const cx = Math.floor(p.pos.x / cell);
    const cy = Math.floor(p.pos.y / cell);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const neighbours = grid.get(key(cx + dx, cy + dy));
        if (!neighbours) continue;

        for (const q of neighbours) {
          if (q === p) continue;
          const ox = q.pos.x - p.pos.x;
          const oy = q.pos.y - p.pos.y;
          const dist2 = ox * ox + oy * oy;
          const minD  = p.radius + q.radius;
          if (dist2 >= minD * minD) continue;

          const dist   = Math.sqrt(dist2) || 0.001;
          const push   = (minD - dist) / 2;
          const nx     = (ox / dist) * push;
          const ny     = (oy / dist) * push;

          // Equal mass push
          p.pos.x -= nx; p.pos.y -= ny;
          q.pos.x += nx; q.pos.y += ny;
        }
      }
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhysicsDemo() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const stateRef     = useRef({
    particles: [] as Particle[],
    mouse:     { x: -999, y: -999, down: false },
    gravity:   CFG.gravity,
    W: 0, H: 0,
  });
  const [gravOn, setGravOn] = useState(true);
  const [hint, setHint]     = useState(true);

  // Build initial particles
  const spawn = useCallback((W: number, H: number) => {
    const arr: Particle[] = [];
    for (let i = 0; i < CFG.count; i++) {
      const r     = CFG.minR + Math.random() * (CFG.maxR - CFG.minR);
      const color = PALETTE[i % PALETTE.length];
      const hue   = (i / PALETTE.length) * 360;
      arr.push(new Particle(
        r + Math.random() * (W - r * 2),
        r + Math.random() * (H / 2),
        r, color, hue,
      ));
    }
    return arr;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s   = stateRef.current;

    const resize = () => {
      s.W = canvas.width  = window.innerWidth;
      s.H = canvas.height = window.innerHeight;
      if (!s.particles.length)
        s.particles = spawn(s.W, s.H);
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse / touch
    const onMove = (x: number, y: number) => { s.mouse.x = x; s.mouse.y = y; };
    const onDown = (x: number, y: number) => {
      s.mouse.down = true;
      explode(x, y);
      setHint(false);
    };
    const onUp   = () => { s.mouse.down = false; };

    const onMM = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onMD = (e: MouseEvent) => onDown(e.clientX, e.clientY);
    const onTM = (e: TouchEvent) => {
      e.preventDefault();
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTS = (e: TouchEvent) => {
      e.preventDefault();
      onDown(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "g" || e.key === "G") {
        s.gravity = s.gravity === 0 ? CFG.gravity : 0;
        setGravOn(s.gravity > 0);
      }
    };

    window.addEventListener("mousemove",  onMM);
    window.addEventListener("mousedown",  onMD);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("touchmove",  onTM, { passive: false });
    window.addEventListener("touchstart", onTS, { passive: false });
    window.addEventListener("touchend",   onUp);
    window.addEventListener("keydown",    onKey);

    function explode(ex: number, ey: number) {
      for (const p of s.particles) {
        const dx   = p.pos.x - ex;
        const dy   = p.pos.y - ey;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const f    = Math.max(0, 1 - dist / 280) * 22;
        p.oldPos.x = p.pos.x - (dx / dist) * f;
        p.oldPos.y = p.pos.y - (dy / dist) * f;
      }
    }

    // ── Render loop ────────────────────────────────────────────────────────

    let raf = 0;
    let alive = true;
    let t = 0;

    function draw() {
      if (!alive) return;
      raf = requestAnimationFrame(draw);
      t++;
      const { particles, mouse, W, H } = s;

      // Trail effect — partial clear
      ctx.fillStyle = `rgba(0,0,0,${CFG.trailAlpha})`;
      ctx.fillRect(0, 0, W, H);

      // Mouse repulsion / attraction
      for (const p of particles) {
        const dx   = p.pos.x - mouse.x;
        const dy   = p.pos.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < CFG.mouseRadius) {
          const f = (1 - dist / CFG.mouseRadius) * CFG.mouseForce;
          const sign = mouse.down ? -1 : 1;   // click → attract, hover → repel
          p.oldPos.x = p.pos.x - (dx / dist) * f * sign;
          p.oldPos.y = p.pos.y - (dy / dist) * f * sign;
        }
      }

      // Physics
      for (const p of particles) p.update(W, H, s.gravity);
      resolveCollisions(particles, W, H);

      // ── Draw connection lines ──────────────────────────────────────────
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b    = particles[j];
          const dx   = b.pos.x - a.pos.x;
          const dy   = b.pos.y - a.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > CFG.connectDist) continue;

          const alpha = (1 - dist / CFG.connectDist) * 0.45;
          const grad  = ctx.createLinearGradient(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
          grad.addColorStop(0, a.color.replace(")", `,${alpha})`).replace("rgb","rgba").replace("#","rgba(") || `rgba(200,200,200,${alpha})`);
          grad.addColorStop(1, b.color.replace(")", `,${alpha})`).replace("rgb","rgba").replace("#","rgba(") || `rgba(200,200,200,${alpha})`);

          ctx.beginPath();
          ctx.moveTo(a.pos.x, a.pos.y);
          ctx.lineTo(b.pos.x, b.pos.y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha * .6})`;
          ctx.stroke();
        }
      }

      // ── Draw particles ─────────────────────────────────────────────────
      for (const p of particles) {
        const speed      = Math.min(p.speed, 12);
        const brightness = 50 + speed * 4;
        const glow       = 8 + speed * 3;

        ctx.save();
        ctx.shadowBlur  = glow;
        ctx.shadowColor = p.color;

        // Outer glow ring
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("#", "rgba(").replace(/(..)(..)(..)/, (_, r, g, b) =>
          `${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)}`
        ) + ",0.15)";
        ctx.fill();

        // Main circle
        const grad = ctx.createRadialGradient(
          p.pos.x - p.radius * .3, p.pos.y - p.radius * .3, p.radius * .1,
          p.pos.x, p.pos.y, p.radius,
        );
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(1, p.color + "88");
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.restore();
      }

      // Mouse glow indicator
      if (mouse.x > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, CFG.mouseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = mouse.down
          ? "rgba(255,100,0,0.08)"
          : "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    }

    draw();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",     resize);
      window.removeEventListener("mousemove",  onMM);
      window.removeEventListener("mousedown",  onMD);
      window.removeEventListener("mouseup",    onUp);
      window.removeEventListener("touchmove",  onTM);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchend",   onUp);
      window.removeEventListener("keydown",    onKey);
    };
  }, [spawn]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* UI hints */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 pointer-events-none">
        {hint && (
          <p className="text-white/30 text-[11px] tracking-[.3em] uppercase animate-pulse">
            Кликни для взрыва · Hover для отталкивания
          </p>
        )}
      </div>

      {/* Gravity toggle */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <button
          onClick={() => {
            const s = stateRef.current;
            s.gravity = s.gravity === 0 ? CFG.gravity : 0;
            setGravOn(s.gravity > 0);
          }}
          className="px-4 py-2 rounded-full border border-white/10 text-white/30 hover:text-white/70 hover:border-white/30 transition-all text-[11px] tracking-[.25em] uppercase"
        >
          {gravOn ? "⬇ Гравитация ВКЛ" : "✦ Невесомость"}
        </button>
        <p className="text-white/12 text-[9px] tracking-[.3em] uppercase">[ G ]</p>
      </div>

      {/* Back */}
      <button
        onClick={() => window.history.back()}
        className="fixed top-5 left-5 z-10 text-white/20 hover:text-white/60 transition-colors text-[11px] tracking-[.25em] uppercase"
      >
        ← Назад
      </button>

      {/* Particle count badge */}
      <div className="fixed top-5 right-5 z-10 text-white/15 text-[10px] tracking-[.3em]">
        {CFG.count} ЧАСТИЦ
      </div>
    </div>
  );
}
