/**
 * inject-next-project.js
 * Injects <script src="../../js/next-project.js"> into all project index.html files.
 * Also ensures GSAP + ScrollTrigger CDN links are present (needed for Belhar which uses Tailwind CDN).
 */
const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, 'projects');
const SCRIPT_TAG = '<script src="../../js/next-project.js"></script>';
const GSAP_CDN = '<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>';
const ST_CDN = '<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>';

const projectDirs = fs.readdirSync(PROJECTS_DIR).filter(d => {
    const full = path.join(PROJECTS_DIR, d);
    return fs.statSync(full).isDirectory() && d !== 'Projects';
});

let injected = 0;

projectDirs.forEach(dir => {
    const htmlPath = path.join(PROJECTS_DIR, dir, 'index.html');
    if (!fs.existsSync(htmlPath)) {
        console.log(`SKIP: ${dir}/index.html not found`);
        return;
    }

    let html = fs.readFileSync(htmlPath, 'utf8');

    // Skip if already injected
    if (html.includes('next-project.js')) {
        console.log(`SKIP: ${dir}/index.html already has next-project.js`);
        return;
    }

    // Check if this page has GSAP already loaded
    const hasGSAP = html.includes('gsap.min.js') || html.includes('gsap') && html.includes('cdn');

    // Build injection block
    let injection = '\n';
    if (!hasGSAP) {
        injection += `  ${GSAP_CDN}\n  ${ST_CDN}\n`;
    }
    injection += `  ${SCRIPT_TAG}\n`;

    // Try to inject before </body>
    if (html.includes('</body>')) {
        html = html.replace('</body>', `${injection}</body>`);
    } else {
        // Fallback: append before </html>
        html = html.replace('</html>', `${injection}</html>`);
    }

    fs.writeFileSync(htmlPath, html);
    injected++;
    console.log(`INJECTED: ${dir}/index.html ${hasGSAP ? '(GSAP already present)' : '(+ GSAP CDN added)'}`);
});

console.log(`\nDone. Injected next-project.js into ${injected} project pages.`);
