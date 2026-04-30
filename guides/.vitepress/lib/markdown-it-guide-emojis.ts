import type MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token.mjs';
import type { GuideEmojiEntry } from './guide-emojis';
import { buildGuideEmojiReplacerRegex } from './guide-emojis';

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function replaceAt<T>(items: T[], index: number, replacements: T[]): T[] {
  return items.slice(0, index).concat(replacements, items.slice(index + 1));
}

function markdownTextToken(content: string, level: number): Token {
  const token = new Token('text', '', 0);
  token.content = content;
  token.level = level;
  return token;
}

function guideEmojiHtmlToken(shortcodeName: string, level: number): Token {
  const token = new Token('html_inline', '', 0);
  token.content = `<GuideEmoji name="${escapeHtmlAttr(shortcodeName)}" />`;
  token.level = level;
  return token;
}

function tokenizeTextWithGuideEmojis(
  sourceText: string,
  nestingLevel: number,
  registry: ReadonlyMap<string, GuideEmojiEntry>,
  shortcodePattern: RegExp
): Token[] {
  const out: Token[] = [];
  let sliceStart = 0;
  let match: RegExpExecArray | null;

  shortcodePattern.lastIndex = 0;
  while ((match = shortcodePattern.exec(sourceText)) !== null) {
    if (match.index > sliceStart) {
      out.push(markdownTextToken(sourceText.slice(sliceStart, match.index), nestingLevel));
    }

    const shortcodeName = match[1];
    if (registry.get(shortcodeName) === undefined) {
      throw new Error(`guide emoji registry out of sync: :${shortcodeName}:`);
    }

    out.push(guideEmojiHtmlToken(shortcodeName, nestingLevel));
    sliceStart = match.index + match[0].length;
  }

  if (sliceStart < sourceText.length) {
    out.push(markdownTextToken(sourceText.slice(sliceStart), nestingLevel));
  }

  return out;
}

function rewriteInlineChildrenWithGuideEmojis(
  inlineBlock: Token,
  registry: ReadonlyMap<string, GuideEmojiEntry>,
  shortcodePattern: RegExp
): void {
  let children = inlineBlock.children;
  if (!children) {
    return;
  }

  for (let childIndex = children.length - 1; childIndex >= 0; childIndex--) {
    const child = children[childIndex];
    if (child.type !== 'text' || !child.content) {
      continue;
    }

    shortcodePattern.lastIndex = 0;
    if (!shortcodePattern.test(child.content)) {
      continue;
    }

    const replacementTokens = tokenizeTextWithGuideEmojis(child.content, child.level, registry, shortcodePattern);

    inlineBlock.children = children = replaceAt(children, childIndex, replacementTokens);
  }
}

type MarkdownItCore = Pick<MarkdownIt, 'core'>;

export function markdownItGuideEmojis(
  md: MarkdownItCore,
  options: {
    emojis: ReadonlyMap<string, GuideEmojiEntry>;
  }
): void {
  const registry = options.emojis;
  if (registry.size === 0) {
    return;
  }

  const shortcodePattern = buildGuideEmojiReplacerRegex(registry.keys());

  md.core.ruler.before('emoji', 'guide-emojis', (state) => {
    for (const token of state.tokens) {
      if (token.type !== 'inline') {
        continue;
      }
      rewriteInlineChildrenWithGuideEmojis(token, registry, shortcodePattern);
    }
  });
}
