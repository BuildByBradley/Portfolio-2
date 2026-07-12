/* =====================================================================
   next-project.js  –  Sohub-style "scroll to next project" transition
   =====================================================================
   Appends a full-viewport section at the bottom of every project page.
   As the user scrolls through it the next project's hero scales up, a
   counter ticks 0 → 100, and at ~98 % the browser navigates forward.
   ===================================================================== */

(() => {
  'use strict';

  /* ── Master project array (must match homepage horizontal-scroll order) ── */
  const PROJECTS = [
    { slug: 'site-intelligence',       title: 'Niewoudsville',            category: 'Architecture / Design',  heroImage: '../../assets/projects/site-intelligence/hero-poster.jpg' },
    { slug: 'belhar-regional-hospital', title: 'Belhar Regional Hospital', category: 'BIM Coordination',       heroImage: '../../assets/projects/belhar-regional-hospital/belhar-hero-960.webp' },
    { slug: 'berkshire',               title: 'Berkshire Boulevard',      category: 'Architecture / Design',  heroImage: '../../assets/projects/berkshire/1_2 - Photo.webp' },
    { slug: 'die-laan',                title: 'Die Laan',                 category: 'Architecture / Design',  heroImage: '../../assets/projects/die-laan/img-0.webp' },
    { slug: 'granger-bay',             title: 'Granger Bay',              category: 'Architecture / Design',  heroImage: '../../assets/projects/granger-bay/img-0.webp' },
    { slug: 'harris-office',           title: 'Harris Office',            category: 'Architecture / Design',  heroImage: '../../assets/projects/harris-office/img-0.webp' },
    { slug: 'house-pather',            title: 'House Pather',             category: 'Architecture / Design',  heroImage: '../../assets/projects/house-pather/img-0.webp' },
    { slug: 'newlands-cricket',        title: 'Newlands Cricket',         category: 'Architecture / Design',  heroImage: '../../assets/projects/newlands-cricket/img-0.webp' },
    { slug: 'rondebosch-golf',         title: 'Rondebosch Golf',          category: 'Architecture / Design',  heroImage: '../../assets/projects/rondebosch-golf/img-0.webp' },
    { slug: 'stud-hq',                 title: 'Stud HQ',                  category: 'Architecture / Design',  heroImage: '../../assets/projects/stud-hq/stud-bloemfontein-1.webp' },
    { slug: 'lentegeur-hospital',      title: 'Lentegeur Hospital',       category: 'Health Care',            heroImage: '../../projects/lentegeur-hospital/media/site-plan-cover.webp' }
  ];

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  /**
   * Extract the project folder slug from the current URL.
   * Works for patterns like:
   *   /projects/berkshire/index.html  →  "berkshire"
   *   /projects/berkshire/            →  "berkshire"
   *   /portfolio #2/projects/berkshire/index.html  →  "berkshire"
   */
  function detectSlug() {
    const parts = window.location.pathname
      .replace(/\/index\.html$/i, '')   // strip trailing index.html
      .replace(/\/+$/, '')              // strip trailing slash
      .split('/');
    return decodeURIComponent(parts[parts.length - 1]).toLowerCase();
  }

  /**
   * Dynamically load a script and return a Promise that resolves on load.
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }

  /* ── Ensure GSAP + ScrollTrigger are available ──────────────────────── */

  async function ensureGSAP() {
    // If GSAP is already on the page, just make sure ScrollTrigger is registered
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      return;
    }

    // Dynamically load from CDN (needed for pages that don't bundle GSAP)
    if (!window.gsap) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');
    }
    if (!window.ScrollTrigger) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
    }
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ── Build the transition section DOM ───────────────────────────────── */

  function buildSection(nextProject) {
    let section = document.getElementById('next-project-transition');
    if (!section) {
      section = document.createElement('section');
      section.id = 'next-project-transition';
      document.body.appendChild(section);
    }
    
    // Ensure it has the correct class and attributes regardless of how it was created
    section.className = 'next-project-transition';
    section.setAttribute('aria-label', `Next project: ${nextProject.title}`);

    section.innerHTML = `
      <div class="npt-sticky-container">
        <div class="npt-bg">
          <img src="${nextProject.heroImage}"
               alt="${nextProject.title}"
               class="npt-hero-img"
               loading="lazy" />
          <div class="npt-overlay"></div>
        </div>
        <div class="npt-content">
          <span class="npt-label">Next Project</span>
          <h2 class="npt-title">${nextProject.title}</h2>
          <span class="npt-category">${nextProject.category}</span>
          <div class="npt-counter" id="npt-scroll-counter" aria-live="polite" aria-label="Scroll progress">000%</div>
        </div>
        <div class="npt-progress-bar"><div class="npt-progress-fill"></div></div>
      </div>
    `;

    return section;
  }

  /* ── Wire up ScrollTrigger animation ────────────────────────────────── */

  function initScrollTrigger(nextProject) {
    const section    = document.getElementById('next-project-transition');
    const heroImg    = section.querySelector('.npt-hero-img');
    const counter    = section.querySelector('.npt-counter');
    const fill       = section.querySelector('.npt-progress-fill');
    const titleEl    = section.querySelector('.npt-title');
    const labelEl    = section.querySelector('.npt-label');
    const categoryEl = section.querySelector('.npt-category');
    let hasNavigated = false;
    let isAutoPlaying = false;

    // Timeline for the spatial transition
    const tl = gsap.timeline({ paused: true });
    
    tl.to(titleEl, {
      x: () => {
        const isMobile = window.innerWidth <= 768;
        const targetLeft = isMobile ? 24 : 48;
        return targetLeft + (titleEl.offsetWidth * 0.6 / 2) - (window.innerWidth / 2);
      },
      y: () => {
        const isMobile = window.innerWidth <= 768;
        const targetBottom = isMobile ? 48 : 64;
        return (window.innerHeight - targetBottom) - (titleEl.offsetHeight * 0.6 / 2) - (window.innerHeight / 2);
      },
      scale: 0.6,
      ease: "power2.inOut",
      duration: 0.7
    }, 0.3); // Wait until 30% scroll progress before moving

    // Fade out labels immediately (from 0% to 30%)
    tl.to([labelEl, categoryEl], {
      opacity: 0,
      y: -20,
      ease: "power2.out",
      duration: 0.3
    }, 0);

    ScrollTrigger.create({
      trigger: '#next-project-transition',
      start:   'top bottom',
      end:     'bottom bottom',
      scrub:   1,
      onRefresh: () => tl.invalidate(), // Recalculate x/y targets on resize

      onUpdate(self) {
        if (isAutoPlaying) return;

        const progress = self.progress; // 0 → 1
        const pct      = Math.round(progress * 100);

        tl.progress(progress);

        if (counter) {
          counter.textContent = String(pct).padStart(3, '0') + '%';
          if (progress > 0.005) {
            counter.style.opacity = '1';
          }
        }

        const scale = 1 + progress * 0.15;
        heroImg.style.transform = `scale(${scale})`;

        if (fill) fill.style.width = (progress * 100) + '%';

        if (progress >= 0.98 && !hasNavigated) {
          hasNavigated = true;
          setTimeout(() => {
            window.location.href = `../${nextProject.slug}/index.html`;
          }, 420);
        }
      },
    });

    // Click-to-Autoplay Logic
    titleEl.addEventListener('click', () => {
      if (isAutoPlaying || hasNavigated) return;
      isAutoPlaying = true;
      hasNavigated = true;

      // Animate timeline, hero image, and progress bar to completion smoothly
      gsap.to(tl, { progress: 1, duration: 1.2, ease: "power3.inOut" });
      gsap.to(heroImg, { scale: 1.15, duration: 1.2, ease: "power3.inOut" });
      if (fill) gsap.to(fill, { width: '100%', duration: 1.2, ease: "power3.inOut" });

      // Spin counter to 100%
      if (counter) {
        counter.style.opacity = '1';
        let dummy = { val: parseInt(counter.textContent) || 0 };
        gsap.to(dummy, {
          val: 100,
          duration: 1.2,
          ease: "power3.inOut",
          onUpdate: () => {
            counter.textContent = String(Math.round(dummy.val)).padStart(3, '0') + '%';
          }
        });
      }

      setTimeout(() => {
        window.location.href = `../${nextProject.slug}/index.html`;
      }, 1200);
    });
  }

  /* ── Custom Cursor Injection ─────────────────────────────────────────── */
  function initCustomCursor() {
    let cursorDot = document.querySelector(".cursor-dot");
    let cursorOutline = document.querySelector(".cursor-outline");
    
    // Inject custom cursor HTML if not present
    if (!cursorDot) {
      cursorDot = document.createElement("div");
      cursorDot.className = "cursor-dot";
      document.body.appendChild(cursorDot);
    }
    if (!cursorOutline) {
      cursorOutline = document.createElement("div");
      cursorOutline.className = "cursor-outline";
      document.body.appendChild(cursorOutline);
    }
    
    document.body.classList.add('custom-cursor-active');

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.top = `${mouseY}px`;
      cursorDot.style.left = `${mouseX}px`;
    });

    function animateOutline() {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;
      cursorOutline.style.top = `${outlineY}px`;
      cursorOutline.style.left = `${outlineX}px`;
      requestAnimationFrame(animateOutline);
    }
    animateOutline();

    const interactables = document.querySelectorAll("a, button, .project-card, .gallery-scroll-track, .next-project-transition");
    interactables.forEach(el => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });
  }

  /* ── Main initialisation ────────────────────────────────────────────── */

  async function init() {
    initCustomCursor();

    const currentSlug  = detectSlug();
    const currentIndex = PROJECTS.findIndex(p => p.slug === currentSlug);

    if (currentIndex === -1) {
      console.warn(`[next-project] Slug "${currentSlug}" not found in PROJECTS array – transition disabled.`);
      return;
    }

    const nextIndex   = (currentIndex + 1) % PROJECTS.length;
    const nextProject = PROJECTS[nextIndex];

    // Synchronise top-right navbar navigation button
    const nextProjectBtn = document.getElementById('next-project-btn') || Array.from(document.querySelectorAll('a')).find(el => el.textContent.includes('NEXT CASE STUDY'));
    if (nextProjectBtn) {
      nextProjectBtn.setAttribute('href', `../${nextProject.slug}/index.html`);
    }

    // Make sure GSAP is available (loads from CDN if necessary)
    await ensureGSAP();

    // Build DOM
    buildSection(nextProject);

    // Initialise scroll-scrub animation
    initScrollTrigger(nextProject);
  }

  /* ── Kick off on DOMContentLoaded ───────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already parsed (script loaded with defer / at bottom)
    init();
  }
})();
