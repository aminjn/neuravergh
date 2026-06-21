# Neura UI

A Persian (RTL) multi‑role assistant app — admin panel + end‑user panel with
chat, calls, marketing/sales/secretary/procurement screens, and four runtime
themes (dark / light / bw / glass). Built with **React 18 + TypeScript + Vite +
Tailwind CSS v4** and **Motion** for animation, **Recharts** for charts.

## Requirements

- Node.js 18+ (tested on Node 22)

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
```

## Scripts

| Command             | What it does                                              |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Vite dev server with hot reload                          |
| `npm run build`     | Production build into `dist/`                            |
| `npm run preview`   | Serve the production build locally                       |
| `npm run typecheck` | Run the TypeScript compiler in no‑emit (lint) mode       |

> `build` uses Vite (esbuild) which strips types, so a successful build does not
> require a clean `typecheck`. The codebase carries some pre‑existing strict‑mode
> type warnings (mostly Motion `Variants` typings) that do not affect runtime.

## Project structure

```
index.html              Vite HTML entry (mounts #root, boot spinner)
src/
  main.tsx              React entry — renders <App/>, imports global CSS
  index.css            Tailwind v4 + design‑token theme (@theme inline)
  runtime-theme.css    Runtime theme system (dark/light/bw/glass), fonts, animations
  app/                 Application source
    App.tsx
    components/        Screens, panels, overlays, chat, charts …
    services/          Marketing service layer (mock + api, env‑driven)
    mocks/             Mock data sets
  imports/             Figma‑exported SVG/vector components
public/
  src/assets|icons|fonts|avatars   Static assets served at /src/...
```

## Notes

- Static images and fonts live under `public/src/...` and are referenced by
  runtime URL paths (e.g. `src/icons/png/marketing.png`). Figma `figma:asset/*`
  imports are resolved to those public URLs by a small plugin in
  `vite.config.ts`.
- Font Awesome glyphs are loaded from CDN in `index.html`.
- The marketing service reads `import.meta.env.VITE_*` (e.g.
  `VITE_MARKETING_MOCK_SCENARIO`) — copy `.env` values as needed.
