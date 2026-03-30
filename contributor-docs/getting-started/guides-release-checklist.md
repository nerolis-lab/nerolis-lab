# Guides Release Checklist

Use this checklist before releasing changes that affect public guides.

## Routing & Navigation

- [ ] `/guides/` loads successfully on the production domain.
- [ ] The main site navigation includes a Guides entry.
- [ ] Deep links (for example `/guides/sleep-basics`) resolve correctly.

## Build & Deploy

- [ ] `guides` build artifact is generated in CI.
- [ ] Guides artifact is deployed under `${FRONTEND_DIR}/guides/`.
- [ ] Contributor docs deployment still targets `${DOCS_DIR}`.

## Content Quality

- [ ] Starter pages are linked correctly.
- [ ] No broken internal links in guides pages.
- [ ] Styling is acceptable for this phase and tracked follow-up issues exist for full UI parity.
