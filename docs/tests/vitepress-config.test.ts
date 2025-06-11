import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

const DOCS_DIR = process.cwd();

describe('VitePress Configuration', () => {
  it('should have valid VitePress config file', () => {
    const configPath = join(DOCS_DIR, '.vitepress', 'config.ts');
    expect(existsSync(configPath)).toBe(true);

    const configContent = readFileSync(configPath, 'utf-8');

    // Should export a config
    expect(configContent).toMatch(/export default defineConfig/);

    // Should have title and description
    expect(configContent).toMatch(/title:\s*["'].*["']/);
    expect(configContent).toMatch(/description:\s*["'].*["']/);
  });

  it('should have required theme configuration', () => {
    const configPath = join(DOCS_DIR, '.vitepress', 'config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // Should have themeConfig
    expect(configContent).toMatch(/themeConfig:\s*{/);

    // Should have navigation
    expect(configContent).toMatch(/nav:\s*\[/);

    // Should have sidebar
    expect(configContent).toMatch(/sidebar:\s*\[/);

    // Should have social links
    expect(configContent).toMatch(/socialLinks:\s*\[/);
  });

  it('should have proper meta tags for SEO', () => {
    const configPath = join(DOCS_DIR, '.vitepress', 'config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // Should have head configuration
    expect(configContent).toMatch(/head:\s*\[/);

    // Should have favicon
    expect(configContent).toMatch(/rel:\s*['"]icon['"]/);

    // Should have meta description
    expect(configContent).toMatch(/name:\s*['"]description['"]/);

    // Should have Open Graph tags
    expect(configContent).toMatch(/property:\s*['"]og:/);

    // Should have Twitter card tags
    expect(configContent).toMatch(/name:\s*['"]twitter:/);
  });

  it('should have all required public assets', () => {
    const publicDir = join(DOCS_DIR, 'public');
    expect(existsSync(publicDir)).toBe(true);

    // Check for required favicon files mentioned in config
    expect(existsSync(join(publicDir, 'docs.ico'))).toBe(true);
    expect(existsSync(join(publicDir, 'docs-512x512.png'))).toBe(true);
  });

  it('should have search configuration', () => {
    const configPath = join(DOCS_DIR, '.vitepress', 'config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // Should have search provider configured
    expect(configContent).toMatch(/search:\s*{/);
    expect(configContent).toMatch(/provider:\s*['"]local['"]/);
  });

  it('should have edit link configuration', () => {
    const configPath = join(DOCS_DIR, '.vitepress', 'config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // Should have edit link configuration
    expect(configContent).toMatch(/editLink:\s*{/);
    expect(configContent).toMatch(/pattern:\s*['"].*github\.com.*['"]/);
  });
});
