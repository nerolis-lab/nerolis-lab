import { LOCAL_SEARCH_PREAMBLE_ANCHOR } from './local-search-preamble-constants';

/**
 * Fills the per-anchor HTML map VPLocalSearchBox uses for detailed-search excerpts.
 *
 * Stock VitePress only records content after each heading. The indexer can emit a section
 * with anchor LOCAL_SEARCH_PREAMBLE_ANCHOR for prose before the first in-markdown heading;
 * this function supplies matching HTML so previews are not blank.
 *
 * Call after the headings.forEach excerpt loop, before app.unmount(), on the same mount div.
 */
export function fillLocalSearchPreambleMapFromPageRoot(root: HTMLElement, map: Map<string, string>): void {
  const firstHeading = root.querySelector('h1, h2, h3, h4, h5, h6');

  // No headings: treat the whole mounted fragment as one block (matches indexer behavior
  // when the page is only paragraphs/lists).
  if (!firstHeading) {
    const html = root.innerHTML.trim();
    if (html.length > 0) {
      map.set(LOCAL_SEARCH_PREAMBLE_ANCHOR, html);
    }
    return;
  }

  // Walk previousElementSibling from the first heading: same nodes as appear before the first
  // <h*> in the markdown HTML string on the server. Do not use root.firstElementChild — the
  // heading usually sits inside a .vp-doc wrapper, so the wrapper would be mistaken for "all
  // preamble" and the entire page would be serialized into one excerpt.
  const parts: string[] = [];
  let prior: Element | null = firstHeading.previousElementSibling;
  while (prior) {
    parts.push(prior.outerHTML);
    prior = prior.previousElementSibling;
  }
  parts.reverse();

  const trimmed = parts.join('').trim();
  if (trimmed.length > 0) {
    map.set(LOCAL_SEARCH_PREAMBLE_ANCHOR, trimmed);
  }
}
