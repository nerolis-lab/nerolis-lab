import { readFileSync } from 'node:fs';

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

/**
 * VitePress local search only indexes text that appears after the first heading in the rendered HTML.
 * Guides use `fullTitle` for the visible H1 and start the body with paragraphs, so intros were missing from the index. This yields a synthetic section for that preamble using frontmatter `title` as the label.
 */
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
      anchor: '__preamble__',
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
