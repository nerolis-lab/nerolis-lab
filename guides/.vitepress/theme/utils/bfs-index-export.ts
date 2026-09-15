import { formatBfsIndex, rangeColor, type BfsIndexRow } from '../../lib/bfs-index-service';
import { bfsPokemonPortrait } from './bfs-index-portraits';

export interface BfsExportSnapshot {
  rows: BfsIndexRow[];
  includeUnevolved: boolean;
  ingredientFinderM: boolean;
  search: string;
}

const portraitSize = 80;
const entryHeight = 100;
const rangeWidth = 160;
const baseHeaderHeight = 88;
const footerHeight = 60;

export function bfsExportFilename(snapshot: BfsExportSnapshot): string {
  const parts = ['raptor-berry-finding-s-index'];
  if (snapshot.includeUnevolved) parts.push('include-unevolved');
  if (!snapshot.ingredientFinderM) parts.push('ignore-ifm');
  const search = snapshot.search.trim();
  if (search) {
    const term = search
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
      .replace(/-+$/g, '');
    parts.push(`search-${term || 'filtered'}`);
  }
  return `${parts.join('_')}.png`;
}

export function bfsExportParameters(snapshot: BfsExportSnapshot): string[] {
  const parameters: string[] = [];
  if (snapshot.includeUnevolved) parameters.push('Unevolved Pokémon: included');
  if (!snapshot.ingredientFinderM) parameters.push('Ingredient Finder M: off');
  const lines = parameters.length ? [parameters.join(' · ')] : [];
  if (snapshot.search.trim()) lines.push(`Search: ${snapshot.search.trim()}`);
  return lines;
}

export function bfsExportLayout(rows: BfsIndexRow[], parameterLines = 0) {
  const columns = Math.min(20, Math.max(10, ...rows.map((row) => row.entries.length)));
  const headerHeight = baseHeaderHeight + parameterLines * 26;
  const height =
    headerHeight +
    footerHeight +
    rows.reduce((total, row) => total + Math.max(1, Math.ceil(row.entries.length / columns)) * entryHeight, 0);
  return { columns, width: rangeWidth + columns * portraitSize, height, headerHeight };
}

async function loadPortrait(name: string): Promise<HTMLImageElement> {
  const url = bfsPokemonPortrait(name);
  if (!url) throw new Error(`Missing portrait for ${name}`);
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

/** Render from a click-time snapshot, independent of viewport size and lazy-loaded DOM images. */
export async function createBfsIndexPng(snapshot: BfsExportSnapshot): Promise<Blob> {
  const { rows } = snapshot;
  const portraits = new Map(
    await Promise.all(
      rows
        .flatMap((row) => row.entries)
        .map(async ({ pokemon }) => [pokemon.name, await loadPortrait(pokemon.name)] as const)
    )
  );
  const parameters = bfsExportParameters(snapshot);
  const { columns, width, height, headerHeight } = bfsExportLayout(rows, parameters.length);
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image export is unavailable in this browser.');
  ctx.scale(2, 2);
  const fill = (color: string, x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  const text = (value: string, x: number, y: number, size: number, color = '#fff', maxWidth = width - 40) => {
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, x, y, maxWidth);
  };
  fill('#171717', 0, 0, width, height);
  text('Raptor Berry Finding S Index', width / 2, 32, 30);
  parameters.forEach((line, index) => text(line, width / 2, 68 + index * 26, 18));
  text('Index range', rangeWidth / 2, headerHeight - 18, 18);
  text('Pokémon · highest to lowest', rangeWidth + (width - rangeWidth) / 2, headerHeight - 18, 18);
  let y = headerHeight;
  rows.forEach((row, rowIndex) => {
    const rowHeight = Math.max(1, Math.ceil(row.entries.length / columns)) * entryHeight;
    fill(rowIndex % 2 === 0 ? '#444' : '#606060', 0, y, width, rowHeight);
    fill(rangeColor(row.min), 0, y, rangeWidth, rowHeight);
    text(
      `${row.min.toFixed(1)} - <${row.max.toFixed(1)}`,
      rangeWidth / 2,
      y + rowHeight / 2,
      20,
      '#fff',
      rangeWidth - 16
    );
    row.entries.forEach((entry, index) => {
      const x = rangeWidth + (index % columns) * portraitSize;
      const top = y + Math.floor(index / columns) * entryHeight;
      ctx.drawImage(portraits.get(entry.pokemon.name)!, x, top, portraitSize, portraitSize);
      fill(index % 2 === 0 ? '#fff' : '#e0e0e0', x, top + portraitSize, portraitSize, 20);
      text(formatBfsIndex(entry.score), x + portraitSize / 2, top + portraitSize + 10, 16, '#111');
    });
    fill('#222', 0, y + rowHeight - 1, width, 1);
    y += rowHeight;
  });
  text('VelocityRaptor22 · CowTools | nerolislab.com/guides/tier-lists/raptor-bfs-index', width / 2, height - 30, 18);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not create the PNG.'));
    }, 'image/png')
  );
}
