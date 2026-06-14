/* ═══════════════════════════════════════════════════════════
   AI.PORTFOLIO — SCRIPT.JS
   GSAP ScrollTrigger × Neomorphic Interactions × Typing Code
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
    initPreloader();
    initNav();
    initMobileMenu();
    initSmoothAnchor();
    initMagnetic();
    initCardTilt();
    initTypingCode();
}

/* ── CURSOR ─────────────────────────────────────────────────── */
function initCursor() {
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let rx = 0, ry = 0;
    const targets = 'a, button, .bento-card, .stack-blob, .vibe-feat, .cc-item, .nav-logo, .mm-link';

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

    document.querySelectorAll(targets).forEach(el => {
        el.addEventListener('mouseenter', () => { dot.classList.add('hov'); ring.classList.add('hov'); });
        el.addEventListener('mouseleave', () => { dot.classList.remove('hov'); ring.classList.remove('hov'); });
    });
}

/* ── PRELOADER ──────────────────────────────────────────────── */
function initPreloader() {
    const loader  = document.getElementById('preloader');
    const letters = document.querySelectorAll('.pl-letter');
    const sub     = document.querySelector('.pl-sub');

    const tl = gsap.timeline({
        onComplete: () => {
            loader.style.display = 'none';
            initHero();
            initScrollAnimations();
            initCounters();
        }
    });

    tl
        .to(letters, {
            y: 0, opacity: 1,
            duration: .7,
            stagger: .1,
            ease: 'power3.out',
            delay: .1
        })
        .to(sub, { opacity: 1, y: 0, duration: .4, ease: 'power2.out' }, '-=.2')
        .to(letters, {
            y: '-90%', opacity: 0,
            duration: .45, stagger: .06,
            ease: 'power2.in',
            delay: .7
        })
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
        .to('.ht-w', {
            y: 0, opacity: 1,
            duration: .9,
            stagger: { amount: .5 },
            ease: 'power3.out'
        })
        .to('.hero-badge', {
            opacity: 1, y: 0,
            duration: .55, ease: 'power2.out'
        }, '-=.65')
        .to('.hero-sub', {
            opacity: 1, y: 0,
            duration: .55, ease: 'power2.out'
        }, '-=.4')
        .to('.hero-ctas', {
            opacity: 1, y: 0,
            duration: .5, ease: 'power2.out'
        }, '-=.35')
        .to('.hero-scroll', {
            opacity: 1,
            duration: .5, ease: 'power2.out'
        }, '-=.3')
        .to('.float-card', {
            opacity: 1, y: 0,
            duration: .7,
            stagger: .15,
            ease: 'power3.out'
        }, '-=.5');

    /* Hero parallax on scroll */
    gsap.to('.hero-title', {
        y: '18%', opacity: .15,
        ease: 'none',
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.3
        }
    });

    gsap.to('.hero-ghost', {
        y: '-15%', x: '3%',
        ease: 'none',
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 2.5
        }
    });

    /* Mouse parallax on blob bg */
    const blobs = document.querySelectorAll('.blob');
    document.addEventListener('mousemove', e => {
        const xp = (e.clientX / window.innerWidth - .5);
        const yp = (e.clientY / window.innerHeight - .5);
        blobs.forEach((b, i) => {
            const factor = (i + 1) * 15;
            gsap.to(b, {
                x: xp * factor,
                y: yp * factor * .6,
                duration: 2.5,
                ease: 'power2.out'
            });
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
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - navH,
                behavior: 'smooth'
            });
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
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: .5, ease: 'power3.out' });
        });
    });
}

/* ── CARD 3D TILT ───────────────────────────────────────────── */
function initCardTilt() {
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r  = card.getBoundingClientRect();
            const cx = r.left + r.width  / 2;
            const cy = r.top  + r.height / 2;
            const dx = (e.clientX - cx) / (r.width  / 2);
            const dy = (e.clientY - cy) / (r.height / 2);
            gsap.to(card, {
                rotateX: dy * -6,
                rotateY: dx *  7,
                transformPerspective: 900,
                duration: .3,
                ease: 'power2.out'
            });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0, rotateY: 0,
                duration: .7,
                ease: 'power3.out'
            });
        });
    });
}

/* ── SCROLL ANIMATIONS ──────────────────────────────────────── */
function initScrollAnimations() {
    const eOut  = 'power3.out';
    const eSoft = 'power2.out';

    /* ── Section tags ── */
    document.querySelectorAll('.section-tag').forEach(el => {
        gsap.to(el, {
            x: 0, opacity: 1, duration: .6, ease: eSoft,
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
        });
    });

    /* ── Section titles ── */
    document.querySelectorAll('.section-title').forEach(el => {
        gsap.from(el, {
            y: 40, opacity: 0, duration: .8, ease: eOut,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
    });

    /* ── Bento cards stagger ── */
    gsap.to('.bento-card', {
        y: 0, opacity: 1,
        duration: .7,
        stagger: { each: .08, from: 'start' },
        ease: eOut,
        scrollTrigger: {
            trigger: '.bento-grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    });

    /* ── Vibe left ── */
    document.querySelectorAll('.vt-line').forEach((line, i) => {
        gsap.to(line, {
            x: 0, opacity: 1, duration: .8, delay: i * .1, ease: eOut,
            scrollTrigger: { trigger: '.vibe-title', start: 'top 82%', toggleActions: 'play none none reverse' }
        });
    });

    gsap.to('.vibe-desc', {
        y: 0, opacity: 1, duration: .65, ease: eSoft,
        scrollTrigger: { trigger: '.vibe-desc', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    document.querySelectorAll('.vibe-feat').forEach((f, i) => {
        gsap.to(f, {
            x: 0, opacity: 1, duration: .6, delay: i * .1, ease: eOut,
            scrollTrigger: { trigger: '.vibe-feats', start: 'top 83%', toggleActions: 'play none none reverse' }
        });
    });

    /* ── Code panel ── */
    gsap.to('.vibe-right', {
        x: 0, opacity: 1, duration: .9, ease: eOut,
        scrollTrigger: { trigger: '.vibe-right', start: 'top 83%', toggleActions: 'play none none reverse' }
    });

    /* ── Stack blobs ── */
    document.querySelectorAll('.stack-blob').forEach((b, i) => {
        gsap.to(b, {
            scale: 1, y: 0, opacity: 1,
            duration: .65,
            delay: i * .06,
            ease: eOut,
            scrollTrigger: { trigger: '.stack-grid', start: 'top 84%', toggleActions: 'play none none reverse' }
        });
    });

    /* ── Stats ── */
    gsap.to('.stats-inner', {
        y: 0, opacity: 1, duration: .8, ease: eOut,
        scrollTrigger: {
            trigger: '.stats-inner',
            start: 'top 83%',
            toggleActions: 'play none none reverse',
            onEnter: initCounters
        }
    });

    /* ── Connect ── */
    document.querySelectorAll('.ct-line').forEach((line, i) => {
        gsap.to(line, {
            y: 0, opacity: 1, duration: .85, delay: i * .12, ease: eOut,
            scrollTrigger: { trigger: '.connect-title', start: 'top 82%', toggleActions: 'play none none reverse' }
        });
    });

    gsap.to('.connect-sub', {
        y: 0, opacity: 1, duration: .6, ease: eSoft,
        scrollTrigger: { trigger: '.connect-sub', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    gsap.to('.connect-cards', {
        y: 0, opacity: 1, duration: .7, ease: eOut,
        scrollTrigger: { trigger: '.connect-cards', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    gsap.to('.bca-link', {
        x: 0, opacity: 1, duration: .9, ease: eOut,
        scrollTrigger: { trigger: '.big-cta', start: 'top 87%', toggleActions: 'play none none reverse' }
    });

    /* ── Footer ghost parallax ── */
    gsap.to('.footer-ghost', {
        y: '10%',
        ease: 'none',
        scrollTrigger: {
            trigger: 'footer',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1.5
        }
    });
}

/* ── COUNTERS ───────────────────────────────────────────────── */
let countersRan = false;
function initCounters() {
    if (countersRan) return;
    countersRan = true;

    /* Inline float counter */
    const floatVal = document.querySelector('.cnt-val');
    if (floatVal) {
        const target = parseInt(floatVal.getAttribute('data-target') || '200', 10);
        animateCounter(floatVal, target, 1.4);
    }

    /* Stat counters */
    document.querySelectorAll('.stat-num[data-target]').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        animateCounter(el, target, 1.8, target >= 10 ? 'k+' : '+');
    });
}

function animateCounter(el, target, dur, suffix = '') {
    const start = performance.now();
    function tick(now) {
        const p = Math.min((now - start) / 1000 / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
}

/* ── TYPING CODE ANIMATION ──────────────────────────────────── */
function initTypingCode() {
    const el = document.getElementById('typing-code');
    if (!el) return;

    const code = [
        '// vibe.ai — describe your vision',
        'const app = await ai.vibe(`',
        '  Build a smart todo app with:',
        '  - AI task suggestions',
        '  - Voice input support',
        '  - Real-time collaboration',
        '  - Beautiful dark UI',
        '`)',
        '',
        '// ✓ Components generated: 12',
        '// ✓ Lines of code: 847',
        '// ✓ Tests written: 24',
        '// 🚀 Deploy: ready'
    ].join('\n');

    /* Color syntax keywords */
    function highlight(text) {
        return text
            .replace(/(\/\/.*)/g, '<span style="color:#4f9eff;opacity:.6">$1</span>')
            .replace(/\b(const|await|let|return)\b/g, '<span style="color:#9b6bff">$1</span>')
            .replace(/\b(vibe|ai|app)\b/g, '<span style="color:#00e5a0">$1</span>')
            .replace(/(`[^`]*`)/g, '<span style="color:#ff8a4c">$1</span>');
    }

    let i = 0;
    let typed = '';
    let started = false;

    function startTyping() {
        if (started) return;
        started = true;

        function typeChar() {
            if (i >= code.length) return;
            typed += code[i];
            i++;
            el.innerHTML = highlight(typed);
            /* Scroll code body to bottom */
            const body = el.closest('.code-body');
            if (body) body.scrollTop = body.scrollHeight;

            const next = code[i] === '\n' ? 40 : Math.random() * 35 + 20;
            setTimeout(typeChar, next);
        }
        typeChar();
    }

    /* Start typing when section is visible */
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: '#vibe',
            start: 'top 70%',
            once: true,
            onEnter: startTyping
        });
    } else {
        setTimeout(startTyping, 1800);
    }
}

/* ── STAGGER HOVER ON BENTO CHIPS ──────────────────────────── */
(function initChipHover() {
    document.querySelectorAll('.bento-card').forEach(card => {
        const chips = card.querySelectorAll('.chip');
        card.addEventListener('mouseenter', () => {
            if (typeof gsap === 'undefined') return;
            gsap.to(chips, {
                y: -3, stagger: .04, duration: .25, ease: 'power2.out'
            });
        });
        card.addEventListener('mouseleave', () => {
            if (typeof gsap === 'undefined') return;
            gsap.to(chips, {
                y: 0, stagger: .03, duration: .35, ease: 'power3.out'
            });
        });
    });
})();

/* ── MARQUEE PAUSE ON HOVER ─────────────────────────────────── */
(function initMarqueePause() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
    track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
})();

/* ── STACK BLOB INTERACTIVE GLOW ───────────────────────────── */
(function initBlobGlow() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.stack-blob').forEach(blob => {
        blob.addEventListener('mouseenter', () => {
            gsap.to(blob, {
                scale: 1.05,
                duration: .35,
                ease: 'power2.out'
            });
        });
        blob.addEventListener('mouseleave', () => {
            gsap.to(blob, {
                scale: 1,
                duration: .5,
                ease: 'power3.out'
            });
        });
    });
})();

/* ── REDUCED MOTION ─────────────────────────────────────────── */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = `
        *, *::before, *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
        }
    `;
    document.head.appendChild(style);
}
