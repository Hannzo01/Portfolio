/* =============================================
   PARTICLE BACKGROUND
   Pixels drift across the screen, occasionally
   connecting with faint lines — like packets
   routing across a network topology.
   Colors: coral palette on dark.
   ============================================= */

(function() {
    const canvas = document.getElementById('bg-canvas');
    const ctx    = canvas.getContext('2d');

    const COLORS = [
        'rgba(240,128,128,',   // --light-coral
        'rgba(244,151,142,',   // --sweet-salmon
        'rgba(248,173,157,',   // --powder-blush
        'rgba(251,196,171,',   // --peach-fuzz
        'rgba(255,218,185,',   // --soft-apricot
    ];

    const PARTICLE_COUNT = 90;
    const CONNECT_DIST   = 130;  // px — max distance to draw a line
    const SPEED          = 0.35;

    let W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() { this.reset(true); }

        reset(initial = false) {
            this.x  = Math.random() * W;
            this.y  = initial ? Math.random() * H : (Math.random() < 0.5 ? -4 : H + 4);
            this.vx = (Math.random() - 0.5) * SPEED;
            this.vy = (Math.random() - 0.5) * SPEED;
            // Ensure every particle moves
            if (Math.abs(this.vx) < 0.08) this.vx = 0.08 * Math.sign(this.vx || 1);
            if (Math.abs(this.vy) < 0.08) this.vy = 0.08 * Math.sign(this.vy || 1);

            this.r     = Math.random() * 1.8 + 0.6;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.alpha = Math.random() * 0.5 + 0.25;
            // Each particle has a tiny chance to be a "bright" node
            this.bright = Math.random() < 0.08;
            if (this.bright) { this.r = 2.8; this.alpha = 0.85; }
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            // Soft-bounce off edges instead of resetting — keeps them alive
            if (this.x < 0 || this.x > W) this.vx *= -1;
            if (this.y < 0 || this.y > H) this.vy *= -1;
            this.x = Math.max(0, Math.min(W, this.x));
            this.y = Math.max(0, Math.min(H, this.y));
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();

            // Bright nodes get a soft glow ring
            if (this.bright) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r + 3, 0, Math.PI * 2);
                ctx.strokeStyle = this.color + '0.15)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    function init() {
        resize();
        particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECT_DIST) {
                    const t = 1 - dist / CONNECT_DIST;         // 0 → 1 as closer
                    const lineAlpha = t * t * 0.35;             // quadratic falloff

                    // Pick the midpoint color between the two particles
                    const col = a.color;

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = col + lineAlpha + ')';
                    ctx.lineWidth   = t * 1.2;
                    ctx.stroke();

                    // If both are close enough, draw a tiny midpoint pulse dot
                    if (dist < CONNECT_DIST * 0.35) {
                        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
                        ctx.beginPath();
                        ctx.arc(mx, my, 1, 0, Math.PI * 2);
                        ctx.fillStyle = col + (lineAlpha * 1.8) + ')';
                        ctx.fill();
                    }
                }
            }
        }
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        drawConnections();
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => { resize(); });
    // On mouse move, gently nudge nearby particles
    window.addEventListener('mousemove', (e) => {
        particles.forEach(p => {
            const dx = p.x - e.clientX, dy = p.y - e.clientY;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d < 100) {
                p.vx += (dx / d) * 0.12;
                p.vy += (dy / d) * 0.12;
                // Clamp speed
                const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (spd > 1.4) { p.vx = (p.vx / spd) * 1.4; p.vy = (p.vy / spd) * 1.4; }
            }
        });
    });

    init();
    loop();
})();


/* =============================================
   SCROLL FADE-IN
   ============================================= */
const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
sections.forEach(s => observer.observe(s));


/* =============================================
   ACTIVE NAV HIGHLIGHT
   ============================================= */
const navLinks   = document.querySelectorAll('.nav-links a');
const allSections = document.querySelectorAll('section[id]');
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--accent)' : '';
            });
        }
    });
}, { threshold: 0.4 });
allSections.forEach(s => navObserver.observe(s));


/* =============================================
   TERMINAL TYPING EFFECT
   ============================================= */
const termLines = document.querySelectorAll('.term-line.t-out');
termLines.forEach((line, i) => {
    line.style.opacity = '0';
    setTimeout(() => {
        line.style.transition = 'opacity 0.3s ease';
        line.style.opacity = '1';
    }, 1200 + i * 350);
});

/* =============================================
   PROJECT HOVER REVEAL (MOUSE TRACKING)
   ============================================= */
const previewEl = document.getElementById('project-preview');
const projectRows = document.querySelectorAll('.project-row');

projectRows.forEach(row => {
    // When mouse enters the row, show the image
    row.addEventListener('mouseenter', () => {
        const imgSrc = row.getAttribute('data-image');
        if (imgSrc) {
            previewEl.style.backgroundImage = `url(${imgSrc})`;
            previewEl.classList.add('active');
        }
    });

    // Make the image follow the mouse coordinates
    row.addEventListener('mousemove', (e) => {
        previewEl.style.left = e.clientX + 'px';
        previewEl.style.top = e.clientY + 'px';
    });

    // Hide the image when the mouse leaves
    row.addEventListener('mouseleave', () => {
        previewEl.classList.remove('active');
    });
});