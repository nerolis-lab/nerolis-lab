# Guides package — development notes

This document is for **maintainers**: theme, build, tests, and tooling. If you only want to **write or edit guide pages**, start with [`README.md`](./README.md) in this folder.

## Overview

Player-facing Pokémon Sleep guides are built with [VitePress](https://vitepress.dev/) and deployed under **`/guides/`** on the main site. The guides theme ships its own slim top bar and nav which mimics the main frontend.

## Repository layout

- **`content/`** — Markdown pages published on the site (VitePress `srcDir`).
- **`.vitepress/`** — theme, build config, and sidebar generator (`sidebar.ts`).
- **`tests/`** — unit tests for build-time helpers (for example `.vitepress/sidebar.ts`). Tests live here so **`.vitepress/`** stays focused on theme and config.
- **`tsconfig.json`** — TypeScript and paths for the theme, config, and tests.
- **`tsconfig.typecheck.json`** — narrow project used by `npm run type-check` (TypeScript sources only; see **Scripts** below).
- **`.env.example`** — optional dev-only variable for main-app origin when VitePress runs on a different port than the SPA.

## Scripts

| Command              | Purpose                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run dev`        | VitePress dev server (port **5173**, `strictPort`; base `/guides/`).                           |
| `npm run build`      | Production static output to `.vitepress/dist`.                                                 |
| `npm run preview`    | Serves the last build locally.                                                                 |
| `npm run test`       | Vitest once (CI-friendly).                                                                     |
| `npm run test-watch` | Vitest in watch mode.                                                                          |
| `npm run type-check` | `tsc --noEmit` on `config.ts`, `sidebar.ts`, declaration shims, and `tests/` (see note below). |
| `npm run type-watch` | Same as `type-check`, in watch mode.                                                           |

**Type-checking:** `type-check` does **not** run `vue-tsc` over theme `.vue` files. Deep imports of VitePress internals would pull in `node_modules` graphs that fail under `vue-tsc`; theme SFCs are still validated when you run **`npm run build`**. The main app’s frontend package uses `vue-tsc` end-to-end; guides uses this split on purpose.

## Local preview (full detail)

```bash
cd guides
npm install
npm run dev
```

Open the URL VitePress prints (default **http://localhost:5173/guides/** with this repo’s config). The main Neroli’s Lab app dev server uses a different port (see `frontend/vite.config.ts`); optional **`.env`** in `guides/` can set `VITE_MAIN_DEV_ORIGIN` so header links to `/`, `/calculator`, etc. point at that origin (see `.env.example`).

## Theme (SCSS)

- **Colors:** `.vitepress/theme/tokens.scss` — CSS custom properties (`--color-*`, `--vp-c-*`).
- **Typography:** `.vitepress/theme/typography.scss` — type scale and content rules.
- **Layout / shell:** `.vitepress/theme/style.scss` — imports tokens + typography, slim nav, VitePress overrides.

Custom Vue components should use the theme’s CSS variables (for example `var(--color-primary-500)`, `var(--tracking-tight)`).

Register guide-only components in `.vitepress/theme/index.ts` (place SFCs under `.vitepress/theme/components/`).

## Sidebar and content (technical summary)

The sidebar is generated at build time from the **`content/`** tree. Folders become nested groups. YAML front matter supports **`title`** (nav label) and optional **`order`** (lower numbers sort earlier; ties use link order). Section folders may use **`index.md`** for the landing page and group title.

Optional Vue components can be registered in `.vitepress/theme/index.ts` and used in Markdown (for example `<GuideDemoComponent />`).

## Full-site navigation

The guides shell uses a slim top bar that links to the main Neroli’s Lab app (`/`, `/calculator`, etc.). The main app links **Guides** to `/guides/` with full-page navigation so the static guides bundle loads (see the frontend router guard).

## Production build

```bash
npm run build
```

Output is in `guides/.vitepress/dist` and should be deployed to `${FRONTEND_DIR}/guides/`.

## GitHub “Edit this page”

Configured in `.vitepress/config.ts` (`themeConfig.editLink`) to point at files under `guides/` in this repository (VitePress `srcDir` is `content/`).
