"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── GLSL: Vertex ────────────────────────────────────────────────────────────

const VERT = `
attribute vec2 a;
varying vec2 v;
void main(){
  v=vec2(a.x*.5+.5,.5-a.y*.5);
  gl_Position=vec4(a,0.,1.);
}`;

// ─── GLSL: Fragment — wave-wipe + mouse distortion + vignette ────────────────

const FRAG = `
precision highp float;
uniform sampler2D uA;
uniform sampler2D uB;
uniform float uP;
uniform vec2  uM;
varying vec2 v;
const float PI=3.14159265;

void main(){
  // Warp amplitude peaks mid-transition
  float warp=sin(uP*PI)*.048;

  // Mouse radial pull (subtle lens distortion around cursor)
  vec2  d  =v-uM;
  float ms =(1.-smoothstep(0.,.22,length(d)))*.014;
  vec2  mo =normalize(d+.001)*(-ms);

  // Sine-wave on the wipe edge
  float wave=sin(v.x*PI*7.)*warp;

  vec2 uvA=clamp(v+mo+vec2(0.,wave*.7),.001,.999);
  vec2 uvB=clamp(v+mo-vec2(0.,wave*.7),.001,.999);

  vec4 cA=texture2D(uA,uvA);
  vec4 cB=texture2D(uB,uvB);

  // Vertical wipe: new slide lifts from bottom
  float edge=1.-uP;
  float t=smoothstep(edge-.032,edge+.032,v.y+wave);
  vec4 col=mix(cA,cB,t);

  // Cinematic vignette
  float vig=1.-smoothstep(.25,.8,length((v-.5)*vec2(.88,1.28)));
  col.rgb*=.82+.18*vig;

  gl_FragColor=col;
}`;

// ─── Canvas helpers ───────────────────────────────────────────────────────────

type C2D = CanvasRenderingContext2D;

function corner(ctx: C2D, x:number,y:number,sx:number,sy:number,len:number){
  ctx.beginPath();
  ctx.moveTo(x,y+sy*len);ctx.lineTo(x,y);ctx.lineTo(x+sx*len,y);
  ctx.stroke();
}
function viewfinder(ctx:C2D,w:number,h:number,pad:number,len:number,color="rgba(230,0,18,.45)"){
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1.4;
  const s=Math.min(w,h)*len;
  corner(ctx,pad,pad,1,1,s); corner(ctx,w-pad,pad,-1,1,s);
  corner(ctx,pad,h-pad,1,-1,s); corner(ctx,w-pad,h-pad,-1,-1,s);
  ctx.restore();
}
function hRule(ctx:C2D,y:number,x0:number,x1:number,color="rgba(255,255,255,.09)"){
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
  ctx.restore();
}
function scanlines(ctx:C2D,w:number,h:number,gap=3,a=0.018){
  ctx.save();ctx.fillStyle=`rgba(0,0,0,${a})`;
  for(let y=0;y<h;y+=gap)ctx.fillRect(0,y,w,1);
  ctx.restore();
}
function rgGrad(ctx:C2D,w:number,h:number,cx:number,cy:number,r:number,c0:string,c1:string){
  const g=ctx.createRadialGradient(cx,cy,0,w*.5,h*.5,r);
  g.addColorStop(0,c0);g.addColorStop(1,c1);return g;
}

// ─── Slide 0 — Identity ───────────────────────────────────────────────────────

function slide0(ctx:C2D,w:number,h:number){
  // Background: deep red-black radial
  ctx.fillStyle=rgGrad(ctx,w,h,w*.14,h*.6,w*.75,"#0d0000","#000000");
  ctx.fillRect(0,0,w,h);

  // Red circle — large, bleeds off bottom-left
  ctx.save();
  ctx.beginPath();ctx.arc(w*.04,h*.82,h*.52,0,Math.PI*2);
  ctx.fillStyle="#E60012";ctx.fill();
  ctx.restore();

  // Fade circle where the title sits
  const fade=ctx.createLinearGradient(0,0,w*.55,0);
  fade.addColorStop(0,"rgba(0,0,0,0)");
  fade.addColorStop(.22,"rgba(0,0,0,.68)");
  fade.addColorStop(1,"rgba(0,0,0,.9)");
  ctx.fillStyle=fade;ctx.fillRect(0,0,w,h);

  // "AJINOMOTO"
  const ts=Math.round(Math.min(w/8.4,h/4.8));
  ctx.font=`900 ${ts}px 'Helvetica Neue','Arial Black',Arial,sans-serif`;
  ctx.textAlign="left";ctx.textBaseline="alphabetic";
  ctx.shadowColor="rgba(0,0,0,.9)";ctx.shadowBlur=40;
  ctx.fillStyle="#ffffff";
  ctx.fillText("AJINOMOTO",w*.06,h*.5);
  ctx.shadowBlur=0;

  // Japanese
  ctx.font=`300 ${Math.round(h*.055)}px 'Hiragino Sans','Yu Gothic','BIZ UDPGothic',sans-serif`;
  ctx.fillStyle="rgba(255,255,255,.38)";
  ctx.fillText("味の素",w*.065,h*.598);

  // Red sub-label
  ctx.font=`500 ${Math.round(h*.016)}px 'Helvetica Neue',Arial,sans-serif`;
  ctx.fillStyle="#E60012";
  ctx.fillText("TV COMMERCIAL",w*.065,h*.658);

  // Year
  ctx.textAlign="right";
  ctx.font=`300 ${Math.round(h*.015)}px 'Helvetica Neue',Arial,sans-serif`;
  ctx.fillStyle="rgba(255,255,255,.12)";
  ctx.fillText("2019",w*.94,h*.945);

  viewfinder(ctx,w,h,w*.035,.038);
  scanlines(ctx,w,h,3,.02);
}

// ─── Slide 1 — Campaign ───────────────────────────────────────────────────────

function slide1(ctx:C2D,w:number,h:number){
  ctx.fillStyle="#060606";ctx.fillRect(0,0,w,h);

  hRule(ctx,h*.33,w*.06,w*.94);
  hRule(ctx,h*.71,w*.06,w*.94);

  // Label
  ctx.font=`400 ${Math.round(h*.014)}px 'Helvetica Neue',Arial,sans-serif`;
  ctx.textAlign="left";ctx.textBaseline="alphabetic";
  ctx.fillStyle="#E60012";
  ctx.fillText("CAMPAIGN · TV COMMERCIAL · 2019",w*.06,h*.3);

  // Main type
  const big=Math.round(Math.min(w/7.6,h/5.4));
  ctx.font=`800 ${big}px 'Helvetica Neue','Arial Black',Arial,sans-serif`;
  ctx.fillStyle="#ffffff";
  ctx.fillText("INGREDIENTS",w*.06,h*.518);
  ctx.fillText("OF LIFE",w*.06,h*.625);

  // Japanese below rule
  ctx.font=`300 ${Math.round(h*.048)}px 'Hiragino Sans','Yu Gothic',sans-serif`;
  ctx.fillStyle="rgba(255,255,255,.25)";
  ctx.fillText("いのちの食材",w*.063,h*.775);

  // Episode marker top right
  ctx.textAlign="right";
  ctx.font=`300 ${Math.round(h*.014)}px 'Helvetica Neue',Arial,sans-serif`;
  ctx.fillStyle="rgba(255,255,255,.18)";
  ctx.fillText("01/05",w*.94,h*.045);

  scanlines(ctx,w,h,3,.018);
}

// ─── Slide 2 — Key Visual ─────────────────────────────────────────────────────

function slide2(ctx:C2D,w:number,h:number){
  ctx.fillStyle=rgGrad(ctx,w,h,w*.5,h*.4,w*.6,"#060000","#020202");
  ctx.fillRect(0,0,w,h);

  // Ghost numeral
  ctx.font=`900 ${Math.round(h*.44)}px 'Helvetica Neue','Arial Black',Arial,sans-serif`;
  ctx.textAlign="right";ctx.textBaseline="top";
  ctx.fillStyle="rgba(230,0,18,.06)";
  ctx.fillText("01",w*.97,-h*.04);

  // Massive Japanese
  const jpSize=Math.round(Math.min(w/5.2,h/3.4));
  ctx.font=`900 ${jpSize}px 'Hiragino Sans','Yu Gothic','BIZ UDPGothic',sans-serif`;
  ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.shadowColor="rgba(230,0,18,.18)";ctx.shadowBlur=60;
  ctx.fillStyle="#ffffff";
  ctx.fillText("いのちの食材",w*.5,h*.415);
  ctx.shadowBlur=0;

  // Red rule under text — exact text width
  const tw=ctx.measureText("いのちの食材").width;
  ctx.fillStyle="#E60012";
  ctx.fillRect(w*.5-tw/2,h*.505,tw,Math.ceil(h*.0036));

  // English translation
  ctx.font=`300 ${Math.round(h*.02)}px 'Helvetica Neue',Arial,sans-serif`;
  ctx.fillStyle="rgba(255,255,255,.35)";
  ctx.fillText("INGREDIENTS OF LIFE",w*.5,h*.565);

  viewfinder(ctx,w,h,w*.035,.036,"rgba(230,0,18,.3)");
  scanlines(ctx,w,h,3,.019);
}

// ─── Slide 3 — Credits ────────────────────────────────────────────────────────

function slide3(ctx:C2D,w:number,h:number){
  ctx.fillStyle="#000000";ctx.fillRect(0,0,w,h);

  hRule(ctx,h*.26,w*.08,w*.92,"rgba(255,255,255,.06)");

  ctx.font=`300 ${Math.round(h*.013)}px 'Helvetica Neue',Arial,sans-serif`;
  ctx.textAlign="left";ctx.textBaseline="alphabetic";
  ctx.fillStyle="rgba(255,255,255,.18)";
  ctx.fillText("CREDITS",w*.08,h*.232);

  const rows=[
    {label:"DIRECTOR",   val:"TAO TAJIMA"},
    {label:"PRODUCTION", val:"HOMUNCULUS INC."},
    {label:"CLIENT",     val:"AJINOMOTO CO., INC."},
    {label:"MUSIC",      val:"YOSHIHIDE ŌTOMO"},
  ];
  const rowH=h*.125;
  rows.forEach(({label,val},i)=>{
    const y=h*.305+i*rowH;
    ctx.font=`400 ${Math.round(h*.013)}px 'Helvetica Neue',Arial,sans-serif`;
    ctx.fillStyle="#E60012";
    ctx.fillText(label,w*.08,y);
    ctx.font=`700 ${Math.round(h*.043)}px 'Helvetica Neue',Arial,sans-serif`;
    ctx.fillStyle="#ffffff";
    ctx.fillText(val,w*.08,y+h*.054);
  });

  // Right column — abstract red square
  ctx.save();
  ctx.globalAlpha=.07;
  ctx.fillStyle="#E60012";
  ctx.fillRect(w*.68,h*.28,w*.18,h*.42);
  ctx.restore();

  // Number marker
  ctx.textAlign="right";
  ctx.font=`300 ${Math.round(h*.013)}px 'Helvetica Neue',Arial,sans-serif`;
  ctx.fillStyle="rgba(255,255,255,.12)";
  ctx.fillText("04/05",w*.94,h*.045);

  scanlines(ctx,w,h,3,.016);
}

// ─── Slide 4 — End ───────────────────────────────────────────────────────────

function slide4(ctx:C2D,w:number,h:number){
  ctx.fillStyle="#000000";ctx.fillRect(0,0,w,h);

  // Tiny red dot — precise center
  ctx.beginPath();
  ctx.arc(w*.5,h*.43,Math.min(w,h)*.028,0,Math.PI*2);
  ctx.fillStyle="#E60012";ctx.fill();

  // Brand
  ctx.font=`300 ${Math.round(h*.032)}px 'Hiragino Sans','Yu Gothic',sans-serif`;
  ctx.textAlign="center";ctx.textBaseline="top";
  ctx.fillStyle="rgba(255,255,255,.5)";
  ctx.fillText("味の素",w*.5,h*.484);

  ctx.font=`300 ${Math.round(h*.014)}px 'Helvetica Neue',Arial,sans-serif`;
  ctx.fillStyle="rgba(255,255,255,.15)";
  ctx.fillText("© 2019 AJINOMOTO CO., INC.",w*.5,h*.544);

  // Thin top and bottom rules (terminal frame)
  hRule(ctx,h*.04,w*.3,w*.7,"rgba(255,255,255,.05)");
  hRule(ctx,h*.96,w*.3,w*.7,"rgba(255,255,255,.05)");

  scanlines(ctx,w,h,3,.014);
}

const DRAWS = [slide0,slide1,slide2,slide3,slide4];
const LABELS = ["OPENING","CAMPAIGN","TAGLINE","CREDITS","FIN"];

// ─── WebGL helpers ────────────────────────────────────────────────────────────

function mkShader(gl:WebGLRenderingContext,type:number,src:string){
  const s=gl.createShader(type)!;
  gl.shaderSource(s,src);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)??'');
  return s;
}
function mkProg(gl:WebGLRenderingContext){
  const p=gl.createProgram()!;
  gl.attachShader(p,mkShader(gl,gl.VERTEX_SHADER,VERT));
  gl.attachShader(p,mkShader(gl,gl.FRAGMENT_SHADER,FRAG));
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)??'');
  return p;
}
function mkTex(gl:WebGLRenderingContext,src:HTMLCanvasElement){
  const t=gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  return t;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AjinomotoExperience({onBack}:{onBack?:()=>void}){
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const cursorRef  = useRef<HTMLDivElement>(null);
  const ringRef    = useRef<HTMLDivElement>(null);
  const targetRef  = useRef(0);
  const mouseRef   = useRef({x:.5,y:.5});
  const [slide, setSlide]     = useState(0);
  const [loaded, setLoaded]   = useState(false);
  const [cursorOn, setCursor] = useState(false);

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas||typeof window==="undefined")return;

    const dpr=Math.min(window.devicePixelRatio||1,2);
    const W=window.innerWidth, H=window.innerHeight;
    const N=DRAWS.length;

    canvas.width=W*dpr; canvas.height=H*dpr;
    canvas.style.width=W+"px"; canvas.style.height=H+"px";

    const glRaw=(canvas.getContext("webgl")||canvas.getContext("experimental-webgl")) as WebGLRenderingContext|null;
    if(!glRaw)return;
    const gl=glRaw;

    let prog:WebGLProgram;
    try{prog=mkProg(gl);}catch(e){console.error(e);return;}
    gl.useProgram(prog);

    // Quad
    const q=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);
    const buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,q,gl.STATIC_DRAW);
    const aLoc=gl.getAttribLocation(prog,"a");
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc,2,gl.FLOAT,false,0,0);

    // Uniforms — texture slots are fixed
    const uA=gl.getUniformLocation(prog,"uA")!;
    const uB=gl.getUniformLocation(prog,"uB")!;
    const uP=gl.getUniformLocation(prog,"uP")!;
    const uM=gl.getUniformLocation(prog,"uM")!;
    gl.uniform1i(uA,0);gl.uniform1i(uB,1);

    // Build slide textures
    const textures:WebGLTexture[]=DRAWS.map(fn=>{
      const off=document.createElement("canvas");
      off.width=W*dpr;off.height=H*dpr;
      const ctx2=off.getContext("2d")!;
      ctx2.scale(dpr,dpr);
      fn(ctx2,W,H);
      return mkTex(gl,off);
    });

    gl.viewport(0,0,canvas.width,canvas.height);
    setLoaded(true);

    // Snap timer
    let snapTimer:ReturnType<typeof setTimeout>|null=null;
    const scheduleSnap=()=>{
      if(snapTimer)clearTimeout(snapTimer);
      snapTimer=setTimeout(()=>{
        targetRef.current=Math.round(targetRef.current);
      },420);
    };

    // Render loop
    let raf=0, alive=true;
    let dp=0, lastSlide=-1;

    function loop(){
      if(!alive)return;
      raf=requestAnimationFrame(loop);

      dp+=(targetRef.current-dp)*.068;
      dp=Math.max(0,Math.min(N-1,dp));

      const from=Math.max(0,Math.min(N-2,Math.floor(dp)));
      const p=Math.max(0,Math.min(1,dp-from));

      const si=Math.min(N-1,Math.round(dp));
      if(si!==lastSlide){lastSlide=si;setSlide(si);}

      gl.uniform1f(uP,p);
      gl.uniform2f(uM,mouseRef.current.x,mouseRef.current.y);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[from]);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,textures[from+1]);
      gl.drawArrays(gl.TRIANGLES,0,6);
    }
    loop();

    // Events
    const onWheel=(e:WheelEvent)=>{
      e.preventDefault();
      targetRef.current=Math.max(0,Math.min(N-1,targetRef.current+e.deltaY*.0026));
      scheduleSnap();
    };

    let ty=0;
    const onTS=(e:TouchEvent)=>{ty=e.touches[0].clientY;};
    const onTM=(e:TouchEvent)=>{
      e.preventDefault();
      const dy=ty-e.touches[0].clientY; ty=e.touches[0].clientY;
      targetRef.current=Math.max(0,Math.min(N-1,targetRef.current+dy*.0055));
      scheduleSnap();
    };

    const onKey=(e:KeyboardEvent)=>{
      if(e.key==="ArrowDown"||e.key==="ArrowRight")
        targetRef.current=Math.min(N-1,Math.floor(targetRef.current)+1);
      if(e.key==="ArrowUp"||e.key==="ArrowLeft")
        targetRef.current=Math.max(0,Math.ceil(targetRef.current)-1);
    };

    const onMM=(e:MouseEvent)=>{
      setCursor(true);
      mouseRef.current={x:e.clientX/W, y:e.clientY/H};
      // Cursor dot
      if(cursorRef.current)
        cursorRef.current.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;
      // Cursor ring (slightly lagged via CSS transition)
      if(ringRef.current)
        ringRef.current.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;
    };

    window.addEventListener("wheel",onWheel,{passive:false});
    window.addEventListener("touchstart",onTS,{passive:false});
    window.addEventListener("touchmove",onTM,{passive:false});
    window.addEventListener("keydown",onKey);
    window.addEventListener("mousemove",onMM);
    window.addEventListener("mouseleave",()=>setCursor(false));

    return()=>{
      alive=false; cancelAnimationFrame(raf);
      if(snapTimer)clearTimeout(snapTimer);
      window.removeEventListener("wheel",onWheel);
      window.removeEventListener("touchstart",onTS);
      window.removeEventListener("touchmove",onTM);
      window.removeEventListener("keydown",onKey);
      window.removeEventListener("mousemove",onMM);
    };
  },[]);

  return(
    <div className="fixed inset-0 bg-black overflow-hidden" style={{cursor:"none"}}>
      <canvas ref={canvasRef} className="absolute inset-0 block"/>

      {/* Intro fade */}
      <AnimatePresence>
        {!loaded&&(
          <motion.div
            className="absolute inset-0 bg-black z-50 flex items-center justify-center"
            exit={{opacity:0}}
            transition={{duration:.8,ease:"easeInOut"}}
          >
            <motion.div
              animate={{opacity:[.3,.8,.3]}}
              transition={{repeat:Infinity,duration:1.4}}
              className="w-2 h-2 rounded-full bg-[#E60012]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Film grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
           style={{opacity:.042,mixBlendMode:"overlay"}} xmlns="http://www.w3.org/2000/svg">
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency=".74" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#g)"/>
      </svg>

      {/* Cursor dot */}
      <div ref={cursorRef}
           className="fixed top-0 left-0 pointer-events-none z-50"
           style={{opacity:cursorOn?1:0,transition:"opacity .15s",willChange:"transform"}}>
        <div className="w-2 h-2 rounded-full bg-white"
             style={{transform:"translate(-50%,-50%)",mixBlendMode:"difference"}}/>
      </div>

      {/* Cursor ring — lagged via CSS transition */}
      <div ref={ringRef}
           className="fixed top-0 left-0 pointer-events-none z-50"
           style={{opacity:cursorOn?.55:0,transition:"transform .12s ease-out, opacity .15s",willChange:"transform"}}>
        <div className="w-9 h-9 rounded-full border border-white/30"
             style={{transform:"translate(-50%,-50%)"}}/>
      </div>

      {/* Back */}
      <button onClick={onBack??(() => window.history.back())}
              className="fixed top-7 left-7 z-10 text-white/22 hover:text-white/65 transition-colors duration-300 text-[11px] tracking-[.3em] uppercase font-light">
        ← Back
      </button>

      {/* Slide label — vertical left */}
      <div className="fixed left-5 top-1/2 z-10 -translate-y-1/2 pointer-events-none"
           style={{writingMode:"vertical-rl",textOrientation:"mixed",transform:"rotate(180deg) translateY(50%)"}}>
        <span className="text-white/14 text-[9px] tracking-[.4em] uppercase font-light">
          {LABELS[slide]}
        </span>
      </div>

      {/* Slide counter top-right */}
      <div className="fixed top-7 right-7 z-10 text-right select-none">
        <p className="text-white/20 text-[11px] font-light tracking-[.28em]">
          {String(slide+1).padStart(2,"0")} <span className="text-white/10">/</span> {String(DRAWS.length).padStart(2,"0")}
        </p>
      </div>

      {/* Nav dots right */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-[13px]">
        {DRAWS.map((_,i)=>(
          <button key={i} onClick={()=>{targetRef.current=i;}}
                  className="group flex items-center justify-end gap-2.5">
            <span className={`text-[9px] tracking-widest uppercase transition-all duration-300 ${i===slide?"text-white/28":"text-white/0 group-hover:text-white/22"}`}>
              {LABELS[i]}
            </span>
            <span className={`block rounded-full transition-all duration-500 ${
              i===slide?"w-2.5 h-2.5 bg-white":"w-[5px] h-[5px] bg-white/18 group-hover:bg-white/38"
            }`}/>
          </button>
        ))}
      </div>

      {/* Progress bar — bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-10 h-px bg-white/6">
        <motion.div
          className="h-full bg-[#E60012]"
          animate={{width:`${(slide/(DRAWS.length-1))*100}%`}}
          transition={{duration:.55,ease:[.25,.46,.45,.94]}}
        />
      </div>

      {/* Scroll hint */}
      <AnimatePresence>
        {slide===0&&loaded&&(
          <motion.div key="sh"
            initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            transition={{delay:1.4,duration:.7}}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 pointer-events-none select-none">
            <span className="text-white/18 text-[9px] tracking-[.45em] uppercase">Scroll</span>
            <motion.div
              animate={{scaleY:[1,1.5,1],opacity:[.15,.4,.15]}}
              transition={{repeat:Infinity,duration:1.9,ease:"easeInOut"}}
              className="w-px h-7 bg-white/25 origin-top"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* End mark */}
      <AnimatePresence>
        {slide===DRAWS.length-1&&(
          <motion.p key="em"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed bottom-5 left-7 z-10 text-white/12 text-[10px] tracking-[.4em] uppercase select-none">
            ajinomoto.co.jp
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
