---
title: Formatting
fullTitle: Markdown and page formatting
author: Tindo
order: 70
---

Guides are mostly written as **Markdown** text. This page demonstrates patterns that you can use on this site: headings, tables, callouts, custom emojis, and more.

For general Markdown syntax, the [Markdown Guide — basic syntax](https://www.markdownguide.org/basic-syntax/) is a good reference. This site also supports [VitePress Markdown features](https://vitepress.dev/guide/markdown).

## Headings and page title

The visible **page title (H1)** comes from the `fullTitle` field in the YAML [frontmatter](./#adding-a-new-page) at the top of the file, not from a `#` line in the body.

**Do not** use `#` headings in the Markdown body. Use **`##`** for main sections, **`###`** for subsections, then `####` and deeper as needed.

Example (in the built page, `##` becomes a section heading and `###` a subsection):

```markdown
## Section

### Subsection

Body text here.
```

## Subjective advice banner

To help readers distinguish between facts about game mechanics and subjective advice or recommendations, use the subjective info banner prior to subjective advice in a guide. Just add `<SubjectiveInfoBanner />` into your page and it will render like this:

<SubjectiveInfoBanner />

## Emphasis

- **Bold** with `**double asterisks**`.
- _Italic_ with `*single asterisks*` or `_underscores_`.
- `Inline code` with backticks.

## Lists

### Ordered list

1. First
2. Second

```markdown
1. First
2. Second
```

### Unordered list

- Item A
- Item B

```markdown
- Item A
- Item B
```

## Links

Put the text that should display in `[]`, followed by the link route in `()`.

| Type                         | Markdown                                                                      | Renders as                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| External site                | `[Example site](https://example.com/)`                                        | [Example site](https://example.com/)                                        |
| Another guide (same folder)  | `[Using GitHub](./using-github)`                                              | [Using GitHub](./using-github)                                              |
| Another guide (other folder) | `[Early progression](../route-01/early-progression)`                          | [Early progression](../route-01/early-progression)                          |
| Same-page heading            | `[Headings](#headings-and-page-title)`                                        | [Headings](#headings-and-page-title)                                        |
| Other file + heading         | `[Commit and PR](./using-github#commit-your-changes-and-open-a-pull-request)` | [Commit and PR](./using-github#commit-your-changes-and-open-a-pull-request) |

Heading links match heading text (lowercase, hyphens). Add `{#my-id}` on the heading line for a stable id.

## Tables

Align columns with pipes and separator dashes.

| Column A | Column B |
| -------- | -------- |
| One      | Two      |
| Three    | Four     |

```markdown
| Column A | Column B |
| -------- | -------- |
| One      | Two      |
| Three    | Four     |
```

## Blockquotes

> A blockquote uses a `>` at the start of the line. Use for quotations or aside-style emphasis. This line is a blockquote to demonstrate the appearance.
>
> For multi-line quotes, use the `>` at the start of each line, including the empty lines.

```markdown
> Quoted text
>
> Multi-line quote
```

## Callouts

**[GitHub-style alerts](https://vitepress.dev/guide/markdown#github-flavored-alerts)** are blockquotes with custom styling. To use them, write a blockquote whose first line is `[!TYPE]`, then the body on following lines. **Start every line** of the callout with `>`, just like a blockquote.

VitePress turns these into the same styled panels as demonstrated below. When previewing your page on GitHub, they will look slightly different than on the live site.

You can set a **custom title** on the opening line by adding text after the closing `]` (still on the first line of the blockquote).

| Keyword     | Use for                           |
| ----------- | --------------------------------- |
| `NOTE`      | Information readers should notice |
| `TIP`       | Helpful advice                    |
| `IMPORTANT` | Key information to succeed        |
| `WARNING`   | Urgent information. Use sparingly |

```markdown
> [!NOTE]
> A **note** contains neutral information readers should see.

> [!TIP] Custom Title
> Here's a **tip**! This one has a custom title.

> [!IMPORTANT]
> Example of **important** information readers need to achieve their goal.

> [!WARNING]
> Example of a **warning** featuring urgent information that needs attention now.
```

> [!NOTE]
> A **note** contains neutral information readers should see.

> [!TIP] Custom Title
> Here's a **tip**! This one has a custom title.

> [!IMPORTANT]
> Example of **important** information readers need to achieve their goal.

> [!WARNING]
> Example of a **warning** featuring urgent information that needs attention now.

## Expandable sections

Expandable sections for details that some readers may prefer to skip.

When previewing your edits on GitHub, these will NOT work and will display as raw text. This is fine!

**Titles:** Add an optional custom title after `details` on the opening line.

```markdown
::: details
Collapsed until the reader expands it.
:::

::: details Custom summary line
Example body when expanded.
:::
```

::: details
Collapsed until the reader expands it.
:::

::: details Custom summary line
Example body when expanded.
:::

## Images

Use standard Markdown (store files under a sensible folder, e.g. next to your guide):

```markdown
![Short description of the image](images/example.png)
```

## Horizontal rule

`---` when used outside of the frontmatter creates a dividing line like the following.

---

Be sure to leave an empty line above and below it.

## Custom emoji shortcodes

Small inline images (berries, reactions, ingredients, etc.) can be added with **`:name:`**, just like in Discord. Here's the [full catalog of available emojis](./custom-emojis). Have fun!
