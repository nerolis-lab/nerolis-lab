# Guides package - development notes

This document is for **maintainers**: theme, build, tests, and tooling. If you only want to **write or edit guide pages**, start with [`README.md`](./README.md) in this folder.

## Overview

Player-facing Pokémon Sleep guides are built with [VitePress](https://vitepress.dev/) and deployed under **`/guides/`** on the main site. The guides theme ships its own slim top bar and nav which mimics the main frontend.

## Repository layout

- **`content/`** - Markdown pages published on the site (VitePress `srcDir`).
- **`.vitepress/`** - theme, build config, and **`lib/`** (sidebar generator, local search indexing helpers used from `config.ts`).
- **`tests/`** - unit tests for build-time helpers (for example `.vitepress/lib/sidebar.ts`). Tests live here so **`.vitepress/`** stays focused on theme and config.
- **`tsconfig.json`** - TypeScript and paths for the theme, config, and tests.
- **`tsconfig.typecheck.json`** - narrow project used by `npm run type-check` (TypeScript sources only; see **Scripts** below).
- **`.env.example`** - optional dev-only variable for main-app origin when VitePress runs on a different port than the SPA.

## Scripts

| Command              | Purpose                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm run dev`        | VitePress dev server (port **5173**, `strictPort`; base `/guides/`).                                       |
| `npm run build`      | Production static output to `.vitepress/dist`.                                                             |
| `npm run preview`    | Serves the last build locally.                                                                             |
| `npm run test`       | Vitest once (CI-friendly).                                                                                 |
| `npm run test-watch` | Vitest in watch mode.                                                                                      |
| `npm run type-check` | `tsc --noEmit` on `config.ts`, `.vitepress/lib/**/*.ts`, declaration shims, and `tests/` (see note below). |
| `npm run type-watch` | Same as `type-check`, in watch mode.                                                                       |

**Type-checking:** `type-check` does **not** run `vue-tsc` over theme `.vue` files. Deep imports of VitePress internals would pull in `node_modules` graphs that fail under `vue-tsc`; theme SFCs are still validated when you run **`npm run build`**. The main app's frontend package uses `vue-tsc` end-to-end; guides uses this split on purpose.

## Local preview (full detail)

```bash
cd guides
npm install
npm run dev
```

Open the URL VitePress prints (default **http://localhost:5173/guides/** with this repo's config). The main Neroli's Lab app dev server uses a different port (see `frontend/vite.config.ts`); optional **`.env`** in `guides/` can set `VITE_MAIN_DEV_ORIGIN` so header links to `/`, `/calculator`, etc. point at that origin (see `.env.example`).

## Theme (SCSS)

- **Colors:** `.vitepress/theme/tokens.scss` - CSS custom properties (`--color-*`, `--vp-c-*`).
- **Typography:** `.vitepress/theme/typography.scss` - type scale and content rules.
- **Layout / shell:** `.vitepress/theme/style.scss` - imports tokens + typography, slim nav, VitePress overrides.
  Custom Vue components should use the theme's CSS variables (for example `var(--color-primary-500)`, `var(--tracking-tight)`).

Register guide-only components in `.vitepress/theme/index.ts` (place SFCs under `.vitepress/theme/components/`).

## VitePress upgrades

After bumping `vitepress`, smoke-test the navigation and search experience on desktop and mobile, then reconcile anything below that changed upstream.

### Layout and shell

- **Forked default layout** - `theme/Layout.vue` is derived from `node_modules/vitepress/dist/client/theme-default/Layout.vue`. It wires the same default-theme building blocks (`VPBackdrop`, `VPContent`, `VPFooter`, `VPLocalNav`, `VPNav`, `VPSidebar`, `VPSkipLink`) and composables (`theme-default/composables/layout.js`, `sidebar.js`) around **GuidesSiteHeader** and Vuetify. Compare with upstream `Layout.vue` when upgrading.
- **Hidden stock navbar** - Default `VPNav` is suppressed in `_guides-site-shell.scss` in favor of the custom toolbar; **VPLocalNav** / **VPSidebar** positioning and scroll behavior are customized there too (fixed vs sticky, drawer geometry).

### Search (local)

- **Custom navbar search** - `theme/components/GuidesNavBarSearch.vue` replaces stock **`VPNavBarSearch`**: it still uses **`VPLocalSearchBox`**, **`VPNavBarSearchButton`**, and **`resolveOptionsForLanguage`** from deep imports under `vitepress/dist/client/theme-default/`, maintaining the same keyboard controls. It adds a **mobile-only** toolbar close control (`mdi-close`) when the modal is open. Verify imports and markup against `VPNavBarSearch.vue` after upgrades.
- **Teleported modal styling** - `_guides-local-search.scss` targets `body > .VPLocalSearchBox` (z-index, offset under the custom header, result styling). Class names and DOM structure can change with VitePress.
- **Section splitting** - `themeConfig.search.options.miniSearch._splitIntoSections` points at `lib/local-search-sections.ts`, which must stay aligned with VitePress's server-side `splitPageIntoSections` logic for the indexed shape to match.
- **Preamble search excerpts** - Stock `VPLocalSearchBox` only builds excerpt HTML for anchors on in-content headings; matches on `...#__preamble__` (intro before the first in-markdown heading, e.g. when `fullTitle` renders outside the markdown body) used to show empty previews. **`lib/vitepress-local-search-preamble-plugin.ts`** injects **`lib/fill-local-search-preamble-map.ts`** into upstream `VPLocalSearchBox.vue` at build time. Anchor id: **`lib/local-search-preamble-constants.ts`**. Tests: **`tests/vitepress-local-search-preamble-plugin.test.ts`** (patch + hook strings), **`tests/vitepress-local-search-upstream-invariants.test.ts`** (node bundle still has `splitPageIntoSections` / `_splitIntoSections`), **`tests/local-search-preamble-contract.test.ts`** (fragment literal). On VitePress bump failures: adjust the plugin needle/replacement or re-diff **`lib/local-search-sections.ts`** against upstream.

### Theme tokens and typings

- **`--vp-*` overrides** - `theme/vitepress-vars-overrides.scss` maps VitePress default-theme CSS variables to Neroli tokens; compare with `node_modules/vitepress/dist/client/theme-default/styles/vars.css` if variables are renamed or removed.
- **Ambient `.d.ts` shims** - Deep imports without published types are declared in `vitepress-internal-modules.d.ts` and `shims-vitepress.d.ts`. If paths or exports change, update or drop these declarations.

## Author avatars (assets)

- **Location:** **`images/avatars/`** (next to **`content/`**, not under `.vitepress`, so contributors can find PNGs without hidden folders).
- **Files:** optional square **PNG**s named `{slug}.png`, where the slug matches the slugified `author:` frontmatter name (see `theme/utils/format-utils.ts`, `getAvatarUrlForAuthorName`).
- **Size limit:** each PNG must be under **256 KiB**; enforced by **`tests/avatars.test.ts`**. **`npm run test`** catches oversize files locally; **CI** runs the same tests in `.github/workflows/build-test.yml` after **`npm run build`** for the guides job (tests are not chained into `npm run build`).

## Custom emoji shortcodes (assets + markdown)

- **Source assets:** **`images/emojis/{category}/`** - PNG, GIF, or WebP files. Authors use **`:{filename-without-extension}:`** (Discord-style). Basenames must be **unique** across categories; see **`loadGuideEmojisByName`** in **`.vitepress/lib/guide-emojis.ts`** (markdown matcher at config time).
- **Path parsing:** **`lib/guide-emoji-path-parse.ts`** is shared by **`loadGuideEmojisByName`** and **`theme/utils/guide-emoji-paths.ts`**.
- **Shared constants:** **`lib/guide-emoji-constants.ts`**. **`import.meta.glob`** in **`guide-emoji-paths.ts`** must remain a **string literal** (Vite limitation).
- **Runtime URLs:** **`guide-emoji-paths.ts`** - **`import.meta.glob(..., { query: '?url' })`** -> **`resolvedImageUrlByGlobKey`** (glob key -> URL); **`resolvedUrlByShortcodeName`** maps shortcode stem -> URL for **`<GuideEmoji>`** (markdown only passes **`name`**). No **`public/`** copy.
- **Markdown:** **`markdownItGuideEmojis`** runs **before** the stock **`emoji`** rule and emits **`<GuideEmoji name="..." />`**.
- **Prose styling:** **`.vp-doc img.guide-emoji`** in **`theme/style.scss`** sizes inline emoji in **`em`** so they track heading/body font size.
- **Catalog page:** **`content/contributing/custom-emojis.md`** embeds **`<GuideEmojiCatalog />`** (registered in **`theme/index.ts`**) to list everything under **`images/emojis/`** for contributors.

## Sidebar and content (technical summary)

The sidebar is generated at build time from the **`content/`** tree. Folders become nested groups. YAML front matter supports **`title`** (nav label), **`fullTitle`** (page H1), **`author`** (comma-separated list of names), and **`order`** (lower numbers sort earlier; ties use link order). Section folders may use **`index.md`** for the landing page and group title.

Optional Vue components can be registered in `.vitepress/theme/index.ts` and used in Markdown (for example `<GuideDemoComponent />`).

## Full-site navigation

The guides shell uses a slim top bar that links to the main Neroli's Lab app (`/`, `/calculator`, etc.). The main app links **Guides** to `/guides/` with full-page navigation so the static guides bundle loads (see the frontend router guard).

## Production build

```bash
npm run build
```

Output is in `guides/.vitepress/dist` and should be deployed to `${FRONTEND_DIR}/guides/`.

## GitHub "Edit this page"

Configured in `.vitepress/config.ts` (`themeConfig.editLink`) to point at files under `guides/` in this repository (VitePress `srcDir` is `content/`).
