---
title: Contributing
fullTitle: Contributing and Writing Guides
author: Tindo
order: 900
---

Spotted something you can improve? Have an idea for a new guide? We welcome community contributions! :love:

Most guides are written as plain **Markdown**. If you've used formatting in Discord or a wiki, you've used Markdown before! You do not need to be a developer to contribute.

## Editing an existing page :note:

The easiest way is through the site itself: open the guide in your browser, scroll to the bottom, and click `Edit this page on GitHub`. That link opens the correct file in GitHub so you can propose changes directly from your browser.

You'll need a (free) GitHub account. If it's your first time, GitHub will walk you through forking and opening a pull request (PR) from your fork. Then Neroli's Lab maintainers will review your proposed change.

## Adding a new page :muscle:

New guides are Markdown files under **`content/`**. The URL and sidebar follow the folder layout, so pick (or create) a folder that matches the topic.

At the top of each file, YAML "frontmatter" sets how the page appears in the sidebar. Below that comes the Markdown body. The main header `#` is reserved for the frontmatter, and `##` / `###` and other smaller headings can be used for subsections.

Frontmatter structure:

- **`title`** - Label for the sidebar and top bar header. Keep it short.
- **`fullTitle`** - The main heading (H1) shown at the top of the page. This may be longer than the `title`.
- **`author`** - Comma-separated list of author names.
- **`order`** - Lower values sort earlier among pages in the same folder. Start with **increments of 10** (10, 20, 30...) to leave room to slot pages in later without renumbering everything.

Example structure:

```markdown
---
title: Page Title
fullTitle: Your Full Page Title for Readers
author: Example, Contributor
order: 10
---

A short introduction.

## First section

Write your guide!
```

### Folders and `index.md`

- **`content/index.md`** - Home of the guides (`/guides/`).
- **`content/<topic>/index.md`** - Landing page for that **section** (for example, you're reading `/guides/contributing/index.md` right now). The section's name in the sidebar comes from the **`title`** in that `index.md`. You can add more `.md` files beside it; those show up as separate pages under the same section.

If you are unsure where a new page should live, open an issue or ask in Discord; maintainers can help with structure.

## Formatting with Markdown

Use normal Markdown for headings, lists, links, and tables. The [Markdown Guide - basic syntax](https://www.markdownguide.org/basic-syntax/) explains common options. [VitePress Markdown extensions](https://vitepress.dev/guide/markdown) (tips, code blocks, etc.) work here too.

The top level `#` is defined in the frontmatter as `fullTitle`. **Do not** use additional `#` top-level headings. Use `##`, `###`, and smaller headings for sections inside the page.

## Author avatars

You can optionally add a square PNG avatar in **`images/avatars/`** to be displayed automatically on pages you contribute to (when your name is listed in the `author` frontmatter). Name the file the same as your author name, with accents removed and any number of non-alphanumeric characters replaced with `-`. If you need help determining the correct file name, just ask in the Neroli's Lab Discord server!

The table below demonstrates how author names map to file names.

| Author name (`author` frontmatter) | Avatar PNG file (`images/avatars/`) |
| ---------------------------------- | ----------------------------------- |
| Example Author One                 | `example-author-one.png`            |
| José                               | `jose.png`                          |
| Neroli's Lab Team                  | `neroli-s-lab-team.png`             |
| Jane Q. Contributor                | `jane-q-contributor.png`            |

## Custom emoji shortcodes :yay:

Small inline images (berries, reactions, ingredients, etc.) can be added with **`:name:`**, just like in Discord. Here's the [full catalog of available emojis](./custom-emojis). Have fun!

## Using banners

To use a banner in a page, simply invoke it with `<BannerName />`.

| Banner               | Purpose                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| SubjectiveInfoBanner | Identify the following content as subjective advice or recommendations. |

## Previewing your changes (optional)

If you have [Node.js](https://nodejs.org/) installed, you can run the guides site on your machine:

```bash
cd guides
npm install
npm run dev
```

Then open the URL shown in the terminal (something like `http://localhost:5173/guides/`). You do not have to do this to submit edits; maintainers can verify the build.

## Developers and maintainers

For **scripts, tests, the theme, build output, and repo layout**, see **[DEVELOPMENT.md](https://github.com/nerolis-lab/nerolis-lab/blob/main/guides/DEVELOPMENT.md)** in the guides package (same file linked from **`guides/README.md`** on GitHub).
