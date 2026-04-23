/**
 * URL fragment for the synthetic "intro before first heading" local-search section.
 *
 * Index ids look like `/guides/path/to/page#__preamble__`. The server indexer
 * (`splitIntoSectionsForLocalSearch`) and the client excerpt map
 * (`fillLocalSearchPreambleMapFromPageRoot`) must use this exact string; the Vite
 * transform does not hard-code it.
 */
export const LOCAL_SEARCH_PREAMBLE_ANCHOR = '__preamble__' as const;
