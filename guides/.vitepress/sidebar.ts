import { globSync } from 'glob';
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import type { DefaultTheme } from 'vitepress';

interface FileEntry {
  relative: string;
  link: string;
  text: string;
  order?: number;
}

interface TreeNode {
  index?: FileEntry;
  pages: FileEntry[];
  subdirs: Map<string, TreeNode>;
}

function stripLeadingBom(content: string): string {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

function readMdMeta(absolutePath: string, relativePath: string): Pick<FileEntry, 'text' | 'order'> {
  try {
    const content = stripLeadingBom(readFileSync(absolutePath, 'utf-8'));
    const front = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (front) {
      const block = front[1];
      const titleLine = block.match(/^\s*title:\s*(.+)\s*$/m);
      const orderLine = block.match(/^\s*order:\s*(\d+)\s*$/m);
      const orderParsed = orderLine ? Number.parseInt(orderLine[1], 10) : undefined;
      const order = orderParsed !== undefined && !Number.isNaN(orderParsed) ? orderParsed : undefined;
      const text = titleLine ? titleLine[1].trim().replace(/^["']|["']$/g, '') : fallbackTitle(relativePath);
      return order !== undefined ? { text, order } : { text };
    }
  } catch {
    // fall through
  }
  return { text: fallbackTitle(relativePath) };
}

function fallbackTitle(relativePath: string): string {
  const base = basename(relativePath, '.md');
  if (base === 'index') {
    if (dirname(relativePath) === '.') {
      return 'Overview';
    }
    return titleCaseSegment(dirname(relativePath));
  }
  return base
    .split(/[-_/]/g)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function titleCaseSegment(segment: string): string {
  return segment
    .split(/[-_/]/g)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function mdPathToLink(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, '/');
  if (normalized === 'index.md') {
    return '/';
  }
  const withoutMd = normalized.replace(/\.md$/, '');
  if (withoutMd.endsWith('/index')) {
    return `/${withoutMd.slice(0, -'/index'.length)}/`;
  }
  return `/${withoutMd}`;
}

function dirSegmentsFromRelative(relativePath: string): string[] {
  const normalized = relativePath.replace(/\\/g, '/');
  const dir = dirname(normalized);
  if (dir === '.') {
    return [];
  }
  return dir.split('/').filter(Boolean);
}

function baseNameFromRelative(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, '/');
  return basename(normalized, '.md');
}

function insertFile(root: TreeNode, file: FileEntry): void {
  const parts = dirSegmentsFromRelative(file.relative);
  let node = root;
  for (const seg of parts) {
    if (!node.subdirs.has(seg)) {
      node.subdirs.set(seg, { pages: [], subdirs: new Map() });
    }
    node = node.subdirs.get(seg) as TreeNode;
  }
  if (baseNameFromRelative(file.relative) === 'index') {
    node.index = file;
  } else {
    node.pages.push(file);
  }
}

function minOrderInSubtree(node: TreeNode): number {
  let min = Number.POSITIVE_INFINITY;
  if (node.index?.order !== undefined) {
    min = Math.min(min, node.index.order);
  }
  for (const p of node.pages) {
    if (p.order !== undefined) {
      min = Math.min(min, p.order);
    }
  }
  for (const child of node.subdirs.values()) {
    min = Math.min(min, minOrderInSubtree(child));
  }
  return min;
}

function groupSortKey(node: TreeNode, segment: string): [number, string] {
  const order = node.index?.order ?? minOrderInSubtree(node);
  return [order, segment];
}

type FlatEntry = { kind: 'page'; entry: FileEntry } | { kind: 'group'; segment: string; node: TreeNode };

function collectFlatEntries(node: TreeNode, isRoot: boolean): FlatEntry[] {
  const out: FlatEntry[] = [];
  if (isRoot && node.index) {
    out.push({ kind: 'page', entry: node.index });
  }
  for (const p of node.pages) {
    out.push({ kind: 'page', entry: p });
  }
  for (const [segment, child] of node.subdirs) {
    out.push({ kind: 'group', segment, node: child });
  }
  return out;
}

function compareFlat(a: FlatEntry, b: FlatEntry): number {
  const orderA = a.kind === 'page' ? (a.entry.order ?? Number.POSITIVE_INFINITY) : groupSortKey(a.node, a.segment)[0];
  const orderB = b.kind === 'page' ? (b.entry.order ?? Number.POSITIVE_INFINITY) : groupSortKey(b.node, b.segment)[0];
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  const linkA = a.kind === 'page' ? a.entry.link : a.segment;
  const linkB = b.kind === 'page' ? b.entry.link : b.segment;
  return linkA.localeCompare(linkB);
}

function groupToSidebarItem(segment: string, node: TreeNode): DefaultTheme.SidebarItem {
  const childItems = treeToSidebarItems(node, false);
  const text = node.index?.text ?? titleCaseSegment(segment);
  const item: DefaultTheme.SidebarItem = {
    text,
    items: childItems.length > 0 ? childItems : undefined
  };
  if (node.index) {
    item.link = node.index.link;
  }
  return item;
}

function treeToSidebarItems(node: TreeNode, isRoot: boolean): DefaultTheme.SidebarItem[] {
  const flat = collectFlatEntries(node, isRoot);
  flat.sort(compareFlat);
  return flat.map((entry) => {
    if (entry.kind === 'page') {
      return { text: entry.entry.text, link: entry.entry.link };
    }
    return groupToSidebarItem(entry.segment, entry.node);
  });
}

export function buildSidebar(guidesRoot: string): DefaultTheme.SidebarItem[] {
  const files = globSync('**/*.md', {
    cwd: guidesRoot,
    ignore: ['**/node_modules/**', '**/.vitepress/**']
  });

  const root: TreeNode = { pages: [], subdirs: new Map() };

  for (const relative of files) {
    const absolute = join(guidesRoot, relative);
    const meta = readMdMeta(absolute, relative);
    const entry: FileEntry = {
      relative,
      link: mdPathToLink(relative),
      text: meta.text,
      order: meta.order
    };
    insertFile(root, entry);
  }

  const items = treeToSidebarItems(root, true);

  return [
    {
      text: 'Guides',
      items
    }
  ];
}
