# Portfolio #3 — Working Notes for Claude

This is Bradley Brits' architecture portfolio site (live at **bradleybrits.co.za**,
deployed via GitHub Pages, `CNAME` file at repo root). It's a static site — plain
HTML/CSS/JS, no build step, no framework, no bundler.

## Editing workflow (always follow this loop)

1. **Edit locally** — HTML/CSS/JS files directly in this folder. No compilation needed.
2. **Test locally** — run the dev server and check in the browser before considering
   anything done:
   ```bash
   node server.js
   ```
   Serves the site at **http://localhost:3001**. `server.js` is a small static
   file server (no live-reload) — refresh the browser after each save. `Ctrl+C`
   to stop it; if the port's already in use, a server from a previous session is
   probably still running.
3. **Commit and push only when the user is happy with a change** — never commit
   or push automatically. Stage specific files (not `-A`), write a commit message
   that explains *why*, then `git push` to `origin/main`. Confirm before pushing —
   this repo deploys straight to the live site via GitHub Pages, so a push is
   effectively a production deploy.

## Structure

- `index.html`, `css/index.css`, `js/main.js` — the homepage (loading screen,
  hero, horizontal project track, GSAP scroll animations).
- `css/style.css`, `css/project.css` — shared / project-detail styles.
- `js/next-project.js`, `js/cad-viewer.js` — supporting scripts (next-project
  nav footer, PDF/CAD viewer used on some project pages).
- `projects/<slug>/index.html` — one folder per project (e.g. `zimbali`,
  `die-laan`, `granger-bay`, `stud-hq`, `belhar-regional-hospital`,
  `lentegeur-hospital`, `site-intelligence`, `newlands-cricket`, ...). Each is a
  standalone HTML page linking back to `../../css/*` and `../../js/*`.
- `assets/projects/<slug>/` — images, videos, PDFs for each project. Large
  binary assets live here (there are ~3000+ files — expect this when globbing).
- `assets/hero-sequence/` — frame sequence (webp) for the scroll-scrubbed hero
  animation on the homepage.
- `assets/capabilities/` — short capability-showcase videos used in the loading
  screen (photogrammetry, lighting, etc).
- `cv/index.html` — standalone CV page.
- `scaffold.js`, `inject-next-project.js` — **one-off migration/build scripts**
  used in the past to scaffold `portfolio #2`'s project pages from an older
  portfolio and to inject the next-project script tag. They hardcode old paths
  from sibling folders (`portfolio #2`, `Bradley Brits Portfolio (1)`) and are
  not part of the running site — don't invoke them without checking with
  Bradley first, and don't treat them as the current authoring pattern for new
  project pages (copy an existing `projects/<slug>/index.html` as a template
  instead).
- `server.js` — the local dev server described above. Currently configured for
  port **3001**.

## Conventions / gotchas

- Styling mixes hand-written CSS classes (`bg-sohub-black`, `text-sohub-white`,
  etc. — Tailwind-like utility names but this project does **not** use the
  Tailwind CDN on every page) with GSAP-driven scroll/hover animation classes.
  Check whether a page already loads Tailwind or GSAP via CDN `<script>` tags
  before assuming a utility class will work.
- GSAP + ScrollTrigger are loaded via CDN (`cdnjs.cloudflare.com` on some
  pages, `cdn.jsdelivr.net` on others — inconsistent, worth normalizing if
  touching a page's `<head>`).
- Asset paths from project pages are relative (`../../css/...`,
  `../../js/...`, `../../assets/...`) since they live two levels deep in
  `projects/<slug>/`.
- Line endings: the repo has mixed LF/CRLF history — Git will warn about CRLF
  conversion on Windows. Not a problem, just expected noise in `git diff`.
- No `.gitignore` currently exists — be deliberate about what gets staged.

## Current state (as of last check)

There are **uncommitted local changes already sitting in the working tree**
from a prior editing session: `css/index.css`, `index.html`, `js/main.js`, and
`server.js` (port 3000 → 3001) are modified, and `assets/capabilities/` is a
new untracked folder. Don't discard these — confirm with Bradley whether
they're finished work to commit, or in-progress changes to keep iterating on.
