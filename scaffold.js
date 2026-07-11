/**
 * Scaffolds the projects structure, generates HTML based on Sohub layout,
 * and updates the main index.html track.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OLD_PROJECTS_DIR = "C:/Users/ibrad/OneDrive/Desktop/portfolios/Bradley Brits Portfolio (1)/projects";
const OLD_ASSETS_DIR = "C:/Users/ibrad/OneDrive/Desktop/portfolios/Bradley Brits Portfolio (1)/assets/projects";
const NEW_PROJECTS_DIR = "C:/Users/ibrad/OneDrive/Desktop/portfolios/portfolio #2/projects";
const NEW_ASSETS_DIR = "C:/Users/ibrad/OneDrive/Desktop/portfolios/portfolio #2/assets/projects";
const MAIN_HTML_FILE = "C:/Users/ibrad/OneDrive/Desktop/portfolios/portfolio #2/index.html";

// Ensure directories exist
if (!fs.existsSync(NEW_PROJECTS_DIR)) fs.mkdirSync(NEW_PROJECTS_DIR, { recursive: true });
if (!fs.existsSync(NEW_ASSETS_DIR)) fs.mkdirSync(NEW_ASSETS_DIR, { recursive: true });

// Read old projects
const projects = fs.readdirSync(OLD_PROJECTS_DIR).filter(f => fs.statSync(path.join(OLD_PROJECTS_DIR, f)).isDirectory());

// We want site-intelligence to be first
const orderedProjects = ["site-intelligence", ...projects.filter(p => p !== "site-intelligence")];

function formatName(id) {
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

let horizontalCardsHTML = '';

orderedProjects.forEach((project, index) => {
    const newProjDir = path.join(NEW_PROJECTS_DIR, project);
    const newAssetDir = path.join(NEW_ASSETS_DIR, project);
    const oldMediaDir = path.join(OLD_PROJECTS_DIR, project, 'media');
    
    if (!fs.existsSync(newProjDir)) fs.mkdirSync(newProjDir, { recursive: true });
    if (!fs.existsSync(newAssetDir)) fs.mkdirSync(newAssetDir, { recursive: true });
    
    // Copy media files (PowerShell copy is async/background usually, we'll do it synchronously here for speed if small, but let's just let the user know)
    // Actually, we can just copy using node fs
    if (fs.existsSync(oldMediaDir)) {
        const mediaFiles = fs.readdirSync(oldMediaDir);
        mediaFiles.forEach(file => {
            const src = path.join(oldMediaDir, file);
            const dest = path.join(newAssetDir, file);
            if (fs.statSync(src).isFile()) {
                fs.copyFileSync(src, dest);
            }
        });
    }

    // Copy special assets if exists (like site-intelligence)
    const oldAssetProjDir = path.join(OLD_ASSETS_DIR, project);
    if (fs.existsSync(oldAssetProjDir)) {
        // Just copy the whole dir via powershell later, or files here
        // For now, let's just assume powershell handles large folders like sequence
    }

    // Get first image for thumbnail
    let thumb = '../../assets/placeholder.jpg';
    if (fs.existsSync(newAssetDir)) {
        const files = fs.readdirSync(newAssetDir).filter(f => f.endsWith('.jpg') || f.endsWith('.webp') || f.endsWith('.png'));
        if (files.length > 0) thumb = `../../assets/projects/${project}/${files[0]}`;
    }

    // Generate HTML for project page (Sohub inspired)
    const title = project === 'site-intelligence' ? 'Niewoudsville' : formatName(project);
    
    let specialHero = '';
    if (project === 'site-intelligence') {
        specialHero = `<div class="hero-canvas-container" style="height: 100vh; position: relative;">
            <canvas id="project-hero-canvas" style="width:100%; height:100%; object-fit:cover; opacity: 0.8;"></canvas>
            <script>
                // Logic for Niewoudsville canvas scrub
                // Will be handled by logic agent
            </script>
        </div>`;
    } else {
        specialHero = `<div class="hero-image" style="background-image: url('${thumb}'); height: 100vh; background-size: cover; background-position: center;"></div>`;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Bradley Brits</title>
    <link rel="stylesheet" href="../../css/index.css">
    <link rel="stylesheet" href="../../css/project.css">
</head>
<body class="project-detail-page bg-sohub-black text-sohub-white">
    <nav class="project-nav fixed top-0 w-full p-8 z-[100] mix-blend-difference">
        <a href="../../index.html" class="back-link font-medium text-lg">&larr; Back to Portfolio</a>
    </nav>
    
    <header class="project-hero relative w-full h-[60vh] lg:h-screen">
        ${specialHero}
        
        <!-- Sohub style HUD tags -->
        <div class="hero-hud absolute bottom-0 w-full p-8 lg:p-12 flex flex-col gap-6 z-10">
            <h1 class="project-title text-5xl lg:text-7xl font-semibold tracking-wide">${title}</h1>
            <div class="hud-tags flex flex-wrap gap-4">
                <span class="tag px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm">Role: Architecture</span>
                <span class="tag px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm">Phase: Concept</span>
            </div>
        </div>
    </header>

    <main class="project-content px-4 lg:px-12 py-20 flex flex-col gap-24">
        <section class="intro-text max-w-4xl">
            <h2 class="text-3xl lg:text-5xl font-medium leading-tight text-sohub-grey">
                This project represents a concentrated ambition to craft compelling spatial narratives.
            </h2>
        </section>

        <section class="project-gallery grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Will be populated dynamically by script or later -->
            <img src="${thumb}" class="w-full h-[60vh] object-cover rounded-2xl" alt="${title} Image 1">
            <img src="${thumb}" class="w-full h-[60vh] object-cover rounded-2xl" alt="${title} Image 2">
        </section>
    </main>

    <!-- GSAP for animations -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="../../js/project.js"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(newProjDir, 'index.html'), htmlContent);

    // Generate Card for main index.html
    let hoverMedia = `<img src="assets/projects/${project}/${path.basename(thumb)}" alt="${title} Main" class="gallery-image" />`;
    
    if (project === 'stud-hq') {
        hoverMedia = `<video src="assets/projects/stud-hq/hero-video.mp4" autoplay loop muted playsinline class="gallery-video" style="width:100%; height:100%; object-fit:cover; position:absolute; inset:0; opacity:0; transition: opacity 0.5s;"></video>` + hoverMedia;
    }

    horizontalCardsHTML += `
        <article class="project-card" onclick="window.location.href='projects/${project}/index.html'">
          <div class="project-media">
            <div class="hover-gallery">
              ${hoverMedia}
            </div>
          </div>
          <div class="project-info">
            <h3 class="project-title">${title}</h3>
            <span class="project-category">Architecture / Design</span>
          </div>
        </article>
    `;
});

// Update index.html horizontal track
let mainHtml = fs.readFileSync(MAIN_HTML_FILE, 'utf8');
const trackStartStr = '<div class="projects-track" id="projects-track">';
const trackEndStr = '      </div>\r\n    </div>\r\n  </section>'; // the wrapper end

const startIndex = mainHtml.indexOf(trackStartStr);
const endIndex = mainHtml.indexOf(trackEndStr);

if (startIndex !== -1 && endIndex !== -1) {
    const newMainHtml = mainHtml.substring(0, startIndex + trackStartStr.length) + '\n' + horizontalCardsHTML + '\n' + mainHtml.substring(endIndex);
    fs.writeFileSync(MAIN_HTML_FILE, newMainHtml);
    console.log("Updated main index.html horizontal track.");
} else {
    // Try without \r
    const trackEndStr2 = '      </div>\n    </div>\n  </section>';
    const endIndex2 = mainHtml.indexOf(trackEndStr2);
    if (startIndex !== -1 && endIndex2 !== -1) {
        const newMainHtml = mainHtml.substring(0, startIndex + trackStartStr.length) + '\n' + horizontalCardsHTML + '\n' + mainHtml.substring(endIndex2);
        fs.writeFileSync(MAIN_HTML_FILE, newMainHtml);
        console.log("Updated main index.html horizontal track.");
    } else {
        console.log("Could not find horizontal track end string in main index.html");
    }
}

console.log("Scaffolding complete.");
