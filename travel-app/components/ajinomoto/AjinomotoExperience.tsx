"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── WebGL Shaders ──────────────────────────────────────────────────────────

const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG_SRC = `
precision highp float;
uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
varying vec2 v_uv;

const float PI = 3.14159265358979;

void main() {
  float intensity = sin(u_progress * PI) * 0.055;
  float wave      = sin(v_uv.x * PI * 6.0) * intensity;
  float edge      = 1.0 - u_progress;
  float t         = smoothstep(edge - 0.03, edge + 0.03, v_uv.y + wave);

  vec4 texFrom = texture2D(u_from, v_uv);
  vec4 texTo   = texture2D(u_to,   v_uv);

  gl_FragColor = mix(texFrom, texTo, t);
}
`;

// ─── Slide Drawing ──────────────────────────────────────────────────────────

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

function fillBg(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

const drawSlide0: DrawFn = (ctx, w, h) => {
  fillBg(ctx, w, h, "#000000");

  // Large red circle bleeding off left edge
  ctx.save();
  ctx.beginPath();
  ctx.arc(w * 0.07, h * 0.42, h * 0.31, 0, Math.PI * 2);
  ctx.fillStyle = "#E60012";
  ctx.fill();
  ctx.restore();

  // AJINOMOTO title
  ctx.font = `900 ${Math.round(w * 0.092)}px 'Helvetica Neue', 'Arial Black', Arial, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("AJINOMOTO", w * 0.06, h * 0.485);

  // Japanese name
  ctx.font = `300 ${Math.round(h * 0.052)}px 'Hiragino Sans', 'Yu Gothic', 'BIZ UDPGothic', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.fillText("味の素", w * 0.063, h * 0.575);

  // Type label
  ctx.font = `400 ${Math.round(h * 0.017)}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.fillStyle = "#E60012";
  ctx.fillText("TV COMMERCIAL", w * 0.063, h * 0.635);

  // Year (bottom right)
  ctx.textAlign = "right";
  ctx.font = `300 ${Math.round(h * 0.016)}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillText("2019", w * 0.94, h * 0.935);
};

const drawSlide1: DrawFn = (ctx, w, h) => {
  fillBg(ctx, w, h, "#060606");

  // Thin horizontal lines
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w * 0.06, h * 0.32); ctx.lineTo(w * 0.94, h * 0.32); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.06, h * 0.70); ctx.lineTo(w * 0.94, h * 0.70); ctx.stroke();

  // Label above
  ctx.font = `400 ${Math.round(h * 0.014)}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.fillStyle = "#E60012";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("CAMPAIGN — TV COMMERCIAL 2019", w * 0.06, h * 0.295);

  // Main heading lines
  const big = Math.round(h * 0.095);
  ctx.font = `700 ${big}px 'Helvetica Neue', 'Arial Black', Arial, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("INGREDIENTS", w * 0.06, h * 0.51);
  ctx.fillText("OF LIFE", w * 0.06, h * 0.62);

  // Japanese below line
  ctx.font = `300 ${Math.round(h * 0.046)}px 'Hiragino Sans', 'Yu Gothic', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillText("いのちの食材", w * 0.063, h * 0.775);
};

const drawSlide2: DrawFn = (ctx, w, h) => {
  fillBg(ctx, w, h, "#030303");

  // Ghost number
  ctx.font = `900 ${Math.round(h * 0.38)}px 'Helvetica Neue', 'Arial Black', Arial, sans-serif`;
  ctx.fillStyle = "rgba(230,0,18,0.07)";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText("01", w * 0.97, -h * 0.04);

  // Centred large Japanese
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const jp = Math.round(h * 0.125);
  ctx.font = `900 ${jp}px 'Hiragino Sans', 'Yu Gothic', 'BIZ UDPGothic', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("いのちの食材", w * 0.5, h * 0.42);

  // Red underline
  const tw = ctx.measureText("いのちの食材").width;
  ctx.fillStyle = "#E60012";
  ctx.fillRect(w * 0.5 - tw / 2, h * 0.515, tw, Math.ceil(h * 0.004));

  // English translation
  ctx.font = `300 ${Math.round(h * 0.021)}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.fillText("INGREDIENTS OF LIFE", w * 0.5, h * 0.578);
};

const drawSlide3: DrawFn = (ctx, w, h) => {
  fillBg(ctx, w, h, "#000000");

  // Top divider
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.25); ctx.lineTo(w * 0.92, h * 0.25); ctx.stroke();

  ctx.font = `300 ${Math.round(h * 0.014)}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("CREDITS", w * 0.08, h * 0.225);

  const credits = [
    { label: "DIRECTOR",   value: "TAO TAJIMA" },
    { label: "PRODUCTION", value: "HOMUNCULUS INC." },
    { label: "CLIENT",     value: "AJINOMOTO CO., INC." },
    { label: "MUSIC",      value: "YOSHIHIDE ŌTOMO" },
  ];

  const rowH = h * 0.13;
  credits.forEach((c, i) => {
    const y = h * 0.3 + i * rowH;

    ctx.font = `400 ${Math.round(h * 0.013)}px 'Helvetica Neue', Arial, sans-serif`;
    ctx.fillStyle = "#E60012";
    ctx.fillText(c.label, w * 0.08, y);

    ctx.font = `700 ${Math.round(h * 0.044)}px 'Helvetica Neue', Arial, sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(c.value, w * 0.08, y + h * 0.056);
  });
};

const drawSlide4: DrawFn = (ctx, w, h) => {
  fillBg(ctx, w, h, "#000000");

  // Red dot centred
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.43, h * 0.034, 0, Math.PI * 2);
  ctx.fillStyle = "#E60012";
  ctx.fill();

  // Brand name
  ctx.font = `300 ${Math.round(h * 0.033)}px 'Hiragino Sans', 'Yu Gothic', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("味の素", w * 0.5, h * 0.495);

  ctx.font = `300 ${Math.round(h * 0.015)}px 'Helvetica Neue', Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillText("© 2019 AJINOMOTO CO., INC.", w * 0.5, h * 0.555);
};

const SLIDE_DRAWERS: DrawFn[] = [drawSlide0, drawSlide1, drawSlide2, drawSlide3, drawSlide4];

const SLIDE_LABELS = ["OPENING", "CAMPAIGN", "TAGLINE", "CREDITS", "FIN"];

// ─── WebGL Helpers ──────────────────────────────────────────────────────────

function mkShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
  return s;
}

function mkProgram(gl: WebGLRenderingContext): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, mkShader(gl, gl.VERTEX_SHADER, VERT_SRC));
  gl.attachShader(p, mkShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p) ?? "link error");
  return p;
}

function mkTexture(gl: WebGLRenderingContext, src: HTMLCanvasElement): WebGLTexture {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function AjinomotoExperience({ onBack }: { onBack?: () => void }) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const cursorRef   = useRef<HTMLDivElement>(null);
  const targetRef   = useRef(0); // shared mutable target for nav dots
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    const N = SLIDE_DRAWERS.length;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";

    const gl = (canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    let program: WebGLProgram;
    try { program = mkProgram(gl); }
    catch (e) { console.error(e); return; }

    gl.useProgram(program);

    // Geometry: two triangles covering NDC
    const quad = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uFrom     = gl.getUniformLocation(program, "u_from")!;
    const uTo       = gl.getUniformLocation(program, "u_to")!;
    const uProgress = gl.getUniformLocation(program, "u_progress")!;
    gl.uniform1i(uFrom, 0);
    gl.uniform1i(uTo, 1);

    // Render each slide to an offscreen canvas → texture
    const textures: WebGLTexture[] = SLIDE_DRAWERS.map(fn => {
      const off = document.createElement("canvas");
      off.width  = W * dpr;
      off.height = H * dpr;
      const ctx2 = off.getContext("2d")!;
      ctx2.scale(dpr, dpr);
      fn(ctx2, W, H);
      return mkTexture(gl, off);
    });

    gl.viewport(0, 0, canvas.width, canvas.height);

    // Animation state
    let rafId = 0;
    let alive  = true;
    let displayProgress = 0;
    let lastSlideInt = -1;
    const getTarget = () => targetRef.current;
    const setTarget = (v: number) => { targetRef.current = Math.max(0, Math.min(N - 1, v)); };

    function render() {
      if (!alive) return;
      rafId = requestAnimationFrame(render);

      displayProgress += (getTarget() - displayProgress) * 0.065;
      displayProgress  = Math.max(0, Math.min(N - 1, displayProgress));

      const fromIdx = Math.max(0, Math.min(N - 2, Math.floor(displayProgress)));
      const toIdx   = fromIdx + 1;
      const prog    = Math.max(0, Math.min(1, displayProgress - fromIdx));

      const slideInt = Math.min(N - 1, Math.round(displayProgress));
      if (slideInt !== lastSlideInt) { lastSlideInt = slideInt; setCurrentSlide(slideInt); }

      gl!.uniform1f(uProgress, prog);
      gl!.activeTexture(gl!.TEXTURE0); gl!.bindTexture(gl!.TEXTURE_2D, textures[fromIdx]);
      gl!.activeTexture(gl!.TEXTURE1); gl!.bindTexture(gl!.TEXTURE_2D, textures[toIdx]);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
    }

    render();

    // Wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setTarget(getTarget() + e.deltaY * 0.0028);
    };

    // Touch
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      e.preventDefault();
      const dy = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      setTarget(getTarget() + dy * 0.006);
    };

    // Keyboard
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight")
        setTarget(Math.floor(getTarget()) + 1);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft")
        setTarget(Math.ceil(getTarget()) - 1);
    };

    // Mouse cursor
    const onMouseMove = (e: MouseEvent) => {
      setShowCursor(true);
      if (cursorRef.current)
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    const onMouseLeave = () => setShowCursor(false);

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false });
    window.addEventListener("keydown",    onKey);
    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("keydown",    onKey);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  const goTo = (i: number) => { targetRef.current = i; };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ cursor: "none" }}>
      {/* WebGL canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* Film grain SVG overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        style={{ opacity: 0.045, mixBlendMode: "overlay" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          opacity: showCursor ? 1 : 0,
          transition: "opacity 0.2s",
          willChange: "transform",
        }}
      >
        <div
          className="w-3 h-3 rounded-full bg-white"
          style={{ transform: "translate(-50%, -50%)", mixBlendMode: "difference" }}
        />
      </div>

      {/* Back button */}
      <button
        onClick={onBack ?? (() => window.history.back())}
        className="fixed top-7 left-7 z-10 text-white/25 hover:text-white/70 transition-colors text-[11px] tracking-[0.25em] uppercase font-light"
      >
        ← Back
      </button>

      {/* Slide counter */}
      <div className="fixed top-7 right-7 z-10 text-right select-none">
        <p className="text-white/20 text-[11px] font-light tracking-[0.25em]">
          {String(currentSlide + 1).padStart(2, "0")} / {String(SLIDE_DRAWERS.length).padStart(2, "0")}
        </p>
        <p className="text-white/18 text-[10px] tracking-[0.35em] mt-0.5 uppercase">
          {SLIDE_LABELS[currentSlide]}
        </p>
      </div>

      {/* Nav dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-[14px]">
        {SLIDE_DRAWERS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={SLIDE_LABELS[i]}
            className="group flex items-center justify-end gap-2"
          >
            <span className={`text-[9px] tracking-widest text-white/0 group-hover:text-white/30 transition-colors ${i === currentSlide ? "text-white/25" : ""}`}>
              {SLIDE_LABELS[i]}
            </span>
            <span
              className={`block rounded-full transition-all duration-500 ${
                i === currentSlide
                  ? "w-2.5 h-2.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/20 group-hover:bg-white/40"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Scroll hint on first slide */}
      <AnimatePresence>
        {currentSlide === 0 && (
          <motion.div
            key="scroll-hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 select-none pointer-events-none"
          >
            <span className="text-white/20 text-[9px] tracking-[0.4em] uppercase">Scroll</span>
            <motion.div
              animate={{ scaleY: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-px h-8 bg-white/30 origin-top"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* AJINOMOTO wordmark bottom-left on last slide */}
      <AnimatePresence>
        {currentSlide === SLIDE_DRAWERS.length - 1 && (
          <motion.div
            key="end-mark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-7 left-7 z-10 select-none"
          >
            <p className="text-white/15 text-[10px] tracking-[0.4em] uppercase">ajinomoto.co.jp</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
