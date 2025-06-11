import { existsSync, readFileSync } from 'fs';
import { globby } from 'globby';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

const DOCS_DIR = process.cwd();

function extractMarkdownLinks(content: string): Array<{ text: string; url: string; line: number }> {
  const links: Array<{ text: string; url: string; line: number }> = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Match [text](url) format
    const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
    for (const match of linkMatches) {
      links.push({
        text: match[1],
        url: match[2],
        line: index + 1
      });
    }

    // Match reference-style links [text]: url
    const refMatches = line.matchAll(/^\s*\[([^\]]+)\]:\s*(.+)$/g);
    for (const match of refMatches) {
      links.push({
        text: match[1],
        url: match[2],
        line: index + 1
      });
    }
  });

  return links;
}

function fileExists(path: string): boolean {
  const fullPath = path.startsWith('/') ? join(DOCS_DIR, path.slice(1)) : join(DOCS_DIR, path);
  return existsSync(fullPath);
}

describe('Documentation Links', () => {
  it('should have valid internal links across all markdown files', async () => {
    const markdownFiles = await globby(['**/*.md'], {
      cwd: DOCS_DIR,
      ignore: ['node_modules/**/*']
    });

    const brokenLinks: Array<{ file: string; link: string; line: number; reason: string }> = [];

    for (const file of markdownFiles) {
      const filePath = join(DOCS_DIR, file);
      const content = readFileSync(filePath, 'utf-8');
      const links = extractMarkdownLinks(content);

      for (const link of links) {
        const { url, line } = link;

        // Skip external links (http/https)
        if (url.startsWith('http://') || url.startsWith('https://')) {
          continue;
        }

        // Skip email links
        if (url.startsWith('mailto:')) {
          continue;
        }

        // Skip anchors (for now - could be enhanced to validate these too)
        if (url.startsWith('#')) {
          continue;
        }

        // Check relative links
        if (url.startsWith('./') || url.startsWith('../')) {
          const basePath = file.split('/').slice(0, -1).join('/');
          let resolvedPath = url.startsWith('./') ? join(basePath, url.slice(2)) : join(basePath, url);

          // Remove anchor fragments for file existence check
          const pathWithoutAnchor = resolvedPath.split('#')[0];

          // For VitePress, if no .md extension, add it
          if (!pathWithoutAnchor.endsWith('.md') && !pathWithoutAnchor.includes('.')) {
            resolvedPath = pathWithoutAnchor + '.md';
          } else {
            resolvedPath = pathWithoutAnchor;
          }

          if (!fileExists(resolvedPath)) {
            brokenLinks.push({
              file,
              link: url,
              line,
              reason: `Relative link points to non-existent file: ${resolvedPath}`
            });
          }
        }

        // Check absolute links (starting with /)
        else if (url.startsWith('/')) {
          let resolvedPath = url;

          // Remove anchor fragments for file existence check
          const pathWithoutAnchor = resolvedPath.split('#')[0];

          // For VitePress, if no .md extension, add it
          if (!pathWithoutAnchor.endsWith('.md') && !pathWithoutAnchor.includes('.') && pathWithoutAnchor !== '/') {
            resolvedPath = pathWithoutAnchor + '.md';
          } else {
            resolvedPath = pathWithoutAnchor;
          }

          if (!fileExists(resolvedPath)) {
            brokenLinks.push({
              file,
              link: url,
              line,
              reason: `Absolute link points to non-existent file: ${resolvedPath}`
            });
          }
        }

        // Check links without explicit path (assume same directory)
        else if (!url.includes('/')) {
          const basePath = file.split('/').slice(0, -1).join('/');
          let resolvedPath = join(basePath, url);

          // Remove anchor fragments for file existence check
          const pathWithoutAnchor = resolvedPath.split('#')[0];

          // For VitePress, if no .md extension, add it
          if (!pathWithoutAnchor.endsWith('.md') && !pathWithoutAnchor.includes('.')) {
            resolvedPath = pathWithoutAnchor + '.md';
          } else {
            resolvedPath = pathWithoutAnchor;
          }

          if (!fileExists(resolvedPath)) {
            brokenLinks.push({
              file,
              link: url,
              line,
              reason: `Same-directory link points to non-existent file: ${resolvedPath}`
            });
          }
        }
      }
    }

    if (brokenLinks.length > 0) {
      const errorMessage = brokenLinks
        .map((link) => `${link.file}:${link.line} - ${link.link} (${link.reason})`)
        .join('\n');

      expect.fail(`Found ${brokenLinks.length} broken internal links:\n${errorMessage}`);
    }
  });

  it('should have consistent navigation structure', () => {
    const configPath = join(DOCS_DIR, '.vitepress', 'config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // Check that navigation items exist as files
    const navMatches = configContent.match(/link:\s*['"`]([^'"`]+)['"`]/g);
    if (navMatches) {
      for (const match of navMatches) {
        const linkMatch = match.match(/link:\s*['"`]([^'"`]+)['"`]/);
        if (linkMatch) {
          const link = linkMatch[1];

          // Skip external links
          if (link.startsWith('http://') || link.startsWith('https://')) {
            continue;
          }

          // For internal links, check if the corresponding .md file exists
          if (link.startsWith('/')) {
            let mdPath: string;
            if (link === '/') {
              mdPath = '/index.md';
            } else if (link.endsWith('/')) {
              // Handle directory links like /components/ -> /components/index.md
              mdPath = `${link}index.md`;
            } else if (link.endsWith('.md')) {
              mdPath = link;
            } else {
              mdPath = `${link}.md`;
            }
            expect(fileExists(mdPath)).toBe(true);
          }
        }
      }
    }
  });
});
