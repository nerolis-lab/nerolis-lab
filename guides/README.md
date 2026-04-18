# Guides

These pages are **player-facing documentation** for Pokémon Sleep. They ship with the main site under **`/guides/`**.

You do **not** need to be a developer to contribute. Most changes are plain **Markdown** in the **`content/`** folder (next to this README). If you've used formatting in Discord or a wiki, you've used Markdown before!

## Editing an existing page

The easiest path is the site itself: open the guide in your browser, scroll to the bottom, and use **Edit this page on GitHub**. That link opens the correct file in this repository so you can propose changes in a pull request.

You’ll need a GitHub account. If it's your first time, GitHub will walk you through forking and opening a PR from your fork.

## Adding a new page

New guides are **Markdown files** under **`content/`**. The URL and sidebar follow the folder layout, so pick (or create) a folder that matches the topic.

At the top of each file, YAML "frontmatter" sets how the page appears in the sidebar. Below that comes the Markdown body: **one** `#` heading for the page title, then `##` / `###` for subsections.

Frontmatter structure:

- **`title`** — Label for the sidebar and top bar header. Keep it short.
- **`order`** — Lower values sort earlier among pages in the same folder. Start with **increments of 10** (10, 20, 30…) to leave room to slot pages in later without renumbering everything.

Example structure:

```markdown
---
title: Page Title
order: 10
---

# Your full page title

A short introduction.

## First section

Write your guide!
```

### Folders and `index.md`

- **`content/index.md`** — Home of the guides (`/guides/`).
- **`content/<topic>/index.md`** — Landing page for that **section** (for example `/guides/<topic>/`). The section’s name in the sidebar comes from the **`title`** in that `index.md`. You can add more `.md` files beside it; those show up as separate pages under the same section.

If you are unsure where a new page should live, open an issue or ask in Discord—maintainers can help with structure.

## Formatting with Markdown

Use normal Markdown for headings, lists, links, and tables. The [Markdown Guide — basic syntax](https://www.markdownguide.org/basic-syntax/) explains common options. [VitePress Markdown extensions](https://vitepress.dev/guide/markdown) (tips, code blocks, etc.) work here too.

Every page should have **exactly one** top-level heading: a single `#` line (one H1). Use `##` and `###` for sections inside the page.

## Using banners

To use a banner in a page, simply invoke it with `<BannerName />`.

Currently the only banner available is the SubjectiveInfoBanner.

## Previewing your changes (optional)

If you have [Node.js](https://nodejs.org/) installed, you can run the guides site on your machine:

```bash
cd guides
npm install
npm run dev
```

Then open the URL shown in the terminal (often something like `http://localhost:5173/guides/`). You do not have to do this to submit edits; maintainers can verify the build.

## Developers and maintainers

For **scripts, tests, the theme, build output, and repo layout**, see **[DEVELOPMENT.md](./DEVELOPMENT.md)** in this folder.
