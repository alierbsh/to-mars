# To Mars

**Can today's most advanced rockets carry a crew to Mars?**

Pick a real launch vehicle (Starship, SLS, New Glenn, …), give it a crew and a launch window, and let a physics simulation decide whether it gets there: real masses and engines, real orbital mechanics, real entry heating at Mars — and, when it fails, *what* failed first.

Inspired by the layout of [Robots in Space](https://robots-in-space.vercel.app/), aimed at a different question.

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [three.js](https://threejs.org) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) and [drei](https://github.com/pmndrs/drei)
- [zustand](https://github.com/pmndrs/zustand) for state
- Deployed on Vercel (static build, `dist/`)

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build locally
```

## Layout

```
src/
  scene/   three.js stage (vehicle models, planets, camera rig)
  sim/     physics core (ascent, orbit, transfer, entry) — coming
  data/    rocket catalogue + planetary constants with sources — coming
  state/   zustand store
  ui/      sidebar, HUD, verdict panel — coming
docs/
  research/  the research behind the numbers
```
