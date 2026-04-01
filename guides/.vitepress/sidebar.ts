import { globSync } from 'glob';
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import type { DefaultTheme } from 'vitepress';

function extractTitle(absolutePath: string, relativePath: string): string {
  try {
    const content = readFileSync(absolutePath, 'utf-8');
    const front = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (front) {
      const titleLine = front[1].match(/^\s*title:\s*(.+)\s*$/m);
      if (titleLine) {
        return titleLine[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // fall through
  }
  const base = basename(relativePath, '.md');
  if (base === 'index') {
    return dirname(relativePath) === '.' ? 'Overview' : dirname(relativePath);
  }
  return base
    .split(/[-_/]/g)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function mdPathToLink(relativePath: string): string {
  if (relativePath === 'index.md') {
    return '/';
  }
  const withoutMd = relativePath.replace(/\.md$/, '');
  if (withoutMd.endsWith('/index')) {
    return `/${withoutMd.slice(0, -'/index'.length)}/`;
  }
  return `/${withoutMd}`;
}

export function buildSidebar(guidesRoot: string): DefaultTheme.SidebarItem[] {
  const files = globSync('**/*.md', {
    cwd: guidesRoot,
    ignore: ['**/node_modules/**', '**/.vitepress/**']
  });

  const items: DefaultTheme.SidebarItem[] = files
    .map((relative) => ({
      relative,
      link: mdPathToLink(relative),
      text: extractTitle(join(guidesRoot, relative), relative)
    }))
    .sort((a, b) => a.link.localeCompare(b.link));

  return [
    {
      text: 'Guides',
      items
    }
  ];
}
