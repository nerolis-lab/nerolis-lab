# Public guides (VitePress)

Player-facing Pokémon Sleep guides are built with [VitePress](https://vitepress.dev/) and deployed under **`/guides/`** on the main site (Pattern A: custom slim top bar in the theme, not the main app `NavBar`).

## Layout

- **`content/`** — Markdown pages published on the site (VitePress `srcDir`).
- **`.vitepress/`** — theme and build config (most contributors editing copy only touch `content/`).
- **`README.md`** (this file) — package notes for maintainers; **not** a VitePress page and not shown to site users.

## Local preview

```bash
cd guides
npm install
npm run dev
```

Open the URL VitePress prints (typically with base path `/guides/`).

## Theme (SCSS)

- **Colors:** `.vitepress/theme/tokens.scss` — CSS custom properties (`--color-*`, `--vp-c-*`).
- **Typography:** `.vitepress/theme/typography.scss` — type scale and `.vp-doc` content rules.
- **Layout / shell:** `.vitepress/theme/style.scss` — imports tokens + typography, slim nav, VitePress overrides.

Custom Vue components should use `var(--color-primary-500)`, `var(--tracking-tight)`, etc. (no JSON pipeline).

**Shared with the main app:** reusable Vue SFCs live under **`frontend/src/shared/`** (Vite alias `@shared`). Import them from `.vitepress/theme` as `@shared/components/...` and register in `index.ts`. See `frontend/src/shared/README.md` for constraints (no Pinia/router in shared components).

## Editing

- Add or change **Markdown** in **`content/`** (player-facing pages only). New `.md` files there are picked up automatically; the sidebar is generated from that tree (see `.vitepress/sidebar.ts`). Package config (`.vitepress/`, `package.json`, this README) stays at the `guides/` root so it is separate from guide content.
- Optional Vue components can be registered in `.vitepress/theme/index.ts` and used in Markdown (for example `<GuideDemoBanner />`). Prefer implementing those components under `frontend/src/shared/` when both the app and guides should use them.

## Full-site navigation

The slim bar links to the main Neroli's Lab app (`/`, `/calculator`, etc.). The main app links **Guides** to `/guides/` using a full-page navigation so the static guides bundle is loaded (see frontend router guard).

## Production build

```bash
npm run build
```

Output is in `guides/.vitepress/dist` and should be deployed to `${FRONTEND_DIR}/guides/` per the release checklist.

## GitHub “Edit this page”

Configured in `.vitepress/config.ts` (`themeConfig.editLink`) to point at files under `guides/` in this repository (VitePress `srcDir` is `content/`).
