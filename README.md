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

## Deployment on ArvanCloud (or any server behind a proxy)

The app is a **static SPA** — `npm run build` produces a fully self‑contained
`dist/` folder. Font Awesome is bundled locally, so the running site needs **no
international internet** (see the one caveat under Notes about demo photos).

Only the **build step** needs the npm registry. On an Iranian server that has a
proxy for international access:

### 1. Configure npm to use the proxy

```bash
cp .npmrc.example .npmrc
# edit .npmrc and set your proxy, e.g.:
#   proxy=http://127.0.0.1:8889
#   https-proxy=http://127.0.0.1:8889
```

Or set it directly:

```bash
npm config set proxy http://HOST:PORT
npm config set https-proxy http://HOST:PORT
# (or use an Iran-reachable mirror instead)
npm config set registry https://registry.npmmirror.com
```

### 2. Clone, install, build

```bash
git clone <repo-url> && cd neuravergh
npm install
npm run build      # outputs static files to ./dist
```

> Tip: you can also build on a machine **with** internet and copy only `dist/`
> to the server — then the server never needs the registry at all.

### 3. Serve the static `dist/` folder

Quickest (Node):

```bash
npm run preview -- --port 8080 --host
```

Production with **nginx** (recommended) — SPA fallback so deep links work:

```nginx
server {
    listen 80;
    server_name your-domain;
    root /var/www/neuravergh/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    # long cache for hashed assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Copy the build and reload:

```bash
rsync -a dist/ /var/www/neuravergh/dist/
sudo nginx -t && sudo systemctl reload nginx
```

## Notes

- Static images and fonts live under `public/src/...` and are referenced by
  runtime URL paths (e.g. `src/icons/png/marketing.png`). Figma `figma:asset/*`
  imports are resolved to those public URLs by a small plugin in
  `vite.config.ts`.
- Font Awesome is bundled locally (`@fortawesome/fontawesome-free`, imported in
  `src/main.tsx`) — no runtime CDN, so icons work behind filters / offline.
- **One remaining external dependency:** the demo restaurant/market screens
  (`eu-dine-screen`, `eu-market-screen`) reference product photos from
  `images.unsplash.com`. They degrade gracefully (a placeholder shows if the
  image can't load). To make those fully local too, drop images into
  `public/src/photos/` and replace the `image:` URLs in those two files.
- The marketing service reads `import.meta.env.VITE_*` (e.g.
  `VITE_MARKETING_MOCK_SCENARIO`) — copy `.env` values as needed.
