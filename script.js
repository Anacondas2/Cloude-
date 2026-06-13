/* ═══════════════════════════════════════════════════════════
   PANORAMA RESTAURANT — SCRIPT.JS
   Hypertypography × Emil Kowalski Animation System
   Hamburg Bergedorf · Seit 1982
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── INIT ─────────────────────────────────────────────────── */
window.addEventListener('load', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        document.body.classList.add('no-gsap');
        hidePreloaderFallback();
        return;
    }
    gsap.registerPlugin(ScrollTrigger);
    initAll();
});

function initAll() {
    initCursor();
    initPreloader();   // calls initHero & initScrollAnimations after
    initNav();
    initMobileMenu();
    initSmoothAnchor();
}

/* ── CURSOR ────────────────────────────────────────────────── */
function initCursor() {
    const dot  = document.querySelector('.cursor');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        gsap.to(dot,  { x: e.clientX, y: e.clientY, duration: .08, ease: 'none' });
        rx += (e.clientX - rx) * .12;
        ry += (e.clientY - ry) * .12;
        gsap.set(ring, { x: rx, y: ry });
    });

    // Smooth ring follows cursor
    (function rafLoop() {
        rx += (parseFloat(gsap.getProperty(dot, 'x')) - rx) * .1;
        ry += (parseFloat(gsap.getProperty(dot, 'y')) - ry) * .1;
        gsap.set(ring, { x: rx, y: ry });
        requestAnimationFrame(rafLoop);
    })();

    const interactables = 'a, button, .dish, .atm-feat, .event-tag, .stat, .nav-logo';
    document.querySelectorAll(interactables).forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.classList.add('hovering');
            ring.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            dot.classList.remove('hovering');
            ring.classList.remove('hovering');
        });
    });
}

/* ── PRELOADER ─────────────────────────────────────────────── */
function initPreloader() {
    const loader  = document.getElementById('preloader');
    const letters = document.querySelectorAll('.pl');
    const sub     = document.querySelector('.preloader-sub');

    const tl = gsap.timeline({
        onComplete: () => {
            loader.style.display = 'none';
            initHero();
            initScrollAnimations();
        }
    });

    tl
        .to(letters, {
            y: 0, opacity: 1,
            duration: .65,
            stagger: { each: .055, ease: 'power2.out' },
            ease: 'power3.out',
            delay: .15
        })
        .to(sub, { opacity: 1, y: 0, duration: .4, ease: 'power2.out' }, '-=.2')
        .to(letters, {
            y: '-90%', opacity: 0,
            duration: .45,
            stagger: { each: .035, ease: 'power2.in' },
            ease: 'power2.in',
            delay: .55
        })
        .to(sub, { opacity: 0, y: -12, duration: .3, ease: 'power2.in' }, '<.05')
        .to(loader, { opacity: 0, duration: .4, ease: 'power2.out' }, '-=.1');
}

function hidePreloaderFallback() {
    const loader = document.getElementById('preloader');
    if (!loader) return;
    loader.style.transition = 'opacity .5s ease';
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 550);
}

/* ── HERO ENTRANCE ─────────────────────────────────────────── */
function initHero() {
    const tl = gsap.timeline({ delay: .05 });

    // Letters stagger in
    tl.to('.hl', {
        y: 0, opacity: 1,
        duration: .8,
        stagger: .045,
        ease: 'power3.out'
    })
    .to('.hero-eyebrow', {
        opacity: 1, y: 0,
        duration: .55,
        ease: 'power2.out'
    }, '-=.55')
    .to('.hero-meta', {
        opacity: 1, y: 0,
        duration: .55,
        ease: 'power2.out'
    }, '-=.45')
    .to('.hero-scroll', {
        opacity: 1,
        duration: .5,
        ease: 'power2.out'
    }, '-=.3');

    // Greek background text — mouse parallax
    const bgGreek = document.querySelector('.hero-bg-greek');
    if (bgGreek) {
        document.addEventListener('mousemove', e => {
            const xp = (e.clientX / window.innerWidth  - .5) * 2;
            const yp = (e.clientY / window.innerHeight - .5) * 2;
            gsap.to(bgGreek, {
                x: xp * 35,
                y: yp * 18,
                duration: 1.4,
                ease: 'power2.out'
            });
        });
    }

    // Hero title parallax on scroll
    gsap.to('.hero-title', {
        y: '22%',
        opacity: .2,
        ease: 'none',
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2
        }
    });

    // bg greek parallax on scroll
    if (bgGreek) {
        gsap.to(bgGreek, {
            y: '-25%',
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.8
            }
        });
    }
}

/* ── NAVIGATION ────────────────────────────────────────────── */
function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    ScrollTrigger.create({
        start: 'top -60px',
        onUpdate: self => nav.classList.toggle('scrolled', self.scroll() > 60)
    });
}

/* ── MOBILE MENU ───────────────────────────────────────────── */
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

    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            if (open) toggle();
        });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && open) toggle();
    });
}

/* ── SMOOTH ANCHOR SCROLL ──────────────────────────────────── */
function initSmoothAnchor() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - navH,
                behavior: 'smooth'
            });
        });
    });
}

/* ── SCROLL ANIMATIONS ─────────────────────────────────────── */
function initScrollAnimations() {
    const eExpo = 'power3.out';
    const eSoft = 'power2.out';

    /* Helper: animate in on scroll */
    function reveal(targets, vars, triggerEl, start = 'top 83%') {
        if (!document.querySelector(targets instanceof NodeList ? targets[0] : targets)) return;
        gsap.to(targets, {
            opacity: 1,
            x: 0, y: 0, scale: 1,
            duration: vars.duration ?? .75,
            stagger: vars.stagger ?? 0,
            ease: vars.ease ?? eExpo,
            scrollTrigger: {
                trigger: triggerEl ?? (typeof targets === 'string' ? targets : null),
                start,
                toggleActions: 'play none none reverse'
            }
        });
    }

    /* ── ABOUT ── */
    // bg year parallax
    gsap.to('.bg-number', {
        y: '-20%',
        ease: 'none',
        scrollTrigger: {
            trigger: '#about',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2
        }
    });

    // title lines
    document.querySelectorAll('.about-line').forEach((line, i) => {
        gsap.to(line, {
            y: 0, opacity: 1,
            duration: .7,
            ease: eExpo,
            delay: i * .08,
            scrollTrigger: { trigger: '.about-title', start: 'top 82%', toggleActions: 'play none none reverse' }
        });
    });

    // text & quote
    gsap.to('.about-text p', {
        y: 0, opacity: 1, duration: .65, stagger: .12, ease: eSoft,
        scrollTrigger: { trigger: '.about-text', start: 'top 83%', toggleActions: 'play none none reverse' }
    });
    gsap.to('.text-link', {
        opacity: 1, y: 0, duration: .5, ease: eSoft,
        scrollTrigger: { trigger: '.text-link', start: 'top 90%', toggleActions: 'play none none reverse' }
    });
    gsap.to('.about-quote-block blockquote', {
        x: 0, opacity: 1, duration: .8, ease: eExpo,
        scrollTrigger: { trigger: '.about-quote-block', start: 'top 83%', toggleActions: 'play none none reverse' }
    });

    // stats
    document.querySelectorAll('.stat').forEach((s, i) => {
        gsap.to(s, {
            y: 0, opacity: 1,
            duration: .6, delay: i * .1, ease: eExpo,
            scrollTrigger: { trigger: '.about-stats', start: 'top 83%', toggleActions: 'play none none reverse' }
        });
    });

    /* ── PHILOSOPHY ── */
    document.querySelectorAll('.bq-line').forEach((line, i) => {
        gsap.to(line, {
            x: 0, opacity: 1, duration: .8, delay: i * .09, ease: eExpo,
            scrollTrigger: { trigger: '.big-quote', start: 'top 82%', toggleActions: 'play none none reverse' }
        });
    });

    /* ── MENU ── */
    gsap.to('.mdt-1', {
        x: 0, opacity: 1, duration: 1, ease: eExpo,
        scrollTrigger: { trigger: '.menu-display-title', start: 'top 80%', toggleActions: 'play none none reverse' }
    });
    gsap.to('.mdt-2', {
        x: 0, opacity: 1, duration: 1, ease: eExpo, delay: .1,
        scrollTrigger: { trigger: '.menu-display-title', start: 'top 80%', toggleActions: 'play none none reverse' }
    });

    document.querySelectorAll('.menu-cat').forEach((cat, i) => {
        gsap.to(cat, {
            y: 0, opacity: 1, duration: .7, delay: (i % 2) * .12, ease: eExpo,
            scrollTrigger: { trigger: cat, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
    });

    /* ── ATMOSPHERE ── */
    gsap.to('.atm-giant', {
        x: 0, opacity: 1, duration: 1, ease: eExpo,
        scrollTrigger: { trigger: '.atm-layout', start: 'top 82%', toggleActions: 'play none none reverse' }
    });
    gsap.to('.atm-title', {
        y: 0, opacity: 1, duration: .75, ease: eExpo,
        scrollTrigger: { trigger: '.atm-content', start: 'top 83%', toggleActions: 'play none none reverse' }
    });
    gsap.to('.atm-text', {
        y: 0, opacity: 1, duration: .7, ease: eSoft, delay: .1,
        scrollTrigger: { trigger: '.atm-content', start: 'top 83%', toggleActions: 'play none none reverse' }
    });
    document.querySelectorAll('.atm-feat').forEach((f, i) => {
        gsap.to(f, {
            y: 0, opacity: 1, duration: .5, delay: i * .08, ease: eSoft,
            scrollTrigger: { trigger: '.atm-features', start: 'top 86%', toggleActions: 'play none none reverse' }
        });
    });

    /* ── EVENTS ── */
    document.querySelectorAll('.et-line').forEach((line, i) => {
        gsap.to(line, {
            y: 0, opacity: 1, duration: .85, delay: i * .1, ease: eExpo,
            scrollTrigger: { trigger: '.events-title', start: 'top 82%', toggleActions: 'play none none reverse' }
        });
    });
    gsap.from('.events-right p', {
        y: 30, opacity: 0, duration: .65, ease: eSoft,
        scrollTrigger: { trigger: '.events-right', start: 'top 83%', toggleActions: 'play none none reverse' }
    });
    gsap.from('.events-types', {
        y: 20, opacity: 0, duration: .5, ease: eSoft, delay: .15,
        scrollTrigger: { trigger: '.events-types', start: 'top 86%', toggleActions: 'play none none reverse' }
    });

    /* ── CONTACT ── */
    document.querySelectorAll('.contact-title > span').forEach((s, i) => {
        gsap.to(s, {
            y: 0, opacity: 1, duration: .8, delay: i * .1, ease: eExpo,
            scrollTrigger: { trigger: '.contact-title', start: 'top 82%', toggleActions: 'play none none reverse' }
        });
    });
    document.querySelectorAll('.c-block').forEach((b, i) => {
        gsap.to(b, {
            y: 0, opacity: 1, duration: .65, delay: i * .1, ease: eExpo,
            scrollTrigger: { trigger: '.contact-info-col', start: 'top 83%', toggleActions: 'play none none reverse' }
        });
    });
    gsap.to('.contact-map-col', {
        scale: 1, opacity: 1, duration: .75, ease: eExpo,
        scrollTrigger: { trigger: '.contact-map-col', start: 'top 83%', toggleActions: 'play none none reverse' }
    });
    gsap.to('.big-cta-link', {
        x: 0, opacity: 1, duration: .85, ease: eExpo,
        scrollTrigger: { trigger: '.big-cta', start: 'top 86%', toggleActions: 'play none none reverse' }
    });

    /* ── FOOTER ── */
    gsap.to('.footer-bg-word', {
        y: '8%',
        ease: 'none',
        scrollTrigger: {
            trigger: 'footer',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1.5
        }
    });

    /* ── GENERIC SECTION TAGS ── */
    document.querySelectorAll('.section-tag').forEach(tag => {
        gsap.from(tag, {
            x: -20, opacity: 0, duration: .5, ease: eSoft,
            scrollTrigger: { trigger: tag, start: 'top 90%', toggleActions: 'play none none reverse' }
        });
    });

    /* ── COUNTER ANIMATION ── */
    initCounters();
}

/* ── COUNTERS ──────────────────────────────────────────────── */
function initCounters() {
    document.querySelectorAll('.stat-n').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        // For the "1" stat that means "Einzigartiger Blick" — show infinity symbol
        if (target === 1) {
            gsap.to(el, {
                textContent: '∞',
                scrollTrigger: { trigger: el, start: 'top 82%', once: true },
                onStart() { el.textContent = '∞'; el.style.opacity = '1'; }
            });
            return;
        }

        ScrollTrigger.create({
            trigger: el,
            start: 'top 82%',
            once: true,
            onEnter() {
                let startVal = 0;
                const dur = 1.6;
                const startTime = performance.now();

                function tick(now) {
                    const elapsed = (now - startTime) / 1000;
                    const progress = Math.min(elapsed / dur, 1);
                    // Ease out quart
                    const eased = 1 - Math.pow(1 - progress, 4);
                    el.textContent = Math.round(eased * target);
                    if (progress < 1) requestAnimationFrame(tick);
                    else el.textContent = target + (target < 5 ? '' : '+');
                }
                requestAnimationFrame(tick);
            }
        });
    });
}

/* ── TEXT HOVER SPLIT EFFECT (menu categories) ─────────────── */
(function initCatHover() {
    document.querySelectorAll('.cat-name').forEach(el => {
        const text = el.textContent;
        el.innerHTML = text.split('').map(c =>
            `<span style="display:inline-block;transition:transform .25s var(--ease-expo,.3s),color .2s ease">${c === ' ' ? '&nbsp;' : c}</span>`
        ).join('');

        el.addEventListener('mouseenter', () => {
            el.querySelectorAll('span').forEach((s, i) => {
                s.style.transitionDelay = `${i * 0.03}s`;
                s.style.transform = 'translateY(-4px)';
                s.style.color = 'var(--gold)';
            });
        });
        el.addEventListener('mouseleave', () => {
            el.querySelectorAll('span').forEach((s, i) => {
                s.style.transitionDelay = `${i * 0.02}s`;
                s.style.transform = 'translateY(0)';
                s.style.color = '';
            });
        });
    });
})();

/* ── SECTION LABEL MOUSE TRACK ─────────────────────────────── */
(function initMagneticCTA() {
    document.querySelectorAll('.nav-cta, .btn-fill, .btn-line').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const dx = (e.clientX - rect.left) / rect.width  - .5;
            const dy = (e.clientY - rect.top)  / rect.height - .5;
            gsap.to(btn, {
                x: dx * 8, y: dy * 5,
                duration: .25, ease: 'power2.out'
            });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: .45, ease: 'power3.out' });
        });
    });
})();

/* ── MARQUEE PAUSE ON HOVER ─────────────────────────────────── */
(function initMarqueePause() {
    document.querySelectorAll('.marquee-inner, .em-track').forEach(track => {
        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    });
})();

/* ── HERO YEAR GLITCH ───────────────────────────────────────── */
(function initYearGlitch() {
    const year = document.querySelector('.hero-year');
    if (!year) return;

    const chars = ['1', '9', '8', '2'];
    const glitchChars = ['9', '0', '1', '5', '∞', '?', '!'];

    function glitch() {
        if (!year) return;
        const orig = year.textContent;
        let count = 0;
        const interval = setInterval(() => {
            year.textContent = chars.map(c =>
                Math.random() > .6 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : c
            ).join('');
            count++;
            if (count > 8) {
                clearInterval(interval);
                year.textContent = '1982';
            }
        }, 60);
    }

    year.addEventListener('mouseenter', glitch);
    // Random auto-glitch occasionally
    setInterval(() => { if (Math.random() > .85) glitch(); }, 6000);
})();

/* ── LOGO LETTER ANIMATION ─────────────────────────────────── */
(function initLogoHover() {
    const logo = document.querySelector('.nav-logo');
    if (!logo || typeof gsap === 'undefined') return;

    logo.addEventListener('mouseenter', () => {
        gsap.fromTo(logo,
            { letterSpacing: '.12em' },
            { letterSpacing: '.25em', duration: .4, ease: 'power2.out', yoyo: true, repeat: 1 }
        );
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
