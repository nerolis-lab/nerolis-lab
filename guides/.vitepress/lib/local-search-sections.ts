import { readFileSync } from 'node:fs';
import { LOCAL_SEARCH_PREAMBLE_ANCHOR } from './local-search-preamble-constants';

/**
 * Custom splitter for VitePress local search (`themeConfig.search.options.miniSearch._splitIntoSections`).
 *
 * **Preamble label from markdown:** We read `title:` or `fullTitle:` as a single line of plain text
 * (simple `key: value` rows). Anything else—multiline YAML, `|`, quotes spanning lines, etc.—is not
 * handled. If the file cannot be read, the preamble is still indexed with an empty `titles` array.
 *
 * **Maintenance:** Matches VitePress `splitPageIntoSections`; compare when upgrading VitePress.
 * Do not add the `g` flag to `headingContentRegex` (would break `exec` in the loop).
 */

// mirrors vitepress/dist/node localSearchPlugin.splitPageIntoSections (alpha.17); keeps i += 3 split shape
const headingRegex = /<h(\d*).*?>(.*?<a.*? href="#.*?".*?>.*?<\/a>)<\/h\1>/gi;
const headingContentRegex = /(.*)<a.*? href="#(.*?)".*?>.*?<\/a>/i;

function clearHtmlTags(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

function getSearchableText(content: string): string {
  return clearHtmlTags(content);
}

function readMarkdownTitle(filePath: string): string | undefined {
  try {
    const raw = readFileSync(filePath, 'utf-8');
    const front = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!front) {
      return;
    }
    const block = front[1];
    const titleLine = block.match(/^\s*title:\s*(.+)\s*$/m);
    const fullTitleLine = block.match(/^\s*fullTitle:\s*(.+)\s*$/m);
    const pick = titleLine ?? fullTitleLine;
    if (!pick) {
      return;
    }
    return pick[1].trim().replace(/^["']|["']$/g, '');
  } catch {
    return;
  }
}

/** Yields search sections; adds a synthetic preamble section when body text precedes the first heading (see file comment). */
export function* splitIntoSectionsForLocalSearch(
  file: string,
  html: string
): Generator<{
  anchor: string;
  titles: string[];
  text: string;
}> {
  const result = html.split(headingRegex);
  const preambleHtml = result[0] ?? '';
  const preambleText = getSearchableText(preambleHtml).trim();
  if (preambleText.length > 0) {
    const docTitle = readMarkdownTitle(file);
    yield {
      anchor: LOCAL_SEARCH_PREAMBLE_ANCHOR,
      titles: docTitle ? [docTitle] : [],
      text: preambleText
    };
  }

  result.shift();
  let parentTitles: string[] = [];
  for (let i = 0; i < result.length; i += 3) {
    const level = Number.parseInt(result[i], 10) - 1;
    const heading = result[i + 1];
    const headingResult = headingContentRegex.exec(heading);
    const title = clearHtmlTags(headingResult?.[1] ?? '').trim();
    const anchor = headingResult?.[2] ?? '';
    const content = result[i + 2];
    if (!title || !content) {
      continue;
    }
    let titles = parentTitles.slice(0, level);
    titles[level] = title;
    titles = titles.filter(Boolean);
    yield { anchor, titles, text: getSearchableText(content) };
    if (level === 0) {
      parentTitles = [title];
    } else {
      parentTitles[level] = title;
    }
  }
}
