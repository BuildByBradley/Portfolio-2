const VIDEO_DURATION_FALLBACK = 67.00;

// Preloaded assets variables
let videoBlobUrl = null;
const globalImages = [];

const pipelineData = [
  { start: 6,  end: 14, audience: "FOR ARCHITECTS",                    headline: "Technical resolution at scale",               supporting: "8 years across healthcare, commercial and residential — from concept through to construction.",                  proof: ["Terrain Logic","Access","Levels","Massing Context"] },
  { start: 14, end: 22, audience: "FOR DEVELOPERS",                    headline: "BIM coordination, not just drawings",          supporting: "Revit-native workflows, clash detection, and federated model management on projects up to R2.4bn.",               proof: ["Yield Logic","Phasing Plans","Site Potential"] },
  { start: 22, end: 35, audience: "FOR CLIENTS + DEVELOPERS",          headline: "Spatial intelligence built in",               supporting: "Site feasibility, zoning analysis, and yield modelling — from raw erf data to development decision.",              proof: ["Arrival Sequence","View Control","User Experience"] },
  { start: 35, end: 43, audience: "FOR CLIENTS",                       headline: "Renders that do the explaining for you",          supporting: "Photorealistic visualisation and walkthroughs that get sign-off faster by showing exactly what's being built.",   proof: ["Lumion","RealityScan","Client Presentations"] },
  { start: 43, end: 52, audience: "FOR DEVELOPERS + CLIENTS",          headline: "Numbers before commitment",                     supporting: "Site feasibility and yield analysis that tell you if a development works before you spend on it.",                   proof: ["Feasibility Modelling","Zoning Analysis","Risk Reduction"] },
  { start: 58, end: VIDEO_DURATION_FALLBACK, audience: "FOR ARCHITECTS + DEVELOPERS + CLIENTS", headline: "From concept sketch to construction set", supporting: "Drawings, coordination, and visualisation under one technologist — no handoff gaps between design intent and what gets built.", proof: ["Construction Documentation","Coordination","Full Lifecycle"] }
];

document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById('loading-screen');
  const counterEl     = document.getElementById('loading-counter');
  const progressEl    = document.getElementById('loading-progress');
  const textEl        = document.getElementById('loading-text');

  const urlParams     = new URLSearchParams(window.location.search);
  const returnTarget  = urlParams.get('return');
  const hashTarget    = window.location.hash;
  const cameFromCaseStudy = /[\\/]projects[\\/]/i.test(document.referrer || '');

  const shouldReturnToJourney   = returnTarget === 'journey'   || sessionStorage.getItem('returnToJourney') === 'true';
  const shouldReturnToProcesses = returnTarget === 'projects' ||
    hashTarget === '#projects' || sessionStorage.getItem('returnToProjects') === 'true' ||
    localStorage.getItem('returnToProjects') === 'true' || cameFromCaseStudy;

  if (shouldReturnToJourney || shouldReturnToProcesses) {
    if (loadingScreen) { loadingScreen.style.opacity='0'; loadingScreen.style.pointerEvents='none'; loadingScreen.style.display='none'; }
    triggerHeroEntrance();
    setTimeout(() => {
      if (shouldReturnToProcesses) {
        const p = document.getElementById('projects');
        if (p) p.scrollIntoView({ behavior:'instant', block:'start' });
      } else {
        const savedY = sessionStorage.getItem('journeyScrollY');
        if (savedY) window.scrollTo({ top: Number(savedY), behavior:'instant' });
        else { const j = document.getElementById('hero'); if(j) j.scrollIntoView({behavior:'instant'}); }
      }
      sessionStorage.removeItem('returnToJourney');
      sessionStorage.removeItem('journeyScrollY');
      sessionStorage.removeItem('returnToProjects');
      localStorage.removeItem('returnToProjects');
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 250);
    return;
  }

  const loadingStrings = [
    "Site to certainty.",
    "Risk before renders.",
    "Coordination before confusion.",
    "Clarity before commitment.",
    "Context before cost.",
    "Decisions before delays."
  ];
  let stringIndex = 0;
  const stringInterval = setInterval(() => {
    stringIndex = (stringIndex + 1) % loadingStrings.length;
    if (textEl) {
      textEl.style.opacity = '0'; textEl.style.transform = 'translateY(-12px)';
      setTimeout(() => {
        textEl.innerText = loadingStrings[stringIndex];
        textEl.style.opacity = '1'; textEl.style.transform = 'translateY(0)';
        textEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      }, 300);
    }
  }, 950);

  // --- Real Performance Preloader ---
  let videoProgress = 0;
  let imagesProgress = 0;
  let videoLoaded = false;
  let imagesLoaded = false;

  // 1. Preload Hero Video (1.94 MB) via XHR
  const videoXHR = new XMLHttpRequest();
  videoXHR.open('GET', 'assets/projects/zimbali/zimbali-hero.mp4', true);
  videoXHR.responseType = 'blob';
  
  videoXHR.onprogress = (e) => {
    if (e.lengthComputable && e.total > 0) {
      videoProgress = e.loaded / e.total;
    }
  };
  
  videoXHR.onload = () => {
    if (videoXHR.status === 200) {
      videoBlobUrl = URL.createObjectURL(videoXHR.response);
      videoProgress = 1;
      videoLoaded = true;
    } else {
      console.warn("Video preloading failed with status:", videoXHR.status);
      videoLoaded = true;
      videoProgress = 1;
    }
  };
  
  videoXHR.onerror = () => {
    console.warn("Video preloading network error.");
    videoLoaded = true;
    videoProgress = 1;
  };
  
  videoXHR.send();

  // 2. Preload First 20 Sequence Frames
  const FIRST_FRAME_NUMBER = 86400;
  const getFramePath = (index) => {
    const realFrameNumber = FIRST_FRAME_NUMBER + index - 1;
    return `assets/hero-sequence/frame_${String(realFrameNumber).padStart(9, '0')}.webp`;
  };

  let loadedImagesCount = 0;
  const numPreloadImages = 20;

  for (let i = 1; i <= numPreloadImages; i++) {
    const img = new Image();
    img.onload = () => {
      loadedImagesCount++;
      imagesProgress = loadedImagesCount / numPreloadImages;
      if (loadedImagesCount === numPreloadImages) {
        imagesLoaded = true;
      }
    };
    img.onerror = () => {
      loadedImagesCount++;
      imagesProgress = loadedImagesCount / numPreloadImages;
      if (loadedImagesCount === numPreloadImages) {
        imagesLoaded = true;
      }
    };
    img.src = getFramePath(i);
    globalImages[i] = img;
  }

  const MIN_LOADING_TIME = 1500; // 1.5s minimum loading screen time for visual transition
  const MAX_LOADING_TIME = 15000; // 15s safety fallback
  const loadingStartTime  = Date.now();
  let loaderFinished = false;

  function updateCounter() {
    if (loaderFinished) return;
    const elapsed = Date.now() - loadingStartTime;
    
    // Combined progress: 80% video, 20% images
    const combinedProgress = (videoProgress * 0.8) + (imagesProgress * 0.2);
    let disp = Math.floor(combinedProgress * 100);
    if (disp > 99) disp = 99;
    
    const isReady = videoLoaded && imagesLoaded;
    const minPassed = elapsed >= MIN_LOADING_TIME;
    const maxPassed = elapsed >= MAX_LOADING_TIME;
    
    if (isReady && minPassed) {
      disp = 100;
    }
    
    if (counterEl) counterEl.innerText = String(disp).padStart(3, '0');
    if (progressEl) progressEl.style.width = `${disp}%`;

    if ((isReady && minPassed) || maxPassed) {
      loaderFinished = true;
      if (counterEl) counterEl.innerText = '100';
      if (progressEl) progressEl.style.width = '100%';
      clearInterval(stringInterval);
      setTimeout(() => {
        if (loadingScreen) { 
          loadingScreen.style.transition = 'opacity 0.6s ease'; 
          loadingScreen.style.opacity = '0'; 
          loadingScreen.style.pointerEvents = 'none'; 
        }
        setTimeout(() => { if(loadingScreen) loadingScreen.style.display = 'none'; }, 650);
        triggerHeroEntrance();
      }, 400);
      return;
    }
    requestAnimationFrame(updateCounter);
  }

  // Start the counter
  updateCounter();

  // Register GSAP plugins
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch(e) {
    console.warn('[main.js] GSAP registration failed:', e);
  }
});

function triggerHeroEntrance() {
  // Hero Video Playlist
  (function () {
    const container = document.getElementById('hero-video-container');
    if (!container) return;

    const clips = [
      { src: 'assets/projects/zimbali/zimbali-hero.mp4', start: 0, end: 6 }
    ];

    let current = 0;
    let timer   = null;
    let stopped = false;

    const v1 = document.createElement('video');
    const v2 = document.createElement('video');

    [v1, v2].forEach((v, i) => {
      v.muted      = true;
      v.playsInline = true;
      v.preload    = 'auto';
      v.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;' +
        'object-fit:cover;z-index:1;' +
        'transition:opacity 0.9s ease;' +
        'opacity:' + (i === 0 ? '1' : '0') + ';';
      container.appendChild(v);
    });

    let active  = v1;
    let standby = v2;

    // Track what each element currently has buffered so we never reload needlessly
    v1._loadedSrc = null;
    v2._loadedSrc = null;

    function primeVideo(video, clip, onReady) {
      const clipSrc = (clip.src === 'assets/projects/zimbali/zimbali-hero.mp4' && videoBlobUrl) ? videoBlobUrl : clip.src;
      const alreadyLoaded = (video._loadedSrc === clipSrc);

      function doSeek() {
        video.onseeked = null;
        video.currentTime = clip.start;
        // Wait for the seek to complete so the correct frame is painted
        video.onseeked = () => {
          video.onseeked = null;
          if (onReady) onReady();
        };
        // Safety: if seeked never fires (already at that time), call directly
        if (Math.abs(video.currentTime - clip.start) < 0.05) {
          video.onseeked = null;
          if (onReady) onReady();
        }
      }

      if (alreadyLoaded) {
        doSeek();
      } else {
        video.oncanplaythrough = null;
        video.src = clipSrc;
        video._loadedSrc = clipSrc;
        video.load();
        video.oncanplaythrough = () => {
          video.oncanplaythrough = null;
          doSeek();
        };
      }
    }

    function playNext() {
      if (stopped) return;

      const clip     = clips[current];
      const nextClip = clips[(current + 1) % clips.length];

      // Preload the next clip into standby silently — no seek yet
      const nextSrc = (nextClip.src === 'assets/projects/zimbali/zimbali-hero.mp4' && videoBlobUrl) ? videoBlobUrl : nextClip.src;
      if (standby._loadedSrc !== nextSrc) {
        standby.oncanplaythrough = null;
        standby.src = nextSrc;
        standby._loadedSrc = nextSrc;
        standby.load();
      }

      // Seek the active video to the correct in-point, then play
      primeVideo(active, clip, () => {
        if (stopped) return;
        active.style.opacity = '1';
        active.play().catch(() => {});

        const holdMs = (clip.end - clip.start) * 1000;

        // Begin crossfade 900ms before the clip ends (matches transition duration)
        timer = setTimeout(() => {
          if (stopped) return;

          // Seek standby to its in-point before fading it in
          primeVideo(standby, nextClip, () => {
            if (stopped) return;
            standby.style.opacity = '1';
            standby.play().catch(() => {});

            // After fade completes, flip roles and advance
            setTimeout(() => {
              if (stopped) return;
              active.style.opacity = '0';
              active.pause();

              const tmp = active;
              active  = standby;
              standby = tmp;
              current = (current + 1) % clips.length;
              playNext();
            }, 900);
          });
        }, holdMs - 900);
      });
    }

    let fadeTimer = null;
    window.addEventListener('scroll', function() {
      if (window.scrollY > 30) {
        if (!stopped) {
          stopped = true;
          clearTimeout(timer);
          [v1, v2].forEach(v => {
            v.style.transition = 'opacity 1.2s ease';
            v.style.opacity    = '0';
          });
          fadeTimer = setTimeout(() => {
            [v1, v2].forEach(v => v.pause());
          }, 1200);
        }
      } else {
        if (stopped) {
          stopped = false;
          clearTimeout(fadeTimer);
          playNext();
        }
      }
    }, { passive: true });

    playNext();
  })();


  initScrollWalkthrough();
  initProjectsLazyLoad();
  initHorizontalScroll();
  initProjectCardsGrowth();
  initCustomCursor();
  gsap.to('.hero-fade', { opacity: 1, y: 0, duration: 1.1, stagger: 0.14, ease: 'power3.out' });
}

/**
 * Optimized Scroll-Scrub Canvas Logic (1608 Frames)
 */
function initScrollWalkthrough() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    canvas.width = 1920; 
    canvas.height = 1080; 

    const totalFrames = 1608; 
    const images = globalImages; // Use the global preloaded images array
    
    const FIRST_FRAME_NUMBER = 86400;

    const timeChip = document.getElementById('video-time-chip');
    const audiencePane = document.getElementById('audience-pane');
    const textPaneLeft = document.getElementById('text-pane-left');
    const textPaneRight = document.getElementById('text-pane-right');
    const headlineEl = document.getElementById('overlay-headline');
    const supportingEl = document.getElementById('overlay-supporting');
    const chipsContainer = document.getElementById('proof-chips-container');
    const homeOverlay = document.getElementById('hero-content');
    const nav = document.getElementById('main-nav');

    const getFramePath = (index) => {
      const realFrameNumber = FIRST_FRAME_NUMBER + index - 1;
      return `assets/hero-sequence/frame_${String(realFrameNumber).padStart(9, '0')}.webp`;
    };

    // Sliding Window and Memory Management (Garbage Collector)
    function loadWindow(centerFrame) {
      const bufferBackward = 20;
      const bufferForward = 50;
      const start = Math.max(1, centerFrame - bufferBackward);
      const end = Math.min(totalFrames, centerFrame + bufferForward);
      
      // Load frames within the buffer window
      for (let i = start; i <= end; i++) {
        if (!images[i]) {
          const img = new Image();
          img.src = getFramePath(i);
          images[i] = img;
        }
      }
      
      // Release frames outside a wider window to conserve memory
      const gcWindow = 100;
      for (let i = 1; i <= totalFrames; i++) {
        // Keep the first 20 preloaded frames for fast load transitions
        if (i <= 20) continue;
        
        if (images[i] && (i < centerFrame - gcWindow || i > centerFrame + gcWindow)) {
          images[i].src = ''; // Cancel loading and release memory
          images[i] = null;
        }
      }
    }

    // Load initial window
    loadWindow(1);

    // Initial paint if frame 1 is loaded
    if (images[1]) {
      if (images[1].complete) {
        ctx.drawImage(images[1], 0, 0, canvas.width, canvas.height);
      } else {
        images[1].onload = () => ctx.drawImage(images[1], 0, 0, canvas.width, canvas.height);
      }
    }

    ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: '+=10000',
        pin: true,
        scrub: 0.1,
        onUpdate: (self) => {
            const currentInt = Math.round(self.progress * (totalFrames - 1)) + 1;
            
            // Dynamic window preloading & memory sweep
            loadWindow(currentInt);
            
            // Render: draw current frame, fallback to nearest loaded frame to avoid flickers
            if (images[currentInt] && images[currentInt].complete) {
                ctx.drawImage(images[currentInt], 0, 0, canvas.width, canvas.height);
            } else {
                // Find nearest loaded frame within a small window
                let nearest = null;
                for (let d = 1; d <= 20; d++) {
                    if (currentInt - d >= 1 && images[currentInt - d] && images[currentInt - d].complete) {
                        nearest = images[currentInt - d];
                        break;
                    }
                    if (currentInt + d <= totalFrames && images[currentInt + d] && images[currentInt + d].complete) {
                        nearest = images[currentInt + d];
                        break;
                    }
                }
                if (nearest) ctx.drawImage(nearest, 0, 0, canvas.width, canvas.height);
            }

            // Overlay Sync
            const fade = 0.10;
            let ho = self.progress > 0 ? 1 - Math.min(self.progress / fade, 1) : 1;
            if (homeOverlay) { homeOverlay.style.opacity = ho; homeOverlay.style.pointerEvents = ho > 0.4 ? 'auto' : 'none'; }
            const indicator = document.getElementById('scroll-indicator');
            if (indicator) {
                let io = self.progress > 0 ? 1 - Math.min(self.progress / 0.04, 1) : 1;
                indicator.style.opacity = io;
            }
            if (nav) {
                if (self.progress > 0) {
                    nav.classList.add('nav-hidden');
                } else {
                    nav.classList.remove('nav-hidden');
                }
            }
            
            // Data Pipeline Sync
            const currentTime = self.progress * VIDEO_DURATION_FALLBACK;
            
            let activeIdx = pipelineData.findIndex(d => currentTime >= d.start && currentTime <= d.end);
            if (activeIdx !== -1) {
                const d = pipelineData[activeIdx];
                if (headlineEl) headlineEl.innerText = d.headline;
                if (supportingEl) supportingEl.innerText = d.supporting;
                if (audiencePane) audiencePane.innerText = d.audience;
                if (chipsContainer) chipsContainer.innerHTML = d.proof.map(c => `<span class="proof-chip">${c}</span>`).join('');
                [audiencePane, textPaneLeft, textPaneRight].forEach(el => { if(el){ el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }});
                if (textPaneLeft) textPaneLeft.classList.add('pane-active');
            } else {
                [audiencePane, textPaneLeft, textPaneRight].forEach(el => { if(el){ el.style.opacity = '0'; el.style.transform = 'translateY(10px)'; }});
                if (textPaneLeft) textPaneLeft.classList.remove('pane-active');
            }
        }
    });
}

/**
 * Lazy loading of project card videos and secondary images
 * Activates when the user scrolls close to the projects section.
 */
function initProjectsLazyLoad() {
  const container = document.getElementById('projects');
  if (!container) return;

  ScrollTrigger.create({
    trigger: container,
    start: 'top-=1500 bottom', // Trigger 1500px before projects enters the viewport
    once: true,
    onEnter: () => {
      console.log("[main.js] Triggering lazy load for projects assets");
      
      // 1. Swap data-src for videos
      const videos = container.querySelectorAll('video[data-src]');
      videos.forEach(video => {
        video.src = video.getAttribute('data-src');
        video.removeAttribute('data-src');
        video.load();
      });
      
      // 2. Swap data-src for images
      const images = container.querySelectorAll('img[data-src]');
      images.forEach(img => {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
    }
  });
}

/**
 * Robust Horizontal Scroll for Projects
 * Translates the track horizontally as the user scrolls vertically.
 */
function initHorizontalScroll() {
  const container = document.getElementById("projects-container");
  const track = document.getElementById("projects-track");

  if (!container || !track) return;

  // Calculate the total horizontal scroll distance
  // It's the track's scrollable width minus the viewport width
  function getScrollAmount() {
    return track.scrollWidth - window.innerWidth;
  }

  // Create the GSAP animation
  const tween = gsap.to(track, {
    x: () => -getScrollAmount(),
    ease: "none"
  });

  // Create the ScrollTrigger
  ScrollTrigger.create({
    trigger: container,
    start: "top top",
    end: () => `+=${getScrollAmount()}`,
    pin: true,
    animation: tween,
    scrub: 1, // Smoothing factor
    invalidateOnRefresh: true, // Recalculate on resize
  });
}

/**
 * Custom Cursor Logic
 */
function initCustomCursor() {
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorOutline = document.querySelector(".cursor-outline");
  
  if (!cursorDot || !cursorOutline) return;
  document.body.classList.add('custom-cursor-active');

  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediately position the dot
    cursorDot.style.top = `${mouseY}px`;
    cursorDot.style.left = `${mouseX}px`;
  });

  // Smooth animation for the outline
  function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    
    cursorOutline.style.top = `${outlineY}px`;
    cursorOutline.style.left = `${outlineX}px`;
    
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  // Add hover states
  const interactables = document.querySelectorAll("a, button, .project-card");
  interactables.forEach(el => {
    el.addEventListener("mouseenter", () => {
      document.body.classList.add("cursor-hover");
      if (el.classList.contains("project-card")) {
        const video = el.querySelector(".gallery-video");
        if (video) video.play().catch(e => console.warn("Video play error:", e));
      }
    });
    el.addEventListener("mouseleave", () => {
      document.body.classList.remove("cursor-hover");
      if (el.classList.contains('project-card')) {
        if (el.id === 'pather-card') return; // Skip pausing House Pather video
        const video = el.querySelector('.gallery-video');
        if (video) { video.pause(); video.currentTime = 0; }
      }
    });
  });
}

// Video hover controller — skip #pather-card (handled by initPatherCard)
document.querySelectorAll('.project-card').forEach(card => {
  if (card.id === 'pather-card') return; // pather has its own controller
  const video = card.querySelector('.gallery-video');
  if (video) {
    card.addEventListener('mouseenter', () => video.play().catch(() => {}));
    card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
  }
});

// Nav hover-peek controller
// Nav reveals when mouse enters the top 15% of the screen (= 85% from the bottom).
// Hides again when mouse moves below that line and scroll > 30px.
(function () {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const THRESHOLD = 0.15; // top 15% of viewport height

  document.addEventListener('mousemove', (e) => {
    const inZone = e.clientY / window.innerHeight < THRESHOLD;

    if (inZone) {
      nav.classList.remove('nav-hidden');
    } else if (window.scrollY > 30) {
      nav.classList.add('nav-hidden');
    }
  }, { passive: true });
})();

/**
 * House Pather Card — Grow-to-Fullscreen on Hover
 *
 * mouseenter : video plays; a fixed overlay (appended to <body>, outside
 *              the ScrollTrigger-transformed track) snaps to the card's
 *              exact screen rect and grows to 100vw × 100vh over 4 seconds.
 * onComplete  : navigate to the project page.
 * mouseleave  : tween killed, overlay hidden instantly. Video keeps playing.
 * click       : navigate immediately while growing.
 *
 * The overlay is appended to <body> — NOT the transformed track — so
 * position:fixed works without the "teleport" bug caused by transformed parents.
 */
/**
 * Unified Project Cards — Grow-to-Fullscreen on Click-and-Hold
 *
 * Hover: Plays video (if any).
 * Click: Navigates immediately.
 * Click-and-Hold (>=300ms): Grows the card to fullscreen over 4 seconds, then navigates.
 * Releasing hold early: Shrinks back to card size.
 */
function initProjectCardsGrowth() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;

  // ── State ────────────────────────────────────────────────────────────────
  let activeCard    = null;
  let isMouseDown   = false;
  let holdStartTime = 0;
  let growTween     = null;
  let phase         = 0; // 0 = idle, 1 = growing

  // ── Overlay ──────────────────────────────────────────────────────────────
  // Appended to <body>, outside the horizontal scroll track transforms.
  const overlay = document.createElement('div');
  overlay.id    = 'pather-overlay';
  overlay.className = 'growing-overlay';
  overlay.style.cssText = [
    'position:fixed;z-index:900;',
    'pointer-events:none;',
    'overflow:hidden;',
    'border-radius:8px;',
    'opacity:0;'
  ].join('');
  document.body.appendChild(overlay);

  // ── Grow ─────────────────────────────────────────────────────────────────

  function startGrow(card) {
    if (phase >= 1) return;
    phase = 1;
    activeCard = card;

    const targetUrl = card.getAttribute('data-target');

    // Clone the hover-gallery inside the card
    const originalGallery = card.querySelector('.hover-gallery');
    if (originalGallery) {
      overlay.innerHTML = '';

      // Snapshot the computed opacity of each image BEFORE cloning,
      // so we can freeze whichever image is currently visible.
      const originalImages = originalGallery.querySelectorAll('.gallery-image');
      const opacitySnapshot = [];
      originalImages.forEach(img => {
        opacitySnapshot.push(window.getComputedStyle(img).opacity);
      });
      
      const clonedGallery = originalGallery.cloneNode(true);
      clonedGallery.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';

      // Bake the snapshotted opacity as inline styles on the clones.
      // The CSS freeze rule (animation: none !important) stops the crossfade,
      // and these inline opacities lock whichever image was showing.
      const clonedImages = clonedGallery.querySelectorAll('.gallery-image');
      clonedImages.forEach((img, i) => {
        const op = opacitySnapshot[i] || '0';
        img.style.opacity = op;
        img.style.transform = 'scale(1)';
      });

      overlay.appendChild(clonedGallery);

      // Play video if it has one
      const clonedVideo = clonedGallery.querySelector('video');
      const originalVideo = originalGallery.querySelector('video');
      if (clonedVideo && originalVideo) {
        try {
          if (clonedVideo.readyState >= 1) {
            clonedVideo.currentTime = originalVideo.currentTime;
          } else {
            clonedVideo.addEventListener('loadedmetadata', () => {
              try { clonedVideo.currentTime = originalVideo.currentTime; } catch(e){}
            }, { once: true });
          }
        } catch(e) {}
        clonedVideo.play().catch(() => {});
      }
    }

    // Snapshot card rect
    const rect = card.getBoundingClientRect();

    gsap.set(overlay, {
      left        : rect.left,
      top         : rect.top,
      width       : rect.width,
      height      : rect.height,
      borderRadius: 8,
      opacity     : 1
    });

    // Grow over exactly 4 seconds
    growTween = gsap.to(overlay, {
      left        : 0,
      top         : 0,
      width       : window.innerWidth,
      height      : window.innerHeight,
      borderRadius: 0,
      duration    : 4,
      ease        : 'power2.inOut',
      onComplete  : () => {
        window.location.href = targetUrl;
      }
    });
  }

  function cancelGrow() {
    if (growTween) { growTween.kill(); growTween = null; }
    
    // Pause any cloned videos
    const clonedVideo = overlay.querySelector('video');
    if (clonedVideo) {
      try { clonedVideo.pause(); } catch(e){}
    }

    gsap.to(overlay, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        gsap.set(overlay, { left: 0, top: 0, width: 0, height: 0 });
        overlay.innerHTML = '';
      }
    });
    phase = 0;
    activeCard = null;
  }

  // ── Event bindings for all cards ─────────────────────────────────────────

  cards.forEach(card => {
    // Click & Hold (Mousedown)
    card.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only left click
      isMouseDown = true;
      holdStartTime = Date.now();
      startGrow(card);
    });

    // Touch support (mobile-friendly click and hold)
    card.addEventListener('touchstart', (e) => {
      isMouseDown = true;
      holdStartTime = Date.now();
      startGrow(card);
    });

    // Mouseleave handler to cancel if dragging away
    // Skip cancel if the overlay is actively growing (phase 1) — the overlay covering
    // the card triggers a false mouseleave that we need to ignore.
    card.addEventListener('mouseleave', () => {
      if (isMouseDown && activeCard === card && phase === 0) {
        isMouseDown = false;
        cancelGrow();
      }
    });
  });

  // Release Hold (Mouseup) - global listener
  window.addEventListener('mouseup', () => {
    if (!isMouseDown || !activeCard) return;
    isMouseDown = false;

    const targetUrl = activeCard.getAttribute('data-target');
    const holdDuration = Date.now() - holdStartTime;
    if (holdDuration < 300) {
      // Quick click -> navigate immediately
      cancelGrow();
      window.location.href = targetUrl;
    }
    // If held longer than 300ms, let the grow tween continue running to completion
  });

  window.addEventListener('touchend', () => {
    if (!isMouseDown || !activeCard) return;
    isMouseDown = false;

    const targetUrl = activeCard.getAttribute('data-target');
    const holdDuration = Date.now() - holdStartTime;
    if (holdDuration < 300) {
      cancelGrow();
      window.location.href = targetUrl;
    }
    // If held longer than 300ms, let the grow tween continue running to completion
  });
}
