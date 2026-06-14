/* ═══════════════════════════════════════════════════════════
   AI.PORTFOLIO — SCRIPT.JS
   "Neural Atelier" · GSAP ScrollTrigger × Neomorphic Motion
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── INIT ──────────────────────────────────────────────────── */
window.addEventListener('load', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        document.body.classList.add('no-gsap');
        hidePreloader();
        initCounters();
        initTypingCode();
        return;
    }
    gsap.registerPlugin(ScrollTrigger);
    initAll();
});

function initAll() {
    initCursor();
    initScrollProgress();
    initPreloader();
    initNav();
    initMobileMenu();
    initSmoothAnchor();
    initDotNav();
    initMagnetic();
    initCardTilt();
    initTypingCode();
}

/* ── CURSOR (dot + ring + contextual label) ─────────────────── */
function initCursor() {
    const dot   = document.querySelector('.cursor-dot');
    const ring  = document.querySelector('.cursor-ring');
    const label = document.querySelector('.cursor-label');
    if (!dot || !ring) return;

    let rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        gsap.to(dot, { x: e.clientX, y: e.clientY, duration: .06, ease: 'none' });
    });

    (function lerp() {
        const dx = parseFloat(gsap.getProperty(dot, 'x'));
        const dy = parseFloat(gsap.getProperty(dot, 'y'));
        rx += (dx - rx) * .1;
        ry += (dy - ry) * .1;
        gsap.set(ring, { x: rx, y: ry });
        requestAnimationFrame(lerp);
    })();

    /* Generic hover targets → enlarge */
    const hoverSel = 'a, button, .bento-card, .stack-blob, .vibe-feat, .cc-item, .nav-logo, .mm-link';
    document.querySelectorAll(hoverSel).forEach(el => {
        el.addEventListener('mouseenter', () => { dot.classList.add('hov'); ring.classList.add('hov'); });
        el.addEventListener('mouseleave', () => { dot.classList.remove('hov'); ring.classList.remove('hov'); });
    });

    /* Contextual labels (data-cursor) → show text inside ring */
    document.querySelectorAll('[data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (label) label.textContent = el.getAttribute('data-cursor');
            ring.classList.add('label');
            dot.classList.add('label');
        });
        el.addEventListener('mouseleave', () => {
            ring.classList.remove('label');
            dot.classList.remove('label');
        });
    });
}

/* ── SCROLL PROGRESS BAR ────────────────────────────────────── */
function initScrollProgress() {
    const bar = document.querySelector('.sp-bar');
    if (!bar) return;
    gsap.to(bar, {
        width: '100%',
        ease: 'none',
        scrollTrigger: { start: 'top top', end: 'bottom bottom', scrub: .3 }
    });
}

/* ── PRELOADER (with % counter) ─────────────────────────────── */
function initPreloader() {
    const loader  = document.getElementById('preloader');
    const letters = document.querySelectorAll('.pl-letter');
    const sub     = document.querySelector('.pl-sub');
    const pct     = document.querySelector('.pl-pct');

    /* Animate the percentage 0 → 100 */
    if (pct) {
        const obj = { v: 0 };
        gsap.to(obj, {
            v: 100, duration: 1.6, ease: 'power2.inOut',
            onUpdate: () => { pct.textContent = Math.round(obj.v); }
        });
    }

    const tl = gsap.timeline({
        onComplete: () => {
            loader.style.display = 'none';
            initHero();
            initScrollAnimations();
            initCounters();
        }
    });

    tl
        .to(letters, { y: 0, opacity: 1, duration: .7, stagger: .1, ease: 'power3.out', delay: .1 })
        .to(sub, { opacity: 1, y: 0, duration: .4, ease: 'power2.out' }, '-=.2')
        .to(letters, { y: '-90%', opacity: 0, duration: .45, stagger: .06, ease: 'power2.in', delay: .85 })
        .to(sub, { opacity: 0, y: -10, duration: .3, ease: 'power2.in' }, '<.05')
        .to(loader, { opacity: 0, duration: .4 }, '-=.1');
}

function hidePreloader() {
    const loader = document.getElementById('preloader');
    if (!loader) return;
    loader.style.transition = 'opacity .6s ease';
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 700);
}

/* ── HERO ENTRANCE ──────────────────────────────────────────── */
function initHero() {
    const tl = gsap.timeline({ delay: .05 });
    tl
        .to('.ht-w', { y: 0, opacity: 1, duration: .9, stagger: { amount: .5 }, ease: 'power3.out' })
        .to('.hero-badge', { opacity: 1, y: 0, duration: .55, ease: 'power2.out' }, '-=.65')
        .to('.hero-sub', { opacity: 1, y: 0, duration: .55, ease: 'power2.out' }, '-=.4')
        .to('.hero-ctas', { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, '-=.35')
        .to('.hero-scroll', { opacity: 1, duration: .5, ease: 'power2.out' }, '-=.3')
        .to('.float-card', { opacity: 1, y: 0, duration: .7, stagger: .15, ease: 'power3.out' }, '-=.5');

    /* Hero parallax on scroll */
    gsap.to('.hero-title', {
        y: '18%', opacity: .15, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.3 }
    });
    gsap.to('.hero-ghost', {
        y: '-15%', x: '3%', ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2.5 }
    });

    /* Mouse parallax on blobs */
    const blobs = document.querySelectorAll('.blob');
    document.addEventListener('mousemove', e => {
        const xp = (e.clientX / window.innerWidth  - .5);
        const yp = (e.clientY / window.innerHeight - .5);
        blobs.forEach((b, i) => {
            const f = (i + 1) * 15;
            gsap.to(b, { x: xp * f, y: yp * f * .6, duration: 2.5, ease: 'power2.out' });
        });
    });
}

/* ── NAV ────────────────────────────────────────────────────── */
function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    ScrollTrigger.create({
        start: 'top -50px',
        onUpdate: self => nav.classList.toggle('scrolled', self.scroll() > 50)
    });
}

/* ── MOBILE MENU ────────────────────────────────────────────── */
function initMobileMenu() {
    const burger = document.querySelector('.nav-burger');
    const menu   = document.querySelector('.mobile-menu');
    if (!burger || !menu) return;

    let open = false;
    function toggle() {
        open = !open;
        burger.classList.toggle('open', open);
        menu.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
        menu.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', toggle);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => open && toggle()));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) toggle(); });
}

/* ── SMOOTH ANCHOR ──────────────────────────────────────────── */
function initSmoothAnchor() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
        });
    });
}

/* ── DOT NAV (active section sync) ──────────────────────────── */
function initDotNav() {
    const dots = document.querySelectorAll('.dot-nav a');
    if (!dots.length) return;

    dots.forEach(dot => {
        const id = dot.getAttribute('href');
        const sec = document.querySelector(id);
        if (!sec) return;
        ScrollTrigger.create({
            trigger: sec,
            start: 'top 50%',
            end: 'bottom 50%',
            onToggle: self => {
                if (self.isActive) {
                    dots.forEach(d => d.classList.remove('active'));
                    dot.classList.add('active');
                }
            }
        });
    });
}

/* ── MAGNETIC BUTTONS ───────────────────────────────────────── */
function initMagnetic() {
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r  = btn.getBoundingClientRect();
            const dx = (e.clientX - r.left) / r.width  - .5;
            const dy = (e.clientY - r.top)  / r.height - .5;
            gsap.to(btn, { x: dx * 12, y: dy * 7, duration: .25, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: .5, ease: 'power3.out' }));
    });
}

/* ── CARD 3D TILT ───────────────────────────────────────────── */
function initCardTilt() {
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r  = card.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
            const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
            gsap.to(card, { rotateX: dy * -6, rotateY: dx * 7, transformPerspective: 900, duration: .3, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: .7, ease: 'power3.out' }));
    });
}

/* ── SCROLL ANIMATIONS ──────────────────────────────────────── */
function initScrollAnimations() {
    const eOut  = 'power3.out';
    const eSoft = 'power2.out';

    document.querySelectorAll('.section-tag').forEach(el => {
        gsap.to(el, { x: 0, opacity: 1, duration: .6, ease: eSoft,
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' } });
    });

    document.querySelectorAll('.section-title').forEach(el => {
        gsap.from(el, { y: 40, opacity: 0, duration: .8, ease: eOut,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' } });
    });

    gsap.to('.bento-card', {
        y: 0, opacity: 1, duration: .7, stagger: { each: .08, from: 'start' }, ease: eOut,
        scrollTrigger: { trigger: '.bento-grid', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    document.querySelectorAll('.vt-line').forEach((line, i) => {
        gsap.to(line, { x: 0, opacity: 1, duration: .8, delay: i * .1, ease: eOut,
            scrollTrigger: { trigger: '.vibe-title', start: 'top 82%', toggleActions: 'play none none reverse' } });
    });
    gsap.to('.vibe-desc', { y: 0, opacity: 1, duration: .65, ease: eSoft,
        scrollTrigger: { trigger: '.vibe-desc', start: 'top 85%', toggleActions: 'play none none reverse' } });
    document.querySelectorAll('.vibe-feat').forEach((f, i) => {
        gsap.to(f, { x: 0, opacity: 1, duration: .6, delay: i * .1, ease: eOut,
            scrollTrigger: { trigger: '.vibe-feats', start: 'top 83%', toggleActions: 'play none none reverse' } });
    });
    gsap.to('.vibe-right', { x: 0, opacity: 1, duration: .9, ease: eOut,
        scrollTrigger: { trigger: '.vibe-right', start: 'top 83%', toggleActions: 'play none none reverse' } });

    document.querySelectorAll('.stack-blob').forEach((b, i) => {
        gsap.to(b, { scale: 1, y: 0, opacity: 1, duration: .65, delay: i * .06, ease: eOut,
            scrollTrigger: { trigger: '.stack-grid', start: 'top 84%', toggleActions: 'play none none reverse' } });
    });

    gsap.to('.stats-inner', {
        y: 0, opacity: 1, duration: .8, ease: eOut,
        scrollTrigger: { trigger: '.stats-inner', start: 'top 83%', toggleActions: 'play none none reverse', onEnter: initCounters }
    });

    document.querySelectorAll('.ct-line').forEach((line, i) => {
        gsap.to(line, { y: 0, opacity: 1, duration: .85, delay: i * .12, ease: eOut,
            scrollTrigger: { trigger: '.connect-title', start: 'top 82%', toggleActions: 'play none none reverse' } });
    });
    gsap.to('.connect-sub', { y: 0, opacity: 1, duration: .6, ease: eSoft,
        scrollTrigger: { trigger: '.connect-sub', start: 'top 85%', toggleActions: 'play none none reverse' } });
    gsap.to('.connect-cards', { y: 0, opacity: 1, duration: .7, ease: eOut,
        scrollTrigger: { trigger: '.connect-cards', start: 'top 85%', toggleActions: 'play none none reverse' } });
    gsap.to('.bca-link', { x: 0, opacity: 1, duration: .9, ease: eOut,
        scrollTrigger: { trigger: '.big-cta', start: 'top 87%', toggleActions: 'play none none reverse' } });

    gsap.to('.footer-ghost', { y: '10%', ease: 'none',
        scrollTrigger: { trigger: 'footer', start: 'top bottom', end: 'bottom bottom', scrub: 1.5 } });
}

/* ── COUNTERS ───────────────────────────────────────────────── */
let countersRan = false;
function initCounters() {
    if (countersRan) return;
    countersRan = true;

    const floatVal = document.querySelector('.cnt-val');
    if (floatVal) animateCounter(floatVal, parseInt(floatVal.getAttribute('data-target') || '200', 10), 1.4);

    document.querySelectorAll('.stat-num[data-target]').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        animateCounter(el, target, 1.8, target >= 10 ? 'k+' : '+');
    });
}
function animateCounter(el, target, dur, suffix = '') {
    const start = performance.now();
    (function tick(now) {
        const p = Math.min((now - start) / 1000 / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
    })(start);
}

/* ── TYPING CODE (syntax-highlighted, with line gutter) ─────── */
function initTypingCode() {
    const el     = document.getElementById('typing-code');
    const gutter = document.querySelector('.code-gutter');
    if (!el) return;

    const lines = [
        '// vibe.ai — опиши свою идею',
        'const app = await ai.vibe(`',
        '  Сделай умное todo-приложение:',
        '  - AI подсказки задач',
        '  - голосовой ввод',
        '  - совместное редактирование',
        '  - красивый тёмный UI',
        '`)',
        '',
        '// ✓ Компонентов создано: 12',
        '// ✓ Строк кода: 847',
        '// ✓ Тестов написано: 24',
        '// 🚀 Deploy: ready'
    ];
    const code = lines.join('\n');

    function highlight(text) {
        return text
            .replace(/(\/\/[^\n]*)/g, '<span style="color:#4f9eff;opacity:.6">$1</span>')
            .replace(/\b(const|await|let|return)\b/g, '<span style="color:#9b6bff">$1</span>')
            .replace(/\b(vibe|ai|app)\b/g, '<span style="color:#00e5a0">$1</span>')
            .replace(/(`[^`]*`)/g, '<span style="color:#ff8a4c">$1</span>');
    }

    /* Pre-fill the line-number gutter */
    if (gutter) gutter.textContent = lines.map((_, i) => i + 1).join('\n');

    let i = 0, typed = '', started = false;
    function startTyping() {
        if (started) return;
        started = true;
        (function typeChar() {
            if (i >= code.length) return;
            typed += code[i];
            i++;
            el.innerHTML = highlight(typed);
            const next = code[i] === '\n' ? 40 : Math.random() * 30 + 18;
            setTimeout(typeChar, next);
        })();
    }

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({ trigger: '#vibe', start: 'top 70%', once: true, onEnter: startTyping });
    } else {
        setTimeout(startTyping, 1800);
    }
}

/* ── BENTO CHIP STAGGER ON HOVER ────────────────────────────── */
(function initChipHover() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.bento-card').forEach(card => {
        const chips = card.querySelectorAll('.chip');
        card.addEventListener('mouseenter', () => gsap.to(chips, { y: -3, stagger: .04, duration: .25, ease: 'power2.out' }));
        card.addEventListener('mouseleave', () => gsap.to(chips, { y: 0,  stagger: .03, duration: .35, ease: 'power3.out' }));
    });
})();

/* ── MARQUEE PAUSE ON HOVER ─────────────────────────────────── */
(function initMarqueePause() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
    track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
})();

/* ── STACK BLOB SCALE ON HOVER ──────────────────────────────── */
(function initBlobScale() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.stack-blob').forEach(blob => {
        blob.addEventListener('mouseenter', () => gsap.to(blob, { scale: 1.06, duration: .35, ease: 'power2.out' }));
        blob.addEventListener('mouseleave', () => gsap.to(blob, { scale: 1,    duration: .5,  ease: 'power3.out' }));
    });
})();

/* ── REDUCED MOTION ─────────────────────────────────────────── */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = `*, *::before, *::after { animation-duration:.01ms!important; animation-iteration-count:1!important; transition-duration:.01ms!important; }`;
    document.head.appendChild(style);
}
