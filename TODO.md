# Occupy Mars — to do

Owner's list (Muhammet) and the work queue. Tick things off in commits.

## Needs Muhammet (Vercel / accounts)
- [ ] **Vercel domain → Occupy Mars.** The free domain follows the Vercel *project name*: Vercel dashboard → the project → Settings → General → "Project Name" → `occupy-mars` → the site becomes `occupy-mars.vercel.app` (if that name is free; otherwise `occupymars`, `occupy-mars-sim`…). The old `*.vercel.app` URL stops working, the GitHub link stays. Custom domain (e.g. occupymars.space): Settings → Domains → Add, then the DNS records Vercel shows at the registrar.
- [ ] Optional: rename the GitHub repo to `occupy-mars` (Vercel follows the rename automatically; locally `git remote set-url origin git@github.com:alierbsh/occupy-mars.git`).

## Site
- [ ] **Intro screen.** The site opens on a landing screen instead of starting the simulation: why building a city on Mars matters (the case for a multi-planetary civilisation — backup for life, the frontier, what it takes), a few lines, then "Start the mission" → the simulation. Same register as the rest (black, tracked labels), with the Mars globe or a still of the pad behind it.
- [x] "Built by arbash" byline under the wordmark.
- [ ] Starship landing: smoother flip and touchdown, engines cut at touchdown, landing dust.
- [ ] Orion (and the other capsules) crashing on Mars: a proper impact — debris, dust, scorch, flash, camera shake.
- [ ] Launch camera: open on a close-up at T-0 and pull out; the Starship catch arms swing clear after liftoff.
- [ ] Starship Mars ship: landing legs.

## Model
- [ ] Return trip (Mars ascent, Earth return) — currently not modelled.
- [ ] Dust storms as random events; Mars winds in the landing phase.
