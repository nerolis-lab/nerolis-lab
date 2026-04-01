import { describe, expect, it } from 'vitest';
import { SITE_NAV_ITEMS, siteNavItemsForFrontend, siteNavItemsForGuides } from './site-nav-items';

describe('siteNavItemsForGuides', () => {
  it('excludes admin-only items', () => {
    expect(SITE_NAV_ITEMS.some((i) => i.adminOnly)).toBe(true);
    expect(siteNavItemsForGuides().some((i) => i.adminOnly)).toBe(false);
  });
});

describe('siteNavItemsForFrontend', () => {
  it('includes admin when isAdmin is true', () => {
    expect(siteNavItemsForFrontend(true).some((i) => i.id === 'admin')).toBe(true);
  });

  it('excludes admin when isAdmin is false', () => {
    expect(siteNavItemsForFrontend(false).some((i) => i.id === 'admin')).toBe(false);
  });
});
