---
title: Guides overview
---

# Pokémon Sleep guides

Welcome to Neroli's Lab guides. These pages explain game mechanics and how we model them in the app.

<GuideDemoBanner />

## Getting started

- [Sleep basics](./sleep-basics/) — sleep sessions and scoring (sample page)

## Format preview

Examples for contributors: headings, prose, tables, quotes, code, and VitePress blocks. Use this page as a visual reference when writing or reviewing guides—compare spacing, weights, and colors against the main app where it matters. The sections below walk through each heading level and common markdown patterns so you can spot regressions quickly.

::: tip Sample — h1 (page title)

The single `#` line at the top of a guide file is the **only h1** on the page (here: “Pokémon Sleep guides”). It uses the page-title typography (36px). Do not add extra `#` headings in the same document; use `##` and below for structure.

:::

::: info Sample — h2 (major sections)

Lines starting with `##` render as **h2** (24px in this theme). Examples on this page include **Format preview** and **Demo: second-level heading** below. Prefer `##` for top-level sections inside an article so the outline and “On this page” stay clear.

:::

## Demo: second-level heading (h2)

This block is a second `##` section so you can compare two h2s on one page: same size and weight, different text length. Major sections should usually start with a short lead sentence, then one or two fuller paragraphs that explain scope, assumptions, and where to read next. Longer copy here helps you judge line length, margin rhythm, and how h2 sits against following h3s without scrolling through the whole Lorem section later on.

Add another sentence or two when you need to see how **strong** emphasis and `inline code` look in running text under an h2 before the next subsection. Links like [Sleep basics](./sleep-basics/) should remain readable and tappable in context.

### Third-level heading (h3)

Body text is 16px with **strong**, _emphasis_, `inline code`, and [relative links](./sleep-basics/). Third-level headings mark subsections inside an h2; they are slightly smaller than h2 but still clearly above body. When you stack paragraphs here, check that list items and code blocks below still align with the prose rhythm and that heading color (`--color-neutral-100`) reads clearly on the page background.

Use a second paragraph under h3 when you want to preview how consecutive blocks of body copy behave—especially when the next element is a table, quote, or fenced code block rather than another heading.

#### Fourth-level heading (h4)

At 18px and medium weight, h4 sits between h3 and body. It is useful for fine-grained structure inside a long subsection. Contributors rarely need h4 in Neroli’s Lab docs, but VitePress allows it, so the theme styles it explicitly. A bit more text here lets you see wrapping and anchor alignment on narrow viewports.

If your guide uses h4, keep the title short; put nuance in the following paragraph so the outline stays scannable.

##### Fifth-level heading (h5)

Also 18px; semibold (600) versus h4’s 500. h5 and h6 share `--tracking-wide` so they still read as titles rather than bold body text. This paragraph is intentionally longer so you can compare line height and spacing against the h4 block above and the h6 block below.

###### Sixth-level heading (h6)

At 16px (same as body size) with semibold weight and wide tracking, h6 is the deepest heading style. Use it sparingly—often a bold lead-in or list is clearer. Extra sentences here show how an h6 looks when followed by more than one line of body text before a blockquote or list, which is how many real pages will look if someone does use h6.

> Blockquote: use for citations, callouts, or quoted instructions.

---

| Mechanic         | Notes                 |
| ---------------- | --------------------- |
| Sleep score      | 0–100 per session     |
| Helper frequency | Seconds between helps |

```ts
// Fenced code block (custom block body uses body size; code uses code size)
export const example = (): number => 42;
```

- Unordered list item
- Another item
  - Nested item

1. Ordered step one
2. Ordered step two

<div class="caption">Caption class — figures or table titles.</div>

<div class="fine-print">Fine-print class — disclaimers or meta notes.</div>

<small>HTML small element.</small>

::: tip
Tip: helpful asides for readers.
:::

::: info
Info: neutral supplementary detail.
:::

::: warning
Warning: things that can surprise or break assumptions.
:::

::: details Click to expand
Details blocks hide longer content until opened.
:::

## Sample sections for outline navigation with a really long header even longer

Use the “On this page” control (mobile) or the right-hand outline (wide layouts) to jump between these headings.

### Lorem — short paragraph

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi.

Fusce convallis metus id felis luctus adipiscing. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum.

### Lorem — list and more text

Quis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

- Excepteur sint occaecat cupidatat non proident
- Sunt in culpa qui officia deserunt mollit anim id est laborum
- Duis aute irure dolor in reprehenderit in voluptate
- Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit
- Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem

Integer vitae justo eget magna fermentum iaculis eu non diam phasellus. Id aliquet lectus proin nibh nisl condimentum id venenatis. Proin libero nunc consequat interdum varius sit amet mattis vulputate. Enim ut tellus elementum sagittis vitae et leo duis. Viverra vitae congue eu consequat ac felis donec et odio. At varius vel pharetra vel turpis nunc eget lorem. Ultrices neque ornare aenean euismod elementum nisi quis eleifend quam. Massa vitae tortor condimentum lacinia quis vel eros donec ac odio.

Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue.

## Another top-level section

Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.

Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi. Sed lectus. Donec leo, vivamus fermentum nibh in augue praesent a lacus at urna congue rutrum.

Mauris nibh felis, adipiscing varius, adipiscing in, lacinia vel, tellus. Suspendisse ac urna. Etiam pellentesque mauris ut lectus. Nunc tellus ante, mattis eget, gravida vitae, ultricies ac, leo. Integer leo pede, ornare a, lacinia eu, vulputate vel, nisl. Suspendisse mauris. Fusce accumsan mollis eros. Pellentesque a diam. Maecenas sed diam eget risus varius blandit sit amet non magna. Cras mattis consectetur purus sit amet fermentum.

### Nested topic A

Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.

Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima.

Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Nested topic B

Maecenas sed diam eget risus varius blandit sit amet non magna. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam id dolor id nibh ultricies vehicula ut id elit.

Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean lacinia bibendum nulla sed consectetur. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.

Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Curabitur blandit tempus porttitor. Nullam quis risus eget urna mollis ornare vel eu leo. Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quis risus eget urna mollis ornare vel eu leo.

## Final stretch

Etiam porta sem malesuada magna mollis euismod. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean lacinia bibendum nulla sed consectetur.

Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Curabitur blandit tempus porttitor. Nullam quis risus eget urna mollis ornare vel eu leo. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.

Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

Sed posuere consectetur est at lobortis. Nulla vitae elit libero, a pharetra augue. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam id dolor id nibh ultricies vehicula ut id elit.

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam. Pellentesque ut neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. In ac felis quis tortor malesuada pretium. Pellentesque auctor neque nec urna.
